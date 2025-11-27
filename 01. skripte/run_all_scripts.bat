@echo off
cls
echo ==========================================
echo Adobe Illustrator Script Automation Tool
echo ==========================================
echo.

REM This script runs multiple JSX scripts for Adobe Illustrator in sequence
REM Configuration is read from config.ini file

REM Read configuration from config.ini
for /f "tokens=1,* delims==" %%a in ('type "config.ini" ^| findstr "IllustratorPath"') do set "illustrator=%%b"
for /f "tokens=1,* delims==" %%a in ('type "config.ini" ^| findstr "ScriptsDirectory"') do set "scriptsdir=%%b"
for /f "tokens=1,* delims==" %%a in ('type "config.ini" ^| findstr "RootDirectory"') do set "rootdir=%%b"

echo Using Illustrator Path: %illustrator%
echo Using Scripts Directory: %scriptsdir%
echo Using Root Directory: %rootdir%
echo.

if not exist "%illustrator%" (
    echo ERROR: Illustrator executable not found at specified path!
    echo Please check the config.ini file.
    pause
    exit /b
)

echo Starting script execution...
echo.

echo [1/11] Running Gold_Glas.jsx...
"%illustrator%" "%rootdir%\Gold_Glas.jsx"
timeout /t 2 /nobreak >nul

echo [2/11] Running Gold_Rahmen.jsx...
"%illustrator%" "%rootdir%\Gold_Rahmen.jsx"
timeout /t 2 /nobreak >nul

echo [3/11] Running Hueellverzerrung.jsx...
"%illustrator%" "%rootdir%\Hüllverzerrung.jsx"
timeout /t 2 /nobreak >nul

echo [4/11] Running Kapiteloverlay.jsx...
"%illustrator%" "%rootdir%\Kapiteloverlay.jsx"
timeout /t 2 /nobreak >nul

echo [5/11] Running Warnschild.jsx...
"%illustrator%" "%rootdir%\Warnschild.jsx"
timeout /t 2 /nobreak >nul

echo [6/11] Running create_template_illustrator.jsx...
"%illustrator%" "%rootdir%\create_template_illustrator.jsx"
timeout /t 2 /nobreak >nul

echo [7/11] Running goldrahmen.jsx (root)...
"%illustrator%" "%rootdir%\goldrahmen.jsx"
timeout /t 2 /nobreak >nul

echo [8/11] Running Logo Banner.jsx...
"%illustrator%" "%scriptsdir%\Logo Banner.jsx"
timeout /t 2 /nobreak >nul

echo [9/11] Running banner.jsx...
"%illustrator%" "%scriptsdir%\banner.jsx"
timeout /t 2 /nobreak >nul

echo [10/11] Running goldrahmen.jsx (scripts folder)...
"%illustrator%" "%scriptsdir%\goldrahmen.jsx"
timeout /t 2 /nobreak >nul

echo [11/11] Running welle.jsx...
"%illustrator%" "%scriptsdir%\welle.jsx"
timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo All scripts executed successfully!
echo ==========================================
pause