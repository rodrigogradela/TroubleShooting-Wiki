const PDFDocument = require('pdfkit');
const { createObjectCsvStringifier } = require('csv-writer');

function generatePDF(results) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Título do documento
    doc.fontSize(16).text('Troubleshooting Wiki Search Results', { align: 'center' });
    doc.moveDown();

    results.forEach((result, index) => {
      // Informações do resultado
      doc.fontSize(12).text(`Result ${index + 1}: ${result.file}${result.slideNumber ? ` - Slide ${result.slideNumber}` : ''}`);
      doc.fontSize(10).text(result.text.substring(0, 500) + (result.text.length > 500 ? '...' : ''));
      doc.moveDown();

      // Adicionar imagens, se houver
      if (result.images && result.images.length > 0) {
        doc.fontSize(10).text(`Images (${result.images.length}):`);
        result.images.forEach((img, imgIndex) => {
          try {
            // Converter base64 para buffer
            const imgBuffer = Buffer.from(img.data, 'base64');
            // Adicionar imagem com tamanho máximo de 300px de largura
            doc.image(imgBuffer, {
              width: 300,
              align: 'left'
            });
            doc.moveDown();
          } catch (imgError) {
            console.error(`Error adding image ${imgIndex + 1} in ${result.file}: ${imgError.message}`);
            doc.text(`[Error: Could not load image ${imgIndex + 1}]`);
            doc.moveDown();
          }
        });
      } else {
        doc.text('No images found.');
        doc.moveDown();
      }
    });

    doc.end();
  });
}

function generateCSV(results) {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'file', title: 'File' },
      { id: 'slideNumber', title: 'Slide Number' },
      { id: 'text', title: 'Text' },
      { id: 'imageCount', title: 'Image Count' }
    ]
  });

  const records = results.map(result => ({
    file: result.file,
    slideNumber: result.slideNumber || 'N/A',
    text: result.text.substring(0, 1000).replace(/\n/g, ' '),
    imageCount: result.images.length
  }));

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
}

module.exports = { generatePDF, generateCSV };