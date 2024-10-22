describe('Sign Up', () => {
    beforeEach(() => {
        cy.visit('/signup'); 
    });

    it('should register a new user and redirect to /main', () => {
        const email = 'testuser@example.com';
        const password = 'TestPassword123';
        
        cy.get('input[placeholder="Пошта"]').type(email);
        
        cy.get('input[placeholder="Пароль"]').type(password);
        
        cy.get('input[placeholder="Підтвердження паролю"]').type(password);

        cy.get('button[type="submit"]').click();
        
        cy.url().should('include', '/main');

        cy.get('.settings').click();
    
        cy.url().should('include', '/settings');

        cy.get('.delete-button').click();

        cy.get('.modal-content').should('be.visible');

        cy.get('input[placeholder="Введіть ваш пароль"]').type(password);
        
        cy.get('.confirm-button').click();
        
        cy.url().should('include', '/signup');
    
        
    });

    it('should show an error message if passwords do not match', () => {
        cy.get('input[placeholder="Пошта"]').type('testuser@example.com');
        
        cy.get('input[placeholder="Пароль"]').type('TestPassword123');

        cy.get('input[placeholder="Підтвердження паролю"]').type('DifferentPassword456');
        
        cy.get('button[type="submit"]').click();

        cy.contains('Паролі не збігаються!');
    });
});
