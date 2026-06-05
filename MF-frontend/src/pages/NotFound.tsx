import { useNavigate } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-ambient-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>

        <h1
          className="text-7xl font-bold text-[#001e40] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          404
        </h1>
        <h2
          className="text-xl font-bold text-[#121c28] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Page Not Found
        </h2>
        <p className="text-sm text-[#43474f] mb-8">
          यह पेज मौजूद नहीं है।<br />
          The page you're looking for doesn't exist.
        </p>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <Home className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
}
