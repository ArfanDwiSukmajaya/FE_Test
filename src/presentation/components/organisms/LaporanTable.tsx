"use client";

import { useMemo } from 'react';
import BaseTable from '../molecules/BaseTable';

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
    const ruasTotals: { [ruas: string]: TotalValues } = {};
    let grandTotal: TotalValues = { gol1: 0, gol2: 0, gol3: 0, gol4: 0, gol5: 0, total: 0 };

    sortedData.forEach((item) => {
      result.push({ type: 'data', ...item });

      const get = (gol: number) => item.Gol[gol]?.[activeTab] ?? 0;
      const itemTotals = { gol1: get(1), gol2: get(2), gol3: get(3), gol4: get(4), gol5: get(5) };
      const itemTotal = Object.values(itemTotals).reduce((a, b) => a + b, 0);

      if (!ruasTotals[item.Ruas]) {
        ruasTotals[item.Ruas] = { gol1: 0, gol2: 0, gol3: 0, gol4: 0, gol5: 0, total: 0 };
      }
      ruasTotals[item.Ruas] = {
        gol1: ruasTotals[item.Ruas].gol1 + itemTotals.gol1,
        gol2: ruasTotals[item.Ruas].gol2 + itemTotals.gol2,
        gol3: ruasTotals[item.Ruas].gol3 + itemTotals.gol3,
        gol4: ruasTotals[item.Ruas].gol4 + itemTotals.gol4,
        gol5: ruasTotals[item.Ruas].gol5 + itemTotals.gol5,
        total: ruasTotals[item.Ruas].total + itemTotal
      };

      grandTotal = {
        gol1: grandTotal.gol1 + itemTotals.gol1,
        gol2: grandTotal.gol2 + itemTotals.gol2,
        gol3: grandTotal.gol3 + itemTotals.gol3,
        gol4: grandTotal.gol4 + itemTotals.gol4,
        gol5: grandTotal.gol5 + itemTotals.gol5,
        total: grandTotal.total + itemTotal
      };
    });

    Object.entries(ruasTotals).forEach(([ruas, totals]) => {
      result.push({ type: 'subtotal', ruas, totals });
    });

    result.push({ type: 'grandtotal', totals: grandTotal });
    return result;
  }, [data, activeTab]);


  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex flex-wrap">
          {paymentTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 font-semibold text-sm ${activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tabDisplayNames[tab]}
            </button>
          ))}
        </div>

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

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <BaseTable
          columns={[
            { key: 'no', label: 'No', align: 'left' },
            { key: 'ruas', label: 'Ruas', align: 'left' },
            { key: 'gerbang', label: 'Gerbang', align: 'left' },
            { key: 'gardu', label: 'Gardu', align: 'left' },
            { key: 'hari', label: 'Hari', align: 'left' },
            { key: 'tanggal', label: 'Tanggal', align: 'left' },
            { key: 'metode', label: 'Metode Pembayaran', align: 'left' },
            { key: 'gol1', label: 'Gol I', align: 'center' },
            { key: 'gol2', label: 'Gol II', align: 'center' },
            { key: 'gol3', label: 'Gol III', align: 'center' },
            { key: 'gol4', label: 'Gol IV', align: 'center' },
            { key: 'gol5', label: 'Gol V', align: 'center' },
            { key: 'total', label: 'Total Lalin', align: 'center' }
          ]}
          data={dataWithTotals.map((row, index) => {
            if (row.type === 'data') {
              const totalLalin = [1, 2, 3, 4, 5].reduce((sum, gol) => sum + ((row.Gol[gol]?.[activeTab] as number) ?? 0), 0);
              return {
                no: index + 1,
                ruas: row.Ruas,
                gerbang: row.Gerbang,
                gardu: row.Gardu,
                hari: row.Hari,
                tanggal: row.Tanggal,
                metode: methodDisplayNames[activeTab],
                gol1: row.Gol[1]?.[activeTab] ?? 0,
                gol2: row.Gol[2]?.[activeTab] ?? 0,
                gol3: row.Gol[3]?.[activeTab] ?? 0,
                gol4: row.Gol[4]?.[activeTab] ?? 0,
                gol5: row.Gol[5]?.[activeTab] ?? 0,
                total: totalLalin
              };
            }
            if (row.type === 'subtotal' || row.type === 'grandtotal') {
              return {
                no: row.type === 'subtotal' ? `Total Lalin ${row.ruas}` : 'Total Lalin Keseluruhan',
                ruas: '',
                gerbang: '',
                gardu: '',
                hari: '',
                tanggal: '',
                metode: '',
                gol1: row.totals.gol1,
                gol2: row.totals.gol2,
                gol3: row.totals.gol3,
                gol4: row.totals.gol4,
                gol5: row.totals.gol5,
                total: row.totals.total
              };
            }
            return {};
          })}
          renderRow={(row, index) => {
            const originalRow = dataWithTotals[index];

            if (originalRow.type === 'data') {
              const totalLalin = [1, 2, 3, 4, 5].reduce((sum, gol) => sum + ((originalRow.Gol[gol]?.[activeTab] as number) ?? 0), 0);
              return (
                <tr key={`data-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{originalRow.Ruas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{originalRow.Gerbang}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{originalRow.Gardu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{originalRow.Hari}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{originalRow.Tanggal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{methodDisplayNames[activeTab]}</td>
                  {[1, 2, 3, 4, 5].map(gol => <td key={gol} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{originalRow.Gol[gol]?.[activeTab] ?? 0}</td>)}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{totalLalin}</td>
                </tr>
              );
            }

            if (originalRow.type === 'subtotal' || originalRow.type === 'grandtotal') {
              return (
                <tr key={originalRow.type === 'subtotal' ? `sub-${originalRow.ruas}` : 'grandtotal'} className={originalRow.type === 'grandtotal' ? "bg-gray-700 text-white font-bold" : "bg-gray-200 font-bold"}>
                  <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-center">{originalRow.type === 'subtotal' ? `Total Lalin ${originalRow.ruas}` : 'Total Lalin Keseluruhan'}</td>
                  {Object.values(originalRow.totals).map((val, i) => <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-center">{val}</td>)}
                </tr>
              );
            }

            return null;
          }}
        />
      </div>
    </div>
  );
}