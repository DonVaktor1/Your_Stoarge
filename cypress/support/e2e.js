Cypress.Commands.add('login', (email, password) => {
    cy.get('input[placeholder="Пошта"]').type(email);
    cy.get('input[placeholder="Пароль"]').type(password);
    cy.get('button').contains('Увійти').click();
  });
  