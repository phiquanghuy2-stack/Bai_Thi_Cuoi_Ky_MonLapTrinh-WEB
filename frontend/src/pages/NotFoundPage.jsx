import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertOctagon } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-[#FA5252] flex items-center justify-center mb-4">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-neutral-900">404</h1>
      <p className="text-lg font-bold text-neutral-700 mt-1">
        Không tìm thấy trang yêu cầu
      </p>
      <p className="text-sm text-neutral-500 mt-1 max-w-md">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="primary">
          <Home className="w-4 h-4" />
          Về Trang Chủ HVA HOMESTAY
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
