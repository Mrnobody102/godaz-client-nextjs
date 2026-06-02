'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: string;
              size: string;
              width: number;
              text: string;
            }
          ) => void;
        };
      };
    };
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const t = useTranslations('auth');
  const { login, loginWithGoogle, register } = useAuth();
  const previousTitleRef = useRef<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isOpen) {
      if (!previousTitleRef.current) {
        previousTitleRef.current = document.title;
      }

      const titlePrefix = mode === 'login' ? t('login') : t('register');
      document.title = `${titlePrefix} | goDaz`;
    } else if (previousTitleRef.current) {
      document.title = previousTitleRef.current;
      previousTitleRef.current = null;
    }
  }, [isOpen, mode, t]);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const success = await login(email, password);
        if (success) {
          handleClose();
        } else {
          setError(t('errors.invalid_credentials'));
        }
      } else {
        // Validate registration
        if (!name.trim()) {
          setError(t('errors.required_name'));
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError(t('errors.password_too_short'));
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t('errors.password_mismatch'));
          setIsLoading(false);
          return;
        }

        const success = await register(name, email, password);
        if (success) {
          handleClose();
        } else {
          setError(t('errors.email_taken'));
        }
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError(t('errors.generic'));
        return;
      }

      setError('');
      setIsLoading(true);
      try {
        const success = await loginWithGoogle(response.credential);
        if (success) {
          handleClose();
        } else {
          setError(t('errors.generic'));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [handleClose, loginWithGoogle, t]
  );

  useEffect(() => {
    if (window.google) {
      setIsGoogleReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !googleClientId || !isGoogleReady || !window.google || !googleButtonRef.current) {
      return;
    }

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 352,
      text: mode === 'login' ? 'signin_with' : 'signup_with',
    });
  }, [googleClientId, handleGoogleCredential, isGoogleReady, isOpen, mode]);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <>
      {googleClientId && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setIsGoogleReady(true)}
          onReady={() => setIsGoogleReady(true)}
        />
      )}

      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      ></div>

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6 overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-[100] flex flex-col items-center justify-center backdrop-blur-[2px] transition-all">
            <Loader2 className="w-10 h-10 animate-spin text-amber-900 mb-3" />
            <span className="text-amber-900 font-medium text-lg">{t('processing')}...</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-gray-900">
            {mode === 'login' ? t('login') : t('register')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm mb-2 text-gray-700"
              >
                {t('labels.name')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  placeholder={t('placeholders.name')}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
              {t('labels.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                placeholder={t('placeholders.email')}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm mb-2 text-gray-700"
            >
              {t('labels.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                placeholder={t('placeholders.password')}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-2 text-gray-700"
              >
                {t('labels.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                  placeholder={t('placeholders.password')}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? t('processing')
              : mode === 'login'
                ? t('login')
                : t('register')}
          </button>
        </form>

        {googleClientId && (
          <div className="mt-5">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  {t('continue_with')}
                </span>
              </div>
            </div>
            <div className="flex justify-center" ref={googleButtonRef} />
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login'
              ? t('actions.prompt_no_account')
              : t('actions.prompt_have_account')}{' '}
            <button
              onClick={switchMode}
              className="text-amber-900 hover:text-amber-800 transition"
            >
              {mode === 'login'
                ? t('actions.signup_now')
                : t('actions.login_now')}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
