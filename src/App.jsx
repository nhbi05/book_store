import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '2rem' }}>
        <Link to="/" style={{ marginRight: 16 }}>Dashboard</Link>
        <Link to="/books" style={{ marginRight: 16 }}>Books</Link>
        <Link to="/authors" style={{ marginRight: 16 }}>Authors</Link>
        <Link to="/categories" style={{ marginRight: 16 }}>Categories</Link>
        <Link to="/users" style={{ marginRight: 16 }}>Users</Link>
        <Link to="/orders" style={{ marginRight: 16 }}>Orders</Link>
        <Link to="/suppliers" style={{ marginRight: 16 }}>Suppliers</Link>
        <Link to="/purchases" style={{ marginRight: 16 }}>Purchases</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
