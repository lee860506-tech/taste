param(
  [ValidateSet('commercial','licenses')][string]$Source = 'commercial',
  [string]$RegionCode = '11110615',
  [string]$Address = '',
  [ValidateRange(1,100)][int]$Page = 1
)

$envFile = Join-Path $PSScriptRoot '..\.env.local'
if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.local 파일이 없습니다.' }
$line = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^RESTAURANT_SYNC_TOKEN=' } | Select-Object -Last 1
if (-not $line) { throw '.env.local에 RESTAURANT_SYNC_TOKEN을 설정해 주세요.' }
$token = $line.Substring($line.IndexOf('=') + 1).Trim('"', "'")
if (-not $token) { throw 'RESTAURANT_SYNC_TOKEN이 비어 있습니다.' }
if ($Source -eq 'commercial' -and $RegionCode -notmatch '^\d{8}$') { throw '상가정보 동기화에는 8자리 행정동 코드가 필요합니다.' }
if ($Source -eq 'licenses' -and -not $Address.Trim()) { throw '인허가 동기화에는 -Address가 필요합니다.' }

$body = @{ source = $Source; page = $Page }
if ($Source -eq 'commercial') { $body.regionCode = $RegionCode }
else { $body.address = $Address }

Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/restaurants/sync' -Method Post `
  -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' `
  -Body ($body | ConvertTo-Json -Compress)
