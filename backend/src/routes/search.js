const fs = require('fs').promises;
const path = require('path');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const mammoth = require('mammoth');
const FuzzySearch = require('fuzzy-search');
const { getCachedResults, setCachedResults } = require('../utils/cache');

async function processPptxOrPptm(file, filePath, query) {
  let zip;
  try {
    zip = new AdmZip(filePath);
  } catch (zipError) {
    console.error(`Failed to read ${file} as ZIP: ${zipError.message}`);
    return [];
  }

  const zipEntries = zip.getEntries();
  const results = [];
  let slideCount = 1;

  // Criar buscador fuzzy para o query
  const searcher = new FuzzySearch([query], ['text'], { caseSensitive: false, sort: true });

  for (const entry of zipEntries) {
    if (entry.entryName.match(/ppt\/slides\/slide\d+\.xml$/)) {
      try {
        const slideXml = zip.readAsText(entry);
        const parser = new xml2js.Parser({ explicitArray: false });
        const slideData = await parser.parseStringPromise(slideXml);

        let slideText = '';
        const shapes = slideData['p:sld']?.['p:cSld']?.['p:spTree']?.['p:sp'] || [];
        for (const sp of Array.isArray(shapes) ? shapes : [shapes]) {
          const paragraphs = sp['p:txBody']?.['a:p'] || [];
          for (const p of Array.isArray(paragraphs) ? paragraphs : [paragraphs]) {
            const runs = p['a:r'] || [];
            for (const r of Array.isArray(runs) ? runs : [runs]) {
              const text = r['a:t'] || '';
              slideText += (typeof text === 'string' ? text : '') + ' ';
            }
          }
        }

        // Usar fuzzy search para verificar correspondência
        const fuzzyResult = searcher.search(slideText.trim());
        if (fuzzyResult.length > 0 || slideText.toLowerCase().includes(query)) {
          const slideNum = entry.entryName.match(/slide(\d+)\.xml$/)?.[1];
          const images = [];
          const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
          const relsEntry = zipEntries.find(e => e.entryName === relsPath);

          if (relsEntry) {
            const relsXml = zip.readAsText(relsEntry);
            const { Relationships: { Relationship = [] } } = await parser.parseStringPromise(relsXml);
            const imageIds = Array.isArray(Relationship)
              ? Relationship.filter(r => r['$'].Target.startsWith('../media/')).map(r => r['$'].Target.replace('../media/', ''))
              : Relationship['$']?.Target?.startsWith('../media/') ? [Relationship['$'].Target.replace('../media/', '')] : [];

            for (const mediaEntry of zipEntries) {
              if (mediaEntry.entryName.match(/ppt\/media\/image\d+\.(png|jpg|jpeg)$/)) {
                const mediaName = mediaEntry.entryName.split('/').pop();
                if (imageIds.includes(mediaName)) {
                  const imageData = zip.readFile(mediaEntry).toString('base64');
                  const ext = mediaEntry.entryName.split('.').pop();
                  images.push({ data: imageData, type: `image/${ext}` });
                }
              }
            }
          }

          results.push({
            file,
            slideNumber: slideCount,
            text: slideText.trim(),
            images
          });
          console.log(`Match found in ${file}, slide ${slideCount}. Total results: ${results.length}`);
        }
      } catch (slideError) {
        console.error(`Error processing slide ${slideCount} in ${file}: ${slideError.message}`);
      }
      slideCount++;
    }
  }
  return results;
}

async function processDocx(file, filePath, query) {
  let zip;
  try {
    zip = new AdmZip(filePath);
  } catch (zipError) {
    console.error(`Failed to read ${file} as ZIP: ${zipError.message}`);
    return [];
  }

  const results = [];
  try {
    // Extrair texto com mammoth
    const { value: text } = await mammoth.extractRawText({ path: filePath });

    // Usar fuzzy search para texto
    const searcher = new FuzzySearch([query], ['text'], { caseSensitive: false, sort: true });
    const fuzzyResult = searcher.search(text.trim());

    if (fuzzyResult.length > 0 || text.toLowerCase().includes(query)) {
      // Extrair imagens
      const zipEntries = zip.getEntries();
      const images = [];

      for (const entry of zipEntries) {
        if (entry.entryName.match(/word\/media\/image\d+\.(png|jpg|jpeg)$/)) {
          try {
            const imageData = zip.readFile(entry).toString('base64');
            const ext = entry.entryName.split('.').pop();
            images.push({ data: imageData, type: `image/${ext}` });
          } catch (imgError) {
            console.error(`Error reading image in ${file}: ${imgError.message}`);
          }
        }
      }

      results.push({
        file,
        slideNumber: null,
        text: text.trim(),
        images
      });
      console.log(`Match found in ${file}. Total results: ${results.length}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}: ${error.message}`);
  }

  return results;
}

async function searchFiles(query, pptxDir) {
  const cachedResults = await getCachedResults(query);
  if (cachedResults) {
    console.log(`Returning cached results for query: ${query}`);
    return cachedResults;
  }

  const files = await fs.readdir(pptxDir);
  console.log(`Found ${files.length} files in pptx_files: ${files.join(', ')}`);

  const processTasks = files.map(async file => {
    if (!file.toLowerCase().match(/\.(pptx|pptm|docx)$/)) {
      console.log(`Skipping non-PPTX/PPTM/DOCX file: ${file}`);
      return [];
    }

    console.log(`Starting to process file: ${file}`);
    const filePath = path.join(pptxDir, file);

    if (file.toLowerCase().match(/\.(pptx|pptm)$/)) {
      return processPptxOrPptm(file, filePath, query);
    } else if (file.toLowerCase().endsWith('.docx')) {
      return processDocx(file, filePath, query);
    }
    return [];
  });

  const resultsArray = await Promise.all(processTasks);
  const results = resultsArray.flat();

  await setCachedResults(query, results);
  console.log(`Search complete. Returning ${results.length} results`);
  return results;
}

module.exports = { searchFiles };