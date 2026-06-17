#!/usr/bin/env python3
"""
serve.py — Go/No-Go görevini yerel sunucudan başlatır.
Klasördeki dosyaları http://localhost:<port> üzerinden sunar ve
varsayılan tarayıcıda otomatik açar. Mac ve Windows'ta çalışır.

Kullanım:
    python3 serve.py            (Mac/Linux)
    py serve.py                 (Windows)
Durdurmak için terminalde Ctrl+C.
"""
import http.server
import socketserver
import webbrowser
import os
import sys
import threading

PREFERRED_PORT = 8123
HOST = "127.0.0.1"


def find_free_port(start):
    import socket
    for port in range(start, start + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:   # bağlanamıyorsa => boş
                return port
    return start


def main():
    # Betiğin bulunduğu klasörü sun (index.html burada olmalı)
    root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root)

    # Konsolu UTF-8'e ayarlamayı dene (Windows cp1252 / ASCII sorunlarını önler)
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    if not os.path.exists(os.path.join(root, "index.html")):
        print("HATA: index.html bulunamadi. serve.py'yi proje klasorunde calistirin.")
        sys.exit(1)

    port = find_free_port(PREFERRED_PORT)
    url = f"http://{HOST}:{port}/index.html"

    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass  # konsolu sessiz tut

        def end_headers(self):
            # Tarayıcının eski sürümü önbelleğe almasını engelle
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, port), Handler) as httpd:
        print("=" * 56, flush=True)
        print("  Go/No-Go Gorevi sunucusu calisiyor", flush=True)
        print(f"  Adres : {url}", flush=True)
        print("  Durdurmak icin bu pencerede Ctrl+C", flush=True)
        print("=" * 56, flush=True)
        # Sunucu hazır olunca tarayıcıyı aç
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu durduruldu.")


if __name__ == "__main__":
    main()
