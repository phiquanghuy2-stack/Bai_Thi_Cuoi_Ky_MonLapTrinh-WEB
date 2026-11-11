import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';
import BrandLogo from '../../components/common/BrandLogo';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (values) => {
    const nextErrors = {};
    if (!values.email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!values.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (values.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }
    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(formData.email, formData.password);
      const homePath = loggedUser.role === 'admin' ? '/admin' : '/tenant';
      const fromPath = location.state?.from?.pathname;
      navigate(fromPath?.startsWith(homePath) ? fromPath : `${homePath}/dashboard`, { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
            Đăng nhập hệ thống
          </span>
          <BrandLogo to="/" size="sm" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2 pb-2 border-b border-neutral-100">
            <img
              src="/hva-logo.jpg"
              alt="HVA HOMESTAY"
              className="h-32 mx-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-xl font-extrabold text-[#222222]">
              Chào mừng bạn về với HVA HOMESTAY
            </h1>
            <p className="text-xs font-serif italic text-neutral-500">
              “Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.”
            </p>
          </div>

          <AlertBanner
            type="error"
            message={serverError}
            onClose={() => setServerError('')}
          />

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputField
              label="Địa chỉ Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@nhatro.vn"
              error={errors.email}
              icon={Mail}
              required
            />

            <InputField
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              icon={Lock}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting}>
              Tiếp tục đăng nhập
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Nút điền nhanh tài khoản Demo */}
          <div className="pt-5 border-t border-neutral-200 space-y-3">
            <p className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#FA5252]" />
              Tài khoản mẫu kiểm thử nhanh (Nhấn để điền):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@nhatro.vn', 'password123')}
                className="text-left p-3 rounded-2xl border border-neutral-200 hover:border-[#FA5252] bg-neutral-50 transition-all"
              >
                <span className="text-[10px] font-extrabold uppercase text-[#FA5252] block">
                  Chủ trọ (Admin)
                </span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5 truncate">
                  admin@nhatro.vn
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('huong@gmail.com', 'password123')}
                className="text-left p-3 rounded-2xl border border-neutral-200 hover:border-[#FA5252] bg-neutral-50 transition-all"
              >
                <span className="text-[10px] font-extrabold uppercase text-rose-600 block">
                  Cư dân P102 (Đang nợ)
                </span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5 truncate">
                  huong@gmail.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('tuan@gmail.com', 'password123')}
                className="text-left p-3 rounded-2xl border border-neutral-200 hover:border-[#FA5252] bg-neutral-50 transition-all"
              >
                <span className="text-[10px] font-extrabold uppercase text-emerald-600 block">
                  Cư dân P101
                </span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5 truncate">
                  tuan@gmail.com
                </span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-500">
            Chưa có tài khoản cư dân?{' '}
            <Link to="/register" className="font-bold text-[#FA5252] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
