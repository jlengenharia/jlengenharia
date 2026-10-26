#!/usr/bin/env python3
"""Servidor local só para preview: serve 404.html para qualquer rota
inexistente, imitando o comportamento da Vercel em produção.
Não faz parte do deploy — é só uma ferramenta de desenvolvimento."""
import http.server
import os
from urllib.parse import urlsplit

PORT = 8080


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        """Resolve rotas limpas como /privacidade para privacidade.html."""
        path = urlsplit(self.path).path
        if path != "/" and not os.path.splitext(path)[1]:
            candidate = os.path.join(os.path.dirname(__file__), path.lstrip("/") + ".html")
            if os.path.isfile(candidate):
                self.path = path + ".html"
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open(os.path.join(os.path.dirname(__file__), "404.html"), "rb") as f:
                self.wfile.write(f.read())
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"Servindo em http://localhost:{PORT}")
        httpd.serve_forever()
