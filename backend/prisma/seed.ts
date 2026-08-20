// Entrypoint for `npm run db:seed` (backend/package.json's "prisma.seed" config).
// Delegates to prisma/seeds/*; add new seed modules here as they're introduced.
// dotenv/config: unlike `prisma migrate`/`generate`, a bare `tsx` run doesn't
// read prisma.config.ts, so DATABASE_URL needs loading here too.
import 'dotenv/config';
import './seeds/seed-message-templates.js';
