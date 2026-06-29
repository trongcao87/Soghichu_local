# build-desktop.ps1

Write-Host "--- BAT DAU DONG GOI UNG DUNG SO GHI CHU ---" -ForegroundColor Cyan

# 0. Stop any running instances of the app to release file locks
Write-Host "0. Dung cac ung dung Soghichu dang chay..." -ForegroundColor Yellow
Stop-Process -Name Soghichu -Force -ErrorAction SilentlyContinue
Stop-Process -Name electron -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1 # Wait for process locks to release

# 1. Clean previous build folders (keeping dist if it exists)
Write-Host "1. Don dep thu muc cu..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist-desktop -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force test-extract-dir, test-extract-dir-ps -ErrorAction SilentlyContinue

# 2. Build React App
Write-Host "2. Build ung dung React..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Build React gap loi bo nho (Memory Limit)!" -ForegroundColor Yellow
    if (Test-Path "dist\index.html") {
        Write-Host "Phat hien thu muc build cu 'dist/index.html'. Tiep tuc dong goi bang ban build cu nay..." -ForegroundColor Green
    } else {
        Write-Host "Loi: Build React that bai va khong co thu muc build cu!" -ForegroundColor Red
        exit 1
    }
}

# 3. Create dist-desktop folder
Write-Host "3. Khoi tao thu muc dong goi..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path dist-desktop -Force | Out-Null

# 4. Extract Electron base
Write-Host "4. Giai nen Electron..." -ForegroundColor Yellow
$zipPath = "$env:USERPROFILE\AppData\Local\electron\Cache\electron-v31.7.7-win32-x64.zip"
if (-not (Test-Path $zipPath)) {
    $zipPath = "$env:USERPROFILE\AppData\Local\electron-builder\Cache\electron\electron-v31.7.7-win32-x64.zip"
}
if (-not (Test-Path $zipPath)) {
    Write-Host "Loi: Khong tim thay file zip Electron Cache!" -ForegroundColor Red
    exit 1
}
Write-Host "Su dung file zip: $zipPath" -ForegroundColor Gray
Expand-Archive -Path $zipPath -DestinationPath dist-desktop -Force

# 5. Create app resource folder
Write-Host "5. Copy tai nguyen ung dung vao resources/app..." -ForegroundColor Yellow
$appDir = "dist-desktop\resources\app"
New-Item -ItemType Directory -Path $appDir -Force | Out-Null
Copy-Item -Recurse -Force dist "$appDir\dist"
Copy-Item -Force main.js "$appDir\main.js"

# Write app's package.json
$pkgContent = @'
{
  "name": "soghichu",
  "version": "1.0.0",
  "main": "main.js"
}
'@
Set-Content -Path "$appDir\package.json" -Value $pkgContent -Encoding UTF8

# 6. Rename electron.exe to Soghichu.exe
Write-Host "6. Doi ten file thuc thi thanh Soghichu.exe..." -ForegroundColor Yellow
if (Test-Path "dist-desktop\electron.exe") {
    Rename-Item -Path dist-desktop\electron.exe -NewName Soghichu.exe
}

# 7. Create Shortcut on Desktop
Write-Host "7. Tao Shortcut ngoai Desktop..." -ForegroundColor Yellow
$desktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$shortcutPath = [System.IO.Path]::Combine($desktopPath, "Soghichu.lnk")
$targetPath = "D:\Vibecode\Soghichu\dist-desktop\Soghichu.exe"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = "D:\Vibecode\Soghichu\dist-desktop"
$shortcut.Description = "So ghi chu cong viec ca nhan"
$shortcut.IconLocation = "$targetPath,0"
$shortcut.Save()

Write-Host "--- DONG GOI THANH CONG! ---" -ForegroundColor Green
Write-Host "Shortcut da duoc tao tai: $shortcutPath" -ForegroundColor Green
