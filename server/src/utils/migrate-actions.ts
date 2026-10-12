import Application, { type IApplication } from "../models/Application.js";
import Action from "../models/Action.js";
import type { QueryFilter } from "mongoose";

// Safe to rerun after a restart: each old application has one unique migration key.
export async function migrateLegacyActions(userId?: string): Promise<void> {
  await Action.init();
  const filter: QueryFilter<IApplication> = {
    ...(userId ? { userId } : {}),
    nextAction: { $exists: true, $ne: "" },
    followUpDate: { $type: "date" },
  };
  const cursor = Application.find(filter).cursor();
  for await (const application of cursor) {
    if (!application.nextAction || !application.followUpDate) continue;
    try {
      await Action.updateOne(
        { legacyApplicationId: application._id },
        { $setOnInsert: {
          userId: application.userId,
          applicationId: application._id,
          legacyApplicationId: application._id,
          title: application.nextAction,
          dueDate: application.followUpDate,
          expiresAt: application.expiresAt,
        } },
        { upsert: true },
      );
    } catch (error) {
      // Another instance may have inserted the action concurrently.
      if (!(typeof error === "object" && error && "code" in error && error.code === 11000)) throw error;
    }
    await Application.updateOne(
      { _id: application._id, userId: application.userId },
      { $unset: { nextAction: 1, followUpDate: 1 } },
    );
  }
}
