import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ShoppingCart, TrendingUp, Plus, Eye, FileText, Package, UserPlus, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { name: 'Total Books', value: '0', icon: BookOpen, color: 'bg-blue-500', path: '/books' },
    { name: 'Total Customers', value: '0', icon: Users, color: 'bg-green-500', path: '/customers' },
    { name: 'Total Orders', value: '0', icon: ShoppingCart, color: 'bg-purple-500', path: '/orders' },
    { name: 'Revenue', value: 'UGX 0', icon: TrendingUp, color: 'bg-orange-500', path: '/reports' },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch books count
      const { count: booksCount } = await supabase
        .from('book')
        .select('*', { count: 'exact', head: true });

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Fetch total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          total_amount,
          orderdetails(quantity, price)
        `);

      const totalRevenue = orders?.reduce((sum: number, order: any) => {
        const orderRevenue = order.total_amount || 
          order.orderdetails?.reduce((odSum: number, od: any) => odSum + (od.quantity * od.price), 0) || 0;
        return sum + orderRevenue;
      }, 0) || 0;

      setStats([
        { name: 'Total Books', value: booksCount?.toString() || '0', icon: BookOpen, color: 'bg-blue-500', path: '/books' },
        { name: 'Total Customers', value: customersCount?.toString() || '0', icon: Users, color: 'bg-green-500', path: '/customers' },
        { name: 'Total Orders', value: ordersCount?.toString() || '0', icon: ShoppingCart, color: 'bg-purple-500', path: '/orders' },
        { name: 'Revenue', value: `UGX ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-500', path: '/reports' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { name: 'Add New Book', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700', path: '/books' },
    { name: 'New Customer', icon: UserPlus, color: 'bg-green-600 hover:bg-green-700', path: '/customers' },
    { name: 'Create Order', icon: ShoppingBag, color: 'bg-purple-600 hover:bg-purple-700', path: '/orders' },
    { name: 'View Reports', icon: FileText, color: 'bg-orange-600 hover:bg-orange-700', path: '/reports' },
    { name: 'Manage Inventory', icon: Package, color: 'bg-indigo-600 hover:bg-indigo-700', path: '/books' },
    { name: 'View All Orders', icon: Eye, color: 'bg-gray-600 hover:bg-gray-700', path: '/orders' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <div className="text-sm text-gray-600">
          Welcome back! Here's what's happening in your bookstore.
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.name} 
              to={stat.path}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.path}
                className={`${action.color} text-white p-4 rounded-lg text-center transition flex flex-col items-center gap-2`}
              >
                <Icon size={24} />
                <span className="text-sm font-medium">{action.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Welcome */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Welcome to BookStore Management</h3>
          <p className="text-gray-600 mb-4">
            Your comprehensive bookstore management system is ready to help you:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-500" />
              Manage your book inventory efficiently
            </li>
            <li className="flex items-center gap-2">
              <Users size={16} className="text-green-500" />
              Track customer relationships and orders
            </li>
            <li className="flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              Monitor sales performance and analytics
            </li>
            <li className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-purple-500" />
              Process orders and manage transactions
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h3>
          <div className="space-y-3">
            <Link 
              to="/books" 
              className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <div className="font-medium text-blue-800">📚 Manage Books</div>
              <div className="text-sm text-blue-600">Add, edit, and organize your book inventory</div>
            </Link>
            <Link 
              to="/customers" 
              className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <div className="font-medium text-green-800">👥 Customer Management</div>
              <div className="text-sm text-green-600">Track customer information and purchase history</div>
            </Link>
            <Link 
              to="/reports" 
              className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
            >
              <div className="font-medium text-orange-800">📊 View Reports</div>
              <div className="text-sm text-orange-600">Analyze sales data and business performance</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
