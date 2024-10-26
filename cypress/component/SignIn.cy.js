/// <reference types="cypress" />
import React from 'react';
import { mount } from 'cypress/react18';
import SignIn from '../../src/components/auth/signIn/SignIn.jsx';
import { AuthContext } from '../../src/components/auth/AuthContext.js';
import { MemoryRouter, Route, Routes} from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

describe('SignIn Component', () => {
  const AuthProviderMock = ({ children }) => {
    const mockSetCurrentUser = cy.stub().as('setCurrentUserStub');
    return (
      <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
        {children}
      </AuthContext.Provider>
    );
  };

  const TestRouter = ({ children }) => (
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={children} />
        <Route path="/main" element={<div>Welcome to Main</div>} />
      </Routes>
    </MemoryRouter>
  );

  it('renders without errors', () => {
    mount(
      <TestRouter>
        <AuthProviderMock>
          <SignIn />
        </AuthProviderMock>
      </TestRouter>
    );
    cy.get('input[placeholder="Пошта"]').should('exist');
    cy.get('input[placeholder="Пароль"]').should('exist');
  });

  it('should login successfully and redirect', () => {
    mount(
      <TestRouter>
        <AuthProviderMock>
          <SignIn />
        </AuthProviderMock>
      </TestRouter>
    );

    cy.stub(signInWithEmailAndPassword, 'call').callsFake((auth, email, password) => {
      if (email === 'test@example.com' && password === 'correctpassword') {
        return Promise.resolve({ user: { email, uid: '12345' } });
      } else {
        return Promise.reject(new Error('Акаунт не знайдено!'));
      }
    });

    cy.get('input[placeholder="Пошта"]').type('test@example.com');
    cy.get('input[placeholder="Пароль"]').type('correctpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Welcome to Main').should('exist');
  });

  it('should show an error message on failed login', () => {
    mount(
      <TestRouter>
        <AuthProviderMock>
          <SignIn />
        </AuthProviderMock>
      </TestRouter>
    );

    cy.stub(signInWithEmailAndPassword, 'call').callsFake((auth, email, password) => {
      return Promise.reject(new Error('Акаунт не знайдено!'));
    });

    cy.get('input[placeholder="Пошта"]').type('wrong@example.com');
    cy.get('input[placeholder="Пароль"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Акаунт не знайдено!').should('exist');
  });
});
