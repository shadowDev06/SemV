import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun,
  LineRuleType, PageBreak, PageNumber, Packer, Paragraph, ShadingType, Table,
  TableCell, TableRow, TextRun, VerticalAlign, WidthType
} from 'docx';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, '..');
const outputFile = path.join(root, 'FSD_CA3_Expense_Tracker_Nihar_Gudekar.docx');
const codeBackground = '1E1E1E';
const navy = '17365D';
const blue = '2F5597';
const muted = '5E6B78';
const contentWidth = 10400;
let totalCodeLines = 0;
let totalSourceFiles = 0;

const programs = [
  {
    number: 1,
    title: 'Expense Tracker Using HTML, CSS and JavaScript',
    co: 'CO1, CO2',
    aim: 'To develop a responsive browser-based Expense Tracker using HTML, CSS and JavaScript. The application uses DOM manipulation, event handling and Fetch API communication to manage expense records.',
    technologies: 'HTML5, CSS3, JavaScript, Fetch API, async/await, DOM and json-server.',
    working: 'The application displays expenses in a responsive dashboard with summary cards and an API activity panel. Users can add, edit and delete records, search expenses, filter by payment status and sort by date, amount or title. JavaScript validates every form before sending asynchronous GET, POST, PATCH and DELETE requests to json-server. JSON responses update the interface dynamically, while loading, empty and network-error states provide meaningful feedback.',
    result: 'A responsive Expense Tracker was developed successfully with course-outcome-aligned CRUD operations, Fetch API communication, dynamic rendering, filtering, sorting and input validation.',
    files: ['index.html', 'styles.css', 'app.js', 'db.json', 'package.json'],
    outputs: [
      ['program-1-dashboard.png', 'Figure 1.1: Expense dashboard displaying records retrieved from json-server using a GET request.'],
      ['program-1-expense-form.png', 'Figure 1.2: Validated expense-entry form with category, date, amount and payment-status fields.'],
      ['program-1-post-output.png', 'Figure 1.3: A new expense created successfully; the API panel records POST /expenses with HTTP 201 Created.']
    ]
  },
  {
    number: 2,
    title: 'Expense Tracker Using React, JSX and React Router',
    co: 'CO3',
    aim: 'To develop a React Expense Tracker using reusable functional components, JSX, props and state, with a data-entry form, listing view and client-side navigation.',
    technologies: 'React 18, Vite, JavaScript, JSX, React Router, Hooks, CSS3, Lucide React and localStorage.',
    working: 'Reusable components separate the layout, summary cards, expense list, insights, form and confirmation dialog. The controlled form uses useState for input values and validation errors. The parent component passes data and event handlers through props, while useEffect persists records to localStorage and manages notifications. React Router provides Dashboard, Add Expense and Edit Expense routes. Conditional rendering displays empty states, validation messages and a live receipt preview. Search, category filtering, sorting, editing and deletion are handled through component events.',
    result: 'A modular React Expense Tracker was implemented successfully with reusable components, Hooks, React Router navigation, conditional rendering, local persistence and responsive views.',
    files: [
      'index.html', 'vite.config.js', 'package.json', 'src/main.jsx', 'src/App.jsx', 'src/utils.js',
      'src/components/Layout.jsx', 'src/components/SummaryCards.jsx', 'src/components/ExpenseList.jsx',
      'src/components/ExpenseForm.jsx', 'src/components/Insights.jsx', 'src/components/CategoryIcon.jsx',
      'src/components/ConfirmDialog.jsx', 'src/styles.css'
    ],
    outputs: [
      ['program-2-dashboard.png', 'Figure 2.1: React dashboard with reusable summary, insights and expense-list components.'],
      ['program-2-add-expense.png', 'Figure 2.2: React Router Add Expense view showing controlled inputs and a state-driven live preview.']
    ]
  },
  {
    number: 3,
    title: 'Server-side Expense Tracker Utility Using Node.js',
    co: 'CO4',
    aim: 'To create a Node.js server-side Expense Tracker utility that stores records with File System and Path modules, emits update notifications and exposes functionality through a basic HTTP server without Express.',
    technologies: 'Node.js, node:http, node:fs/promises, node:path, node:events, EventEmitter, JSON and crypto.randomUUID.',
    working: 'The native HTTP server parses request methods, URLs and JSON bodies to provide expense CRUD endpoints and a health check. The store module uses absolute paths, JSON files, serialized writes and temporary-file renaming for reliable persistence. Validation checks the title, positive amount, category, real calendar date and paid or pending status. EventEmitter publishes create, update and delete notifications. The automated demonstration starts an ephemeral server, performs real HTTP requests, reloads persisted JSON and removes its temporary data.',
    result: 'A dependency-free Node.js HTTP utility was developed and verified successfully with JSON persistence, CRUD routing, EventEmitter notifications, validation and meaningful error responses.',
    files: ['server.js', 'expenseStore.js', 'validation.js', 'demo.js', 'data/expenses.json', 'package.json'],
    outputs: [
      ['program-3-terminal-output.png', 'Figure 3.1: Actual Node.js demonstration output showing HTTP CRUD, EventEmitter notifications, validation and persistence checks.']
    ]
  },
  {
    number: 4,
    title: 'Secure Expense Tracker REST API Using Express.js',
    co: 'CO5',
    aim: 'To develop an Express.js REST API for expense management with CRUD routes, middleware, centralized error handling and JWT-protected routes using bcrypt-hashed passwords.',
    technologies: 'Node.js, Express.js, bcryptjs, JSON Web Token, dotenv, middleware, Fetch API and JSON file persistence.',
    working: 'The API exposes registration and login routes followed by JWT-protected expense routes. Passwords are hashed with bcrypt before storage and compared during login. Successful login returns a signed JWT that must be supplied as a Bearer token. Request-logging middleware records methods, paths and response codes. Validation middleware rejects incorrect credentials and expense data, while centralized handlers process malformed JSON, unknown routes and server errors. Expense records are isolated by user ID and support GET, POST, PUT and DELETE operations.',
    result: 'A secure Express.js API was implemented and tested successfully with bcrypt password hashing, JWT authentication, protected CRUD routes, validation middleware, request logging and centralized error handling.',
    files: ['server.js', 'middleware.js', 'store.js', 'demo.js', '.env.example', 'package.json'],
    outputs: [
      ['program-4-terminal-output.png', 'Figure 4.1: Actual Express API test output covering bcrypt, JWT, protected access, validation and all CRUD methods.']
    ]
  },
  {
    number: 5,
    title: 'Integrated Full-stack Expense Tracker Using React, Express and MongoDB',
    co: 'CO6',
    aim: 'To integrate a React Expense Tracker frontend with an Express.js backend and MongoDB database using Mongoose, CORS and environment variables, and prepare the application for Vercel and Render deployment.',
    technologies: 'React, Vite, Express.js, MongoDB, Mongoose, Fetch API, CORS, dotenv, MongoDB Memory Server, Vercel and Render.',
    working: 'The React interface communicates with the Express API through environment-based Fetch requests. Express exposes CRUD routes and uses CORS to allow the configured frontend origin. Mongoose defines validation rules and persists expense documents in MongoDB. The dashboard updates totals, category analytics and transaction listings after each API operation. A temporary in-memory MongoDB server is used only for local demonstrations; normal execution uses MONGO_URI. Environment examples, Vercel rewrites and a Render blueprint document the deployment configuration without exposing credentials.',
    result: 'A full-stack Expense Tracker was integrated and verified successfully with a React frontend, Express API, Mongoose model and MongoDB persistence. CORS, environment variables and deployment configuration were prepared for Vercel and Render.',
    files: [
      'package.json', 'server/package.json', 'server/.env.example', 'server/index.js', 'server/app.js',
      'server/database.js', 'server/models/Expense.js', 'server/demo.js', 'client/package.json',
      'client/.env.example', 'client/vite.config.js', 'client/index.html', 'client/src/main.jsx',
      'client/src/api.js', 'client/src/App.jsx', 'client/src/styles.css', 'client/vercel.json',
      'render.yaml', 'DEPLOYMENT.md'
    ],
    outputs: [
      ['program-5-dashboard.png', 'Figure 5.1: Integrated React dashboard displaying six expense documents retrieved through Express and Mongoose.'],
      ['program-5-create-output.png', 'Figure 5.2: End-to-end create operation: the React form saved a record through Express into MongoDB.'],
      ['program-5-terminal-output.png', 'Figure 5.3: Actual integration test confirming CORS API behavior, CRUD, validation and MongoDB persistence.']
    ]
  }
];

