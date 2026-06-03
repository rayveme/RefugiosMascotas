#!/usr/bin/env bash
# ============================================================
# deploy.sh — Script de despliegue para el VPS
#
# Uso:
#   chmod +x deploy.sh
#   ./deploy.sh            → despliegue normal (pull + rebuild + restart)
#   ./deploy.sh --migrate  → también ejecuta migraciones Alembic
#   ./deploy.sh --logs     → muestra logs tras iniciar
# ============================================================

set -euo pipefail

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
RUN_MIGRATE=false
SHOW_LOGS=false

for arg in "$@"; do
  case "$arg" in
    --migrate) RUN_MIGRATE=true ;;
    --logs)    SHOW_LOGS=true ;;
  esac
done

echo ""
echo "🐾 RefugiosMascotas — Despliegue en producción"
echo "================================================"

# 1. Obtener última versión del código
echo ""
echo "📥 Actualizando código..."
git pull --ff-only

# 2. Reconstruir imágenes y levantar servicios
echo ""
echo "🔨 Reconstruyendo y reiniciando servicios..."
$COMPOSE up -d --build --remove-orphans

# 3. Esperar a que el backend esté listo
echo ""
echo "⏳ Esperando que el backend levante..."
max_attempts=30
attempt=0
until docker compose exec -T backend curl -fs http://localhost:8000/health > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ El backend no levantó después de ${max_attempts}s. Revisa los logs:"
    $COMPOSE logs --tail=40 backend
    exit 1
  fi
  sleep 2
done
echo "✅ Backend listo"

# 4. Migraciones Alembic (solo si se pide con --migrate)
if [ "$RUN_MIGRATE" = true ]; then
  echo ""
  echo "📦 Ejecutando migraciones de base de datos..."
  docker compose exec -T backend sh -c "cd /app && alembic upgrade head"
  echo "✅ Migraciones aplicadas"
fi

# 5. Mostrar estado
echo ""
echo "📊 Estado de los servicios:"
$COMPOSE ps

# 6. Logs opcionales
if [ "$SHOW_LOGS" = true ]; then
  echo ""
  echo "📋 Últimos logs:"
  $COMPOSE logs --tail=50
fi

echo ""
echo "✅ Despliegue completado"
echo ""
echo "🔗 Backend: https://api.tudominio.com"
echo "🔗 Frontend: https://tu-app.vercel.app"
echo ""
echo "💡 Primera vez? Crea el admin con:"
echo "   curl -X POST https://api.tudominio.com/auth/register/admin \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"email\":\"admin@tudominio.com\",\"password\":\"...\",\"full_name\":\"Admin\",\"secret_code\":\"TU_ADMIN_SECRET\"}'"
echo ""
