import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-900 mb-4">
          Ogah Ribetzz
        </div>
        <p className="text-gray-500 text-center max-w-md mb-8">
          Rumit itu cuma alasan. Mari berbagi dengan cara yang paling sederhana dan berdampak.
        </p>
        <div className="text-sm text-gray-400 flex items-center gap-1">
          &copy; {new Date().getFullYear()} Ogah Ribetzz Foundation. Made with <Heart size={12} className="text-red-500 fill-current" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;