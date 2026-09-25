Add-Type -AssemblyName System.Drawing

function Test-LogoContent($path, $label) {
    Write-Output "=== $label ==="
    $fileBytes = [System.IO.File]::ReadAllBytes($path)
    $ms = New-Object System.IO.MemoryStream($fileBytes, $false)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)
    
    # Check pixels across lines
    $redPixels = 0
    $bluePixels = 0
    $whitePixels = 0
    $blackPixels = 0
    
    for ($y = 0; $y -lt $bmp.Height; $y += 5) {
        for ($x = 0; $x -lt $bmp.Width; $x += 5) {
            $p = $bmp.GetPixel($x, $y)
            if ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240) { $whitePixels++ }
            elseif ($p.R -lt 25 -and $p.G -lt 25 -and $p.B -lt 25) { $blackPixels++ }
            elseif ($p.R -gt 150 -and $p.G -lt 80 -and $p.B -lt 80) { $redPixels++ }
            elseif ($p.B -gt 130 -and $p.B -gt ($p.R + 50)) { $bluePixels++ }
        }
    }
    
    Write-Output "White: $whitePixels, Black: $blackPixels, Red: $redPixels, Blue: $bluePixels"
    $bmp.Dispose()
    $ms.Dispose()
}

Test-LogoContent "C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\1e4af885-fc5c-468d-9f8b-c585b4d61d6b\.user_uploaded\media_1790234960095.jpg" "Uploaded Media"
Test-LogoContent "c:\Trust Computer\logo.jpeg" "c:\Trust Computer\logo.jpeg"
