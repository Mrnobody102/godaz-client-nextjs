'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center">
                TM
              </div>
              <span>{t('company')}</span>
            </div>
            <p className="text-gray-400">{t('description')}</p>
          </div>

          <div id="about">
            <h3 className="mb-4">{t('about.title')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/#about" className="hover:text-white transition">
                  {t('about.links.intro')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-white transition">
                  {t('about.links.services')}
                </Link>
              </li>
              <li>
                <Link href="/#policies" className="hover:text-white transition">
                  {t('about.links.policies')}
                </Link>
              </li>
              <li>
                <Link href="/#partners" className="hover:text-white transition">
                  {t('about.links.partners')}
                </Link>
              </li>
            </ul>
          </div>

          <div id="contact">
            <h3 className="mb-4">{t('contact.title')}</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>{t('contact.phone')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>{t('contact.email')}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{t('contact.address')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t('copyright', { year, company: t('company') })}</p>
        </div>
      </div>
    </footer>
  );
} 
