import React, { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function OrdersPage() {
  const [books, setBooks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    payment_method: '',
    book_id: '',
    quantity: '',
    price: ''
  })
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [viewOrder, setViewOrder] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)

  useEffect(() => {
    fetchBooks()
    fetchOrders()
  }, [])

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('book')
      .select('book_id, bk_title, price, stock_quantity')
    if (error) console.error(error)
    else setBooks(data || [])
  }

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name,
            contact,
            email
          ),
          orderdetails (
            book_id,
            quantity,
            price
          )
        `)
        .order('order_date', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setOrders([])
    }
  }

  function handleBookChange(bookId: string) {
    const selectedBook = books.find(b => b.book_id === parseInt(bookId))
    setFormData({
      ...formData,
      book_id: bookId,
      price: selectedBook?.price?.toString() || ''
    })
  }

  function calculateTotal() {
    const quantity = parseInt(formData.quantity) || 0
    const price = parseFloat(formData.price) || 0
    return (quantity * price).toFixed(2)
  }

  async function findOrCreateCustomer() {
    try {
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('customer_id')
        .ilike('name', formData.customer_name)
        .limit(1)
      if (existingCustomers && existingCustomers.length > 0) return existingCustomers[0].customer_id
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{
          name: formData.customer_name,
          contact: formData.customer_contact || null,
          email: formData.customer_email || null
        }])
        .select('customer_id')
        .single()
      if (createError) throw createError
      return newCustomer.customer_id
    } catch (err) {
      console.error('Error with customer:', err)
      throw err
    }
  }

  async function adjustStock(bookId: number, quantityChange: number) {
    const book = books.find(b => b.book_id === bookId)
    if (!book) throw new Error('Book not found')
    const newStock = book.stock_quantity - quantityChange
    if (newStock < 0) throw new Error('Not enough stock available')
    const { error } = await supabase
      .from('book')
      .update({ stock_quantity: newStock })
      .eq('book_id', bookId)
    if (error) throw error
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const customerId = await findOrCreateCustomer()
      const selectedBook = books.find(b => b.book_id === parseInt(formData.book_id))
      if (!selectedBook) throw new Error('Selected book not found')
      const quantity = parseInt(formData.quantity)
      if (quantity > selectedBook.stock_quantity) {
        alert('❌ Not enough stock available')
        return
      }
      const bookPrice = parseFloat(formData.price) || selectedBook.price || 0
      const totalPrice = bookPrice * quantity

      if (editingOrder) {
        const oldDetails = editingOrder.orderdetails[0]
        const oldBookId = oldDetails.book_id
        const oldQuantity = oldDetails.quantity
        if (oldBookId !== parseInt(formData.book_id)) {
          await adjustStock(oldBookId, -oldQuantity)
          await adjustStock(parseInt(formData.book_id), quantity)
        } else {
          const diff = quantity - oldQuantity
          if (diff !== 0) await adjustStock(oldBookId, diff)
        }

        const { error: orderError } = await supabase
          .from('orders')
          .update({ customer_id: customerId, payment_method: formData.payment_method, total_amount: totalPrice })
          .eq('order_id', editingOrder.order_id)
        if (orderError) throw orderError

        const { error: detailsError } = await supabase
          .from('orderdetails')
          .update({ book_id: parseInt(formData.book_id), quantity, price: totalPrice })
          .eq('order_id', editingOrder.order_id)
        if (detailsError) throw detailsError
        alert('✅ Order updated successfully!')
      } else {
        await adjustStock(parseInt(formData.book_id), quantity)
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({ customer_id: customerId, order_date: new Date().toISOString(), payment_method: formData.payment_method, total_amount: totalPrice })
          .select()
          .single()
        if (orderError) throw orderError
        const order_id = newOrder.order_id
        const { error: detailsError } = await supabase
          .from('orderdetails')
          .insert({ order_id, book_id: parseInt(formData.book_id), quantity, price: totalPrice, created_at: new Date().toISOString() })
        if (detailsError) throw detailsError
        alert('✅ Order created successfully!')
      }

      setFormData({ customer_name: '', customer_contact: '', customer_email: '', payment_method: '', book_id: '', quantity: '', price: '' })
      setEditingOrder(null)
      setShowForm(false)
      fetchBooks()
      fetchOrders()
    } catch (err: any) {
      console.error(err)
      alert('❌ Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (order: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this order? Stock will be restored.')) return
    try {
      const details = order.orderdetails[0]
      await adjustStock(details.book_id, -details.quantity * -1)
      const { error: detailsError } = await supabase.from('orderdetails').delete().eq('order_id', order.order_id)
      if (detailsError) throw detailsError
      const { error: orderError } = await supabase.from('orders').delete().eq('order_id', order.order_id)
      if (orderError) throw orderError
      alert('✅ Order deleted successfully!')
      fetchBooks()
      fetchOrders()
    } catch (err: any) {
      console.error(err)
      alert('❌ Error deleting order: ' + err.message)
    }
  }

  const openEdit = (order: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const details = order.orderdetails[0]
    const book = books.find(b => b.book_id === details.book_id)
    setEditingOrder(order)
    setFormData({
      customer_name: order.customers?.name || '',
      customer_contact: order.customers?.contact || '',
      customer_email: order.customers?.email || '',
      payment_method: order.payment_method || '',
      book_id: details.book_id.toString(),
      quantity: details.quantity.toString(),
      price: (book?.price || details.price).toString()
    })
    setShowForm(true)
  }

  // Clear form when opening for a new order
  const openAddOrder = () => {
    setEditingOrder(null)
    setFormData({
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      payment_method: '',
      book_id: '',
      quantity: '',
      price: ''
    })
    setShowForm(true)
  }

  const openView = (order: any) => setViewOrder(order)

  const filteredOrders = orders.filter(order =>
    order.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_id.toString().includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage customer orders and transactions</p>
        </div>
        <button
          onClick={openAddOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Order
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders by customer name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Form Modal (add/edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowForm(false); setEditingOrder(null) }} className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            <h3 className="text-lg font-semibold mb-4">{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={formData.customer_contact}
                    onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                    placeholder="Enter contact (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="Enter email (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                  <select
                    required
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book *</label>
                  <select
                    required
                    value={formData.book_id}
                    onChange={(e) => handleBookChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select book</option>
                    {books.map(book => (
                      <option key={book.book_id} value={book.book_id}>
                        {book.bk_title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">UGX{calculateTotal()}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => { setShowForm(false); setEditingOrder(null) }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">{loading ? 'Saving...' : editingOrder ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View-only Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setViewOrder(null)} className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-medium">Order ID:</span> {viewOrder.order_id}</div>
              <div><span className="font-medium">Customer Name:</span> {viewOrder.customers?.name}</div>
              <div><span className="font-medium">Contact:</span> {viewOrder.customers?.contact || 'N/A'}</div>
              <div><span className="font-medium">Email:</span> {viewOrder.customers?.email || 'N/A'}</div>
              <div><span className="font-medium">Book:</span> {books.find(b => b.book_id === viewOrder.orderdetails[0]?.book_id)?.bk_title || 'N/A'}</div>
              <div><span className="font-medium">Quantity:</span> {viewOrder.orderdetails[0]?.quantity}</div>
              <div><span className="font-medium">Price:</span> UGX{viewOrder.orderdetails[0]?.price}</div>
              <div><span className="font-medium">Payment Method:</span> {viewOrder.payment_method}</div>
              <div className="col-span-2"><span className="font-medium">Order Date:</span> {new Date(viewOrder.order_date).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-3 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="w-12 px-3 py-3 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedOrders.map((order, index) => (
                <tr 
                  key={order.order_id} 
                  onClick={() => openView(order)}
                  className={`border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-500">{startIndex + index + 1}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-blue-600 font-medium">{order.order_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{order.customers?.name || 'Unknown Customer'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{order.payment_method}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{new Date(order.order_date).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={(e) => openEdit(order, e)} className="text-gray-400 hover:text-blue-600 p-1" title="Edit">
                        <Edit size={14} />
                      </button>
                      <button onClick={(e) => handleDelete(order, e)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg mt-4 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first order'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Order
          </button>
        </div>
      )}
    </div>
  )
}