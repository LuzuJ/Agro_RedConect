# ==========================================
# Script para generar Keystore de Produccion
# ==========================================
# EJECUTAR SOLO UNA VEZ

Write-Host "[*] Generando Keystore de Produccion para AgroCacao IA" -ForegroundColor Green
Write-Host ""

# Verificar si ya existe
if (Test-Path "android/app/release.keystore") {
    Write-Host "[!] Ya existe un keystore de produccion" -ForegroundColor Yellow
    $respuesta = Read-Host "Quieres sobreescribirlo? (s/N)"
    if ($respuesta -ne "s") {
        Write-Host "[X] Cancelado" -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "[i] Informacion del Keystore:" -ForegroundColor Cyan
Write-Host "   Alias: agrocacao-key"
Write-Host "   Validez: 10000 dias (~27 años)"
Write-Host "   Algoritmo: RSA 2048 bits"
Write-Host ""

# Solicitar datos
$nombre = Read-Host "Nombre completo"
$organizacion = Read-Host "Organizacion/Universidad"
$ciudad = Read-Host "Ciudad"
$pais = Read-Host "Pais (codigo de 2 letras, ej: EC)"
$password = Read-Host "Contraseña del keystore (minimo 6 caracteres)" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

if ($passwordText.Length -lt 6) {
    Write-Host "[X] La contraseña debe tener al menos 6 caracteres" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "[+] Generando keystore..." -ForegroundColor Cyan

# Generar keystore
$keytoolPath = Get-Command keytool -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $keytoolPath) {
    # Buscar keytool en instalaciones comunes de Java
    $javaPaths = @(
        "C:\Program Files\Java",
        "C:\Program Files (x86)\Java"
    )
    foreach ($basePath in $javaPaths) {
        if (Test-Path $basePath) {
            $found = Get-ChildItem -Path $basePath -Recurse -Filter "keytool.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $keytoolPath = $found.FullName
                break
            }
        }
    }
}

if ($keytoolPath) {
    Write-Host "[+] Usando keytool: $keytoolPath" -ForegroundColor Cyan
    & $keytoolPath -genkeypair -v `
        -storetype PKCS12 `
        -keystore android/app/release.keystore `
        -alias agrocacao-key `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass $passwordText `
        -keypass $passwordText `
        -dname "CN=$nombre, OU=$organizacion, L=$ciudad, C=$pais"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Keystore generado exitosamente en: android/app/release.keystore" -ForegroundColor Green
        Write-Host ""
        Write-Host "[!] GUARDA ESTA INFORMACION EN UN LUGAR SEGURO:" -ForegroundColor Yellow
        Write-Host "   Archivo: android/app/release.keystore"
        Write-Host "   Alias: agrocacao-key"
        Write-Host "   Contraseña: $passwordText"
        Write-Host ""
        Write-Host "[!] NUNCA compartas el keystore ni la contraseña en GitHub" -ForegroundColor Red
        Write-Host "[!] Si pierdes el keystore, NO podras actualizar la app en Play Store" -ForegroundColor Red
        Write-Host ""
        
        # Crear archivo de propiedades
        $propsContent = @"
storeFile=release.keystore
keyAlias=agrocacao-key
storePassword=$passwordText
keyPassword=$passwordText
"@
        
        $propsContent | Out-File -FilePath "android/app/keystore.properties" -Encoding UTF8
        Write-Host "[OK] Archivo de propiedades creado: android/app/keystore.properties" -ForegroundColor Green
        Write-Host ""
        Write-Host "[GO] Ya puedes ejecutar: npm run build:release" -ForegroundColor Green
    } else {
        Write-Host "[X] Error al generar keystore" -ForegroundColor Red
    }
} else {
    Write-Host "[X] No se encontro 'keytool'. Asegurate de tener Java JDK instalado" -ForegroundColor Red
    Write-Host "   Descarga Java: https://adoptium.net/" -ForegroundColor Yellow
}

