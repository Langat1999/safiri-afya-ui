import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use placeholder during build, real URL at runtime
    url: env("DATABASE_URL") || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
