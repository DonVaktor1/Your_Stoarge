Cypress.Commands.add('login', (username, password) => {
    cy.visit('/signin');
    cy.get('input[placeholder="Пошта"]').type(username);
    cy.get('input[placeholder="Пароль"]').type(password);
    cy.get('button[type="submit"]').click();
  });
  