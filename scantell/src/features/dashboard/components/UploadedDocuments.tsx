import { FileText, Calendar, MoreVertical } from "lucide-react";
import { colors, typography } from "@/lib/design-system";

interface Document {
  id: string;
  name: string;
  date: string;
}

export function UploadedDocuments() {
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

              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
