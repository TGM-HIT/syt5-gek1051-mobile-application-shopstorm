beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  cy.wait(2000);

})

describe('Add a Tag to a Product', () => {
  it('passes', () => {

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Meine Shoppingliste{enter}");
    cy.get('.MuiButtonBase-root').eq(2).click();
    cy.get('[role="menuitem"]').eq(0).click();

    cy.get('button.MuiFab-primary.MuiFab-sizeSmall').click();
    cy.get('.MuiTextField-root').type("Wurst{enter}");
    cy.get('svg[data-testid="MoreVertIcon"]').click();
    cy.get('[role="menu"]').should('be.visible');
    cy.contains('[role="menuitem"]', 'Umbenennen').click();

    // Öffne das Menü
    cy.get('[data-cy="category-select"]').click();
    // Wähle eine Option
    cy.get('[data-cy="category-option-Frischetheke"]').click();

    cy.get('button').contains('Speichern').click();

  })
})