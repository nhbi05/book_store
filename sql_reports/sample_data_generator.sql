-- =====================================================
-- SAMPLE DATA GENERATOR FOR BOOKSTORE REPORTS
-- =====================================================
-- This script generates sample data to demonstrate the reporting system
-- Run this script to populate your database with test data
-- =====================================================

-- Insert sample authors
INSERT INTO authors (name) VALUES 
('J.K. Rowling'),
('Stephen King'),
('Agatha Christie'),
('George Orwell'),
('Jane Austen'),
('Mark Twain'),
('Ernest Hemingway'),
('F. Scott Fitzgerald'),
('Harper Lee'),
('J.R.R. Tolkien')
ON CONFLICT DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Fiction', 'Fictional literature and novels'),
('Mystery', 'Mystery and thriller books'),
('Science Fiction', 'Science fiction and fantasy'),
('Romance', 'Romance novels'),
('Biography', 'Biographical works'),
('History', 'Historical books'),
('Self-Help', 'Self-improvement books'),
('Technology', 'Technology and programming books'),
('Children', 'Children and young adult books'),
('Business', 'Business and entrepreneurship')
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact, email, address) VALUES 
('BookWorld Distributors', 'John Smith', 'john@bookworld.com', '123 Publisher St, New York, NY'),
('Literary Supply Co', 'Sarah Johnson', 'sarah@literarysupply.com', '456 Book Ave, Chicago, IL'),
('Global Books Inc', 'Mike Wilson', 'mike@globalbooks.com', '789 Reading Rd, Los Angeles, CA'),
('Academic Press', 'Lisa Brown', 'lisa@academicpress.com', '321 Scholar Ln, Boston, MA'),
('Fiction First', 'David Lee', 'david@fictionfirst.com', '654 Story St, Seattle, WA')
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, contact, email) VALUES 
('Alice Johnson', '555-0101', 'alice@email.com'),
('Bob Smith', '555-0102', 'bob@email.com'),
('Carol Davis', '555-0103', 'carol@email.com'),
('David Wilson', '555-0104', 'david@email.com'),
('Emma Brown', '555-0105', 'emma@email.com'),
('Frank Miller', '555-0106', 'frank@email.com'),
('Grace Taylor', '555-0107', 'grace@email.com'),
('Henry Clark', '555-0108', 'henry@email.com'),
('Ivy Martinez', '555-0109', 'ivy@email.com'),
('Jack Anderson', '555-0110', 'jack@email.com'),
('Kate Thompson', '555-0111', 'kate@email.com'),
('Liam Garcia', '555-0112', 'liam@email.com'),
('Mia Rodriguez', '555-0113', 'mia@email.com'),
('Noah Lewis', '555-0114', 'noah@email.com'),
('Olivia Walker', '555-0115', 'olivia@email.com')
ON CONFLICT DO NOTHING;

