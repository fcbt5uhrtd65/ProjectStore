# ============================================
# FRONTEND DOCKERFILE - React + Vite
# ============================================

FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar package files
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY frontend/ .

# Exponer puerto de Vite
EXPOSE 5173

# Comando para desarrollo con HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
