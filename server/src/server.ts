import app from "./app.js";

import { connectDatabase } from "./config/database.js";

import { env } from "./config/env.js";
import { migrateLegacyActions } from "./utils/migrate-actions.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await migrateLegacyActions();

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
