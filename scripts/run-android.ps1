# Configura JDK y Android SDK para builds locales en Windows, luego ejecuta expo run:android.
$ErrorActionPreference = "Stop"

$JbrCandidates = @(
  "$env:ProgramFiles\Android\Android Studio\jbr",
  "${env:ProgramFiles(x86)}\Android\Android Studio\jbr",
  "$env:LOCALAPPDATA\Programs\Android\Android Studio\jbr"
)

$JavaHome = $JbrCandidates | Where-Object { Test-Path "$_\bin\java.exe" } | Select-Object -First 1
if (-not $JavaHome) {
  Write-Error "No se encontró Java (JBR de Android Studio). Instala Android Studio o JDK 17+."
}

$SdkDir = "$env:LOCALAPPDATA\Android\Sdk"
if (-not (Test-Path $SdkDir)) {
  Write-Error "No se encontró Android SDK en $SdkDir. Abre Android Studio y completa el setup del SDK."
}

$env:JAVA_HOME = $JavaHome
$env:ANDROID_HOME = $SdkDir
$env:ANDROID_SDK_ROOT = $SdkDir
$env:PATH = "$JavaHome\bin;$SdkDir\platform-tools;$SdkDir\emulator;$env:PATH"

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$AndroidDir = Join-Path $ProjectRoot "android"
$LocalProps = Join-Path $AndroidDir "local.properties"
$GradleProps = Join-Path $AndroidDir "gradle.properties"

if (Test-Path $AndroidDir) {
  $sdkEscaped = ($SdkDir -replace '\\', '/')
  Set-Content -Path $LocalProps -Value "sdk.dir=$sdkEscaped`n" -Encoding ASCII

  $javaEscaped = ($JavaHome -replace '\\', '/')
  $gradleContent = Get-Content $GradleProps -Raw -ErrorAction SilentlyContinue
  if ($gradleContent -notmatch 'org\.gradle\.java\.home=') {
    Add-Content -Path $GradleProps -Value "`norg.gradle.java.home=$javaEscaped"
  }

  $AppJsonPath = Join-Path $ProjectRoot "app.json"
  if (Test-Path $AppJsonPath) {
    $AppConfig = Get-Content $AppJsonPath -Raw | ConvertFrom-Json
    $AppName = $AppConfig.expo.name
    $StringsXml = Join-Path $AndroidDir "app\src\main\res\values\strings.xml"
    if (Test-Path $StringsXml) {
      $StringsContent = Get-Content $StringsXml -Raw
      $StringsContent = $StringsContent -replace '(<string name="app_name">)[^<]*(</string>)', "`${1}$AppName`${2}"
      Set-Content -Path $StringsXml -Value $StringsContent -Encoding ASCII
    }
    $SettingsGradle = Join-Path $AndroidDir "settings.gradle"
    if (Test-Path $SettingsGradle) {
      $SettingsContent = Get-Content $SettingsGradle -Raw
      $SettingsContent = $SettingsContent -replace "rootProject\.name = '[^']*'", "rootProject.name = '$AppName'"
      $SettingsContent = $SettingsContent.TrimStart([char]0xFEFF)
      [System.IO.File]::WriteAllText($SettingsGradle, $SettingsContent, (New-Object System.Text.UTF8Encoding $false))
    }
  }
}

Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"

# Avoid interactive "port in use" prompts when Metro is already running.
$env:CI = "1"

Set-Location $ProjectRoot
npx expo run:android @args
