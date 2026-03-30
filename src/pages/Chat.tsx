import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  FileUp,
  Key,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  visualization?: VisualizationData;
  timestamp: Date;
}

interface VisualizationData {
  type: 'bar' | 'line' | 'table';
  title: string;
  columns: string[];
  data: any[];
}

const VisualizationRenderer: React.FC<{ visualization: VisualizationData }> = ({
  visualization,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(visualization.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="font-medium text-sm">{visualization.title}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {copied ? (
            <Check size={14} className="text-green-400" />
          ) : (
            <Copy size={14} className="text-gray-400" />
          )}
        </button>
      </div>

      {visualization.type === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {visualization.columns.map((col, i) => (
                  <th
                    key={i}
                    className="text-right py-2 px-3 font-medium text-gray-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visualization.data.slice(0, 10).map((row, i) => (
                <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  {visualization.columns.map((col, j) => (
                    <td key={j} className="py-2 px-3">
                      {typeof row[col] === 'number'
                        ? row[col].toLocaleString('ar-SA')
                        : String(row[col] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : visualization.type === 'bar' ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visualization.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={visualization.columns[0]} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey={visualization.columns[1]} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : visualization.type === 'line' ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visualization.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={visualization.columns[0]} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey={visualization.columns[1]}
                stroke="#8B5CF6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
};

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { currentFile, files } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'مرحباً! أنا مساعدك الذكي في تحليل البيانات.\n\n' +
        'لاستخدامي:\n' +
        '1️⃣ ارفع ملف بيانات من صفحة "رفع الملفات"\n' +
        '2️⃣ أضف مفتاح API من صفحة "الإعدادات"\n' +
        '3️⃣ اسأل عن بياناتك بلغة طبيعية!\n\n' +
        'مثال: "كم مجموع المبيعات لكل شهر؟"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasApiKey = !!user?.openai_api_key;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check API key
    if (!hasApiKey) {
      setError('يرجى إضافة مفتاح API أولاً من صفحة الإعدادات');
      return;
    }

    if (!currentFile) {
      setError('يرجى رفع ملف بيانات أولاً من صفحة رفع الملفات');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const result = await api.analyzeQuery({
        query: input,
        file_id: currentFile.id,
      });

      let visualization: VisualizationData | undefined;

      if (result.visualization) {
        visualization = {
          type: result.visualization.type as 'bar' | 'line' | 'table',
          title: result.visualization.title || 'نتائج التحليل',
          columns: result.visualization.columns || [],
          data: result.visualization.data || [],
        };
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response || 'تم التحليل بنجاح!',
        visualization,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${err.message || 'خطأ غير معروف'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const analysisExamples = currentFile && hasApiKey
    ? [
        `ما ملخص بيانات "${currentFile.filename}"؟`,
        `أظهر لي توزيع ${currentFile.columns?.[0] || 'البيانات'}`,
        `قارن بين ${currentFile.columns?.[0] || 'العمود الأول'} و ${currentFile.columns?.[1] || 'العمود الثاني'}`,
        `ما أكبر/أصغر قيمة في عمود ${currentFile.columns?.[0] || 'البيانات'}؟`,
      ]
    : [
        'أظهر لي ملخص المبيعات',
        'ما اتجاه النمو عبر الأشهر؟',
        'قارن بين المنتجات',
        'ما أكثر الفئات مبيعاً؟',
      ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">المحادثة الذكية</h1>
        <p className="text-gray-400">اسأل عن بياناتك بأي طريقة تريدها</p>
      </div>

      {/* Status Alerts */}
      {!hasApiKey && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center gap-3">
          <Key size={20} className="text-yellow-400" />
          <div className="flex-1">
            <p className="font-medium text-yellow-400">مفتاح API غير مُضاف</p>
            <p className="text-sm text-gray-300">
              يرجى إضافة مفتاح API من{' '}
              <Link to="/settings" className="text-blue-400 hover:underline">
                صفحة الإعدادات
              </Link>
            </p>
          </div>
        </div>
      )}

      {!currentFile && (
        <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center gap-3">
          <FileUp size={20} className="text-blue-400" />
          <div className="flex-1">
            <p className="font-medium text-blue-400">لا توجد بيانات محملة</p>
            <p className="text-sm text-gray-300">
              ارفع ملف من{' '}
              <Link to="/upload" className="text-blue-400 hover:underline">
                صفحة رفع الملفات
              </Link>
              لتبدأ التحليل
            </p>
          </div>
        </div>
      )}

      {currentFile && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
          <p className="text-sm text-green-400">
            تم تحميل ملف: <span className="font-medium">{currentFile.filename}</span>
            {' | '}
            {currentFile.row_count?.toLocaleString() || 'N/A'} صف | {currentFile.column_count || 0} أعمدة
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-br from-purple-500 to-blue-600'
              }`}
            >
              {message.role === 'user' ? (
                <User size={18} />
              ) : (
                <Bot size={18} />
              )}
            </div>
            <div
              className={`flex-1 max-w-3xl ${
                message.role === 'user' ? 'text-left' : ''
              }`}
            >
              <div
                className={`rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'bg-gray-800/50 border border-gray-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.visualization && (
                  <VisualizationRenderer visualization={message.visualization} />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {message.timestamp.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 size={20} className="animate-spin text-purple-400" />
                <span className="text-gray-400">جاري التحليل باستخدام الذكاء الاصطناعي...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Examples */}
        {messages.length === 1 && (
          <div className="mt-8">
            <p className="text-sm text-gray-400 mb-4 text-center">
              {currentFile && hasApiKey
                ? 'جرب أحد هذه الأسئلة:'
                : 'أمثلة على الأسئلة:'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {analysisExamples.map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-sm hover:bg-gray-700/50 hover:border-gray-600 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-purple-400" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              currentFile && hasApiKey
                ? 'اكتب سؤالك هنا... مثال: ما مجموع المبيعات لكل شهر؟'
                : 'أضف ملف بيانات ومفتاح API أولاً'
            }
            disabled={!currentFile || !hasApiKey}
            className="flex-1 bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !currentFile || !hasApiKey}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
          >
            <Send size={18} />
            إرسال
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          يتم التحليل باستخدام الذكاء الاصطناعي • البيانات محفوظة بشكل آمن
        </p>
      </div>
    </div>
  );
};

export default Chat;
