# ============================================
# QUICK START SCRIPT - ProjectStore
# Django + React + PostgreSQL con Docker
# ============================================

Write-Host "🚀 Iniciando ProjectStore..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "📦 Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Docker Desktop no está corriendo" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop y ejecuta este script nuevamente" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green
Write-Host ""

# 2. Crear .env
if (-not (Test-Path .env)) {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env existe" -ForegroundColor Green
}
Write-Host ""

# 3. Detener contenedores existentes
Write-Host "🛑 Deteniendo contenedores anteriores..." -ForegroundColor Yellow
docker-compose down 2>$null
Write-Host ""

# 4. Construir imágenes
Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Yellow
Write-Host "   (Puede tomar varios minutos la primera vez)" -ForegroundColor Gray
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir imágenes" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imágenes construidas" -ForegroundColor Green
Write-Host ""

# 5. Iniciar servicios
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar servicios" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Servicios iniciados" -ForegroundColor Green
Write-Host ""

# 6. Esperar a que la base de datos esté lista
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    $dbStatus = docker-compose exec -T db pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green
        break
    }
    $attempt++
    Start-Sleep -Seconds 2
    Write-Host "   Intento $attempt/$maxAttempts..." -ForegroundColor Gray
}
if ($attempt -eq $maxAttempts) {
    Write-Host "❌ Timeout esperando PostgreSQL" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Ejecutar migraciones
Write-Host "🔄 Ejecutando migraciones de Django..." -ForegroundColor Yellow
docker-compose exec backend python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al ejecutar migraciones" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
Write-Host ""

# 8. Crear superusuario
Write-Host "👤 ¿Deseas crear un superusuario de Django? (s/n)" -ForegroundColor Yellow
$createSuperuser = Read-Host
if ($createSuperuser -eq 's' -or $createSuperuser -eq 'S') {
    docker-compose exec backend python manage.py createsuperuser
}
Write-Host ""

# 9. Mostrar estado
Write-Host "📊 Estado de los servicios:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# 10. Información de acceso
Write-Host "✅ ¡ProjectStore está listo!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accede a las siguientes URLs:" -ForegroundColor Cyan
Write-Host "   Frontend (React):     http://localhost:5173" -ForegroundColor White
Write-Host "   Backend API:          http://localhost:8000/api" -ForegroundColor White
Write-Host "   Admin Django:         http://localhost:8000/admin" -ForegroundColor White
Write-Host "   API Docs (Swagger):   http://localhost:8000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:             docker-compose logs -f" -ForegroundColor Gray
Write-Host "   Ver logs backend:     docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "   Ver logs frontend:    docker-compose logs -f frontend" -ForegroundColor Gray
Write-Host "   Detener servicios:    docker-compose down" -ForegroundColor Gray
Write-Host "   Reiniciar servicios:  docker-compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Lee MIGRATION_GUIDE.md para migrar el frontend de Supabase a Django" -ForegroundColor Yellow
Write-Host ""
