param(
  [string]$Database = "orbitek-pets"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backupDirectory = Join-Path $projectRoot "backups"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outputFile = Join-Path $backupDirectory "birx-pets-d1_$timestamp.sql"

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null

Write-Host "Criando backup remoto do banco BIRX Pets..."
Push-Location $projectRoot
try {
  npx wrangler d1 export $Database --remote --output $outputFile
  if (-not (Test-Path -LiteralPath $outputFile)) {
    throw "O arquivo de backup não foi criado."
  }
  Write-Host "Backup concluído: $outputFile"
} finally {
  Pop-Location
}
