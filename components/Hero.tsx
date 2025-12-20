'use client';

import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      id="home"
      className="relative h-[600px] flex items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1762186540868-a7f3328c161d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGNyYWZ0JTIwd29ya3Nob3B8ZW58MXx8fHwxNzY2MjM3NDgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 font-light">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#products"
            className="bg-amber-900 hover:bg-amber-800 text-white px-8 py-3 rounded-lg transition font-medium"
          >
            {t('ctas.view_products')}
          </a>
          <a
            href="#contact"
            className="bg-white hover:bg-gray-100 text-amber-900 px-8 py-3 rounded-lg transition font-medium"
          >
            {t('ctas.contact')}
          </a>
        </div>
      </div>
    </section>
  );
}
