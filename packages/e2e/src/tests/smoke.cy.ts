it("allows new bills to be added", () => {
  const name = "NEW_BILL_ADD_DELETE";

  cy.visit("/bills");

  cy.get("[data-testid='add-new-bill']")
    .should("be.visible")
    .and("contain.text", "+ Add Item")
    .click();

  cy.get("[data-testid='new-bill-name-input']")
    .should("be.visible")
    .and("have.value", "")
    .type(name)
    .should("have.value", name)
    .blur();

  cy.get("[data-testid='bill-amount-input']:focus")
    .should("be.visible")
    .and("have.value", "0.00")
    .type("150.75")
    .should("have.value", "150.75");

  cy.get("[data-testid='bill-name-input']")
    .filter((index, el: HTMLInputElement) => el.value === name)
    .closest("[data-testid='bill-row']")
    .click();

  cy.get("[data-testid='delete-bill-button']").click();
  cy.get("[data-testid='confirm-delete-button']").click();

  cy.get("[data-testid='bill-row']").should("not.exist");
});
