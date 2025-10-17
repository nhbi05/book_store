-- =====================================================
-- BOOKSTORE SALES REPORTING QUERIES
-- =====================================================
-- This file contains comprehensive SQL queries for generating
-- sales reports including yearly, quarterly, and monthly breakdowns
-- Updated to match actual database schema with integer IDs
-- =====================================================

-- 1. YEARLY SALES REPORT
-- Shows total sales, orders, and average order value by year
CREATE OR REPLACE VIEW yearly_sales_report AS
SELECT 
    EXTRACT(YEAR FROM o.order_date) as year,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_revenue,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value,
    SUM(od.quantity) as total_books_sold
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY EXTRACT(YEAR FROM o.order_date)
ORDER BY year DESC;

-- 2. QUARTERLY SALES REPORT
-- Shows sales performance by quarter for detailed analysis
CREATE OR REPLACE VIEW quarterly_sales_report AS
SELECT 
    EXTRACT(YEAR FROM o.order_date) as year,
    EXTRACT(QUARTER FROM o.order_date) as quarter,
    CONCAT('Q', EXTRACT(QUARTER FROM o.order_date), ' ', EXTRACT(YEAR FROM o.order_date)) as period,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_revenue,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value,
    SUM(od.quantity) as total_books_sold
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(QUARTER FROM o.order_date)
ORDER BY year DESC, quarter DESC;

-- 3. MONTHLY SALES REPORT
-- Shows monthly sales trends for the current year
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT 
    EXTRACT(YEAR FROM o.order_date) as year,
    EXTRACT(MONTH FROM o.order_date) as month,
    TO_CHAR(o.order_date, 'Month YYYY') as period,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_revenue,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value,
    SUM(od.quantity) as total_books_sold
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date), TO_CHAR(o.order_date, 'Month YYYY')
ORDER BY year DESC, month DESC;

-- 4. TOP SELLING BOOKS REPORT
-- Shows best performing books by revenue and quantity
CREATE OR REPLACE VIEW top_selling_books AS
SELECT 
    b.bk_title,
    a.name as author_name,
    c.name as category_name,
    SUM(od.quantity) as total_quantity_sold,
    SUM(od.quantity * od.price) as total_revenue,
    AVG(od.price) as avg_selling_price,
    COUNT(DISTINCT od.order_id) as number_of_orders
FROM book b
JOIN authors a ON b.author_id = a.author_id
JOIN categories c ON b.category_id = c.category_id
JOIN orderdetails od ON b.book_id = od.book_id
JOIN orders o ON od.order_id = o.order_id
GROUP BY b.book_id, b.bk_title, a.name, c.name
ORDER BY total_revenue DESC;

-- 5. CATEGORY PERFORMANCE REPORT
-- Shows sales performance by book category
CREATE OR REPLACE VIEW category_sales_report AS
SELECT 
    c.name as category_name,
    COUNT(DISTINCT b.book_id) as books_in_category,
    SUM(od.quantity) as total_books_sold,
    SUM(od.quantity * od.price) as total_revenue,
    AVG(od.price) as avg_book_price,
    COUNT(DISTINCT od.order_id) as total_orders
FROM categories c
JOIN book b ON c.category_id = b.category_id
JOIN orderdetails od ON b.book_id = od.book_id
JOIN orders o ON od.order_id = o.order_id
GROUP BY c.category_id, c.name
ORDER BY total_revenue DESC;

-- 6. CUSTOMER ANALYSIS REPORT
-- Shows customer purchasing behavior and value
CREATE OR REPLACE VIEW customer_analysis_report AS
SELECT 
    cu.name as customer_name,
    cu.email,
    COUNT(DISTINCT o.order_id) as total_orders,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_spent,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value,
    SUM(od.quantity) as total_books_purchased,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date
FROM customers cu
JOIN orders o ON cu.customer_id = o.customer_id
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY cu.customer_id, cu.name, cu.email
ORDER BY total_spent DESC;

