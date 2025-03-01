import cron from "node-cron";
import usermodel from "../../DB/models/user.model.js";

const deleteExpiredOtps = async () => {
  try {
    const now = new Date();

    await usermodel.updateMany(
      {},
      { $pull: { Otp: { expiresAt: { $lt: now } } } }
    );

    console.log(`[CRON JOB] Expired OTPs deleted at ${now.toISOString()}`);
  } catch (error) {
    console.error(`[CRON JOB] Error deleting expired OTPs: ${error.message}`);
  }
};

cron.schedule("0 */6 * * *", deleteExpiredOtps, {
  scheduled: true,
  timezone: "UTC",
});

console.log("[CRON JOB] Scheduled to run every 6 hours.");
