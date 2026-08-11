#!/usr/bin/env python3
"""render — every state of an artifact becomes a picture.

    tools-python tools/render/render.py <pass-dir> [--width N] [--margin N] [--timeout S]

The judges cannot read code.  This turns one HTML file into the pictures they score,
and it is the only stage that sees the screen run — so a font that never arrived or a
state nobody built stops being invisible here.

Everything it decides is in the spec.  Three things are worth knowing before reading:

* **The picture is CLIPPED to the frame, never fitted by resizing the window.**  A
  resize changes the width the page lays out at, so a 640px frame would set a 736px
  window, drop below Tailwind's `md`, and file the mobile layout under the desktop
  width.  Clipping cannot do this because nothing reflows.
* **`file://` is deliberate.**  Chromium reports a missing local file as a
  `requestfailed` with `ERR_FILE_NOT_FOUND`, so no server is needed to see one — and
  the scheme itself says whether a failure is ours to fix or the network's.
* **A local asset failing is a finding; a remote host failing is a re-run.**  The
  first goes in `render.json` for the fixer, the second in `render.error.json`, which
  is §2's boundary: a failure the fixer can act on is a result, a failure only a
  re-run can clear is a stage error.

Exit status is 0 when the render completed, whatever it found.  It is 1 only when the
stage could not do its job — the run was written to `render.error.json`.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
import tempfile
import time

MARGIN = 48
TIMEOUT = 15  # seconds; §9 names this so an implementer does not invent it
HEIGHT = 900  # the screen the design is judged to fit on. Overridable; the shot is
              # clipped to the design, so this is never the picture's height


# ---------------------------------------------------------------------------
# where this pass sits
# ---------------------------------------------------------------------------


def checklist_for(pass_dir: pathlib.Path) -> pathlib.Path | None:
    """`runs/<run-id>/checklist.json` — one per run, not per pass (§1).

    Walk up for the `runs` segment rather than counting levels: a pass sits at
    `runs/<run-id>/passes/<n>/`, and hard-coding that depth is the bug this repo
    already fixed once in `tools/lint/pai-lint.py`.

    No `runs/` above means the thin, checklist-less layout (`designs/<slug>/`),
    where the artifact's own `window.__atlas` declaration names the states.
    Returns None rather than raising: the absence is a layout, not a mistake.
    """
    for parent in pass_dir.resolve().parents:
        if parent.parent.name == "runs":
            return parent / "checklist.json"
    return None


def combinations(states: list[str], params: dict) -> list[dict]:
    """Every picture worth taking, as {state, params}.

    Each declared setting is walked at its own values against the ordinary state only,
    and every state is taken at each setting's default.  The full cross-product is the
    other option and it is not worth it: seven states by four gates is twenty-eight
    pictures a judge has to hold in its head, and the settings vary content rather than
    condition, so the pairs carry almost nothing the singles do not.
    """
    out = [{"state": s, "params": {k: v[0] for k, v in params.items()}} for s in states]
    for name, values in params.items():
        for v in values[1:]:
            row = {k: vals[0] for k, vals in params.items()}
            row[name] = v
            out.append({"state": states[0], "params": row})
    return out


def label(combo: dict, params: dict) -> str:
    """`default`, or `default~gate-3` when a setting is off its default."""
    off = [f"{k}-{v}" for k, v in combo["params"].items()
           if params.get(k) and v != params[k][0]]
    return combo["state"] + ("~" + "~".join(off) if off else "")


def states_from(checklist: dict) -> list[str]:
    """The distinct non-null `state` values across `active` requirements (§9).

    Order is first-seen and carries no meaning: every state is fetched by name, so
    nothing here depends on which one the build treats as ordinary.
    """
    out: list[str] = []
    for r in checklist.get("requirements", []):
        if r.get("status") != "active":
            continue
        s = r.get("state")
        if s is not None and s not in out:
            out.append(s)
    return out


def human_now() -> str:
    """`1 Aug 2026 20:45` — the house format.  Numeric dates live only in run ids."""
    return time.strftime("%-d %b %Y %H:%M")


def write_atomically(path: pathlib.Path, payload: dict) -> None:
    """Temp file, then rename (§2).

    A stage killed mid-write otherwise leaves truncated JSON that a resume reads as a
    completed stage, which is the one thing that would break §1.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), suffix=".tmp")
    with os.fdopen(fd, "w") as fh:
        json.dump(payload, fh, indent=2)
        fh.write("\n")
    os.replace(tmp, path)


