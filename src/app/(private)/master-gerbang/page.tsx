"use client";

import { useState, useMemo } from 'react';
import MasterDataTemplate from '@/presentation/components/templates/MasterDataTemplate';
import GerbangModal, { GerbangFormData } from '@/presentation/components/organisms/GerbangModal';
import ConfirmModal from '@/presentation/components/organisms/ConfirmModal';
import { useGerbang } from '@/presentation/hooks/useGerbang';
import { FilePenLine, Trash2, Eye } from 'lucide-react';

export interface Gerbang {
  id: number;
  IdCabang: number;
  NamaGerbang: string;
  NamaCabang: string;
}

export default function MasterGerbangPage() {
  const {
    gerbangs,
    loading,
    currentPage,
    totalPages,
    limit,
    totalItems,
    searchTerm,
    createGerbang,
    updateGerbang,
    deleteGerbang,
    handlePageChange,
    handleLimitChange,
    debouncedSearch
  } = useGerbang();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGerbang, setSelectedGerbang] = useState<Gerbang | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [sortColumn, setSortColumn] = useState<keyof Gerbang | string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gerbangToDelete, setGerbangToDelete] = useState<Gerbang | null>(null);


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

    await deleteGerbang(gerbangToDelete.id, gerbangToDelete.IdCabang);
    setShowDeleteModal(false);
    setGerbangToDelete(null);
  };

  const handleSave = async (formData: GerbangFormData) => {
    const isEditing = modalMode === 'edit';

    if (isEditing && selectedGerbang) {
      await updateGerbang(selectedGerbang.id, formData);
    } else {
      await createGerbang(formData);
    }

    setIsModalOpen(false);
  };

  const sortedGerbangs = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return gerbangs;
    }

    return [...gerbangs].sort((a, b) => {
      const aValue = a[sortColumn as keyof Gerbang];
      const bValue = b[sortColumn as keyof Gerbang];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [gerbangs, sortColumn, sortDirection]);

  const handleSort = (column: keyof Gerbang | string, direction: 'asc' | 'desc' | null) => {
    setSortColumn(direction ? column : null);
    setSortDirection(direction);
  };

  const columns = [
    {
      key: 'id' as keyof Gerbang,
      label: 'No',
      width: '16',
      align: 'center' as const,
      render: (_: unknown, row: Gerbang, index: number) => index + 1,
    },
    {
      key: 'NamaGerbang' as keyof Gerbang,
      label: 'Nama Gerbang',
      width: '32',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'NamaCabang' as keyof Gerbang,
      label: 'Nama Cabang',
      width: '32',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'actions' as keyof Gerbang,
      label: 'Aksi',
      width: '20',
      align: 'center' as const,
      render: (_: unknown, row: Gerbang) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Lihat"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Edit"
          >
            <FilePenLine size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <MasterDataTemplate
        data={sortedGerbangs}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada data gerbang"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleLimitChange}
        searchValue={searchTerm}
        onSearchChange={debouncedSearch}
        searchPlaceholder="Cari gerbang..."
        onAdd={handleAdd}
        addButtonText="Tambah Gerbang"
        showAddButton={true}
        onSort={handleSort}
        title="Master Data Gerbang"
      />

      {isModalOpen && (
        <GerbangModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} gerbangData={selectedGerbang} mode={modalMode} />
      )}

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
    </>
  );
}