
import React, { useState, useEffect } from 'react';

interface CastButtonProps {
  className?: string;
  showLabel?: boolean;
}

const CastButton: React.FC<CastButtonProps> = ({ className = "", showLabel = true }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check support but don't hide component solely based on this immediately
    if (navigator.presentation && window.PresentationRequest) {
      setIsSupported(true);
      if (navigator.presentation.defaultRequest) {
          // This allows reconnecting to an existing session if configured
      }
    }
  }, []);

  const handleCast = async () => {
    // If explicit support check fails, try anyway or alert user
    if (!navigator.presentation || !window.PresentationRequest) {
      alert("خاصية البث المباشر عبر المتصفح غير مدعومة بالكامل على هذا الجهاز. يرجى استخدام خيار 'بث الشاشة' من إعدادات الهاتف أو استخدام متصفح Chrome على الكمبيوتر.");
      return;
    }

    try {
      const request = new window.PresentationRequest([window.location.href]);
      const connection = await request.start();
      
      setIsConnected(true);

      connection.addEventListener('connect', () => {
        setIsConnected(true);
      });

      connection.addEventListener('close', () => {
        setIsConnected(false);
      });

      connection.addEventListener('terminate', () => {
        setIsConnected(false);
      });

    } catch (error) {
      console.log('User cancelled or cast failed', error);
    }
  };

  // Removed the early return null to ensure button is always visible as requested
  
  return (
    <button
      onClick={handleCast}
      className={`flex items-center gap-2 px-3 py-2 md:px-4 rounded-full font-bold transition-all shadow-md active:scale-95 ${
        isConnected 
          ? 'bg-green-500 text-white border-2 border-green-600 shadow-green-500/30' 
          : 'bg-slate-800 text-slate-200 border-2 border-slate-700 hover:bg-slate-700'
      } ${className}`}
      title="بث الشاشة على التلفزيون"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`w-4 h-4 md:w-5 md:h-5 ${isConnected ? 'animate-pulse' : ''}`}
      >
        <path d="M2 5a1 1 0 0 1 1-1h11.5a1 1 0 0 1 0 2H3v10a1 1 0 0 1-2 0V5Zm18 13H18a1 1 0 0 0 0 2h2a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2a1 1 0 0 0 2 0V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1ZM3 14a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1 4 4 0 0 0 4-4 1 1 0 0 0-1-1H3Zm1.5-3A6.5 6.5 0 0 1 11 17.5a1 1 0 0 1-2 0 4.5 4.5 0 0 0-4.5-4.5 1 1 0 0 1 0-2Zm0-3A9.5 9.5 0 0 1 14 17.5a1 1 0 0 1-2 0 7.5 7.5 0 0 0-7.5-7.5 1 1 0 0 1 0-2Z"/>
      </svg>
      {showLabel && (
        <span className="text-xs md:text-sm hidden sm:inline">
          {isConnected ? 'متصل' : 'بث'}
        </span>
      )}
    </button>
  );
};

export default CastButton;
