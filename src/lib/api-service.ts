// API Service for OpenAI Integration and File Processing
import { API_CONFIG } from './constants';

// Dynamic import for xlsx to avoid SSR issues
let XLSX: any = null;

async function loadXLSX() {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DataFile {
  id: string;
  name: string;
  type: string;
  size: number;
  rows: number;
  columns: string[];
  uploadedAt: Date;
  data: any[];
  preview?: any[];
}

export interface AnalysisResult {
  message: string;
  visualization?: {
    type: 'table' | 'bar' | 'line' | 'pie' | 'area';
    title: string;
    data: any[];
    columns: string[];
  };
  sqlQuery?: string;
  insights?: string[];
  rawResponse?: string;
}

// Validate file extension
function validateFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  const allowedExtensions = API_CONFIG.ALLOWED_EXTENSIONS.map(e => e.replace('.', ''));
  return allowedExtensions.includes(ext || '');
}

// Get file extension
function getFileExtension(filename: string): string {
  return filename.toLowerCase().split('.').pop() || '';
}

// Parse CSV text to array of objects
export function parseCSV(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // Handle different delimiters (comma, semicolon, tab)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t') && !firstLine.includes(',')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, '').replace(/'/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line, delimiter);
    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        if (header) {
          row[header] = parseValue(values[index] || '');
        }
      });
      data.push(row);
    }
  }

  return data;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

// Parse value to number/boolean/date if possible
function parseValue(value: string): any {
  const trimmed = value.trim().replace(/"/g, '').replace(/'/g, '');

  if (trimmed === '' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  // Try parsing as number (handle Arabic numerals too)
  const normalizedNum = trimmed
    .replace(/[ٰ٠-٩۰-۹]/g, (d) => String('٠۰'.indexOf(d) % 10))
    .replace(/[,٬]/g, '');

  const num = Number(normalizedNum);
  if (!isNaN(num) && trimmed.match(/^-?[\d,.٬]+$/)) {
    return num;
  }

  // Try parsing as boolean
  const lower = trimmed.toLowerCase();
  if (lower === 'true' || lower === 'نعم' || lower === 'yes' || lower === 'ي') return true;
  if (lower === 'false' || lower === 'لا' || lower === 'no' || lower === 'لا') return false;

  return trimmed;
}

// Parse Excel file (.xlsx, .xls)
export async function parseExcel(file: File): Promise<any[]> {
  try {
    const xlsx = await loadXLSX();
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: 'array', cellDates: true });

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false
    });

    return jsonData;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

// Process any supported file
export async function processFile(file: File): Promise<DataFile | null> {
  try {
    // Validate extension
    if (!validateFileExtension(file.name)) {
      console.error('Invalid file extension:', file.name);
      return null;
    }

    let data: any[] = [];
    const ext = getFileExtension(file.name);

    if (ext === 'csv') {
      const text = await file.text();
      data = parseCSV(text);
    } else if (ext === 'xlsx' || ext === 'xls') {
      data = await parseExcel(file);
    } else if (ext === 'json') {
      const text = await file.text();
      const parsed = JSON.parse(text);
      data = Array.isArray(parsed) ? parsed : [parsed];
    }

    if (data.length === 0) {
      console.error('No data found in file:', file.name);
      return null;
    }

    const columns = Object.keys(data[0] || {});
    const summary = getDataSummary(data);

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: ext,
      size: file.size,
      rows: data.length,
      columns: summary.columnNames,
      uploadedAt: new Date(),
      data: data,
      preview: data.slice(0, 10),
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return null;
  }
}

