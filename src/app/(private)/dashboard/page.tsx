"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bar, Doughnut } from 'react-chartjs-2';
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

interface LalinRecord {
  Shift: number;
  IdGerbang: number;
  IdCabang: number;
  Tunai: number;
  eBca: number;
  eBri: number;
  eBni: number;
  eDKI: number;
  eMandiri: number;
  eMega: number;
  eFlo: number;
  DinasOpr: number;
  DinasMitra: number;
  DinasKary: number;
}

interface GerbangRecord {
  id: number;
  NamaGerbang: string;
  IdCabang: number;
  NamaCabang: string;
}

interface DashboardData {
  byPaymentMethod: { [key: string]: number };
  byShift: { [key: string]: number };
  byGerbang: { [key: string]: number };
  byRuas: { [key: string]: number };
}

function processApiData(lalinList: LalinRecord[], gerbangList: GerbangRecord[]): DashboardData {
  const gerbangMap = new Map(gerbangList.map(g => [g.id, g.NamaGerbang]));
  const ruasMap = new Map(gerbangList.map(g => [g.IdCabang, g.NamaCabang]));

  const result: DashboardData = {
    byPaymentMethod: { 'BCA': 0, 'BRI': 0, 'BNI': 0, 'DKI': 0, 'Mandiri': 0, 'Mega': 0, 'Flo': 0 },
    byShift: {},
    byGerbang: {},
    byRuas: {},
  };

  for (const record of lalinList) {
    const totalLalinPerRecord = record.Tunai + record.eBca + record.eBri + record.eBni + record.eDKI + record.eMandiri + record.eMega + record.eFlo + record.DinasOpr + record.DinasMitra + record.DinasKary;

    // Agregasi per Metode Pembayaran
    result.byPaymentMethod['BCA'] += record.eBca;
    result.byPaymentMethod['BRI'] += record.eBri;
    result.byPaymentMethod['BNI'] += record.eBni;
    result.byPaymentMethod['DKI'] += record.eDKI;
    result.byPaymentMethod['Mandiri'] += record.eMandiri;
    result.byPaymentMethod['Mega'] += record.eMega;
    result.byPaymentMethod['Flo'] += record.eFlo;

    // Agregasi per Shift
    result.byShift[record.Shift] = (result.byShift[record.Shift] || 0) + totalLalinPerRecord;

    // Agregasi per Gerbang
    const namaGerbang = gerbangMap.get(record.IdGerbang) || `Gerbang ${record.IdGerbang}`;
    result.byGerbang[namaGerbang] = (result.byGerbang[namaGerbang] || 0) + totalLalinPerRecord;

    // Agregasi per Ruas (IdCabang)
    const namaRuas = ruasMap.get(record.IdCabang) || `Ruas ${record.IdCabang}`;
    result.byRuas[namaRuas] = (result.byRuas[namaRuas] || 0) + totalLalinPerRecord;
  }

  return result;
}


export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState('2023-11-01');

  const fetchData = async (filterDate: string) => {
    console.log('fetchData dipanggil dengan tanggal:', filterDate);
    setLoading(true);
    setData(null);
    try {
      const lalinRes = await fetch(`http://localhost:8080/api/lalins?tanggal=${filterDate}&limit=2000`); // Ambil data secukupnya untuk 1 hari
      const gerbangRes = await fetch(`http://localhost:8080/api/gerbangs`);

      if (!lalinRes.ok || !gerbangRes.ok) throw new Error("Gagal mengambil data");

      const lalinApiData = await lalinRes.json();
      const gerbangApiData = await gerbangRes.json();

      // DEBUG: Cek struktur data dan jumlah records
      console.log('=== DEBUG DASHBOARD ===');
      console.log('Full API Response:', lalinApiData);
      console.log('Jumlah record lalin:', lalinApiData.data.rows.rows.length);
      console.log('Sample 3 record pertama:', lalinApiData.data.rows.rows.slice(0, 3));

      // Cek apakah ada data duplikat berdasarkan ID atau kombinasi unik
      const records = lalinApiData.data.rows.rows;
      console.log('Total records yang akan diproses:', records.length);

      // Hitung manual untuk verifikasi
      let manualBCA = 0;
      let manualMandiri = 0;
      records.forEach((record: LalinRecord) => {
        manualBCA += record.eBca;
        manualMandiri += record.eMandiri;
      });
      console.log('Manual calculation BCA:', manualBCA);
      console.log('Manual calculation Mandiri:', manualMandiri);

      const processedData = processApiData(lalinApiData.data.rows.rows, gerbangApiData.data.rows.rows);
      console.log('Processed data:', processedData);
      console.log('=== END DEBUG ===');

      setData(processedData);

    } catch (error) {
      toast.error("Gagal memuat data dashboard.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered untuk tanggal:', tanggal);
    fetchData(tanggal);
  }, [tanggal]);

  const handleFilter = () => {
    fetchData(tanggal);
  };

  if (loading || !data) {
    return <div>Memuat data dashboard...</div>;
  }

  // Konfigurasi untuk chart
  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      datalabels: { display: false } // Nonaktifkan datalabels untuk bar chart
    },
    // Pastikan tidak ada animation yang menyimpan state
    animation: {
      duration: 0
    }
  };

  const paymentChartData = {
    labels: Object.keys(data.byPaymentMethod),
    datasets: [{ label: 'Jumlah Lalin', data: Object.values(data.byPaymentMethod), backgroundColor: 'rgba(54, 162, 235, 0.6)' }],
  };

  console.log('Payment Chart Data:', paymentChartData);
  console.log('Payment Method Values:', Object.values(data.byPaymentMethod));

  const gerbangChartData = {
    labels: Object.keys(data.byGerbang),
    datasets: [{ label: 'Jumlah Lalin', data: Object.values(data.byGerbang), backgroundColor: 'rgba(75, 192, 192, 0.6)' }],
  };

  console.log('Gerbang Chart Data:', gerbangChartData);

  const shiftChartData = {
    labels: Object.keys(data.byShift).map(s => `Shift ${s}`),
    datasets: [{ data: Object.values(data.byShift), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
  };

  console.log('Shift Chart Data:', shiftChartData);

  const ruasChartData = {
    labels: Object.keys(data.byRuas),
    datasets: [{ data: Object.values(data.byRuas), backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'] }],
  };

  console.log('Ruas Chart Data:', ruasChartData);

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
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="p-2 border rounded-md" />
        <button onClick={handleFilter} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Filter
        </button>
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