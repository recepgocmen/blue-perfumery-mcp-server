import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/blueperfumery";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.error("✅ MCP Server: MongoDB connected successfully");
    console.error(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MCP Server: MongoDB connection error:", error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("MCP Server: Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.error("MCP Server: Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.error("MCP Server: MongoDB connection closed");
  process.exit(0);
});

export default mongoose;


