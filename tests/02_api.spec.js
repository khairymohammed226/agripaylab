import { test, expect } from "@playwright/test";
import { readSeed } from "./helpers.mjs";

// 🟢 قبل كل اختبار، نهيئ المستخدمين والرصيد
test.beforeEach(async ({ request }) => {
  const seed = readSeed();

  // reset رصيد userA و userB
  await request.post("/reset-user", {
    data: { userId: seed.userA._id, balance: 10000 },
  });
  await request.post("/reset-user", {
    data: { userId: seed.userB._id, balance: 10000 },
  });
});

test("health works", async ({ request }) => {
  const r = await request.get("/health");
  expect(r.ok()).toBeTruthy();
  expect(await r.text()).toBe("ok");
});

test("login + user + card + transactions API", async ({ request }) => {
  const seed = readSeed();

  // login
  const loginRes = await request.post("/login", {
    data: { username: seed.userA.username, password: seed.passwordPlain },
  });
  expect(loginRes.ok()).toBeTruthy();
  const login = await loginRes.json();
  expect(login).toHaveProperty("token");
  expect(login).toHaveProperty("user");
  expect(String(login.user._id)).toBe(seed.userA._id);

  // user data
  const userRes = await request.get(`/user/${seed.userA._id}`);
  expect(userRes.ok()).toBeTruthy();
  const user = await userRes.json();
  expect(user).toHaveProperty("firstName");
  expect(user).toHaveProperty("balance");

  // card data
  const cardRes = await request.get(`/card/${seed.userA._id}`);
  expect(cardRes.ok()).toBeTruthy();
  const card = await cardRes.json();
  expect(card).toHaveProperty("card");
  expect(card.card).toHaveProperty("accountNumber");

  // transactions list
  const txRes = await request.get(`/transactions/${seed.userA._id}`);
  expect(txRes.ok()).toBeTruthy();
  const tx = await txRes.json();
  expect(Array.isArray(tx)).toBeTruthy();
});

test("bank transfer + balances update", async ({ request }) => {
  const seed = readSeed();

  // transfer 500 from userA -> userB
  const tRes = await request.post("/transfer/bank-transfer", {
    data: {
      userId: seed.userA._id,
      bank: "TestBank",
      beneficiaryName: "Receiver",
      beneficiaryAccount: seed.cardB.accountNumber,
      amount: 500,
    },
  });
  expect(tRes.ok()).toBeTruthy();
  const t = await tRes.json();
  expect(t).toHaveProperty("newBalance");

  const aRes = await request.get(`/user/${seed.userA._id}`);
  const bRes = await request.get(`/user/${seed.userB._id}`);
  const a = await aRes.json();
  const b = await bRes.json();

  expect(a.balance).toBe(9500); // بعد تحويل 500
  expect(b.balance).toBe(10500); // بعد استقبال 500
});

test("ATM deposit + withdrawal", async ({ request }) => {
  const seed = readSeed();

  // deposit 200
  const dRes = await request.post("/atm/transaction", {
    data: {
      cardNumber: seed.cardA.accountNumber,
      cardPassword: seed.pinPlain,
      amount: 200,
      type: "deposit",
    },
  });
  expect(dRes.ok()).toBeTruthy();
  const d = await dRes.json();
  expect(d).toHaveProperty("newBalance");

  // withdrawal 100
  const wRes = await request.post("/atm/transaction", {
    data: {
      cardNumber: seed.cardA.accountNumber,
      cardPassword: seed.pinPlain,
      amount: 100,
      type: "withdrawal",
    },
  });
  expect(wRes.ok()).toBeTruthy();

  // verify transactions include ATM
  const txRes = await request.get(`/transactions/${seed.userA._id}`);
  const tx = await txRes.json();
  expect(tx.length).toBeGreaterThan(0);
  expect(tx.some((x) => x.source === "ATM")).toBeTruthy();
});

test("contact API", async ({ request }) => {
  const r = await request.post("/contact", {
    data: {
      name: "Playwright Tester",
      phone: "01000000000",
      email: "pw@test.com",
      message: "Hello from Playwright",
    },
  });

  expect(r.ok()).toBeTruthy();
  const j = await r.json();
  expect(j.message).toContain("Message sent");
});