@echo off
title CognitiveCare Database Initializer
echo ========================================================
echo Initializing CognitiveCare Database and Seeding Accounts...
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)
python scripts\init_db.py
pause
