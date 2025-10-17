import { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';

interface ReportSelectorProps {
  onDateRangeChange: (range: string) => void;
  onReportTypeChange: (type: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
  dateRange: string;
  reportType: string;
}

export default function ReportSelector({
  onDateRangeChange,
  onReportTypeChange,
  onRefresh,
  onExport,
  loading,
  dateRange,
  reportType
}: ReportSelectorProps) {
  const dateRanges = [
    { value: 'daily', label: 'Last 30 Days' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Overview' },
    { value: 'sales', label: 'Sales Analysis' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'customers', label: 'Customer Analysis' },
    { value: 'categories', label: 'Category Performance' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={reportType}
            onChange={(e) => onReportTypeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button
            onClick={onExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50"
            title="Export to Excel"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}