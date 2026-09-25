# Automated GitHub & Vercel Update Script for Trust Computer

$gitCmd = "C:\Users\NEED ELECTRO\bin\git\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    $gitCmd = "git"
}

$commitMsg = if ($args.Count -gt 0) { $args -join " " } else { "update: production configuration and sync" }

Write-Host "==> Staging changes..." -ForegroundColor Cyan
& $gitCmd add .

$status = & $gitCmd status --porcelain
if ($status) {
    Write-Host "==> Committing updates: $commitMsg..." -ForegroundColor Cyan
    & $gitCmd commit -m "$commitMsg"
} else {
    Write-Host "==> No new local changes to commit." -ForegroundColor Yellow
}

Write-Host "==> Pulling latest remote changes..." -ForegroundColor Cyan
& $gitCmd pull --rebase origin main

Write-Host "==> Pushing to GitHub (origin main)..." -ForegroundColor Cyan
& $gitCmd push origin main

Write-Host "==> Done! Vercel will automatically deploy your latest updates." -ForegroundColor Green

