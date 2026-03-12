import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { RegisterPage } from '../../pages/RegisterPage';

test.describe('Register', () => {
  test('I can register', async ({ page }) => {
    const email = `register-${Date.now()}@test.com`;
    const password = 'password123';

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(email, password, password);

    await expect(page.locator(registerPage.elements.successMessage)).toBeVisible();

    await registerPage.clickLoginLink();
    await new LoginPage(page).login(email, password);

    await new HomePage(page).isDisplayed(true);
  });
});
