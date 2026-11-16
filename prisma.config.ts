// Prisma 6 loads this file from the repository root only. A config file placed
// in prisma/ is ignored, and once a config file is detected Prisma stops
// auto-loading .env — so DATABASE_URL must be loaded here explicitly.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});