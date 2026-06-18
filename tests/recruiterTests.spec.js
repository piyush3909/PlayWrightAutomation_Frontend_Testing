import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Helper to login as Recruiter
async function loginAsRecruiter(loginPage) {
  await loginPage.navigate();
  await loginPage.login('recruiter@test.com', '123456');
}

test.describe('Recruiter Desktop E2E Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('signed in email is displayed', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.signedInUserText).toBeVisible();
    await expect(dashboardPage.signedInUserText).toHaveText('Signed in as recruiter@test.com');
  });

  test('whitespace email treated as empty', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.fillEmail('     ');
    await loginPage.fillPassword('123456');
    await loginPage.clickLogin();
    await loginPage.verifyError('Email is required');
  });

  test('search is case insensitive', async ({ page }) => {
    await loginAsRecruiter(loginPage);

    // Search for lowercase
    await dashboardPage.fillSearch('mia');
    const lowerResults = await dashboardPage.tableRows.allTextContents();

    // Search for uppercase
    await dashboardPage.fillSearch('MIA');
    const upperResults = await dashboardPage.tableRows.allTextContents();

    expect(upperResults).toEqual(lowerResults);
  });

  test('search with no matches shows empty state', async ({ page }) => {
    await loginAsRecruiter(loginPage);

    await dashboardPage.fillSearch('thisstudentdoesnotexist');

    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(page.getByText('No students found')).toBeVisible();
  });

  test('clear resets search filter', async ({ page }) => {
    await loginAsRecruiter(loginPage);

    await dashboardPage.fillSearch('Mia');

    // Verify only the matching student row is shown
    await expect(page.locator('tbody td').filter({ hasText: 'Mia Johnson' })).toHaveCount(1);

    // Click clear button
    await dashboardPage.clearFilters();

    await expect(dashboardPage.searchInput).toHaveValue('');
    // Verify default list returns and first student row is visible
    await expect(page.locator('tbody td').filter({ hasText: 'Aarav Sharma' })).toHaveCount(1);
  });

  test('recruiter cannot see add student button', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.addStudentButton).not.toBeVisible();
  });

  test('sorts names ascending and descending', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Initial load check (should be A-Z default ascending)
    const initialNames = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    for (let i = 0; i < initialNames.length - 1; i++) {
      expect(initialNames[i].localeCompare(initialNames[i + 1])).toBeLessThanOrEqual(0);
    }

    // Click Sort Name button to sort descending
    await dashboardPage.tableHeaderName.getByRole('button').click();
    const descNames = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    for (let i = 0; i < descNames.length - 1; i++) {
      expect(descNames[i].localeCompare(descNames[i + 1])).toBeGreaterThanOrEqual(0);
    }

    // Click Sort Name button again to sort ascending
    await dashboardPage.tableHeaderName.getByRole('button').click();
    const ascNames = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    for (let i = 0; i < ascNames.length - 1; i++) {
      expect(ascNames[i].localeCompare(ascNames[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  test('sorts experience ascending and descending', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Click Sort Experience button once to sort ascending
    await dashboardPage.tableHeaderExperience.getByRole('button').click();
    const expTextAsc = await page.locator('tbody tr td:nth-child(4)').allTextContents();
    const expNumsAsc = expTextAsc.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));
    for (let i = 0; i < expNumsAsc.length - 1; i++) {
      expect(expNumsAsc[i]).toBeLessThanOrEqual(expNumsAsc[i + 1]);
    }

    // Click Sort Experience button again to sort descending
    await dashboardPage.tableHeaderExperience.getByRole('button').click();
    const expTextDesc = await page.locator('tbody tr td:nth-child(4)').allTextContents();
    const expNumsDesc = expTextDesc.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));
    for (let i = 0; i < expNumsDesc.length - 1; i++) {
      expect(expNumsDesc[i]).toBeGreaterThanOrEqual(expNumsDesc[i + 1]);
    }
  });

  test('recruiter cannot see edit or delete buttons', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    // Verify edit/delete controls do not exist in the table view
    await expect(page.getByTitle('Edit')).toHaveCount(0);
    await expect(page.getByTitle('Delete')).toHaveCount(0);
  });

  test('recruiter cannot edit from details modal', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    // Click the first row to open details modal
    await dashboardPage.tableRows.first().click();
    await expect(dashboardPage.detailsEditButton).not.toBeVisible();
    await dashboardPage.closeDetailsButton.click();
  });

  test('student added by admin is visible to recruiter', async ({ page }) => {
    const studentName = `CrossRoleStudent_${Date.now()}`;

    // 1. Login as Admin
    await page.goto('/login');
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 2. Add Student
    await dashboardPage.openAddStudentModal();
    await dashboardPage.fillStudentForm({
      name: studentName,
      country: 'India',
      experience: '2',
      skills: ['React']
    });
    await dashboardPage.saveStudent();

    // 3. Logout Admin
    await dashboardPage.logout();
    await expect(page).toHaveURL('/login');

    // 4. Login as Recruiter
    await loginPage.login('recruiter@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 5. Verify Recruiter Can See Student Row
    await dashboardPage.fillSearch(studentName);
    const row = await dashboardPage.getRowByStudentId(studentName);
    await expect(row).toBeVisible();

    // 6. Verify details can be viewed but cannot edit
    await row.click();
    await expect(dashboardPage.dialog).toBeVisible();
    await expect(dashboardPage.detailsEditButton).not.toBeVisible();
  });

  test('recruiter pagination boundaries and rows adjustment', async ({ page }) => {
    await loginAsRecruiter(loginPage);

    // Boundary check page 1
    await expect(dashboardPage.prevPageButton).toBeDisabled();
    await expect(dashboardPage.firstPageButton).toBeDisabled();

    // Update row count to 50
    await dashboardPage.changePageSize(50);

    // Verify total showing text changes and table rows count updates
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 50 of 500/);
    await expect(dashboardPage.tableRows).toHaveCount(50);
  });

  test('page resets to 1 on filter and page size change', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Go to next page (Page 2)
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 1. Test search filter resets page to 1
    await dashboardPage.fillSearch('Aarav Sharma');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 1 of 1/);

    // Clear search and return to page 2
    await dashboardPage.fillSearch('');
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 2. Test country filter resets page to 1
    await dashboardPage.selectCountry('Germany');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 10 of/);

    // Clear country and return to page 2
    await dashboardPage.selectCountry('');
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 3. Test rows per page (size) resets page to 1
    await dashboardPage.changePageSize(50);
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 50 of 500/);
  });

  test('combined filtering check', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Set filters: Search "a", Country "India", Skill "React", Experience "0-2 Years" (min 0, max 2)
    await dashboardPage.fillSearch('a');
    await dashboardPage.selectCountry('India');
    await dashboardPage.selectSkill('React');
    await dashboardPage.selectExperience('0-2 Years');

    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Assert every visible row matches all conditions
    const rows = dashboardPage.tableRows;
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const name = await rows.nth(i).locator('td:nth-child(2)').textContent();
      const country = await rows.nth(i).locator('td:nth-child(3)').textContent();
      const experienceText = await rows.nth(i).locator('td:nth-child(4)').textContent();
      const skills = await rows.nth(i).locator('td:nth-child(5)').textContent();

      expect(name.toLowerCase()).toContain('a');
      expect(country).toBe('India');
      expect(skills).toContain('React');

      const expVal = parseInt(experienceText.replace(/[^0-9]/g, ''), 10);
      expect(expVal).toBeGreaterThanOrEqual(0);
      expect(expVal).toBeLessThanOrEqual(2);
    }
  });

  test('search special characters safety', async ({ page }) => {
    await loginAsRecruiter(loginPage);
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Type special regex string
    await dashboardPage.fillSearch('.*');
    await expect(dashboardPage.emptyState).toBeVisible();

    // Type parsing blocker
    await dashboardPage.fillSearch('[');
    await expect(dashboardPage.emptyState).toBeVisible();
  });

  test('session persistence on page reload', async ({ page }) => {
    await loginAsRecruiter(loginPage);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify redirect doesn't happen and recruiter email displays in header
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.signedInUserText).toBeVisible();
  });

  test('empty database zero-state for recruiter', async ({ page }) => {
    // 1. Initialize with empty localStorage database
    await page.goto('/login');
    await page.evaluate(() => localStorage.setItem('sms_students', '[]'));

    // 2. Login as recruiter
    await loginPage.login('recruiter@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 3. Assert zero-state UI
    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(page.getByText('No students available')).toBeVisible();

    await expect(dashboardPage.totalStudentsCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.totalCountriesCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.totalSkillsCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 0 to 0 of 0/);

    // 4. Assert recruiter cannot see Add Student button
    await expect(dashboardPage.addStudentButton).not.toBeVisible();
  });

});