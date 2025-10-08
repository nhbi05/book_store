import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, User, BookOpen } from 'lucide-react'
import { authorsAPI, booksAPI } from '../lib/api'
import type { Author, CreateAuthor, UpdateAuthor } from '../types/database'

interface AuthorFormData {
  name: string
}

interface AuthorWithBookCount extends Author {
  bookCount?: number
}

export default function Authors() {
  const [authors, setAuthors] = useState<AuthorWithBookCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [formData, setFormData] = useState<AuthorFormData>({
    name: ''
  })

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    try {
      setLoading(true)
      const authorsData = await authorsAPI.getAll()
      
      // Get book counts for each author
      const authorsWithCounts = await Promise.all(
        authorsData.map(async (author) => {
          try {
            const books = await booksAPI.searchBooks({ authorId: author.author_id })
            return { ...author, bookCount: books.length }
          } catch (error) {
            console.error(`Error getting books for author ${author.author_id}:`, error)
            return { ...author, bookCount: 0 }
          }
        })
      )
      
      setAuthors(authorsWithCounts)
    } catch (error) {
      console.error('Error loading authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredAuthors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openModal = (author?: Author) => {
    if (author) {
      setEditingAuthor(author)
      setFormData({
        name: author.name
      })
    } else {
      setEditingAuthor(null)
      setFormData({
        name: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAuthor(null)
    setFormData({
      name: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const authorData: CreateAuthor | UpdateAuthor = {
        name: formData.name
      }

      if (editingAuthor) {
        await authorsAPI.update(editingAuthor.author_id, authorData)
      } else {
        await authorsAPI.create(authorData as CreateAuthor)
      }

      await loadAuthors()
      closeModal()
    } catch (error) {
      console.error('Error saving author:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this author? This will also remove the author from all associated books.')) {
      try {
        await authorsAPI.delete(id)
        await loadAuthors()
      } catch (error) {
        console.error('Error deleting author:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors Management</h1>
          <p className="text-gray-600">Manage book authors and their publications</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Author
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Authors Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-3 py-3 text-left">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="w-12 px-3 py-3 text-left text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Author Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Books Published
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedAuthors.map((author, index) => (
                <tr key={author.author_id} className={`border-b border-gray-100 hover:bg-gray-50/50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-500">{startIndex + index + 1}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
                      {author.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {author.bookCount || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openModal(author)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(author.author_id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete"
                      >
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
      {filteredAuthors.length > 0 && totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg mt-4 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAuthors.length)} of {filteredAuthors.length} results
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

      {filteredAuthors.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first author'}
          </p>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Author
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter author's full name"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingAuthor ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
