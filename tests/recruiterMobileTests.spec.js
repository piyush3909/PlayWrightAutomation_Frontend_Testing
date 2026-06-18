import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Helper to set mobile viewport and login as Recruiter
async function loginAsRecruiterMobile(loginPage) {
  await loginPage.page.setViewportSize({ width: 375, height: 812 });
  await loginPage.navigate();
  await loginPage.login('recruiter@test.com', '123456');
}

test.describe('Recruiter Mobile E2E Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('signed in email is displayed on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    await expect(dashboardPage.signedInUserText).toBeVisible();
    await expect(dashboardPage.signedInUserText).toHaveText('Signed in as recruiter@test.com');
  });

  test('whitespace email treated as empty on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.fillEmail('     ');
    await loginPage.fillPassword('123456');
    await loginPage.clickLogin();
    await loginPage.verifyError('Email is required');
  });

  test('search is case insensitive on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);

    // Search for lowercase
    await dashboardPage.fillSearch('mia');
    const lowerResults = await dashboardPage.mobileCards.allTextContents();

    // Search for uppercase
    await dashboardPage.fillSearch('MIA');
    const upperResults = await dashboardPage.mobileCards.allTextContents();

    expect(upperResults).toEqual(lowerResults);
  });

  test('search with no matches shows empty state on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);

    await dashboardPage.fillSearch('thisstudentdoesnotexist');

    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(page.getByText('No students found')).toBeVisible();
  });

  test('clear resets search filter on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);

    await dashboardPage.fillSearch('Mia');

    // Verify only the matching student card is shown
    await expect(dashboardPage.mobileCards.filter({ hasText: 'Mia Johnson' })).toHaveCount(1);

    // Click clear button
    await dashboardPage.clearFilters();

    await expect(dashboardPage.searchInput).toHaveValue('');
    // Verify default list returns and first card is visible
    await expect(dashboardPage.mobileCards.filter({ hasText: 'Aarav Sharma' })).toHaveCount(1);
  });

  test('recruiter cannot see add student button on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    await expect(dashboardPage.addStudentButton).not.toBeVisible();
  });

  test('sorts names ascending and descending on mobile', async ({ page }) => {
    // 1. Initial load (A-Z default ascending)
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.login('recruiter@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Wait for students to load to avoid empty list race condition
    await expect(dashboardPage.mobileCards.first()).toBeVisible();

    const initialNames = await dashboardPage.mobileCards.locator('h3').allTextContents();
    for (let i = 0; i < initialNames.length - 1; i++) {
      expect(initialNames[i].localeCompare(initialNames[i + 1])).toBeLessThanOrEqual(0);
    }

    // 2. Change to desktop viewport to click the Name sorting header
    await page.setViewportSize({ width: 1024, height: 768 });
    await dashboardPage.tableHeaderName.getByRole('button').click();

    // 3. Switch back to mobile viewport to assert descending order
    await page.setViewportSize({ width: 375, height: 812 });
    // Wait for card content to settle
    await expect(dashboardPage.mobileCards.first()).toBeVisible();
    const descNames = await dashboardPage.mobileCards.locator('h3').allTextContents();
    for (let i = 0; i < descNames.length - 1; i++) {
      expect(descNames[i].localeCompare(descNames[i + 1])).toBeGreaterThanOrEqual(0);
    }
  });

  test('sorts experience ascending and descending on mobile', async ({ page }) => {
    // 1. Start on desktop to click the Experience sorting header
    await page.setViewportSize({ width: 1024, height: 768 });
    await loginPage.navigate();
    await loginPage.login('recruiter@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Wait for students to load
    await expect(dashboardPage.tableRows.first()).toBeVisible();

    // Click Experience sorting header (toggles to ascending)
    await dashboardPage.tableHeaderExperience.getByRole('button').click();

    // Resize to mobile viewport to verify ascending sort
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(dashboardPage.mobileCards.first()).toBeVisible();
    const expTextAsc = await dashboardPage.mobileCards.locator('span.bg-slate-100').allTextContents();
    const expNumsAsc = expTextAsc.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));
    for (let i = 0; i < expNumsAsc.length - 1; i++) {
      expect(expNumsAsc[i]).toBeLessThanOrEqual(expNumsAsc[i + 1]);
    }

    // Change to desktop viewport to toggle descending sort
    await page.setViewportSize({ width: 1024, height: 768 });
    await dashboardPage.tableHeaderExperience.getByRole('button').click();

    // Resize to mobile viewport to verify descending sort
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(dashboardPage.mobileCards.first()).toBeVisible();
    const expTextDesc = await dashboardPage.mobileCards.locator('span.bg-slate-100').allTextContents();
    const expNumsDesc = expTextDesc.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));
    for (let i = 0; i < expNumsDesc.length - 1; i++) {
      expect(expNumsDesc[i]).toBeGreaterThanOrEqual(expNumsDesc[i + 1]);
    }
  });

  test('recruiter cannot see edit or delete buttons on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    // Verify edit/delete controls do not exist in the first mobile card
    await expect(dashboardPage.mobileCards.first().getByTitle('Edit')).toHaveCount(0);
    await expect(dashboardPage.mobileCards.first().getByTitle('Delete')).toHaveCount(0);
  });

  test('recruiter cannot edit from details modal on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    // Click the first card to open details modal
    await dashboardPage.mobileCards.first().click();
    await expect(dashboardPage.detailsEditButton).not.toBeVisible();
    await dashboardPage.closeDetailsButton.click();
  });

  test('student added by admin is visible to recruiter on mobile', async ({ page }) => {
    const studentName = `CrossRoleStudent_${Date.now()}`;

    // 1. Login as Admin on mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 2. Add Student via mobile view
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

    // 4. Login as Recruiter on mobile
    await loginPage.login('recruiter@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 5. Verify Recruiter Can See Student Card
    await dashboardPage.fillSearch(studentName);
    const card = await dashboardPage.getMobileCardByStudentId(studentName);
    await expect(card).toBeVisible();

    // 6. Verify details can be viewed but cannot edit
    await card.click();
    await expect(dashboardPage.dialog).toBeVisible();
    await expect(dashboardPage.detailsEditButton).not.toBeVisible();
  });

  test('recruiter pagination boundaries and rows adjustment on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);

    // Boundary check page 1
    await expect(dashboardPage.prevPageButton).toBeDisabled();
    await expect(dashboardPage.firstPageButton).toBeDisabled();

    // Update row count to 50
    await dashboardPage.changePageSize(50);

    // Verify total showing text changes and cards list updates
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 50 of 500/);
    await expect(dashboardPage.mobileCards).toHaveCount(50);
  });

  test('page resets to 1 on filter and page size change on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    await expect(dashboardPage.mobileCards.first()).toBeVisible();

    // Go to next page (Page 2)
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 1. Search filter resets page to 1
    await dashboardPage.fillSearch('Aarav Sharma');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 1 of 1/);

    // Clear search and return to page 2
    await dashboardPage.fillSearch('');
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 2. Country filter resets page to 1
    await dashboardPage.selectCountry('Germany');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 10 of/);

    // Clear country and return to page 2
    await dashboardPage.selectCountry('');
    await dashboardPage.navigateToPage('next');
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);

    // 3. Rows page size resets page to 1
    await dashboardPage.changePageSize(50);
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 50 of 500/);
  });

  test('combined filtering check on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    await expect(dashboardPage.mobileCards.first()).toBeVisible();

    // Set filters: Search "a", Country "India", Skill "React", Experience "0-2 Years" (min 0, max 2)
    await dashboardPage.fillSearch('a');
    await dashboardPage.selectCountry('India');
    await dashboardPage.selectSkill('React');
    await dashboardPage.selectExperience('0-2 Years');

    await expect(dashboardPage.mobileCards.first()).toBeVisible();

    // Assert every visible card matches all conditions
    const cards = dashboardPage.mobileCards;
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const name = await cards.nth(i).locator('h3').textContent();
      const country = await cards.nth(i).locator('p.mt-3').textContent();
      const experienceText = await cards.nth(i).locator('span.bg-slate-100').textContent();
      const skills = await cards.nth(i).locator('div.mt-3').textContent();

      expect(name.toLowerCase()).toContain('a');
      expect(country).toBe('India');
      expect(skills).toContain('React');

      const expVal = parseInt(experienceText.replace(/[^0-9]/g, ''), 10);
      expect(expVal).toBeGreaterThanOrEqual(0);
      expect(expVal).toBeLessThanOrEqual(2);
    }
  });

  test('search special characters safety on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);
    await expect(dashboardPage.mobileCards.first()).toBeVisible();

    // Type special regex string
    await dashboardPage.fillSearch('.*');
    await expect(dashboardPage.emptyState).toBeVisible();

    // Type parsing blocker
    await dashboardPage.fillSearch('[');
    await expect(dashboardPage.emptyState).toBeVisible();
  });

  test('session persistence on page reload on mobile', async ({ page }) => {
    await loginAsRecruiterMobile(loginPage);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify session remains intact
    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.signedInUserText).toBeVisible();
  });

  test('empty database zero-state for recruiter on mobile', async ({ page }) => {
    // 1. Set viewport and initialize with empty localStorage database
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
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

    // 4. Assert recruiter cannot see Add Student button on mobile
    await expect(dashboardPage.addStudentButton).not.toBeVisible();
  });

});
