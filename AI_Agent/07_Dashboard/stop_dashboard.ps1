$ErrorActionPreference = "Stop"

$DashboardDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $DashboardDir "dashboard_server.pid"

if (-not (Test-Path -LiteralPath $PidFile)) {
  Write-Output "Dashboard pid file not found."
  exit 0
}

$lines = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
if ($lines.Count -lt 1) {
  Remove-Item -LiteralPath $PidFile -Force
  Write-Output "Dashboard pid file was empty and has been removed."
  exit 0
}

$pidValue = [int]$lines[0]
$proc = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
if ($proc) {
  Stop-Process -Id $pidValue -Force
  Write-Output "Dashboard stopped: PID $pidValue"
} else {
  Write-Output "Dashboard process was not running: PID $pidValue"
}

Remove-Item -LiteralPath $PidFile -Force
