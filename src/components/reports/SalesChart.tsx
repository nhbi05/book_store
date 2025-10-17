import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  data: Array<{
    period: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  title: string;
}

export default function SalesChart({ data, title }: SalesChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? `UGX ${Number(value).toLocaleString()}` : value,
              name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Customers'
            ]} 
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
          <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
          <Bar yAxisId="right" dataKey="customers" fill="#ffc658" name="Customers" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}