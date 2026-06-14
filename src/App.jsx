import { Outlet } from 'react-router-dom';

export default function App() {
  // Outlet renders whichever child route is currently active.
  return <Outlet />;
}