# ---------------------------------------------------------------------------
# what the browser tells us about the network
# ---------------------------------------------------------------------------


def final_responses(events: list[tuple]) -> dict[str, object]:
    """One entry per request chain, keyed by url, holding how the chain *ended*.

    The CDNs redirect — `cdn.tailwindcss.com` answers 302 to a versioned URL that
    answers 200 — and counting the hop fails a screen that loaded perfectly.

    **A 3xx is a hop by definition**, so that is the test.  `Request.redirected_to`
    looks like the tidier one and is a trap: read inside the `response` handler it is
    still `None`, because the request it would point at has not been made yet.  Where
    a chain really does end badly, its last response is not a 3xx and is kept.
    """
    out: dict[str, object] = {}
    for kind, url, status, _ in events:
        if kind == "response" and isinstance(status, int) and 300 <= status < 400:
            continue
        out[url] = status
    return out


def is_local(url: str) -> bool:
    """Ours to fix, or the network's.

    A path inside the repo failing means the artifact is wrong — §7 warns the relative
    depth from `runs/<id>/passes/<n>/` is easy to miscount — and the fixer can correct
    it.  A remote host failing is transient and nobody can edit it.
    """
    return url.startswith("file://")


# ---------------------------------------------------------------------------
# the run
# ---------------------------------------------------------------------------

DECLARATION_PROBE = """() => {
  const a = window.__atlas;
  if (!a || !Array.isArray(a.states)) return null;
  return { states: a.states, params: a.params || {} };
}"""

FRAME_PROBE = """() => {
  const els = document.querySelectorAll('[data-atlas-frame]');
  if (els.length !== 1) return { n: els.length };
  const r = els[0].getBoundingClientRect();
  return { n: 1, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
}"""


def read_declaration(browser, url_base: str, timeout: int) -> dict | None:
    """What the screen says it is: its states and the URL settings it answers to.

    Build writes `window.__atlas`. Before it existed the render inferred states from the
    checklist and never saw a setting at all, so a `?gate=` the artifact documented only in
    a comment went unphotographed and every requirement resting on it stayed unjudgeable.
    A stage cannot depend on prose another stage wrote.
    """
    ctx = browser.new_context()
    page = ctx.new_page()
    try:
        page.goto(f"{url_base}?freeze=1", wait_until="load", timeout=timeout * 1000)
        return page.evaluate(DECLARATION_PROBE)
    except Exception:
        return None
    finally:
        ctx.close()


