import Link from 'next/link';
import SearchBar from './utils/searchBar';

const Navbar = () => {
  return (
    <nav className="bg-dark-blue text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className='nav-logo text-2xl font-bold'>SUAREC</Link>
        <div className="flex-1 flex justify-center space-x-4">
            <SearchBar />
          <Link href="/users" className="nav-link">Usuarios</Link>
          <Link href="/comments" className="nav-link">Comentarios</Link>
          <Link href="/publications" className="nav-link">Publicaciones</Link>
          <Link href="/companies" className="nav-link">Compañías</Link>
        </div>
        <Link href="/auth/login" className="nav-link">Log In</Link>
      </div>
    </nav>
  );
};

export default Navbar;
