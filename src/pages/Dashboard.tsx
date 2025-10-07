import { BookOpen, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Total Books', value: '1,234', icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Total Customers', value: '567', icon: Users, color: 'bg-green-500' },
    { name: 'Total Orders', value: '890', icon: ShoppingCart, color: 'bg-purple-500' },
    { name: 'Revenue', value: '$45,678', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Welcome to BookStore Management System</h3>
        <p className="text-gray-600">
          Manage your bookstore efficiently with our comprehensive management system. 
          Navigate through the sidebar to access different sections.
        </p>
      </div>
    </div>
  );
}
