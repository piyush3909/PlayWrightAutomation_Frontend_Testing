import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { countryOptions, skillOptions } from '../utils/studentOptions.js';

// Blank form shape used when adding a new student.
const initialForm = {
  name: '',
  country: '',
  experience: '',
  skills: [],
};

export default function AddStudentModal({ mode = 'add', student, onClose, onSave }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Refill the form when editing; reset it when adding.
    if (student) {
      setForm({
        name: student.name,
        country: student.country,
        experience: String(student.experience),
        skills: student.skills,
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [student]);

  const title = mode === 'edit' ? 'Edit Student' : 'Add Student';
  // Disable submit until required fields have at least one value.
  const canSubmit = useMemo(() => form.name.trim() && form.country && form.experience !== '' && form.skills.length, [form]);

  function updateField(key, value) {
    // Generic field updater keeps individual input handlers small.
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSkill(skill) {
    // Checkbox clicks add or remove the selected skill from the form array.
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const numericExperience = Number(form.experience);

    // Form validation matches the PDF requirements for required fields and positive experience.
    if (!form.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!form.country) {
      nextErrors.country = 'Country is required';
    }
    if (form.experience === '' || Number.isNaN(numericExperience) || numericExperience < 0) {
      nextErrors.experience = 'Experience must be positive';
    }
    if (form.skills.length === 0) {
      nextErrors.skills = 'Select at least one skill';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      // Parent Dashboard decides whether this payload creates or updates a student.
      onSave({
        ...student,
        name: form.name.trim(),
        country: form.country,
        experience: numericExperience,
        skills: form.skills,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            aria-label="Close form"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <Field label="Name" error={errors.name}>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder="Student name"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Country" error={errors.country}>
              <select
                value={form.country}
                onChange={(event) => updateField('country', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">Select country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Experience" error={errors.experience}>
              <input
                value={form.experience}
                onChange={(event) => updateField('experience', event.target.value)}
                type="number"
                min="0"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="Years"
              />
            </Field>
          </div>

          <Field label="Skills" error={errors.skills}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {skillOptions.map((skill) => (
                <label
                  key={skill}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
                    form.skills.includes(skill)
                      ? 'border-teal-700 bg-teal-50 text-teal-800'
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.skills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  {skill}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Student
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  // Wraps each form control with a label and optional validation message.
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm font-medium text-red-700">{error}</p>}
    </label>
  );
}
