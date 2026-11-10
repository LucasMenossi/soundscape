import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("a user can sign up and manage a personal collection", async ({ page }) => {
  test.setTimeout(90_000);
  const uniqueId = randomUUID().slice(0, 8);
  const email = `e2e-${Date.now()}-${uniqueId}@example.test`;
  const password = `SoundScape-${randomUUID().slice(0, 12)}!`;
  const collectionName = `E2E collection ${uniqueId}`;
  const updatedCollectionName = `Updated collection ${uniqueId}`;

  await page.goto("/sign-up");
  await expect(
    page.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();

  await page.getByLabel("Name").fill("SoundScape E2E");
  await page.getByLabel("Email address").fill(email);
  await page.getByPlaceholder("At least 8 characters").fill(password);
  await page.getByPlaceholder("Enter your password again").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/library$/);
  await expect(
    page.getByRole("heading", { name: "Your library" }),
  ).toBeVisible();

  await page.goto("/collections");
  await expect(
    page.getByRole("heading", { name: "Your collections" }),
  ).toBeVisible();

  await page.getByLabel("Collection name").fill(collectionName);
  await page.getByLabel(/Description/).fill("Created by the Playwright E2E suite.");
  await page.getByRole("button", { name: "Create collection" }).click();

  await expect(
    page.getByRole("heading", { name: collectionName, level: 1 }),
  ).toBeVisible();

  await page.getByLabel("Name", { exact: true }).fill(updatedCollectionName);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: updatedCollectionName, level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete collection" }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(
    page.getByRole("heading", { name: "No collections yet" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/library");
  await expect(page).toHaveURL(/\/sign-in\?callbackURL=%2Flibrary/);
});
