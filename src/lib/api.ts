import { supabase, TABLES } from './supabase'
import type { 
  Author, 
  Category, 
  Book, 
  BookWithRelations,
  CreateAuthor,
  UpdateAuthor,
  CreateCategory,
  UpdateCategory,
  CreateBook,
  UpdateBook
} from '../types/database'

// Authors API
export const authorsAPI = {
  // Get all authors
  async getAll(): Promise<Author[]> {
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Get author by ID
  async getById(id: number): Promise<Author> {
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .select('*')
      .eq('author_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new author
  async create(author: CreateAuthor): Promise<Author> {
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .insert([author])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update author
  async update(id: number, updates: UpdateAuthor): Promise<Author> {
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .update(updates)
      .eq('author_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete author
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLES.AUTHORS)
      .delete()
      .eq('author_id', id)
    
    if (error) throw error
  }
}

// Categories API
export const categoriesAPI = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // Get category by ID
  async getById(id: number): Promise<Category> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .select('*')
      .eq('category_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new category
  async create(category: CreateCategory): Promise<Category> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert([category])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update category
  async update(id: number, updates: UpdateCategory): Promise<Category> {
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .update(updates)
      .eq('category_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete category
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CATEGORIES)
      .delete()
      .eq('category_id', id)
    
    if (error) throw error
  }
}

// Books API
export const booksAPI = {
  // Get all books with author and category details
  async getAll(): Promise<BookWithRelations[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get book by ID with author and category details
  async getById(id: number): Promise<BookWithRelations> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .eq('book_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Search books by title
  async searchByTitle(title: string): Promise<BookWithRelations[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .ilike('bk_title', `%${title}%`)
      .order('bk_title')
    
    if (error) throw error
    return data || []
  },

  // Get books by category
  async getByCategory(categoryId: number): Promise<BookWithRelations[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .eq('category_id', categoryId)
      .order('bk_title')
    
    if (error) throw error
    return data || []
  },

  // Get books by author
  async getByAuthor(authorId: number): Promise<BookWithRelations[]> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .eq('author_id', authorId)
      .order('bk_title')
    
    if (error) throw error
    return data || []
  },

  // Create new book
  async create(book: CreateBook): Promise<BookWithRelations> {
    const bookData = {
      ...book,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .insert([bookData])
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Update book
  async update(id: number, updates: UpdateBook): Promise<BookWithRelations> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .update(updates)
      .eq('book_id', id)
      .select(`
        *,
        authors(author_id, name),
        categories(category_id, name)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Delete book
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLES.BOOKS)
      .delete()
      .eq('book_id', id)
    
    if (error) throw error
  },

  // Update stock quantity
  async updateStock(id: number, quantity: number): Promise<Book> {
    const { data, error } = await supabase
      .from(TABLES.BOOKS)
      .update({ stock_quantity: quantity })
      .eq('book_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
