import { Client, Account, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("699756a8003b594d43f1");

const account = new Account(client);
const databases = new Databases(client);

export const DATABASE_ID = "sprintype-db";
export const HIGHSCORES_COLLECTION_ID = "highscores";

export { client, account, databases };
