# Weekly Status Report: Student Management System (SMS) Frontend & Automation

## 📅 Report Details
- **Date**: June 16, 2026
- **Status**: Completed (Frontend POC & Playwright E2E Suite)
- **Scope**: Frontend UI Features, Role-Based Capabilities, and Automated E2E Test Cases

---

## 🖥️ 1. Frontend UI Overview & Features

The **Recruitment Student Management System (SMS)** is a modern, responsive single-page React application (Single Page Application POC) styled with Tailwind CSS. It serves as a dashboard for managing student recruitment profiles with robust authorization levels.

### 🛠️ Technology Stack
*   **Core Framework**: React 19 & React Router DOM v7 (for routing/guards)
*   **Styling & Design**: Vanilla CSS & Tailwind CSS v4.0 (for modern, responsive layouts)
*   **Build Tool**: Vite v6.0
*   **Icons**: Lucide React
*   **Automation Suite**: Playwright E2E v1.60

### 💡 Key UI Features & Capabilities

1.  **Authentication Page & Route Guards**
    *   **Login Interface**: Screen presenting user fields, validation error messages, and credentials shortcuts.
    *   **Demo credentials cards**: Directly visible on the page (Admin: `admin@test.com`, Recruiter: `recruiter@test.com`) for testing.
    *   **Password Toggle Visibility**: "Show password" / "Hide password" eye icon toggles the input type between `password` and `text`.
    *   **Authentication Guards**: Unauthenticated users trying to hit `/dashboard` are auto-redirected back to `/login`. Logged-in users attempting to hit `/login` are auto-redirected back to `/dashboard`.

2.  **Role-Based Access Control (RBAC)**
    *   **Admin Mode**: Full permissions. The "Add Student" button, "Edit" buttons, and "Delete" buttons are fully accessible on the dashboard and inside modals.
    *   **Recruiter Mode**: Read-Only permissions. Recruiters can search, filter, paginate, sort, and view student details, but the "Add Student" button and all "Edit"/"Delete" interaction points are hidden from both the dashboard table and the modals.

3.  **Real-Time Statistics Dashboard**
    *   Dynamic summary cards displaying real-time database numbers:
        *   **Total Students** (e.g., initial 500)
        *   **Total Countries** represented
        *   **Total Skills** registered
    *   These stats dynamically increment or decrement when students are added or deleted by an Admin.

4.  **Advanced Filters, Search & Reset**
    *   **Name Search**: Case-insensitive, partial-string search that trims input whitespace.
    *   **Skill Filter**: Dropdown filtering based on technologies (React, Angular, Node.js, Java, Python).
    *   **Country Filter**: Dropdown filtering by region (India, USA, Germany, Canada, Japan).
    *   **Experience Filter**: Grouped dropdown range filtering (0-2 years, 3-5 years, 5+ years).
    *   **Clear Button**: Instantly resets all filters back to defaults and restores the entire dataset.

5.  **Interactive Data Table**
    *   **Desktop View**: Clean tabular grid displaying ID, Name, Country, Years of Experience, Skills (as visual tags), and Actions (Edit/Delete for Admins).
    *   **Mobile View**: Collapses the tabular layout into optimized visual cards for ease of reading on smaller screens.
    *   **Column Sorting**: Clicking the **Name** or **Experience** header text toggles alphabetical (A-Z/Z-A) and numerical sorting.
    *   **Row Click Interaction**: Clicking anywhere on a student's row opens a descriptive profile card detail modal.
    *   **Empty State**: Shows a clean "No students found" message when search queries return 0 results.

6.  **Pagination Control**
    *   Prevents performance bottlenecks by splitting records.
    *   **Page Size Selector**: Dropdown options to display 10, 20, or 50 items per page.
    *   **Navigation Links**: First Page, Previous, Page Indicators, Next, and Last Page.
    *   **Visual Count Details**: Shows "Showing X to Y of Z" text. Updates or resets back to page 1 on search filter edits.

7.  **CRUD Actions & Local Storage Persistence**
    *   **Add Student Modal**: Validation-supported form. The "Save Student" button is disabled until Name, Country, Experience, and at least one Skill are filled.
    *   **Edit Student Modal**: Reuses the modal to edit and update a student's existing values.
    *   **Delete Student Action**: Prompts immediate deletion, removing the row and updating the counts in real-time.
    *   **Local Storage Hydration**: All operations are stored under `sms_students` key to persist custom state across page reloads. Falls back to a mock file of 500 students if local storage is blank.

---

## 🧪 2. E2E Test Suite Status

