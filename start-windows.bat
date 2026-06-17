@echo off
REM Windows baslatici - cift tiklayarak Go/No-Go gorevini baslatir.
cd /d "%~dp0"

REM Python 3'u bul (once 'py', sonra 'python')
where py >nul 2>nul
if %errorlevel%==0 (
  py serve.py
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py
  goto :eof
)

echo Python 3 bulunamadi. Once gereksinim kurulumu calistiriliyor...
echo.
call "%~dp0setup-windows.bat"
echo.
echo Kurulum bittikten sonra bu pencereyi kapatip 'start-windows.bat' dosyasini tekrar calistirin.
pause
