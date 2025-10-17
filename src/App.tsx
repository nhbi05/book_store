import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, Menu, Settings, Bell, LogOut, User } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';
import type { User as UserType } from './types/auth';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';

const MainApp: React.FC<{ user: UserType; logout: () => Promise<void> }> = ({ user, logout }) => {
  const location = useLocation();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard' },
    { id: 'books', name: 'Books', path: '/books' },
    { id: 'authors', name: 'Authors', path: '/authors' },
    { id: 'categories', name: 'Categories', path: '/categories' },
    { id: 'customers', name: 'Customers', path: '/customers' },
    { id: 'orders', name: 'Orders', path: '/orders' },
    { id: 'suppliers', name: 'Suppliers', path: '/suppliers' },
    { id: 'purchases', name: 'Purchases', path: '/purchases' },
    { id: 'reports', name: 'Reports', path: '/reports' }
  ];
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#e4c5c5] border-b border-[#d4b5b5]">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#d4b5b5] rounded">
              <Menu size={20} className="text-gray-700" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 hover:bg-[#d4b5b5] rounded px-2 py-1 transition">
              <BookOpen size={20} className="text-gray-700" />
              <span className="font-semibold text-gray-800">BookStore</span>
            </Link>
          </div>
            <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm hover:bg-[#d4b5b5] rounded text-gray-700">
              Tools
            </button>
            <button className="p-2 hover:bg-[#d4b5b5] rounded">
              <Bell size={18} className="text-gray-700" />
            </button>
            <button className="p-2 hover:bg-[#d4b5b5] rounded">
              <Settings size={18} className="text-gray-700" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#d4b5b5]">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={18} />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-[#d4b5b5] rounded text-gray-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center px-4 gap-1">
          {navigation.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`px-4 py-2 text-sm font-medium transition relative ${
                location.pathname === item.path
                  ? 'text-gray-900 bg-white border-t-2 border-[#a4373a]'
                  : 'text-gray-700 hover:bg-[#d4b5b5]'
              }`}
            >
              {item.name}
              {location.pathname === item.path && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a4373a]" />
              )}
            </Link>
          ))}
          <Link to="/books" className="px-4 py-2 text-2xl text-gray-500 hover:bg-[#d4b5b5]" title="Add New">
            +
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthWrapper>
        {(user, logout) => <MainApp user={user} logout={logout} />}
      </AuthWrapper>
    </Router>
  );
}

export default App;
