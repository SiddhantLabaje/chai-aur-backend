import dotenv from "dotenv";

// Load .env FIRST
dotenv.config({
    path: "./.env",
});

import mongoose from "mongoose";
import connectDB from "./db/db.js";

// Dynamically import app AFTER dotenv is loaded
const { default: app } = await import("./app.js");

console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("Mongo db Connection failed !!!", error);
});