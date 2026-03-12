import { expect, type Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly url: string = '/register';

  readonly elements = {
    emailInput: '[data-testid="register-email"]',
    passwordInput: '[data-testid="register-password"]',
    confirmPasswordInput: '[data-testid="register-confirm-password"]',
    submitButton: '[data-testid="register-submit"]',
    successMessage: '[data-testid="register-success"]',
    loginLink: '[data-testid="register-login-link"]',
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

  async clickLoginLink() {
    await this.page.click(this.elements.loginLink);
  }

  async register(email: string, password: string, confirmPassword: string) {
    await this.page.fill(this.elements.emailInput, email);
    await this.page.fill(this.elements.passwordInput, password);
    await this.page.fill(this.elements.confirmPasswordInput, confirmPassword);
    await this.page.click(this.elements.submitButton);
  }
}
