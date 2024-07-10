## Development With Docker

> [!IMPORTANT]
> FIRST: make sure you make a copy of `./our-code-server/.development.env` and rename to `.env` before developing.

To make development as easy as possible, all services can be started with `docker compose up`.

If you are developing, `docker compose watch` will probably make your life easier. This does the following:
- Watches the `/our-code` folder for changes to client
- Watches the `/our-code-server` folder for changes to server
- It DOES NOT automatically do db migrations
  - I need to find a way to do this automatically on container restart later - for now, in the `/our-code-server` directory run `npm run dev:dbpush` to update your local dev db with your schema changes

You can connect to the services at ports:
- `4200` for Client
- `3000` for Server
- `5432` for Postgres

### DB Migrations
Before making a PR with schema changes please run `npm run dev:migrate` to generate the migration files that will be applied to the production db

Similarly, after pulling updates with schema changes, run `npm run dev:migrate` to apply those migrations to your local dev db