import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SlidePreview from './components/SlidePreview';
import ImageZoom from './components/ImageZoom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;

  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFilteredResults(results.slice((page - 1) * resultsPerPage, page * resultsPerPage));
  }, [results, page]);

  useEffect(() => {
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, [page]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a search term.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3001/search', { params: { q: query } });
      setResults(response.data);
      setPage(1);
    } catch (err) {
      toast.error('Failed to fetch results.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!query.trim()) {
      toast.error('Please perform a search before exporting to PDF.');
      return;
    }

    if (results.length === 0) {
      toast.error('No results to export.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/export/pdf', {
        params: { q: query },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `search_results_${query}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Liberar o URL criado
      toast.success('PDF exportado com sucesso!');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF.');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    const allowedExtensions = ['.pptx', '.pptm', '.docx'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      toast.error('Only .pptx, .pptm, and .docx files are allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Upload do arquivo feito com sucesso!');
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error('Falha ao fazer upload do arquivo.');
    }
  };

  const totalPages = Math.ceil(results.length / resultsPerPage);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho */}
      <header className="p-4 bg-bridgestone-gray shadow-md">
        <div className="header-left">
          <img src="/bridgestone-logo.png" alt="Bridgestone Logo" className="h-10" />
          <h1 className="text-xl font-bold text-bridgestone-black">Troubleshooting Wiki</h1>
        </div>
      </header>

      {/* Área de conteúdo */}
      <div className="content" ref={contentRef}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="results-container">
            {error && <p className="text-red-500">{error}</p>}

            <div className="grid gap-4">
              {filteredResults.length === 0 && !loading && query && (
                <p className="text-bridgestone-black">No results found for "{query}".</p>
              )}
              {filteredResults.map((result, index) => (
                <SlidePreview key={index} result={result} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-bridgestone-white rounded border border-bridgestone-black disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-bridgestone-black">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-bridgestone-white rounded border border-bridgestone-black disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Rodapé */}
      <footer className="flex flex-col items-center gap-2">
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite sua duvida..."
            className="bg-transparent"
          />
          <button type="submit" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button type="button" onClick={() => fileInputRef.current.click()} className="upload-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16v1a2 2 0 002 2h14a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept=".pptx,.pptm,.docx"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={results.length === 0}
            className="export-pdf-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </form>
        <p className="text-sm text-bridgestone-black">© 2025 Mosten/Bridgestone. Todos os direitos reservados.</p>
      </footer>

      {/* Adicionar o ToastContainer para renderizar as notificações */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;