import "dotenv/config";
import { defineConfig } from "prisma/config";

// Provide fallback for DATABASE_URL during build phase
// For Supabase: Use Session pooler (port 6543) with pgbouncer for DATABASE_URL
// Use Transaction pooler (port 5432) for DIRECT_URL (migrations)
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
    directUrl: directUrl,
  },
});