// Get column names from data
export function getColumnNames(data: any[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}

// Get data summary
export function getDataSummary(data: any[]): {
  rows: number;
  columns: number;
  columnNames: string[];
  numericColumns: string[];
  stringColumns: string[];
  dateColumns: string[];
} {
  const columnNames = getColumnNames(data);

  const numericColumns: string[] = [];
  const stringColumns: string[] = [];
  const dateColumns: string[] = [];

  columnNames.forEach(col => {
    const sampleValues = data.slice(0, 100).map(row => row[col]).filter(v => v != null);
    const allNumbers = sampleValues.every(v => typeof v === 'number');
    const allDates = sampleValues.every(v => v instanceof Date || (typeof v === 'string' && !isNaN(Date.parse(v))));

    if (allNumbers && sampleValues.length > 0) {
      numericColumns.push(col);
    } else if (allDates && sampleValues.length > 0) {
      dateColumns.push(col);
    } else {
      stringColumns.push(col);
    }
  });

  return {
    rows: data.length,
    columns: columnNames.length,
    columnNames,
    numericColumns,
    stringColumns,
    dateColumns,
  };
}

// Call OpenAI API
export async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  dataContext?: { columns: string[]; sampleData: any[]; numericColumns: string[] }
): Promise<string> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  // Build system prompt with data context
  let systemPrompt = `أنت مساعد ذكي متخصص في تحليل البيانات.
يجب عليك:
1. فهم أسئلة المستخدم عن البيانات
2. تحويل الأسئلة إلى تحليلات مفيدة
3. تقديم النتائج بطريقة واضحة ومفهومة
4. استخدام الرسوم البيانية المناسبة عند الحاجة
5. تقديم رؤى وتحليلات إضافية مفيدة
6. عند طلب رسوم بيانية، قدم البيانات بتنسيق JSON مناسب

أجب دائماً بالعربية بشكل واضح ومفصل.
إذا طلب المستخدم رسوم بيانية، قدمها بهذا التنسيق:
\`\`\`json
{
  "chart": {
    "type": "bar|line|pie|area",
    "title": "عنوان الرسم",
    "data": [{"label": "القيمة1", "value": 100}, ...]
  }
}
\`\`\``;

  // Add data context if available
  if (dataContext && dataContext.columns.length > 0) {
    const numericInfo = dataContext.numericColumns.length > 0
      ? `\n- الأعمدة الرقمية: ${dataContext.numericColumns.join(', ')}`
      : '';

    systemPrompt += `

بيانات المستخدم المتاحة:
- الأعمدة: ${dataContext.columns.join(', ')}${numericInfo}
- عدد الصفوف: ${dataContext.sampleData.length}
- عينة من البيانات (أول 10 صفوف):
${JSON.stringify(dataContext.sampleData.slice(0, 10), null, 2)}

قم بتحليل البيانات وقدم إجابة شاملة.`;
  }

  const requestMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(API_CONFIG.OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.DEFAULT_MODEL,
      messages: requestMessages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'فشل الاتصال بـ OpenAI API');
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || '';
}

// Generate analysis from user query
export async function analyzeWithAI(
  apiKey: string,
  query: string,
  dataContext: { columns: string[]; sampleData: any[]; numericColumns: string[] }
): Promise<AnalysisResult> {
  try {
    const response = await callOpenAI(
      apiKey,
      [{ role: 'user', content: query }],
      dataContext
    );

    // Try to extract chart data if present
    let visualization = undefined;
    try {
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.chart) {
          visualization = {
            type: parsed.chart.type || 'bar',
            title: parsed.chart.title || 'رسم بياني',
            data: parsed.chart.data || [],
            columns: ['label', 'value'],
          };
        }
      }
    } catch (e) {
      // No chart data found, continue with text response
    }

    return {
      message: response,
      visualization,
      rawResponse: response,
    };
  } catch (error) {
    throw error;
  }
}

// Storage helpers
const API_KEY_STORAGE = 'dataai_openai_key';

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.length > 0;
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

// File data storage
const FILE_DATA_KEY = 'dataai_current_file';

export function saveCurrentFile(file: DataFile): void {
  // Store only preview for localStorage (limit to 500 rows to avoid quota issues)
  const preview = file.data.slice(0, 500);
  localStorage.setItem(FILE_DATA_KEY, JSON.stringify({
    ...file,
    data: preview,
    uploadedAt: file.uploadedAt.toISOString(),
  }));
}

export function getCurrentFile(): DataFile | null {
  const stored = localStorage.getItem(FILE_DATA_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    // Convert uploadedAt back to Date
    if (typeof parsed.uploadedAt === 'string') {
      parsed.uploadedAt = new Date(parsed.uploadedAt);
    }
    return parsed;
  } catch (e) {
    console.error('Error parsing stored file:', e);
    return null;
  }
}

export function clearCurrentFile(): void {
  localStorage.removeItem(FILE_DATA_KEY);
}

// File conversion helpers
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(col => {
        const value = row[col];
        if (value == null) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
