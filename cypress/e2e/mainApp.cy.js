describe('MainApp Tests', () => {
    beforeEach(() => {
      // Симуляція входу перед кожним тестом
      cy.visit('/signin');
      cy.get('input[placeholder="Пошта"]').type('test@example.com');
      cy.get('input[placeholder="Пароль"]').type('correctpassword');
      cy.get('button').contains('Увійти').click();
      cy.url().should('not.include', '/signin'); // Переконайтесь, що авторизація пройшла
      cy.visit('/main');
    });
  
    it('відображає список продуктів', () => {
      cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
    });
  
    it('додає новий продукт', () => {
      cy.get('button').contains('Додати продукт').click();
  
      // Заповнюємо форму додавання продукту
      cy.get('input[placeholder="Назва продукту"]').type('Тестовий Продукт');
      cy.get('input[placeholder="Категорія"]').type('Їжа');
      cy.get('input[placeholder="Штрих код"]').type('123456789');
      cy.get('input[placeholder="Кількість"]').clear().type('5');
      cy.get('input[placeholder="Ціна"]').clear().type('100');
  
      // Натискаємо "Додати"
      cy.get('button').contains('Додати').click();
  
      // Перевіряємо, що продукт з'явився у списку
      cy.contains('Тестовий Продукт').should('be.visible');
    });
  
    it('пошук продукту за штрих-кодом', () => {
      cy.get('input[placeholder="Штрих код"]').type('123456789');
      cy.get('button').contains('Шукати за штрих-кодом').click();
  
      // Перевіряємо, що продукт відобразився
      cy.contains('Тестовий Продукт').should('exist');
    });
  
    it('оновлює продукт', () => {
      cy.contains('Тестовий Продукт').click(); // Вибір продукту
  
      // Змінюємо ціну
      cy.get('input[placeholder="Ціна"]').clear().type('150');
      cy.get('button').contains('Зберегти').click();
  
      // Перевірка оновлення ціни
      cy.contains('150 грн').should('exist');
    });
  
    it('видаляє продукт', () => {
      cy.contains('Тестовий Продукт').click(); // Вибір продукту
      cy.get('button').contains('Видалити').click();
  
      // Підтвердження видалення
      cy.on('window:confirm', () => true);
  
      // Переконуємось, що продукт видалений
      cy.contains('Тестовий Продукт').should('not.exist');
    });
  
    it('друкує список продуктів', () => {
      const stub = cy.stub();
      cy.on('window:print', stub);
  
      cy.get('button').contains('Друкувати').click();
  
      // Перевіряємо, що функція друку викликана
      cy.wrap(stub).should('have.been.calledOnce');
    });
  
    it('показує помилки валідації', () => {
      cy.get('button').contains('Додати продукт').click();
  
      // Залишаємо форму пустою і натискаємо "Додати"
      cy.get('button').contains('Додати').click();
  
      // Перевіряємо помилки валідації
      cy.contains("Назва продукту є обов'язковою.").should('be.visible');
      cy.contains("Категорія є обов'язковою.").should('be.visible');
    });
  });
  