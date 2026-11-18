import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const filename = path.join(root, 'FSD_CA3_Expense_Tracker_Nihar_Gudekar.docx');
const data = await fs.readFile(filename);
const archive = await JSZip.loadAsync(data);
const documentXml = await archive.file('word/document.xml').async('string');
const relationships = await archive.file('word/_rels/document.xml.rels').async('string');
const media = Object.keys(archive.files).filter(name => name.startsWith('word/media/'));
const drawings = (documentXml.match(/<w:drawing>/g) || []).length;
const shadedCode = (documentXml.match(/w:fill="1E1E1E"/g) || []).length;
const programHeadings = [1, 2, 3, 4, 5].filter(number => documentXml.includes(`PROGRAM ${number}`));
const outputHeadings = (documentXml.match(/>Output</g) || []).length;
const pageNumbers = (documentXml.match(/PAGE/g) || []).length;
const externalLinks = (relationships.match(/TargetMode="External"/g) || []).length;

console.log(`DOCX archive: valid (${(data.length / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Program headings: ${programHeadings.length}/5`);
console.log(`Output headings: ${outputHeadings}`);
console.log(`Embedded media: ${media.length}`);
console.log(`Drawing elements: ${drawings}`);
console.log(`Syntax-shaded code paragraphs: ${shadedCode}`);
console.log(`External relationships: ${externalLinks}`);
if (programHeadings.length !== 5 || outputHeadings !== 5 || media.length !== 10 || drawings !== 10 || shadedCode < 5526) {
  throw new Error('Document content verification failed');
}
console.log('All structural checks passed.');
