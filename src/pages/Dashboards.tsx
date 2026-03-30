import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  FileUp,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { getCurrentFile, hasApiKey } from '../lib/api-service';

const Dashboards: React.FC = () => {
  const currentFile = getCurrentFile();
  const apiConnected = hasApiKey();

  const hasData = !!currentFile;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">لوحات التحكم</h1>
          <p className="text-gray-400">إنشاء وإدارة تقارير مخصصة لبياناتك</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">ملف البيانات</p>
              <p className="text-2xl font-bold">{currentFile ? currentFile.name : 'غير محمل'}</p>
              {currentFile && (
                <p className="text-sm text-gray-400">{currentFile.rows.toLocaleString()} صف</p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              hasData ? 'bg-green-500/20' : 'bg-gray-700/50'
            }`}>
              <FileUp size={24} className={hasData ? 'text-green-400' : 'text-gray-500'} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">مفتاح API</p>
              <p className="text-2xl font-bold">{apiConnected ? 'مُفعّل' : 'غير مُفعّل'}</p>
              <p className="text-sm text-gray-400">OpenAI API</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              apiConnected ? 'bg-purple-500/20' : 'bg-gray-700/50'
            }`}>
              <MessageSquare size={24} className={apiConnected ? 'text-purple-400' : 'text-gray-500'} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">الأعمدة</p>
              <p className="text-2xl font-bold">{currentFile ? currentFile.columns.length : 0}</p>
              {currentFile && (
                <p className="text-sm text-gray-400">متاح للتحليل</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - Guide */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-3">كيفية إنشاء التقارير</h2>
          <p className="text-gray-400 mb-8">
            لإنشاء تقارير ولوحات تحكم مخصصة لبياناتك، اتبع هذه الخطوات البسيطة:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-blue-400">
                1
              </div>
              <h3 className="font-semibold mb-2">رفع البيانات</h3>
              <p className="text-sm text-gray-400">
                ارفع ملف CSV من صفحة رفع الملفات
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-purple-400">
                2
              </div>
              <h3 className="font-semibold mb-2">إضافة مفتاح API</h3>
              <p className="text-sm text-gray-400">
                أدخل مفتاح OpenAI من الإعدادات
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-green-400">
                3
              </div>
              <h3 className="font-semibold mb-2">اسأل بالعامية</h3>
              <p className="text-sm text-gray-400">
                اكتب طلبك في المحادثة الذكية
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!hasData && (
              <Link
                to="/upload"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FileUp size={18} />
                رفع البيانات
              </Link>
            )}
            {!apiConnected && (
              <Link
                to="/settings"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                إضافة مفتاح API
              </Link>
            )}
            {hasData && apiConnected && (
              <Link
                to="/chat"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                ابدأ التحليل الآن
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Current File Columns */}
      {currentFile && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">أعمدة البيانات المتاحة</h3>
          <div className="flex flex-wrap gap-2">
            {currentFile.columns.map((col, i) => (
              <span
                key={i}
                className="px-3 py-2 bg-gray-800/50 rounded-lg text-sm text-gray-300"
              >
                {col}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            يمكنك استخدام هذه الأعمدة في أسئلتك. مثال: "ما مجموع {currentFile.columns[0]} لكل {currentFile.columns[1]}؟"
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-400" />
          نصائح للحصول على أفضل النتائج
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
            <span className="text-purple-400 font-bold">•</span>
            <p>اسأل عن ملخص عام لبياناتك أولاً لفهم محتواها</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
            <span className="text-blue-400 font-bold">•</span>
            <p>اطلب مقارنة بين المجموعات مثل "قارن المبيعات بين المناطق"</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
            <span className="text-green-400 font-bold">•</span>
            <p>اسأل عن الاتجاهات مثل "ما اتجاه المبيعات عبر الأشهر؟"</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-xl">
            <span className="text-yellow-400 font-bold">•</span>
            <p>اطلب تحديد القيم القصوى والدنيا "ما أعلى وأقل قيمة في عمود المبيعات؟"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboards;
