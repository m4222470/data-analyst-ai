import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  File,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Loader2,
  Table,
  Trash2,
  Eye,
  FileText,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const FileUpload: React.FC = () => {
  const { files, currentFile, isLoading, error: dataError, uploadFile, selectFile, deleteFile } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    setSuccess(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const progress = ((i + 1) / fileList.length) * 100;
      setUploadProgress(progress);

      try {
        const uploadedFile = await uploadFile(file);

        // Get file details for preview
        try {
          const details = await api.getFileDetails(uploadedFile.id);
          if (details.columns && details.columns.length > 0) {
            setPreviewData(details.preview || []);
          }
        } catch (previewErr) {
          console.log('Could not load preview');
        }

        setSuccess(`تم رفع "${uploadedFile.filename}" بنجاح!`);
        selectFile(uploadedFile.id);
      } catch (err: any) {
        setError(err.message || `فشل في رفع الملف: ${file.name}`);
      }
    }

    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFile = async (fileId: string) => {
    selectFile(fileId);

    // Load preview data
    try {
      const details = await api.getFileDetails(fileId);
      setPreviewData(details.preview || []);
    } catch {
      setPreviewData([]);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setPreviewData([]);
    } catch (err: any) {
      setError(err.message || 'فشل في حذف الملف');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const createSampleFile = () => {
    // Create sample CSV
    const sampleCSV = `المنتج,المبيعات,الكمية,المنطقة,التاريخ
منتج أ,5000,100,الشمال,2024-01-15
منتج ب,3500,75,الجنوب,2024-01-16
منتج ج,4200,90,الشرق,2024-01-17
منتج د,2800,60,الغرب,2024-01-18
منتج هـ,6100,130,الشمال,2024-01-19
منتج و,3900,85,الجنوب,2024-01-20
منتج ز,4500,95,الشرق,2024-01-21
منتج ح,3200,70,الغرب,2024-01-22`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], 'sample_data.csv', { type: 'text/csv' });
    handleFiles([file]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">رفع الملفات</h1>
        <p className="text-gray-400">ارفع ملفات CSV أو Excel أو JSON للتحليل الفوري</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <Check size={20} className="text-green-400 flex-shrink-0" />
          <p className="text-green-300">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="mr-auto text-green-400 hover:text-green-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {(error || dataError) && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <p className="text-red-300">{error || dataError}</p>
          <button
            onClick={() => setError(null)}
            className="mr-auto text-red-400 hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragging ? 'bg-blue-500/20 scale-110' : 'bg-gray-800'
            }`}
          >
            <Upload
              size={32}
              className={isDragging ? 'text-blue-400' : 'text-gray-400'}
            />
          </div>
          <div>
            <p className="text-lg font-medium mb-2">
              اسحب الملفات هنا أو{' '}
              <span className="text-blue-400 hover:text-blue-300">اضغط للتصفح</span>
            </p>
            <p className="text-sm text-gray-500">
              دعم الملفات: CSV, Excel (.xlsx, .xls), JSON
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={16} className="animate-spin text-blue-400" />
              <span className="text-sm text-gray-400">جاري معالجة الملف...</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sample CSV Generator */}
      <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="font-medium">اختبار بدون بيانات؟</p>
              <p className="text-sm text-gray-400">أنشئ ملف CSV تجريبي للاختبار</p>
            </div>
          </div>
          <button
            onClick={createSampleFile}
            disabled={uploading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors"
          >
            إنشاء ملف تجريبي
          </button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            الملفات المحملة ({files.length})
          </h2>
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border transition-all cursor-pointer ${
                  currentFile?.id === file.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => handleSelectFile(file.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet size={28} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{file.filename}</p>
                      {currentFile?.id === file.id && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          مُحدد للتحليل
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        file.file_type === 'csv' ? 'bg-green-500/20 text-green-400' :
                        file.file_type === 'excel' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {file.file_type?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(file.size || 0)} • {file.row_count?.toLocaleString() || 'N/A'} صف • {file.column_count || 0} أعمدة
                    </p>
                    {file.columns && file.columns.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {file.columns.slice(0, 6).map((col, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                            {col}
                          </span>
                        ))}
                        {file.columns.length > 6 && (
                          <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">
                            +{file.columns.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFile(file.id);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors"
                      title="معاينة"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Preview Data */}
                {currentFile?.id === file.id && previewData.length > 0 && file.columns && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                    <p className="text-sm font-medium mb-3 text-gray-400">معاينة البيانات (أول {previewData.length} صفوف):</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {file.columns.map((col, i) => (
                              <th key={i} className="text-right py-2 px-3 font-medium text-gray-400 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, i) => (
                            <tr key={i} className="border-b border-gray-700/50">
                              {file.columns.map((col, j) => (
                                <td key={j} className="py-2 px-3 whitespace-nowrap">
                                  {typeof row[col] === 'number'
                                    ? row[col].toLocaleString()
                                    : String(row[col] || '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Button */}
          {currentFile && (
            <div className="mt-6 flex justify-center">
              <Link
                to="/chat"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-3"
              >
                <Table size={20} />
                ابدأ تحليل البيانات
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Files State */}
      {files.length === 0 && !uploading && (
        <div className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 mx-auto mb-4 flex items-center justify-center">
            <File size={32} className="text-gray-500" />
          </div>
          <h3 className="font-semibold mb-2">لا توجد ملفات</h3>
          <p className="text-gray-400 text-sm">
            ارفع ملف CSV أو Excel أو JSON للبدء في تحليل بياناتك
          </p>
        </div>
      )}

      {/* Supported Formats */}
      <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-semibold mb-4">تنسيقات الملفات المدعومة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <File size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-medium">CSV</p>
              <p className="text-xs text-gray-400">Comma Separated Values</p>
            </div>
            <Check size={18} className="text-green-400 mr-auto" />
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Excel (.xlsx)</p>
              <p className="text-xs text-gray-400">Microsoft Excel</p>
            </div>
            <Check size={18} className="text-green-400 mr-auto" />
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <File size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="font-medium">JSON</p>
              <p className="text-xs text-gray-400">JavaScript Object Notation</p>
            </div>
            <Check size={18} className="text-green-400 mr-auto" />
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-6 border border-blue-500/20">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-400" />
          نصائح مهمة لرفع الملفات
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            تأكد من أن الملف يحتوي على صف رأس (Header) واضح في الصف الأول
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            استخدم الترميز UTF-8 للملفات النصية لضمان عرض صحيح للعربية
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            تأكد من أن جميع الأعمدة لها أسماء فريدة
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            تجنب وجود صفوف فارغة في منتصف البيانات
          </li>
          <li className="flex items-start gap-2">
            <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            الملفات الكبيرة قد تستغرق وقتاً أطول للمعالجة
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
