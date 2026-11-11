import React, { useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import styles from "./KnowledgeBase.module.css";
import { knowledgeService } from "../../services/knowledgeBase/knowledgeBase.service.js";
import { AsyncMotionValueAnimation } from "framer-motion";
import { useEffect } from "react";

const KnowledgeBase = () => {
  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingList] = useState(false);
  const [listError] = useState("");

  // Sample document list
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(documents[0] || null);

  // Reader / Search / AI States
  const [previewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [aiQuestion, setAiQuestion] = useState(
    "What does this PDF recommend for route persistence?",
  );
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);


  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await knowledgeService.getDocuments();
        
 
        const docsList = response?.documents || response?.data?.documents || response || [];
        
        setDocuments(docsList);

        if (docsList.length > 0) {
          setSelectedDoc(docsList[0]);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    fetchDocs(); 
  }, []);
  // File Choice Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  //  Upload Handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);

      const response = await knowledgeService.uploadService(formData);

      const newDoc = response?.document || response?.data?.document;

      if (newDoc) {
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDoc(newDoc);
      }

      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  //  Delete Handler
  const handleDeleteDoc = async (id, e) => {
    e.stopPropagation();
    try {
      await knowledgeService.DeleteDocService(id);
      const updated = documents.filter((doc) => doc.id !== id);
      setDocuments(updated);
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc(updated[0] || null);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  //  Semantic Search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    
    setSearchError("Search failed.");
  };

  //  Ask AI
  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiError("");

    setTimeout(() => {
      setAiLoading(false);
      setAiError("Could not get an answer.");
    }, 1000);
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <span className={styles.badge}>KNOWLEDGE BASE</span>
        <h1 className={styles.title}>Private PDF library</h1>
        <p className={styles.description}>
          Upload study or reference PDFs to your own workspace. Each file is
          indexed for semantic search and optional AI answers that cite passages
          from that document only. File size limits apply on the server; other
          users never see your uploads.
        </p>
      </div>

      {/* Content Layout */}
      <div className="row g-4 mt-2">
        {/* Left Side: Library & Upload */}
        <div className="col-12 col-lg-4">
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Library</h2>
            <p className={styles.cardSub}>
              Add PDFs here. Processing runs once per upload.
            </p>

            {/* Upload Box Area */}
            <div className={styles.uploadBox}>
              <p className={styles.uploadNotice}>
                Accepted format: PDF. Maximum file size is enforced by the
                server.
              </p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <label className={styles.chooseBtn}>
                  <FileText size={16} />
                  <span>Choose file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
                <button
                  className={styles.uploadBtn}
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  <Upload size={16} />
                  <span>{uploading ? "Uploading..." : "Upload"}</span>
                </button>
              </div>
              <div className={styles.fileStatusText}>
                {selectedFile ? selectedFile.name : "No file selected."}
              </div>
            </div>

            {listError && (
              <div className={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{listError}</span>
              </div>
            )}

            {loadingList ?
              <p className={styles.loadingText}>Loading your library...</p>
            : documents.length === 0 ?
              <p className={styles.emptyText}>
                Your library is empty. Upload a PDF to index it for search and
                Q&A.
              </p>
            : <div className={styles.docList}>
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`${styles.docCard} ${isSelected ? styles.activeDocCard : ""}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="d-flex flex-column gap-1 overflow-hidden">
                        <span className={styles.docName}>{doc.name}</span>
                        <span
                          className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        </div>

        {/* Right Side: Reader, Search, and AI Section */}
        <div className="col-12 col-lg-8">
          {!selectedDoc ?
            <div className={`${styles.card} ${styles.placeholderCard}`}>
              <p className={styles.placeholderText}>
                Choose a document from the library to open the reader, run
                semantic search over its text, and ask questions with
                AI-assisted answers grounded in that file.
              </p>
            </div>
          : selectedDoc.status === "PROCESSING" ?
            <div className={`${styles.card} ${styles.placeholderCard}`}>
              <p className={styles.placeholderText}>
                This document is not ready for preview or AI tools. Current
                status: <strong>processing</strong>.
              </p>
            </div>
          : <div className="d-flex flex-column gap-4">
              {/* Reader Section */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Reader</h2>
                <p className={styles.cardSub}>
                  Inline preview of the selected PDF.
                </p>
                <div className={styles.readerArea}>
                  {previewLoading ?
                    <span className={styles.loadingText}>
                      Loading document preview...
                    </span>
                  : selectedDoc && selectedDoc.fileUrl ?
                    <iframe
                      src={selectedDoc.fileUrl}
                      title={selectedDoc.name}
                      className={styles.pdfViewerFrame}
                    />
                  : <span className={styles.placeholderText}>
                      Select a document to preview its content here.
                    </span>
                  }
                </div>
              </div>

              {/* Semantic Search Section */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Semantic search</h2>
                <p className={styles.cardSub}>
                  Finds passages by meaning (embeddings), not only exact
                  keywords.
                </p>
                <div className="mb-2">
                  <label className={styles.label}>Search query</label>
                  <input
                    type="text"
                    className={`form-control ${styles.inputField}`}
                    placeholder="Describe the topic or phrase you are looking for"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className={styles.actionBtn} onClick={handleSearch}>
                  <Search size={16} />
                  <span>Search</span>
                </button>

                {searchError && (
                  <div className={styles.errorAlert}>
                    <span>{searchError}</span>
                  </div>
                )}
              </div>

              {/* Ask with AI Section */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Ask with AI</h2>
                <p className={styles.cardSub}>
                  Answers use only retrieved excerpts from this PDF, with
                  citations where possible. When the document includes code, the
                  reply may show it in formatted blocks you can copy.
                </p>
                <div className="mb-3">
                  <label className={styles.label}>Question</label>
                  <textarea
                    rows={3}
                    className={`form-control ${styles.inputField}`}
                    placeholder="Ask a clear question in plain language. If the document does not cover it, the model should say so."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                  />
                </div>
                <button
                  className={styles.actionBtn}
                  onClick={handleAskAI}
                  disabled={aiLoading}
                >
                  <Sparkles size={16} />
                  <span>{aiLoading ? "Asking..." : "Ask"}</span>
                </button>

                {aiError && (
                  <div className={styles.errorAlert}>
                    <span>{aiError}</span>
                  </div>
                )}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