-- Insert sample books (using subqueries to get IDs)
INSERT INTO books (bk_title, author_id, category_id, isbn, stock_quantity, price) 
SELECT * FROM (VALUES 
    ('Harry Potter and the Sorcerer''s Stone', (SELECT author_id FROM authors WHERE name = 'J.K. Rowling' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780439708180', 50, 12.99),
    ('The Shining', (SELECT author_id FROM authors WHERE name = 'Stephen King' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Mystery' LIMIT 1), '9780307743657', 30, 15.99),
    ('Murder on the Orient Express', (SELECT author_id FROM authors WHERE name = 'Agatha Christie' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Mystery' LIMIT 1), '9780062693662', 25, 13.99),
    ('1984', (SELECT author_id FROM authors WHERE name = 'George Orwell' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Science Fiction' LIMIT 1), '9780451524935', 40, 14.99),
    ('Pride and Prejudice', (SELECT author_id FROM authors WHERE name = 'Jane Austen' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Romance' LIMIT 1), '9780141439518', 35, 11.99),
    ('The Adventures of Tom Sawyer', (SELECT author_id FROM authors WHERE name = 'Mark Twain' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780486400778', 20, 10.99),
    ('The Old Man and the Sea', (SELECT author_id FROM authors WHERE name = 'Ernest Hemingway' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780684801223', 28, 12.99),
    ('The Great Gatsby', (SELECT author_id FROM authors WHERE name = 'F. Scott Fitzgerald' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780743273565', 45, 13.99),
    ('To Kill a Mockingbird', (SELECT author_id FROM authors WHERE name = 'Harper Lee' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780061120084', 32, 14.99),
    ('The Hobbit', (SELECT author_id FROM authors WHERE name = 'J.R.R. Tolkien' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Science Fiction' LIMIT 1), '9780547928227', 38, 16.99),
    ('Harry Potter and the Chamber of Secrets', (SELECT author_id FROM authors WHERE name = 'J.K. Rowling' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780439064873', 42, 12.99),
    ('It', (SELECT author_id FROM authors WHERE name = 'Stephen King' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Mystery' LIMIT 1), '9781501142970', 22, 17.99),
    ('And Then There Were None', (SELECT author_id FROM authors WHERE name = 'Agatha Christie' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Mystery' LIMIT 1), '9780062073488', 33, 13.99),
    ('Animal Farm', (SELECT author_id FROM authors WHERE name = 'George Orwell' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Fiction' LIMIT 1), '9780451526342', 29, 11.99),
    ('Sense and Sensibility', (SELECT author_id FROM authors WHERE name = 'Jane Austen' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Romance' LIMIT 1), '9780141439662', 26, 12.99)
) AS v(title, author_id, category_id, isbn, stock, price)
ON CONFLICT DO NOTHING;

-- Generate sample orders for the last 2 years with realistic distribution
DO $$
DECLARE
    customer_ids uuid[];
    book_ids uuid[];
    order_id uuid;
    customer_id uuid;
    book_id uuid;
    order_date timestamptz;
    i integer;
    j integer;
    quantity integer;
    price numeric;
    payment_methods text[] := ARRAY['Credit Card', 'Debit Card', 'Cash', 'PayPal', 'Bank Transfer'];
BEGIN
    -- Get all customer and book IDs
    SELECT array_agg(customer_id) INTO customer_ids FROM customers;
    SELECT array_agg(book_id) INTO book_ids FROM books;
    
    -- Generate orders for the last 24 months
    FOR i IN 1..500 LOOP
        -- Random date in the last 24 months
        order_date := NOW() - (random() * interval '730 days');
        
        -- Random customer
        customer_id := customer_ids[1 + floor(random() * array_length(customer_ids, 1))];
        
        -- Create order
        INSERT INTO orders (customer_id, order_date, status, payment_method)
        VALUES (
            customer_id,
            order_date,
            CASE WHEN random() < 0.9 THEN 'completed' ELSE 'pending' END,
            payment_methods[1 + floor(random() * array_length(payment_methods, 1))]
        )
        RETURNING order_id INTO order_id;
        
        -- Add 1-5 books to each order
        FOR j IN 1..(1 + floor(random() * 4)) LOOP
            book_id := book_ids[1 + floor(random() * array_length(book_ids, 1))];
            quantity := 1 + floor(random() * 3); -- 1-3 books
            
            -- Get book price
            SELECT b.price INTO price FROM books b WHERE b.book_id = book_id;
            
            -- Add some price variation (±20%)
            price := price * (0.8 + random() * 0.4);
            
            INSERT INTO orderdetails (order_id, book_id, quantity, price)
            VALUES (order_id, book_id, quantity, price);
        END LOOP;
    END LOOP;
END $$;

-- Generate sample purchases
DO $$
DECLARE
    supplier_ids uuid[];
    book_ids uuid[];
    purchase_id uuid;
    supplier_id uuid;
    book_id uuid;
    purchase_date timestamptz;
    i integer;
    j integer;
    quantity integer;
    unit_cost numeric;
BEGIN
    -- Get all supplier and book IDs
    SELECT array_agg(supplier_id) INTO supplier_ids FROM suppliers;
    SELECT array_agg(book_id) INTO book_ids FROM books;
    
    -- Generate purchases for the last 24 months
    FOR i IN 1..100 LOOP
        -- Random date in the last 24 months
        purchase_date := NOW() - (random() * interval '730 days');
        
        -- Random supplier
        supplier_id := supplier_ids[1 + floor(random() * array_length(supplier_ids, 1))];
        
        -- Create purchase
        INSERT INTO purchases (supplier_id, purchase_date, status)
        VALUES (
            supplier_id,
            purchase_date,
            CASE WHEN random() < 0.85 THEN 'received' ELSE 'pending' END
        )
        RETURNING purchase_id INTO purchase_id;
        
        -- Add 3-10 different books to each purchase
        FOR j IN 1..(3 + floor(random() * 7)) LOOP
            book_id := book_ids[1 + floor(random() * array_length(book_ids, 1))];
            quantity := 10 + floor(random() * 40); -- 10-50 books
            
            -- Get book price and calculate cost (typically 60-80% of selling price)
            SELECT b.price * (0.6 + random() * 0.2) INTO unit_cost FROM books b WHERE b.book_id = book_id;
            
            INSERT INTO purchasedetails (purchase_id, book_id, quantity, unit_cost, received_quantity)
            VALUES (purchase_id, book_id, quantity, unit_cost, 
                   CASE WHEN random() < 0.9 THEN quantity ELSE floor(quantity * 0.8) END);
        END LOOP;
    END LOOP;
END $$;

-- Update book stock quantities based on purchases and sales
UPDATE books SET stock_quantity = (
    SELECT GREATEST(0, 
        COALESCE((SELECT SUM(pd.received_quantity) FROM purchasedetails pd WHERE pd.book_id = books.book_id), 0) -
        COALESCE((SELECT SUM(od.quantity) FROM orderdetails od 
                  JOIN orders o ON od.order_id = o.order_id 
                  WHERE od.book_id = books.book_id AND o.status = 'completed'), 0)
    )
);

RAISE NOTICE 'Sample data generation completed successfully!';
RAISE NOTICE 'Generated approximately 500 orders with multiple order details';
RAISE NOTICE 'Generated approximately 100 purchases with multiple purchase details';
RAISE NOTICE 'Updated book stock quantities based on transactions';