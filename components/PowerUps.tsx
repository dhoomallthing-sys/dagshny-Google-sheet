
import React from 'react';

interface PowerUpsProps {
  counts: {
    doublePoints: number;
    noPenalty: number;
    twoAnswers: number;
  };
  onUse: (type: 'doublePoints' | 'noPenalty' | 'twoAnswers') => void;
  activePowerUp: string | null;
  disabled?: boolean;
}

const PowerUps: React.FC<PowerUpsProps> = ({ counts, onUse, activePowerUp, disabled }) => {
  return (
    <div className="flex gap-4 justify-center items-center py-4 bg-slate-900/50 rounded-xl px-6 border border-slate-700">
      <div className="text-slate-400 font-bold ml-4">الوسائل المساعدة:</div>
      
      <button
        onClick={() => onUse('doublePoints')}
        disabled={disabled || counts.doublePoints === 0 || !!activePowerUp}
        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
          activePowerUp === 'doublePoints' ? 'bg-yellow-500 text-black' : 'bg-slate-800 hover:bg-slate-700'
        } ${counts.doublePoints === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <span className="text-xs">دبل نقاط</span>
        <span className="text-lg font-bold">×{counts.doublePoints}</span>
      </button>

      <button
        onClick={() => onUse('noPenalty')}
        disabled={disabled || counts.noPenalty === 0 || !!activePowerUp}
        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
          activePowerUp === 'noPenalty' ? 'bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700'
        } ${counts.noPenalty === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <span className="text-xs">منع الخصم</span>
        <span className="text-lg font-bold">×{counts.noPenalty}</span>
      </button>

      <button
        onClick={() => onUse('twoAnswers')}
        disabled={disabled || counts.twoAnswers === 0 || !!activePowerUp}
        className={`flex flex-col items-center p-2 rounded-lg transition-all ${
          activePowerUp === 'twoAnswers' ? 'bg-purple-500 text-white' : 'bg-slate-800 hover:bg-slate-700'
        } ${counts.twoAnswers === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <span className="text-xs">إجابتين</span>
        <span className="text-lg font-bold">×{counts.twoAnswers}</span>
      </button>
    </div>
  );
};

export default PowerUps;
