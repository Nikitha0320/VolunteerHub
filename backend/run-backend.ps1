param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

Set-Location -Path $PSScriptRoot

$managedEnvVars = @(
  'SPRING_DATASOURCE_URL',
  'SPRING_DATASOURCE_USERNAME',
  'SPRING_DATASOURCE_PASSWORD',
  'APP_JWT_SECRET',
  'APP_JWT_EXPIRATION_MS'
)

# Clear managed vars first so stale values from earlier failed runs do not leak.
foreach ($name in $managedEnvVars) {
  [Environment]::SetEnvironmentVariable($name, $null, 'Process')
}

$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $envFile) {
  Write-Host "Loading environment variables from .env"
  $parsedEnv = @{}

  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $parts = $line -split '=', 2
    if ($parts.Count -eq 2) {
      $key = $parts[0].Trim()
      $value = $parts[1].Trim().Trim('"').Trim("'")
      if ($key) {
        $parsedEnv[$key] = $value
      }
    }
  }

  $requiredEnvVars = @(
    'SPRING_DATASOURCE_URL',
    'SPRING_DATASOURCE_USERNAME',
    'SPRING_DATASOURCE_PASSWORD'
  )

  $missingVars = @()
  foreach ($name in $requiredEnvVars) {
    if (-not $parsedEnv.ContainsKey($name) -or [string]::IsNullOrWhiteSpace($parsedEnv[$name])) {
      $missingVars += $name
    }
  }

  if ($missingVars.Count -gt 0) {
    Write-Host "Missing required environment variables in backend/.env: $($missingVars -join ', ')" -ForegroundColor Red
    Write-Host "Create backend/.env from backend/.env.example and fill real values, then re-run this script." -ForegroundColor Yellow
    exit 1
  }

  $invalidVars = @()
  foreach ($name in $requiredEnvVars + @('APP_JWT_SECRET')) {
    if (-not $parsedEnv.ContainsKey($name)) { continue }
    $value = $parsedEnv[$name]
    if ($value -and ($value.Contains('<') -or $value.Contains('>') -or $value -match 'CHANGE_ME')) {
      $invalidVars += $name
    }
  }

  if ($invalidVars.Count -gt 0) {
    Write-Host "These env vars still have placeholder values in backend/.env: $($invalidVars -join ', ')" -ForegroundColor Red
    Write-Host "Edit backend/.env and replace placeholders with real values before starting." -ForegroundColor Yellow
    exit 1
  }

  foreach ($entry in $parsedEnv.GetEnumerator()) {
    [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process')
  }
}

if (-not [Environment]::GetEnvironmentVariable('APP_JWT_SECRET', 'Process')) {
  Write-Host "APP_JWT_SECRET is not set. Using local development fallback secret from application.properties." -ForegroundColor Yellow
}

$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $processIds = $conn | Select-Object -ExpandProperty OwningProcess -Unique
  Write-Host "Port $Port is in use. Stopping process(es): $($processIds -join ', ')"
  foreach ($procId in $processIds) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Starting backend on port $Port..."
if ($Port -eq 8080) {
  mvn spring-boot:run
} else {
  mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=$Port"
}
