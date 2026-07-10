# Autenticación en GitHub (usa ruta completa; no depende del PATH de la terminal)
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
    Write-Host "Instala GitHub CLI: winget install --id GitHub.cli -e"
    exit 1
}
Write-Host "Abriendo autenticación en el navegador..."
& $gh auth login -h github.com -p https -w
