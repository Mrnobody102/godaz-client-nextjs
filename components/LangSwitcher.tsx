'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LangSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  const toggle = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    // replace the first path segment (the locale)
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${next}`);
      return;
    }
    // if the first segment is a known locale, replace it
    const knownLocales = ['vi', 'en'];
    if (knownLocales.includes(segments[0])) {
      segments[0] = next;
    } else {
      segments.unshift(next);
    }

    router.push(`/${segments.join('/')}${window.location.search}`);
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 border rounded text-sm hover:bg-gray-100 transition"
      aria-label="Switch language"
    >
      {locale === 'vi' ? 'VI' : 'EN'}
    </button>
  );
}
