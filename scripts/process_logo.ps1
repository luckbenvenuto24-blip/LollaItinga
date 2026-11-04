Add-Type -AssemblyName System.Drawing
$srcPath = "C:/Users/Cliente/.gemini/antigravity/brain/ed7f2b6a-60d5-4a66-873c-855ed506ea21/.user_uploaded/media_1793761945747_0914d681.png"
$src = [System.Drawing.Bitmap]::new($srcPath)
$newW = 480
$newH = [int]($src.Height * ($newW / $src.Width))
$dest = New-Object System.Drawing.Bitmap($newW, $newH)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($src, 0, 0, $newW, $newH)
$dest.Save("assets/marca/logo-lolla.png", [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Save("assets/marca/logo-lolla.webp", [System.Drawing.Imaging.ImageFormat]::Png)
$src.Dispose()
$dest.Dispose()
$g.Dispose()
Write-Host "Success! File size:" (Get-Item "assets/marca/logo-lolla.png").Length
