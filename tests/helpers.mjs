import fs from "fs";
import path from "path";

export function readSeed() {
  const p = path.join(process.cwd(), "tests", "seed.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export async function setCurrentUserLocalStorage(page, user) {
  // لازم قبل page.goto
  await page.addInitScript((u) => {
    localStorage.setItem("currentUser", JSON.stringify(u));
  }, user);
}