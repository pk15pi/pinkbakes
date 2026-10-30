# Applies Pinkbakes phase 2 + BUG-027 local changes. No commit, push or deploy.
# Run from the folder that contains this script:  powershell -ExecutionPolicy Bypass -File .\apply_phase2.ps1
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repos = 'E:\repos'; $backup = 'E:\repos\_pinkbakes_backup_20261024\phase2'
function Hash($p) { (Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash.ToLower() }
# 1. The current files must be the phase-1 versions this patch was made from.
$bad = 0
foreach ($line in Get-Content (Join-Path $here 'expected_before.sha256')) {
  $rel, $h = $line -split ' '; $p = Join-Path $repos ($rel -replace '/', '\')
  if ((Hash $p) -ne $h) { Write-Host "CHANGED SINCE QA: $rel"; $bad++ }
}
if ($bad) { throw "$bad file(s) differ from the QA baseline; not applying." }
# 2. Backup originals.
foreach ($line in Get-Content (Join-Path $here 'expected_before.sha256')) {
  $rel = ($line -split ' ')[0] -replace '/', '\'; $dst = Join-Path $backup $rel
  New-Item -ItemType Directory -Force -Path (Split-Path $dst) | Out-Null
  Copy-Item -LiteralPath (Join-Path $repos $rel) -Destination $dst -Force
}
# 3. Apply.
Push-Location (Join-Path $repos 'pinksBakes'); git apply --check --whitespace=nowarn (Join-Path $here 'phase2_frontend.patch'); git apply --whitespace=nowarn (Join-Path $here 'phase2_frontend.patch'); Pop-Location
Push-Location (Join-Path $repos 'pinkbakes_backend'); git apply --check --whitespace=nowarn (Join-Path $here 'phase2_backend.patch'); git apply --whitespace=nowarn (Join-Path $here 'phase2_backend.patch'); Pop-Location
# 4. Keep LF-only files LF, and match line endings byte-for-byte with QA.
foreach ($rel in @('pinksBakes\src\main.jsx', 'pinksBakes\src\chatbotFaq.js')) {
  $p = Join-Path $repos $rel; $b = [IO.File]::ReadAllBytes($p); $o = New-Object System.Collections.Generic.List[byte]
  foreach ($x in $b) { if ($x -ne 13) { $o.Add($x) } }; [IO.File]::WriteAllBytes($p, $o.ToArray())
}
# 5. Verify.
$bad = 0
foreach ($line in Get-Content (Join-Path $here 'expected_after.sha256')) {
  $rel, $h = $line -split ' '; $p = Join-Path $repos ($rel -replace '/', '\')
  if ((Hash $p) -ne $h) { Write-Host "HASH MISMATCH: $rel"; $bad++ }
}
Write-Host "hash mismatches: $bad"
git -C (Join-Path $repos 'pinksBakes') diff --stat; git -C (Join-Path $repos 'pinkbakes_backend') diff --stat