-- 7. PAYMENT METHOD ANALYSIS
-- Shows preferred payment methods and their performance
CREATE OR REPLACE VIEW payment_method_report AS
SELECT 
    COALESCE(o.payment_method, 'Not Specified') as payment_method,
    COUNT(DISTINCT o.order_id) as total_orders,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as total_revenue,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value,
    ROUND((COUNT(DISTINCT o.order_id) * 100.0 / SUM(COUNT(DISTINCT o.order_id)) OVER ()), 2) as percentage_of_orders
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
GROUP BY o.payment_method
ORDER BY total_revenue DESC;

-- 8. INVENTORY TURNOVER REPORT
-- Shows how well inventory is moving
CREATE OR REPLACE VIEW inventory_turnover_report AS
SELECT 
    b.bk_title,
    a.name as author_name,
    b.stock_quantity as current_stock,
    COALESCE(SUM(od.quantity), 0) as total_sold,
    b.price as current_price,
    CASE 
        WHEN b.stock_quantity > 0 THEN ROUND(COALESCE(SUM(od.quantity), 0)::numeric / b.stock_quantity, 2)
        ELSE 0 
    END as turnover_ratio,
    CASE 
        WHEN COALESCE(SUM(od.quantity), 0) = 0 THEN 'No Sales'
        WHEN b.stock_quantity = 0 THEN 'Out of Stock'
        WHEN COALESCE(SUM(od.quantity), 0)::numeric / NULLIF(b.stock_quantity, 0) > 2 THEN 'High Turnover'
        WHEN COALESCE(SUM(od.quantity), 0)::numeric / NULLIF(b.stock_quantity, 0) > 1 THEN 'Good Turnover'
        ELSE 'Low Turnover'
    END as turnover_status
FROM book b
JOIN authors a ON b.author_id = a.author_id
LEFT JOIN orderdetails od ON b.book_id = od.book_id
LEFT JOIN orders o ON od.order_id = o.order_id
GROUP BY b.book_id, b.bk_title, a.name, b.stock_quantity, b.price
ORDER BY turnover_ratio DESC;

-- 9. DAILY SALES TREND (Last 30 Days)
-- Shows recent daily sales performance
CREATE OR REPLACE VIEW daily_sales_trend AS
SELECT 
    DATE(o.order_date) as sale_date,
    COUNT(DISTINCT o.order_id) as orders_count,
    COALESCE(SUM(o.total_amount), SUM(od.quantity * od.price)) as daily_revenue,
    SUM(od.quantity) as books_sold,
    COALESCE(AVG(o.total_amount), AVG(od.quantity * od.price)) as avg_order_value
FROM orders o
JOIN orderdetails od ON o.order_id = od.order_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;

-- 10. PROFIT ANALYSIS REPORT
-- Compares selling price vs purchase cost for profit analysis
CREATE OR REPLACE VIEW profit_analysis_report AS
SELECT 
    b.bk_title,
    a.name as author_name,
    AVG(od.price) as avg_selling_price,
    AVG(pd.unit_cost) as avg_purchase_cost,
    AVG(od.price) - AVG(pd.unit_cost) as avg_profit_per_book,
    CASE 
        WHEN AVG(pd.unit_cost) > 0 THEN 
            ROUND(((AVG(od.price) - AVG(pd.unit_cost)) / AVG(pd.unit_cost) * 100), 2)
        ELSE 0 
    END as profit_margin_percentage,
    SUM(od.quantity) as total_sold,
    SUM((od.price - COALESCE(pd.unit_cost, 0)) * od.quantity) as total_profit
FROM book b
JOIN authors a ON b.author_id = a.author_id
LEFT JOIN orderdetails od ON b.book_id = od.book_id
LEFT JOIN orders o ON od.order_id = o.order_id
LEFT JOIN purchasedetails pd ON b.book_id = pd.book_id
WHERE od.order_id IS NOT NULL
GROUP BY b.book_id, b.bk_title, a.name
HAVING SUM(od.quantity) > 0
ORDER BY total_profit DESC;