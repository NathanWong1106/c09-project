## Development With Docker

> [!IMPORTANT]
> FIRST: make sure you make a copy of `./our-code-server/.development.env` and rename to `.env` before developing.

To make development as easy as possible, all services can be started with `docker compose up`.

If you are developing, `docker compose watch` will probably make your life easier. This does the following:
- Watches the `/our-code` folder for changes to client
- Watches the `/our-code-server` folder for changes to server
- It DOES NOT automatically do db migrations - for that please restart the containers and rerun `docker compose up` or `docker compose watch`
  - You can also manually run the migration with `npx prisma migrate dev`

You can connect to the services at ports:
- `4200` for Client
- `3000` for Server
- `5432` for Postgres

#### TODOS:
All the dockerfiles and compose files are currently configured for development. When we deploy we need to create new `Dockerfile.prod` and `compose.prod.yaml` files.