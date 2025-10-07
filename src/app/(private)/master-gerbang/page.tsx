// app/(private)/master-gerbang/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import GerbangModal, { GerbangFormData } from '@/components/GerbangModal';
import ConfirmModal from '@/components/ConfirmModal';
import { FilePenLine, Trash2, Eye } from 'lucide-react';

export interface Gerbang {
  id: number;
  IdCabang: number;
  NamaGerbang: string;
  NamaCabang: string;
}

export default function MasterGerbangPage() {
  const [gerbangs, setGerbangs] = useState<Gerbang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGerbang, setSelectedGerbang] = useState<Gerbang | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gerbangToDelete, setGerbangToDelete] = useState<Gerbang | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(5);

  const fetchGerbangs = async (page: number = currentPage, pageLimit: number = limit) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/gerbangs?page=${page}&limit=${pageLimit}`);
      const data = await response.json();
      if (data.status) {
        setGerbangs(data.data.rows.rows);
        setTotalPages(data.data.total_pages);
        setCurrentPage(data.data.current_page);
      } else {
        toast.error('Gagal mengambil data gerbang.');
      }
    } catch {
      toast.error('Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGerbangs(currentPage, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedGerbang(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gerbang: Gerbang) => {
    setModalMode('edit');
    setSelectedGerbang(gerbang);
    setIsModalOpen(true);
  };

  const handleView = (gerbang: Gerbang) => {
    setModalMode('view');
    setSelectedGerbang(gerbang);
    setIsModalOpen(true);
  };

  const handleDelete = (gerbang: Gerbang) => {
    setGerbangToDelete(gerbang);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!gerbangToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/api/gerbangs/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: gerbangToDelete.id, IdCabang: gerbangToDelete.IdCabang }),
      });
      if (!response.ok) throw new Error('Gagal menghapus data.');
      toast.success('Data berhasil dihapus!');

      // Jika setelah delete, halaman saat ini tidak punya data, kembali ke halaman sebelumnya
      if (filteredGerbangs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchGerbangs(currentPage, limit);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleSave = async (formData: GerbangFormData) => {
    const isEditing = modalMode === 'edit';
    const url = `http://localhost:8080/api/gerbangs/`;
    const method = isEditing ? 'PUT' : 'POST';

    const body = {
      id: isEditing ? selectedGerbang!.id : Number(formData.id),
      IdCabang: Number(formData.IdCabang),
      NamaGerbang: formData.NamaGerbang,
      NamaCabang: formData.NamaCabang,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proses gagal.');
      }
      toast.success(`Data berhasil ${isEditing ? 'diperbarui' : 'disimpan'}!`);
      setIsModalOpen(false);
      fetchGerbangs(currentPage, limit);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const filteredGerbangs = useMemo(() => {
    if (!searchTerm) return gerbangs;
    return gerbangs.filter(g =>
      g.NamaGerbang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.NamaCabang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [gerbangs, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset ke halaman 1 saat limit berubah
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Jika total pages <= 7, tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Selalu tampilkan halaman 1
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Tampilkan halaman di sekitar current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Selalu tampilkan halaman terakhir
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Master Data Gerbang</h1>
      <div className="flex justify-between items-center mb-4">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded-md w-1/3" />
        <button onClick={handleAdd} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2">
          <span className="font-bold text-lg">+</span> Tambah
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">No.</th>
              <th className="p-3 text-left">Ruas</th>
              <th className="p-3 text-left">Gerbang</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredGerbangs.map((gerbang, index) => (
              <tr key={`${gerbang.IdCabang}-${gerbang.id}`} className="border-t hover:bg-gray-50">
                <td className="p-3">{(currentPage - 1) * limit + index + 1}</td>
                <td className="p-3">{gerbang.NamaCabang}</td>
                <td className="p-3">{gerbang.NamaGerbang}</td>
                <td className="p-3 flex items-center space-x-4">
                  <button onClick={() => handleView(gerbang)} className="text-gray-500 hover:text-gray-700" title="Lihat Detail"><Eye size={18} /></button>
                  <button onClick={() => handleEdit(gerbang)} className="text-blue-500 hover:text-blue-700" title="Edit"><FilePenLine size={18} /></button>
                  <button onClick={() => handleDelete(gerbang)} className="text-red-500 hover:text-red-700" title="Hapus"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-end items-center gap-3 p-4 border-t">
          {/* Limit Selector */}
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>Show : 5 entries</option>
              <option value={10}>Show : 10 entries</option>
              <option value={20}>Show : 20 entries</option>
              <option value={50}>Show : 50 entries</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-3 py-2">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum as number)}
                className={`px-3 py-2 rounded min-w-[40px] ${currentPage === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {pageNum}
              </button>
            )
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded ${currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            &gt;
          </button>
        </div>
      </div>

      {isModalOpen && (
        <GerbangModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} gerbangData={selectedGerbang} mode={modalMode} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus gerbang "${gerbangToDelete?.NamaGerbang}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
    </div>
  );
}