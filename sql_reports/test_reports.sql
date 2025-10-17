-- =====================================================
-- TEST SCRIPT FOR SALES REPORTS
-- =====================================================
-- Use this to test the reporting views with sample queries

-- Test 1: Check if we have any data
SELECT 'Orders Count' as metric, COUNT(*) as value FROM orders
UNION ALL
SELECT 'Order Details Count', COUNT(*) FROM orderdetails
UNION ALL
SELECT 'Books Count', COUNT(*) FROM book
UNION ALL
SELECT 'Customers Count', COUNT(*) FROM customers;

-- Test 2: Simple sales summary
SELECT 
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_revenue,
    SUM(od.quantity) as total_books_sold
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id;

-- Test 3: Sales by year (simplified)
SELECT 
    EXTRACT(YEAR FROM o.order_date) as year,
    COUNT(DISTINCT o.order_id) as orders,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as revenue
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY EXTRACT(YEAR FROM o.order_date)
ORDER BY year DESC;

-- Test 4: Top 5 books by revenue
SELECT 
    b.bk_title,
    a.name as author,
    SUM(od.quantity) as sold,
    SUM(od.quantity * od.price) as revenue
FROM book b
JOIN authors a ON b.author_id = a.author_id
JOIN orderdetails od ON b.book_id = od.book_id
GROUP BY b.book_id, b.bk_title, a.name
ORDER BY revenue DESC
LIMIT 5;

-- Test 5: Category performance
SELECT 
    c.name as category,
    COUNT(DISTINCT b.book_id) as books_count,
    COALESCE(SUM(od.quantity), 0) as total_sold,
    COALESCE(SUM(od.quantity * od.price), 0) as revenue
FROM categories c
LEFT JOIN book b ON c.category_id = b.category_id
LEFT JOIN orderdetails od ON b.book_id = od.book_id
GROUP BY c.category_id, c.name
ORDER BY revenue DESC;