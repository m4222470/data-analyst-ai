import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  Star,
  Building2,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { subscriptionPlans } from '../lib/constants';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">خطط الاشتراك</h1>
        <p className="text-gray-400 mb-8">
          اختر الخطة المناسبة لاحتياجاتك وابدأ بتحليل بياناتك اليوم
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 bg-gray-900/50 p-1 rounded-xl max-w-sm mx-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            سنوي
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan, index) => {
          const isPopular = plan.id === 'pro';
          const price =
            billingCycle === 'yearly'
              ? Math.round(plan.price * 0.8)
              : plan.price;

          return (
            <div
              key={plan.id}
              className={`relative bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 ${
                isPopular
                  ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium flex items-center gap-2">
                    <Star size={14} />
                    الأكثر شعبية
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    isPopular
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                      : 'bg-gray-800'
                  }`}
                >
                  {plan.id === 'free' ? (
                    <Zap size={24} className="text-gray-400" />
                  ) : plan.id === 'pro' ? (
                    <Star size={24} className="text-white" />
                  ) : (
                    <Building2 size={24} className="text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">
                    {price === 0 ? 'مجاناً' : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-gray-400 text-sm">
                      /{billingCycle === 'yearly' ? 'شهر' : 'شهر'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && price > 0 && (
                  <p className="text-sm text-green-400 mt-1">
                    وفر ${plan.price * 12 - price * 12}/سنة
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isPopular ? 'bg-blue-500/20' : 'bg-gray-800'
                      }`}
                    >
                      <Check
                        size={12}
                        className={isPopular ? 'text-blue-400' : 'text-gray-400'}
                      />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  isPopular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                {plan.id === 'free' ? (
                  <>ابدأ مجاناً</>
                ) : (
                  <>
                    <CreditCard size={18} />
                    اشترك الآن
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise Section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl p-8 border border-purple-500/20 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">حلول مخصصة للشركات</h3>
              <p className="text-gray-400">
                هل تحتاج حلول مخصصة لفريقك أو مؤسستك؟
              </p>
            </div>
          </div>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors flex items-center gap-2">
            تواصل معنا
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          أسئلة شائعة
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'هل يمكنني تغيير خطتي لاحقاً؟',
              a: 'نعم، يمكنك ترقية أو تخفيض خطتك في أي وقت. التغييرات تسري فوراً.',
            },
            {
              q: 'ما هي طرق الدفع المتاحة؟',
              a: 'نقبل جميع البطاقات الائتمانية الرئيسية، PayPal، والتحويل البنكي للفترات السنوية.',
            },
            {
              q: 'هل هناك فترة تجربة مجانية؟',
              a: 'نعم! الخطة المجانية متاحة دائماً، وبإمكانك تجربة الخطة الاحترافية مجاناً لمدة 14 يوماً.',
            },
            {
              q: 'كيف يتم حساب الاستعلامات؟',
              a: 'كل سؤال تطرحه على المحادثة الذكية يُحتسب كاستعلام واحد، بغض النظر عن حجم النتائج.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
            >
              <h4 className="font-semibold mb-2">{faq.q}</h4>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-400 mb-4">
          جاهز للبدء؟ لا تحتاج بطاقة ائتمان للبدء
        </p>
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
        >
          <Zap size={20} />
          جرب مجاناً الآن
        </Link>
      </div>
    </div>
  );
};

export default Pricing;
