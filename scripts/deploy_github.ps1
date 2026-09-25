# Automated GitHub & Vercel Update Script for Trust Computer

$gitCmd = "C:\Users\NEED ELECTRO\bin\git\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    $gitCmd = "git"
}

$commitMsg = if ($args.Count -gt 0) { $args -join " " } else { "update: site content and language improvements" }

Write-Host "==> Staging changes..." -ForegroundColor Cyan
& $gitCmd add .

Write-Host "==> Committing updates..." -ForegroundColor Cyan
& $gitCmd commit -m "$commitMsg"

Write-Host "==> Pushing to GitHub (origin main)..." -ForegroundColor Cyan
& $gitCmd push origin main

Write-Host "==> Done! Vercel will automatically deploy your latest updates." -ForegroundColor Green
