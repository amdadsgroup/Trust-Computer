Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\1e4af885-fc5c-468d-9f8b-c585b4d61d6b\.user_uploaded\media_1790234960095.jpg"
$brandDir = "c:\Trust Computer\public\brand"

if (-not (Test-Path $brandDir)) {
    New-Item -ItemType Directory -Path $brandDir -Force | Out-Null
}

$fileBytes = [System.IO.File]::ReadAllBytes($srcPath)
$ms = New-Object System.IO.MemoryStream($fileBytes, $false)
$srcBmp = [System.Drawing.Bitmap]::FromStream($ms)

Write-Output "Generating Brand Assets from Official Logo..."

# 1. Save original unmodified image as trust-computer-logo-dark.png and preserve source
$srcBmp.Save("$brandDir\trust-computer-logo-dark.png", [System.Drawing.Imaging.ImageFormat]::Png)
$srcBmp.Save("$brandDir\trust-computer-logo-original.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

# 2. Create Transparent PNG version:
# For every pixel, calculate distance from black (0,0,0) or luminance.
# Since the logo graphics are rich Red (R~233) and rich Blue (B~151), the logo pixels have high color saturation or brightness.
# The background is black (R,G,B close to 0).
$transBmp = New-Object System.Drawing.Bitmap($srcBmp.Width, $srcBmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $srcBmp.Height; $y++) {
    for ($x = 0; $x -lt $srcBmp.Width; $x++) {
        $p = $srcBmp.GetPixel($x, $y)
        $maxVal = [Math]::Max($p.R, [Math]::Max($p.G, $p.B))
        
        if ($maxVal -le 10) {
            # Pure background -> transparent
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($maxVal -lt 40) {
            # Anti-aliasing boundary -> scale alpha
            $alpha = [int](($maxVal - 10) / 30.0 * 255)
            # Normalize color brightness to avoid dark fringes
            $factor = 255.0 / [Math]::Max(1, $maxVal)
            $newR = [Math]::Min(255, [int]($p.R * $factor))
            $newG = [Math]::Min(255, [int]($p.G * $factor))
            $newB = [Math]::Min(255, [int]($p.B * $factor))
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $newR, $newG, $newB))
        } else {
            # Solid logo pixel
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
        }
    }
}

$transBmp.Save("$brandDir\trust-computer-logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Created trust-computer-logo.png"

# 3. Create Logo Mark (Circular Symbol only, x: 0..214, y: 0..214)
$markW = 215
$markH = 215
$markBmp = New-Object System.Drawing.Bitmap($markW, $markH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gMark = [System.Drawing.Graphics]::FromImage($markBmp)
$gMark.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gMark.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gMark.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle(0, 0, $markW, $markH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $markW, $markH)
$gMark.DrawImage($transBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gMark.Dispose()

$markBmp.Save("$brandDir\trust-computer-logo-mark.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Created trust-computer-logo-mark.png"

# 4. Generate Favicon & App Icons from the official Logo Mark
function Create-ResizedIcon($sourceBmp, $size, $outPath) {
    $iconBmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($iconBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($sourceBmp, 0, 0, $size, $size)
    $g.Dispose()
    $iconBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $iconBmp.Dispose()
}

# Favicons & Touch icons
Create-ResizedIcon $markBmp 32 "$brandDir\favicon.png"
Create-ResizedIcon $markBmp 48 "$brandDir\favicon-48.png"
Create-ResizedIcon $markBmp 180 "$brandDir\apple-touch-icon.png"
Create-ResizedIcon $markBmp 192 "$brandDir\icon-192.png"
Create-ResizedIcon $markBmp 512 "$brandDir\icon-512.png"

# Also copy favicon.ico / favicon.png to /public root for standard browser discovery
Copy-Item "$brandDir\favicon.png" "c:\Trust Computer\public\favicon.png" -Force
Copy-Item "$brandDir\apple-touch-icon.png" "c:\Trust Computer\public\apple-touch-icon.png" -Force

# Also update public/images/logo.png and public/images/logo.jpeg
Copy-Item "$brandDir\trust-computer-logo.png" "c:\Trust Computer\public\images\logo.png" -Force

Write-Output "All Brand Assets generated successfully!"

$markBmp.Dispose()
$transBmp.Dispose()
$srcBmp.Dispose()
$ms.Dispose()
