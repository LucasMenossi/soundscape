import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

async function createE2EUser(page: Page) {
  const uniqueId = randomUUID().slice(0, 8);
  const email = `e2e-library-${Date.now()}-${uniqueId}@example.test`;
  const password = `SoundScape-${randomUUID().slice(0, 12)}!`;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("SoundScape Library E2E");
  await page.getByLabel("Email address").fill(email);
  await page.getByPlaceholder("At least 8 characters").fill(password);
  await page.getByPlaceholder("Enter your password again").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/library$/);

  return uniqueId;
}

async function searchForRadiohead(page: Page) {
  await page.goto("/search");
  await page.getByRole("searchbox", {
    name: "Search for an artist or album",
  }).fill("Radiohead");
  await page.getByRole("button", { name: "Search" }).click();

  const result = page
    .locator('main a[href^="/artists/"]')
    .filter({ hasText: "Radiohead" })
    .first();
  await expect(result).toBeVisible({ timeout: 60_000 });
  await result.click();
  await expect(page.locator("main h1")).toContainText("Radiohead", {
    timeout: 60_000,
  });
}

async function addCurrentEntityToCollection(
  page: Page,
  collectionName: string,
) {
  await page.getByRole("button", { name: "Add to collection" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Add to a collection",
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button").filter({ hasText: collectionName }).click();

  // The form closes only after useActionState receives a successful server
  // action result. This is a stronger signal than the toast, which may still
  // be visible from a previous add operation across client-side navigation.
  await expect(dialog).toBeHidden({ timeout: 15_000 });
}

test("a user can favorite artists and albums and manage collection items", async ({
  page,
}) => {
  test.setTimeout(240_000);
  page.setDefaultNavigationTimeout(90_000);

  const uniqueId = await createE2EUser(page);
  const collectionName = `Music picks ${uniqueId}`;

  await page.goto("/collections");
  await page.getByLabel("Collection name").fill(collectionName);
  await page
    .getByLabel(/Description/)
    .fill("A collection created by the Playwright E2E suite.");
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(
    page.getByRole("heading", { name: collectionName, level: 1 }),
  ).toBeVisible();
  const collectionUrl = page.url();

  await searchForRadiohead(page);
  const artistName = (await page.locator("main h1").innerText()).trim();

  await page.getByRole("button", { name: "Add to library" }).click();
  await expect(
    page.getByRole("button", { name: "Remove from library" }),
  ).toBeVisible();
  await addCurrentEntityToCollection(page, collectionName);

  const firstAlbum = page.locator('main a[href^="/albums/"]').first();
  await expect(firstAlbum).toBeVisible({ timeout: 60_000 });
  const albumHref = await firstAlbum.getAttribute("href");
  const albumName = (await firstAlbum.locator("h3").innerText()).trim();
  await firstAlbum.click();
  await expect(page).toHaveURL(new RegExp(`${albumHref}$`));
  await expect(page.locator("main h1")).toContainText(albumName);

  await page.getByRole("button", { name: "Add to library" }).click();
  await expect(
    page.getByRole("button", { name: "Remove from library" }),
  ).toBeVisible();
  await addCurrentEntityToCollection(page, collectionName);

  await page.goto(collectionUrl);
  await expect(page.getByText(artistName, { exact: true })).toBeVisible();
  await expect(page.getByText(albumName, { exact: true })).toBeVisible();
  await expect(page.getByText("2 items", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: `Remove ${albumName}` }).click();
  await expect(page).toHaveURL(collectionUrl);
  await expect(page.getByText("1 item", { exact: true })).toBeVisible();
  await expect(page.getByText(artistName, { exact: true })).toBeVisible();
  await expect(page.getByText(albumName, { exact: true })).toHaveCount(0);

  await page.goto("/library");
  await expect(page.getByText(artistName, { exact: true })).toBeVisible();
  await expect(page.getByText(albumName, { exact: true })).toBeVisible();
  await expect(page.getByText("1 artist", { exact: true })).toBeVisible();
  await expect(page.getByText("1 album", { exact: true })).toBeVisible();

  await page.getByRole("button", {
    name: `Remove ${artistName} from library`,
  }).click();
  await expect(page.getByText("0 artists", { exact: true })).toBeVisible();
  await expect(page.getByText(albumName, { exact: true })).toBeVisible();
});
