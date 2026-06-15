import { test, expect } from '@playwright/test'

test("Admin login test", async function ({ page }) {
    // Await the page navigation so the page fully loads
    await page.goto('http://127.0.0.1:5173/login')

    // Fill in credentials using standard, robust locators
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')

    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click()

    // Assert that we successfully navigate to the dashboard
    await expect(page).toHaveURL('/dashboard')
})


test("Logout test", async function ({ page }) {
    // 1. Log in first
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')
    // 2. Click the Logout button in the header
    await page.getByRole('button', { name: 'Logout' }).click()
    // 3. Verify redirection back to the login page
    await expect(page).toHaveURL('/login')
})

test("Invalid credentials test", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('wrongpassword')
    await page.getByRole('button', { name: 'Login' }).click()

    //verify that the error message is correctly displayed
    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toHaveText('Invalid credentials')
})

test("Route check for admin", async function ({ page }) {
    // try to access the dashboard directly without logging in
    await page.goto('http://127.0.0.1:5173/dashboard')

    // verify that we are redirected to the login page
    await expect(page).toHaveURL('/login')

    //login again
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')

    //try to navigate back to the login page
    await page.goto('http://127.0.0.1:5173/login')

    //verify that redirects back to the dashboard
    await expect(page).toHaveURL('/dashboard')
})


test("Admin buttons visibility test", async function ({ page }) {
    // 1. Log in as Admin
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')

    // 2. Verify that the "Add Student" button is visible to the Admin
    await expect(page.getByRole('button', { name: 'Add Student' })).toBeVisible()

    // 3. Verify that the "Edit" and "Delete" icons exist in the table
    await expect(page.getByTitle('Edit').first()).toBeVisible()
    await expect(page.getByTitle('Delete').first()).toBeVisible()
})


test("Try to login without email entry", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()

    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toHaveText('Email is required')
})

test("Try to login without password entry", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByRole('button', { name: 'Login' }).click()

    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
    await expect(errorAlert).toHaveText('Password is required')
})


test("Password hiding button check", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456') // Fixed 'true'

    const passwordInput = page.locator('#password')

    // 1. Verify the password input is initially masked (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // 2. Click the "Show password" button
    await page.getByRole('button', { name: 'Show password' }).click()

    // 3. Verify the password is now visible (type="text")
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // 4. Click the "Hide password" button to mask it again
    await page.getByRole('button', { name: 'Hide password' }).click()

    // 5. Verify the password is masked again (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password')
})


test("Add student test", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Open "Add Student" Modal
    await page.getByRole('button', { name: 'Add Student' }).click()
    await expect(page.getByRole('heading', { name: 'Add Student' })).toBeVisible()

    //modal dialog box
    const modal = page.getByRole('dialog')

    // Fill the form elements inside the modal
    await modal.getByLabel('Name').fill('John Doe') // Scoped to modal (replaces the placeholder fix)
    await modal.getByLabel('Country').selectOption('India') // Scoped to modal
    await modal.getByLabel('Experience').fill('3') // Scoped to modal

    // Check checkboxes inside the modal
    await modal.getByLabel('React', { exact: true }).check()
    await modal.getByLabel('Node.js', { exact: true }).check()

    // Save & Verify Modal Closes
    await modal.getByRole('button', { name: 'Save Student' }).click()
    await expect(page.getByRole('heading', { name: 'Add Student' })).not.toBeVisible()

    // Verify row added to Table
    await expect(page.getByRole('cell', { name: 'John Doe', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'India' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: '3 years' }).first()).toBeVisible()
})


test("View student details test", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Click on a student's row (Aarav Sharma) to open the details modal
    await page.getByRole('cell', { name: 'Aarav Sharma', exact: true }).click()

    // Verify details modal content
    const detailsModal = page.getByRole('dialog')
    await expect(detailsModal).toBeVisible()
    await expect(detailsModal.getByRole('heading', { name: 'Aarav Sharma' })).toBeVisible()
    await expect(detailsModal.getByText('India')).toBeVisible()
    await expect(detailsModal.getByText('1 year')).toBeVisible()
    await expect(detailsModal.getByText('React')).toBeVisible()
    await expect(detailsModal.getByText('Node.js')).toBeVisible()

    // Close the modal
    await detailsModal.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(detailsModal).not.toBeVisible()
})


test("Edit student test", async function ({ page }) {
    await page.goto('http://127.0.0.1:5173/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com')
    await page.getByLabel('Password', { exact: true }).fill('123456')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL('/dashboard')

    // Find Aarav Sharma's row and click the Edit button in that row
    const studentRow = page.locator('tr').filter({ hasText: 'Aarav Sharma' })
    await studentRow.getByTitle('Edit').click()

    // Locate the modal dialog and verify it is visible
    const modal = page.getByRole('dialog')
    await expect(modal.getByRole('heading', { name: 'Edit Student' })).toBeVisible()

    // Edit the fields inside the modal (scoped to the modal to avoid duplicates)
    await modal.getByLabel('Name').fill('Aarav Sharma Updated')
    await modal.getByLabel('Experience').fill('2')

    // Click Save and verify the modal closes
    await modal.getByRole('button', { name: 'Save Student' }).click()
    await expect(modal).not.toBeVisible()

    // Verify the updated details inside the student's row in the table
    const updatedRow = page.locator('tr').filter({ hasText: 'Aarav Sharma Updated' })
    await expect(updatedRow.getByRole('cell', { name: 'Aarav Sharma Updated', exact: true })).toBeVisible()
    await expect(updatedRow.getByRole('cell', { name: '2 years' })).toBeVisible() // Scoped to this row, so no duplicates!
})
