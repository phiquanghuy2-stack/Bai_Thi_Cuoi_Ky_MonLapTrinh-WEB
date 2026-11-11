import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = (values) => {
    const nextErrors = {};
    if (!values.name.trim()) {
      nextErrors.name = 'Vui lòng nhập họ và tên';
    }
    if (!values.email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Định dạng email không hợp lệ';
    }
    if (!values.phone.trim()) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{9,11}$/.test(values.phone.trim())) {
      nextErrors.phone = 'Số điện thoại phải từ 9 đến 11 chữ số';
    }
    if (!values.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (values.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      navigate('/tenant/dashboard', { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Đăng ký tài khoản thất bại!';
      setServerError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              Đăng ký tài khoản
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#222222]">
                Tạo tài khoản mới
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Quản lý hóa đơn, hợp đồng và yêu cầu sửa chữa trực tuyến
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
                label="Họ và tên"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                error={errors.name}
                icon={User}
                required
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                error={errors.email}
                icon={Mail}
                required
              />

              <InputField
                label="Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                error={errors.phone}
                icon={Phone}
                required
              />

              <InputField
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                error={errors.password}
                icon={Lock}
                required
              />

              <InputField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                error={errors.confirmPassword}
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
                Đăng ký tài khoản
              </Button>
            </form>

            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <p className="text-center text-xs text-neutral-500">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-bold text-[#FF385C] hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-4">
          Bằng cách đăng ký, bạn đồng ý với Điều khoản Dịch vụ
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
