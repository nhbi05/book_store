import { useState } from 'react';
import { BookOpen, Menu, Settings, Bell } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Orders from './pages/Orders';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('books');

  const navigation = [
    { id: 'books', name: 'Books' },
    { id: 'authors', name: 'Authors' },
    { id: 'categories', name: 'Categories' },
    { id: 'customers', name: 'Customers' },
    { id: 'orders', name: 'Orders' },
    { id: 'suppliers', name: 'Suppliers' },
    { id: 'purchases', name: 'Purchases' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'books': return <Books />;
      case 'authors': return <Authors />;
      case 'categories': return <Categories />;
      case 'customers': return <Customers />;
      case 'suppliers': return <Suppliers />;
      case 'orders': return <Orders />;
      case 'purchases': return <Purchases />;
      case 'reports': return <Reports />;
      default: return <Books />;
    }
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
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-gray-700" />
              <span className="font-semibold text-gray-800">BookStore</span>
            </div>
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
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center px-4 gap-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-4 py-2 text-sm font-medium transition relative ${
                currentPage === item.id
                  ? 'text-gray-900 bg-white border-t-2 border-[#a4373a]'
                  : 'text-gray-700 hover:bg-[#d4b5b5]'
              }`}
            >
              {item.name}
              {currentPage === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a4373a]" />
              )}
            </button>
          ))}
          <button className="px-4 py-2 text-2xl text-gray-500 hover:bg-[#d4b5b5]">
            +
          </button>
        </div>
      </header>

      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
