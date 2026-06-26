import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://kesavan:Ammapaiyan%4007@cluster0.wndevcf.mongodb.net/teens_emporium?retryWrites=true&w=majority";
let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase() {
  if (db && client) {
    return { client, db };
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB database successfully.");
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
