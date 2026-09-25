Add-Type -AssemblyName System.Drawing

function Get-ElementBounds($path) {
    $fileBytes = [System.IO.File]::ReadAllBytes($path)
    $ms = New-Object System.IO.MemoryStream($fileBytes, $false)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)
    
    $redMinX = 9999; $redMaxX = 0; $redMinY = 9999; $redMaxY = 0
    $blueMinX = 9999; $blueMaxX = 0; $blueMinY = 9999; $blueMaxY = 0

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # Red pixel
            if ($p.R -gt 150 -and $p.G -lt 80 -and $p.B -lt 80) {
                if ($x -lt $redMinX) { $redMinX = $x }
                if ($x -gt $redMaxX) { $redMaxX = $x }
                if ($y -lt $redMinY) { $redMinY = $y }
                if ($y -gt $redMaxY) { $redMaxY = $y }
            }
            # Blue pixel
            if ($p.B -gt 130 -and $p.B -gt ($p.R + 50)) {
                if ($x -lt $blueMinX) { $blueMinX = $x }
                if ($x -gt $blueMaxX) { $blueMaxX = $x }
                if ($y -lt $blueMinY) { $blueMinY = $y }
                if ($y -gt $blueMaxY) { $blueMaxY = $y }
            }
        }
    }
    
    Write-Output "File: $path"
    Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
    Write-Output "Red Bounds: X=[$redMinX, $redMaxX], Y=[$redMinY, $redMaxY]"
    Write-Output "Blue Bounds: X=[$blueMinX, $blueMaxX], Y=[$blueMinY, $blueMaxY]"
    
    $bmp.Dispose()
    $ms.Dispose()
}

Get-ElementBounds "C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\1e4af885-fc5c-468d-9f8b-c585b4d61d6b\.user_uploaded\media_1790234960095.jpg"
Get-ElementBounds "c:\Trust Computer\logo.jpeg"
