import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';
import BrandLogo from '../../components/common/BrandLogo';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/tenant/dashboard', { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      setServerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              Đăng nhập
            </span>
            <BrandLogo to="/" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#222222]">
                Chào mừng bạn!
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Hệ thống quản lý phòng trọ, hợp đồng &amp; hóa đơn điện
              </p>
            </div>

            {serverError && (
              <AlertBanner
                type="error"
                message={serverError}
                onClose={() => setServerError('')}
              />
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <InputField
                label="Địa chỉ Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                error={errors.email}
                icon={Mail}
                required
                autoFocus
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={submitting}
                disabled={submitting}
              >
                Đăng nhập
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <p className="text-xs text-neutral-600 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Hãy kiểm tra email và mật khẩu của bạn</span>
              </p>
              <p className="text-center text-xs text-neutral-500">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-bold text-[#FF385C] hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-4">
          Liên hệ quản trị viên nếu bạn gặp sự cố đăng nhập
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
