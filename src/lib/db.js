//Import MongoDB client from mongodb package
import { MongoClient } from "mongodb";

// Import development environment checker from SvelteKit
import { dev } from "$app/environment";

// Global variables to store client and database connections
let client;
let db;

// Main function to connect to MongoDB database
export async function connectDB() {
  // Get MongoDB connection string from environment variables
  let MONGODB_URI;

  // Check if we're in development or production mode
  if (dev) {
    // Development mode: use .env file or fallback to default
    MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/todoapp";
  } else {
    // Production mode: must have environment variable
    MONGODB_URI = process.env.MONGODB_URI;
  }

  // Debug: show which URI we're using (helpful for troubleshooting)
  console.log("🔗 Connecting to MongoDB with URI:", MONGODB_URI);

  // Safety check: make sure we have a connection string
  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in environment variables");
  }

  // Only create new connection if one doesn't exist already
  if (!client) {
    try {
      // Create new MongoDB client with connection string
      client = new MongoClient(MONGODB_URI);

      // Actually connect to the MongoDB server
      await client.connect();

      // Select our specific database ('todoapp')
      db = client.db("todoapp");

      // Success message
      console.log("✅ Successfully connected to MongoDB database: todoapp");
    } catch (error) {
      // If connection fails, show error and stop
      console.error("❌ MongoDB connection failed:", error.message);
      throw error;
    }
  }

  // Return the database object so other files can use it
  return db;
}

// Function to close database connection (good practice)
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("🔐 MongoDB connection closed");
  }
}
