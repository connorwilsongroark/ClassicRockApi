import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className='w-64 border-r bg-background p-4'>
      <h1 className='mb-6 text-lg font-semibold'>Admin</h1>

      <nav className='flex flex-col gap-2'>
        <Link to='/'>Dashboard</Link>
        <Link to='/albums'>Albums</Link>
        <Link to='/artists'>Artists</Link>
        <Link to='/tracks'>Tracks</Link>
        <Link to='/genres'>Genres</Link>
      </nav>
    </div>
  );
}
