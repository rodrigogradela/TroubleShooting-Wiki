const fs = require('fs').promises;
const path = require('path'); // Adicionar importação do path
const AdmZip = require('adm-zip');

async function validateFiles(directory) {
  const invalidFiles = [];
  const files = await fs.readdir(directory);

  for (const file of files) {
    if (!file.toLowerCase().match(/\.(pptx|pptm|docx)$/)) {
      invalidFiles.push({ file, reason: 'Unsupported extension' });
      continue;
    }

    const filePath = path.join(directory, file);
    if (file.toLowerCase().match(/\.(pptx|pptm)$/)) {
      try {
        const zip = new AdmZip(filePath);
        zip.getEntries(); // Testa se o ZIP é válido
      } catch (error) {
        invalidFiles.push({ file, reason: `Invalid ZIP: ${error.message}` });
      }
    }
    // Validação de .docx pode ser adicionada com mammoth se necessário
  }

  return invalidFiles;
}

module.exports = { validateFiles };