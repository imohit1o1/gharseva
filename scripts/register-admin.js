import { AuthService } from "../modules/auth/auth.service.js";
import { connectDB } from "./../db/index.db.js";
import { RoleConstants } from "../constants.js";
import mongoose from "mongoose";

async function createAdmin() {
    try {
        await connectDB.connect();

        const adminData = {
            email: "admin@gharseva.com",
            password: "Admin@1234@"
        };

        console.log("Registering admin...");
        const result = await AuthService.register(adminData, RoleConstants.ADMIN);

        console.log("Admin registered successfully!");
        console.log("User ID:", result.user._id);
        console.log("Email:", result.user.email);
        console.log("Role:", result.user.role);

    } catch (error) {
        console.error("Error registering admin:", error.message);
        if (error.message.includes("already exists")) {
            console.log("An admin with this email already exists.");
        }
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

createAdmin();
