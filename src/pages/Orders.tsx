import React, { useState, useEffect } from 'react'

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

  useEffect(() => {
    fetchBooks()
    fetchOrders()
  }, [])


  async function fetchBooks() {
    const { data, error } = await supabase
      .from('book')
      .select('book_id, bk_title, price')
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
      price: selectedBook?.price || ''
    })
  }

  function calculateTotal() {
    const quantity = parseInt(formData.quantity) || 0
    const price = parseFloat(formData.price) || 0
    return (quantity * price).toFixed(2)
  }

  async function findOrCreateCustomer() {
    try {
      // Search for existing customer (case-insensitive)
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('customer_id')
        .ilike('name', formData.customer_name)
        .limit(1)

      if (existingCustomers && existingCustomers.length > 0) {
        return existingCustomers[0].customer_id
      }

      // Create new customer if not found
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)

      const customerId = await findOrCreateCustomer()
      const selectedBook = books.find(b => b.book_id === parseInt(formData.book_id))
      const bookPrice = parseFloat(formData.price) || selectedBook?.price || 0
      const totalPrice = bookPrice * parseInt(formData.quantity)

      // Create order with payment_method and total_amount
      const orderPayload = {
        customer_id: customerId,
        order_date: new Date().toISOString(),
        payment_method: formData.payment_method,
        total_amount: totalPrice
      }

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderError) throw orderError

      const order_id = newOrder.order_id

      // Insert order details
      const detailsPayload = {
        order_id,
        book_id: parseInt(formData.book_id),
        quantity: parseInt(formData.quantity),
        price: totalPrice,
        created_at: new Date().toISOString()
      }

      const { error: detailsError } = await supabase
        .from('orderdetails')
        .insert(detailsPayload)

      if (detailsError) throw detailsError

      alert('✅ Order and Order Details saved successfully!')
      setFormData({
        customer_name: '',
        customer_contact: '',
        customer_email: '',
        payment_method: '',
        book_id: '',
        quantity: '',
        price: ''
      })
      setShowForm(false)
      fetchOrders()
    } catch (err: any) {
      console.error('Error saving order:', err.message)
      alert('❌ Error saving order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Order
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/30 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
            >
              &times;
            </button>

            <h3 className="text-lg font-semibold mb-4">Add New Order</h3>

            <div>
              <div className="mb-4 pb-4 border-b">
                <h4 className="text-md font-medium mb-3 text-gray-700">Customer Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_name: e.target.value })
                      }
                      required
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact (Optional)</label>
                    <input
                      type="text"
                      value={formData.customer_contact}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_contact: e.target.value })
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_email: e.target.value })
                      }
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b">
                <h4 className="text-md font-medium mb-3 text-gray-700">Order Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Book *</label>
                    <select
                      value={formData.book_id}
                      onChange={(e) => handleBookChange(e.target.value)}
                      required
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    >
                      <option value="">Select a Book</option>
                      {books.map((b) => (
                        <option key={b.book_id} value={b.book_id}>
                          {b.bk_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method *</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) =>
                        setFormData({ ...formData, payment_method: e.target.value })
                      }
                      required
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    >
                      <option value="">Select Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Mobile Money">Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                      min="1"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Price *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      step="0.01"
                      min="0"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                      placeholder="Price per unit"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calculateTotal()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {loading ? 'Saving...' : 'Save Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td className="p-2 border">{order.order_id}</td>
                <td className="p-2 border">
                  {order.customers?.name || 'Unknown Customer'}
                </td>
                <td className="p-2 border">{order.payment_method}</td>
                <td className="p-2 border">
                  {new Date(order.order_date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}