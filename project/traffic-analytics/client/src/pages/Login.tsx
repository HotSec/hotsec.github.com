import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => navigate('/'),
        onError: (err) => setError(err.message || 'Login failed'),
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/20">
            <BarChart3 className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Traffic Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-rose-800 bg-rose-900/20 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary mt-6 w-full"
          >
            {loginMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-400 transition-colors hover:text-primary-300"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
