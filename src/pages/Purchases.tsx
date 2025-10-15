import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Calendar, Save } from 'lucide-react'
import { Toaster } from '../components/ui/sonner'
import { toast } from 'sonner'
import { suppliersAPI, booksAPI, purchasesAPI } from '../lib/api'
import type { Supplier, BookWithRelations, CreatePurchase, CreatePurchaseDetail } from '../types/database'

interface LineItem {
  book_id: number | ''
  quantity: number
  unit_cost: number
}

export default function Purchases() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [books, setBooks] = useState<BookWithRelations[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [purchases, setPurchases] = useState<any[]>([])

  const [supplierId, setSupplierId] = useState<number | ''>('')
  const [purchaseDate, setPurchaseDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<LineItem[]>([{ book_id: '', quantity: 0, unit_cost: 0 }])

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingList(true)
        const [s, b, p] = await Promise.all([
          suppliersAPI.getAll(),
          booksAPI.getAll(),
          purchasesAPI.list()
        ])
        setSuppliers(s)
        setBooks(b)
        setPurchases(p)
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingList(false)
      }
    }
    load()
  }, [])

  const totalCost = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.quantity > 0 && it.unit_cost > 0 ? it.quantity * it.unit_cost : 0), 0)
  }, [items])

  const updateItem = (index: number, update: Partial<LineItem>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...update } : it)))
  }

  const addItem = () => setItems((prev) => [...prev, { book_id: '', quantity: 0, unit_cost: 0 }])
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index))

  

  const handleSave = async () => {
    if (supplierId === '') {
      toast.error('Please select a supplier')
      return
    }
    const validDetails: CreatePurchaseDetail[] = []
    for (const it of items) {
      if (it.book_id === '' || it.quantity <= 0 || it.unit_cost <= 0) continue
      validDetails.push({
        purchase_id: 0, // placeholder, filled in API layer
        book_id: Number(it.book_id),
        quantity: Number(it.quantity),
        unit_cost: Number(it.unit_cost)
      } as any)
    }
    if (validDetails.length === 0) {
      toast.error('Please add at least one valid book line')
      return
    }

    const purchase: CreatePurchase = {
      supplier_id: Number(supplierId),
      purchase_date: new Date(purchaseDate).toISOString(),
      status: 'received'
    }

    try {
      setSaving(true)
      await purchasesAPI.createWithDetails(purchase, validDetails)
      
      // Update stock quantities for each book
      for (const detail of validDetails) {
        const book = books.find(b => b.book_id === detail.book_id)
        if (book) {
          const newStockQuantity = (book.stock_quantity || 0) + detail.quantity
          await booksAPI.update(detail.book_id, { stock_quantity: newStockQuantity })
        }
      }
      
      toast.success('Purchase saved and stock updated')
      // refresh list
      try {
        const [p, b] = await Promise.all([
          purchasesAPI.list(),
          booksAPI.getAll()
        ])
        setPurchases(p)
        setBooks(b)
      } catch {}
      // Reset form
      setSupplierId('')
      setPurchaseDate(new Date().toISOString().slice(0, 10))
       setItems([{ book_id: '', quantity: 0, unit_cost: 0 }])
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Failed to save purchase')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Purchase</h1>
          <p className="text-gray-600">Record supplier purchase and update stock</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Save size={18} />
          Save Purchase
        </button>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <div>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
              ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
            <input value={`UGX ${totalCost.toLocaleString()}`} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
        </div>
      </div>

      

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-700">Book</th>
                <th className="px-3 py-2 text-left text-sm text-gray-700">Qty</th>
                <th className="px-3 py-2 text-left text-sm text-gray-700">Unit Cost</th>
                <th className="px-3 py-2 text-left text-sm text-gray-700">Subtotal</th>
                <th className="px-3 py-2 text-right text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {items.map((it, idx) => {
                const book = books.find((b) => b.book_id === it.book_id)
                const subtotal = it.quantity > 0 && it.unit_cost > 0 ? it.quantity * it.unit_cost : 0
                return (
                  <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-3 py-2">
                      <select
                        value={it.book_id}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value)
                          const selected = books.find(b => b.book_id === val)
                          updateItem(idx, {
                            book_id: val as any,
                            unit_cost: selected ? Number(selected.price) : 0,
                            quantity: it.quantity > 0 ? it.quantity : 1
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select book</option>
                        {books.map((b) => (
                          <option key={b.book_id} value={b.book_id}>{b.bk_title}</option>
                        ))}
                      </select>
                      {book?.isbn && <div className="text-xs text-gray-500 mt-1">ISBN: {book.isbn}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min={0} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} className="w-24 px-3 py-2 border border-gray-300 rounded-lg" />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={it.unit_cost}
                        readOnly
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-900">UGX {(subtotal).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-600 p-1" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2">
          <button onClick={addItem} className="text-gray-700 hover:text-gray-900 inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Book
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <div className="text-right">
          <div className="text-sm text-gray-600">Total Purchase Cost</div>
          <div className="text-xl font-semibold text-gray-900">UGX {totalCost.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={addItem} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Add Line</button>
      </div>

      {/* Previous purchases */}
      <div className="mt-10 bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-gray-900">Previous Purchases</h2>
        </div>
        {loadingList ? (
          <div className="p-6 text-gray-600">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">#</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">Date</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">Supplier</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">Items</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">Total</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr><td className="px-3 py-4 text-gray-600" colSpan={6}>No purchases yet</td></tr>
                ) : (
                  purchases.map((p, i) => (
                    <tr key={p.purchase_id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-3 py-2 text-sm text-gray-600">{i + 1}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{new Date(p.purchase_date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-sm text-blue-600">{p.suppliers?.name || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{p.itemsCount}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">UGX {Number(p.totalCost || 0).toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}