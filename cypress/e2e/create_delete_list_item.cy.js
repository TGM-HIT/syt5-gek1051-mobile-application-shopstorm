beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  cy.wait(2000);

  const time = new Date().getTime();

  // Create ShoppingList
  cy.get('#add').click();
  cy.get('.MuiTextField-root').type(time + "{enter}");
  cy.get('.MuiButtonBase-root').eq(2).click();
  cy.get('[role="menuitem"]').eq(0).click();
})


describe('Create ShoppingListItem', () => {
  it('passes', () => {

    // Create ShoppingListItem
    cy.get('#add').click();
    cy.get('.MuiTextField-root').type("Apple{enter}");

    cy.get('#add').click();
    cy.get('.MuiTextField-root').type("Bannanas{enter}");

    // 0-4 are back, about, settings and add then 2 per item
    cy.get('.MuiButtonBase-root').should('have.length', 8);
  })
})


describe('Delete ShoppingListItem', () => {
  it('passes', () => {

    // Create ShoppingListItem
    cy.get('#add').click();
    cy.get('.MuiTextField-root').type("Apple{enter}");

    cy.get('.MuiButtonBase-root').eq(4).click();
    cy.get('[role="menuitem"]').eq(1).click({force: true});

    // 0-3 are back, about, settings and add
    cy.get('.MuiButtonBase-root').should('have.length', 4);
    
  })
})