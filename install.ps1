param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

$resolved = (Resolve-Path -LiteralPath $ProjectRoot).Path
$posix = $resolved -replace '\\', '/'
$templateRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$files = Get-ChildItem -LiteralPath $templateRoot -File -Recurse | Where-Object {
  $_.Extension -in @(".md", ".py", ".ps1", ".html", ".css", ".js", ".json", ".txt")
}

foreach ($file in $files) {
  $text = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $text = $text.Replace("{{PROJECT_ROOT}}", $resolved)
  $text = $text.Replace("{{PROJECT_ROOT_POSIX}}", $posix)
  [System.IO.File]::WriteAllText($file.FullName, $text, $utf8NoBom)
}

Write-Output "Jarvis template installed for project root: $resolved"
Write-Output "Open a new Codex conversation in this project and say: 召唤贾维斯"
