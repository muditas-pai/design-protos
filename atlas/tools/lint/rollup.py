#!/usr/bin/env python3
"""rollup — what the design system had no word for, counted across screens.

Spec: docs/lint-spec.md section 9.

Reads every ``lint.json`` produced by ``pai-lint.py``, groups the proposals and
extensions by ``(property, value)``, and counts how many **distinct screens**
reached for the same thing.

    one screen   an observation, wait
    two screens  the signal, a PR candidate

That threshold is borrowed from the annotation system, which had already worked
out that a note made once is an observation and the same note made on two
screens is a rule.  It is a fact about the corpus rather than about how strongly
anyone feels, which is what makes it safe to act on.

Counting is mechanical, so this is a script and **gets no vote** on what a count
means.  It never opens a PR, never edits the design system, and never decides
that a candidate is worth acting on.  A person does that.

The ``status`` field is the ratchet.  Without it a proposal Mudita has already
shipped, or already refused, resurfaces at every roll-up forever.  Statuses set
by hand in ``proposals.json`` survive every subsequent run.

Usage::

    python tools/lint/rollup.py <lint.json | dir> ...          # roll up, print, write
    python tools/lint/rollup.py runs/ --out proposals.json
    python tools/lint/rollup.py runs/ --threshold 3 --quiet
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys

THRESHOLD = 2  # distinct screens before something is a PR candidate
SCREEN_EXAMPLES = 5  # example paths kept per entry; the count is the evidence

#: Set by a person in proposals.json and never overwritten by a run.
#: `open` is the only status this script assigns.
STATUSES = ("open", "proposed", "absorbed", "declined")

#: Statuses that mean the question is settled.  A settled entry keeps being
#: counted so the tally stays honest, but never resurfaces as a candidate.
SETTLED = ("absorbed", "declined")


def find_lint_files(paths: list[str]) -> list[str]:
    out: list[str] = []
    for p in paths:
        if os.path.isfile(p):
            out.append(p)
            continue
        for root, _dirs, files in os.walk(p):
            for f in files:
                if f == "lint.json" or f.endswith(".lint.json"):
                    out.append(os.path.join(root, f))
    return sorted(set(out))


def key_of(finding: dict) -> str:
    """Spec §7: everything groups by (property, value)."""
    return f"{finding.get('property', '?')} {finding.get('value', '?')}"


def roll_up(lint_files: list[str]) -> dict:
    """Group every proposal and extension by (property, value).

    Errors are deliberately excluded.  An error is something the design system
    already has a word for, so it is a correction to make in the artifact, not a
    gap to take to the design system's owner.
    """
    entries: dict[str, dict] = {}
    seen_screens: set[str] = set()
    skipped: list[str] = []

    for path in lint_files:
        try:
            with open(path) as fh:
                report = json.load(fh)
        except (OSError, ValueError) as exc:
            skipped.append(f"{path}: {exc}")
            continue

        screen = report.get("screen")
        if not screen:
            skipped.append(f"{path}: no screen field")
            continue
        seen_screens.add(screen)
        run_id = report.get("run_id", "")

        for bucket in ("proposals", "extensions"):
            for finding in report.get(bucket, []):
                k = key_of(finding)
                e = entries.setdefault(k, {
                    "property": finding.get("property"),
                    "value": finding.get("value"),
                    "bucket": bucket[:-1],          # 'proposal' | 'extension'
                    "rule": finding.get("rule"),
                    "screens": set(),
                    "occurrences": 0,
                    "first_seen_run": run_id,
                    "origin": finding.get("origin"),
                })
                e["screens"].add(screen)
                e["occurrences"] += finding.get("occurrences", 1) or 1
                # An extension is the stronger claim: the system speaks about
                # this property and still has no member that fits.
                if bucket == "extensions":
                    e["bucket"] = "extension"

    for e in entries.values():
        # The count is the evidence; the paths are only there so a person can
        # go and look.  Five is enough to look at, and keeping all of them made
        # the committed file 22,000 lines that churn on every run.  Re-run the
        # roll-up when the full list is actually wanted.
        screens = sorted(e["screens"])
        e["screen_count"] = len(screens)
        e["screens"] = screens[:SCREEN_EXAMPLES]
        if len(screens) > SCREEN_EXAMPLES:
            e["screens_truncated"] = True

    return {
        "entries": entries,
        "screens_scanned": len(seen_screens),
        "files_scanned": len(lint_files),
        "skipped": skipped,
    }


def merge_with_existing(entries: dict, out_path: str) -> dict:
    """Carry hand-set statuses forward.  This is the ratchet."""
    previous: dict[str, dict] = {}
    if os.path.exists(out_path):
        try:
            with open(out_path) as fh:
                for e in json.load(fh).get("proposals", []):
                    previous[f"{e.get('property')} {e.get('value')}"] = e
        except (OSError, ValueError):
            pass

    for k, e in entries.items():
        old = previous.get(k)
        e["status"] = old.get("status", "open") if old else "open"
        if old and old.get("note"):
            e["note"] = old["note"]
        if old and old.get("first_seen_run"):
            e["first_seen_run"] = old["first_seen_run"]
    return entries


#: Two lengths this close are the same design decision written twice.  12.5px
#: and 13px are not two intentions, they are one intention transcribed from two
#: places.  Relative, because 1px matters at 12px and is invisible at 96px.
CLUSTER_TOLERANCE = 0.08

_LENGTH_RE = re.compile(r"^(-?\d*\.?\d+)(px|rem|em)$")


def _as_px(value: str) -> float | None:
    m = _LENGTH_RE.match(str(value).strip().lower())
    if not m:
        return None
    n = float(m.group(1))
    return n * 16 if m.group(2) in ("rem", "em") else n


def cluster(entries: list[dict]) -> list[dict]:
    """Group values that are too close to be separate decisions.

    Mechanical, so the script is allowed to do it: this is arithmetic on
    numbers, not a judgement about what the design system ought to contain.

    It *suggests* a representative — the member the most screens reached for —
    because that is also arithmetic.  It does not decide.  Choosing the value
    that ships is the design system owner's call, which is why the members stay
    in the output rather than being collapsed away.
    """
    by_prop: dict[str, list[dict]] = {}
    passthrough: list[dict] = []
    for e in entries:
        if _as_px(e["value"]) is None:
            passthrough.append(e)
        else:
            by_prop.setdefault(e["property"], []).append(e)

    out: list[dict] = []
    for prop, members in by_prop.items():
        members.sort(key=lambda e: _as_px(e["value"]))
        group: list[dict] = []
        for e in members:
            if group and _as_px(e["value"]) - _as_px(group[0]["value"]) <= \
                    CLUSTER_TOLERANCE * _as_px(group[0]["value"]):
                group.append(e)
            else:
                if group:
                    out.append(_fold(prop, group))
                group = [e]
        if group:
            out.append(_fold(prop, group))
    return out + passthrough


def _fold(prop: str, group: list[dict]) -> dict:
    if len(group) == 1:
        return group[0]
    screens: set[str] = set()
    for e in group:
        screens.update(e["screens"])
    # The suggestion is the member the most screens reached for.  A tie keeps
    # the smaller value, which is the conservative direction for a scale.
    winner = max(group, key=lambda e: (e["screen_count"], -_as_px(e["value"])))
    lo, hi = _as_px(group[0]["value"]), _as_px(group[-1]["value"])
    return {
        "property": prop,
        "value": f"~{group[0]['value']}–{group[-1]['value']}"
                 if lo != hi else group[0]["value"],
        "bucket": "extension" if any(e["bucket"] == "extension" for e in group)
                  else "proposal",
        "rule": group[0].get("rule"),
        "clustered": True,
        "suggested": winner["value"],
        "members": [
            {"value": e["value"], "screens": e["screen_count"],
             "uses": e["occurrences"]}
            for e in sorted(group, key=lambda e: -e["screen_count"])
        ],
        "screen_count": max(e["screen_count"] for e in group),
        "screens_any": len(screens),
        "occurrences": sum(e["occurrences"] for e in group),
        "screens": sorted(screens)[:SCREEN_EXAMPLES],
        "first_seen_run": group[0].get("first_seen_run", ""),
        "origin": group[0].get("origin"),
        "status": ("declined" if all(e.get("status") == "declined"
                                     for e in group) else "open"),
    }


def resolve_against_scale(entries: list[dict], ds) -> list[dict]:
    """A value sitting *between* two published members is not a gap.

    11px is not missing from a scale that already has 10 and 12; it is someone
    landing between two steps.  The answer is to move to one of them, never to
    add a third.  A scale that absorbs every value written against it stops
    being a scale.

    Only values outside the published range, or in a genuine hole, stay as
    proposals to extend it.
    """
    for e in entries:
        vocab = ds.vocabulary_for(e["property"]) if ds else None
        if vocab is None or not vocab.ordered:
            continue
        members = sorted(
            {m for m in vocab.entries.values() if _as_px(m) is not None},
            key=_as_px,
        )
        if len(members) < 2:
            continue
        target = _as_px(e.get("suggested") or e["value"])
        if target is None:
            continue

        below = [m for m in members if _as_px(m) <= target]
        above = [m for m in members if _as_px(m) >= target]
        if below and above:
            lo, hi = below[-1], above[0]
            if _as_px(lo) == target:      # already on the scale
                continue
            d_lo, d_hi = target - _as_px(lo), _as_px(hi) - target
            e["resolution"] = "snap"
            e["snap_to"] = ([lo, hi] if abs(d_lo - d_hi) < 1e-9
                            else [lo if d_lo < d_hi else hi])
            e["note"] = (f"between {lo} and {hi}, which the scale already has "
                         f"— move to one of them, do not add a step")
        else:
            e["resolution"] = "extend"
            e["note"] = (f"outside the published range "
                         f"({members[0]}–{members[-1]})")
    return entries


#: A step only belongs in a *proposed scale* if this share of all scanned
#: screens reached for it.  The two-screen threshold is right for "is this
#: worth looking at"; it is far too low for "is this a step in the scale".
#: At 2 screens the corpus proposes every 1px value from 1 to 18, which is
#: not a scale, it is a transcript.
SCALE_MIN_SHARE = 0.25

#: Steps closer than this are one step in a *scale*, even though they survived
#: the finer clustering above.  A scale is a small set of distinct choices; 5px
#: and 6px are not two of them.  Coarser than CLUSTER_TOLERANCE on purpose.
SCALE_STEP_TOLERANCE = 0.18


def propose_scales(entries: list[dict], ds, threshold: int,
                   screens_scanned: int = 0) -> dict:
    """For a property with no vocabulary at all, propose the whole scale.

    The corpus has already chosen one — people reach for the same handful of
    values across dozens of screens.  This reads it back, in order, with the
    evidence attached.  It proposes; it does not decide.
    """
    scales: dict[str, list[dict]] = {}
    for e in entries:
        if ds and ds.vocabulary_for(e["property"]) is not None:
            continue  # the property already has a scale
        px = _as_px(e.get("suggested") or e["value"])
        floor = max(threshold, SCALE_MIN_SHARE * screens_scanned)
        if px is None or px <= 0 or e["screen_count"] < floor:
            continue
        scales.setdefault(e["property"], []).append({
            "value": e.get("suggested") or e["value"],
            "px": px,
            "screens": e["screen_count"],
            "uses": e["occurrences"],
        })

    out = {}
    for prop, steps in scales.items():
        steps.sort(key=lambda s: s["px"])
        # Fold neighbours that are too close to be separate steps, keeping the
        # one the most screens reached for.
        folded: list[dict] = []
        for st in steps:
            if folded and st["px"] - folded[-1]["px"] <= \
                    SCALE_STEP_TOLERANCE * folded[-1]["px"]:
                if st["screens"] > folded[-1]["screens"]:
                    folded[-1] = st
                continue
            folded.append(st)
        steps = folded
        # Everything below the threshold is already filtered out, so every step
        # here has independent evidence from at least two screens.
        out[prop] = {
            "steps": steps,
            "suggested_scale": [s["value"] for s in steps],
            "screens_backing": max(s["screens"] for s in steps),
        }
    return out


def candidates(entries: dict, threshold: int) -> list[dict]:
    """Over the threshold and not already settled by a person."""
    return sorted(
        (e for e in entries.values()
         if e["screen_count"] >= threshold and e["status"] not in SETTLED),
        key=lambda e: (-e["screen_count"], -e["occurrences"],
                       e["property"] or "", e["value"] or ""),
    )


def report_text(result: dict, entries: dict, threshold: int) -> str:
    cands = candidates(entries, threshold)
    waiting = [e for e in entries.values() if e["screen_count"] < threshold]
    settled = [e for e in entries.values() if e["status"] in SETTLED]

    lines = [
        f"{result['files_scanned']} lint reports over "
        f"{result['screens_scanned']} screens",
        f"{len(entries)} distinct (property, value) pairs the design system "
        f"had no word for",
        "",
        f"PR CANDIDATES — reached for on {threshold}+ screens",
    ]
    if not cands:
        lines.append("  (none)")
    else:
        lines.append(f"  {'screens':>7}  {'uses':>5}  {'kind':<9}  "
                     f"{'property':<22}  value")
        for e in cands[:40]:
            lines.append(
                f"  {e['screen_count']:>7}  {e['occurrences']:>5}  "
                f"{e['bucket']:<9}  {(e['property'] or '?')[:22]:<22}  "
                f"{(e['value'] or '?')[:52]}"
            )
        if len(cands) > 40:
            lines.append(f"  … and {len(cands) - 40} more")

    lines += [
        "",
        f"{len(waiting)} seen on one screen only — an observation, not yet a rule",
    ]
    if settled:
        lines.append(f"{len(settled)} already settled (absorbed or declined), "
                     f"suppressed")
    for s in result["skipped"]:
        lines.append(f"SKIPPED  {s}")
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(
        description="Count distinct screens that reached for the same thing.")
    ap.add_argument("paths", nargs="+",
                    help="lint.json files, or directories to walk")
    ap.add_argument("--out", default="proposals.json",
                    help="where the tally is written (default: %(default)s)")
    ap.add_argument("--threshold", type=int, default=THRESHOLD,
                    help="distinct screens before something is a candidate")
    ap.add_argument("--design-system", default="design-system",
                    help="so a value between two published steps is resolved "
                         "to the scale instead of proposed as a new one")
    ap.add_argument("--quiet", action="store_true",
                    help="write the file, print nothing")
    args = ap.parse_args(argv)

    lint_files = find_lint_files(args.paths)
    if not lint_files:
        print("no lint.json files found", file=sys.stderr)
        return 1

    result = roll_up(lint_files)
    entries = merge_with_existing(result["entries"], args.out)

    # Only entries at or above the threshold are persisted.  Nothing is lost by
    # dropping the one-screen ones: this file is not an accumulator, it is
    # recomputed from every run's lint.json on each pass, so a value seen on one
    # screen today and another next month still reaches the threshold then.
    # That holds only as long as the per-run lint.json files are kept.
    kept = [e for e in entries.values() if e["screen_count"] >= args.threshold]
    below = len(entries) - len(kept)
    kept = cluster(kept)

    ds = None
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from dsparse import parse_design_system
        ds = parse_design_system(args.design_system)
    except Exception as exc:                       # noqa: BLE001
        print(f"design system not read ({exc}); "
              "values will not be resolved against existing scales",
              file=sys.stderr)
    kept = resolve_against_scale(kept, ds)
    scales = propose_scales(kept, ds, args.threshold,
                            result["screens_scanned"])

    payload = {
        "generated_from": {
            "files": result["files_scanned"],
            "screens": result["screens_scanned"],
            "below_threshold_not_listed": below,
        },
        "threshold": args.threshold,
        "proposed_scales": scales,
        "proposals": sorted(
            kept,
            key=lambda e: (-e["screen_count"], e["property"] or "",
                           e["value"] or ""),
        ),
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w") as fh:
        json.dump(payload, fh, indent=2)
        fh.write("\n")

    if not args.quiet:
        print(report_text(result, entries, args.threshold))
        print(f"\nwritten to {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
