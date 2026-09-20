import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, afterEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  "rolenaviq-test-secret-that-is-long-enough-for-validation";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.COOKIE_SAME_SITE = "lax";
process.env.PORT = "5001";

const mongoServer = await MongoMemoryServer.create();

process.env.MONGODB_URI = mongoServer.getUri();

await mongoose.connect(process.env.MONGODB_URI);

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(
    collections.map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
