import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}


import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import SignUp from './SignUp';

// Мокаємо Firebase метод для реєстрації
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn((auth, email, password) =>
    Promise.resolve({ user: { email, uid: '123' } })
  ),
}));

describe('SignUp Component', () => {
  const mockSetCurrentUser = jest.fn();

  const renderWithRouterAndContext = () =>
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
          <SignUp />
        </AuthContext.Provider>
      </BrowserRouter>
    );

  it('renders the form correctly', () => {
    renderWithRouterAndContext();
    expect(screen.getByPlaceholderText('Пошта')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Підтвердження паролю')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /створити акаунт/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', () => {
    renderWithRouterAndContext();

    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Підтвердження паролю'), {
      target: { value: 'differentPassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /створити акаунт/i }));

    expect(screen.getByText('Паролі не збігаються!')).toBeInTheDocument();
  });

  it('calls setCurrentUser on successful registration', async () => {
    renderWithRouterAndContext();

    fireEvent.change(screen.getByPlaceholderText('Пошта'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Підтвердження паролю'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /створити акаунт/i }));

    await screen.findByRole('button', { name: /створити акаунт/i });

    expect(mockSetCurrentUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      uid: '123',
    });
  });

  it('displays an error message on failed registration', async () => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    createUserWithEmailAndPassword.mockRejectedValueOnce(new Error('Registration failed'));

    renderWithRouterAndContext();

    fireEvent.change(screen.getByPlaceholderText('Пошта'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Підтвердження паролю'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /створити акаунт/i }));

    expect(await screen.findByText('Помилка при реєстрації!')).toBeInTheDocument();
  });
});
