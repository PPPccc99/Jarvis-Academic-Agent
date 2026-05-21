$ErrorActionPreference = "Stop"

$DashboardDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $DashboardDir "dashboard_server.pid"
$Port = 8765
$MaxPort = 8775

function Test-PortFree {
  param([int]$PortNumber)
  $conn = Get-NetTCPConnection -LocalPort $PortNumber -ErrorAction SilentlyContinue
  return -not $conn
}

if (Test-Path -LiteralPath $PidFile) {
  $lines = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
  if ($lines.Count -ge 1) {
    $oldPid = [int]$lines[0]
    $proc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if ($proc) {
      $url = if ($lines.Count -ge 2) { $lines[1] } else { "http://127.0.0.1:$Port/index.html" }
      Start-Process $url
      Write-Output "Dashboard already running: $url"
      exit 0
    }
  }
}

$selected = $null
foreach ($candidate in $Port..$MaxPort) {
  if (Test-PortFree -PortNumber $candidate) {
    $selected = $candidate
    break
  }
}

if (-not $selected) {
  throw "No free dashboard port found in $Port..$MaxPort"
}

$proc = Start-Process -FilePath "python" -ArgumentList @("-m", "http.server", "$selected", "--bind", "127.0.0.1") -WorkingDirectory $DashboardDir -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 1

$url = "http://127.0.0.1:$selected/index.html"
Set-Content -LiteralPath $PidFile -Value @($proc.Id, $url) -Encoding UTF8
Start-Process $url

Write-Output "Dashboard started: $url"
