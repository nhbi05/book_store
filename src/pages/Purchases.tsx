import { useState } from 'react';
import { Menu, LayoutGrid, Users, EyeOff, SlidersHorizontal, Group, ArrowUpDown, Palette, Search, Share2, ChevronDown, Plus } from 'lucide-react';

interface Purchase {
  id: number;
  purchaseDate: string;
  supplierName: string;
  status: string;
  totalCost: number;
  itemsCount: number;
}

export default function Purchases() {
  const [purchases] = useState<Purchase[]>([
    { id: 1, purchaseDate: '2024-09-15', supplierName: 'BookWorld Distributors', status: 'Received', totalCost: 2500.00, itemsCount: 50 },
    { id: 2, purchaseDate: '2024-09-28', supplierName: 'Academic Press Ltd', status: 'Pending', totalCost: 1800.00, itemsCount: 35 },
    { id: 3, purchaseDate: '2024-10-05', supplierName: 'Global Books Inc', status: 'Received', totalCost: 3200.00, itemsCount: 75 }
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
              <span>All Purchases</span>
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
                  <span>Purchase Date</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Supplier Name</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Status</span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span className="flex items-center gap-1"><span>#</span><span>Items Count</span></span><ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Total Cost</span><ChevronDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) => (
              <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="px-3 py-2"><input type="checkbox" className="rounded" /></td>
                <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{purchase.purchaseDate}</td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline text-left">{purchase.supplierName}</button>
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    purchase.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{purchase.itemsCount}</td>
                <td className="px-3 py-2 text-sm text-gray-700">${purchase.totalCost.toFixed(2)}</td>
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
