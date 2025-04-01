beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.window().should('have.property', 'document').and('have.property', 'readyState', 'complete');
  cy.wait(1500);

  // Create ShoppingLists
  cy.get('#add').click();
  cy.get('.MuiTextField-root').type("Shoppinglist 1{enter}");

  cy.get('#add').click();
  cy.get('.MuiTextField-root').type("Shoppinglist 2{enter}");
})

describe('Drag and Drop to reorder Shoppinglists', () => {
  it('Drag and Drop reorders Shoppinglists', () => {

     
    cy.get('[data-testid="DragIndicatorIcon"]').first()
    .realMouseDown()
    .realMouseMove(0, 10, { position: 'center' }) // Small initial movement to trigger the drag
    .wait(200) // Short wait to ensure drag is registered
    .realMouseMove(0, 250, { position: 'center' }) // Move down by 250px
    .wait(200)
    .realMouseUp();

    cy.get('.MuiTypography-root, .MuiTypography-body1, .css-rizt0-MuiTypography-root').eq(2).should('contain', 'Shoppinglist 2')
    cy.get('.MuiTypography-root, .MuiTypography-body1, .css-rizt0-MuiTypography-root').eq(4).should('contain', 'Shoppinglist 1')
  });
})


