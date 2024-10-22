/// <reference types="cypress" />

describe('Тест сторінки авторизації', () => {

    beforeEach(() => {
      cy.visit('/signin'); 
    });
  
    it('Відображення елементів авторизації', () => {
      cy.get('input[placeholder="Пошта"]').should('be.visible');
      cy.get('input[placeholder="Пароль"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Увійти').should('be.visible');
    });
  
    it('Успішний вхід', () => {

      cy.login('test@example.com', 'correctpassword');
  
      cy.url().should('include', '/main');
    });
  
    it('Помилка при неправильних даних', () => {
      cy.get('input[placeholder="Пошта"]').type('wronguser@example.com');
      cy.get('input[placeholder="Пароль"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
  
      cy.get('.error-message').should('contain', 'Акаунт не знайдено!');
    });
  
    it('Перехід на сторінку реєстрації', () => {
      cy.contains('Зареєструватись').click();
      cy.url().should('include', '/signup');
    });
  });
  