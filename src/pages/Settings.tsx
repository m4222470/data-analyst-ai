import React, { useState } from 'react';
import {
  User,
  Bell,
  Shield,
  Palette,
  Key,
  Save,
  Camera,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // API Key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: <User size={18} /> },
    { id: 'api', label: 'مفتاح API', icon: <Key size={18} /> },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'المظهر', icon: <Palette size={18} /> },
  ];

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile({
        username: profile.username,
        email: profile.email,
      });
      updateUser({ ...user!, username: profile.username, email: profile.email });
      setProfileSaved(true);
      setProfileError('');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'فشل في حفظ الملف الشخصي');
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setApiKeyError(true);
      return;
    }

    if (!apiKeyInput.startsWith('sk-')) {
      setApiKeyError(true);
      return;
    }

    try {
      await api.updateApiKey(apiKeyInput.trim());
      updateUser({ ...user!, openai_api_key: apiKeyInput.trim() });
      setApiKeySaved(true);
      setApiKeyError(false);
      setApiKeyInput('');
      setTimeout(() => setApiKeySaved(false), 3000);
    } catch (err: any) {
      setApiKeyError(true);
    }
  };

  const handleClearApiKey = async () => {
    try {
      await api.deleteApiKey();
      updateUser({ ...user!, openai_api_key: undefined });
    } catch (err) {
      console.error('Failed to delete API key');
    }
  };

  const hasApiKey = !!user?.openai_api_key;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">الإعدادات</h1>
        <p className="text-gray-400">إدارة حسابك وتفضيلاتك</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-lg font-semibold mb-6">الملف الشخصي</h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
                    {profile.username?.charAt(0) || 'م'}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors border border-gray-700">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{profile.username}</h3>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* Success Message */}
              {profileSaved && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-green-400">تم حفظ التغييرات بنجاح!</span>
                </div>
              )}

              {/* Error Message */}
              {profileError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <AlertCircle size={18} className="text-red-400" />
                  <span className="text-red-400">{profileError}</span>
                </div>
              )}

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Save size={18} />
                حفظ التغييرات
              </button>
            </div>
          )}

          {/* API Key Tab */}
          {activeTab === 'api' && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-lg font-semibold mb-2">مفتاح OpenAI API</h2>
              <p className="text-gray-400 text-sm mb-6">
                أدخل مفتاح API الخاص بك من OpenAI لتفعيل محادثة الذكاء الاصطناعي
              </p>

              {/* Success Message */}
              {apiKeySaved && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-green-400">تم حفظ مفتاح API بنجاح!</span>
                </div>
              )}

              {/* API Key Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">مفتاح API</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setApiKeyError(false);
                      }}
                      placeholder="sk-..."
                      className="w-full bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors pl-12"
                    />
                    <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {apiKeyError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle size={14} />
                      مفتاح API غير صالح. يجب أن يبدأ بـ sk-
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveApiKey}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Save size={18} />
                    حفظ المفتاح
                  </button>
                  {hasApiKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-xl font-medium hover:bg-red-600/30 transition-colors flex items-center gap-2 text-red-400"
                    >
                      <Trash2 size={18} />
                      حذف المفتاح
                    </button>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-400" />
                  معلومات مهمة
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    مفتاح API محفوظ بشكل آمن في حسابك
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    لا تشارك مفتاحك مع أي شخص آخر
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    يمكنك الحصول على مفتاح من{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      موقع OpenAI
                      <ExternalLink size={12} />
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500">•</span>
                    التكلفة تعتمد على استخدامك الشخصي لـ OpenAI
                  </li>
                </ul>
              </div>

              {/* Current Status */}
              <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">
                      {hasApiKey ? 'مفتاح API مُفعّل' : 'مفتاح API غير مُفعّل'}
                    </span>
                  </div>
                  {hasApiKey && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-400" />
                      <span className="text-sm text-gray-400">
                        {user?.openai_api_key?.substring(0, 8)}...{user?.openai_api_key?.substring(user.openai_api_key.length - 4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-lg font-semibold mb-6">الإشعارات</h2>
              <div className="space-y-6">
                {[
                  { label: 'إشعارات التحليلات', desc: 'نتائج التحليلات الجديدة', enabled: true },
                  { label: 'تقارير دورية', desc: 'ملخص أسبوعي لبياناتك', enabled: true },
                  { label: 'تنبيهات الاستخدام', desc: 'اقتراب من حد الاستعلامات', enabled: false },
                  { label: 'أخبار المنتج', desc: 'تحديثات وميزات جديدة', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-8">
              <h2 className="text-lg font-semibold mb-6">المظهر</h2>
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-4">السمة</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', label: 'داكن', color: 'bg-gray-900 border-2 border-blue-500' },
                      { id: 'light', label: 'فاتح', color: 'bg-gray-100 border-2 border-gray-300' },
                      { id: 'system', label: 'تلقائي', color: 'bg-gradient-to-r from-gray-900 to-gray-100 border-2 border-gray-500' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className="p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                      >
                        <div className={`w-full h-16 rounded-lg mb-3 ${theme.color}`} />
                        <p className="text-sm font-medium">{theme.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
