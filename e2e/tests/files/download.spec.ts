import path from 'path';
import { expect, test } from '@playwright/test';
import { test as authTest } from '../../fixtures';
import { DownloadPage } from '../../pages/DownloadPage';
import { HomePage } from '../../pages/HomePage';
import { MyFilesPage } from '../../pages/MyFilesPage';

const GIF_FILE = path.join(__dirname, '../../resources/cactus.gif');

function tokenFromShareUrl(shareUrl: string): string {
  return shareUrl.split('/share/')[1];
}

authTest.describe('Download (authenticated)', () => {
  authTest('I can download a file', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    const downloadPage = new DownloadPage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(GIF_FILE);
    const token = tokenFromShareUrl(await homePage.getShareUrl());

    await downloadPage.goto(token);
    const download = await downloadPage.clickDownload();

    expect(download.suggestedFilename()).toBe('cactus.gif');
  });

  authTest(
    'I see the "expired file" message when I try to download a deleted file',
    async ({ authenticatedPage }) => {
      const homePage = new HomePage(authenticatedPage);
      const myFilesPage = new MyFilesPage(authenticatedPage);
      const downloadPage = new DownloadPage(authenticatedPage);

      await homePage.goto();
      await homePage.upload(GIF_FILE);
      const token = tokenFromShareUrl(await homePage.getShareUrl());

      await homePage.clickDashboard();
      await myFilesPage.deleteFirstFile();

      await downloadPage.goto(token);

      await expect(authenticatedPage.locator(downloadPage.elements.expiredMessage)).toBeVisible();
    },
  );
});

test.describe('Download (anonymous)', () => {
  test('I see the "expired file" message when I try to download a file that never existed', async ({
    page,
  }) => {
    const downloadPage = new DownloadPage(page);

    await downloadPage.goto('this-token-does-not-exist');

    await expect(page.locator(downloadPage.elements.expiredMessage)).toBeVisible();
  });
});
