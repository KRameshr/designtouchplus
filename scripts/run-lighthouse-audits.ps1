param(
  [string]$ChromePath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$lighthouseCli = Join-Path $projectRoot "node_modules/.bin/lighthouse.cmd"

if (-not (Test-Path -LiteralPath $lighthouseCli)) {
  throw "Lighthouse CLI is missing. Install the existing project development dependencies first."
}

if ([string]::IsNullOrWhiteSpace($ChromePath)) {
  $chromeCommand = Get-Command "chrome.exe" -ErrorAction SilentlyContinue
  if ($chromeCommand) {
    $ChromePath = $chromeCommand.Source
  } else {
    $chromeCandidates = @(
      (Join-Path $env:ProgramFiles "Google/Chrome/Application/chrome.exe"),
      (Join-Path ${env:ProgramFiles(x86)} "Google/Chrome/Application/chrome.exe"),
      (Join-Path $env:LOCALAPPDATA "Google/Chrome/Application/chrome.exe")
    )
    $ChromePath = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  }
}

if ([string]::IsNullOrWhiteSpace($ChromePath) -or -not (Test-Path -LiteralPath $ChromePath)) {
  throw "Chrome was not found. Pass its executable path with -ChromePath."
}

$routes = [ordered]@{
  home = "/"
  about = "/about"
  portfolio = "/portfolio"
  blog = "/blog"
  contact = "/contact"
}

$reportDirectory = Join-Path $projectRoot ("reports/lighthouse/phase5/" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null

foreach ($route in $routes.GetEnumerator()) {
  foreach ($preset in @("mobile", "desktop")) {
    $url = "https://designtouchplus.designtouchplus.workers.dev$($route.Value)"
    $reportBase = Join-Path $reportDirectory "$($route.Key)-$preset"
    $presetArguments = if ($preset -eq "desktop") {
      @("--preset=desktop")
    } else {
      @("--form-factor=mobile")
    }

    Write-Host "Auditing $($route.Key) ($preset)"
    $previousChromePath = $env:CHROME_PATH
    try {
      $env:CHROME_PATH = $ChromePath
      & $lighthouseCli $url `
        @presetArguments `
        "--output=html" `
        "--output=json" `
        "--output-path=$reportBase"

      if ($LASTEXITCODE -ne 0) {
        throw "Lighthouse failed for $($route.Key) ($preset) with exit code $LASTEXITCODE."
      }
    } finally {
      $env:CHROME_PATH = $previousChromePath
    }
  }
}

Write-Host "Reports saved under $reportDirectory"
