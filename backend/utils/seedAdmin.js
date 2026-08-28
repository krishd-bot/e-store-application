// Run with: npm run seed
// Creates (or updates) a single admin user from the ADMIN_* variables in .env
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();
await connectDB();

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env first.");
    process.exit(1);
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (admin) {
    admin.role = "admin";
    await admin.save();
    console.log(`Existing user ${ADMIN_EMAIL} promoted to admin.`);
  } else {
    admin = await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }
  process.exit(0);
};

run();
