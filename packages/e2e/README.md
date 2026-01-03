# @fin/e2e

End-to-end testing for the Fin household financial coordination system.

## Purpose

This package contains integration tests that verify the entire system works correctly from the user's perspective. Tests exercise:

- Complete user workflows across bill management, budgets, and payment sources
- Domain invariants at the application boundary
- Role-based interactions (Bill Organizer, Budget Manager, Investor)
- Data persistence and state transitions

E2E tests validate that architectural layers integrate correctly and that the system behaves as specified, not just that individual units work in isolation.

---

## Technology

- **Cypress** – Modern E2E testing framework
- **MongoDB (Docker)** – Real database instance for integration fidelity
- **Next.js dev server** – Runs the full web application

---

## Setup

### Prerequisites

- Docker (for MongoDB)
- Node.js and Yarn
- All Fin workspace dependencies installed

### Starting the System

1. **Start MongoDB**

   ```bash
   yarn workspace @fin/mongo start
   ```

2. **Start the web application**

   ```bash
   yarn workspace @fin/web dev
   # or for production build:
   yarn workspace @fin/web start
   ```

3. **Open Cypress**
   ```bash
   yarn workspace @fin/e2e cy:open
   ```

---

## Running Tests

### Interactive Mode (Recommended for Development)

```bash
yarn workspace @fin/e2e cy:open
```

Opens the Cypress Test Runner. Select a spec file to run tests in an interactive browser.

### Headless Mode (CI/Automation)

```bash
yarn workspace @fin/e2e cy:run
```

Runs all tests in headless mode and outputs results to the terminal.

---

## Writing Tests

### Guiding Principles

E2E tests should:

- **Test user workflows, not implementation details**
  - Focus on what users do and what they see
  - Avoid coupling to internal component structure

- **Respect domain boundaries**
  - Verify domain rules are enforced at the UI
  - Ensure invalid operations are prevented
  - Confirm state transitions follow business logic

- **Use data-test-id attributes for stability**
  - Prefer `[data-test-id='...']` over class names or text
  - Make selectors explicit and intention-revealing

- **Avoid testing what the domain already tests**
  - Don't re-verify entity invariants
  - Focus on integration, navigation, and user experience

### Example Test Structure

```typescript
describe("Bill Management - Critical Paths", () => {
  beforeEach(() => {
    // Clean slate before each test
    cy.task("db:clear");
    cy.task("db:seed", {
      bills: [],
      paymentSources: [{ id: "1", name: "Chase Checking", type: "bank" }],
    });
    cy.visit("/bills");
  });

  it("creates a bill with all required fields", () => {
    cy.get("[data-test-id='create-bill-button']").click();
    cy.get("[data-test-id='bill-name-input']").type("Internet Bill");
    cy.get("[data-test-id='bill-amount-input']").type("79.99");
    cy.get("[data-test-id='bill-due-date-input']").type("2026-01-15");
    cy.get("[data-test-id='save-bill-button']").click();

    // Verify bill appears (use content for verification, not test IDs)
    cy.get("[data-test-id='bill-name-input']")
      .filter((i, el) => el.value === "Internet Bill")
      .should("exist");
  });

  it("prevents creating a bill without a name", () => {
    cy.get("[data-test-id='create-bill-button']").click();
    cy.get("[data-test-id='bill-amount-input']").type("50.00");
    cy.get("[data-test-id='save-bill-button']").click();

    // Verify domain invariant is enforced
    cy.contains("Name is required").should("be.visible");
  });

  it("assigns payment source to bill", () => {
    // Create a bill first
    cy.get("[data-test-id='create-bill-button']").click();
    cy.get("[data-test-id='bill-name-input']").type("Electric");
    cy.get("[data-test-id='save-bill-button']").click();

    // Assign payment source
    cy.get("[data-test-id='bill-name-input']")
      .filter((i, el) => el.value === "Electric")
      .closest("tr")
      .find("[data-test-id='assign-payment-source-button']")
      .click();

    cy.get("[data-test-id='payment-source-select']").select("Chase Checking");
    cy.get("[data-test-id='confirm-assignment-button']").click();

    // Verify assignment persists
    cy.reload();
    cy.get("[data-test-id='bill-name-input']")
      .filter((i, el) => el.value === "Electric")
      .closest("tr")
      .should("contain", "Chase Checking");
  });
});
```

### Selector Best Practices

**Add `data-test-id` to interactive elements only:**

- Buttons, links, inputs, selects, toggles
- Elements users click, type into, or interact with
- NOT display-only text, labels, or container divs

**DO:**

```typescript
// Use test IDs for interactive elements
cy.get("[data-test-id='create-bill-button']").click();
cy.get("[data-test-id='bill-name-input']").type("Internet");

// Find interactive elements by their test ID, use content for navigation
cy.get("[data-test-id='bill-name-input']")
  .filter((i, el) => el.value === "Internet")
  .closest("tr") // or parent container
  .find("[data-test-id='delete-bill-button']")
  .click();
```

**DON'T:**

```typescript
// Don't add test IDs to every container
<div data-test-id='bill-row'>  ❌

// Don't use fragile class-based selectors for interactions
cy.get('.bill-row-container button').click()  ❌

// Don't rely on changing copy for critical interactions
cy.contains('Click here to add a bill').click()  ❌
```

### Custom Commands

Define reusable commands in `cypress/support/commands.ts`:

```typescript
Cypress.Commands.add("createBill", (name: string, amount: number) => {
  cy.get("[data-test-id='create-bill-button']").click();
  cy.get("[data-test-id='bill-name-input']").type(name);
  cy.get("[data-test-id='bill-amount-input']").type(amount.toString());
  cy.get("[data-test-id='save-bill-button']").click();
});

// Usage:
cy.createBill("Electric", 120.5);
```

