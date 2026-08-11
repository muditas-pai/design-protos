#!/usr/bin/env python3
"""The smoke test for the render stage.  Run it after changing render.py.

    tools-python tools/render/test_render.py

Six fixtures, one fault each, because the faults cannot share a file: a hanging
`__atlasReady` masks every other fault, and marker count cannot vary by state —
`querySelectorAll` finds a hidden element as readily as a shown one.

It runs the real command line rather than importing, so what is under test is the thing
a person actually types.  No network: the fixtures load nothing remote, except the one
whose whole point is a host that does not resolve.
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
FIXTURES = HERE / "fixtures"
RENDER = HERE / "render.py"

# clean.html's frame is a 400px card with 32px padding either side — 464 — and the
# render leaves 48px of air on each side.  Asserting this is what proves the picture is
# clipped to the design rather than fitted to a window.
CLEAN_FRAME_W = 464 + 2 * 48

failures: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print(f"  {'pass' if ok else 'FAIL'}  {name}" + (f"  — {detail}" if detail and not ok else ""))
    if not ok:
        failures.append(f"{name}: {detail}")


def png_width(path: pathlib.Path) -> int:
    import struct
    return struct.unpack(">II", path.read_bytes()[16:24])[0]


def png_pixel(path: pathlib.Path, x: int, y: int) -> tuple[int, int, int]:
    """The RGB at one point.  Enough to tell which layout was photographed.

    Stdlib only — a whole image library to read three bytes would be the tail wagging
    the dog.  Chromium writes 8-bit RGB or RGBA, so those are the two cases handled.
    """
    import struct
    import zlib

    raw = path.read_bytes()
    pos, idat = 8, bytearray()
    width = height = depth = colour = 0
    while pos < len(raw):
        length, kind = struct.unpack(">I", raw[pos:pos + 4])[0], raw[pos + 4:pos + 8]
        body = raw[pos + 8:pos + 8 + length]
        if kind == b"IHDR":
            width, height, depth, colour = (*struct.unpack(">II", body[:8]), body[8], body[9])
        elif kind == b"IDAT":
            idat += body
        elif kind == b"IEND":
            break
        pos += 12 + length
    if depth != 8 or colour not in (2, 6):
        raise AssertionError(f"unhandled PNG: depth {depth}, colour type {colour}")

    channels = 3 if colour == 2 else 4
    stride = width * channels
    data = zlib.decompress(bytes(idat))
    prev, out = bytearray(stride), None
    for row in range(y + 1):
        filt = data[row * (stride + 1)]
        line = bytearray(data[row * (stride + 1) + 1:(row + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - channels] if i >= channels else 0
            b = prev[i]
            c = prev[i - channels] if i >= channels else 0
            if filt == 1:
                line[i] = (line[i] + a) & 0xFF
            elif filt == 2:
                line[i] = (line[i] + b) & 0xFF
            elif filt == 3:
                line[i] = (line[i] + (a + b) // 2) & 0xFF
            elif filt == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 0xFF
        prev, out = line, line
    off = x * channels
    return out[off], out[off + 1], out[off + 2]


def run(fixture: str, checklist: str = "checklist.json", *extra: str):
    """-> (exit code, render.json or None, error.json or None, states dir)"""
    out = pathlib.Path(tempfile.mkdtemp(prefix=f"render-{fixture.split('.')[0]}-"))
    proc = subprocess.run(
        [sys.executable, str(RENDER), str(out),
         "--artifact", str(FIXTURES / fixture),
         "--checklist", str(FIXTURES / checklist), *extra],
        capture_output=True, text=True)
    rj, ej = out / "render.json", out / "render.error.json"
    return (proc.returncode,
            json.loads(rj.read_text()) if rj.is_file() else None,
            json.loads(ej.read_text()) if ej.is_file() else None,
            out / "states")


def states_by_name(report: dict) -> dict:
    return {s["state"]: s for s in report["states"]}


def main() -> int:
    print("clean.html — two states, nothing wrong")
    code, rep, err, shots = run("clean.html")
    check("exits 0", code == 0, f"got {code}")
    check("writes render.json", rep is not None)
    check("no render.error.json", err is None)
    if rep:
        st = states_by_name(rep)
        check("renders exactly the two active states with a state",
              sorted(st) == ["default", "empty"], f"got {sorted(st)}")
        check("both ok", all(s["status"] == "ok" for s in st.values()))
        check("no asset findings", rep["assets_failed"] == [])
        check("records the widths it shot", rep["widths"] == [1440], f"got {rep.get('widths')}")
        pngs = sorted(p.name for p in shots.glob("*.png"))
        check("one picture per state per width", pngs == ["default@1440.png", "empty@1440.png"], f"got {pngs}")
        if pngs:
            shot = shots / "default@1440.png"
            w = png_width(shot)
            check(f"clipped to the frame + 48px either side ({CLEAN_FRAME_W}px)",
                  w == CLEAN_FRAME_W, f"got {w}px")
            # The card is white above 767px and red below it.  A render that resized the
            # window to the frame would sit at 560 and photograph a red card while
            # calling it 1440 — the bug that clipping exists to prevent.
            r, g, b = png_pixel(shot, CLEAN_FRAME_W // 2, 60)
            check("photographed at the capture width, not the frame width",
                  (r, g, b) == (255, 255, 255),
                  f"card is rgb{(r, g, b)} — red means the window was resized below the breakpoint")

    print("\nclean.html with two viewports — shoots both, not just the widest")
    code, rep, err, shots = run("clean.html", "checklist-two-widths.json")
    check("exits 0", code == 0, f"got {code}")
    check("writes render.json", rep is not None)
    if rep:
        check("records both widths", rep["widths"] == [390, 1440], f"got {rep.get('widths')}")
        pngs = sorted(p.name for p in shots.glob("*.png"))
        check("four pictures — two states at two widths",
              pngs == ["default@1440.png", "default@390.png",
                       "empty@1440.png", "empty@390.png"], f"got {pngs}")
        check("every entry names its width",
              all(isinstance(s.get("width"), int) for s in rep["states"]))
        narrow = [s for s in rep["states"] if s["width"] == 390]
        check("the narrow shots are narrower",
              png_width(shots / "default@390.png") < png_width(shots / "default@1440.png"))
        check("overflow is reported per picture, not guessed",
              all("overflows_viewport" in s for s in rep["states"]))

    print("\nparams.html — a URL setting that is not a state")
    code, rep, err, shots = run("params.html")
    check("exits 0", code == 0, f"got {code}")
    check("writes render.json", rep is not None)
    if rep:
        check("reads the artifact's own declaration", rep.get("declared") is not None)
        if rep.get("declared"):
            check("and the setting it declares", rep["declared"]["params"] == {"tone": [1, 2, 3]},
                  str(rep["declared"].get("params")))
        pngs = sorted(p.name for p in shots.glob("*.png"))
        check("every state, plus every off-default value of the setting",
              pngs == ["default@1440.png", "default~tone-2@1440.png",
                       "default~tone-3@1440.png", "empty@1440.png"], f"got {pngs}")
        check("no drift — the artifact matches the checklist", rep["drift"] == [], str(rep["drift"]))
        check("each entry records the settings it was shot with",
              all("params" in s for s in rep["states"]))

    print("\ndrift.html — the artifact and the checklist disagree about what exists")
    code, rep, err, shots = run("drift.html")
    check("exits 0 — drift is reported, not fatal", code == 0, f"got {code}")
    if rep:
        check("names both directions", len(rep["drift"]) == 2, str(rep["drift"]))
        joined = " ".join(rep["drift"])
        check("the state only the checklist has", "'empty'" in joined, joined)
        check("the state only the artifact has", "'extra'" in joined, joined)
        check("says so in not_checked", any("drift" in x for x in rep["not_checked"]))
        check("renders what the artifact actually built, not what was asked for",
              sorted(p.name for p in shots.glob("*.png"))
              == ["default@1440.png", "extra@1440.png"],
              str(sorted(p.name for p in shots.glob("*.png"))))

    print("\ntall.html — a design taller than the screen it is on")
    code, rep, err, shots = run("tall.html", "checklist.json")
    check("exits 0 — being too tall is a fact, not a failure", code == 0, f"got {code}")
    if rep:
        st = states_by_name(rep)
        o = st["default"]["overflows_viewport"]
        check("says it overflows", bool(o), f"got {o}")
        if o:
            check("says by how much", o["by"] > 0 and o["frame_height"] > o["viewport_height"], str(o))
            check("the number is the gap, not a guess",
                  o["by"] == o["frame_height"] - o["viewport_height"], str(o))

    print("\nclean.html against a checklist naming a state it never built")
    code, rep, err, shots = run("clean.html", "checklist-ghost.json")
    check("exits 0 — a disagreement, not a crash", code == 0, f"got {code}")
    check("writes render.json", rep is not None)
    if rep:
        st = states_by_name(rep)
        check("the real state still renders", st["default"]["status"] == "ok")
        check("no picture is wasted on a state nobody built", "ghost-state" not in st,
              f"got {sorted(st)}")
        check("the disagreement is named", any("ghost-state" in x for x in rep["drift"]),
              str(rep["drift"]))
        check("and carried into not_checked", any("drift" in x for x in rep["not_checked"]))

    print("\nno-frame.html — nothing marks the design")
    code, rep, err, shots = run("no-frame.html")
    # Asserted, not assumed: `if rep:` alone would skip every check below when the
    # stage crashed instead of recording a finding, and the suite would read green.
    check("records it as findings, not a crash", rep is not None and err is None,
          f"render.json={rep is not None} error.json={err is not None}")
    if rep:
        st = states_by_name(rep)
        check("every state fails", all(s["status"] == "failed" for s in st.values()))
        check("reports the count", "found 0" in (st["default"]["why"] or ""), st["default"]["why"])
        check("takes no pictures", not list(shots.glob("*.png")))

    print("\ntwo-frames.html — two things claim to be the design")
    code, rep, err, _ = run("two-frames.html")
    check("records it as findings, not a crash", rep is not None and err is None,
          f"render.json={rep is not None} error.json={err is not None}")
    if rep:
        st = states_by_name(rep)
        check("every state fails", all(s["status"] == "failed" for s in st.values()))
        check("reports the count", "found 2" in (st["default"]["why"] or ""), st["default"]["why"])

    print("\nmissing-asset.html — a local file 404s (the fixer can fix it)")
    code, rep, err, _ = run("missing-asset.html")
    check("exits 0", code == 0, f"got {code}")
    check("no render.error.json — it is a finding, not a re-run", err is None)
    check("writes render.json", rep is not None)
    if rep:
        check("states still render", all(s["status"] == "ok" for s in rep["states"]))
        check("one asset finding", len(rep["assets_failed"]) == 1, str(rep["assets_failed"]))
        if rep["assets_failed"]:
            u = rep["assets_failed"][0]["url"]
            check("and it is the local one", u.startswith("file://") and u.endswith("nope.css"), u)

    print("\nremote-asset.html — a host that does not resolve (nobody can fix it)")
    code, rep, err, _ = run("remote-asset.html")
    check("exits 1", code == 1, f"got {code}")
    check("writes render.error.json", err is not None)
    check("writes no render.json", rep is None)
    if err:
        check("stage is named", err.get("stage") == "render", str(err.get("stage")))
        check("says run it again", "run it again" in err.get("why", ""), err.get("why", "")[:60])

    print("\nnever-ready.html — __atlasReady never settles")
    code, rep, err, _ = run("never-ready.html", "checklist.json", "--timeout", "2")
    check("the run still terminates", code == 0, f"got {code}")
    check("writes render.json", rep is not None)
    if rep:
        st = states_by_name(rep)
        check("every state fails", all(s["status"] == "failed" for s in st.values()))
        check("says it timed out", "not ready within 2s" in (st["default"]["why"] or ""),
              st["default"]["why"])
        check("no stack trace in why", "\n" not in (st["default"]["why"] or "")
              and "    at " not in (st["default"]["why"] or ""), st["default"]["why"])

    print()
    if failures:
        print(f"{len(failures)} FAILED")
        for f in failures:
            print("  -", f)
        return 1
    print("all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
