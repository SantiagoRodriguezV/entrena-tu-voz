# Script para subir el proyecto a GitHub
# Refresca PATH por si la terminal se abrió antes de instalar GitHub CLI

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Refrescar PATH (la terminal de Expo suele tener PATH antiguo)
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
    $ghCmd = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghCmd) { $gh = $ghCmd.Source }
    else {
        Write-Host "GitHub CLI no encontrado. Instálalo con:"
        Write-Host "  winget install --id GitHub.cli -e"
        exit 1
    }
}

Write-Host "Usando: $gh"
Write-Host "Verificando autenticación..."
& $gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Primero autentícate (se abrirá el navegador):"
    Write-Host "  & `"$gh`" auth login -h github.com -p https -w"
    Write-Host ""
    Write-Host "O ejecuta este script de nuevo después de autenticarte."
    exit 1
}

Write-Host "Creando repositorio y subiendo..."
& $gh repo create entrena-tu-voz --public --source=. --remote=origin --push --description "Prototipo académico de app de aprendizaje vocal (Expo 57)"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Listo! Repositorio: https://github.com/srodriguez-v/entrena-tu-voz"
}