---

## Test Organization

```
cypress/
├── e2e/
│   ├── bills/
│   │   ├── create-bill.cy.ts
│   │   ├── update-bill.cy.ts
│   │   └── delete-bill.cy.ts
│   ├── payment-sources/
│   │   └── assign-payment-source.cy.ts
│   └── workflows/
│       └── monthly-bill-review.cy.ts
├── fixtures/
│   └── bills.json
└── support/
    ├── commands.ts
    └── e2e.ts
```

- **`e2e/`** – Test specs organized by feature area
- **`fixtures/`** – Seed data for consistent test setup
- **`support/`** – Custom commands and global configuration

---

## Database Management

E2E tests run against a real MongoDB instance.

**Critical principle: Clean up BEFORE tests, not after.**

This approach:

- Lets you inspect system state after test completion
- Prevents tests from running in unknown/polluted states
- Avoids flaky tests from leftover data
- Makes debugging easier (see what the test actually created)

```typescript
describe("Bill Management", () => {
  beforeEach(() => {
    // Clean slate before each test
    cy.task("db:clear");
    cy.task("db:seed", { bills: [], paymentSources: [] });
    cy.visit("/bills");
  });

  // No afterEach cleanup - leave state visible for inspection

  it("creates a new bill", () => {
    // Test runs in known, clean state
    cy.get("[data-test-id='create-bill-button']").click();
    // ... rest of test
  });
});
```

**Setup pattern:**

```typescript
// cypress/support/tasks.ts
export default {
  "db:clear": async () => {
    // Drop all collections or delete all documents
    await mongoose.connection.db.dropDatabase();
  },

  "db:seed": async (fixtures: any) => {
    // Insert known test data
    await Bill.insertMany(fixtures.bills);
    await PaymentSource.insertMany(fixtures.paymentSources);
  },
};
```

**Benefits:**

- Failed tests leave evidence behind
- No cascade failures from incomplete cleanup
- Consistent starting state guaranteed

---

## CI Integration

When running in CI:

1. Start MongoDB container
2. Build and start the web app
3. Run `yarn workspace @fin/e2e cy:run`
4. Collect artifacts (screenshots, videos) on failure

---

## Common Issues

### "Element not found" errors with deeply nested content

Interactive elements have `data-test-id`, but their containers may not. Navigate using content, then find the interactive element:

```typescript
// Find the input with specific value, traverse to row, click its delete button
cy.get("[data-test-id='bill-name-input']")
  .filter((i, el) => el.value === billName)
  .closest("tr")
  .find("[data-test-id='delete-bill-button']")
  .click();
```

### Tests pass locally but fail in CI

- Check viewport size differences
- Verify timing/async issues (use `cy.intercept()` to wait for API calls)
- Ensure database is properly cleared and seeded before tests run

### Flaky tests

**Common causes:**

- Tests start in polluted state from previous test
- Race conditions with API calls
- Hardcoded waits instead of assertions

**Solutions:**

- Always clean database in `beforeEach`, never in `afterEach`
- Use `cy.intercept()` to wait for specific API responses
- Use assertions that retry (e.g., `.should('exist')`) instead of `cy.wait(ms)`

```typescript
// ❌ Flaky
cy.get("[data-test-id='create-bill-button']").click();
cy.wait(1000); // Race condition
cy.get("[data-test-id='bill-name-input']").should("exist");

// ✅ Reliable
cy.intercept("POST", "/api/bills").as("createBill");
cy.get("[data-test-id='create-bill-button']").click();
cy.wait("@createBill");
cy.get("[data-test-id='bill-name-input']").should("exist");
```

---

## Philosophy

E2E tests are expensive to write and maintain. Focus on **critical paths** that represent core user value and system integrity:

### Critical Paths to Test

**Bill Organizer workflows:**

- Creating a bill with all required fields
- Updating bill amount and due date
- Reordering bills in the list
- Deleting a bill
- Assigning a payment source to a bill

**Payment Source workflows:**

- Creating a payment source
- Deleting a payment source (verify bills are unassigned)
- Linking multiple bills to one payment source

**Budget Manager workflows:**

- Viewing bills due this week
- Viewing bills due next week
- Filtering by category or status

**Cross-cutting concerns:**

- Domain invariants enforced at UI (e.g., bill requires name)
- Navigation between major sections
- State persistence across page reloads

### What NOT to test in E2E

- Pure domain logic (unit tests handle this)
- CSS styling and layout (visual regression tools are better)
- Every edge case (reserve E2E for high-risk, high-value paths)
- Implementation details (internal component structure, state management)

### Test structure

Tests should read like user stories:

```typescript
it("organizer assigns payment source to bill", () => {
  // Given: a bill and payment source exist
  // When: organizer assigns the source
  // Then: bill shows the payment source
});
```

Focus on **what** users do and **what** they see, not **how** the system does it internally.

---

## Contributing

When adding new features:

1. **Add `data-test-id` to interactive elements only**
   - Buttons, inputs, selects, links, toggles
   - NOT containers, labels, or display text

2. **Write E2E tests for critical paths**
   - Core user workflows that deliver value
   - Operations that involve multiple layers
   - Domain invariants that must be enforced

3. **Clean before, not after**
   - Use `beforeEach` to reset database state
   - Leave test artifacts visible for debugging
   - Avoid flaky tests from unknown starting states

4. **Keep tests focused on user behavior**
   - What users do and see, not how it works internally
   - Use content for navigation, test IDs for interaction
   - Test domain rules at boundaries, not in isolation

5. **Update this README**
   - Document new patterns or conventions
   - Add examples of tricky selector scenarios
   - Note any new Cypress tasks or commands

---

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Fin Project Guidance](../CLAUDE.md)
