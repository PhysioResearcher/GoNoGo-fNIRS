#!/bin/bash
# ============================================================================
# setup-mac.command — Go/No-Go gereksinimlerini (Python 3) Mac'e kurar.
# Cift tiklayarak calistirin. Sudo/yonetici gerektirmez.
# ============================================================================
cd "$(dirname "$0")" || exit 1

echo "============================================================"
echo "  Go/No-Go - Gereksinim Kurulumu (Mac)"
echo "============================================================"

# 1) Python 3 zaten var mi?
if command -v python3 >/dev/null 2>&1; then
  echo "[OK] Python 3 zaten kurulu: $(python3 --version 2>&1)"
  echo
  echo "Hazirsiniz. Gorevi baslatmak icin 'start-mac.command' dosyasina cift tiklayin."
  read -r -p "Kapatmak icin Enter'a basin..."
  exit 0
fi

echo "Python 3 bulunamadi. Otomatik kurulum deneniyor..."
echo

# 2) Homebrew varsa onunla kur
if command -v brew >/dev/null 2>&1; then
  echo ">> Homebrew ile kuruluyor: brew install python"
  if brew install python; then
    echo
    echo "[OK] Python 3 kuruldu: $(python3 --version 2>&1)"
    echo "Gorevi baslatmak icin 'start-mac.command' dosyasina cift tiklayin."
    read -r -p "Kapatmak icin Enter'a basin..."
    exit 0
  else
    echo "[HATA] Homebrew kurulumu basarisiz oldu."
  fi
fi

# 3) Homebrew yoksa Apple Command Line Tools (Python 3 icerir)
echo ">> Apple Command Line Tools kurulumu baslatiliyor (Python 3 icerir)."
echo "   Acilan pencerede 'Install' / 'Yukle' deyin ve kurulumun bitmesini bekleyin."
xcode-select --install 2>/dev/null

echo
echo "Kurulum bittiginde bu betigi (setup-mac.command) BIR KEZ DAHA calistirip"
echo "Python 3'un gorundugunu dogrulayin; ardindan 'start-mac.command' ile baslatin."
echo
echo "Alternatif: Python'u dogrudan https://www.python.org/downloads/ adresinden de kurabilirsiniz."
read -r -p "Kapatmak icin Enter'a basin..."
