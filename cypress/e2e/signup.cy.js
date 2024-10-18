describe('SignUp Page', () => {
    // Run this before each test to ensure the correct page is loaded
    beforeEach(() => {
      cy.visit('/signup');
    });
  
    it('renders the sign-up form correctly', () => {
      cy.get('input[placeholder="Пошта"]').should('exist');
      cy.get('input[placeholder="Пароль"]').should('exist');
      cy.get('input[placeholder="Підтвердження паролю"]').should('exist');
      cy.get('button').contains('Створити Акаунт').should('exist');
    });
  
    it('shows an error when passwords do not match', () => {
      // Fill in the form with mismatched passwords
      cy.get('input[placeholder="Пошта"]').type('test@example.com');
      cy.get('input[placeholder="Пароль"]').type('password123');
      cy.get('input[placeholder="Підтвердження паролю"]').type('differentPassword');
      cy.get('button').contains('Створити Акаунт').click();
  
      // Assert that the error message is visible
      cy.contains('Паролі не збігаються!').should('be.visible');
    });
  
    it('registers successfully and redirects to the main page', () => {
      // Intercept the Firebase signup request and mock a successful response
      cy.intercept('POST', '**/accounts:signUp**', {
        statusCode: 200,
        body: { email: 'test@example1.com', localId: '123' },
      }).as('firebaseRegister');
  
      // Fill in the form with valid credentials
      cy.get('input[placeholder="Пошта"]').type('test@example1.com');
      cy.get('input[placeholder="Пароль"]').type('password123');
      cy.get('input[placeholder="Підтвердження паролю"]').type('password123');
      cy.get('button').contains('Створити Акаунт').click();
  
      // Wait for the request to complete and assert the redirection
      cy.wait('@firebaseRegister');
      cy.url({ timeout: 10000 }).should('include', '/main');
    });
  
    it('displays an error on registration failure', () => {
      // Intercept the Firebase signup request and mock a failure response
      cy.intercept('POST', '**/accounts:signUp**', {
        statusCode: 400,
        body: { error: { message: 'EMAIL_EXISTS' } },
      }).as('firebaseRegisterFail');
  
      // Fill in the form with an existing email
      cy.get('input[placeholder="Пошта"]').type('existing@example.com');
      cy.get('input[placeholder="Пароль"]').type('password123');
      cy.get('input[placeholder="Підтвердження паролю"]').type('password123');
      cy.get('button').contains('Створити Акаунт').click();
  
      // Wait for the request to complete and assert the error message
      cy.wait('@firebaseRegisterFail');
      cy.contains('Помилка при реєстрації!').should('be.visible');
    });
  });
  