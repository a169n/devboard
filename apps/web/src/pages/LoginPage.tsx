import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { useAuth } from '../features/auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">Login to DevBoard</h1>
      <p className="mt-1 text-sm text-slate-600">Use your credentials to continue.</p>
      <form
        className="mt-5 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            await login(email, password);
            navigate('/');
          } catch {
            setError('Login failed');
          }
        }}
      >
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-slate-900 py-2 text-white">Login</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New here? <Link className="text-slate-900 underline" to="/register">Create account</Link>
      </p>
    </main>
  );
}
