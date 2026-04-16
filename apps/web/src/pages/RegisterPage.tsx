import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Field } from '../components/Field';
import { useAuth } from '../features/auth/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <main className="mx-auto mt-20 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form
        className="mt-5 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          try {
            await register(name, email, password);
            navigate('/');
          } catch {
            setError('Registration failed');
          }
        }}
      >
        <Field label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-slate-900 py-2 text-white">Create account</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link className="text-slate-900 underline" to="/login">Login</Link>
      </p>
    </main>
  );
}
