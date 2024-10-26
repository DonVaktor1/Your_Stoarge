/// <reference types="cypress" />
import React from 'react';
import { mount } from 'cypress/react18';
import SignUp from '../../src/components/auth/signUp/SignUp.jsx';
import { AuthContext } from '../../src/components/auth/AuthContext.js';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as firebaseAuth from 'firebase/auth';

describe('SignUp Component', () => {
  let createUserStub;

  beforeEach(() => {
    createUserStub = cy.stub(firebaseAuth, 'createUserWithEmailAndPassword');
  });

  afterEach(() => {
    createUserStub.restore();
  });

 
  it('successfully registers, redirects to the main page, and displays a message', () => {
    cy.viewport(1920, 1080) 
    const AuthProviderMock = ({ children }) => {
      const mockSetCurrentUser = cy.stub().as('setCurrentUserStub');
      return (
        <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
          {children}
        </AuthContext.Provider>
      );
    };

    const MainPageMock = () => <div>Welcome to the main page</div>;

    mount(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthProviderMock>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/main" element={<MainPageMock />} />
          </Routes>
        </AuthProviderMock>
      </MemoryRouter>
    );

    createUserStub.callsFake(() =>
      Promise.resolve({ user: { email: 'newuser@example.com', uid: '12345' } })
    );

    cy.get('input[placeholder="Пошта"]').type('newuser@example.com');
    cy.get('input[placeholder="Пароль"]').type('correctpassword');
    cy.get('input[placeholder="Підтвердження паролю"]').type('correctpassword');
    cy.get('button[type="submit"]').click();

    cy.wait(1000); 

    cy.contains('Welcome to the main page').should('exist');
  });

  it('shows error if passwords do not match', () => {
    const AuthProviderMock = ({ children }) => {
      const mockSetCurrentUser = cy.stub().as('setCurrentUserStub');
      return (
        <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
          {children}
        </AuthContext.Provider>
      );
    };

    mount(
      <MemoryRouter>
        <AuthProviderMock>
          <SignUp />
        </AuthProviderMock>
      </MemoryRouter>
    );

    cy.get('input[placeholder="Пошта"]').type('user@example.com');
    cy.get('input[placeholder="Пароль"]').type('password123');
    cy.get('input[placeholder="Підтвердження паролю"]').type('password321');
    cy.get('button[type="submit"]').click();

    cy.contains('Паролі не збігаються!').should('exist');
  });

  it('shows error message on registration failure', () => {
    const AuthProviderMock = ({ children }) => {
      const mockSetCurrentUser = cy.stub().as('setCurrentUserStub');
      return (
        <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
          {children}
        </AuthContext.Provider>
      );
    };

    mount(
      <MemoryRouter>
        <AuthProviderMock>
          <SignUp />
        </AuthProviderMock>
      </MemoryRouter>
    );

    createUserStub.callsFake(() =>
      Promise.reject(new Error('Помилка при реєстрації!'))
    );

    cy.get('input[placeholder="Пошта"]').type('user@example.com');
    cy.get('input[placeholder="Пароль"]').type('password123');
    cy.get('input[placeholder="Підтвердження паролю"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.contains('Помилка при реєстрації!').should('exist');
  });
});
