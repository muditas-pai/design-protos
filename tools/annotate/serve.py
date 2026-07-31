#!/usr/bin/env python3
"""Serve the repo with annotation mode available in every proto.

    python3 tools/annotate/serve.py            # http://localhost:8901

Two jobs.

**Injection.** Any .html under explorations/, key-screens/ or design-system/
(index pages excluded) is served with one extra script tag before </body>,
which puts annotation mode a Shift+C away. The file on disk is never written,
and the hash handed to the annotator is taken from the raw bytes before
injection, so the freeze check still describes the file rather than what the
browser was handed.

**Writing.** POST /_annotate writes an annotations.jsonl inside the repo, then
commits just that file and pushes it, so a note you make is a note everyone
else has. Pass --no-push to keep saves local.

Without the server the proto is just a proto: no injection, so no Shift+C.
That is the trade for never touching the file.

Writes are restricted to files named annotations.jsonl inside the repo, so a
stray request cannot touch a proto. That matters here: an annotated proto is
frozen, and the annotator records a content hash to prove it.

One store serves a whole problem folder, so a write is a MERGE, never a
truncate: the lines belonging to the proto being saved are replaced and every
sibling's lines are kept, in their original order. The annotator only ever
holds one proto's notes in memory, so a plain overwrite would erase the rest
of the folder, which it silently did until this was fixed.
"""

import hashlib
import json
import os
import pathlib
import posixpath
import re
import subprocess
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = next((int(a) for a in sys.argv[1:] if a.isdigit()), 8901)

# Folders whose .html files are protos worth annotating. Index and hub pages
# are excluded by name: they are lists of links, not designs.
PROTO_DIRS = ("explorations/", "key-screens/", "design-system/")
BODY_END = re.compile(rb"</body\s*>(?![\s\S]*</body\s*>)", re.I)

PUSH = "--no-push" not in sys.argv


def git(*args, **kw):
    """Run one git command in the repo. Never raises, always reports."""
    try:
        p = subprocess.run(("git",) + args, cwd=ROOT, capture_output=True,
                           text=True, timeout=kw.get("timeout", 45))
        return p.returncode == 0, (p.stdout + p.stderr).strip()
    except Exception as exc:
        return False, str(exc)


