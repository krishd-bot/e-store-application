import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import connectDB from "./config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

   const existingAdmin = await User.findOne({
  email: process.env.ADMIN_EMAIL.toLowerCase(),
});

if (existingAdmin) {
  existingAdmin.name = process.env.ADMIN_NAME;
  existingAdmin.password = process.env.ADMIN_PASSWORD;
  existingAdmin.role = "admin";
  existingAdmin.isActive = true;

  await existingAdmin.save();

  console.log(`Admin updated: ${existingAdmin.email}`);
  process.exit(0);
}

    const admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      isActive: true,
    });

    console.log(`Admin created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};

createAdmin();