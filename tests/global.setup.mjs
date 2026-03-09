import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

const TEST_DB = "onlineBankingDB";
const MONGO_URL = "mongodb://127.0.0.1:27017";

export default async function globalSetup() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();

  const db = client.db(TEST_DB);

  // Reset DB (TEST DB فقط)
  await db.dropDatabase();

  const usersCol = db.collection("users");
  const cardsCol = db.collection("cards");

  const now = new Date();
  const passwordPlain = "Passw0rd!123";
  const pinPlain = "1234";
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);
  const hashedPin = await bcrypt.hash(pinPlain, 10);

  // Seed 2 users
  const userA = {
    firstName: "Test",
    lastName: "Sender",
    nationalId: "11111111111111",
    username: "test_sender",
    email: "test_sender@example.com",
    phone: "01000000001",
    password: hashedPassword,
    dob: new Date("2000-01-01"),
    balance: 10000,
    createdAt: now,
    updatedAt: now
  };

  const userB = {
    firstName: "Test",
    lastName: "Receiver",
    nationalId: "22222222222222",
    username: "test_receiver",
    email: "test_receiver@example.com",
    phone: "01000000002",
    password: hashedPassword,
    dob: new Date("2000-01-01"),
    balance: 10000,
    createdAt: now,
    updatedAt: now
  };

  const aRes = await usersCol.insertOne(userA);
  const bRes = await usersCol.insertOne(userB);

  const userAId = aRes.insertedId;
  const userBId = bRes.insertedId;

  // Seed cards for both users
  const cardAAccount = "1111222233334444";
  const cardBAccount = "5555666677778888";

  await cardsCol.insertOne({
    userId: userAId,
    cardName: "TEST SENDER",
    accountNumber: cardAAccount,
    cardType: "debit",
    expiryDate: "12/30",
    cvv: "123",
    cardPassword: hashedPin,
    createdAt: now,
    updatedAt: now
  });

  await cardsCol.insertOne({
    userId: userBId,
    cardName: "TEST RECEIVER",
    accountNumber: cardBAccount,
    cardType: "debit",
    expiryDate: "12/30",
    cvv: "456",
    cardPassword: hashedPin,
    createdAt: now,
    updatedAt: now
  });

  // Save seed data for tests
  const seed = {
    dbName: TEST_DB,
    passwordPlain,
    pinPlain,
    userA: {
      _id: String(userAId),
      username: userA.username,
      firstName: userA.firstName,
      lastName: userA.lastName,
      balance: userA.balance
    },
    userB: {
      _id: String(userBId),
      username: userB.username,
      firstName: userB.firstName,
      lastName: userB.lastName,
      balance: userB.balance
    },
    cardA: { accountNumber: cardAAccount },
    cardB: { accountNumber: cardBAccount }
  };

  const outPath = path.join(process.cwd(), "tests", "seed.json");
  fs.writeFileSync(outPath, JSON.stringify(seed, null, 2), "utf-8");

  await client.close();
}