@echo off
REM ==========================================================================
REM setup-windows.bat - Go/No-Go gereksinimlerini (Python 3) Windows'a kurar.
REM Cift tiklayarak calistirin.
REM ==========================================================================
cd /d "%~dp0"

echo ============================================================
echo   Go/No-Go - Gereksinim Kurulumu (Windows)
echo ============================================================

REM 1) Python zaten var mi?
where py >nul 2>nul
if %errorlevel%==0 (
  echo [OK] Python zaten kurulu:
  py --version
  goto :ready
)
where python >nul 2>nul
if %errorlevel%==0 (
  echo [OK] Python zaten kurulu:
  python --version
  goto :ready
)

echo Python bulunamadi. Otomatik kurulum deneniyor...
echo.

REM 2) winget varsa onunla kur (Windows 10/11)
where winget >nul 2>nul
if %errorlevel%==0 (
  echo ^>^> winget ile kuruluyor: Python.Python.3.12
  winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  echo.
  echo Kurulum tamamlandi. Lutfen bu pencereyi KAPATIP yeni bir pencere acin,
  echo ardindan 'start-windows.bat' dosyasina cift tiklayin.
  pause
  goto :eof
)

REM 3) winget yoksa python.org'u ac
echo winget bulunamadi. Tarayicida resmi indirme sayfasi aciliyor...
echo Kurulum sirasinda "Add Python to PATH" secenegini MUTLAKA isaretleyin.
start "" "https://www.python.org/downloads/"
pause
goto :eof

:ready
echo.
echo Hazirsiniz. Gorevi baslatmak icin 'start-windows.bat' dosyasina cift tiklayin.
pause
