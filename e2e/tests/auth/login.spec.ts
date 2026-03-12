import { expect, test } from '@playwright/test';
import { test as authTest } from '../../fixtures';
import { registerUser } from '../../helpers/api';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { MyFilesPage } from '../../pages/MyFilesPage';

test.describe('Login', () => {
  test('I can login with valid credentials', async ({ page, request }) => {
    const email = `login-${Date.now()}@test.com`;
    const password = 'password123';
    await registerUser(request, email, password);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);

    await new HomePage(page).isDisplayed(true);
  });

  test('I cannot login with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('nobody@test.com', 'wrongpassword');

    await expect(page.locator(loginPage.elements.errorMessage)).toBeVisible();
    await loginPage.isDisplayed();
  });

  test('I am redirected to /login when I try to access my-files without a token', async ({
    page,
  }) => {
    await new MyFilesPage(page).goto();

    await new LoginPage(page).isDisplayed();
  });
});

authTest.describe('Logout', () => {
  authTest('I can logout and can no longer access my-files', async ({ authenticatedPage }) => {
    const myFilesPage = new MyFilesPage(authenticatedPage);

    await myFilesPage.goto();
    await myFilesPage.logout();

    await new LoginPage(authenticatedPage).isDisplayed();

    await myFilesPage.goto();
    await new LoginPage(authenticatedPage).isDisplayed();
  });
});
