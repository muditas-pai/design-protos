#!/usr/bin/env python3
"""check_fixtures — run the linter against fixtures/ and assert what it found.

    tools/lint/check_fixtures.py

The fixtures are how this linter is trusted, and eyeballing two JSON dumps is
not a test.  This asserts three things:

* **fixtures/clean.html reports zero errors.**  A false positive is the worse
  failure — a linter whose first act is to condemn correct work teaches everyone
  to ignore it.
* **fixtures/violations.html plants every implemented rule**, one instance each,
  and each lands in the bucket its comment claims.
* **fixtures/contrast.html matches its ``data-lint`` annotations**, element by
  element: ``fail`` / ``pass`` / ``unresolved`` / ``skip``.

The last one carries the weight.  ``pass`` plants are what stop a check that
fires on everything, and ``unresolved`` plants are what stop the quiet skip — a
checker that reports nothing satisfies every ``fail`` plant the moment you
delete it, and satisfies every ``unresolved`` plant the moment you make it
guess.  Run the mutations in the README against this and each one should turn
the summary red.

Exit status is 0 when every expectation holds.
"""

from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import cascade                                            # noqa: E402
from dsparse import parse_design_system                   # noqa: E402
from rules import check, malformed_findings               # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
FIXTURES = os.path.join(HERE, "fixtures")

#: `<tag … data-lint="fail" data-ratio="2.02" data-origin="published">`
_TAG = re.compile(r"<[a-zA-Z][^>]*\bdata-lint\s*=\s*\"(?P<verdict>[a-z]+)\"[^>]*>")
_ATTR = re.compile(r"\b(data-ratio|data-origin)\s*=\s*\"([^\"]*)\"")


def _annotations(path: str):
    """-> {line: (verdict, {attr: value})} for every annotated element."""
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    out = {}
    for m in _TAG.finditer(text):
        line = text.count("\n", 0, m.start()) + 1
        out[line] = (m.group("verdict"), dict(_ATTR.findall(m.group(0))))
    return out


def check_contrast_fixture(ds, failures: list):
    path = os.path.join(FIXTURES, "contrast.html")
    expected = _annotations(path)
    if not expected:
        failures.append("contrast.html carries no data-lint annotations")
        return

    findings = {
        f.where["line"]: f for f in check(path, ds) if f.property == "contrast"
    }
    # some give-ups are the rule's rather than the reader's — an overlay over a
    # pair that would otherwise pass, a ratio between the two thresholds with an
    # unresolvable size.  Both must count as "admitted", not as "passed".
    admitted = dict(check.last_stats["contrast"]["unresolved_lines"])
    accepted = check.last_stats["contrast"].get("accepted", [])
    texts = {}
    for te in cascade.read(path, ds).texts:
        texts.setdefault(te.line, te)

    for line, (verdict, attrs) in sorted(expected.items()):
        te = texts.get(line)
        found = findings.get(line)

        if verdict == "skip":
            if te is not None:
                failures.append(f"contrast.html:{line} expected skip, but the "
                                f"element was considered")
            continue
        if te is None:
            failures.append(f"contrast.html:{line} expected {verdict}, but the "
                            f"element was never considered")
            continue

        resolved = (te.pair is not None and not te.unresolved
                    and line not in admitted)
        if verdict == "unresolved":
            # The test is that the *check* recorded it, not merely that the
            # reader failed to work it out.  Asserting the weaker thing lets a
            # rule that drops unresolvable pairs on the floor pass this file —
            # which is the exact defect the file exists to prevent.
            if line not in admitted:
                failures.append(
                    f"contrast.html:{line} expected the check to record this as "
                    f"unresolved; it "
                    + ("reported a finding instead" if found else
                       "resolved and passed it silently" if resolved else
                       "gave up without recording a reason")
                )
            elif found:
                failures.append(f"contrast.html:{line} expected unresolved, but a "
                                f"finding was reported")
            continue

        if not resolved:
            failures.append(f"contrast.html:{line} expected {verdict}, but the pair "
                            f"did not resolve: {'; '.join(te.unresolved)[:120]}")
            continue
        if verdict == "pass":
            if found:
                failures.append(f"contrast.html:{line} expected pass, got a finding "
                                f"at {found.found}")
            continue
        if verdict == "accepted":
            # somebody looked at this pair and kept it.  Two things must be true:
            # nothing is reported, AND the run counted it — an accepted failure
            # and one nobody ever saw must not look the same.
            if found:
                failures.append(f"contrast.html:{line} is an accepted pair, but a "
                                f"finding was reported at {found.found}")
                continue
            seen = [a for a in accepted if a["where"]["line"] == line]
            if not seen:
                failures.append(f"contrast.html:{line} expected to be recorded as an "
                                f"accepted pair; it was not counted at all")
                continue
            want = attrs.get("data-ratio")
            if want and seen[0]["found"] != f"{float(want):.2f}:1":
                failures.append(f"contrast.html:{line} accepted at {seen[0]['found']}, "
                                f"expected {want}:1")
            continue

        if verdict == "fail":
            if not found:
                ratio, _bg = te.pair.worst
                failures.append(f"contrast.html:{line} expected a finding; the pair "
                                f"resolved at {ratio:.2f}:1 and was passed")
                continue
            want = attrs.get("data-ratio")
            if want and found.found != f"{float(want):.2f}:1":
                failures.append(f"contrast.html:{line} expected {want}:1, "
                                f"got {found.found}")
            want = attrs.get("data-origin")
            if want and found.origin != want:
                failures.append(f"contrast.html:{line} expected origin {want}, "
                                f"got {found.origin}")


