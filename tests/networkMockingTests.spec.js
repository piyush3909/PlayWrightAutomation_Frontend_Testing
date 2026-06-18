import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

test.describe('API Network Mocking and Error Recovery Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Success Path: Load students data successfully on 200 OK', async ({ page }) => {
    // Intercept API call and return mock data
    const mockStudents = [
      {
        id: 'STU-999',
        name: 'Mock Success Student',
        country: 'India',
        experience: 5,
        skills: ['React', 'Node.js']
      }
    ];

    await page.route('**/api/students', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockStudents)
      });
    });

    // Clean local storage so it pulls from mock endpoint
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('sms_students'));

    // Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Verify mock student is displayed
    const row = await dashboardPage.getRowByStudentId('STU-999');
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'Mock Success Student', exact: true })).toBeVisible();
    await expect(dashboardPage.totalStudentsCard.getByText('1')).toBeVisible();
  });

  test('Failure Path: Display error screen when API returns 500', async ({ page }) => {
    // Intercept API call and return a server error
    await page.route('**/api/students', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('sms_students'));

    // Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Verify error page details
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert.locator('p:has-text("Error Loading Data")')).toBeVisible();
    await expect(errorAlert.locator('p:has-text("Failed to fetch students from server")')).toBeVisible();
    await expect(errorAlert.getByRole('button', { name: 'Retry' })).toBeVisible();

    // Verify main dashboard is NOT visible
    await expect(dashboardPage.addStudentButton).not.toBeVisible();
  });

  test('Recovery Path: Recovers and loads data when API becomes healthy and Retry is clicked', async ({ page }) => {
    let shouldFail = true;

    const mockStudents = [
      {
        id: 'STU-888',
        name: 'Mock Recovery Student',
        country: 'USA',
        experience: 2,
        skills: ['Python']
      }
    ];

    // Setup dynamic route interception
    await page.route('**/api/students', async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal Server Error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockStudents)
        });
      }
    });

    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('sms_students'));

    // Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Confirm initial 500 failure
    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();

    // Recover endpoint health status
    shouldFail = false;

    // Click retry
    await errorAlert.getByRole('button', { name: 'Retry' }).click();

    // Verify recovery completes successfully
    await expect(errorAlert).not.toBeVisible();
    const row = await dashboardPage.getRowByStudentId('STU-888');
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'Mock Recovery Student', exact: true })).toBeVisible();
    await expect(dashboardPage.totalStudentsCard.getByText('1')).toBeVisible();
  });
});
