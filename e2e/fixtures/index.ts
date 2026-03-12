import { test as base, type Page } from '@playwright/test';
import { loginUser, registerUser } from '../helpers/api';

interface Fixtures {
  authenticatedPage: Page;
}

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser, request }, use) => {
    const email = `user-${Date.now()}@test.com`;
    const password = 'password123';
    await registerUser(request, email, password);
    const token = await loginUser(request, email, password);

    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
            localStorage: [{ name: 'access_token', value: token }],
          },
        ],
      },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
