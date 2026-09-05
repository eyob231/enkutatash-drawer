Set-Location "C:\Users\student\Desktop\my\enkutatash-drawer"
$log = "C:\Users\student\Desktop\my\.freebuff\preview-7f694b2c-4fd8-4f0b-b386-826201e46d32.log"
$logErr = "C:\Users\student\Desktop\my\.freebuff\preview-7f694b2c-4fd8-4f0b-b386-826201e46d32.log.err"
$p = Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "node_modules/vite/bin/vite.js","--port","5173" -WorkingDirectory "C:\Users\student\Desktop\my\enkutatash-drawer" -RedirectStandardOutput $log -RedirectStandardError $logErr -WindowStyle Hidden -PassThru
Write-Output $p.Id
