@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Users\28987\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
set "WRANGLER_WRITE_LOGS=false"
set "WRANGLER_LOG_PATH=%~dp0.wrangler\logs"
set "MINIFLARE_REGISTRY_PATH=%~dp0.wrangler\registry"
if not exist "node_modules\.bin\vite.cmd" (
  echo [ERROR] Dependencies are missing. Run pnpm install in this folder first.
  pause
  exit /b 1
)
call "node_modules\.bin\vite.cmd" --config vite.pages.config.ts --port 3000 --open
if errorlevel 1 pause

