import { type Page } from '@playwright/test';

export class DownloadPage {
  readonly page: Page;

  readonly elements = {
    downloadButton: '[data-testid="download-button"]',
    expiredMessage: '[data-testid="expired-message"]',
  };

  constructor(page: Page) {
    this.page = page;
  }

  async goto(token: string) {
    await this.page.goto(`/share/${token}`);
  }

  async clickDownload() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click(this.elements.downloadButton),
    ]);
    return download;
  }
}
