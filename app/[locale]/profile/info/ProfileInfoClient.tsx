'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, User as UserIcon } from 'lucide-react';
import { updateProfile } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
  name: string;
  code: number;
}

interface Province extends Location {
  districts: District[];
}

interface District extends Location {
  wards: Ward[];
}

interface Ward extends Location {}

export default function ProfileInfoClient() {
  const locale = useLocale();
  const { user, updateSession, isLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      setFormData({
        phone: user.phone || '',
        province: user.province || '',
        district: user.district || '',
        ward: user.ward || '',
        detailAddress: user.detailAddress || '',
      });
    } else {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    let active = true;
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then((res) => res.json())
      .then((data) => {
        if (active) setProvinces(data);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (formData.province) {
      const p = provinces.find((p) => p.name === formData.province);
      if (active) {
        setDistricts(p ? p.districts : []);
        setWards([]);
      }
    } else {
      if (active) {
        setDistricts([]);
        setWards([]);
      }
    }
    return () => {
      active = false;
    };
  }, [formData.province, provinces]);

  useEffect(() => {
    let active = true;
    if (formData.district) {
      const d = districts.find((d) => d.name === formData.district);
      if (active) {
        setWards(d ? d.wards : []);
      }
    } else {
      if (active) {
        setWards([]);
      }
    }
    return () => {
      active = false;
    };
  }, [formData.district, districts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'province') {
        next.district = '';
        next.ward = '';
      } else if (name === 'district') {
        next.ward = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile(formData);
      updateSession(formData);
      toast.success(locale === 'vi' ? 'Cập nhật thành công!' : 'Profile updated!');
    } catch (error) {
      console.error(error);
      toast.error(locale === 'vi' ? 'Cập nhật thất bại' : 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header cartCount={0} onCartClick={() => {}} onAuthClick={() => {}} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'vi' ? 'Trở về Trang chủ' : 'Back to Home'}
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-900">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'vi' ? 'Thông tin cá nhân' : 'Profile Information'}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'vi' ? 'Họ và tên' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="098..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'vi' ? 'Tỉnh / Thành phố' : 'Province / City'}
                </label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, province: value, district: '', ward: '' }));
                  }}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white h-[50px]">
                    <SelectValue placeholder={locale === 'vi' ? 'Chọn Tỉnh / Thành phố' : 'Select Province'} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'vi' ? 'Quận / Huyện' : 'District'}
                </label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, district: value, ward: '' }));
                  }}
                  disabled={!formData.province}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white disabled:bg-gray-50 h-[50px]">
                    <SelectValue placeholder={locale === 'vi' ? 'Chọn Quận / Huyện' : 'Select District'} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'vi' ? 'Phường / Xã' : 'Ward'}
                </label>
                <Select
                  value={formData.ward}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, ward: value }));
                  }}
                  disabled={!formData.district}
                >
                  <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white disabled:bg-gray-50 h-[50px]">
                    <SelectValue placeholder={locale === 'vi' ? 'Chọn Phường / Xã' : 'Select Ward'} />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.code} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'vi' ? 'Địa chỉ chi tiết (Số nhà, đường...)' : 'Detailed Address'}
              </label>
              <input
                type="text"
                name="detailAddress"
                value={formData.detailAddress}
                onChange={handleChange}
                placeholder={locale === 'vi' ? 'Ví dụ: 123 Đường ABC' : 'e.g., 123 ABC Street'}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-amber-900 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition font-medium disabled:opacity-70"
              >
                <Save className="w-5 h-5" />
                {isUpdating ? (locale === 'vi' ? 'Đang lưu...' : 'Saving...') : (locale === 'vi' ? 'Lưu thông tin' : 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
