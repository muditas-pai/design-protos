#!/usr/bin/env python3
"""Serve the repo and let the annotator write its JSONL back into it.

    python3 tools/annotate/serve.py            # http://localhost:8901

Static file serving plus one endpoint, POST /_annotate, which writes an
annotations.jsonl inside the repo. Without this the annotator still works:
"Copy for Claude" puts the same content on the clipboard. This just removes
the paste step while working locally.

Writes are restricted to files named annotations.jsonl inside the repo, so a
stray request cannot touch a proto. That matters here: an annotated proto is
frozen, and the annotator records a content hash to prove it.
"""

import json
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8901


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/_annotate":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
            rel, content = payload["file"], payload["content"]
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

        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, "w", encoding="utf-8") as fh:
            fh.write(content)

        lines = len([ln for ln in content.splitlines() if ln.strip()])
        print("  wrote %-58s %d note%s" % (rel, lines, "" if lines == 1 else "s"))
        self._json(200, {"ok": True, "file": rel, "notes": lines})

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
    print("\n  serving %s" % ROOT)
    print("  annotate:  http://localhost:%d/tools/annotate/annotate.html\n" % PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("  stopped\n")
