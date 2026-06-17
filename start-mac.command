#!/bin/bash
# Mac başlatıcı — çift tıklayarak Go/No-Go görevini başlatır.
# Betiğin bulunduğu klasöre geç
cd "$(dirname "$0")" || exit 1

# Python 3'ü bul
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python 3 bulunamadi. Once gereksinim kurulumu calistiriliyor..."
  echo
  bash "$(dirname "$0")/setup-mac.command"
  echo
  echo "Kurulum bittikten sonra 'start-mac.command' dosyasini tekrar calistirin."
  read -r -p "Kapatmak icin Enter'a basin..."
  exit 1
fi

exec "$PY" serve.py
