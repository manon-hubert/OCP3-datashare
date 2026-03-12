import path from 'path';
import { expect } from '@playwright/test';
import { test } from '../../fixtures';
import { HomePage } from '../../pages/HomePage';

const GIF_FILE = path.join(__dirname, '../../resources/cactus.gif');

// MZ header — detected as application/x-msdownload (exe), not in the allowed list
const EXE_FILE = {
  name: 'malware.exe',
  mimeType: 'application/x-msdownload',
  buffer: Buffer.from([0x4d, 0x5a]),
};

test.describe('Upload', () => {
  test('As an authenticated user I can upload a file', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(GIF_FILE);

    await expect(authenticatedPage.locator(homePage.elements.successCard)).toBeVisible();
  });

  test('I cannot upload a forbidden file type', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(EXE_FILE);

    await expect(authenticatedPage.locator(homePage.elements.uploadError)).toBeVisible();
  });
});
