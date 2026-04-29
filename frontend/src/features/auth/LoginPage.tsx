import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sn-green mb-2">SenChat</h1>
          <p className="text-[var(--color-text-secondary)]">
            Connectez-vous pour continuer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="••••••••"
            />
          </div>

          {login.error && (
            <p className="text-sn-red text-sm">
              {(login.error as any)?.response?.data?.message || 'Erreur de connexion'}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-3 bg-sn-green text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {login.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-sn-green hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
