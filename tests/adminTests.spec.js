import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';

// Helper to login as Admin on desktop
async function loginAsAdmin(loginPage) {
  await loginPage.navigate();
  await loginPage.login('admin@test.com', '123456');
}

test.describe('Admin Desktop E2E Tests', () => {
  let loginPage;
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Admin login test', async function ({ page }) {
    await loginPage.navigate();
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Logout test', async function ({ page }) {
    await loginAsAdmin(loginPage);
    await dashboardPage.logout();
    await expect(page).toHaveURL('/login');
  });

  test('Invalid credentials test', async function ({ page }) {
    await loginPage.navigate();
    await loginPage.login('admin@test.com', 'wrongpassword');
    await loginPage.verifyError('Invalid credentials');
  });

  test('Route check for admin', async function ({ page }) {
    // Try to access the dashboard directly without logging in
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/login');

    // Login
    await loginPage.login('admin@test.com', '123456');
    await expect(page).toHaveURL('/dashboard');

    // Try to navigate back to the login page
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Admin buttons visibility test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Verify that the "Add Student" button is visible to the Admin
    await expect(dashboardPage.addStudentButton).toBeVisible();

    // Verify that the "Edit" and "Delete" icons exist in the table
    await expect(dashboardPage.editBtnFirst).toBeVisible();
    await expect(dashboardPage.deleteBtnFirst).toBeVisible();
  });

  test('Try to login without email entry', async function ({ page }) {
    await loginPage.navigate();
    await loginPage.fillPassword('123456');
    await loginPage.clickLogin();
    await loginPage.verifyError('Email is required');
  });

  test('Try to login without password entry', async function ({ page }) {
    await loginPage.navigate();
    await loginPage.fillEmail('admin@test.com');
    await loginPage.clickLogin();
    await loginPage.verifyError('Password is required');
  });

  test('Password hiding button check', async function ({ page }) {
    await loginPage.navigate();
    await loginPage.fillEmail('admin@test.com');
    await loginPage.fillPassword('123456');

    // Verify the password input is initially masked (type="password")
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    // Click the "Show password" button
    await loginPage.showPasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

    // Click the "Hide password" button to mask it again
    await loginPage.hidePasswordButton.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Add student test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Open "Add Student" Modal
    await dashboardPage.openAddStudentModal();
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Add Student' })).toBeVisible();

    // Fill the form elements inside the modal
    await dashboardPage.fillStudentForm({
      name: 'John Doe',
      country: 'India',
      experience: '3',
      skills: ['React', 'Node.js']
    });

    // Save & Verify Modal Closes
    await dashboardPage.saveStudent();
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Add Student' })).not.toBeVisible();

    // Filter table by searching for the added student's name
    await dashboardPage.fillSearch('John Doe');

    // Verify row added to Table
    const row = await dashboardPage.getRowByStudentId('John Doe');
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell', { name: 'India' }).first()).toBeVisible();
    await expect(row.getByRole('cell', { name: '3 years' }).first()).toBeVisible();
  });

  test('View student details test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Click on a student's row (Aarav Sharma - STU-001) to open the details modal
    await dashboardPage.clickRowByStudentId('STU-001');

    // Verify details modal content
    await expect(dashboardPage.dialog).toBeVisible();
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Aarav Sharma' })).toBeVisible();
    await expect(dashboardPage.dialog.getByText('India')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('0 years')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('React')).toBeVisible();
    await expect(dashboardPage.dialog.getByText('Node.js')).toBeVisible();

    // Close the modal
    await dashboardPage.closeDetailsButton.click();
    await expect(dashboardPage.dialog).not.toBeVisible();
  });

  test('Edit student test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Find Aarav Sharma's row (STU-001) and click the Edit button in that row
    await dashboardPage.clickEditOnRow('STU-001');

    // Locate the modal dialog and verify it is visible
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Edit Student' })).toBeVisible();

    // Edit the fields inside the modal
    await dashboardPage.fillStudentForm({
      name: 'Aarav Sharma Updated',
      experience: '2'
    });

    // Click Save and verify the modal closes
    await dashboardPage.saveStudent();

    // Verify the updated details inside the student's row in the table
    const updatedRow = await dashboardPage.getRowByStudentId('Aarav Sharma Updated');
    await expect(updatedRow.getByRole('cell', { name: 'Aarav Sharma Updated', exact: true })).toBeVisible();
    await expect(updatedRow.getByRole('cell', { name: '2 years' })).toBeVisible();
  });

  test('Delete student test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Verify initial total student count is 500
    await expect(dashboardPage.totalStudentsCard.getByText('500')).toBeVisible();

    // Find Aarav Sharma's row (STU-001) and click the Delete button
    await dashboardPage.clickDeleteOnRow('STU-001');

    // Verify Aarav Sharma (STU-001) is no longer in the table
    await expect(page.getByRole('cell', { name: 'STU-001', exact: true })).not.toBeVisible();

    // Verify that the Total Students stat card has updated to 499
    await expect(dashboardPage.totalStudentsCard.getByText('499')).toBeVisible();
  });

  test('Add student form validation test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // Open "Add Student" Modal
    await dashboardPage.openAddStudentModal();
    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Add Student' })).toBeVisible();

    // Verify that "Save Student" button is initially disabled
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Fill required fields to enable the button, but use a negative experience to block submission
    await dashboardPage.fillStudentForm({
      name: 'Invalid Student',
      country: 'Canada',
      experience: '-5',
      skills: ['React']
    });

    // Click the Save button
    await dashboardPage.saveStudentButton.click();

    // Verify the modal remains open (proving submission was blocked)
    await expect(dashboardPage.dialog).toBeVisible();

    // Verify the browser flagged the Experience input as invalid
    const isInvalid = await dashboardPage.experienceInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);

    // Verify the browser's exact validation message
    const validationMessage = await dashboardPage.experienceInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Value must be greater than or equal to 0');
  });

  test('Filters functionality test', async function ({ page }) {
    await loginAsAdmin(loginPage);

    // 1. Test Search by Name
    await dashboardPage.fillSearch('Aarav');

    await expect(page.getByRole('cell', { name: 'Aarav Sharma', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Mia Johnson', exact: true })).not.toBeVisible();

    // Clear search
    await dashboardPage.fillSearch('');

    // 2. Test Skill Filter
    await dashboardPage.selectSkill('Python');

    await expect(page.getByRole('cell', { name: 'Ava Johnson', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Aarav Sharma', exact: true })).not.toBeVisible();

    // Reset Skill Filter
    await dashboardPage.selectSkill('');

    // 3. Test Country Filter
    await dashboardPage.selectCountry('Germany');

    await expect(page.getByRole('cell', { name: 'Ben Weber', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Aarav Sharma', exact: true })).not.toBeVisible();

    // 4. Test Clear Button
    await dashboardPage.clearFilters();

    // Verify Aarav Sharma is visible again
    await expect(page.getByRole('cell', { name: 'Aarav Sharma', exact: true })).toBeVisible();

    // Verify initial pagination info
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 10 of 500/);

    // Navigate to Page 2
    await dashboardPage.navigateToPage('next');

    // Verify we are on Page 2
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 11 to 20 of 500/);
    await expect(page.getByRole('cell', { name: 'Aarav Sharma', exact: true })).not.toBeVisible();
  });

  test('sorts names ascending and descending', async ({ page }) => {
    await loginAsAdmin(loginPage);
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
    await loginAsAdmin(loginPage);
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

  test('Edit student form validation', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Open Edit modal for Aarav Sharma (STU-001)
    await dashboardPage.clickEditOnRow('STU-001');

    await expect(dashboardPage.dialog.getByRole('heading', { name: 'Edit Student' })).toBeVisible();

    // Clear out the name field
    await dashboardPage.nameInput.fill('');
    // Verify that "Save Student" button becomes disabled
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Restore name but enter negative experience
    await dashboardPage.nameInput.fill('Aarav Sharma Edited');
    await dashboardPage.experienceInput.fill('-10');

    // Click Save
    await dashboardPage.saveStudentButton.click();

    // Verify modal remains open
    await expect(dashboardPage.dialog).toBeVisible();

    // Verify validity checks
    const isInvalid = await dashboardPage.experienceInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);

    const validationMessage = await dashboardPage.experienceInput.evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Value must be greater than or equal to 0');

    // Close modal
    await dashboardPage.cancelButton.click();
  });

  test('statistics card updates on student addition', async ({ page }) => {
    await loginAsAdmin(loginPage);

    await expect(dashboardPage.totalStudentsCard.getByText('500')).toBeVisible();

    // Open modal and add student
    await dashboardPage.openAddStudentModal();
    await dashboardPage.fillStudentForm({
      name: 'Stats Test Student',
      country: 'India',
      experience: '1',
      skills: ['React']
    });
    await dashboardPage.saveStudent();

    // Verify total students stats card increments to 501
    await expect(dashboardPage.totalStudentsCard.getByText('501')).toBeVisible();
  });

  test('Skills boundary validation on add form', async ({ page }) => {
    await loginAsAdmin(loginPage);

    // Open modal
    await dashboardPage.openAddStudentModal();

    // Fill other required fields
    await dashboardPage.fillStudentForm({
      name: 'Skills Check Student',
      country: 'USA',
      experience: '2'
    });

    // Save button is initially disabled because no skills checked
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Check one skill
    await dashboardPage.checkSkillCheckbox('React', 'check');
    // Verify save button is enabled
    await expect(dashboardPage.saveStudentButton).toBeEnabled();

    // Uncheck that skill
    await dashboardPage.checkSkillCheckbox('React', 'uncheck');
    // Verify save button becomes disabled again
    await expect(dashboardPage.saveStudentButton).toBeDisabled();

    // Close modal
    await dashboardPage.cancelButton.click();
  });

  test('empty database zero-state and recovery', async ({ page }) => {
    // 1. Initialize with empty localStorage database
    await page.goto('/login');
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

    // 4. Perform Admin operation (Add Student to recover database)
    await dashboardPage.openAddStudentModal();
    await dashboardPage.fillStudentForm({
      name: 'Recovery Student',
      country: 'India',
      experience: '1',
      skills: ['React']
    });
    await dashboardPage.saveStudent();

    // 5. Verify database recovery UI updates
    await expect(dashboardPage.emptyState).not.toBeVisible();
    const row = await dashboardPage.getRowByStudentId('Recovery Student');
    await expect(row).toBeVisible();

    await expect(dashboardPage.totalStudentsCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.totalCountriesCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.totalSkillsCard.getByText('1')).toBeVisible();
    await expect(dashboardPage.paginationInfo).toHaveText(/Showing 1 to 1 of 1/);
  });

});