def sha16(path):
    try:
        with open(path, "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:16]
    except OSError:
        return None


def collect_notes():
    """Every annotation in the repo, with enough to draw it without the proto.

    `stale` is decided here rather than in the page, because it is a comparison
    against the bytes on disk and only something with a filesystem can see that.
    """
    notes = []
    for store in sorted(pathlib.Path(ROOT).rglob("annotations.jsonl")):
        if "node_modules" in store.parts:
            continue
        rel_store = str(store.relative_to(ROOT))
        for line in store.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                n = json.loads(line)
            except ValueError:
                continue
            proto = os.path.join(ROOT, n.get("proto", ""))
            exists = os.path.isfile(proto)
            current = sha16(proto) if exists else None
            n["store"] = rel_store
            n["proto_exists"] = exists
            n["stale"] = bool(n.get("hash") and current and n["hash"] != current)
            notes.append(n)
    return notes


def write_manifest():
    """The same payload as /_notes, as a file.

    A static host cannot list a directory, which is the only reason the contact
    sheet needed a server at all: not to hold the notes, just to answer "which
    folders have a store?". Committing the answer removes the server from the
    reading path entirely, so the sheet works on Pages.
    """
    path = os.path.join(ROOT, "tools", "annotate", "notes.json")
    notes = collect_notes()
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump({"notes": notes, "generated_by": "tools/annotate/serve.py"}, fh, indent=1)
        fh.write("\n")
    os.replace(tmp, path)
    return "tools/annotate/notes.json", len(notes)


def publish(paths, proto, count):
    """Commit these files and push them, so a note reaches everyone else.

    Only ever stages the store that was just written and the manifest derived
    from it. Staging broadly would sweep up whatever else the designer happens
    to have open, which in a repo where everyone commits to main is how
    unrelated work ends up in somebody else's commit.
    """
    ok, branch = git("rev-parse", "--abbrev-ref", "HEAD")
    branch = branch if ok else "?"

    ok, out = git("add", "--", *paths)
    if not ok:
        return {"state": "failed", "at": "add", "branch": branch, "detail": out}

    ok, out = git("diff", "--cached", "--quiet", "--", *paths)
    if ok:                                   # exit 0 means nothing staged
        return {"state": "unchanged", "branch": branch}

    subject = "annotate: %d note%s on %s" % (count, "" if count == 1 else "s",
                                             os.path.basename(proto))
    ok, out = git("commit", "-m", subject, "--", *paths)
    if not ok:
        return {"state": "failed", "at": "commit", "branch": branch, "detail": out}

    ok, out = git("push", timeout=90)
    if not ok:
        # someone pushed between our pull and now; rebase onto them and retry once
        ok2, _ = git("pull", "--rebase", "--autostash", timeout=90)
        if ok2:
            ok, out = git("push", timeout=90)
    if not ok:
        return {"state": "committed", "branch": branch, "detail": out,
                "hint": "committed locally, push failed"}

    print("       pushed to %s  (%s)" % (branch, subject))
    return {"state": "pushed", "branch": branch, "subject": subject}


class Handler(SimpleHTTPRequestHandler):
    # ---- serve-time injection ------------------------------------------
    def do_GET(self):
        if self.path.split("?")[0] == "/_notes":
            return self._notes()

        path = self.translate_path(self.path)
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        if not self._is_proto(path, rel):
            return SimpleHTTPRequestHandler.do_GET(self)

        with open(path, "rb") as fh:
            raw = fh.read()
        # hash the RAW bytes, before injection: the freeze check has to describe
        # the file on disk, not what the browser was handed
        digest = hashlib.sha256(raw).hexdigest()[:16]

        tag = (
            '<script src="/tools/annotate/annotate.js" data-proto="%s" data-hash="%s"></script>'
            % (rel, digest)
        ).encode()
        body = BODY_END.sub(tag + b"</body>", raw, count=1) if BODY_END.search(raw) else raw + tag

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _notes(self):
        self._json(200, {"notes": collect_notes()})

    @staticmethod
    def _sha16(path):
        try:
            with open(path, "rb") as fh:
                return hashlib.sha256(fh.read()).hexdigest()[:16]
        except OSError:
            return None

    @staticmethod
    def _is_proto(path, rel):
        if not path.lower().endswith(".html") or not os.path.isfile(path):
            return False
        if rel.startswith("tools/") or posixpath.basename(rel) == "index.html":
            return False
        return rel.startswith(PROTO_DIRS)

    def do_POST(self):
        if self.path != "/_annotate":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
            rel, content, proto = payload["file"], payload["content"], payload["proto"]
        except Exception as exc:
            self._json(400, {"error": "bad request: %s" % exc})
            return

        target = os.path.abspath(os.path.join(ROOT, rel))
        if not target.startswith(ROOT + os.sep):
            self._json(403, {"error": "outside the repo"})
            return
        if os.path.basename(target) != "annotations.jsonl":
            self._json(403, {"error": "only annotations.jsonl may be written"})
            return

        # Take other people's notes before merging, so the merge runs against
        # the freshest store rather than against whatever this clone last saw.
        if PUSH:
            git("pull", "--rebase", "--autostash")

        mine = [ln for ln in content.splitlines() if ln.strip()]
        kept = self._other_protos(target, proto)

        os.makedirs(os.path.dirname(target), exist_ok=True)
        merged = kept + mine
        tmp = target + ".tmp"
        with open(tmp, "w", encoding="utf-8") as fh:
            fh.write("".join(ln + "\n" for ln in merged))
        os.replace(tmp, target)  # atomic, so an interrupted save cannot truncate

        print("  wrote %-52s %d note%s (+%d kept)"
              % (rel, len(mine), "" if len(mine) == 1 else "s", len(kept)))

        # regenerate the static manifest so the contact sheet stays true on Pages
        manifest, total = write_manifest()

        out = {"ok": True, "file": rel, "notes": len(mine), "kept": len(kept),
               "manifest": total}
        out["git"] = publish([rel, manifest], proto, len(mine)) if PUSH else {"state": "off"}
        self._json(200, out)

    @staticmethod
    def _other_protos(target, proto):
        """Existing lines that belong to some other proto in the same folder.

        A line we cannot parse is kept rather than dropped: it is somebody's
        note, and losing it to a stray character is the exact failure this
        merge exists to prevent.
        """
        if not os.path.exists(target):
            return []
        kept = []
        with open(target, encoding="utf-8") as fh:
            for line in fh:
                line = line.rstrip("\n")
                if not line.strip():
                    continue
                try:
                    if json.loads(line).get("proto") == proto:
                        continue
                except Exception:
                    pass
                kept.append(line)
        return kept

    def _json(self, code, body):
        raw = json.dumps(body).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def end_headers(self):
        # the annotator re-reads annotations.jsonl and the proto on every load
        self.send_header("Cache-Control", "no-store")
        SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, *args):
        pass  # the writes above are the only interesting output


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), partial(Handler, directory=ROOT))
    ok, branch = git("rev-parse", "--abbrev-ref", "HEAD")
    print("\n  serving %s" % ROOT)
    print("  open any proto and press Shift+C")
    print("  notes so far:  http://localhost:%d/tools/annotate/sheet.html" % PORT)
    print("  on save:       %s\n"
          % ("commit + push to %s" % (branch if ok else "?") if PUSH
             else "write locally only (--no-push)"))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("  stopped\n")
