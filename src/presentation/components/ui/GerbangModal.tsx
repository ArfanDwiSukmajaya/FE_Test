// components/GerbangModal.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Gerbang } from '@/app/(private)/master-gerbang/page';

export interface GerbangFormData {
  id: string;
  IdCabang: number | string;
  NamaGerbang: string;
  NamaCabang: string;
}

interface GerbangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: GerbangFormData) => void;
  gerbangData: Gerbang | null;
  mode: 'add' | 'edit' | 'view';
}

export default function GerbangModal({ isOpen, onClose, onSave, gerbangData, mode }: GerbangModalProps) {
  const [formData, setFormData] = useState<GerbangFormData>({ id: '', IdCabang: '', NamaGerbang: '', NamaCabang: '' });

  useEffect(() => {
    if (gerbangData) {
      setFormData({
        id: String(gerbangData.id),
        IdCabang: String(gerbangData.IdCabang),
        NamaGerbang: gerbangData.NamaGerbang,
        NamaCabang: gerbangData.NamaCabang,
      });
    } else {
      setFormData({ id: '', IdCabang: '', NamaGerbang: '', NamaCabang: '' });
    }
  }, [gerbangData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'IdCabang' ? Number(value) : value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const modalTitle = { add: 'Tambah Gerbang Baru', edit: 'Edit Gerbang', view: 'Detail Gerbang' };
  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{modalTitle[mode]}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ID Gerbang</label>
            <input type="number" name="id" value={formData.id} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md bg-gray-100" required readOnly={mode !== 'add'} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ID Cabang (Ruas)</label>
            <input type="number" name="IdCabang" value={formData.IdCabang} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md ${isViewMode ? 'bg-gray-100' : ''}`} required readOnly={isViewMode} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nama Ruas</label>
            <input type="text" name="NamaCabang" value={formData.NamaCabang} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md ${isViewMode ? 'bg-gray-100' : ''}`} required readOnly={isViewMode} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nama Gerbang</label>
            <input type="text" name="NamaGerbang" value={formData.NamaGerbang} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md ${isViewMode ? 'bg-gray-100' : ''}`} required readOnly={isViewMode} />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">
              {isViewMode ? 'Tutup' : 'Batal'}
            </button>
            {!isViewMode && <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Simpan</button>}
          </div>
        </form>
      </div>
    </div>
  );
}