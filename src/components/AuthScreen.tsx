import { type FormEvent, useState } from 'react';
import type { AuthState } from '../hooks/useAuth';

interface Props {
  auth: AuthState;
}

export function AuthScreen({ auth }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setBusy(true);
    if (mode === 'signup') {
      await auth.signUp(username.trim(), password);
    } else {
      await auth.signIn(username.trim(), password);
    }
    setBusy(false);
  }

  function toggleMode() {
    auth.clearError();
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="relative rounded-3xl px-10 py-10 w-[340px]"
        style={{
          background: 'rgba(10, 12, 24, 0.82)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 64px rgba(0,0,0,0.6)',
        }}
      >
        <h1
          className="text-center text-2xl font-semibold mb-8 tracking-wide"
          style={{ color: 'rgba(220, 230, 255, 0.92)' }}
        >
          bubbly
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={busy}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(220,230,255,0.9)',
            }}
          />
          <input
            type="password"
            placeholder="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(220,230,255,0.9)',
            }}
          />

          {auth.error && (
            <p className="text-xs text-center" style={{ color: 'hsla(0,80%,68%,0.9)' }}>
              {auth.error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !username.trim() || !password}
            className="rounded-xl py-3 text-sm font-medium mt-1 transition-opacity"
            style={{
              background: 'hsla(187,88%,52%,0.85)',
              color: '#fff',
              opacity: busy || !username.trim() || !password ? 0.45 : 1,
            }}
          >
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          onClick={toggleMode}
          className="mt-6 w-full text-center text-xs"
          style={{ color: 'rgba(180,190,230,0.55)' }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