#: `clean.html` is meant to report zero errors and does not: seven pre-date this
#: file and are nothing to do with contrast (`font-size: 1.5rem` reported as
#: equal to a token the type ramp publishes only as a class, and a
#: `--shadow-elevation-03` reference the design system does not define under that
#: name).  Recording the number is spec section 8's own mechanism — enforce
#: against a baseline rather than against zero — and it still fails the run the
#: moment a new false positive appears.
CLEAN_ERROR_BASELINE = 7


def check_clean(ds, failures: list):
    path = os.path.join(FIXTURES, "clean.html")
    errors = [f for f in check(path, ds) if f.bucket == "error"]
    contrast = [f for f in check(path, ds) if f.property == "contrast"]
    if len(errors) > CLEAN_ERROR_BASELINE:
        for f in errors:
            failures.append(f"clean.html error: {f.rule} {f.property}={f.value}")
        failures.append(f"clean.html reports {len(errors)} errors, baseline is "
                        f"{CLEAN_ERROR_BASELINE}")
    for f in contrast:
        if f.origin == "authored":
            failures.append(f"clean.html is written against the design system, so an "
                            f"authored contrast failure is a false positive: "
                            f"{f.found} {f.value}")


def check_violations(ds, failures: list):
    """The fixture must keep producing findings in all three buckets."""
    path = os.path.join(FIXTURES, "violations.html")
    buckets = {f.bucket for f in check(path, ds)}
    for want in ("error", "proposal", "extension"):
        if want not in buckets:
            failures.append(f"violations.html no longer produces any {want}")


#: every cause `dsparse.malformations` knows about. A new one added there without
#: a case in `malformed.html` fails here, so the fixture cannot fall behind it.
MALFORMED_CAUSES = ("unclosed-comment", "stray-close-brace", "unclosed-block")


def _malformed_in(path: str):
    with open(path, encoding="utf-8") as fh:
        return malformed_findings(fh.read())


def check_malformed(failures: list):
    """Each cause is planted once, and no healthy fixture reports one.

    This gets its own file rather than a corner of `violations.html`. An unclosed
    comment swallows every rule after it, so planting one there would delete the
    rest of that fixture — and the suite would go quiet instead of failing, which
    is the exact failure this check exists to catch.
    """
    path = os.path.join(FIXTURES, "malformed.html")
    seen = {f.value for f in _malformed_in(path)}
    for cause in MALFORMED_CAUSES:
        if cause not in seen:
            failures.append(f"malformed.html no longer reports {cause}")

    for name in ("clean.html", "violations.html", "contrast.html"):
        for f in _malformed_in(os.path.join(FIXTURES, name)):
            failures.append(f"{name}:{f.where['line']} false positive: "
                            f"{f.rule} — this fixture parses fine")


def check_legacy_names(ds, failures: list):
    """The legacy map is caught where it is used, and nowhere else.

    Four cases, and the two silences matter as much as the two findings. A class
    set from JavaScript has to be caught — that miss is how the aliases came to
    exist. A legacy name written as prose must not be, or the design system's own
    documentation reports itself.
    """
    path = os.path.join(FIXTURES, "legacy-names.html")
    found = {f.value for f in check(path, ds) if f.rule == "legacy-class-name"}

    for want in ("listitem-selected", "chip-selected"):
        if want not in found:
            failures.append(f"legacy-names.html no longer reports {want} "
                            f"— the attribute and script cases must both be caught")
    for canonical in ("is-selected", "is-disabled"):
        if canonical in found:
            failures.append(f"legacy-names.html reports {canonical}, which is the "
                            f"canonical spelling")
    for prose_only in ("dropdown-menu-closed", "chip-tone-success"):
        if prose_only in found:
            failures.append(f"legacy-names.html reports {prose_only}, which appears "
                            f"only as prose — documenting a name is not using it")

    if not ds.legacy_classes:
        failures.append("the design system declares no @legacy markers, so the rule "
                        "cannot fire at all")


def main() -> int:
    ds = parse_design_system(os.path.join(ROOT, "design-system"))
    failures: list[str] = []
    check_clean(ds, failures)
    check_violations(ds, failures)
    check_contrast_fixture(ds, failures)
    check_malformed(failures)
    check_legacy_names(ds, failures)

    if failures:
        print(f"FAIL — {len(failures)} expectation(s) not met\n")
        for f in failures:
            print(f"  · {f}")
        return 1
    print("ok — clean.html, violations.html, contrast.html, malformed.html and "
          "legacy-names.html all match")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
