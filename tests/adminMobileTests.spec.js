import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Helper to set mobile viewport and login as Admin
async function loginAsAdminMobile(loginPage) {
  await loginPage.page.setViewportSize({ width: 375, height: 812 });
  await loginPage.navigate();
  await loginPage.login('admin@test.com', '123456');
}

test.describe('Admin Mobile E2E Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test("Admin login test on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');
  });

  test("Logout test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);
    await dashboardPage.logout();
    await expect(page).toHaveURL('/login');
  });

  test("Invalid credentials test on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'wrongpassword');
    await loginPage.verifyError('Invalid credentials');
  });

  test("Route check for admin on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    // Try accessing dashboard unauthenticated
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/login');

    // Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Try going back to login while authenticated
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/dashboard');
  });

  test("Admin buttons visibility test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    // Verify Add Student button is visible
    await expect(dashboardPage.addStudentButton).toBeVisible();

    // Verify Edit and Delete buttons exist on the visible mobile cards
    await expect(dashboardPage.mobileCards.first().getByTitle('Edit')).toBeVisible();
    await expect(dashboardPage.mobileCards.first().getByTitle('Delete')).toBeVisible();
  });

  test("Try to login without email entry on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.fillPassword('123456');
    await loginPage.clickLogin();
    await loginPage.verifyError('Email is required');
  });

  test("Try to login without password entry on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.fillEmail('admin@test.com');
    await loginPage.clickLogin();
    await loginPage.verifyError('Password is required');
  });

  test("Password hiding button check on mobile", async function ({ page }) {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.fillEmail('admin@test.com');
    await loginPage.fillPassword('123456');

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // Toggle to text
    await loginPage.showPasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    // Toggle back to password
    await loginPage.hidePasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test("Add student test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    await dashboardPage.openAddStudentModal();

    // Fill form scoped to modal
    await dashboardPage.fillStudentForm({
      name: 'Mobile John Doe',
      country: 'India',
      experience: '3',
      skills: ['React', 'Node.js']
    });

    // Save
    await dashboardPage.saveStudent();

    // Search and verify card is visible
    await dashboardPage.fillSearch('Mobile John Doe');

    const addedCard = await dashboardPage.getMobileCardByStudentId('Mobile John Doe');
    await expect(addedCard).toBeVisible();
    await expect(addedCard.locator('h3')).toHaveText('Mobile John Doe');
    await expect(addedCard.getByText('India')).toBeVisible();
    await expect(addedCard.getByText('3 years')).toBeVisible();
  });

  test("View student details test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    // Find card and click it to open details
    await dashboardPage.clickMobileCardByStudentId('STU-001');

    await expect(dashboardPage.dialog).toBeVisible();
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Aarav Sharma' })).toBeVisible();
    await expect(dashboardPage.dialog.getByText('India')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('0 years')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('React')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('Node.js')).toBeVisible();

    // Close
    await dashboardPage.closeDetailsButton.click();
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test("Edit student test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    // Locate card and click its edit icon
    await dashboardPage.clickEditOnMobileCard('STU-001');

    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Edit Student' })).toBeVisible();

    // Modify
    await dashboardPage.fillStudentForm({
      name: 'Aarav Sharma Mobile Updated',
      experience: '2'
    });

    // Save
    await dashboardPage.saveStudent();

    // Verify card changes
    const updatedCard = await dashboardPage.getMobileCardByStudentId('Aarav Sharma Mobile Updated');
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByText('2 years')).toBeVisible();
  });

  test("Delete student test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    // Verify initial count
    await expect(dashboardPage.totalStudentsCard.getByText('500')).toBeVisible();

    // Click delete inside card
    await dashboardPage.clickDeleteOnMobileCard('STU-001');

    // Verify card is deleted
    await expect(page.locator('article').filter({ hasText: 'STU-001' })).not.toBeVisible();

    // Verify stats counter
    await expect(dashboardPage.totalStudentsCard.getByText('499')).toBeVisible();
  });

  test("Add student form validation test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    await dashboardPage.openAddStudentModal();

    // Submit is initially disabled
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Enter details with negative experience
    await dashboardPage.fillStudentForm({
      name: 'Invalid Student',
      country: 'Canada',
      experience: '-5',
      skills: ['React']
    });

    // Click Save
    await dashboardPage.saveStudentButton.click();
    await expect(dashboardPage.dialog).toBeVisible(); // modal stays open

    // Validity check
    const isInvalid = await dashboardPage.experienceInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);

    const validationMessage = await dashboardPage.experienceInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Value must be greater than or equal to 0');
  });

  test("Filters functionality test on mobile", async function ({ page }) {
    await loginAsAdminMobile(loginPage);

    // 1. Search Name
    await dashboardPage.fillSearch('Aarav');

    await expect(page.locator('article').filter({ hasText: 'Aarav Sharma' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Mia Johnson' })).not.toBeVisible();

    await dashboardPage.fillSearch('');

    // 2. Skill Filter
    await dashboardPage.selectSkill('Python');

    await expect(page.locator('article').filter({ hasText: 'Ava Johnson' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Aarav Sharma' })).not.toBeVisible();

    await dashboardPage.selectSkill('');

    // 3. Country Filter
    await dashboardPage.selectCountry('Germany');

    await expect(page.locator('article').filter({ hasText: 'Ben Weber' })).toBeVisible();
    await expect(page.locator('article').filter({ hasText: 'Aarav Sharma' })).not.toBeVisible();

    // 4. Clear Button
    await dashboardPage.clearFilters();

    await expect(page.locator('article').filter({ hasText: 'Aarav Sharma' })).toBeVisible();
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 10 of 500/);

    // 5. Pagination
    await dashboardPage.navigateToPage('next');

    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);
    await expect(page.locator('article').filter({ hasText: 'Aarav Sharma' })).not.toBeVisible();
  });

  test('sorts names ascending and descending on mobile', async ({ page }) => {
    // 1. Initial load (A-Z default ascending)
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await loginPage.login('admin@test.com', '123456');
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
    await loginPage.login('admin@test.com', '123456');
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

  test('Edit student form validation on mobile', async ({ page }) => {
    await loginAsAdminMobile(loginPage);

    // Locate the first mobile student card and click its edit button
    await dashboardPage.clickEditOnMobileCard('STU-001');

    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Edit Student' })).toBeVisible();

    // Clear out name
    await dashboardPage.nameInput.fill('');
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Fill valid name, enter negative experience
    await dashboardPage.nameInput.fill('Aarav Sharma Mobile Edited');
    await dashboardPage.experienceInput.fill('-10');

    // Click Save
    await dashboardPage.saveStudentButton.click();
    await expect(dashboardPage.dialog).toBeVisible(); // modal stays open

    // Verify validity checks
    const isInvalid = await dashboardPage.experienceInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);

    const validationMessage = await dashboardPage.experienceInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Value must be greater than or equal to 0');

    // Close modal
    await dashboardPage.cancelButton.click();
  });

  test('statistics card updates on student addition on mobile', async ({ page }) => {
    await loginAsAdminMobile(loginPage);

    await expect(dashboardPage.totalStudentsCard.getByText('500')).toBeVisible();

    // Add student
    await dashboardPage.openAddStudentModal();
    await dashboardPage.fillStudentForm({
      name: 'Mobile Stats Student',
      country: 'Japan',
      experience: '4',
      skills: ['Python']
    });
    await dashboardPage.saveStudent();

    // Verify stats card increments to 501
    await expect(dashboardPage.totalStudentsCard.getByText('501')).toBeVisible();
  });

  test('Skills boundary validation on mobile', async ({ page }) => {
    await loginAsAdminMobile(loginPage);

    await dashboardPage.openAddStudentModal();

    await dashboardPage.fillStudentForm({
      name: 'Mobile Skills Boundary',
      country: 'India',
      experience: '1'
    });

    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    await dashboardPage.checkSkillCheckbox('React', 'check');
    await expect(dashboardPage.saveStudentButton).toBeEnabled();

    await dashboardPage.checkSkillCheckbox('React', 'uncheck');
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    await dashboardPage.cancelButton.click();
  });

  test('empty database zero-state and recovery on mobile', async ({ page }) => {
    // 1. Set viewport and initialize empty database
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.navigate();
    await page.evaluate(() => localStorage.setItem('sms_students', '[]'));

    // 2. Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // 3. Assert zero-state UI
    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(page.getByText('No students available')).toBeVisible();

    await expect(dashboardPage.totalStudentsCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.totalCountriesCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.totalSkillsCard.getByText('0')).toBeVisible();
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 0 to 0 of 0/);

    // 4. Perform Add Student
    await dashboardPage.openAddStudentModal();
    await dashboardPage.fillStudentForm({
      name: 'Mobile Recovery Student',
      country: 'USA',
      experience: '2',
      skills: ['React']
    });
    await dashboardPage.saveStudent();

    // 5. Verify recovery
    await expect(dashboardPage.emptyState).not.toBeVisible();
    const addedCard = await dashboardPage.getMobileCardByStudentId('Mobile Recovery Student');
    await expect(addedCard).toBeVisible();

    await expect(dashboardPage.totalStudentsCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.totalCountriesCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.totalSkillsCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 1 of 1/);
  });

});
