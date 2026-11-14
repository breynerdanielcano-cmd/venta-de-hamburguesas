@echo off
title Tienda Burger - servidor local
cd /d "%~dp0"

netstat -ano | findstr /R /C:":5500 .*LISTENING" >nul
if %errorlevel%==0 goto abrir

echo Iniciando el servidor local en el puerto 5500...
echo.
echo   Tienda:    http://localhost:5500/index.html
echo   Dashboard: http://localhost:5500/dashboard/login.html
echo.
echo Deja esta ventana abierta mientras usas la pagina.
echo Para detenerlo, cierra la ventana o presiona Ctrl + C.
echo.
start "" "http://localhost:5500/index.html"
python -m http.server 5500
echo.
echo El servidor se detuvo.
pause
goto :eof

:abrir
echo El servidor ya esta activo en http://localhost:5500
start "" "http://localhost:5500/index.html"
timeout /t 3 >nul
