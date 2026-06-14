import { RotateCcw, Search } from 'lucide-react';
import { countryOptions, experienceOptions, skillOptions } from '../utils/studentOptions.js';

export default function Filters({ filters, onChange, onClear }) {
  // Controlled filters send small partial updates back to Dashboard.
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))_auto]">
        <label className="relative block">
          <span className="sr-only">Search by name</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search by name"
            className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>

        <Select
          label="Skill"
          value={filters.skill}
          onChange={(skill) => onChange({ skill })}
          options={skillOptions}
        />
        <Select
          label="Country"
          value={filters.country}
          onChange={(country) => onChange({ country })}
          options={countryOptions}
        />
        <label>
          <span className="sr-only">Experience</span>
          <select
            value={filters.experience}
            onChange={(event) => onChange({ experience: event.target.value })}
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="">All experience</option>
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      </div>
    </section>
  );
}

function Select({ label, value, onChange, options }) {
  // Reusable dropdown for skill and country filters.
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
