import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth';

export function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(
      { email, password, displayName },
      { onSuccess: () => navigate('/') },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sn-green mb-2">SenChat</h1>
          <p className="text-[var(--color-text-secondary)]">
            Créez votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-sn-green"
              placeholder="Votre nom"
            />
          </div>

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
              placeholder="8 caractères minimum"
            />
          </div>

          {register.error && (
            <p className="text-sn-red text-sm">
              {(register.error as any)?.response?.data?.message || "Erreur d'inscription"}
            </p>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full py-3 bg-sn-green text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {register.isPending ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-secondary)]">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-sn-green hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
