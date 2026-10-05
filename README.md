# Cápsula: monorepo en Render

App de notas: **React (Vite)** + **Express** + **PostgreSQL**.

```
.
├── backend/            API Express (Dockerfile)
├── frontend/           React + Vite (Dockerfile con nginx)
├── docker-compose.yml  Levanta db + backend + frontend en local
└── render.yaml         Blueprint para Render
```

## Local

```bash
docker compose up --build
```
- Front: http://localhost:8081
- API: http://localhost:3000/health
- Postgres: localhost (solo dentro de la red de compose)

## Desplegar en Render

1. Sube el repo a GitHub.
2. En Render: **New → Blueprint** y elige el repo. Render lee `render.yaml` y crea la BD, el backend y el frontend.
3. Render te pedirá dos variables (`sync: false`). Como las URLs se conocen recién al crear los servicios:
   - `VITE_API_URL` (frontend) → `https://capsula-backend.onrender.com`
   - `CORS_ORIGIN` (backend) → `https://capsula-frontend.onrender.com`
   (ajusta los nombres si Render les asignó otra URL).
4. Si cambias `VITE_API_URL` después, haz **Manual Deploy** del frontend: Vite la incrusta al compilar.

Notas:
- `DATABASE_URL` se conecta sola con `fromDatabase`.
- El backend escucha en `process.env.PORT` (Render lo inyecta).
- Plan free: el backend se duerme tras inactividad y la BD free expira a los 30 días.
