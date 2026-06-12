"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Calendar, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { colors, typography } from "@/lib/design-system";

interface Document {
  id: string;
  name: string;
  fileSize: number;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadedDocuments() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [newName, setNewName] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) return;
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      // silently fail — empty state will show
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDocuments();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDocuments]);

  // Refresh list when a new document is uploaded
  useEffect(() => {
    const handler = () => fetchDocuments();
    window.addEventListener("document-uploaded", handler);
    return () => window.removeEventListener("document-uploaded", handler);
  }, [fetchDocuments]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openMenuId && !menuRefs.current[openMenuId]?.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const handleRename = (doc: Document) => {
    setSelectedDoc(doc);
    setNewName(doc.name);
    setShowRenameModal(true);
    setOpenMenuId(null);
  };

  const handleSaveRename = async () => {
    if (!selectedDoc || !newName.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) await fetchDocuments();
    } finally {
      setActionLoading(false);
      setShowRenameModal(false);
      setSelectedDoc(null);
      setNewName("");
    }
  };

  const handleDelete = (doc: Document) => {
    setSelectedDoc(doc);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchDocuments();
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setSelectedDoc(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className={`${typography.sectionHeader} text-gray-900`}>Recent Scans</h2>

      <div className="space-y-3">
        {loading ? (
          <div className="softui-card p-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="softui-card p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={`${typography.bodySecondary} text-gray-500`}>No scans yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="softui-card p-4 flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.primary.base}33` }}
              >
                <FileText className="w-5 h-5" style={{ color: colors.primary.base }} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`${typography.bodyPrimary} text-gray-900 truncate`}>
                  {doc.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <p className={`${typography.caption} text-gray-500`}>
                    {formatDate(doc.createdAt)} · {formatSize(doc.fileSize)}
                  </p>
                </div>
              </div>

              <div
                className="relative"
                ref={(el) => { menuRefs.current[doc.id] = el; }}
              >
                <button
                  onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {openMenuId === doc.id && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 w-40">
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
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              placeholder="Enter document name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRenameModal(false); setSelectedDoc(null); }}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-lg text-black font-medium transition-colors disabled:opacity-50"
                style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
              >
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{selectedDoc.name}</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedDoc(null); }}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
