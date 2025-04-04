beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  cy.wait(2000);

})

describe('Create ShoppingList', () => {
  it('passes', () => {

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Meine Shoppingliste{enter}");
    })
})

describe('Open ShoppingList', () => {
  it('passes', () => {

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Meine Shoppingliste{enter}");
    cy.get('.MuiButtonBase-root').eq(3).click();
    cy.get('[role="menuitem"]').eq(0).click();
  })
})

describe('Rename ShoppingList', () => {
  it('passes', () => {

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Meine Shoppingliste{enter}");
    cy.get('.MuiButtonBase-root').eq(3).click();
    cy.get('[role="menuitem"]').eq(1).click();
    cy.get('.MuiInputBase-root').clear();
    cy.get('.MuiInputBase-root').type("Neue Shoppingliste");
    cy.get('button').contains('Submit').click();
    cy.wait(2000)
  })
})


describe('Delete ShoppingList', () => {
  it('passes', () => {

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Meine Shoppingliste{enter}");
    cy.get('.MuiButtonBase-root').eq(3).click();
    cy.get('[role="menuitem"]').eq(2).click();

  })
})
