#!/usr/bin/env python3
"""pai-lint — the phase-1 source linter.  Spec: docs/lint-spec.md sections 7, 8, 10.

    tools/lint/pai-lint.py <artifact.html> [--design-system <dir>] [--json <out>] [--blocking]

This module is the *run*, not the rules.  It reads the design system
(:mod:`dsparse`), runs the checks (:mod:`rules`), then does the three things the
spec asks of the output and nothing else:

* **dedupes** every finding by ``(property, value)`` with an ``occurrences``
  count — read literally the corpus produces ~40,000 proposals, and 2,260 raw
  hits were 31 distinct defects (§7);
* **names the screen** — the *problem folder*, never the run directory and never
  the state, because the roll-up counts distinct screens and the "≥2 screens"
  threshold is unimplementable if this is wrong (§7);
* **fills ``not_checked``** — derived at runtime, so a thin linter never reads as
  a clean bill of health (§7).

Nothing about the design system is written down here.  The silent-property list
in ``not_checked`` is computed from what ``design-system/`` publishes today, so
it shrinks on its own as tokens land.

Exit status is 0 unless ``--blocking`` is passed *and* errors exist *and* the
artifact loaded the design system.  Errors are advisory in phase 1 (§8).
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dsparse import (  # noqa: E402
    DesignSystem,
    adopted_design_system,
    classify_value,
    parse_design_system,
)
from rules import (  # noqa: E402
    BUCKETS, Finding, _coupled_only, check, malformed_findings,
)

PHASE = 1

#: the shared field set.  Spec §7: "Every bucket uses the same field names.  No
#: bucket-specific shapes."  Every entry in every bucket carries all of these, in
#: this order; a field that does not apply to a finding is null (or empty), never
#: absent, so a consumer can read `entry["value"]` without knowing the bucket.
FIELDS = (
    "rule",
    "property",
    "value",
    "found",
    "design_system_offers",
    "origin",
    "occurrences",
    "where",
    "note",
)


# ---------------------------------------------------------------------------
# where this artifact sits
# ---------------------------------------------------------------------------


def repo_root(ds_dir: str) -> str:
    """The repo the design system lives in — paths are reported relative to it."""
    return os.path.dirname(os.path.abspath(ds_dir))


def _relative(path: str, root: str) -> str:
    path = os.path.abspath(path)
    if os.path.commonpath([path, root]) == root:
        return os.path.relpath(path, root).replace(os.sep, "/")
    return path.replace(os.sep, "/")


def screen_of(artifact: str, root: str) -> str:
    """The problem folder.

    Spec §7 is emphatic: ``screen`` is neither the run nor the state.  A run
    writes ``…/<problem folder>/runs/<run-id>/artifact.html``, so when a ``runs``
    directory is on the path the screen is everything above it — that is what
    makes one run over seven states roll up as one screen.  Linting a file in
    place, the screen is the folder that holds it.  ``--screen`` overrides both;
    it is the one thing the roll-up cannot recover if it is wrong.
    """
    path = os.path.abspath(artifact)
    parts = _relative(os.path.dirname(path), root).split("/")
    if "runs" in parts:
        parts = parts[: parts.index("runs")]
    return "/".join(p for p in parts if p not in (".", "")) or "."


def run_id_of(artifact: str, root: str) -> str:
    """The run directory's name when there is one, else a dated fallback.

    A bare file has no run, and inventing a counter would make two lints of the
    same file collide or disagree.  The fallback is deterministic and obviously
    not a real run id.
    """
    parts = os.path.dirname(os.path.abspath(artifact)).split(os.sep)
    # Walk up for a "runs" segment rather than checking one fixed depth: an
    # artifact sits at runs/<run-id>/passes/<n>/, so the run id is two levels
    # further up than a file written straight into the run directory.
    for i in range(len(parts) - 2, -1, -1):
        if parts[i] == "runs":
            return parts[i + 1]
    stem = re.sub(r"[^a-z0-9]+", "-", os.path.basename(artifact).rsplit(".", 1)[0].lower())
    return f"{datetime.date.today().isoformat()}-{stem.strip('-') or 'artifact'}"


# ---------------------------------------------------------------------------
# dedup
# ---------------------------------------------------------------------------


def _note_for(f: Finding, ds: DesignSystem) -> str | None:
    """The human sentence beside an extension, derived from the vocabulary that
    failed to supply a member — never a written-down phrase about monospace.

    A rule that already knows its own sentence keeps it: contrast carries the
    threshold it was judged at and where each end of the pair came from, and
    neither is recoverable from ``(property, value)``.
    """
    if f.note:
        return f.note
    if f.bucket != "extension":
        return None
    if f.rule == "dangling-var":
        return (
            f"{f.value} is not published, and no design-system token is close "
            "enough to name as the replacement"
        )
    vocab = ds.vocabulary_for(f.property, f.value)
    if vocab is None:
        return None
    n = len(vocab.entries)
    reach = "" if vocab.property == f.property else f" reaching {f.property}"
    tail = (
        f"and {vocab.value_type} values have no ordering"
        if not vocab.ordered
        else "and none is near enough to be what was meant"
    )
    return (
        f"the system publishes {n} {vocab.value_type} "
        f"{'member' if n == 1 else 'members'}{reach}, none of them this one, "
        f"{tail} — so no replacement can be named"
    )


def dedupe(findings: list[Finding], ds: DesignSystem):
    """-> ({bucket: [entry]}, mixed_rule_groups).

    Spec §7: "Everything deduped by (property, value) with an occurrence count."
    Taken literally — the key is the pair, inside its bucket, so the roll-up's
    grouping and the report's grouping are the same operation.  A group that
    somehow collected two different rules is counted and reported rather than
    silently flattened.
    """
    groups: dict[tuple[str, str, str], dict] = {}
    mixed = 0
    for f in findings:
        key = (f.bucket, f.property, f.value)
        entry = groups.get(key)
        if entry is None:
            groups[key] = {
                "rule": f.rule,
                "property": f.property,
                "value": f.value,
                "found": f.found,
                "design_system_offers": list(f.design_system_offers),
                "origin": f.origin,
                "occurrences": 1,
                "where": dict(f.where),
                "note": _note_for(f, ds),
                "_line": f.where.get("line", 0),
                "_rules": {f.rule},
            }
            continue
        entry["occurrences"] += 1
        entry["_rules"].add(f.rule)
        # an `origin` disagreement means the same value arrived both as a
        # Tailwind scale step and as a hand-written literal; the invention is the
        # stronger claim, so it wins.
        if f.origin == "invented":
            entry["origin"] = "invented"
        for offer in f.design_system_offers:
            if offer not in entry["design_system_offers"]:
                entry["design_system_offers"].append(offer)

    out: dict[str, list[dict]] = {b: [] for b in BUCKETS}
    for (bucket, _prop, _val), entry in groups.items():
        if len(entry.pop("_rules")) > 1:
            mixed += 1
        line = entry.pop("_line")
        out[bucket].append((line, entry))
    for bucket, rows in out.items():
        rows.sort(key=lambda r: (-r[1]["occurrences"], r[0]))
        out[bucket] = [{k: e[k] for k in FIELDS} for _line, e in rows]
    return out, mixed


# ---------------------------------------------------------------------------
# not_checked — derived, mandatory
# ---------------------------------------------------------------------------


def _silent_properties(ds: DesignSystem, written: set[str]) -> list[str]:
    """Properties the design system *mentions* but publishes no vocabulary for,
    and that this artifact never wrote.

    Derived, on two gates that are both facts about the design system rather
    than opinions about CSS:

    * ``pai.css`` must declare the property — the same gate D2 uses to reject
      ``colors`` and ``keyframes`` as non-properties;
    * ``pai.css`` must write at least one *typed* value for it — a length, a
      colour, a number.  ``display: flex`` and ``position: absolute`` are
      keywords all the way down; there is no vocabulary a design system could
      ever publish for them, so listing them as "not checked" would be padding.

    Nothing is written down.  When radius tokens land, ``border-radius`` leaves
    this list with no code change — the same flip §2 promises for the rules.
    """
    typed: dict[str, bool] = {}
    for d in ds.declarations:
        prop = d.property.strip().lower()
        if prop.startswith("--"):
            continue
        has_type = classify_value(d.value) != "keyword" or "var(" in d.value
        typed[prop] = typed.get(prop, False) or has_type
    coupled = _coupled_only(ds)  # reported on their own terms, just below
    return sorted(
        p
        for p, has_type in typed.items()
        if has_type and p not in written and p not in coupled and ds.is_silent(p)
    )


def _contrast_not_checked(stats: dict) -> list[dict]:
    """What the contrast check could not decide, counted rather than skipped.

    Spec §5.  A static reader cannot resolve every computed colour, and the
    failure that produced this check was a checker that passed what it could not
    work out.  So the pairs it gave up on are reported with their reasons and the
    pairs it never tests are named in full.
    """
    contrast = stats.get("contrast") or {}
    out = [
        {
            "what": "contrast on anything that is not text against its own background",
            "why": (
                "borders, focus rings and control fills fall under SC 1.4.11, "
                "whose 3:1 applies to whichever edge is the component's visual "
                "boundary — a filled button's is its fill, a bare input's is its "
                "border, and which one it is cannot be read off a stylesheet. "
                "Guessing there would produce a finding on every hairline the "
                "system publishes"
            ),
        },
    ]
    pairs = contrast.get("unresolved") or []
    if pairs:
        out.append(
            {
                "what": "text whose colours could not both be resolved from source",
                "detail": [f"{n}x {reason}" for reason, n in pairs],
                "why": (
                    f"{sum(n for _r, n in pairs)} of "
                    f"{contrast.get('checked', 0) + sum(n for _r, n in pairs)} text "
                    "elements; a browser resolves these, a source reader cannot, and "
                    "passing them silently is the defect this check was added for"
                ),
            }
        )
    if contrast.get("skipped"):
        out.append(
            {
                "what": "text on hidden or disabled elements",
                "detail": [f"{contrast['skipped']} element(s)"],
                "why": (
                    "SC 1.4.3 exempts inactive controls, and text that is "
                    "display:none, hidden or sr-only is not seen"
                ),
            }
        )
    return out


def not_checked(ds: DesignSystem, written: set[str], unresolved: int,
                stats: dict) -> list[dict]:
    """Spec §7: not optional.  A thin linter must never read as a clean bill of
    health, and phase 1 is thin."""
    out = [
        {
            "what": "properties with no published vocabulary",
            "detail": _silent_properties(ds, written),
            "why": "no tokens exist and no value was written, so nothing to record",
        },
        {
            "what": "cascade outcome, dead-by-scope tokens, geometry",
            "why": "phase 2, not built",
        },
        *_contrast_not_checked(stats),
        {
            "what": "accessible names, focus rings, placeholder text, content values",
            "why": "owned by the lint stage in the harness design, not implemented here",
        },
        {
            "what": "a text-* utility out-specifying a component class's colour",
            "why": (
                "spec section 4 lists this as the one phase-2 finding worth "
                "approximating in phase 1; the approximation is not implemented "
                "in rules.py, so it is named here rather than assumed present"
            ),
        },
        {
            "what": "line-height and letter-spacing",
            "why": (
                "the design system ships these only as coupled steps inside a "
                "type-ramp entry, never as a free-standing scale, so there is "
                "nothing to be a member of (spec section 3)"
            ),
        },
    ]
    if unresolved:
        out.append(
            {
                "what": "named Tailwind stock utilities on a published property",
                "detail": [f"{unresolved} class use(s)"],
                "why": (
                    "their values live in Tailwind's default theme, which is not "
                    "in design-system/, so the linter cannot resolve them and "
                    "guessing would be the hardcoding this tool exists to avoid"
                ),
            }
        )
    return out


# ---------------------------------------------------------------------------
# the run
# ---------------------------------------------------------------------------


def lint(artifact: str, ds_dir: str, screen: str | None = None,
         run_id: str | None = None) -> dict:
    root = repo_root(ds_dir)
    ds = parse_design_system(ds_dir)
    findings = check(artifact, ds)
    stats = getattr(check, "last_stats", {}) or {}

    buckets, mixed = dedupe(findings, ds)
    written = {
        f.property for f in findings if not f.property.startswith("--")
    }

    # A rule that never parsed carries no values, so nothing above can see it is
    # missing — the file scores zero and reads as perfect.  These go first: a
    # stylesheet the browser never received makes every other finding in the
    # report a statement about a file nobody rendered.
    with open(artifact, encoding="utf-8") as fh:
        malformed = malformed_findings(fh.read())
    buckets["error"] = [vars(f) for f in malformed] + buckets["error"]

    report = {
        "run_id": run_id or run_id_of(artifact, root),
        "screen": screen or screen_of(artifact, root),
        "file": _relative(artifact, root),
        "state": None,  # §7: null for phase 1; phase 2 carries the state name
        "phase": PHASE,
        "adopted_design_system": adopted_design_system(artifact, ds_dir),
        "summary": {
            "errors": len(buckets["error"]),
            "proposals": len(buckets["proposal"]),
            "extensions": len(buckets["extension"]),
        },
        "errors": buckets["error"],
        "proposals": buckets["proposal"],
        "extensions": buckets["extension"],
        "not_checked": not_checked(ds, written,
                                   stats.get("unresolved_utilities", 0), stats),
    }
    if ds.warnings:
        report["not_checked"].append(
            {
                "what": "parts of the design system that could not be read",
                "detail": list(ds.warnings),
                "why": "the derivation is incomplete, so findings may be missing",
            }
        )
    report["_mixed_rule_groups"] = mixed
    if not mixed:
        del report["_mixed_rule_groups"]
    return report


def _summary_line(report: dict) -> str:
    s = report["summary"]
    return (
        f"{report['file']}  screen={report['screen']}  "
        f"adopted={str(report['adopted_design_system']).lower()}  "
        f"errors={s['errors']} proposals={s['proposals']} "
        f"extensions={s['extensions']}"
    )


def main(argv=None) -> int:
    here = os.path.dirname(os.path.abspath(__file__))            # tools/lint
    root = os.path.dirname(os.path.dirname(here))                # repo root
    default_ds = os.path.join(root, "design-system")

    ap = argparse.ArgumentParser(
        prog="pai-lint.py",
        description="Phase-1 source linter: what the artifact wrote against what "
                    "the design system publishes.",
    )
    ap.add_argument("artifact", help="the HTML file to lint")
    ap.add_argument("--design-system", default=default_ds, metavar="DIR",
                    help="design-system directory (default: %(default)s)")
    ap.add_argument("--json", metavar="OUT",
                    help="write lint.json here (default: stdout)")
    ap.add_argument("--blocking", action="store_true",
                    help="exit non-zero when errors exist; off by default "
                         "because errors are advisory in phase 1 (spec section 8)")
    ap.add_argument("--screen", metavar="PATH",
                    help="override the problem folder the roll-up groups by")
    ap.add_argument("--run-id", metavar="ID", help="override the run id")
    args = ap.parse_args(argv)

    if not os.path.isfile(args.artifact):
        ap.error(f"no such file: {args.artifact}")
    if not os.path.isdir(args.design_system):
        ap.error(f"no such design-system directory: {args.design_system}")

    report = lint(args.artifact, args.design_system, args.screen, args.run_id)
    text = json.dumps(report, indent=2)

    if args.json:
        parent = os.path.dirname(os.path.abspath(args.json))
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(args.json, "w", encoding="utf-8") as fh:
            fh.write(text + "\n")
        print(_summary_line(report))
    else:
        print(text)

    # §8: only errors block, only when blocking is asked for, and never on a file
    # that did not opt into the design system at all (§6).
    if args.blocking and report["adopted_design_system"] and report["summary"]["errors"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
