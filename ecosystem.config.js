// pm2 process definition for the API in production. Run from the repo root:
//   pm2 start ecosystem.config.js
// pm2 loads env vars from apps/api/.env itself (via @nestjs/config's
// ConfigModule.forRoot, which reads .env from the process cwd) — nothing
// needs to be duplicated here.
const path = require("path");

module.exports = {
  apps: [
    {
      name: "hms-api",
      script: "dist/main.js",
      cwd: path.join(__dirname, "apps/api"),
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "400M",
    },
  ],
};
