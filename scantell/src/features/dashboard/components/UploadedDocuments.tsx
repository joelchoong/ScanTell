"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Calendar, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { colors, typography } from "@/lib/design-system";

interface Document {
  id: string;
  name: string;
  date: string;
}

export function UploadedDocuments() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const documents: Document[] = [
    {
      id: "1",
      name: "Contract_Agreement.pdf",
      date: "May 30, 2026",
    },
    {
      id: "2",
      name: "Invoice_2024.pdf",
      date: "May 29, 2026",
    },
  ];

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleView = (doc: Document) => {
    console.log("View document:", doc.name);
    setOpenMenuId(null);
  };

  const handleRename = (doc: Document) => {
    console.log("Rename document:", doc.name);
    setOpenMenuId(null);
  };

  const handleDelete = (doc: Document) => {
    console.log("Delete document:", doc.name);
    setOpenMenuId(null);
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
            <div key={doc.id} className="softui-card p-4 flex items-center gap-4">
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

              <div className="relative" ref={(el) => { menuRefs.current[doc.id] = el; }}>
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
    </div>
  );
}
