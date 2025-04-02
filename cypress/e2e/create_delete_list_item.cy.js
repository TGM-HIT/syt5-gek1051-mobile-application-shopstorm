beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  cy.wait(1500);

  const time = new Date().getTime();

  // Create ShoppingList
  cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
  cy.get('.MuiTextField-root').type(time + "{enter}");
  cy.get('.MuiButtonBase-root').eq(3).click();
  cy.get('[role="menuitem"]').eq(0).click();
})


describe('Create ShoppingListItem', () => {
  it('passes', () => {

    // Create ShoppingListItem
    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Apple{enter}");

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Bannanas{enter}");

    // 0-5 are back, about, settings, theme and add then 2 per item
    cy.get('.MuiButtonBase-root').should('have.length', 9);
  })
})


describe('Delete ShoppingListItem', () => {
  it('passes', () => {

    // Create ShoppingListItem
    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Apple{enter}");

    cy.get('.MuiButtonBase-root').eq(5).click();
    cy.get('[role="menuitem"]').eq(1).click({force: true});

    // 0-4 are back, about, theme, settings and add
    cy.get('.MuiButtonBase-root').should('have.length', 5);
    
  })
})
