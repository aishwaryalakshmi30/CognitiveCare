@echo off
title CognitiveCare ML Training Pipeline
echo ========================================================
echo Generating Dataset & Training Random Forest Difficulty Model
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)
python scripts\generate_synthetic_data.py
python scripts\train_model.py
pause
