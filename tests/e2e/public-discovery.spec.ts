import { expect, test } from "@playwright/test";

test.describe("Public discovery", () => {
  test("homepage exposes catalog and genre discovery", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /find the music between the tracks/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explore catalog" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Genres", exact: true })).toBeVisible();
  });

  test("search page shows its initial empty state", async ({ page }) => {
    await page.goto("/search");

    await expect(
      page.getByRole("heading", { name: "Find your sound." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your next discovery starts here" }),
    ).toBeVisible();
  });

  test("personal library requires authentication", async ({ page }) => {
    await page.goto("/library");

    await expect(page).toHaveURL(/\/sign-in\?callbackURL=%2Flibrary/);
    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });
});
