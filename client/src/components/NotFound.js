import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-700 p-4 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-xl text-white/90 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-white mb-8">
            But feel free to check out my other projects on{' '}
            <a 
              href="https://github.com/nerdyEther"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-gray-200"
            >
              GitHub
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
