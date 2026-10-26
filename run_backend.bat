@echo off
title CognitiveCare Backend (FastAPI)
echo ========================================================
echo Starting CognitiveCare FastAPI Backend Server
echo API Docs will be available at: http://localhost:8000/docs
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
