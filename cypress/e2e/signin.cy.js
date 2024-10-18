describe('SignIn Page', () => {
    beforeEach(() => {
      cy.visit('/signin');
    });
  
    it('renders the sign-in form correctly', () => {
      cy.get('input[placeholder="Пошта"]').should('exist');
      cy.get('input[placeholder="Пароль"]').should('exist');
      cy.get('button').contains('Увійти').should('exist');
    });
  
    it('displays an error message for invalid login', () => {
      cy.get('input[placeholder="Пошта"]').type('wrong@example.com');
      cy.get('input[placeholder="Пароль"]').type('wrongpassword');
      cy.get('button').contains('Увійти').click();
  
      cy.contains('Акаунт не знайдено!').should('be.visible');
    });
  
    it('logs in successfully and redirects to the main page', () => {
      // Використання правильних даних
      cy.get('input[placeholder="Пошта"]').type('test@example.com');
      cy.get('input[placeholder="Пароль"]').type('correctpassword');
      cy.get('button').contains('Увійти').click();
  
      // Перевірка редіректу
      cy.url().should('include', '/main');
    });
  });
  