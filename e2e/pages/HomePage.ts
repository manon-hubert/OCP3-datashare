import { expect, type Page } from '@playwright/test';

type FileInput = string | { name: string; mimeType: string; buffer: Buffer<ArrayBuffer> };

export class HomePage {
  readonly page: Page;
  readonly url = '/';

  readonly elements = {
    headerDashboard: '[data-testid="header-dashboard"]',
    headerLogin: '[data-testid="header-login"]',
    fileInput: '[data-testid="file-input"]',
    uploadSubmitButton: '[data-testid="upload-submit"]',
    uploadError: '[data-testid="upload-error"]',
    successCard: '[data-testid="upload-success-card"]',
    shareUrl: '[data-testid="share-url"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async isDisplayed(authenticated = false) {
    if (authenticated) {
      await expect(this.page.locator(this.elements.headerDashboard)).toBeVisible();
      await expect(this.page.locator(this.elements.headerLogin)).not.toBeVisible();
    } else {
      await expect(this.page.locator(this.elements.headerLogin)).toBeVisible();
      await expect(this.page.locator(this.elements.headerDashboard)).not.toBeVisible();
    }
  }

  async clickDashboard() {
    await this.page.click(this.elements.headerDashboard);
  }

  async selectFile(file: FileInput) {
    await this.page.setInputFiles(this.elements.fileInput, file);
  }

  async upload(file: FileInput) {
    await this.selectFile(file);
    await this.page.click(this.elements.uploadSubmitButton);
  }

  async getShareUrl(): Promise<string> {
    return (await this.page.locator(this.elements.shareUrl).textContent()) ?? '';
  }
}
