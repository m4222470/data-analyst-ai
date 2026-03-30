import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileUp,
  MessageSquare,
  BarChart3,
  Key,
  Zap,
  AlertCircle,
  Check,
  Database,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentFile, files, isLoading: dataLoading } = useData();

  const hasFile = !!currentFile;
  const hasApiKey = !!user?.openai_api_key;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{getGreeting()} 👋</h1>
        <p className="text-gray-400">
          مرحباً <span className="text-blue-400">{user?.username || 'مستخدم'}</span> - أداة تحليل البيانات بالذكاء الاصطناعي
        </p>
      </div>

      {/* Setup Status */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">حالة الإعداد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API Key Status */}
          <div className={`p-4 rounded-xl border ${hasApiKey ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasApiKey ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                {hasApiKey ? <Check size={20} className="text-green-400" /> : <Key size={20} className="text-yellow-400" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${hasApiKey ? 'text-green-400' : 'text-yellow-400'}`}>
                  {hasApiKey ? 'مفتاح API مُفعّل' : 'مفتاح API غير مُفعّل'}
                </p>
                <p className="text-sm text-gray-400">
                  {hasApiKey ? 'يمكنك استخدام المحادثة الذكية' : 'أضف مفتاح API من الإعدادات'}
                </p>
              </div>
            </div>
          </div>

          {/* File Status */}
          <div className={`p-4 rounded-xl border ${hasFile ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasFile ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                {hasFile ? <Check size={20} className="text-green-400" /> : <FileUp size={20} className="text-blue-400" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${hasFile ? 'text-green-400' : 'text-blue-400'}`}>
                  {hasFile ? 'ملف بيانات محمّل' : 'لا توجد بيانات'}
                </p>
                <p className="text-sm text-gray-400">
                  {hasFile ? 'ملفك جاهز للتحليل' : 'ارفع ملف CSV للبدء'}
                </p>
              </div>
            </div>
          </div>

          {/* Files Count */}
          <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/20">
                <Database size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-400">
                  {dataLoading ? '...' : files.length}
                </p>
                <p className="text-sm text-gray-400">
                  ملف مرفوع
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/upload"
            className="group bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp size={28} className="text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">رفع ملف جديد</h3>
            <p className="text-gray-400 text-sm">CSV, Excel, JSON للتحليل الفوري</p>
          </Link>

          <Link
            to="/chat"
            className="group bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">المحادثة الذكية</h3>
            <p className="text-gray-400 text-sm">اسأل عن بياناتك بلغة طبيعية</p>
          </Link>

          <Link
            to="/dashboards"
            className="group bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800 hover:border-gray-700 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 size={28} className="text-green-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">التقارير</h3>
            <p className="text-gray-400 text-sm">عرض التقارير المحفوظة</p>
          </Link>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-blue-400" />
          كيف تستخدم الأداة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-blue-400">
              1
            </div>
            <h3 className="font-medium mb-2">رفع البيانات</h3>
            <p className="text-sm text-gray-400">
              ارفع ملف CSV أو Excel أو JSON
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-purple-400">
              2
            </div>
            <h3 className="font-medium mb-2">تحليل بالذكاء الاصطناعي</h3>
            <p className="text-sm text-gray-400">
              أضف مفتاح OpenAI أو استخدم المفتاح المدمج
            </p>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-green-400">
              3
            </div>
            <h3 className="font-medium mb-2">اسأل وتحلل</h3>
            <p className="text-sm text-gray-400">
              اكتب أسئلتك بالعربية لتحصل على تحليلات فورية
            </p>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      {(!hasApiKey || !hasFile) && (
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-blue-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">ابدأ الآن</h3>
                <p className="text-gray-400">
                  رتب الأداة وستتمكن من تحليل بياناتك فوراً
                </p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {!hasFile && (
                <Link
                  to="/upload"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <FileUp size={18} />
                  رفع البيانات
                </Link>
              )}
              {!hasApiKey && (
                <Link
                  to="/settings"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <Key size={18} />
                  إضافة API
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Current File Info */}
      {currentFile && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">الملف الحالي</h2>
            <Link
              to="/chat"
              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors"
            >
              ابدأ التحليل
            </Link>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <FileUp size={24} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{currentFile.filename}</p>
                <p className="text-sm text-gray-400">
                  {currentFile.row_count?.toLocaleString() || 'N/A'} صف | {currentFile.column_count || 0} أعمدة
                </p>
              </div>
              <div className="text-left">
                <span className={`px-2 py-1 rounded text-xs ${
                  currentFile.file_type === 'csv' ? 'bg-green-500/20 text-green-400' :
                  currentFile.file_type === 'excel' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {currentFile.file_type?.toUpperCase()}
                </span>
              </div>
            </div>
            {currentFile.columns && currentFile.columns.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {currentFile.columns.slice(0, 10).map((col: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                    {col}
                  </span>
                ))}
                {currentFile.columns.length > 10 && (
                  <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-500">
                    +{currentFile.columns.length - 10} أخرى
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Files */}
      {files.length > 1 && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">جميع الملفات</h2>
            <Link
              to="/upload"
              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors"
            >
              إضافة ملف
            </Link>
          </div>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 bg-gray-800/50 rounded-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileUp size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-sm text-gray-400">
                    {file.row_count?.toLocaleString() || 'N/A'} صف
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
