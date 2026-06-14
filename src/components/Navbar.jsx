import { LogOut, UserCircle } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  // The top bar shows the active role and exposes the logout action.
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-teal-700">Recruitment POC</p>
          <h1 className="text-xl font-semibold text-slate-950">Student Management System</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <UserCircle className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium capitalize">{user.role}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
