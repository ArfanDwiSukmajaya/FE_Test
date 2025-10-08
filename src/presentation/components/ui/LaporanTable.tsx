// components/LaporanTable.tsx
"use client";

import { useMemo } from 'react';

export interface ProcessedDataRow {
  Ruas: string;
  Gerbang: string;
  Gardu: number;
  Tanggal: string;
  Hari: string;
  Gol: {
    [key: number]: {
      Tunai: number;
      KTP: number;
      Flo: number;
      EToll: number;
      Keseluruhan: number;
      ETF: number;
    };
  };
}

interface LaporanTableProps {
  data: ProcessedDataRow[];
  searchInput: string;
  setSearchInput: (value: string) => void;
  tanggal: string;
  setTanggal: (value: string) => void;
  onFilter: () => void;
  onReset: () => void;
  activeTab: PaymentMethod;
  setActiveTab: (tab: PaymentMethod) => void;
  onExportPDF: () => void;
}

type TotalValues = { gol1: number; gol2: number; gol3: number; gol4: number; gol5: number; total: number };
type DataRow = ProcessedDataRow & { type: 'data' };
type SubtotalRow = { type: 'subtotal'; ruas: string; totals: TotalValues };
type GrandTotalRow = { type: 'grandtotal'; totals: TotalValues };
type RenderableRow = DataRow | SubtotalRow | GrandTotalRow;

type PaymentMethod = keyof ProcessedDataRow['Gol'][number];

export default function LaporanTable({
  data,
  searchInput,
  setSearchInput,
  tanggal,
  setTanggal,
  onFilter,
  onReset,
  activeTab,
  setActiveTab,
  onExportPDF
}: LaporanTableProps) {
  const paymentTabs: PaymentMethod[] = ['Tunai', 'EToll', 'Flo', 'KTP', 'Keseluruhan', 'ETF'];
  const tabDisplayNames: Record<PaymentMethod, string> = { Tunai: 'Total Tunai', EToll: 'Total E-Toll', Flo: 'Total Flo', KTP: 'Total KTP', Keseluruhan: 'Total Keseluruhan', ETF: 'Total E-Toll+Tunai+Flo' };
  const methodDisplayNames: Record<PaymentMethod, string> = { Tunai: 'Tunai', EToll: 'E-Toll', Flo: 'Flo', KTP: 'KTP', Keseluruhan: 'Keseluruhan', ETF: 'E-Toll+Tunai+Flo' };

  const dataWithTotals: RenderableRow[] = useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.Ruas.localeCompare(b.Ruas));
    if (sortedData.length === 0) return [];

    const result: RenderableRow[] = [];
    let subtotal: TotalValues = { gol1: 0, gol2: 0, gol3: 0, gol4: 0, gol5: 0, total: 0 };
    let grandTotal: TotalValues = { gol1: 0, gol2: 0, gol3: 0, gol4: 0, gol5: 0, total: 0 };
    let currentRuas = sortedData[0].Ruas;

    sortedData.forEach((item, index) => {
      if (item.Ruas !== currentRuas) {
        result.push({ type: 'subtotal', ruas: currentRuas, totals: subtotal });
        currentRuas = item.Ruas;
        subtotal = { gol1: 0, gol2: 0, gol3: 0, gol4: 0, gol5: 0, total: 0 };
      }
      result.push({ type: 'data', ...item });
      const get = (gol: number) => item.Gol[gol]?.[activeTab] ?? 0;
      const itemTotals = { gol1: get(1), gol2: get(2), gol3: get(3), gol4: get(4), gol5: get(5) };
      const itemTotal = Object.values(itemTotals).reduce((a, b) => a + b, 0);
      subtotal = { gol1: subtotal.gol1 + itemTotals.gol1, gol2: subtotal.gol2 + itemTotals.gol2, gol3: subtotal.gol3 + itemTotals.gol3, gol4: subtotal.gol4 + itemTotals.gol4, gol5: subtotal.gol5 + itemTotals.gol5, total: subtotal.total + itemTotal };
      grandTotal = { gol1: grandTotal.gol1 + itemTotals.gol1, gol2: grandTotal.gol2 + itemTotals.gol2, gol3: grandTotal.gol3 + itemTotals.gol3, gol4: grandTotal.gol4 + itemTotals.gol4, gol5: grandTotal.gol5 + itemTotals.gol5, total: grandTotal.total + itemTotal };
      if (index === sortedData.length - 1) {
        result.push({ type: 'subtotal', ruas: currentRuas, totals: subtotal });
      }
    });
    result.push({ type: 'grandtotal', totals: grandTotal });
    return result;
  }, [data, activeTab]);

  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input type="text" placeholder="Cari..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="p-2 border rounded-md col-span-2" />
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="p-2 border rounded-md" />
        <button onClick={onFilter} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">Filter</button>
        <button onClick={onReset} className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700">Reset</button>
      </div>

      <div className="flex flex-wrap items-center justify-between border-b mb-4">
        <div className="flex flex-wrap">
          {paymentTabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 px-4 font-semibold text-sm ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>{tabDisplayNames[tab]}</button>)}
        </div>

        {/* Export Button */}
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-gray-100">
            <tr>{['No', 'Ruas', 'Gerbang', 'Gardu', 'Hari', 'Tanggal', 'Metode Pembayaran', 'Gol I', 'Gol II', 'Gol III', 'Gol IV', 'Gol V', 'Total Lalin'].map(h => <th key={h} className="py-2 px-3 border-b text-left">{h}</th>)}</tr>
          </thead>
          <tbody>
            {dataWithTotals.map((row, index) => {
              if (row.type === 'data') {
                const totalLalin = [1, 2, 3, 4, 5].reduce((sum, gol) => sum + ((row.Gol[gol]?.[activeTab] as number) ?? 0), 0);
                return (
                  <tr key={`data-${index}`} className="hover:bg-gray-50">
                    <td className="py-2 px-3 border-b">{index + 1}</td>
                    <td className="py-2 px-3 border-b">{row.Ruas}</td>
                    <td className="py-2 px-3 border-b">{row.Gerbang}</td>
                    <td className="py-2 px-3 border-b">{row.Gardu}</td>
                    <td className="py-2 px-3 border-b">{row.Hari}</td>
                    <td className="py-2 px-3 border-b">{row.Tanggal}</td>
                    <td className="py-2 px-3 border-b">{methodDisplayNames[activeTab]}</td>
                    {[1, 2, 3, 4, 5].map(gol => <td key={gol} className="py-2 px-3 border-b text-right">{row.Gol[gol]?.[activeTab] ?? 0}</td>)}
                    <td className="py-2 px-3 border-b text-right font-bold">{totalLalin}</td>
                  </tr>
                );
              }
              if (row.type === 'subtotal' || row.type === 'grandtotal') {
                return (
                  <tr key={row.type === 'subtotal' ? `sub-${row.ruas}` : 'grandtotal'} className={row.type === 'grandtotal' ? "bg-gray-700 text-white font-bold" : "bg-gray-200 font-bold"}>
                    <td colSpan={7} className="py-2 px-3 border-b text-center">{row.type === 'subtotal' ? `Total Lalin ${row.ruas}` : 'Total Lalin Keseluruhan'}</td>
                    {Object.values(row.totals).map((val, i) => <td key={i} className="py-2 px-3 border-b text-right">{val}</td>)}
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}