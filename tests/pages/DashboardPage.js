import { expect } from '@playwright/test';

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Header & Authentication
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.signedInUserText = page.locator('header').or(page.locator('main')).locator('text=/Signed in as/').first();

    // Stats Cards
    this.statsContainer = page.locator('article');
    this.totalStudentsCard = this.statsContainer.filter({ hasText: 'Total Students' });
    this.totalCountriesCard = this.statsContainer.filter({ hasText: 'Total Countries' });
    this.totalSkillsCard = this.statsContainer.filter({ hasText: 'Total Skills' });

    // Actions & Add Student Modal trigger
    this.addStudentButton = page.getByRole('button', { name: 'Add Student' });
    this.editBtnFirst = page.getByTitle('Edit').first();
    this.deleteBtnFirst = page.getByTitle('Delete').first();

    // Filters Panel
    this.searchInput = page.getByPlaceholder('Search by name');
    this.skillFilter = page.getByLabel('Skill');
    this.countryFilter = page.getByLabel('Country');
    this.experienceFilter = page.getByLabel('Experience');
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear' });

    // Table elements (Desktop)
    this.table = page.locator('table');
    this.tableHeaderName = page.locator('thead th').filter({ hasText: 'Name' });
    this.tableHeaderExperience = page.locator('thead th').filter({ hasText: 'Experience' });
    this.tableRows = page.locator('tbody tr');

    // Mobile layout elements
    // The mobile view has a div with class "md:hidden" that displays articles for each student.
    // Note: Playwright locators need double backslash for colons in class names: 'div.md\:hidden article'
    this.mobileCards = page.locator('div.md\\:hidden article');

    // Empty state
    this.emptyState = page.getByTestId('empty-state');
    
    // Modal common locators
    this.dialog = page.getByRole('dialog');

    // Add / Edit Modal Form Fields (Inside Dialog)
    this.nameInput = this.dialog.getByLabel('Name');
    this.countrySelect = this.dialog.getByLabel('Country');
    this.experienceInput = this.dialog.getByLabel('Experience');
    this.saveStudentButton = this.dialog.getByRole('button', { name: 'Save Student' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
    this.closeFormButton = this.dialog.getByRole('button', { name: 'Close form' });

    // Student Details Modal Elements (Inside Dialog)
    this.closeDetailsButton = this.dialog.getByRole('button', { name: 'Close', exact: true });
    this.closeDetailsXButton = this.dialog.getByRole('button', { name: 'Close student details' });
    this.detailsEditButton = this.dialog.getByRole('button', { name: 'Edit Student' });

    // Pagination
    this.pageSizeSelect = page.getByLabel('Rows');
    this.firstPageButton = page.getByRole('button', { name: 'First page' });
    this.prevPageButton = page.getByRole('button', { name: 'Previous page' });
    this.nextPageButton = page.getByRole('button', { name: 'Next page' });
    this.lastPageButton = page.getByRole('button', { name: 'Last page' });
    this.paginationInfo = page.locator('p:has-text("Showing")');
    this.pageNumberText = page.locator('span.min-w-20');
  }

  // Common Actions
  async logout() {
    await this.logoutButton.click();
  }

  async fillSearch(name) {
    await this.searchInput.fill(name);
  }

  async selectSkill(skill) {
    await this.skillFilter.selectOption(skill);
  }

  async selectCountry(country) {
    await this.countryFilter.selectOption(country);
  }

  async selectExperience(range) {
    await this.experienceFilter.selectOption(range);
  }

  async clearFilters() {
    await this.clearFiltersButton.click();
  }

  async openAddStudentModal() {
    await this.addStudentButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillStudentForm({ name, country, experience, skills = [] }) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (country !== undefined) await this.countrySelect.selectOption(country);
    if (experience !== undefined) await this.experienceInput.fill(experience);

    // Toggle skills checkboxes
    for (const skill of skills) {
      const checkbox = this.dialog.getByLabel(skill, { exact: true });
      // If we want to check it, we make sure it's checked
      await checkbox.check();
    }
  }

  async checkSkillCheckbox(skill, action = 'check') {
    const checkbox = this.dialog.getByLabel(skill, { exact: true });
    if (action === 'check') {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async saveStudent() {
    await this.saveStudentButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  async getRowByStudentId(id) {
    return this.tableRows.filter({ hasText: id });
  }

  async getMobileCardByStudentId(id) {
    return this.mobileCards.filter({ hasText: id });
  }

  async clickRowByStudentId(id) {
    const row = await this.getRowByStudentId(id);
    await row.click();
  }

  async clickMobileCardByStudentId(id) {
    const card = await this.getMobileCardByStudentId(id);
    await card.click();
  }

  async clickEditOnRow(id) {
    const row = await this.getRowByStudentId(id);
    await row.getByTitle('Edit').click();
  }

  async clickDeleteOnRow(id) {
    const row = await this.getRowByStudentId(id);
    await row.getByTitle('Delete').click();
  }

  async clickEditOnMobileCard(id) {
    const card = await this.getMobileCardByStudentId(id);
    await card.getByTitle('Edit').click();
  }

  async clickDeleteOnMobileCard(id) {
    const card = await this.getMobileCardByStudentId(id);
    await card.getByTitle('Delete').click();
  }

  async changePageSize(size) {
    await this.pageSizeSelect.selectOption(String(size));
  }

  async navigateToPage(direction) {
    if (direction === 'first') await this.firstPageButton.click();
    else if (direction === 'prev') await this.prevPageButton.click();
    else if (direction === 'next') await this.nextPageButton.click();
    else if (direction === 'last') await this.lastPageButton.click();
  }
}
