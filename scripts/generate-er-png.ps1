Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path $root "docs\diagrama-er.png"

$width = 1500
$height = 950
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(248, 250, 252))

$fontTitle = New-Object System.Drawing.Font "Arial", 16, ([System.Drawing.FontStyle]::Bold)
$fontTable = New-Object System.Drawing.Font "Arial", 12, ([System.Drawing.FontStyle]::Bold)
$fontText = New-Object System.Drawing.Font "Arial", 10
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(52, 64, 84)), 2
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(71, 84, 103)), 2
$arrowCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5
$linePen.CustomEndCap = $arrowCap

function Draw-Table {
  param(
    [int]$X,
    [int]$Y,
    [int]$W,
    [int]$H,
    [string]$Title,
    [string[]]$Rows,
    [System.Drawing.Color]$Fill,
    [System.Drawing.Color]$Border
  )

  $brush = New-Object System.Drawing.SolidBrush $Fill
  $borderPen = New-Object System.Drawing.Pen $Border, 2
  $graphics.FillRectangle($brush, $X, $Y, $W, $H)
  $graphics.DrawRectangle($borderPen, $X, $Y, $W, $H)
  $graphics.DrawString($Title, $fontTable, [System.Drawing.Brushes]::Black, ($X + 14), ($Y + 12))
  $graphics.DrawLine($borderPen, $X, ($Y + 44), ($X + $W), ($Y + 44))

  $rowY = $Y + 56
  foreach ($row in $Rows) {
    $graphics.DrawString($row, $fontText, [System.Drawing.Brushes]::Black, ($X + 14), $rowY)
    $rowY += 24
  }
}

$graphics.DrawString("Diagrama entidad-relacion - Gestion de envios", $fontTitle, [System.Drawing.Brushes]::Black, 40, 30)

Draw-Table 70 110 320 180 "contactos" @(
  "PK id BIGSERIAL",
  "nombre VARCHAR(120) NOT NULL",
  "documento VARCHAR(40) NOT NULL",
  "telefono VARCHAR(40) NOT NULL",
  "created_at TIMESTAMP NOT NULL"
) ([System.Drawing.Color]::FromArgb(234, 241, 255)) ([System.Drawing.Color]::FromArgb(49, 93, 182))

Draw-Table 70 420 320 160 "direcciones" @(
  "PK id BIGSERIAL",
  "direccion VARCHAR(180) NOT NULL",
  "ciudad VARCHAR(80) NOT NULL",
  "created_at TIMESTAMP NOT NULL"
) ([System.Drawing.Color]::FromArgb(234, 248, 238)) ([System.Drawing.Color]::FromArgb(56, 102, 65))

Draw-Table 530 130 430 390 "envios" @(
  "PK id BIGSERIAL",
  "numero_guia VARCHAR(30) UNIQUE",
  "FK remitente_id -> contactos.id",
  "FK destinatario_id -> contactos.id",
  "FK direccion_origen_id -> direcciones.id",
  "FK direccion_destino_id -> direcciones.id",
  "peso_kg NUMERIC(10,2) NOT NULL",
  "tipo_servicio VARCHAR(20) NOT NULL",
  "estado_actual VARCHAR(40) NOT NULL",
  "fecha_estimada_entrega DATE NOT NULL",
  "fecha_registro TIMESTAMP NOT NULL",
  "fecha_ultima_actualizacion TIMESTAMP NOT NULL"
) ([System.Drawing.Color]::FromArgb(255, 248, 231)) ([System.Drawing.Color]::FromArgb(183, 121, 31))

Draw-Table 1100 210 330 230 "eventos_logisticos" @(
  "PK id BIGSERIAL",
  "FK envio_id -> envios.id",
  "fecha_hora TIMESTAMP NOT NULL",
  "tipo_evento VARCHAR(40) NOT NULL",
  "estado_resultante VARCHAR(40)",
  "ubicacion VARCHAR(120) NOT NULL",
  "detalle VARCHAR(250)"
) ([System.Drawing.Color]::FromArgb(255, 241, 240)) ([System.Drawing.Color]::FromArgb(180, 35, 24))

$graphics.DrawLine($linePen, 530, 230, 390, 190)
$graphics.DrawString("N:1 remitente/destinatario", $fontText, [System.Drawing.Brushes]::Black, 390, 175)

$graphics.DrawLine($linePen, 530, 410, 390, 500)
$graphics.DrawString("N:1 origen/destino", $fontText, [System.Drawing.Brushes]::Black, 390, 475)

$graphics.DrawLine($linePen, 960, 325, 1100, 325)
$graphics.DrawString("1:N eventos", $fontText, [System.Drawing.Brushes]::Black, 980, 295)

$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
