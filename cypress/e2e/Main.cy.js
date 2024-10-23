describe('Тест сторінки авторизації', () => {

    beforeEach(() => {
      cy.visit('/signin'); 
    });
  
    it('Відображення елементів авторизації', () => {
      cy.get('input[placeholder="Пошта"]').should('be.visible');
      cy.get('input[placeholder="Пароль"]').should('be.visible');
      cy.get('button[type="submit"]').contains('Увійти').should('be.visible');
    });
  
    it('Додавання, редагування та видалення продукту', () => {
      cy.login('test@example.com', 'correctpassword');
  
      cy.url().should('include', '/main');
  
      cy.get('button.sidebar-button').contains('Додати продукт').click();
  
      cy.get('input[placeholder="Категорія"]').type('Напої');
      cy.get('input[placeholder="Кількість"]').clear().type('10');
      cy.get('input[placeholder="Ціна"]').clear().type('25.99');
  
      cy.get('button.add-button').click();
  
      cy.get('.error').contains('Назва продукту').should('be.visible');
  
      cy.get('input[placeholder="Назва продукту"]').type('Кока-Кола');
      cy.get('input[placeholder="Штрих код"]')
        .clear()
        .type('12345678', { delay: 100 })
        .should('have.value', '12345678');
  
      cy.get('button.add-button').click();
  
      cy.get('table.product-table tbody tr')
        .contains('Кока-Кола')
        .should('exist')
        .click();
  
      cy.get('input[placeholder="Кількість"]').clear().type('20');
      
      cy.get('button.add-button').contains('Зберегти').click();
  
      cy.get('table.product-table tbody tr')
        .contains('Кока-Кола')
        .parent()
        .contains('20')
        .click();
  
      cy.get('button.delete-product-button').click();
  
      cy.get('table.product-table tbody tr').should('have.length', 0);
    });
  
  });
  