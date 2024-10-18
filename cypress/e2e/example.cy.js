describe('Example Test', () => {
    it('Visits the example page', () => {
      cy.visit('https://example.cypress.io');
      cy.contains('type').click();
  
      cy.get('.action-email')
        .type('test@example.com')
        .should('have.value', 'test@example.com');
    });
  });
  