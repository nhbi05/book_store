import { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SalesChart from '../components/reports/SalesChart';
import CategoryPieChart from '../components/reports/CategoryPieChart';
import TopBooksTable from '../components/reports/TopBooksTable';
import ReportSelector from '../components/reports/ReportSelector';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface CategoryData {
  name: string;
  value: number;
  revenue: number;
}

interface TopBook {
  title: string;
  author: string;
  sold: number;
  revenue: number;
  orders: number;
}

interface InventoryItem {
  title: string;
  author: string;
  currentStock: number;
  totalSold: number;
  turnoverRatio: number;
  status: string;
  price: number;
}

interface CustomerData {
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export default function Reports() {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('yearly');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, activeReport]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch different data based on report type
      if (activeReport === 'inventory') {
        await fetchInventoryData();
        return;
      } else if (activeReport === 'customers') {
        await fetchCustomerData();
        return;
      }

      // Fetch sales data based on date range for overview and sales reports
      if (dateRange === 'yearly') {
        const { data: sales } = await supabase
          .from('orders')
          .select(`
            order_date,
            total_amount,
            customer_id,
            orderdetails(quantity, price)
          `);

        const yearlyData = sales?.reduce((acc: any, order: any) => {
          const year = new Date(order.order_date).getFullYear().toString();
          if (!acc[year]) {
            acc[year] = { period: year, revenue: 0, orders: 0, customers: new Set() };
          }
          
          const orderRevenue = order.total_amount || 
            order.orderdetails?.reduce((sum: number, od: any) => sum + (od.quantity * od.price), 0) || 0;
          
          acc[year].revenue += orderRevenue;
          acc[year].orders += 1;
          acc[year].customers.add(order.customer_id);
          
          return acc;
        }, {});

        const salesArray = Object.values(yearlyData || {}).map((item: any) => ({
          ...item,
          customers: item.customers.size
        })).sort((a: any, b: any) => b.period.localeCompare(a.period));

        setSalesData(salesArray);
      } else if (dateRange === 'quarterly') {
        // Quarterly data for last 8 quarters
        const { data: sales } = await supabase
          .from('orders')
          .select(`
            order_date,
            total_amount,
            customer_id,
            orderdetails(quantity, price)
          `)
          .gte('order_date', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString());

        const quarterlyData = sales?.reduce((acc: any, order: any) => {
          const date = new Date(order.order_date);
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const quarterKey = `${year}-Q${quarter}`;
          const quarterName = `Q${quarter} ${year}`;
          
          if (!acc[quarterKey]) {
            acc[quarterKey] = { period: quarterName, revenue: 0, orders: 0, customers: new Set() };
          }
          
          const orderRevenue = order.total_amount || 
            order.orderdetails?.reduce((sum: number, od: any) => sum + (od.quantity * od.price), 0) || 0;
          
          acc[quarterKey].revenue += orderRevenue;
          acc[quarterKey].orders += 1;
          acc[quarterKey].customers.add(order.customer_id);
          
          return acc;
        }, {});

        const salesArray = Object.values(quarterlyData || {}).map((item: any) => ({
          ...item,
          customers: item.customers.size
        })).sort((a: any, b: any) => b.period.localeCompare(a.period));

        setSalesData(salesArray);
      } else if (dateRange === 'daily') {
        // Daily data for last 30 days
        const { data: sales } = await supabase
          .from('orders')
          .select(`
            order_date,
            total_amount,
            customer_id,
            orderdetails(quantity, price)
          `)
          .gte('order_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        const dailyData = sales?.reduce((acc: any, order: any) => {
          const date = new Date(order.order_date);
          const dayKey = date.toISOString().split('T')[0];
          const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (!acc[dayKey]) {
            acc[dayKey] = { period: dayName, revenue: 0, orders: 0, customers: new Set() };
          }
          
          const orderRevenue = order.total_amount || 
            order.orderdetails?.reduce((sum: number, od: any) => sum + (od.quantity * od.price), 0) || 0;
          
          acc[dayKey].revenue += orderRevenue;
          acc[dayKey].orders += 1;
          acc[dayKey].customers.add(order.customer_id);
          
          return acc;
        }, {});

        const salesArray = Object.values(dailyData || {}).map((item: any) => ({
          ...item,
          customers: item.customers.size
        })).sort((a: any, b: any) => a.period.localeCompare(b.period));

        setSalesData(salesArray);
      } else {
        // Monthly data for last 12 months
        const { data: sales } = await supabase
          .from('orders')
          .select(`
            order_date,
            total_amount,
            customer_id,
            orderdetails(quantity, price)
          `)
          .gte('order_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        const monthlyData = sales?.reduce((acc: any, order: any) => {
          const date = new Date(order.order_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          
          if (!acc[monthKey]) {
            acc[monthKey] = { period: monthName, revenue: 0, orders: 0, customers: new Set() };
          }
          
          const orderRevenue = order.total_amount || 
            order.orderdetails?.reduce((sum: number, od: any) => sum + (od.quantity * od.price), 0) || 0;
          
          acc[monthKey].revenue += orderRevenue;
          acc[monthKey].orders += 1;
          acc[monthKey].customers.add(order.customer_id);
          
          return acc;
        }, {});

        const salesArray = Object.values(monthlyData || {}).map((item: any) => ({
          ...item,
          customers: item.customers.size
        }));

        setSalesData(salesArray);
      }

      // Fetch category performance
      const { data: categories } = await supabase
        .from('categories')
        .select(`
          name,
          book(
            orderdetails(quantity, price)
          )
        `);

      const categoryStats = categories?.map(cat => {
        const totalQuantity = cat.book?.reduce((sum: number, book: any) => 
          sum + (book.orderdetails?.reduce((bookSum: number, od: any) => bookSum + od.quantity, 0) || 0), 0) || 0;
        const totalRevenue = cat.book?.reduce((sum: number, book: any) => 
          sum + (book.orderdetails?.reduce((bookSum: number, od: any) => bookSum + (od.quantity * od.price), 0) || 0), 0) || 0;
        
        return {
          name: cat.name,
          value: totalQuantity,
          revenue: totalRevenue
        };
      }).filter(cat => cat.revenue > 0) || [];

      setCategoryData(categoryStats);

      // Fetch top books
      const { data: books } = await supabase
        .from('book')
        .select(`
          bk_title,
          authors(name),
          orderdetails(quantity, price, order_id)
        `);

      const bookStats = books?.map(book => {
        const totalSold = book.orderdetails?.reduce((sum: number, od: any) => sum + od.quantity, 0) || 0;
        const totalRevenue = book.orderdetails?.reduce((sum: number, od: any) => sum + (od.quantity * od.price), 0) || 0;
        const uniqueOrders = new Set(book.orderdetails?.map((od: any) => od.order_id) || []).size;
        
        return {
          title: book.bk_title,
          author: book.authors?.name || 'Unknown Author',
          sold: totalSold,
          revenue: totalRevenue,
          orders: uniqueOrders
        };
      })
      .filter(book => book.sold > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) || [];

      setTopBooks(bookStats);

      // Calculate total stats from all orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select(`
          total_amount,
          customer_id,
          orderdetails(quantity, price)
        `);

      const totalRevenue = allOrders?.reduce((sum: number, order: any) => {
        const orderRevenue = order.total_amount || 
          order.orderdetails?.reduce((odSum: number, od: any) => odSum + (od.quantity * od.price), 0) || 0;
        return sum + orderRevenue;
      }, 0) || 0;

      const totalOrders = allOrders?.length || 0;
      const uniqueCustomers = new Set(allOrders?.map(order => order.customer_id) || []).size;

      setTotalStats({
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    const { data: books } = await supabase
      .from('book')
      .select(`
        bk_title,
        stock_quantity,
        price,
        authors(name),
        orderdetails(quantity)
      `);

    const inventoryStats = books?.map(book => {
      const totalSold = book.orderdetails?.reduce((sum: number, od: any) => sum + od.quantity, 0) || 0;
      const turnoverRatio = book.stock_quantity > 0 ? totalSold / book.stock_quantity : 0;
      
      let status = 'Low Turnover';
      if (totalSold === 0) status = 'No Sales';
      else if (book.stock_quantity === 0) status = 'Out of Stock';
      else if (turnoverRatio > 2) status = 'High Turnover';
      else if (turnoverRatio > 1) status = 'Good Turnover';
      
      return {
        title: book.bk_title,
        author: book.authors?.name || 'Unknown Author',
        currentStock: book.stock_quantity,
        totalSold,
        turnoverRatio,
        status,
        price: book.price
      };
    }).sort((a, b) => b.turnoverRatio - a.turnoverRatio) || [];

    setInventoryData(inventoryStats);
  };

  const fetchCustomerData = async () => {
    const { data: customers } = await supabase
      .from('customers')
      .select(`
        name,
        email,
        orders(
          order_date,
          total_amount,
          orderdetails(quantity, price)
        )
      `);

    const customerStats = customers?.map(customer => {
      const orders = customer.orders || [];
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum: number, order: any) => {
        const orderAmount = order.total_amount || 
          order.orderdetails?.reduce((odSum: number, od: any) => odSum + (od.quantity * od.price), 0) || 0;
        return sum + orderAmount;
      }, 0);
      
      const lastOrder = orders.length > 0 ? 
        new Date(Math.max(...orders.map((o: any) => new Date(o.order_date).getTime()))) : null;
      
      return {
        name: customer.name,
        email: customer.email || 'No email',
        totalOrders,
        totalSpent,
        avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        lastOrderDate: lastOrder ? lastOrder.toLocaleDateString() : 'Never'
      };
    })
    .filter(customer => customer.totalOrders > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent) || [];

    setCustomerData(customerStats);
  };

  const exportReport = () => {
    // Dynamic import to avoid bundling issues
    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new();
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Export different sheets based on active report
      if (activeReport === 'overview' || activeReport === 'sales') {
        // Sales Data Sheet
        if (salesData.length > 0) {
          const salesSheet = XLSX.utils.json_to_sheet(
            salesData.map(item => ({
              'Period': item.period,
              'Revenue (UGX)': item.revenue,
              'Orders': item.orders,
              'Customers': item.customers
            }))
          );
          XLSX.utils.book_append_sheet(wb, salesSheet, 'Sales Data');
        }

        // Category Data Sheet
        if (categoryData.length > 0) {
          const categorySheet = XLSX.utils.json_to_sheet(
            categoryData.map(item => ({
              'Category': item.name,
              'Books Sold': item.value,
              'Revenue (UGX)': item.revenue
            }))
          );
          XLSX.utils.book_append_sheet(wb, categorySheet, 'Categories');
        }

        // Top Books Sheet
        if (topBooks.length > 0) {
          const booksSheet = XLSX.utils.json_to_sheet(
            topBooks.map(item => ({
              'Book Title': item.title,
              'Author': item.author,
              'Copies Sold': item.sold,
              'Revenue (UGX)': item.revenue,
              'Orders': item.orders
            }))
          );
          XLSX.utils.book_append_sheet(wb, booksSheet, 'Top Books');
        }

        // Summary Sheet
        const summaryData = [
          ['Metric', 'Value'],
          ['Total Revenue (UGX)', totalStats.totalRevenue],
          ['Total Orders', totalStats.totalOrders],
          ['Total Customers', totalStats.totalCustomers],
          ['Average Order Value (UGX)', totalStats.avgOrderValue],
          ['Report Generated', new Date().toLocaleString()]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      } else if (activeReport === 'inventory') {
        // Inventory Data Sheet
        const inventorySheet = XLSX.utils.json_to_sheet(
          inventoryData.map(item => ({
            'Book Title': item.title,
            'Author': item.author,
            'Current Stock': item.currentStock,
            'Total Sold': item.totalSold,
            'Turnover Ratio': item.turnoverRatio,
            'Status': item.status,
            'Price (UGX)': item.price
          }))
        );
        XLSX.utils.book_append_sheet(wb, inventorySheet, 'Inventory Analysis');

      } else if (activeReport === 'customers') {
        // Customer Data Sheet
        const customerSheet = XLSX.utils.json_to_sheet(
          customerData.map(item => ({
            'Customer Name': item.name,
            'Email': item.email,
            'Total Orders': item.totalOrders,
            'Total Spent (UGX)': item.totalSpent,
            'Average Order Value (UGX)': item.avgOrderValue,
            'Last Order Date': item.lastOrderDate
          }))
        );
        XLSX.utils.book_append_sheet(wb, customerSheet, 'Customer Analysis');

      } else if (activeReport === 'categories') {
        // Category Performance Sheet
        const categorySheet = XLSX.utils.json_to_sheet(
          categoryData.map(item => ({
            'Category': item.name,
            'Books Sold': item.value,
            'Revenue (UGX)': item.revenue
          }))
        );
        XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Performance');
      }

      // Generate filename based on report type
      const reportName = activeReport.charAt(0).toUpperCase() + activeReport.slice(1);
      const filename = `${reportName}_Report_${timestamp}.xlsx`;
      
      // Save the file
      XLSX.writeFile(wb, filename);
    }).catch(error => {
      console.error('Error exporting to Excel:', error);
      // Fallback to JSON export
      const reportData = {
        activeReport,
        dateRange,
        salesData,
        categoryData,
        topBooks,
        inventoryData,
        customerData,
        totalStats,
        generatedAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    });
  };

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Turnover Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Turnover Ratio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventoryData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.totalSold}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.turnoverRatio.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'High Turnover' ? 'bg-green-100 text-green-800' :
                      item.status === 'Good Turnover' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                      item.status === 'No Sales' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    UGX {item.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customerData.map((customer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.totalOrders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    UGX {customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    UGX {customer.avgOrderValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.lastOrderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      <SalesChart 
        data={salesData} 
        title={`Detailed Sales Analysis (${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)})`} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart 
          data={categoryData} 
          title="Revenue by Category" 
        />
        <TopBooksTable 
          data={topBooks} 
          title="Top Performing Books" 
        />
      </div>
    </div>
  );

  const renderCategoryReport = () => (
    <div className="space-y-6">
      <CategoryPieChart 
        data={categoryData} 
        title="Category Performance Analysis" 
      />
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((category, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{category.name}</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">Books Sold: <span className="font-medium">{category.value}</span></p>
                <p className="text-gray-600">Revenue: <span className="font-medium text-green-600">UGX {category.revenue.toLocaleString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">UGX {totalStats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">UGX {totalStats.avgOrderValue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <SalesChart 
        data={salesData} 
        title={`Sales Trend (${dateRange === 'yearly' ? 'Yearly' : 'Monthly'})`} 
      />

      {/* Category Performance and Top Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart 
          data={categoryData} 
          title="Sales by Category" 
        />
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Books</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topBooks.slice(0, 8).map((book, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 truncate">{book.title}</p>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-800">UGX {book.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{book.sold} sold • {book.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Top Books Table */}
      <TopBooksTable 
        data={topBooks} 
        title="Detailed Top Books Performance" 
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Sales Reports & Analytics</h2>
      </div>

      {/* Report Controls */}
      <ReportSelector
        dateRange={dateRange}
        reportType={activeReport}
        onDateRangeChange={setDateRange}
        onReportTypeChange={setActiveReport}
        onRefresh={fetchReportData}
        onExport={exportReport}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !error ? (
        <>
          {activeReport === 'overview' && renderOverview()}
          {activeReport === 'sales' && renderSalesReport()}
          {activeReport === 'inventory' && renderInventoryReport()}
          {activeReport === 'customers' && renderCustomerReport()}
          {activeReport === 'categories' && renderCategoryReport()}
        </>
      ) : null}
    </div>
  );
}
