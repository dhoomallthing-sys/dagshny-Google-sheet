import React, { useState, useEffect, useRef } from 'react';
import { Question, PowerUpState } from '../types';

interface QuestionModalProps {
  question: Question;
  activePowerUps: (keyof PowerUpState)[];
  onAnswer: (correct: boolean, teamIndex: number) => void;
  teamNames: [string, string];
  currentTurn: number;
  currentTeamPowerUps: PowerUpState;
  onToggleTwoAnswers: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, activePowerUps, onAnswer, teamNames, currentTurn, currentTeamPowerUps, onToggleTwoAnswers
}) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio object
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2860/2860-preview.mp3');
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswerRevealed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswerRevealed) {
       // Play sound when time is up
       if (audioRef.current) {
         audioRef.current.volume = 0.5;
         audioRef.current.play().catch(e => console.log('Audio play failed', e));
       }
    }
  }, [timeLeft, isAnswerRevealed]);

  const resetTimer = () => setTimeLeft(60);

  const handleWinner = (teamIndex: number) => {
    onAnswer(true, teamIndex);
  };

  const handleNobody = () => {
    onAnswer(false, -1);
  };

  // Logic to determine which image to show based on state
  const currentImage = isAnswerRevealed ? question.answerImg : question.questionImg;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white p-4 md:p-6 animate-in zoom-in duration-300 overflow-y-auto">
      
      {/* Zoom Modal Overlay */}
      {isImageZoomed && currentImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-orange-500"
              onClick={() => setIsImageZoomed(false)}
            >
              ✕
            </button>
            <img 
              src={currentImage} 
              alt="Zoomed Question" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border-2 border-slate-700" 
            />
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-4 md:top-6 left-0 right-0 flex justify-between px-4 md:px-8 z-10">
        <div className="bg-orange-600 px-4 py-1.5 rounded-full font-black text-lg md:text-xl shadow-lg">
          {question.points} نقطة
        </div>
        
        {/* Power Ups Display in Modal - HIDDEN ON ANSWER SCREEN */}
        {!isAnswerRevealed && (
          <div className="flex gap-2">
            {/* Double Points - Show active or disabled */}
            <div className={`px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all border-2 text-sm md:text-base ${
              activePowerUps.includes('doublePoints') 
                ? 'bg-yellow-500 border-yellow-400 text-black animate-pulse scale-105' 
                : 'bg-slate-800 border-slate-700 text-slate-500 opacity-40 grayscale cursor-not-allowed'
            }`}>
               <span>🤑</span> 
               <span className="hidden md:inline">دبل نقاط</span>
            </div>

            {/* No Penalty - Show active or disabled */}
            <div className={`px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all border-2 text-sm md:text-base ${
              activePowerUps.includes('noPenalty')
                ? 'bg-blue-500 border-blue-400 text-white animate-pulse scale-105' 
                : 'bg-slate-800 border-slate-700 text-slate-500 opacity-40 grayscale cursor-not-allowed'
            }`}>
               <span>✋</span> 
               <span className="hidden md:inline">منع الخصم</span>
            </div>

            {/* Two Answers Button - Interactive */}
            <button
              onClick={onToggleTwoAnswers}
              disabled={currentTeamPowerUps.twoAnswers === 0}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all shadow-lg border-2 text-sm md:text-base ${
                activePowerUps.includes('twoAnswers')
                ? 'bg-purple-600 border-purple-400 text-white animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105' 
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
              } ${currentTeamPowerUps.twoAnswers === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              <span>✌️</span>
              <span className="hidden md:inline">إجابتين</span>
              {currentTeamPowerUps.twoAnswers > 0 && (
                <span className="bg-white text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {currentTeamPowerUps.twoAnswers}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="bg-slate-800 border border-slate-600 px-4 py-1.5 rounded-full font-bold text-slate-300 text-sm md:text-base">
          {question.category}
        </div>
      </div>

      {/* Timer (Only visible before answer is revealed) - Reduced Size */}
      {!isAnswerRevealed && (
        <div className="mb-2 md:mb-4 z-10 flex flex-col items-center gap-1 mt-12 md:mt-16">
           <div className={`text-5xl md:text-7xl font-black tabular-nums transition-colors ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
             {timeLeft}
           </div>
           <button 
             onClick={resetTimer}
             className="text-2xl md:text-3xl text-slate-400 hover:text-white transition-transform hover:rotate-180 duration-500 p-1"
             title="إعادة تعيين الوقت"
           >
             🔄
           </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl w-full text-center z-10 flex flex-col items-center gap-4 md:gap-5 mt-2">
        
        {/* --- QUESTION PHASE --- */}
        {!isAnswerRevealed && (
          <>
            {/* HINT DISPLAY */}
            {question.hint && (
              <div className="mb-2 px-6 py-2 border-2 border-orange-500 bg-orange-600/30 rounded-xl text-white font-bold text-xl md:text-2xl animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                ← {question.hint} →
              </div>
            )}

            {/* Question Image - Reduced Height */}
            {currentImage && (
              <div 
                onClick={() => setIsImageZoomed(true)}
                className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 transition-all duration-300 cursor-zoom-in hover:scale-[1.02] hover:border-orange-500 inline-block"
              >
                <img 
                  src={currentImage} 
                  alt="Visual Clue" 
                  className="max-w-full max-h-[25vh] md:max-h-[32vh] object-contain h-auto w-auto" 
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none">
                  🔍 اضغط للتكبير
                </div>
              </div>
            )}

            {/* Question Text - Reduced Font */}
            <h2 className="text-2xl md:text-4xl font-black leading-tight drop-shadow-2xl text-white">
              {question.question}
            </h2>

            <button 
              onClick={() => setIsAnswerRevealed(true)}
              className="mt-2 px-10 py-4 md:px-12 md:py-5 bg-white text-orange-600 rounded-full text-2xl md:text-3xl font-black shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all"
            >
              إظهـار الإجـابة
            </button>
          </>
        )}


        {/* --- ANSWER PHASE --- */}
        {isAnswerRevealed && (
          <div className="w-full animate-in slide-in-from-bottom-8 fade-in duration-500 flex flex-col items-center mt-12 md:mt-16">
            
            {/* Back To Question Button */}
            <button 
              onClick={() => setIsAnswerRevealed(false)}
              className="mb-4 px-5 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs md:text-sm font-bold border border-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
            >
              ⬆️ عودة للسؤال
            </button>

            {/* The Answer Box - Reduced Size */}
            <div className="bg-green-600/20 border-2 border-green-500 p-6 md:p-8 rounded-[2rem] mb-4 backdrop-blur-sm w-full max-w-3xl">
              <p className="text-green-400 text-xs md:text-sm font-bold mb-1 uppercase tracking-widest">الإجابة هي</p>
              <p className="text-2xl md:text-4xl font-black text-white leading-relaxed">{question.answer}</p>
            </div>

            {/* Answer Image - Shown BELOW the answer text */}
            {currentImage && (
              <div 
                onClick={() => setIsImageZoomed(true)}
                className="relative rounded-xl overflow-hidden shadow-lg border-2 border-slate-600 transition-all duration-300 cursor-zoom-in hover:scale-[1.02] mb-4 inline-block"
              >
                <img 
                  src={currentImage} 
                  alt="Answer Visual" 
                  className="max-w-full max-h-[20vh] md:max-h-[25vh] object-contain h-auto w-auto" 
                />
              </div>
            )}

            {/* Selection Area - Reduced Size */}
            <div className="bg-slate-800/80 p-6 rounded-[2rem] border border-slate-700 backdrop-blur-md w-full max-w-3xl">
              <h3 className="text-xl md:text-2xl font-black text-orange-400 mb-4">من جاوب؟</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button 
                  onClick={() => handleWinner(0)}
                  className="py-4 bg-slate-700 hover:bg-orange-600 text-white rounded-xl text-xl md:text-2xl font-black transition-all border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                >
                  {teamNames[0]}
                </button>
                <button 
                  onClick={() => handleWinner(1)}
                  className="py-4 bg-slate-700 hover:bg-orange-600 text-white rounded-xl text-xl md:text-2xl font-black transition-all border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
                >
                  {teamNames[1]}
                </button>
              </div>
              
              <button 
                onClick={handleNobody}
                className="w-full py-3 bg-transparent border-2 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl font-bold text-lg transition-all"
              >
                محد جاوب 🤷‍♂️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;