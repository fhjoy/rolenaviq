import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.JWT_SECRET =
  "rolenaviq-e2e-secret-that-is-long-enough-for-validation";
process.env.CLIENT_URL = "http://127.0.0.1:4173";
process.env.COOKIE_SAME_SITE = "lax";

const mongoServer = await MongoMemoryServer.create();

process.env.MONGODB_URI = mongoServer.getUri();

await mongoose.connect(process.env.MONGODB_URI);

const { default: app } = await import("../src/app.js");

const httpServer = app.listen(5001, "127.0.0.1", () => {
  console.log("RoleNaviq E2E API running on http://127.0.0.1:5001");
});

let shuttingDown = false;

async function shutdown(): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await mongoose.disconnect();
  await mongoServer.stop();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown()
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        console.error("Failed to stop E2E server cleanly:", error);
        process.exit(1);
      });
  });
}
