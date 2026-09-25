Add-Type -AssemblyName System.Drawing

$userUploadedPath = "C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\1e4af885-fc5c-468d-9f8b-c585b4d61d6b\.user_uploaded\media_1790234960095.jpg"
$rootLogoPath = "c:\Trust Computer\logo.jpeg"

function Inspect-Details($path, $label) {
    Write-Output "=== Inspecting $label ==="
    $fileBytes = [System.IO.File]::ReadAllBytes($path)
    $ms = New-Object System.IO.MemoryStream($fileBytes, $false)
    $bmp = [System.Drawing.Bitmap]::FromStream($ms)
    
    $c00 = $bmp.GetPixel(0, 0)
    $cTopRight = $bmp.GetPixel($bmp.Width - 1, 0)
    $cBottomLeft = $bmp.GetPixel(0, $bmp.Height - 1)
    
    Write-Output "Top-Left (0,0): R=$($c00.R), G=$($c00.G), B=$($c00.B)"
    Write-Output "Top-Right: R=$($cTopRight.R), G=$($cTopRight.G), B=$($cTopRight.B)"
    Write-Output "Bottom-Left: R=$($cBottomLeft.R), G=$($cBottomLeft.G), B=$($cBottomLeft.B)"
    
    # Find bounding box of non-background content (assuming black/near-black or white background)
    $minX = $bmp.Width; $maxX = 0
    $minY = $bmp.Height; $maxY = 0
    
    # Also find circular mark bounding box (the leftmost graphic)
    # The circular mark is on the left side, from x=0 to where text begins (roughly x < 250)
    $markMinX = $bmp.Width; $markMaxX = 0
    $markMinY = $bmp.Height; $markMaxY = 0

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $p = $bmp.GetPixel($x, $y)
            # Check if not black background (brightness > 30)
            if ($p.R -gt 35 -or $p.G -gt 35 -or $p.B -gt 35) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
                
                # Check circular mark area (leftmost portion before TRUST text)
                if ($x -lt 230) {
                    if ($x -lt $markMinX) { $markMinX = $x }
                    if ($x -gt $markMaxX) { $markMaxX = $x }
                    if ($y -lt $markMinY) { $markMinY = $y }
                    if ($y -gt $markMaxY) { $markMaxY = $y }
                }
            }
        }
    }
    
    Write-Output "Content Bounding Box: X=[$minX, $maxX], Y=[$minY, $maxY], W=$($maxX - $minX + 1), H=$($maxY - $minY + 1)"
    Write-Output "Logo Mark Bounding Box: X=[$markMinX, $markMaxX], Y=[$markMinY, $markMaxY], W=$($markMaxX - $markMinX + 1), H=$($markMaxY - $markMinY + 1)"
    
    $bmp.Dispose()
    $ms.Dispose()
}

Inspect-Details $userUploadedPath "User Uploaded Logo"
Inspect-Details $rootLogoPath "Root logo.jpeg"
