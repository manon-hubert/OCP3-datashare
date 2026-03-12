import { expect, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly url = '/login';

  readonly elements = {
    emailInput: '[data-testid="login-email"]',
    passwordInput: '[data-testid="login-password"]',
    submitButton: '[data-testid="login-submit"]',
    errorMessage: '[data-testid="login-error"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async isDisplayed() {
    await expect(this.page.locator(this.elements.emailInput)).toBeVisible();
    await expect(this.page.locator(this.elements.submitButton)).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.page.fill(this.elements.emailInput, email);
    await this.page.fill(this.elements.passwordInput, password);
    await this.page.click(this.elements.submitButton);
  }
}
