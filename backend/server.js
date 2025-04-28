const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { validateFiles } = require('./src/utils/validateFiles');
const { searchFiles } = require('./src/routes/search');
const { generatePDF, generateCSV } = require('./src/utils/exportResults');

const app = express();
const port = 3001;
const pptxDir = path.join(__dirname, 'pptx_files');

// Configurar o multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pptxDir);
  },
  filename: (req, file, cb) => {
    // Usar o nome original do arquivo
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pptx', '.pptm', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pptx, .pptm, and .docx files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

app.use(cors());
app.use(express.json());

app.get('/search', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const invalidFiles = await validateFiles(pptxDir);
    if (invalidFiles.length > 0) {
      console.warn('Invalid files found:', invalidFiles);
    }

    const results = await searchFiles(query, pptxDir);
    res.json(results);
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    res.status(500).json({ error: 'Error processing files' });
  }
});

app.get('/export/pdf', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    console.log('Query parameter missing in /export/pdf');
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    console.log(`Exporting PDF for query: ${query}`);
    const results = await searchFiles(query, pptxDir);
    console.log(`Search results for PDF export: ${results.length} items`);
    const pdfBuffer = await generatePDF(results);
    console.log('PDF gerado com sucesso');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="search_results_${query}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error(`Erro ao gerar PDF: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ error: 'Erro ao Gerar PDF' });
  }
});

app.get('/export/csv', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await searchFiles(query, pptxDir);
    const csvContent = await generateCSV(results);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="search_results_${query}.csv"`
    });
    res.send(csvContent);
  } catch (error) {
    console.error(`Error generating CSV: ${error.message}`);
    res.status(500).json({ error: 'Error generating CSV' });
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Erro no upload do arquivo ou formato de arquivo invalido' });
    }
    res.status(200).json({ message: 'Upload de arquivo feito com sucesso!!!', filename: req.file.filename });
  } catch (error) {
    console.error(`Erro ao fazer upload do arquivo: ${error.message}`);
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' });
  }
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});