const highlighter = await createHighlighter({
  themes: ['dark-plus'],
  langs: ['html', 'css', 'javascript', 'jsx', 'json', 'markdown', 'yaml', 'shell', 'plaintext']
});

function languageFor(file) {
  if (file.endsWith('.html')) return 'html';
  if (file.endsWith('.css')) return 'css';
  if (file.endsWith('.jsx')) return 'jsx';
  if (file.endsWith('.js')) return 'javascript';
  if (file.endsWith('.json')) return 'json';
  if (file.endsWith('.md')) return 'markdown';
  if (file.endsWith('.yaml') || file.endsWith('.yml')) return 'yaml';
  if (file.includes('.env')) return 'shell';
  return 'plaintext';
}

function text(text, options = {}) {
  return new TextRun({ text, font: 'Calibri', size: 22, ...options });
}

function bodyParagraph(label, content) {
  return new Paragraph({
    children: [text(`${label} `, { bold: true, color: navy }), text(content)],
    spacing: { after: 145, line: 280 },
    alignment: AlignmentType.JUSTIFIED
  });
}

function heading(content, level = HeadingLevel.HEADING_1) {
  const isMain = level === HeadingLevel.HEADING_1;
  return new Paragraph({
    heading: level,
    children: [text(content, { bold: true, color: isMain ? navy : blue, size: isMain ? 31 : 26 })],
    spacing: { before: isMain ? 0 : 200, after: 180 },
    keepNext: true,
    border: isMain ? { bottom: { style: BorderStyle.SINGLE, size: 12, color: '9FBAD0', space: 8 } } : undefined
  });
}

