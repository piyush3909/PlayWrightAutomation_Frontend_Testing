import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Helper to login as Admin
async function loginAsAdmin(loginPage) {
  await loginPage.navigate();
  await loginPage.login('admin@test.com', '123456');
  await expect(loginPage.page).toHaveURL('/dashboard');
}

test.describe('UI and UX Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Responsiveness and mobile layout verification', async ({ page }) => {
    // Set viewport to mobile dimensions
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAsAdmin(loginPage);

    // Verify stats cards are rendered in mobile viewport
    await expect(dashboardPage.totalStudentsCard).toBeVisible();

    // Verify the "Add Student" button exists and is visible
    await expect(dashboardPage.addStudentButton).toBeVisible();
  });

  test('Add Student Modal closing via Cancel button', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Open the Add Student modal
    await dashboardPage.openAddStudentModal();
    await expect(dashboardPage.dialog).toBeVisible();

    // Click Cancel button
    await dashboardPage.cancelButton.click();

    // Verify modal is closed
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test('Add Student Modal closing via Close (X) button', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Open the Add Student modal
    await dashboardPage.openAddStudentModal();
    await expect(dashboardPage.dialog).toBeVisible();

    // Click Close (X) button in header
    await dashboardPage.closeFormButton.click();

    // Verify modal is closed
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test('Student Details Modal closing via Close button', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Click on the first row (Aarav Sharma) to open the details modal
    await dashboardPage.tableRows.first().click();
    await expect(dashboardPage.dialog).toBeVisible();

    // Click Close button
    await dashboardPage.closeDetailsButton.click();

    // Verify modal is closed
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test('Student Details Modal closing via Close (X) button', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Click on the first row to open details
    await dashboardPage.tableRows.first().click();
    await expect(dashboardPage.dialog).toBeVisible();

    // Click Close (X) button in header
    await dashboardPage.closeDetailsXButton.click();

    // Verify modal is closed
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test('Pagination boundaries and button disabled states', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // On page 1, verify Previous page and First page are disabled
    await expect(dashboardPage.prevPageButton).toBeDisabled();
    await expect(dashboardPage.firstPageButton).toBeDisabled();

    // Go to Last page
    await dashboardPage.navigateToPage('last');

    // Verify Next page and Last page are disabled on the final page
    await expect(dashboardPage.nextPageButton).toBeDisabled();
    await expect(dashboardPage.lastPageButton).toBeDisabled();
  });

  test('Page size selector alters table rows count', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Initially 10 rows should be displayed
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 10 of 500/);
    await expect(dashboardPage.tableRows).toHaveCount(10);

    // Change page size to 20
    await dashboardPage.changePageSize(20);

    // Verify page updates to show 20 rows
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 20 of 500/);
    await expect(dashboardPage.tableRows).toHaveCount(20);
  });

  test('Keyboard navigation and focus sequence check', async ({ page }) => {
    await loginPage.navigate();

    // Focus on email input initially
    await loginPage.emailInput.focus();
    await expect(loginPage.emailInput).toBeFocused();

    // Tab to password input
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();

    // Tab to Show password button
    await page.keyboard.press('Tab');
    await expect(loginPage.showPasswordButton).toBeFocused();

    // Tab to Login button
    await page.keyboard.press('Tab');
    await expect(loginPage.loginButton).toBeFocused();
  });

});
