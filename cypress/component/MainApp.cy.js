/// <reference types="cypress" />
import React from 'react';
import { mount } from 'cypress/react18';
import MainApp from '../../src/components/mainApp/MainApp.jsx';
import { AuthContext } from '../../src/components/auth/AuthContext.js';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('MainApp Component', () => {
  const AuthProviderMock = ({ children }) => {
    const mockSetCurrentUser = cy.stub().as('setCurrentUserStub');
    return (
      <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
        {children}
      </AuthContext.Provider>
    );
  };

  const TestRouter = ({ children }) => (
    <MemoryRouter initialEntries={['/main']}>
      <Routes>
        <Route path="/main" element={children} />
      </Routes>
    </MemoryRouter>
  );

  beforeEach(() => {
    mount(
      <TestRouter>
        <AuthProviderMock>
          <MainApp />
        </AuthProviderMock>
      </TestRouter>
    );
    cy.viewport(1280, 720);
  });

  it('should add a new product successfully', () => {
    cy.get('button').contains('Додати продукт').click();

    cy.get('input[placeholder="Назва продукту"]').type('Новий Продукт');
    cy.get('input[placeholder="Категорія"]').type('Категорія');
    cy.get('input[placeholder="Кількість"]').type('10');
    cy.get('input[placeholder="Ціна"]').type('100');
    cy.get('input[placeholder="Штрих код"]').type('123456');

    cy.get('button.add-button').contains('Додати').click();

    cy.contains('Новий Продукт').should('exist');
  });

  it('should edit an existing product successfully', () => {
    cy.get('button').contains('Додати продукт').click();
    cy.get('input[placeholder="Назва продукту"]').type('Продукт для Редагування');
    cy.get('input[placeholder="Категорія"]').type('Категорія');
    cy.get('input[placeholder="Кількість"]').type('5');
    cy.get('input[placeholder="Ціна"]').type('50');
    cy.get('input[placeholder="Штрих код"]').type('654321');
    cy.get('button.add-button').contains('Додати').click();

    cy.contains('Продукт для Редагування').click();

    cy.get('input[placeholder="Назва продукту"]').clear().type('Редагований Продукт');
    cy.get('input[placeholder="Ціна"]').clear().type('75');
    cy.get('button.add-button').contains('Зберегти').click();

    cy.contains('Редагований Продукт').should('exist');
    cy.contains('75').should('exist');
  });

  it('should delete an existing product successfully', () => {
    cy.get('button').contains('Додати продукт').click();
    cy.get('input[placeholder="Назва продукту"]').type('Продукт для Видалення');
    cy.get('input[placeholder="Категорія"]').type('Категорія');
    cy.get('input[placeholder="Кількість"]').type('3');
    cy.get('input[placeholder="Ціна"]').type('25');
    cy.get('input[placeholder="Штрих код"]').type('789012');
    cy.get('button.add-button').contains('Додати').click();

    cy.contains('Продукт для Видалення').click();
    cy.get('button.delete-product-button').contains('Видалити').click();

    cy.contains('Продукт для Видалення').should('not.exist');
  });
});