function fileHeading(file) {
  return new Paragraph({
    children: [new TextRun({ text: `  ${file}`, font: 'Consolas', size: 19, bold: true, color: 'FFFFFF' })],
    shading: { type: ShadingType.CLEAR, fill: '31313A', color: 'auto' },
    spacing: { before: 210, after: 0, line: 280 },
    keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '45454D', space: 2 } }
  });
}

async function codeParagraphs(programNumber, file) {
  const filePath = path.join(root, 'source', `program-${programNumber}`, file);
  const source = (await fs.readFile(filePath, 'utf8')).replace(/^\uFEFF/, '').replace(/\t/g, '  ').replace(/\r\n/g, '\n');
  totalSourceFiles += 1;
  const lines = source.split('\n');
  if (lines.at(-1) === '') lines.pop();
  totalCodeLines += lines.length;
  const tokens = highlighter.codeToTokens(source, { lang: languageFor(file), theme: 'dark-plus' });
  const width = String(lines.length).length;
  const paragraphs = [];
  tokens.tokens.forEach((line, index) => {
    const children = [new TextRun({
      text: `${String(index + 1).padStart(width, ' ')} │ `,
      font: 'Consolas', size: 15, color: '6E7681'
    })];
    if (line.length === 0) {
      children.push(new TextRun({ text: ' ', font: 'Consolas', size: 15, color: 'D4D4D4' }));
    } else {
      line.forEach(token => children.push(new TextRun({
        text: token.content,
        font: 'Consolas', size: 15,
        color: token.color || 'D4D4D4',
        italics: token.fontStyle === 2,
        bold: token.fontStyle === 1
      })));
    }
    paragraphs.push(new Paragraph({
      children,
      shading: { type: ShadingType.CLEAR, fill: codeBackground, color: 'auto' },
      spacing: { before: 0, after: 0, line: 199, lineRule: LineRuleType.AT_LEAST },
      indent: { left: 100, right: 80 },
      keepLines: false,
      widowControl: false
    }));
  });
  paragraphs.push(new Paragraph({
    children: [new TextRun({ text: ' ', size: 8 })],
    shading: { type: ShadingType.CLEAR, fill: codeBackground, color: 'auto' },
    spacing: { before: 0, after: 100, line: 100 }
  }));
  return paragraphs;
}

function pngDimensions(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function screenshot(filename, caption, first) {
  const data = await fs.readFile(path.join(root, 'screenshots', filename));
  const dimensions = pngDimensions(data);
  const scale = Math.min(675 / dimensions.width, 760 / dimensions.height);
  const width = Math.round(dimensions.width * scale);
  const height = Math.round(dimensions.height * scale);
  return [
    new Paragraph({
      children: [new ImageRun({
        type: 'png', data,
        transformation: { width, height },
        altText: { title: caption, description: caption, name: filename }
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: first ? 40 : 100, after: 110 }
    }),
    new Paragraph({
      children: [text(caption, { italics: true, size: 19, color: muted })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100, line: 240 }
    })
  ];
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
};

function detailRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 29, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: 'EAF0F6', color: 'auto' },
        margins: { top: 130, bottom: 130, left: 170, right: 170 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ children: [text(label, { bold: true, color: navy })] })]
      }),
      new TableCell({
        width: { size: 71, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: 'F7F9FC', color: 'auto' },
        margins: { top: 130, bottom: 130, left: 170, right: 170 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ children: [text(value)] })]
      })
    ]
  });
}

