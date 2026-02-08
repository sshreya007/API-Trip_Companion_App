import process = require("process");

export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export const MONGO_URI = process.env.MONGO_URI!;
export const PORT = process.env.PORT || 5050;