def render_state(browser, url_base: str, combo: dict, declared_params: dict, width: int,
                 height: int, margin: int, timeout: int, states_dir: pathlib.Path,
                 events: list) -> dict:
    """One combination at one width, one picture.  Returns its `render.json` entry."""
    entry = {"state": combo["state"], "params": combo["params"], "width": width,
             "status": "failed", "file": None, "overflows_viewport": None, "why": None}
    name = label(combo, declared_params)

    # A fresh context per state: a warm cache would hide an asset that only fails on
    # the first fetch, which is exactly the failure this stage exists to catch.
    ctx = browser.new_context(viewport={"width": width, "height": height},
                              device_scale_factor=1)
    page = ctx.new_page()
    page.on("response", lambda r: events.append(
        ("response", r.url, r.status, r.request.redirected_to is not None)))
    page.on("requestfailed", lambda r: events.append(
        ("requestfailed", r.url, f"FAILED {r.failure}", False)))

    try:
        qs = "".join(f"&{k}={v}" for k, v in combo["params"].items())
        page.goto(f"{url_base}?state={combo['state']}&freeze=1{qs}", wait_until="load",
                  timeout=timeout * 1000)
        # __atlasReady is a promise the build defines last in <body>.  Waiting for the
        # name first gives a clearer failure than awaiting something never defined.
        page.wait_for_function("window.__atlasReady !== undefined", timeout=timeout * 1000)
        # Race it.  `page.evaluate` takes no timeout and awaits a returned promise
        # forever, so awaiting __atlasReady directly hangs the whole render on one
        # artifact that never resolves — the failure this timeout exists to prevent.
        page.evaluate(
            """(ms) => Promise.race([
                 Promise.resolve(window.__atlasReady),
                 new Promise((_, reject) => setTimeout(
                   () => reject(new Error('__atlasReady did not resolve')), ms)),
               ])""",
            timeout * 1000)
    except Exception as exc:
        # First line only.  Playwright appends a JS stack trace, and `why` is read by
        # the verdict and quoted to a person — a stack frame helps neither.
        reason = str(exc).strip().splitlines()[0].strip()
        entry["why"] = f"not ready within {timeout}s — {reason}"
        ctx.close()
        return entry

    # A state the artifact never built.  The render cannot ask which states exist —
    # ATLAS_STATES is a closure constant — so it looks for the loud banner the build
    # draws for an unknown ?state=.  Without this the state screenshots as a clean
    # picture of the ordinary one: the wrong screen, passing.
    if page.evaluate("!!document.querySelector('.atlas-unknown-state')"):
        entry["why"] = ("the artifact does not build this state — it rendered the "
                        "unknown-state banner")
        ctx.close()
        return entry

    frame = page.evaluate(FRAME_PROBE)
    if frame.get("n") != 1:
        found = frame.get("n")
        entry["why"] = (f"expected exactly one [data-atlas-frame] element, found {found} — "
                        "nothing says which box is the design")
        ctx.close()
        return entry

    # The clip is the design plus its margin, so a picture never shows the viewport.
    # That hides the one thing a narrow width is rendered to reveal: a design taller
    # than the screen it is on, with its primary action below the fold.
    entry["overflows_viewport"] = (
        {"by": round(frame["h"] - height), "frame_height": round(frame["h"]),
         "viewport_height": height} if frame["h"] > height else False)

    png = states_dir / f"{name}@{width}.png"
    page.screenshot(path=str(png), full_page=True, clip={
        "x": max(0.0, frame["x"] - margin),
        "y": max(0.0, frame["y"] - margin),
        "width": frame["w"] + 2 * margin,
        "height": frame["h"] + 2 * margin,
    })
    entry.update(status="ok", file=f"states/{name}@{width}.png")
    ctx.close()
    return entry


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(
        description="Render every state of an artifact to a picture.")
    ap.add_argument("pass_dir", help="the pass directory holding artifact.html")
    ap.add_argument("--artifact", metavar="PATH",
                    help="the HTML to render; default is <pass-dir>/artifact.html. Only the "
                         "fixtures use this — a real pass always renders its own artifact")
    ap.add_argument("--checklist", metavar="PATH",
                    help="override the checklist; default is found by walking up for runs/. "
                         "With no runs/ above and no override, the render is checklist-less "
                         "and the artifact's window.__atlas names the states")
    ap.add_argument("--width", type=int, action="append", metavar="PX",
                    help="capture width; repeatable. Default is every viewport the checklist "
                         "names, or 1440 when there is no checklist")
    ap.add_argument("--height", type=int, default=HEIGHT, metavar="PX",
                    help=f"the screen height a design is judged to fit on (default {HEIGHT})")
    ap.add_argument("--margin", type=int, default=MARGIN, help=f"air round the frame (default {MARGIN})")
    ap.add_argument("--timeout", type=int, default=TIMEOUT, help=f"seconds (default {TIMEOUT})")
    args = ap.parse_args(argv)

    pass_dir = pathlib.Path(args.pass_dir)
    artifact = pathlib.Path(args.artifact) if args.artifact else pass_dir / "artifact.html"
    if not artifact.is_file():
        raise SystemExit(f"no artifact at {artifact}")

    cl_path = pathlib.Path(args.checklist) if args.checklist else checklist_for(pass_dir)
    checklist = json.loads(cl_path.read_text()) if cl_path else {}
    asked_for = states_from(checklist)
    if cl_path and not asked_for:
        raise SystemExit("the checklist names no states — nothing to render")

    # Shoot what the checklist asked for, not the widest of it. A width the brief
    # named and nobody rendered is a width nobody can judge.
    widths = sorted(set(args.width or checklist.get("viewports") or [1440]))

    out_json = pass_dir / "render.json"
    err_json = pass_dir / "render.error.json"
    states_dir = pass_dir / "states"

    # render.json is the completion marker (§9), so clear both before starting: a
    # stale one beside a half-finished states/ would read as a pass that finished.
    for stale in (out_json, err_json):
        stale.unlink(missing_ok=True)
    states_dir.mkdir(parents=True, exist_ok=True)
    for old in states_dir.glob("*.png"):
        old.unlink()

    events: list[tuple] = []
    declared: dict | None = None
    drift: list[str] = []
    report = {
        "run_id": checklist.get("run_id"),
        "pass": pass_dir.name,
        "widths": widths,
        "declared": None,
        "drift": [],
        "viewport_height": args.height,
        "states": [],
        "assets_failed": [],
        "not_checked": [],
    }

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("playwright is missing — run this as "
                         "`uv run --python 3.12 --with playwright python …`, "
                         "not a bare python")

    url_base = artifact.resolve().as_uri()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()  # headless; the spec names one renderer
            try:
                # Ask the artifact what it is, rather than inferring it. The checklist
                # says what was asked for; only the screen knows what was made.
                declared = read_declaration(browser, url_base, args.timeout)
                if declared is None:
                    if cl_path is None:
                        # Checklist-less, and the screen says nothing about itself.
                        # There is no second source to fall back on, so this is a
                        # stage error, not a drift note.
                        raise RuntimeError(
                            "no checklist and the artifact declares no window.__atlas "
                            "— nothing names the states to render")
                    states, params = asked_for, {}
                    drift.append("the artifact declares no window.__atlas, so only the "
                                 "checklist's states were rendered and any URL setting it "
                                 "answers to went unphotographed")
                else:
                    states, params = declared["states"], declared["params"]
                    if not states:
                        raise RuntimeError(
                            "the artifact declares an empty states list — "
                            "nothing to render")
                    if cl_path:
                        for st in sorted(set(asked_for) - set(states)):
                            drift.append(f"state {st!r} is in the checklist and not in the artifact")
                        for st in sorted(set(states) - set(asked_for)):
                            drift.append(f"state {st!r} is in the artifact and not in the checklist")

                combos = combinations(states, params)
                for width in widths:
                    for combo in combos:
                        report["states"].append(render_state(
                            browser, url_base, combo, params, width, args.height,
                            args.margin, args.timeout, states_dir, events))
            finally:
                browser.close()
    except Exception as exc:
        write_atomically(err_json, {
            "stage": "render",
            "why": f"{type(exc).__name__}: {exc}",
            "at": human_now(),
        })
        print(f"render: could not run — {exc}", file=sys.stderr)
        return 1

    report["declared"] = declared
    report["drift"] = drift
    if drift:
        report["not_checked"].append(
            "the artifact and the checklist disagree about what exists — see drift")

    ended = final_responses(events)
    remote_failed = []
    for url, status in sorted(ended.items()):
        if status == 200:
            continue
        entry = {"url": url, "status": status}
        (report["assets_failed"] if is_local(url) else remote_failed).append(entry)

    # A remote host failing is transient and nobody can edit it, so it is a stage
    # error and not a finding — putting it in front of a fixer wastes a pass on a
    # screen that was never wrong.
    if remote_failed:
        write_atomically(err_json, {
            "stage": "render",
            "why": "a remote asset did not load, so the screen would be judged "
                   "unstyled — run it again: "
                   + "; ".join(f"{e['url']} → {e['status']}" for e in remote_failed),
            "at": human_now(),
        })
        print("render: remote assets failed, wrote render.error.json", file=sys.stderr)
        return 1

    write_atomically(out_json, report)

    ok = sum(1 for s in report["states"] if s["status"] == "ok")
    shot = "px, ".join(str(w) for w in widths) + "px"
    print(f"render: {ok}/{len(report['states'])} pictures at {shot} → {states_dir}")
    for d in drift:
        print(f"  drift   {d}")
    for s in report["states"]:
        if s["status"] != "ok":
            print(f"  failed  {s['state']}@{s['width']}: {s['why']}")
        elif s.get("overflows_viewport"):
            o = s["overflows_viewport"]
            print(f"  taller than the screen  {s['state']}@{s['width']}: "
                  f"{o['frame_height']}px in {o['viewport_height']}px, over by {o['by']}px")
    for a in report["assets_failed"]:
        print(f"  asset   {a['url']} → {a['status']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
