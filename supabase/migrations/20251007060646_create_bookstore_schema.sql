/*
  # Create Bookstore Database Schema

  ## Overview
  This migration creates a comprehensive bookstore management system with support for:
  - Book inventory management
  - Author tracking
  - Category organization
  - Customer management
  - Supplier relationships
  - Order processing
  - Purchase tracking

  ## New Tables

  ### 1. authors
    - `author_id` (uuid, primary key) - Unique identifier for each author
    - `name` (text, required) - Author's full name
    - `created_at` (timestamptz) - Record creation timestamp

  ### 2. categories
    - `category_id` (uuid, primary key) - Unique identifier for each category
    - `name` (varchar, required) - Category name
    - `description` (text) - Category description
    - `created_at` (timestamptz) - Record creation timestamp

  ### 3. suppliers
    - `supplier_id` (uuid, primary key) - Unique identifier for each supplier
    - `name` (varchar, required) - Supplier company name
    - `contact` (varchar) - Contact person name
    - `email` (varchar) - Supplier email address
    - `address` (text) - Supplier physical address
    - `created_at` (timestamptz) - Record creation timestamp

  ### 4. books
    - `book_id` (uuid, primary key) - Unique identifier for each book
    - `bk_title` (varchar, required) - Book title
    - `author_id` (uuid, foreign key) - References authors table
    - `category_id` (uuid, foreign key) - References categories table
    - `isbn` (varchar, unique) - International Standard Book Number
    - `stock_quantity` (int4) - Current stock level
    - `price` (float8) - Book selling price
    - `created_at` (timestamptz) - Record creation timestamp

  ### 5. customers
    - `customer_id` (uuid, primary key) - Unique identifier for each customer
    - `name` (varchar, required) - Customer full name
    - `contact` (varchar) - Customer contact number
    - `email` (varchar) - Customer email address
    - `created_at` (timestamptz) - Record creation timestamp

  ### 6. orders
    - `order_id` (uuid, primary key) - Unique identifier for each order
    - `customer_id` (uuid, foreign key) - References customers table
    - `order_date` (timestamptz) - When the order was placed
    - `status` (varchar) - Order status (pending, completed, cancelled)
    - `payment_method` (varchar) - Payment method used
    - `created_at` (timestamptz) - Record creation timestamp

  ### 7. orderdetails
    - `order_details_id` (uuid, primary key) - Unique identifier for each order line item
    - `order_id` (uuid, foreign key) - References orders table
    - `book_id` (uuid, foreign key) - References books table
    - `quantity` (int4) - Number of books ordered
    - `price` (numeric) - Price per book at time of order
    - `created_at` (timestamptz) - Record creation timestamp

  ### 8. purchases
    - `purchase_id` (uuid, primary key) - Unique identifier for each purchase
    - `supplier_id` (uuid, foreign key) - References suppliers table
    - `purchase_date` (timestamptz) - When the purchase was made
    - `status` (varchar) - Purchase status (pending, received, cancelled)
    - `created_at` (timestamptz) - Record creation timestamp

  ### 9. purchasedetails
    - `purchase_details_id` (uuid, primary key) - Unique identifier for each purchase line item
    - `purchase_id` (uuid, foreign key) - References purchases table
    - `book_id` (uuid, foreign key) - References books table
    - `quantity` (int4) - Number of books purchased
    - `unit_cost` (numeric) - Cost per book
    - `received_quantity` (int4) - Number of books actually received
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
    - RLS enabled on all tables
    - Authenticated users can perform all operations
    - Public access is restricted

  ## Notes
    - All tables use UUID primary keys for better scalability
    - Timestamps track record creation for audit purposes
    - Foreign key constraints ensure referential integrity
    - Default values provided where appropriate
*/

-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  author_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  category_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  contact varchar(255),
  email varchar(255),
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  book_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bk_title varchar(255) NOT NULL,
  author_id uuid REFERENCES authors(author_id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(category_id) ON DELETE SET NULL,
  isbn varchar(20) UNIQUE,
  stock_quantity int4 DEFAULT 0,
  price float8 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  contact varchar(255),
  email varchar(255),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(customer_id) ON DELETE SET NULL,
  order_date timestamptz DEFAULT now(),
  status varchar(50) DEFAULT 'pending',
  payment_method varchar(50),
  created_at timestamptz DEFAULT now()
);

-- Create orderdetails table
CREATE TABLE IF NOT EXISTS orderdetails (
  order_details_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(order_id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(book_id) ON DELETE SET NULL,
  quantity int4 NOT NULL DEFAULT 1,
  price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
  purchase_date timestamptz DEFAULT now(),
  status varchar(50) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create purchasedetails table
CREATE TABLE IF NOT EXISTS purchasedetails (
  purchase_details_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(purchase_id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(book_id) ON DELETE SET NULL,
  quantity int4 NOT NULL DEFAULT 1,
  unit_cost numeric(10, 2) NOT NULL,
  received_quantity int4 DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderdetails ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchasedetails ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for authors
CREATE POLICY "Authenticated users can view authors"
  ON authors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert authors"
  ON authors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update authors"
  ON authors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete authors"
  ON authors FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for categories
CREATE POLICY "Authenticated users can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for suppliers
CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for books
CREATE POLICY "Authenticated users can view books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for customers
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for orders
CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for orderdetails
CREATE POLICY "Authenticated users can view orderdetails"
  ON orderdetails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert orderdetails"
  ON orderdetails FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orderdetails"
  ON orderdetails FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orderdetails"
  ON orderdetails FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for purchases
CREATE POLICY "Authenticated users can view purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchases"
  ON purchases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchases"
  ON purchases FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for purchasedetails
CREATE POLICY "Authenticated users can view purchasedetails"
  ON purchasedetails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert purchasedetails"
  ON purchasedetails FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update purchasedetails"
  ON purchasedetails FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete purchasedetails"
  ON purchasedetails FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orderdetails_order ON orderdetails(order_id);
CREATE INDEX IF NOT EXISTS idx_orderdetails_book ON orderdetails(book_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchasedetails_purchase ON purchasedetails(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchasedetails_book ON purchasedetails(book_id);