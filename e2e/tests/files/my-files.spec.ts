import path from 'path';
import { expect } from '@playwright/test';
import { test } from '../../fixtures';
import { registerUser } from '../../helpers/api';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { MyFilesPage } from '../../pages/MyFilesPage';

const GIF_FILE = path.join(__dirname, '../../resources/cactus.gif');

test.describe('My Files', () => {
  test('As an authenticated user, I can see a list of my uploaded files', async ({
    authenticatedPage,
  }) => {
    const homePage = new HomePage(authenticatedPage);
    const myFilesPage = new MyFilesPage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(GIF_FILE);
    await homePage.clickDashboard();

    await expect(authenticatedPage.locator(myFilesPage.elements.fileRows)).toHaveCount(1);
  });

  test("As an authenticated user, I cannot see another user's files", async ({
    browser,
    request,
  }) => {
    const password = 'password123';

    // User A registers, logs in and uploads a file
    const userAEmail = `user-a-${Date.now()}@test.com`;
    await registerUser(request, userAEmail, password);
    const userAContext = await browser.newContext();
    const userAPage = await userAContext.newPage();
    await new LoginPage(userAPage).goto();
    await new LoginPage(userAPage).login(userAEmail, password);
    await new HomePage(userAPage).upload(GIF_FILE);
    await userAContext.close();

    // User B registers, logs in and goes to my-files
    const userBEmail = `user-b-${Date.now()}@test.com`;
    await registerUser(request, userBEmail, password);
    const userBContext = await browser.newContext();
    const userBPage = await userBContext.newPage();
    await new LoginPage(userBPage).goto();
    await new LoginPage(userBPage).login(userBEmail, password);
    await new HomePage(userBPage).clickDashboard();

    const myFilesPage = new MyFilesPage(userBPage);
    await expect(userBPage.locator(myFilesPage.elements.fileRows)).toHaveCount(0);
    await userBContext.close();
  });

  test('As an authenticated user, I can delete a file', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    const myFilesPage = new MyFilesPage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(GIF_FILE);
    await homePage.clickDashboard();
    await myFilesPage.deleteFirstFile();

    await expect(authenticatedPage.locator(myFilesPage.elements.fileRows)).toHaveCount(0);
  });

  test('I can see a deleted file in the expired tab', async ({ authenticatedPage }) => {
    const homePage = new HomePage(authenticatedPage);
    const myFilesPage = new MyFilesPage(authenticatedPage);

    await homePage.goto();
    await homePage.upload(GIF_FILE);
    await homePage.clickDashboard();
    await myFilesPage.deleteFirstFile();
    await myFilesPage.clickExpiredTab();

    await expect(authenticatedPage.locator(myFilesPage.elements.fileRows)).toHaveCount(1);
  });
});