const children = [];
children.push(
  new Paragraph({ spacing: { before: 500, after: 100 }, children: [] }),
  new Paragraph({
    children: [text('FULL STACK DEVELOPMENT', { bold: true, size: 44, color: navy })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 70 }
  }),
  new Paragraph({
    children: [text('PROGRAMMING EXERCISE', { bold: true, size: 34, color: blue })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: '8AA8C4', space: 12 } }
  }),
  new Paragraph({
    children: [text('Individual Practical Assignment | B.E. (AI & DS) | Semester V', { size: 22, color: muted })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 520 }
  }),
  new Paragraph({
    children: [text('Project Title', { size: 23, color: muted })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 }
  }),
  new Paragraph({
    children: [text('E X P E N S E   T R A C K E R', { bold: true, size: 38, color: navy })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 440 }
  }),
  new Table({
    width: { size: 88, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 5, color: 'CAD6E2' },
      bottom: { style: BorderStyle.SINGLE, size: 5, color: 'CAD6E2' },
      left: { style: BorderStyle.SINGLE, size: 5, color: 'CAD6E2' },
      right: { style: BorderStyle.SINGLE, size: 5, color: 'CAD6E2' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'D9E2EC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'D9E2EC' }
    },
    rows: [
      detailRow('Student Roll No.', '65'),
      detailRow('Student Name', 'Nihar Nilesh Gudekar'),
      detailRow('Subject', 'Full Stack Development'),
      detailRow('Programs', '5'),
      detailRow('Department', 'Artificial Intelligence and Data Science')
    ]
  }),
  new Paragraph({
    children: [text('Expense management applications covering CO1–CO6', { size: 21, color: muted, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300, after: 80 }
  }),
  new Paragraph({ children: [new PageBreak()] })
);

for (const program of programs) {
  children.push(
    heading(`PROGRAM ${program.number} – ${program.title}`),
    new Paragraph({
      children: [text(`Course Outcome: ${program.co}`, { bold: true, size: 19, color: '467A5B', allCaps: true })],
      spacing: { after: 200 }
    }),
    bodyParagraph('Aim:', program.aim),
    bodyParagraph('Technologies Used:', program.technologies),
    bodyParagraph('Working:', program.working),
    bodyParagraph('Result:', program.result),
    heading('Source Code', HeadingLevel.HEADING_2)
  );
  for (const file of program.files) {
    children.push(fileHeading(file));
    children.push(...await codeParagraphs(program.number, file));
  }
  children.push(new Paragraph({ children: [new PageBreak()] }), heading('Output', HeadingLevel.HEADING_2));
  for (let index = 0; index < program.outputs.length; index += 1) {
    const [filename, caption] = program.outputs[index];
    if (index > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...await screenshot(filename, caption, index === 0));
  }
  if (program.number < programs.length) children.push(new Paragraph({ children: [new PageBreak()] }));
}

const header = new Header({
  children: [new Paragraph({
    children: [text('FULL STACK DEVELOPMENT  •  PROGRAMMING EXERCISE', { size: 16, color: '64748B', bold: true, characterSpacing: 20 })],
    alignment: AlignmentType.RIGHT,
    border: { bottom: { style: BorderStyle.SINGLE, size: 5, color: 'CBD5E1', space: 5 } },
    spacing: { after: 100 }
  })]
});

const footer = new Footer({
  children: [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [text('Nihar Nilesh Gudekar  |  Roll No. 65', { size: 17, color: '64748B' })] })]
      }),
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({
            children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
            font: 'Calibri', size: 17, color: '64748B'
          })]
        })]
      })
    ] })]
  })]
});

const document = new Document({
  creator: 'Nihar Nilesh Gudekar',
  title: 'Full Stack Development – Expense Tracker Programming Exercise',
  description: 'Five Expense Tracker programs covering HTML/CSS/JavaScript, React, Node.js, Express.js and MongoDB integration.',
  subject: 'Full Stack Development CA 3',
  keywords: 'Expense Tracker, React, Node.js, Express, MongoDB, JWT, Fetch API',
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22, color: '24292F' },
        paragraph: { spacing: { after: 120, line: 276 } }
      }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 720, right: 750, bottom: 720, left: 750, header: 350, footer: 350 }
      }
    },
    headers: { default: header },
    footers: { default: footer },
    children
  }]
});

const buffer = await Packer.toBuffer(document);
await fs.writeFile(outputFile, buffer);
console.log(`Created ${outputFile}`);
console.log(`Programs: ${programs.length}`);
console.log(`Source files included: ${totalSourceFiles}`);
console.log(`Syntax-highlighted code lines: ${totalCodeLines}`);
console.log(`Screenshots included: ${programs.reduce((sum, program) => sum + program.outputs.length, 0)}`);
console.log(`DOCX size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
