# ============================================
# BACKEND DOCKERFILE - Django + PostgreSQL
# ============================================

FROM python:3.11-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema para PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY backend/requirements.txt .

# Instalar dependencias de Python
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar código del proyecto
COPY backend/ .

# Crear directorio para archivos media
RUN mkdir -p /app/media /app/staticfiles

# Exponer puerto
EXPOSE 8000

# Comando por defecto (se sobrescribe en docker-compose)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
