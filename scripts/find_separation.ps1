Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\NEED ELECTRO\.gemini\antigravity-ide\brain\1e4af885-fc5c-468d-9f8b-c585b4d61d6b\.user_uploaded\media_1790234960095.jpg"
$fileBytes = [System.IO.File]::ReadAllBytes($srcPath)
$ms = New-Object System.IO.MemoryStream($fileBytes, $false)
$srcBmp = [System.Drawing.Bitmap]::FromStream($ms)

Write-Output "Source Dimensions: $($srcBmp.Width) x $($srcBmp.Height)"

# Let's inspect where the circle ends and where the word 'TRUST' begins
# We test column by column for x between 180 and 260
for ($x = 180; $x -le 250; $x += 5) {
    $coloredPixels = 0
    for ($y = 0; $y -lt $srcBmp.Height; $y++) {
        $p = $srcBmp.GetPixel($x, $y)
        if ($p.R -gt 35 -or $p.G -gt 35 -or $p.B -gt 35) {
            $coloredPixels++
        }
    }
    Write-Output "Column X=$x has $coloredPixels colored pixels"
}

$srcBmp.Dispose()
$ms.Dispose()
