$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (!$npm) {
  $npm = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
}
if (!(Test-Path -LiteralPath $npm -PathType Leaf)) {
  throw 'No se encontró npm.cmd. Instala Node.js o agrega npm al PATH.'
}

Set-Location -LiteralPath $root
& $npm run dev
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}