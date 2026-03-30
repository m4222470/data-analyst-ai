// Configuration and app constants (no sample data)

export const API_CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  DEFAULT_MODEL: 'gpt-4o-mini',

  // Application settings
  APP_NAME: 'Data Analyst AI',
  APP_VERSION: '1.0.0',

  // File upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_EXTENSIONS: ['.csv', '.xlsx', '.xls', '.json'],

  // API settings
  REQUEST_TIMEOUT: 60000, // 60 seconds
  MAX_RETRIES: 3,
};

export const subscriptionPlans = [
  {
    id: 'free',
    name: 'مجاني',
    price: 0,
    features: [
      'رفع ملف واحد (CSV/Excel)',
      '50 استعلام شهرياً',
      'جدول واحد',
      'دعم أساسي',
    ],
    limits: {
      maxFiles: 1,
      maxRows: 1000,
      maxQueries: 50,
      dashboards: 1,
    },
  },
  {
    id: 'pro',
    name: 'احترافي',
    price: 29,
    features: [
      '5 ملفات',
      '500 استعلام شهرياً',
      '10 جداول',
      'رسوم بيانية متقدمة',
      'تصدير التقارير',
      'دعم متقدم',
    ],
    limits: {
      maxFiles: 5,
      maxRows: 50000,
      maxQueries: 500,
      dashboards: 10,
    },
  },
  {
    id: 'enterprise',
    name: 'للشركات',
    price: 99,
    features: [
      'ملفات غير محدودة',
      'استعلامات غير محدودة',
      'جداول غير محدودة',
      'API access',
      'Multi-user',
      'دعم مخصص 24/7',
    ],
    limits: {
      maxFiles: -1,
      maxRows: -1,
      maxQueries: -1,
      dashboards: -1,
    },
  },
];

export const analysisExamples = [
  'كم مجموع المبيعات لكل شهر؟',
  'ما أكثر منتج مبيعاً؟',
  'ما متوسط الأرباح في 2024؟',
  'ما هو اتجاه المبيعات عبر الزمن؟',
  'قارن بين فئات المنتجات',
  'ما هي أفضل 5 عملاء؟',
];
