# syntax=docker/dockerfile:1.6
# Imagen de desarrollo: Vite con HMR. Pensada para docker-compose en local.
# Para producción se despliega a Vercel directamente desde el repo (no usa este Dockerfile).
FROM node:20-alpine

WORKDIR /app

# Solo copiamos package.json (NO el lockfile): Vite 8 / rolldown usa
# `optionalDependencies` por plataforma, y un lockfile generado en Windows
# excluye el binding linux-musl que necesita Alpine en runtime.
COPY package.json ./
RUN npm install --include=optional

# Código (en compose se monta el volumen encima para HMR).
COPY . .

EXPOSE 5173

# `--host 0.0.0.0` para que Vite escuche fuera del contenedor.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
