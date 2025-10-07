import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Reports</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
          <FileText className="text-blue-600 mb-4" size={32} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Sales Report</h3>
          <p className="text-gray-600 text-sm">View detailed sales analytics and trends</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
          <FileText className="text-green-600 mb-4" size={32} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Inventory Report</h3>
          <p className="text-gray-600 text-sm">Check current stock levels and movements</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
          <FileText className="text-purple-600 mb-4" size={32} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Customer Report</h3>
          <p className="text-gray-600 text-sm">Analyze customer behavior and preferences</p>
        </div>
      </div>
    </div>
  );
}
