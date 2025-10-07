import { useState } from 'react';
import { Menu, LayoutGrid, Users, EyeOff, SlidersHorizontal, Group, ArrowUpDown, Palette, Search, Share2, ChevronDown, Plus } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  isbn: string;
  stockQuantity: number;
  price: number;
  authorLink: string;
  categoryLink: string;
}

export default function Books() {
  const [books] = useState<Book[]>([
    {
      id: 1,
      title: 'Advanced',
      isbn: '978-1234567890',
      stockQuantity: 50,
      price: 90.0,
      authorLink: 'Stephen Hawking',
      categoryLink: 'Mathematics'
    },
    {
      id: 2,
      title: 'Design Patterns in',
      isbn: '978-0987654321',
      stockQuantity: 30,
      price: 79.5,
      authorLink: 'Stephen Hawking',
      categoryLink: 'Mathematics'
    },
    {
      id: 3,
      title: 'Signals and',
      isbn: '978-5432167890',
      stockQuantity: 25,
      price: 95.0,
      authorLink: 'Stephen Hawking',
      categoryLink: 'Mathematics'
    }
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
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
              <span>Book Catalog</span>
              <ChevronDown size={14} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="All items">
              <Users size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Format columns">
              <Users size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Hide columns">
              <EyeOff size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Filter">
              <SlidersHorizontal size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Group">
              <Group size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Sort">
              <ArrowUpDown size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Color">
              <Palette size={16} />
            </button>
            <div className="w-px h-5 bg-gray-300"></div>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Find">
              <Search size={16} />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded" title="Share">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#faf9f8] border-b border-gray-200">
            <tr>
              <th className="w-12 px-3 py-2 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="w-12 px-3 py-2 text-left text-xs font-normal text-gray-600">
                <Menu size={14} />
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Book Title</span>
                  <ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>ISBN</span>
                  <ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span className="flex items-center gap-1">
                    <span>#</span>
                    <span>Stock Quantity</span>
                  </span>
                  <ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span className="flex items-center gap-1">
                    <span>#</span>
                    <span>Price</span>
                  </span>
                  <ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Author Link</span>
                  <ChevronDown size={12} />
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900">
                  <span>Category Link</span>
                  <ChevronDown size={12} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={book.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                <td className="px-3 py-2">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline text-left">
                    {book.title}
                  </button>
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{book.isbn}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{book.stockQuantity}</td>
                <td className="px-3 py-2 text-sm text-gray-700">{book.price.toFixed(1)}</td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline">
                    {book.authorLink}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button className="text-sm text-blue-600 hover:underline">
                    {book.categoryLink}
                  </button>
                </td>
              </tr>
            ))}
            {/* Add new row */}
            <tr className="hover:bg-gray-50">
              <td colSpan={8} className="px-3 py-2">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                  <Plus size={16} />
                  <span>New</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
