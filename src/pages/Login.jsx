import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth.js';

export default function Login() {
  const navigate = useNavigate();
  // Local component state controls the form fields and password visibility.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Basic client-side validation gives clear feedback before checking mock users.
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    const user = login(email, password);
    if (!user) {
      setError('Invalid credentials');
      return;
    }
    // Successful login stores the session in auth.js, then moves to the dashboard.
    navigate('/dashboard', { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-[1fr_420px]">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Frontend POC</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">
            Recruitment Student Management System
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Search, filter, paginate, and manage student recruitment profiles with role-based access for admins and recruiters.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <CredentialCard role="Admin" email="admin@test.com" />
            <CredentialCard role="Recruiter" email="recruiter@test.com" />
          </div>
        </section>

        {/* Login form for both Admin and Recruiter mock accounts. */}
        <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-teal-700 text-white">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-950">Login</h2>
          <p className="mt-1 text-sm text-slate-500">Use one of the mock accounts.</p>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="admin@test.com"
              />
            </label>

            <div className="block">
              <label htmlFor="password" className="text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="h-11 w-full rounded-md border border-slate-300 px-3 pr-11 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  placeholder="123456"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}

function CredentialCard({ role, email }) {
  // Shows demo credentials directly on the login page for quick testing.
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-950">{role}</p>
      <p className="mt-1 break-all text-sm text-slate-600">{email}</p>
      <p className="mt-1 text-sm text-slate-600">Password: 123456</p>
    </div>
  );
}
