import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

test.describe('MS Teams Iframe Embedded View E2E Validation', () => {

  test('validates full recruiter dashboard capabilities inside simulated Teams iframe context', async ({ page }) => {
    // 1. Navigate to simulated Teams workspace
    await page.goto('/teams-embedded-mock.html');
    await page.waitForLoadState('domcontentloaded');

    // 2. Resolve iframe locator context
    const iframe = page.frameLocator('#app-iframe');

    // 3. Instantiate LoginPage and DashboardPage objects targeting the iframe context
    const loginPage = new LoginPage(iframe);
    const dashboardPage = new DashboardPage(iframe);

    // 4. Perform Login flow inside iframe
    await loginPage.login('recruiter@test.com', '123456');

    // 5. Verify successful login inside iframe
    await expect(dashboardPage.signedInUserText).toBeVisible();
    await expect(dashboardPage.signedInUserText).toHaveText('Signed in as recruiter@test.com');

    // 6. Verify recruiter read-only constraints inside iframe
    await expect(dashboardPage.addStudentButton).not.toBeVisible();

    // 7. Verify search and table content inside iframe
    await dashboardPage.fillSearch('Aarav');
    await expect(iframe.getByRole('cell', { name: 'Aarav Sharma', exact: true })).toBeVisible();

    // Clear filters
    await dashboardPage.clearFilters();
    await expect(iframe.getByRole('cell', { name: 'Aarav Sharma', exact: true })).toBeVisible();

    // 8. Open Student details modal inside iframe
    await dashboardPage.tableRows.first().click();
    await expect(dashboardPage.dialog).toBeVisible();
    await expect(dashboardPage.detailsEditButton).not.toBeVisible();

    // Close details modal
    await dashboardPage.closeDetailsButton.click();
    await expect(dashboardPage.dialog).not.toBeVisible();
  });
});
