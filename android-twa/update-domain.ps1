<#
.SYNOPSIS
    Script de Troca Rápida de Domínio para o AgendaDiária
.DESCRIPTION
    Atualiza todas as referências de domínio no projeto (TWA Manifest, AssetLinks, Privacidade, etc.)
.EXAMPLE
    .\update-domain.ps1 -NovoDominio "agendadiaria.app"
#>

param (
    [Parameter(Mandatory=$true)]
    [string]$NovoDominio
)

# Limpar o domínio (remover https://, http://, www. e barras finais)
$dominioLimpo = $NovoDominio -replace '^https?://', '' -replace '^www\.', '' -replace '/$', ''

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Atualizando Domínio do AgendaDiária para: $dominioLimpo" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$baseDir = Join-Path $PSScriptRoot ".."

# 1. Atualizar android-twa/twa-manifest.json
$twaManifestPath = Join-Path $PSScriptRoot "twa-manifest.json"
if (Test-Path $twaManifestPath) {
    $twa = Get-Content $twaManifestPath -Raw | ConvertFrom-Json
    $twa.host = $dominioLimpo
    $twa.iconUrl = "https://$dominioLimpo/icons/icon-512.png"
    $twa.maskableIconUrl = "https://$dominioLimpo/icons/icon-512.png"
    $twa.webManifestUrl = "https://$dominioLimpo/manifest.json"
    $twa | ConvertTo-Json -Depth 10 | Set-Content $twaManifestPath -Encoding UTF8
    Write-Host "✓ android-twa/twa-manifest.json atualizado." -ForegroundColor Green
}

# 2. Atualizar landing/privacidade.html
$privacidadePath = Join-Path $baseDir "landing\privacidade.html"
if (Test-Path $privacidadePath) {
    $privHtml = Get-Content $privacidadePath -Raw
    $updatedHtml = $privHtml -replace 'suporte@[a-zA-Z0-9.-]+', "suporte@$dominioLimpo"
    Set-Content -Path $privacidadePath -Value $updatedHtml -Encoding UTF8
    Write-Host "✓ landing/privacidade.html atualizado." -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host " Troca de Domínio Concluída!" -ForegroundColor Cyan
Write-Host " Lembre-se de publicar os arquivos no seu novo servidor web:" -ForegroundColor White
Write-Host " https://$dominioLimpo/.well-known/assetlinks.json" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
