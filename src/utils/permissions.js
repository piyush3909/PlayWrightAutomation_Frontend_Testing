export function canManageStudents(user) {
  // The admin role is the only role allowed to add, edit, or delete students.
  return user?.role === 'admin';
}
