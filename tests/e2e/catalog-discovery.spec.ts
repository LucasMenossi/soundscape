import { expect, test } from "@playwright/test";

test.describe("Catalog discovery", () => {
  test("genre catalog can be filtered and opened", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("/genres");
    await expect(
      page.getByRole("heading", { name: "Follow a sound." }),
    ).toBeVisible({ timeout: 30_000 });

    const genreSearch = page.getByRole("searchbox", {
      name: "Search genres",
    });
    await genreSearch.fill("Rock");

    const rockHeading = page.getByRole("heading", {
      name: "Rock",
      exact: true,
    });
    await expect(rockHeading).toBeVisible();
    await page.getByRole("link").filter({ has: rockHeading }).click();

    await expect(page).toHaveURL(/\/genres\/rock$/);
    await expect(
      page.getByRole("heading", { name: "Rock", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Artists", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Albums", exact: true }),
    ).toBeVisible();
  });

  test("catalog search opens an artist and an album detail page", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    page.setDefaultNavigationTimeout(90_000);

    await page.goto("/search");
    await page
      .getByRole("searchbox", {
        name: "Search for an artist or album",
      })
      .fill("Radiohead");
    await page.getByRole("button", { name: "Search" }).click();

    const radioheadResult = page
      .locator('main a[href^="/artists/"]')
      .filter({ hasText: "Radiohead" })
      .first();
    await expect(radioheadResult).toBeVisible({ timeout: 60_000 });
    await radioheadResult.click();

    await expect(page.locator("main h1")).toContainText("Radiohead", {
      timeout: 60_000,
    });
    await expect(
      page.getByRole("heading", { name: "Studio albums" }),
    ).toBeVisible();

    const firstAlbum = page.locator('main a[href^="/albums/"]').first();
    await expect(firstAlbum).toBeVisible({ timeout: 60_000 });
    const albumHref = await firstAlbum.getAttribute("href");
    const albumName = (await firstAlbum.locator("h3").innerText()).trim();
    expect(albumHref).toMatch(/^\/albums\//);

    await firstAlbum.click();
    await expect(page).toHaveURL(new RegExp(`${albumHref}$`));
    await expect(page.locator("main h1")).toContainText(albumName);
    await expect(
      page.getByRole("heading", { name: "Release editions & tracklist" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /Radiohead/ })
      .first()
      .click();
    await expect(page.locator("main h1")).toContainText("Radiohead");
  });
});
