"""Local game server: revalidate nothing from an earlier editing session."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class GameHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        # Do not send 304 for an older same-second edit.
        for header in ('If-Modified-Since', 'If-None-Match'):
            if header in self.headers:
                del self.headers[header]
        super().do_GET()

if __name__ == '__main__':
    game = Path(__file__).resolve().parents[1] / 'game'
    server = ThreadingHTTPServer(('127.0.0.1', 4173), partial(GameHandler, directory=str(game)))
    print('Tidebreak: http://localhost:4173/ (development cache disabled)', flush=True)
    server.serve_forever()
