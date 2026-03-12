import { expect, type Page } from '@playwright/test';

export class MyFilesPage {
  readonly page: Page;
  readonly url = '/my-files';

  readonly elements = {
    pageHeading: '[data-testid="my-files-heading"]',
    tabAll: '[data-testid="tab-all"]',
    tabActive: '[data-testid="tab-active"]',
    tabExpired: '[data-testid="tab-expired"]',
    logoutButton: '[data-testid="logout-button"]',
    fileRows: '[data-testid="file-row"]',
    deleteButton: '[data-testid="file-delete-button"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async isDisplayed() {
    await expect(this.page.locator(this.elements.pageHeading)).toBeVisible();
  }

  async logout() {
    await this.page.click(this.elements.logoutButton);
  }

  async clickExpiredTab() {
    await this.page.click(this.elements.tabExpired);
  }

  async getFileRows() {
    return this.page.locator(this.elements.fileRows);
  }

  async deleteFirstFile() {
    await this.page.locator(this.elements.deleteButton).first().click();
  }
}
