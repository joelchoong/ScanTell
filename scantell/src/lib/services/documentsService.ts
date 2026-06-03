// Documents Service - Data layer for document management
// This service can be easily swapped with actual database calls later

export interface Document {
  id: string;
  name: string;
  date: string;
  fileUrl?: string;
}

// Mock data - replace with actual database calls in production
let mockDocuments: Document[] = [
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

export const documentsService = {
  // Get all documents
  getAll: async (): Promise<Document[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...mockDocuments];
  },

  // Get document by ID
  getById: async (id: string): Promise<Document | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockDocuments.find(doc => doc.id === id) || null;
  },

  // Add new document
  add: async (document: Omit<Document, 'id'>): Promise<Document> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newDoc: Document = {
      ...document,
      id: Date.now().toString(),
    };
    mockDocuments.push(newDoc);
    return newDoc;
  },

  // Update document
  update: async (id: string, updates: Partial<Document>): Promise<Document | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = mockDocuments.findIndex(doc => doc.id === id);
    if (index === -1) return null;
    
    mockDocuments[index] = { ...mockDocuments[index], ...updates };
    return mockDocuments[index];
  },

  // Delete document
  delete: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const initialLength = mockDocuments.length;
    mockDocuments = mockDocuments.filter(doc => doc.id !== id);
    return mockDocuments.length < initialLength;
  },
};
