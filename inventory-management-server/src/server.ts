import "dotenv/config";
import { logger } from "better-auth";
import app from "./app.js";
import envConfig from "./config/env.js";

const PORT = envConfig.PORT;

async function main() {
  try {
    app.listen(PORT, () => {
      logger.info(`app is listening to port: ${PORT}`);
    });
  } catch (err) {
    logger.error(
      `failed to connet to database: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }
}

main();
