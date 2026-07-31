# Simple end-to-end demo for local development
# Requirements: backend running at http://127.0.0.1:8000
# Usage: Open PowerShell and run `.	ools\e2e_demo.ps1` from repository root

$base = 'http://127.0.0.1:8000'
$sampleImage = "..\data\Ovarian_cysts\simple_cyst\simple_cyst_0001.jpg"

Write-Host "Running E2E demo against $base"

# 1) POST /api/diagnose
$response = Invoke-RestMethod -Uri "$base/api/diagnose" -Method Post -Form @{ image = Get-Item $sampleImage; task = 'cysts'; model_id = 'efficientnet_b0' }
Write-Host "Diagnose response:`n" ($response | ConvertTo-Json -Depth 6)

# 2) POST /api/gradcam -> save file
$gd = Invoke-RestMethod -Uri "$base/api/gradcam" -Method Post -Form @{ image = Get-Item $sampleImage; task = 'cysts'; model_id = 'efficientnet_b0' } -OutFile gradcam_demo.png
if (Test-Path .\gradcam_demo.png) { Write-Host "Saved gradcam_demo.png" }

# 3) Save prediction
$entry = @{ id = "pred-$(Get-Date -UFormat %s)"; patient = @{ id = 'demo-patient' }; thumbnail = $null; draft = $false; raw = $response }
Invoke-RestMethod -Uri "$base/api/save-prediction" -Method Post -Body (ConvertTo-Json $entry) -ContentType 'application/json'
Write-Host "Saved prediction"

# 4) Request PDF report
$predId = $entry.id
Invoke-RestMethod -Uri "$base/api/report?prediction_id=$predId" -Method Get -OutFile demo_report.pdf
if (Test-Path .\demo_report.pdf) { Write-Host "Saved demo_report.pdf" }

Write-Host "E2E demo complete."