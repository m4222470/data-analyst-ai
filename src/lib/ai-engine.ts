// AI Analysis Engine - Natural Language to Data Analysis
import { AnalysisResult, VisualizationData } from '../types';

interface ParsedQuery {
  intent: 'sum' | 'average' | 'count' | 'max' | 'min' | 'group_by' | 'compare' | 'trend' | 'top' | 'general';
  field: string;
  groupBy?: string;
  filter?: string;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export function parseNaturalLanguage(query: string): ParsedQuery {
  const q = query.toLowerCase();

  // Detect intent
  let intent: ParsedQuery['intent'] = 'general';

  if (q.includes('مجموع') || q.includes('total') || q.includes('sum')) {
    intent = 'sum';
  } else if (q.includes('متوسط') || q.includes('average') || q.includes('mean')) {
    intent = 'average';
  } else if (q.includes('عدد') || q.includes('count')) {
    intent = 'count';
  } else if (q.includes('أكثر') || q.includes('أعلى') || q.includes('max') || q.includes('highest')) {
    intent = 'max';
  } else if (q.includes('أقل') || q.includes('minimum') || q.includes('lowest')) {
    intent = 'min';
  } else if (q.includes('لكل') || q.includes('group by') || q.includes('حسب')) {
    intent = 'group_by';
  } else if (q.includes('قارن') || q.includes('compare')) {
    intent = 'compare';
  } else if (q.includes('اتجاه') || q.includes('trend') || q.includes('تغير')) {
    intent = 'trend';
  } else if (q.includes('أفضل') || q.includes('top') || q.includes('اول')) {
    intent = 'top';
  }

  // Detect fields
  let field = 'sales';
  if (q.includes('ربح') || q.includes('profit')) {
    field = 'profit';
  } else if (q.includes('عميل') || q.includes('customer')) {
    field = 'customers';
  } else if (q.includes('منتج') || q.includes('product')) {
    field = 'product';
  }

  // Detect group by
  let groupBy: string | undefined;
  if (q.includes('شهر') || q.includes('month')) {
    groupBy = 'month';
  } else if (q.includes('فئة') || q.includes('category')) {
    groupBy = 'category';
  }

  // Detect limit
  let limit = 5;
  const numMatch = q.match(/(\d+)/);
  if (numMatch) {
    limit = parseInt(numMatch[1]);
  }

  // Detect sort
  let sort: 'asc' | 'desc' = 'desc';
  if (q.includes('اقل') || q.includes('أسفل')) {
    sort = 'asc';
  }

  return { intent, field, groupBy, limit, sort };
}

export function generateSQLFromQuery(query: string, columns: string[]): string {
  const parsed = parseNaturalLanguage(query);

  let sql = 'SELECT ';

  // Add aggregation function
  switch (parsed.intent) {
    case 'sum':
      sql += `SUM(${parsed.field}) as total_${parsed.field}`;
      break;
    case 'average':
      sql += `AVG(${parsed.field}) as avg_${parsed.field}`;
      break;
    case 'count':
      sql += `COUNT(*) as total_count`;
      break;
    case 'max':
      sql += `MAX(${parsed.field}) as max_${parsed.field}`;
      break;
    case 'min':
      sql += `MIN(${parsed.field}) as min_${parsed.field}`;
      break;
    case 'top':
      sql += `${parsed.field}`;
      break;
    default:
      sql += '*';
  }

  sql += ' FROM data';

  // Add group by
  if (parsed.groupBy) {
    sql += ` GROUP BY ${parsed.groupBy}`;
  }

  // Add order and limit for top/bottom
  if (parsed.intent === 'top' || parsed.intent === 'max' || parsed.intent === 'min') {
    sql += ` ORDER BY ${parsed.field} ${parsed.sort.toUpperCase()}`;
    sql += ` LIMIT ${parsed.limit}`;
  }

  return sql;
}

export function analyzeData(data: any[], query: string): AnalysisResult {
  const parsed = parseNaturalLanguage(query);
  let result: any;
  let message = '';
  let visualization: VisualizationData | undefined;

  switch (parsed.intent) {
    case 'sum':
      const total = data.reduce((sum, item) => sum + (item[parsed.field] || 0), 0);
      result = { total };
      message = `مجموع ${getFieldName(parsed.field)} هو ${formatNumber(total)}`;
      visualization = {
        type: 'table',
        title: `مجموع ${getFieldName(parsed.field)}`,
        data: [{ الوصف: `إجمالي ${getFieldName(parsed.field)}`, القيمة: formatNumber(total) }],
        columns: ['الوصف', 'القيمة'],
      };
      break;

    case 'average':
      const avg = data.reduce((sum, item) => sum + (item[parsed.field] || 0), 0) / data.length;
      result = { average: avg };
      message = `متوسط ${getFieldName(parsed.field)} هو ${formatNumber(avg)}`;
      visualization = {
        type: 'table',
        title: `متوسط ${getFieldName(parsed.field)}`,
        data: [{ الوصف: `متوسط ${getFieldName(parsed.field)}`, القيمة: formatNumber(avg) }],
        columns: ['الوصف', 'القيمة'],
      };
      break;

    case 'max':
      const max = Math.max(...data.map(item => item[parsed.field] || 0));
      const maxItem = data.find(item => item[parsed.field] === max);
      result = { max, item: maxItem };
      message = `أعلى ${getFieldName(parsed.field)} هو ${formatNumber(max)}`;
      if (maxItem) {
        const label = maxItem.month || maxItem.product || maxItem.category || 'الإجمالي';
        visualization = {
          type: 'bar',
          title: `أعلى ${getFieldName(parsed.field)}`,
          data: [{ العنصر: label, القيمة: max }],
          columns: ['العنصر', 'القيمة'],
        };
      }
      break;

    case 'min':
      const min = Math.min(...data.map(item => item[parsed.field] || 0));
      const minItem = data.find(item => item[parsed.field] === min);
      result = { min, item: minItem };
      message = `أقل ${getFieldName(parsed.field)} هو ${formatNumber(min)}`;
      if (minItem) {
        const label = minItem.month || minItem.product || minItem.category || 'الإجمالي';
        visualization = {
          type: 'bar',
          title: `أقل ${getFieldName(parsed.field)}`,
          data: [{ العنصر: label, القيمة: min }],
          columns: ['العنصر', 'القيمة'],
        };
      }
      break;

    case 'group_by':
      const grouped = groupDataByField(data, parsed.groupBy || 'month', parsed.field);
      result = grouped;
      message = `إليك ${getFieldName(parsed.field)} حسب ${getFieldName(parsed.groupBy || 'month')}:`;
      visualization = {
        type: 'bar',
        title: `${getFieldName(parsed.field)} حسب ${getFieldName(parsed.groupBy || 'الشهر')}`,
        data: grouped,
        columns: [getFieldName(parsed.groupBy || 'الشهر') || 'الشهر', getFieldName(parsed.field)],
      };
      break;

    case 'trend':
      const trendData = data.map(item => ({
        [parsed.groupBy || 'period']: item.month || item.product || 'الفترة',
        [parsed.field]: item[parsed.field],
      }));
      result = trendData;
      message = `اتجاه ${getFieldName(parsed.field)} عبر الوقت:`;
      visualization = {
        type: 'line',
        title: `اتجاه ${getFieldName(parsed.field)}`,
        data: trendData,
        columns: ['period', parsed.field],
      };
      break;

    case 'top':
      const sorted = [...data].sort((a, b) => b[parsed.field] - a[parsed.field]);
      const topItems = sorted.slice(0, parsed.limit);
      result = topItems;
      message = `أفضل ${parsed.limit} عناصر حسب ${getFieldName(parsed.field)}:`;
      visualization = {
        type: 'bar',
        title: `أفضل ${parsed.limit} حسب ${getFieldName(parsed.field)}`,
        data: topItems.map((item, i) => ({
          الترتيب: i + 1,
          العنصر: item.month || item.product || item.category || `عنصر ${i + 1}`,
          القيمة: item[parsed.field],
        })),
        columns: ['الترتيب', 'العنصر', 'القيمة'],
      };
      break;

    default:
      result = data;
      message = 'إليك ملخص البيانات:';
      visualization = {
        type: 'table',
        title: 'ملخص البيانات',
        data: data.slice(0, 10),
        columns: Object.keys(data[0] || {}),
      };
  }

  return {
    message,
    visualization,
    sqlQuery: generateSQLFromQuery(query, Object.keys(data[0] || {})),
    insights: generateInsights(result, parsed),
  };
}

function groupDataByField(data: any[], field: string, valueField: string): any[] {
  const grouped: { [key: string]: number } = {};

  data.forEach(item => {
    const key = item[field] || 'غير محدد';
    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += item[valueField] || 0;
  });

  return Object.entries(grouped).map(([key, value]) => ({
    [field]: key,
    [valueField]: value,
  }));
}

function getFieldName(field: string | undefined): string {
  const names: { [key: string]: string } = {
    sales: 'المبيعات',
    profit: 'الأرباح',
    customers: 'العملاء',
    month: 'الشهر',
    product: 'المنتج',
    category: 'الفئة',
    period: 'الفترة',
  };
  return names[field || ''] || field;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString('ar-SA');
}

function generateInsights(result: any, parsed: ParsedQuery): string[] {
  const insights: string[] = [];

  if (parsed.intent === 'group_by') {
    const values = Object.values(result).filter((v: any) => typeof v === 'number');
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;

    insights.push(`متوسط ${getFieldName(parsed.field)}: ${formatNumber(avg)}`);
    insights.push(`أعلى قيمة: ${formatNumber(max)} - أقل قيمة: ${formatNumber(min)}`);
    insights.push(`نسبة الفرق: ${formatNumber(((max - min) / min) * 100)}%`);
  }

  if (parsed.intent === 'trend' && result.length > 1) {
    const first = result[0][parsed.field];
    const last = result[result.length - 1][parsed.field];
    const change = ((last - first) / first) * 100;
    insights.push(`التغير الكلي: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
  }

  return insights;
}
