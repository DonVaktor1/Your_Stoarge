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
import SignIn from './SignIn';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { email: 'test@example.com', uid: '123' } })
  ),
}));

describe('SignIn Component', () => {
  const mockSetCurrentUser = jest.fn();

  const renderWithRouterAndContext = () =>
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ setCurrentUser: mockSetCurrentUser }}>
          <SignIn />
        </AuthContext.Provider>
      </BrowserRouter>
    );

  it('renders the form correctly', () => {
    renderWithRouterAndContext();
    expect(screen.getByPlaceholderText('Пошта')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /увійти/i })).toBeInTheDocument();
  });

  it('displays error message on failed login', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Login failed'));

    renderWithRouterAndContext();

    fireEvent.change(screen.getByPlaceholderText('Пошта'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /увійти/i }));

    expect(await screen.findByText('Акаунт не знайдено!')).toBeInTheDocument();
  });

  it('calls setCurrentUser on successful login', async () => {
    renderWithRouterAndContext();

    fireEvent.change(screen.getByPlaceholderText('Пошта'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'correctpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /увійти/i }));

    await screen.findByRole('button', { name: /увійти/i });

    expect(mockSetCurrentUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      uid: '123',
    });
  });
});
