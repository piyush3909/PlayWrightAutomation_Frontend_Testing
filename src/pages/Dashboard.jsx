import { Plus, Users, Globe2, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddStudentModal from '../components/AddStudentModal.jsx';
import Filters from '../components/Filters.jsx';
import Navbar from '../components/Navbar.jsx';
import Pagination from '../components/Pagination.jsx';
import StudentModal from '../components/StudentModal.jsx';
import StudentTable from '../components/StudentTable.jsx';
import initialStudents from '../data/students.json';
import { getCurrentUser, logout } from '../utils/auth.js';
import { canManageStudents } from '../utils/permissions.js';
import { experienceOptions } from '../utils/studentOptions.js';

// Students are persisted locally so add/edit/delete survives page refreshes.
const STUDENTS_KEY = 'sms_students';
const emptyFilters = { search: '', skill: '', country: '', experience: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const canManage = canManageStudents(user);
  // Dashboard state owns the dataset and all table controls.
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadStudents = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/students')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch students from server');
        }
        return res.json();
      })
      .then((data) => {
        const storedStudents = localStorage.getItem(STUDENTS_KEY);
        setStudents(storedStudents ? JSON.parse(storedStudents) : data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    // Any student change is saved locally because this POC has no backend.
    if (!isLoading && !error) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    }
  }, [students, isLoading, error]);

  const filteredStudents = useMemo(() => {
    // Search, skill, country, and experience filters are applied together.
    const searchText = filters.search.trim().toLowerCase();
    const experienceRange = experienceOptions.find((option) => option.value === filters.experience);

    return students
      .filter((student) => {
        const matchesSearch = !searchText || student.name.toLowerCase().includes(searchText);
        const matchesSkill = !filters.skill || student.skills.includes(filters.skill);
        const matchesCountry = !filters.country || student.country === filters.country;
        const matchesExperience =
          !experienceRange ||
          (student.experience >= experienceRange.min && student.experience <= experienceRange.max);

        return matchesSearch && matchesSkill && matchesCountry && matchesExperience;
      })
      .sort((a, b) => {
        // The same sort handler supports name and experience in both directions.
        const modifier = sort.direction === 'asc' ? 1 : -1;
        if (sort.key === 'experience') {
          return (a.experience - b.experience) * modifier;
        }
        return a.name.localeCompare(b.name) * modifier;
      });
  }, [students, filters, sort]);

  const paginatedStudents = useMemo(() => {
    // Pagination is calculated after filtering and sorting.
    const start = (page - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const stats = useMemo(() => {
    // Statistics cards summarize the complete dataset, not just the current page.
    const countries = new Set(students.map((student) => student.country));
    const skills = new Set(students.flatMap((student) => student.skills));
    return [
      { label: 'Total Students', value: students.length, icon: Users },
      { label: 'Total Countries', value: countries.size, icon: Globe2 },
      { label: 'Total Skills', value: skills.size, icon: Wrench },
    ];
  }, [students]);

  useEffect(() => {
    // Changing filters, page size, or sort order should restart from the first page.
    setPage(1);
  }, [filters, pageSize, sort]);

  function handleFilterChange(nextFilters) {
    setFilters((current) => ({ ...current, ...nextFilters }));
  }

  function handleSort(key) {
    // Clicking the active column toggles direction; clicking another column starts ascending.
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  function handleLogout() {
    // Clear auth state and replace history so Back does not return to the dashboard.
    logout();
    navigate('/login', { replace: true });
  }

  function openAddStudent() {
    // Opening without an existing student puts the form in add mode.
    setEditingStudent(null);
    setIsFormOpen(true);
  }

  function openEditStudent(student) {
    // Closing the details modal avoids stacking two student dialogs at once.
    setSelectedStudent(null);
    setEditingStudent(student);
    setIsFormOpen(true);
  }

  function saveStudent(student) {
    // Existing students keep their ID; new students receive the next display ID.
    if (student.id) {
      setStudents((current) => current.map((item) => (item.id === student.id ? student : item)));
    } else {
      const nextNumber = students.length + 1;
      setStudents((current) => [
        {
          ...student,
          id: `STU-${String(nextNumber).padStart(3, '0')}`,
        },
        ...current,
      ]);
    }
    setIsFormOpen(false);
    setEditingStudent(null);
  }

  function deleteStudent(studentId) {
    // Deletion is immediate in this POC and persists through the localStorage effect.
    setStudents((current) => current.filter((student) => student.id !== studentId));
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="rounded-md border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          Loading students...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-md border border-red-200 bg-white px-6 py-5 text-center shadow-sm max-w-md" role="alert">
          <p className="text-sm font-semibold text-red-600 mb-2">Error Loading Data</p>
          <p className="text-sm text-slate-700 mb-4">{error}</p>
          <button
            type="button"
            onClick={loadStudents}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">Signed in as {user.email}</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h2>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={openAddStudent}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Student
            </button>
          )}
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          {/* Filters are controlled by Dashboard so table, pagination, and stats stay coordinated. */}
          <Filters
            filters={filters}
            onChange={handleFilterChange}
            onClear={() => setFilters(emptyFilters)}
          />

          {students.length === 0 ? (
            <div className="px-4 py-12 text-center sm:px-6" data-testid="empty-state">
              <p className="text-base font-semibold text-slate-950">No students available</p>
            </div>
          ) : (
            <StudentTable
              students={paginatedStudents}
              canManage={canManage}
              sort={sort}
              onSort={handleSort}
              onOpen={setSelectedStudent}
              onEdit={openEditStudent}
              onDelete={deleteStudent}
            />
          )}

          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={filteredStudents.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </section>
      </div>

      <StudentModal
        student={selectedStudent}
        canManage={canManage}
        onClose={() => setSelectedStudent(null)}
        onEdit={openEditStudent}
      />

      {isFormOpen && (
        <AddStudentModal
          mode={editingStudent ? 'edit' : 'add'}
          student={editingStudent}
          onClose={() => setIsFormOpen(false)}
          onSave={saveStudent}
        />
      )}
    </main>
  );
}

function StatCard({ label, value, icon: Icon }) {
  // Small reusable card used for the dashboard totals.
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}
