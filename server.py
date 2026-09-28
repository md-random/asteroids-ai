#!/usr/bin/env python3
import http.server
import json
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

class AsteroidsHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.json': 'application/json',
        '.js': 'application/javascript',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/list-brains":
            brains = []
            if os.path.exists(DATA_DIR):
                for f in sorted(os.listdir(DATA_DIR)):
                    if f.endswith(".json"):
                        path = os.path.join(DATA_DIR, f)
                        gen = None
                        try:
                            with open(path, "r") as fp:
                                data = json.load(fp)
                                gen = data.get("generation")
                        except Exception:
                            pass
                        brains.append({
                            "filename": f,
                            "generation": gen,
                            "size": os.path.getsize(path)
                        })
            # Default brain first, then sort by generation descending
            brains.sort(key=lambda b: (0 if b["filename"] == "default_brain.json" else 1, -(b["generation"] or 0)))
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(brains).encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/api/save-brain":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                filepath = os.path.join(DATA_DIR, "default_brain.json")
                with open(filepath, "w") as f:
                    json.dump(data, f, indent=2)

                gen = data.get("generation", 1)
                snap_path = os.path.join(DATA_DIR, f"brain_gen_{gen}.json")
                with open(snap_path, "w") as f:
                    json.dump(data, f, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok", "file": "data/default_brain.json", "gen": gen}).encode())
                print(f"Saved brain to data/default_brain.json and data/brain_gen_{gen}.json")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    print(f"Asteroids AI server running at http://localhost:{PORT}")
    server = http.server.ThreadingHTTPServer(("", PORT), AsteroidsHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
