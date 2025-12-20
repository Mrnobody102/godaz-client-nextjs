import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center">
                TM
              </div>
              <span>Thủ Công Mỹ Nghệ</span>
            </div>
            <p className="text-gray-400">
              Chuyên cung cấp các sản phẩm thủ công mỹ nghệ truyền thống, làm thủ công 100%.
            </p>
          </div>

          <div id="about">
            <h3 className="mb-4">Về Chúng Tôi</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Giới Thiệu
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Dịch Vụ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Chính Sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Đối Tác
                </a>
              </li>
            </ul>
          </div>

          <div id="contact">
            <h3 className="mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>contact@thucongmynghe.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Thủ Công Mỹ Nghệ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
