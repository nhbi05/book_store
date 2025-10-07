import { useState } from 'react';
import { Menu, LayoutGrid, Users, EyeOff, SlidersHorizontal, Group, ArrowUpDown, Palette, Search, Share2, ChevronDown, Plus } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  contact: string;
  email: string;
  totalOrders: number;
}

export default function Customers() {
  const [customers] = useState<Customer[]>([
    { id: 1, name: 'John Doe', contact: '+1234567890', email: 'john@example.com', totalOrders: 12 },
    { id: 2, name: 'Jane Smith', contact: '+0987654321', email: 'jane@example.com', totalOrders: 8 },
    { id: 3, name: 'Bob Johnson', contact: '+1122334455', email: 'bob@example.com', totalOrders: 15 }
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1">
              <Menu size={16} />
              <span className="text-sm">Views</span>
            </button>
            <div className="w-px h-5 bg-gray-300"></div>
            <button className="p-1.5 hover:bg-gray-100 rounded flex items-center gap-1.5 text-sm font-medium">
              <LayoutGrid size={16} />
              <span>All Customers</span>
              <ChevronDown size={14} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="All items">
              <Users size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Hide columns"><EyeOff size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Filter"><SlidersHorizontal size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Group"><Group size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Sort"><ArrowUpDown size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Color"><Palette size={16} /></button>
            <div className="w-px h-5 bg-gray-300"></div>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Find"><Search size={16} /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Share"><Share2 size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#faf9f8] border-b border-gray-200">
            <tr>
              <th className="w-12 px-3 py-2 text-left"><input type="checkbox" className="rounded" /></th>
              <th className="w-12 px-3 py-2 text-left text-xs font-normal text-gray-600"><Menu size={14} /></th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Customer Name</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Contact</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Email</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span className="flex items-center gap-1"><span>#</span><span>Total Orders</span></span><ChevronDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="px-3 py-2"><input type="checkbox" className="rounded" /></td>
                <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline text-left">{customer.name}</button>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{customer.contact}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{customer.email}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{customer.totalOrders}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-50">
              <td colSpan={6} className="px-3 py-2">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <Plus size={16} /><span>New</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
