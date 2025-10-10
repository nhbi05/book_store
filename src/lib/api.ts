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
  UpdateBook,
  Supplier,
  CreateSupplier,
  UpdateSupplier
} from '../types/database'

// Authors API
export const authorsAPI = {
  // Get all authors
  async getAll(): Promise<Author[]> {
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .select('*')
      .order('author_id', { ascending: false })
    
    if (error) throw error
    return data
  },

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
    // Omit author_id if present
    const { author_id, ...authorDataWithoutId } = author as any
    const { data, error } = await supabase
      .from(TABLES.AUTHORS)
      .insert([authorDataWithoutId])
      .select()
      .single()
    if (error) {
      if (error.code === '23505' && error.message?.includes('authors_pkey')) {
        throw new Error('Database sequence error for author_id. Please reset the authors_author_id_seq.')
      }
      throw error
    }
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
      .order('category_id', { ascending: false })
    
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
    // Omit category_id if present
    const { category_id, ...categoryDataWithoutId } = category as any
    const { data, error } = await supabase
      .from(TABLES.CATEGORIES)
      .insert([categoryDataWithoutId])
      .select()
      .single()
    if (error) {
      if (error.code === '23505' && error.message?.includes('categories_pkey')) {
        throw new Error('Database sequence error for category_id. Please reset the categories_category_id_seq.')
      }
      throw error
    }
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
      .order('book_id', { ascending: false })
    
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

  // Server-side search and filter for books
  async searchBooks({
    title = '',
    categoryId = '',
    authorId = ''
  }: { title?: string; categoryId?: string | number; authorId?: string | number }) : Promise<BookWithRelations[]> {
    let query = supabase
      .from(TABLES.BOOKS)
      .select(`*, authors(author_id, name), categories(category_id, name)`) // relations
      .order('book_id', { ascending: false })

    if (title) {
      query = query.ilike('bk_title', `%${title}%`)
    }
    if (categoryId && categoryId !== '') {
      query = query.eq('category_id', categoryId)
    }
    if (authorId && authorId !== '') {
      query = query.eq('author_id', authorId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Create new book
  async create(book: CreateBook): Promise<BookWithRelations> {
    // Ensure we don't pass book_id - let PostgreSQL auto-generate it
    const { book_id, ...bookDataWithoutId } = book as any
    const bookData = {
      ...bookDataWithoutId,
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
    
    if (error) {
      // If it's still a sequence issue, try to fix it
      if (error.code === '23505' && error.message?.includes('book_pkey')) {
        console.error('Database sequence is out of sync. This needs to be fixed in the database.')
        throw new Error('Database sequence error. Please contact the administrator to reset the book_id sequence.')
      }
      throw error
    }
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

// Suppliers API
export const suppliersAPI = {
  // Get all suppliers
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from(TABLES.SUPPLIERS)
      .select('*')
      .order('supplier_id', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get supplier by ID
  async getById(id: number): Promise<Supplier> {
    const { data, error } = await supabase
      .from(TABLES.SUPPLIERS)
      .select('*')
      .eq('supplier_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new supplier
  async create(supplier: CreateSupplier): Promise<Supplier> {
    // Omit supplier_id if present
    const { supplier_id, ...supplierDataWithoutId } = supplier as any
    const { data, error } = await supabase
      .from(TABLES.SUPPLIERS)
      .insert([supplierDataWithoutId])
      .select()
      .single()
    
    if (error) {
      if (error.code === '23505' && error.message?.includes('suppliers_pkey')) {
        throw new Error('Database sequence error for supplier_id. Please reset the suppliers_supplier_id_seq.')
      }
      throw error
    }
    return data
  },

  // Update supplier
  async update(id: number, updates: UpdateSupplier): Promise<Supplier> {
    const { data, error } = await supabase
      .from(TABLES.SUPPLIERS)
      .update(updates)
      .eq('supplier_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete supplier
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SUPPLIERS)
      .delete()
      .eq('supplier_id', id)
    
    if (error) throw error
  }
}
