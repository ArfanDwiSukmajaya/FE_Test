"use client";

import { Bar, Doughnut } from 'react-chartjs-2';
import { useDashboard } from '@/presentation/hooks/useDashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { Context as DataLabelsContext } from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

export default function DashboardPage() {

  const {
    data,
    loading,
    tanggal,
    handleDateChange
  } = useDashboard();

  if (loading || !data) {
    return <div>Memuat data dashboard...</div>;
  }


  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false }
    },

    animation: {
      duration: 0
    }
  };

  const paymentChartData = {
    labels: Object.keys(data.byPaymentMethod),
    datasets: [{ label: 'Jumlah Lalin', data: Object.values(data.byPaymentMethod), backgroundColor: 'rgba(54, 162, 235, 0.6)' }],
  };

  const gerbangChartData = {
    labels: Object.keys(data.byGerbang),
    datasets: [{ label: 'Jumlah Lalin', data: Object.values(data.byGerbang), backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
  };

  const shiftChartData = {
    labels: Object.keys(data.byShift).map(s => `Shift ${s}`),
    datasets: [{ data: Object.values(data.byShift), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
  };

  const ruasChartData = {
    labels: Object.keys(data.byRuas),
    datasets: [{ data: Object.values(data.byRuas), backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'] }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 14 },
        formatter: (value: unknown, context: DataLabelsContext) => {
          const dataset = context.chart.data.datasets[0] as { data: number[] };
          const total = dataset.data.reduce((acc: number, n: number) => acc + n, 0);
          const numeric = typeof value === 'number' ? value : Number(value ?? 0);
          const percentage = total > 0 ? (numeric / total) * 100 : 0;
          return percentage > 3 ? `${percentage.toFixed(0)}%` : '';
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="flex items-center space-x-2 mb-6">
        <input type="date" value={tanggal} onChange={(e) => handleDateChange(e.target.value)} className="p-2 border rounded-md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-center">Lalin per Metode Pembayaran</h2>
          <Bar key={`payment-${tanggal}`} options={commonBarOptions} data={paymentChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-center">Proporsi Lalin per Shift</h2>
          <div className="w-64 h-64">
            <Doughnut key={`shift-${tanggal}`} data={shiftChartData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-center">Lalin per Gerbang</h2>
          <Bar key={`gerbang-${tanggal}`} options={commonBarOptions} data={gerbangChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-center">Proporsi Lalin per Ruas</h2>
          <div className="w-64 h-64">
            <Doughnut key={`ruas-${tanggal}`} data={ruasChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}