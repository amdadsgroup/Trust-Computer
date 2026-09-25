Add-Type -AssemblyName System.Drawing

$fileBytes = [System.IO.File]::ReadAllBytes('c:\Trust Computer\logo.jpeg')
$ms = New-Object System.IO.MemoryStream($fileBytes, $false)
$bmp = [System.Drawing.Bitmap]::FromStream($ms)

# Let's see if there is text in logo.jpeg or if it's just the circular mark
# In 715x715, what is at the center (357, 357)?
Write-Output "Center pixel (357, 357): $($bmp.GetPixel(357, 357))"
Write-Output "Top (357, 50): $($bmp.GetPixel(357, 50))"
Write-Output "Bottom (357, 650): $($bmp.GetPixel(357, 650))"
Write-Output "Left (50, 357): $($bmp.GetPixel(50, 357))"
Write-Output "Right (650, 357): $($bmp.GetPixel(650, 357))"

$bmp.Dispose()
$ms.Dispose()
