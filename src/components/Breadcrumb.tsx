import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const location = useLocation();
  
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  const breadcrumbNames: { [key: string]: string } = {
    books: 'Books',
    authors: 'Authors',
    categories: 'Categories',
    customers: 'Customers',
    orders: 'Orders',
    suppliers: 'Suppliers',
    purchases: 'Purchases',
    reports: 'Reports',
    dashboard: 'Dashboard'
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        to="/books" 
        className="flex items-center hover:text-gray-800 transition"
      >
        <Home size={16} />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <div key={name} className="flex items-center">
            <ChevronRight size={16} className="mx-2" />
            {isLast ? (
              <span className="font-medium text-gray-800">
                {breadcrumbNames[name] || name}
              </span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-gray-800 transition"
              >
                {breadcrumbNames[name] || name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}