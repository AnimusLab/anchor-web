import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ec65e1cb5fe6ff101afcd4ef96ffffc23608d6eb84ea1d8c6f1739d8deea4743'
);

async function createAuthToken(role: string, email: string = 'user@anchor.dev', hubId: string = 'hub_live_enterprise_01') {
  return await new SignJWT({
    sub: email,
    uid: `usr_${role.toLowerCase()}_01`,
    role,
    hubId,
    auditorType: 'GOVERNMENT_AUDITOR',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

test.describe('Anchor Platform Institutional E2E Suite', () => {

  test('1. Unauthenticated root redirect & login page inspection', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/ENTERPRISE LOGIN|Anchor|Sign In|Identity|Portal/i);
    await expect(page.locator('input[type="email"], input[name="email"], input[id="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Multi-Role Portal Navigation: Admin Role access to /admin', async ({ browser }) => {
    const adminToken = await createAuthToken('ANIMUS_ADMIN', 'admin@animuslab.dev');
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'access_token',
        value: adminToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.locator('body')).toBeVisible();
    await context.close();
  });

  test('3. Multi-Role Portal Navigation: Hub Manager access to /hub', async ({ browser }) => {
    const managerToken = await createAuthToken('HUB_MANAGER', 'manager@enterprise.com');
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'access_token',
        value: managerToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    await page.goto('/hub');
    await expect(page).toHaveURL(/.*hub/);
    await expect(page.locator('body')).toBeVisible();
    await context.close();
  });

  test('4. Statutory Dialect Compiler: Interactive Compilation & Merkle Witness Verification', async ({ browser }) => {
    const auditorToken = await createAuthToken('REGULATORY_AUDITOR', 'inspector@eaib.eu');
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: 'access_token',
        value: auditorToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    const page = await context.newPage();
    await page.goto('/oversight/dialects');

    // Wait for the dialect generator card to be present
    await expect(page.locator('text=STATUTORY COMPLIANCE COMPILER')).toBeVisible();

    // Click Compile button
    const compileButton = page.locator('button:has-text("Compile Certified Statutory Package")');
    await expect(compileButton).toBeVisible();
    await compileButton.click();

    // Assert that the compiled pack visualizer appears with certified compliance and Merkle witness
    await expect(page.locator('text=CERTIFIED_COMPLIANT')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=MERKLE WITNESS')).toBeVisible();
    await expect(page.locator('text=Export Certified JSON')).toBeVisible();

    await context.close();
  });

});