An automated end-to-end test suite has been implemented using **Playwright**. It ensures application robustness across logins, data entry, filters, and authorization restrictions.

*   **Total Test Files**: 4 (excluding core UI layout and config tests)
*   **Total E2E Test Cases**: 74 (Admin: 20 Desktop / 20 Mobile; Recruiter: 17 Desktop / 17 Mobile)

---

### 🔑 A. Admin Desktop Test Cases (`tests/adminTests.spec.js`)
*File location: [adminTests.spec.js](file:///c:/Users/piyush.d.kashyap/OneDrive%20-%20Accenture/Desktop/Main/PlayWrightAutomation_Frontend_Testing/tests/adminTests.spec.js)*

This suite contains **20 test cases** targeting administrative control, page routing, form inputs, validation triggers, CRUD operations, column sorting, and pagination checks on desktop layout:

1.  **Admin login test**: Validates that logging in with credentials `admin@test.com` and `123456` redirects correctly to `/dashboard`.
2.  **Logout test**: Verifies that clicking "Logout" clears the session and returns the user to `/login`.
3.  **Invalid credentials test**: Asserts that using an incorrect password displays an alert stating `"Invalid credentials"`.
4.  **Route check for admin**: Verifies route guarding. Directly hitting `/dashboard` unauthenticated redirects to `/login`. Hitting `/login` when already logged in redirects to `/dashboard`.
5.  **Admin buttons visibility test**: Verifies that the `"Add Student"`, `"Edit"`, and `"Delete"` action elements are visible to Admin users in the table.
6.  **Try to login without email entry**: Validates that leaving the email field empty triggers a validation error stating `"Email is required"`.
7.  **Try to login without password entry**: Validates that leaving the password field empty triggers a validation error stating `"Password is required"`.
8.  **Password hiding button check**: Asserts that the password input toggles type between `password` and `text` when clicking the Show/Hide eye buttons.
9.  **Add student test**: Opens the form, fills valid details (John Doe, India, 3 Years, React & Node.js), saves, and searches the table to verify the new row is added.
10. **View student details test**: Verifies that clicking a student row (e.g., Aarav Sharma - STU-001) successfully opens the read-only details modal showing correct profile details.
11. **Edit student test**: Clicks edit on a student row, modifies Name and Experience, clicks save, and asserts that the table updates with the updated info.
12. **Delete student test**: Asserts that deleting a student removes the row from the table and decreases the "Total Students" dashboard KPI counter by 1.
13. **Add student form validation test**: Verifies the "Save Student" button is disabled until requirements are met. Confirms entering negative experience values (e.g., `-5`) fails form submission and triggers browser validation.
14. **Filters functionality test**: Verifies the table correctly updates on name searches, skill filtering, country filtering, and resets upon clicking the Clear button. Also validates next page navigation.
15. **sorts names ascending and descending**: Asserts that names are sorted alphabetically ascending on load, descending after one click, and ascending after a second click.
16. **sorts experience ascending and descending**: Asserts that clicking the Experience header once sorts students numerically by experience (ascending), and a second click sorts them descending.
17. **Edit student form validation**: Verifies clearing the Name field inside the Edit modal disables the save button, and inputting negative experience blocks submission.
18. **statistics card updates on student addition**: Asserts that adding a new student correctly increments the total count stat widget from 500 to 501.
19. **Skills boundary validation on add form**: Asserts that unchecking all skills in the Add Form disables the save button, requiring at least one skill to be selected.
20. **empty database zero-state and recovery**: Verifies empty database initialization displays `"No students available"`, sets KPI counts to `0`, sets pagination text to `"Showing 0 to 0 of 0"`, and validates database recovery updates stats and renders the added record.

---

### 📱 B. Admin Mobile Test Cases (`tests/adminMobileTests.spec.js`)
*File location: [adminMobileTests.spec.js](file:///c:/Users/piyush.d.kashyap/OneDrive%20-%20Accenture/Desktop/Main/PlayWrightAutomation_Frontend_Testing/tests/adminMobileTests.spec.js)*

This suite contains **20 test cases** that mirror the admin desktop tests, but are specifically adapted for mobile screen viewports (375x812) and check mobile cards (`article`) instead of table rows:

21. **Admin login test on mobile**: Validates Admin login behaves correctly on mobile.
22. **Logout test on mobile**: Verifies that clicking "Logout" clears the session and returns the user to `/login` on mobile.
23. **Invalid credentials test on mobile**: Asserts that using an incorrect password displays an alert stating `"Invalid credentials"`.
24. **Route check for admin on mobile**: Verifies route guarding (blocking `/dashboard` and redirecting `/login`) on mobile screen dimensions.
25. **Admin buttons visibility test on mobile**: Verifies that the `"Add Student"`, `"Edit"`, and `"Delete"` action elements exist inside mobile cards.
26. **Try to login without email entry on mobile**: Validates email input required message on mobile.
27. **Try to login without password entry on mobile**: Validates password input required message on mobile.
28. **Password hiding button check on mobile**: Asserts that the password input toggles type when clicking Show/Hide on mobile viewports.
29. **Add student test on mobile**: Fills valid details, saves, and searches the cards layout to verify the card is added.
30. **View student details test on mobile**: Verifies that clicking a student card opens the details modal showing correct profile info.
31. **Edit student test on mobile**: Clicks edit on a student card, modifies Name/Experience, and verifies card updates.
32. **Delete student test on mobile**: Asserts that deleting a student removes the card and updates the KPI counter to 499.
33. **Add student form validation test on mobile**: Verifies validation trigger and disabled button behavior on mobile forms.
34. **Filters functionality test on mobile**: Verifies mobile cards filter on name, skill, country, clear action, and pagination page navigation.
35. **sorts names ascending and descending on mobile**: Performs a viewport transition test to click the header, resizing to mobile to verify cards sort ascending/descending.
36. **sorts experience ascending and descending on mobile**: Performs a viewport transition test to click the header, resizing to mobile to verify experience badge counts sort ascending/descending.
37. **Edit student form validation on mobile**: Verifies modal validation constraints on edit input fields on a mobile screen.
38. **statistics card updates on student addition on mobile**: Asserts that adding a new student correctly increments the total students widget count to 501 on mobile.
39. **Skills boundary validation on mobile**: Checks that the Save button becomes disabled when unchecking all skills in the mobile form view.
40. **empty database zero-state and recovery on mobile**: Asserts that initializing with an empty database renders zero-state elements and statistics of `0` on mobile, and recovery dynamically updates mobile student cards list and pagination to `Showing 1 to 1 of 1`.

---

### 🛡️ C. Recruiter Desktop Test Cases (`tests/recruiterTests.spec.js`)
*File location: [recruiterTests.spec.js](file:///c:/Users/piyush.d.kashyap/OneDrive%20-%20Accenture/Desktop/Main/PlayWrightAutomation_Frontend_Testing/tests/recruiterTests.spec.js)*

This suite contains **17 test cases** focused on search functionality, case-sensitivity, sorting, empty states, and verifying recruiter read-only constraints:

41. **signed in email is displayed**: Asserts that logging in as recruiter displays the message `"Signed in as recruiter@test.com"` in the dashboard header.
42. **whitespace email treated as empty**: Validates that attempting to log in with spaces as the email input triggers the `"Email is required"` error alert.
43. **search is case insensitive**: Confirms that searching for a name using lowercase (e.g., `"mia"`) or uppercase (e.g., `"MIA"`) yields the exact same list of student rows.
44. **search with no matches shows empty state**: Validates that searching for a non-existent student shows the `"empty-state"` element with the text `"No students found"`.
45. **clear resets search filter**: Asserts that filtering the table for a student and then clicking the Clear button resets the search input and restores the original table view.
46. **recruiter cannot see add student button**: Verifies that the `"Add Student"` button is hidden from the UI for recruiter sessions.
47. **sorts names ascending and descending**: Asserts that names are sorted alphabetically ascending on load, descending after one click, and ascending after a second click.
48. **sorts experience ascending and descending**: Asserts that clicking the Experience header once sorts students numerically by experience (ascending), and a second click sorts them descending.
49. **recruiter cannot see edit or delete buttons**: Verifies that neither the Edit nor the Delete action icons are present in the table rows for a Recruiter.
50. **recruiter cannot edit from details modal**: Confirms that opening a student details modal does not show an `"Edit Student"` button, and clicking close dismisses the modal.
51. **student added by admin is visible to recruiter**: Verifies cross-role data sync. Adds a student via Admin session, logs out, logs in as Recruiter, searches for the student, and asserts the Recruiter can view details but cannot edit.
52. **recruiter pagination boundaries and rows adjustment**: Verifies navigation boundaries and size adjustment to 50 rows in the desktop table.
53. **page resets to 1 on filter and page size change**: Verifies that moving to page 2 and changing search (using Aarav Sharma), country filters, or rows page size resets the view back to page 1.
54. **combined filtering check**: Asserts that applying search, country, skill, and experience filters concurrently returns only matching items that satisfy all criteria.
55. **search special characters safety**: Verifies that entering search terms with special regex characters (like `.*` or `[`) handles gracefully showing an empty state without throwing runtime errors.
56. **session persistence on page reload**: Validates that refreshing the browser retains the recruiter login session state and doesn't redirect back to `/login`.
57. **empty database zero-state for recruiter**: Asserts that initializing with an empty database renders zero-state elements, statistics of `0`, and pagination `"Showing 0 to 0 of 0"` on desktop, confirming recruiter cannot see the `"Add Student"` button.

---

### 📱 D. Recruiter Mobile Test Cases (`tests/recruiterMobileTests.spec.js`)
*File location: [recruiterMobileTests.spec.js](file:///c:/Users/piyush.d.kashyap/OneDrive%20-%20Accenture/Desktop/Main/PlayWrightAutomation_Frontend_Testing/tests/recruiterMobileTests.spec.js)*

This suite contains **17 test cases** that mirror the recruiter desktop tests, but are specifically adapted for mobile screen viewports (375x812) and check mobile cards (`article`) instead of table rows:

58. **signed in email is displayed on mobile**: Asserts that recruiter login displays the signed in message on a mobile screen.
59. **whitespace email treated as empty on mobile**: Checks whitespace validation on mobile viewport login page.
60. **search is case insensitive on mobile**: Validates lowercase and uppercase queries yield identical card structures (`div.md\\:hidden article`).
61. **search with no matches shows empty state on mobile**: Checks no matches state works correctly on mobile screens.
62. **clear resets search filter on mobile**: Searches on mobile, checks card list has 1 entry, clicks Clear, and verifies Aarav Sharma card returns.
63. **recruiter cannot see add student button on mobile**: Verifies the "Add Student" header button is hidden on mobile layout.
64. **sorts names ascending and descending on mobile**: Performs a viewport transition test to click the header, resizing to mobile to verify cards sort ascending/descending.
65. **sorts experience ascending and descending on mobile**: Performs a viewport transition test to click the header, resizing to mobile to verify experience badge counts sort ascending/descending.
66. **recruiter cannot see edit or delete buttons on mobile**: Asserts that the first mobile card does not render edit/delete actions inside it.
67. **recruiter cannot edit from details modal on mobile**: Clicks the first mobile card container to open details modal, verifying no edit actions are present inside the modal.
68. **student added by admin is visible to recruiter on mobile**: Admin creates student via mobile viewport, logs out, recruiter logs in on mobile, searches for student, clicks card, and views read-only profile details modal.
69. **recruiter pagination boundaries and rows adjustment on mobile**: Asserts page boundary buttons are disabled on page 1 and verifies page size dropdown of 50 updates cards count to 50 on mobile viewports.
70. **page resets to 1 on filter and page size change on mobile**: Asserts that applying searches (using Aarav Sharma), filter settings, or changing row sizing while on page 2 resets page numbering to page 1 on mobile layout.
71. **combined filtering check on mobile**: Asserts that filtering by name, country, skill, and experience simultaneously restricts mobile card rendering correctly to matches.
72. **search special characters safety on mobile**: Verifies that regex query search characters on mobile views handle gracefully and show an empty state.
73. **session persistence on page reload on mobile**: Asserts that reloading the page in a mobile layout retains the recruiter user session correctly.
74. **empty database zero-state for recruiter on mobile**: Asserts that initializing with an empty database renders zero-state elements, statistics of `0`, and pagination `"Showing 0 to 0 of 0"` on mobile viewport, confirming recruiter cannot see the `"Add Student"` button on mobile.

---

## 📈 3. Summary of Completed Work

### **Development Metrics**
| Feature Category | Features Implemented | Tests Written | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Demo credential shortcuts, Input Validations, Password Show/Hide | 6 | ✅ Complete |
| **Routing / Guards** | Unauthenticated access blocker, Authenticated session check | 2 | ✅ Complete |
| **Dashboard UI** | Stat KPI cards (Total Students, Countries, Skills) | 2 | ✅ Complete |
| **Filters & Search** | Case-insensitive name, Skill dropdown, Country dropdown, Experience range | 6 | ✅ Complete |
| **Sorting & Pages** | Name & Experience sorts, 10/20/50 page sizing, Page pagination | 10 | ✅ Complete |
| **Admin CRUD** | Form validation, Row creation, Edit modification, Row deletion | 6 | ✅ Complete |
| **Security / RBAC** | Hidden Add/Edit/Delete actions for Recruiters (Desktop & Mobile) | 6 | ✅ Complete |
| **Data Persistence** | LocalStorage data synchronization | 2 | ✅ Complete |
| **Total** | **8 major categories** | **74 E2E tests** | **✅ Stable** |
