import "dotenv/config";
import { defineConfig } from "prisma/config";

// Provide fallback for DATABASE_URL during build phase
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
