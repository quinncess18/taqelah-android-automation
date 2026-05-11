# Captures the current on-screen UI hierarchy from the connected Android device
# and saves it to dumps/<name>.xml at the repo root.
#
# Usage:
#   .\scripts\capture-ui-dump.ps1 <name>
#
# Example:
#   .\scripts\capture-ui-dump.ps1 notif_01_dialog_open

param(
  [Parameter(Mandatory = $true)]
  [string]$Name
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$dumpsDir = Join-Path $repoRoot 'dumps'
if (-not (Test-Path $dumpsDir)) {
  New-Item -ItemType Directory -Path $dumpsDir | Out-Null
}

$safeName = $Name -replace '[^a-zA-Z0-9_\-]', '_'
$outFile  = Join-Path $dumpsDir "$safeName.xml"

Write-Host "Dumping UI hierarchy..."
adb shell uiautomator dump /sdcard/window_dump.xml | Out-Null

Write-Host "Pulling to $outFile"
adb pull /sdcard/window_dump.xml "$outFile" | Out-Null

if (Test-Path $outFile) {
  $size = (Get-Item $outFile).Length
  Write-Host "Saved $outFile ($size bytes)"
} else {
  Write-Error "Failed to capture dump for '$Name'"
}
