"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Calendar, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { colors, typography } from "@/lib/design-system";
import { useRouter } from "next/navigation";
import { documentsService, Document } from "@/lib/services/documentsService";

export function UploadedDocuments() {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [newName, setNewName] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load documents from service
  useEffect(() => {
    documentsService.getAll().then(docs => {
      setDocuments(docs);
      setLoading(false);
    });
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleView = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    }
    setOpenMenuId(null);
  };

  const handleSaveRename = async () => {
    if (selectedDoc && newName.trim()) {
      // Update document name via service
      await documentsService.update(selectedDoc.id, { name: newName.trim() });
      // Reload documents
      const updatedDocs = await documentsService.getAll();
      setDocuments(updatedDocs);
    }
    setShowRenameModal(false);
    setSelectedDoc(null);
    setNewName('');
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
    setSelectedDoc(null);
    setNewName('');
  };

  const handleRename = (doc: Document) => {
    setSelectedDoc(doc);
    setNewName(doc.name);
    setShowRenameModal(true);
    setOpenMenuId(null);
  };

  const handleDelete = (doc: Document) => {
    setSelectedDoc(doc);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedDoc) {
      // Delete document via service
      await documentsService.delete(selectedDoc.id);
      // Reload documents
      const updatedDocs = await documentsService.getAll();
      setDocuments(updatedDocs);
    }
    setShowDeleteModal(false);
    setSelectedDoc(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedDoc(null);
  };

  const handleDocumentClick = (doc: Document) => {
    // Open the menu when clicking on the document card
    toggleMenu(doc.id);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="space-y-4">
      <h2 className={`${typography.sectionHeader} text-gray-900`}>Recent Scans</h2>

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="softui-card p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={`${typography.bodySecondary} text-gray-500`}>No scans yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="softui-card p-4 flex items-center gap-4 cursor-pointer hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow" onClick={() => handleDocumentClick(doc)}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary.base}33` }}>
                <FileText className="w-5 h-5" style={{ color: colors.primary.base }} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`${typography.bodyPrimary} text-gray-900 truncate`}>
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <p className={`${typography.caption} text-gray-500`}>{doc.date}</p>
                </div>
              </div>

              <div className="relative" ref={(el) => { menuRefs.current[doc.id] = el; }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleMenu(doc.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                {openMenuId === doc.id && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-40">
                    <button
                      onClick={() => handleView(doc)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">View</span>
                    </button>
                    <button
                      onClick={() => handleRename(doc)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Rename</span>
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rename Modal */}
      {showRenameModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rename document</h3>
            <p className="text-sm text-gray-600 mb-4">Enter a new name for your document.</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter document name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelRename}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="flex-1 px-4 py-3 rounded-lg text-black font-medium transition-colors"
                style={{
                  background: colors.primary.gradient,
                  boxShadow: colors.shadows.gold,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedDoc.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 rounded-lg text-white font-medium transition-colors bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
