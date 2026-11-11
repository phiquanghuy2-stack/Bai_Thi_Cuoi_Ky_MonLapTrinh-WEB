import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';
import BrandLogo from '../../components/common/BrandLogo';

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
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });
      navigate('/tenant/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Đăng ký tài khoản thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo to="/" size="md" />
          </div>
          <h1 className="text-xl font-extrabold text-[#222222] pt-1">
            Đăng ký cư dân HVA HOMESTAY
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
            placeholder="nguyenvana@gmail.com"
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

          <Button type="submit" variant="primary" className="w-full" loading={submitting}>
            Đăng ký tài khoản HVA HOMESTAY
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Đã có tài khoản cư dân?{' '}
          <Link to="/login" className="font-bold text-[#FF385C] hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
