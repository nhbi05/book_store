import { useState } from 'react';
import { Menu, LayoutGrid, Users, EyeOff, SlidersHorizontal, Group, ArrowUpDown, Palette, Search, Share2, ChevronDown, Plus } from 'lucide-react';

interface Order {
  id: number;
  orderDate: string;
  customerName: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
}

export default function Orders() {
  const [orders] = useState<Order[]>([
    { id: 1, orderDate: '2024-10-05', customerName: 'John Doe', status: 'Completed', paymentMethod: 'Credit Card', totalAmount: 450.00 },
    { id: 2, orderDate: '2024-10-06', customerName: 'Jane Smith', status: 'Pending', paymentMethod: 'Cash', totalAmount: 238.50 },
    { id: 3, orderDate: '2024-10-07', customerName: 'Bob Johnson', status: 'Completed', paymentMethod: 'Debit Card', totalAmount: 1425.00 }
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
              <span>All Orders</span>
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
                  <span>Order Date</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Customer Name</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Status</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Payment Method</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Total Amount</span><ChevronDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="px-3 py-2"><input type="checkbox" className="rounded" /></td>
                <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{order.orderDate}</td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline text-left">{order.customerName}</button>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{order.paymentMethod}</td>
                <td className="px-3 py-2 text-sm text-gray-700">${order.totalAmount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="hover:bg-gray-50">
              <td colSpan={7} className="px-3 py-2">
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
