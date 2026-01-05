import React, { useState, useEffect } from 'react';
import { GameState, Question, Category, Points, PowerUpState } from './types';
import { generateQuestionsForCategory, getCategoryGameCount, preloadCarsData } from './services/geminiService';
import { getGameHistory, saveGameToHistory, markQuestionsAsUsed, resetAllProgress, GameHistoryItem } from './services/storageService';
import QuestionModal from './components/QuestionModal';
import CastButton from './components/CastButton';
import PowerUps from './components/PowerUps';

const CATEGORY_META = [
  { name: "أعلام", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292404/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%A3%D8%B9%D9%84%D8%A7%D9%85_nrhye6.jpg" },
  { name: "للبنات", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356081/photo_2026-01-02_15-12-19_iui6kl.jpg" },
  { name: "حروف", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767471986/photo_2026-01-03_23-12-56_bebkhb.jpg" },
  { name: "يوتيوب سعودي", img: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png" },
  { name: "تموينات", img: "https://cdn.pixabay.com/photo/2016/11/22/21/57/apparel-1850804_1280.jpg" },
  { name: "حنكة", img: "https://cdn.pixabay.com/photo/2017/02/01/10/24/brain-2029391_1280.png" },
  { name: "سيارات", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400" },
  { name: "أنمي", img: "https://cdn.aptoide.com/imgs/3/c/9/3c93ccd912c43b3b76175b18f74bd52b_fgraphic.png" },
  { name: "كرة قدم سعودية", img: "https://cdn.arabsstock.com/uploads/images/315277/playing-in-the-saudi-professional-thumbnail-315277.webp" },
  { name: "تاريخ", img: "https://iraqination.net/wp-content/uploads/2023/10/%D9%81%D9%88%D8%A7%D8%A6%D8%AF-%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE.jpg" },
  { name: "قصص الأنبياء", img: "https://play-lh.googleusercontent.com/fjRu2XKWoMJsUU9ukXnWUvNeo2VfZoFh7nYQrEnc69vYairg9hwm_iYeLHfkBCDrvRw" },
  { name: "علوم", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292405/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%B9%D9%84%D9%88%D9%85_oqowb2.jpg" },
  { name: "معلومات عامة", img: "https://cdn.pixabay.com/photo/2023/11/01/19/04/ai-generated-8358821_640.jpg" },
  { name: "اسلاميات", img: "https://islameyat.vercel.app/Images/Books/book.jpg" },
  { name: "فيديو قيمز", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292404/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%A7%D9%84%D8%B9%D8%A7%D8%A8_lb0qsn.jpg" }
];

// Simple CSS-based Fireworks Component
const FireworksDisplay = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <style>{`
      @keyframes firework {
        0% { transform: translate(var(--x), var(--initialY)); width: var(--initialSize); opacity: 1; }
        50% { width: 0.5rem; opacity: 1; }
        100% { width: var(--finalSize); opacity: 0; }
      }
      .firework,
      .firework::before,
      .firework::after {
        --initialSize: 0.5rem;
        --finalSize: 45rem;
        --particleSize: 0.2rem;
        --color1: yellow;
        --color2: khaki;
        --color3: white;
        --color4: lime;
        --color5: gold;
        --color6: mediumseagreen;
        --y: -30vmin;
        --x: -50%;
        --initialY: 60vmin;
        content: "";
        animation: firework 2s infinite;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, var(--y));
        width: var(--initialSize);
        aspect-ratio: 1;
        background: 
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 50% 0%,
          radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 100% 50%,
          radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 50% 100%,
          radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 0% 50%,
          
          radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 80% 90%,
          radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 95% 90%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 90% 70%,
          radial-gradient(circle, var(--color2) var(--particleSize), #0000 0) 90% 23%,
          radial-gradient(circle, var(--color3) var(--particleSize), #0000 0) 100% 43%,
          radial-gradient(circle, var(--color4) var(--particleSize), #0000 0) 85% 27%,
          radial-gradient(circle, var(--color5) var(--particleSize), #0000 0) 77% 37%,
          radial-gradient(circle, var(--color6) var(--particleSize), #0000 0) 60% 7%,
          
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 22% 14%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 45% 20%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 33% 34%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 10% 29%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 31% 37%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 28% 7%,
          radial-gradient(circle, var(--color1) var(--particleSize), #0000 0) 13% 42%;
        background-size: var(--initialSize) var(--initialSize);
        background-repeat: no-repeat;
      }
      .firework::before {
        --x: -50%;
        --y: -50%;
        --initialY: -50%;
        transform: translate(-50%, -50%) rotate(40deg) scale(1.3) rotateY(40deg);
      }
      .firework::after {
        --x: -50%;
        --y: -50%;
        --initialY: -50%;
        transform: translate(-50%, -50%) rotate(170deg) scale(1.15) rotateY(-30deg);
      }
      .firework:nth-child(2) {
        --x: 30vmin;
        --initialY: 40vmin;
        animation-delay: 0.5s;
        --color1: pink; --color2: violet; --color3: fuchsia; --color4: orchid; --color5: plum; --color6: lavender;  
      }
      .firework:nth-child(3) {
        --x: -30vmin;
        --initialY: 20vmin;
        animation-delay: 1s;
        --color1: cyan; --color2: lightcyan; --color3: lightblue; --color4: paleblue; --color5: skyblue; --color6: lavender;
      }
    `}</style>
    <div className="firework"></div>
    <div className="firework"></div>
    <div className="firework"></div>
  </div>
);

// Toast Notification Component
const NotificationToast = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl border-r-4 border-orange-500 flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <span className="font-bold text-lg">{message}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    teams: [{ name: '', score: 0 }, { name: '', score: 0 }],
    currentTurn: 0,
    categories: [],
    activeQuestion: null,
    activePowerUps: [],
    powerUps: [
      { doublePoints: 1, noPenalty: 1, twoAnswers: 1 },
      { doublePoints: 1, noPenalty: 1, twoAnswers: 1 }
    ],
    gameStatus: 'landing'
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");
  // Used to force re-render of Setup screen to update counts
  const [refreshKey, setRefreshKey] = useState(0); 

  useEffect(() => {
    // Preload data for specific categories (like Cars) to ensure game counts are accurate
    preloadCarsData().then((hasData) => {
      if (hasData) {
        // Force refresh to update the "Games Remaining" count in the UI
        setRefreshKey(k => k + 1);
      }
    });
  }, []);

  useEffect(() => {
    if (showHistory) {
      setHistory(getGameHistory());
    }
  }, [showHistory]);

  // When game finishes, save data
  useEffect(() => {
    if (gameState.gameStatus === 'finished') {
      const winnerIndex = gameState.teams[0].score > gameState.teams[1].score 
        ? 0 
        : gameState.teams[1].score > gameState.teams[0].score 
          ? 1 
          : -1;

      // 1. Save Game History
      saveGameToHistory({
        date: new Date().toISOString(),
        teams: gameState.teams,
        categories: gameState.categories.map(c => c.name),
        winnerIndex
      });

      // 2. Mark Used Questions
      const allQuestionIds = gameState.categories.flatMap(c => c.questions.map(q => q.id));
      markQuestionsAsUsed(allQuestionIds);
    }
  }, [gameState.gameStatus]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartGame = async () => {
    setGameState(prev => ({ ...prev, gameStatus: 'loading' }));
    setLoadingMsg("جاري تجهيز الأسئلة...");
    
    try {
      const promises = selectedCategories.map(name => generateQuestionsForCategory(name));
      const results = await Promise.all(promises);
      
      const categories: Category[] = selectedCategories.map((name, i) => {
        const meta = CATEGORY_META.find(m => m.name === name);
        return {
          id: `cat-${i}`,
          name,
          imageUrl: meta?.img || '',
          questions: results[i]
        };
      });

      setGameState(prev => ({ ...prev, categories, gameStatus: 'playing' }));
    } catch (e) {
      alert("حدث خطأ في تحميل الأسئلة، يرجى المحاولة مرة أخرى.");
      setGameState(prev => ({ ...prev, gameStatus: 'setup' }));
    }
  };

  const handlePlayAgain = () => {
    setSelectedCategories([]);
    setRefreshKey(prev => prev + 1); // Refresh categories availability
    setGameState({
      teams: [{ name: '', score: 0 }, { name: '', score: 0 }],
      currentTurn: 0,
      categories: [],
      activeQuestion: null,
      activePowerUps: [],
      powerUps: [
        { doublePoints: 1, noPenalty: 1, twoAnswers: 1 },
        { doublePoints: 1, noPenalty: 1, twoAnswers: 1 }
      ],
      gameStatus: 'setup'
    });
  };

  const handleBackToHome = () => {
    setSelectedCategories([]);
    setRefreshKey(prev => prev + 1);
    setGameState({
      teams: [{ name: '', score: 0 }, { name: '', score: 0 }],
      currentTurn: 0,
      categories: [],
      activeQuestion: null,
      activePowerUps: [],
      powerUps: [
        { doublePoints: 1, noPenalty: 1, twoAnswers: 1 },
        { doublePoints: 1, noPenalty: 1, twoAnswers: 1 }
      ],
      gameStatus: 'landing'
    });
  };

  const handleResetProgress = () => {
    resetAllProgress();
    setHistory([]);
    setShowResetConfirm(false);
    showNotification("تم مسح السجل والتقدم بنجاح! 🗑️");
    setRefreshKey(prev => prev + 1);
  };

  const togglePowerUp = (type: keyof PowerUpState) => {
    setGameState(prev => {
      const current = prev.activePowerUps;
      let newActive = [...current];

      if (type === 'twoAnswers') {
        // Toggle twoAnswers independent of others
        if (newActive.includes('twoAnswers')) {
          newActive = newActive.filter(p => p !== 'twoAnswers');
          showNotification("تم إلغاء تفعيل إجابتين ❌");
        } else {
          newActive.push('twoAnswers');
          showNotification("تم تفعيل إجابتين! ✌️");
        }
      } else {
        // For Double Points and No Penalty (Mutually exclusive with each other)
        const isActive = newActive.includes(type);
        
        // Remove the other one if it exists (Double vs NoPenalty)
        const otherType = type === 'doublePoints' ? 'noPenalty' : 'doublePoints';
        newActive = newActive.filter(p => p !== otherType);

        if (isActive) {
          newActive = newActive.filter(p => p !== type);
          showNotification("تم إلغاء تفعيل الوسيلة المساعدة ❌");
        } else {
          newActive.push(type);
           let msg = "";
           if (type === 'doublePoints') msg = "تم تفعيل دبل النقاط! 🤑";
           if (type === 'noPenalty') msg = "تم تفعيل منع الخصم! ✋";
           showNotification(msg);
        }
      }
      
      return { ...prev, activePowerUps: newActive };
    });
  };

  const switchTurn = () => {
    setGameState(prev => ({ ...prev, currentTurn: (prev.currentTurn + 1) % 2 }));
  };

  const adjustScore = (teamIndex: number, amount: number) => {
    setGameState(prev => {
      const newTeams = [...prev.teams];
      newTeams[teamIndex].score += amount;
      return { ...prev, teams: newTeams as [any, any] };
    });
  };

  const onAnswer = (isCorrect: boolean, teamIndex: number) => {
    const q = gameState.activeQuestion;
    const active = gameState.activePowerUps;

    if (!q) return;

    setGameState(prev => {
      const newTeams = [...prev.teams];
      
      if (isCorrect) {
        // Double points only if the team answering is the one whose turn it is
        const isTurnTeam = teamIndex === prev.currentTurn;
        const multiplier = (active.includes('doublePoints') && isTurnTeam) ? 2 : 1;
        newTeams[teamIndex].score += (q.points * multiplier);
      } else if (teamIndex !== -1) {
        if (!active.includes('noPenalty')) {
          newTeams[teamIndex].score -= q.points;
        }
      }

      const newPowerUps = [...prev.powerUps];
      // Deduct powerups only if a team actually answered
      if (teamIndex !== -1) { 
         active.forEach(pu => {
            if (newPowerUps[prev.currentTurn][pu] > 0) {
               newPowerUps[prev.currentTurn][pu] -= 1;
            }
         });
      }

      const updatedCats = prev.categories.map(c => ({
        ...c,
        questions: c.questions.map(question => 
          question.id === q.id ? { ...question, isUsed: true } : question
        )
      }));

      const isFinished = updatedCats.every(c => c.questions.every(question => question.isUsed));

      return {
        ...prev,
        teams: newTeams as [any, any],
        categories: updatedCats,
        activeQuestion: null,
        activePowerUps: [], // Reset for next turn
        powerUps: newPowerUps as [PowerUpState, PowerUpState],
        currentTurn: (prev.currentTurn + 1) % 2,
        gameStatus: isFinished ? 'finished' : 'playing'
      };
    });
  };

  if (gameState.gameStatus === 'landing') {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-white relative overflow-hidden">
        {/* Top Bar with Cast Button */}
        <div className="absolute top-4 left-4 z-50">
           <CastButton />
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl animate-pulse pointer-events-none"></div>
        
        {/* Content container */}
        <div className="relative z-10 text-center animate-in zoom-in duration-700 flex flex-col items-center max-h-full">
          <div className="mb-4 md:mb-8 inline-block p-4 md:p-6 rounded-[2rem] md:rounded-[3rem] bg-orange-50 border-4 border-orange-100 shadow-xl shrink-0">
             <span className="text-6xl md:text-9xl">🤔</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-orange-600 leading-none tracking-tighter mb-4 md:mb-6 drop-shadow-2xl">
            داقشني
          </h1>
          
          {/* Action Buttons Container */}
          <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-10 shrink-0 w-full max-w-sm md:max-w-lg">
            
            {/* Top Row: Two buttons */}
            <div className="flex gap-2 md:gap-4 w-full">
              <button 
                onClick={() => setIsMobileMode(!isMobileMode)}
                className="flex-1 px-3 py-2 md:px-6 md:py-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 z-20 text-xs md:text-base"
              >
                {isMobileMode ? '📱 وضع الجوال' : '💻 وضع الكمبيوتر'}
              </button>

              <button 
                onClick={() => setShowRules(true)}
                className="flex-1 px-3 py-2 md:px-6 md:py-3 rounded-2xl bg-orange-100 border-2 border-orange-200 text-orange-600 font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 z-20 text-xs md:text-base"
              >
                📜 كيف تلعب؟
              </button>
            </div>

            {/* Bottom Row: Full width History button */}
            <button 
              onClick={() => setShowHistory(true)}
              className="w-full px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 z-20 text-xs md:text-base shadow-md"
            >
              📂 ألعابي السابقة
            </button>
          </div>

          <button 
            onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'setup' }))}
            className="group relative px-12 py-5 md:px-20 md:py-8 orange-gradient text-white rounded-full text-2xl md:text-4xl font-black shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:scale-110 hover:shadow-orange-500/60 transition-all duration-300 cursor-pointer z-20"
          >
            <span className="relative z-10">ابدأ اللعبة</span>
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full border-4 border-slate-700 relative max-h-[85vh] overflow-y-auto text-white">
               <button 
                 onClick={() => setShowHistory(false)}
                 className="absolute top-4 left-4 text-3xl text-slate-500 hover:text-white"
               >
                 ✕
               </button>
               <h2 className="text-2xl md:text-3xl font-black text-orange-500 mb-6 text-center border-b border-slate-700 pb-4">ألعابي السابقة 📂</h2>
               
               {history.length === 0 ? (
                 <div className="text-center text-slate-500 py-10 text-lg">
                   لا يوجد سجل ألعاب سابقة حتى الآن.
                 </div>
               ) : (
                 <div className="space-y-4">
                   {history.map((game, idx) => (
                     <div key={game.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3">
                        <div className="flex justify-between items-start border-b border-slate-700 pb-2">
                           <span className="text-xs text-slate-400 font-mono">{new Date(game.date).toLocaleDateString('ar-SA')}</span>
                           <span className="text-2xl">{game.winnerIndex === -1 ? '🤝' : '🏆'}</span>
                        </div>
                        
                        <div className="flex justify-around items-center bg-slate-900/50 p-3 rounded-xl">
                             <div className={`text-center ${game.winnerIndex === 0 ? 'text-green-400' : 'text-slate-300'}`}>
                               <div className="font-black text-xl">{game.teams[0].score}</div>
                               <div className="text-xs opacity-70">{game.teams[0].name}</div>
                             </div>
                             <span className="text-slate-600 font-black text-xl">VS</span>
                             <div className={`text-center ${game.winnerIndex === 1 ? 'text-green-400' : 'text-slate-300'}`}>
                               <div className="font-black text-xl">{game.teams[1].score}</div>
                               <div className="text-xs opacity-70">{game.teams[1].name}</div>
                             </div>
                        </div>

                        {/* Category Thumbnails */}
                        <div className="flex gap-2 flex-wrap justify-center mt-1">
                          {game.categories.map((catName, cIdx) => {
                            const meta = CATEGORY_META.find(m => m.name === catName);
                            return (
                              <div key={cIdx} className="relative group cursor-help">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-900 shadow-md">
                                  {meta ? (
                                    <img src={meta.img} alt={catName} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">?</div>
                                  )}
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-slate-700">
                                  {catName}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                     </div>
                   ))}
                 </div>
               )}

               <div className="mt-8 pt-4 border-t border-slate-700">
                 {!showResetConfirm ? (
                   <button 
                     disabled={history.length === 0}
                     onClick={() => setShowResetConfirm(true)}
                     className="w-full bg-red-900/30 text-red-400 border border-red-900/50 py-3 rounded-xl font-bold hover:bg-red-900/50 hover:text-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                     مسح سجل التقدم بالكامل 🗑️
                   </button>
                 ) : (
                   <div className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in">
                     <button 
                       onClick={() => setShowResetConfirm(false)}
                       className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition-colors"
                     >
                       إلغاء
                     </button>
                     <button 
                       onClick={handleResetProgress}
                       className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
                     >
                       تأكيد المسح ⚠️
                     </button>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-2xl w-full border-4 border-orange-500 relative max-h-[85vh] overflow-y-auto">
               <button 
                 onClick={() => setShowRules(false)}
                 className="absolute top-4 left-4 text-3xl text-slate-400 hover:text-red-500"
               >
                 ✕
               </button>
               <h2 className="text-2xl md:text-3xl font-black text-orange-600 mb-4 md:mb-6 text-center border-b-2 border-orange-100 pb-4">قواعد التحدي 🎮</h2>
               <div className="space-y-4 md:space-y-6 text-slate-700 leading-relaxed text-base md:text-lg">
                  <p><strong className="text-orange-600 block mb-1">المواجهة:</strong> تحدي مباشر بين فريقين.</p>
                  <p><strong className="text-orange-600 block mb-1">الميدان:</strong> اختيار 6 فئات عشوائية من أصل 12 فئة متنوعة.</p>
                  <p><strong className="text-orange-600 block mb-1">الأسئلة:</strong> جولة كبرى من 36 سؤالاً (6 أسئلة لكل فئة) تتدرج من السهل إلى الصعب.</p>
                  
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <p className="font-bold text-orange-800 mb-2">وسائل المساعدة (تُستخدم مرة واحدة) 🛠️:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                      <li><strong>إجابتان:</strong> تمنحك فرصة اختيار إجابتين بدلاً من واحدة لضمان الصواب ✅</li>
                      <li><strong>دبل نقاط:</strong> تُضاعف نقاط السؤال الحالي لقفزة سريعة في النتيجة ✖️</li>
                      <li><strong>منع الخصم:</strong> تكتيك هجومي يحرم الفريق المنافس من حق الإجابة 🚫</li>
                    </ul>
                  </div>

                  <p><strong className="text-orange-600 block mb-1">طريق الفوز 🏆:</strong> الفريق الذي يجمع أكبر عدد من النقاط بنهاية الأسئلة يُعلن بطلاً للمنافسة.</p>
               </div>
               <button 
                 onClick={() => setShowRules(false)}
                 className="w-full mt-6 md:mt-8 bg-orange-600 text-white py-3 rounded-xl font-bold text-xl hover:bg-orange-700 transition-colors"
               >
                 فهمت التحدي!
               </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState.gameStatus === 'setup') {
    return (
      <div className="h-[100dvh] w-full p-2 md:p-6 flex flex-col items-center overflow-hidden relative">
        {/* Back to Home Button */}
        <button 
          onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'landing' }))}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-slate-500 hover:text-orange-600 p-2 md:p-3 rounded-full shadow-md border border-slate-200 hover:border-orange-200 transition-all active:scale-95 group"
          title="عودة للرئيسية"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform">
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.632 8.632a.75.75 0 0 1-1.06 1.061l-.312-.312V19.5a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3V13.222l-.313.312a.75.75 0 0 1-1.06-1.06L11.47 3.84ZM19.5 11.898V19.5a1.5 1.5 0 0 1-1.5 1.5H15V15.75a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75V21H7.5a1.5 1.5 0 0 1-1.5-1.5v-7.602l6-6 6 6Z" />
          </svg>
        </button>

        <header className="mb-2 md:mb-4 text-center animate-in slide-in-from-top-12 duration-500 shrink-0">
          <h1 className="text-4xl md:text-6xl font-black text-orange-600 mb-1 md:mb-2 drop-shadow-xl tracking-tighter">داقشني</h1>
          <p className="text-sm md:text-xl text-slate-400 font-bold bg-white px-4 py-1 md:px-8 md:py-2 rounded-full shadow-sm inline-block">
             اختر 6 فئات ({selectedCategories.length}/6)
          </p>
        </header>

        {/* Categories Grid - Scrollable */}
        <div key={refreshKey} className="flex-1 w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 p-2 overflow-y-auto min-h-0 content-start">
          {CATEGORY_META.map(cat => {
            const gameCount = getCategoryGameCount(cat.name);
            const isExhausted = gameCount === 0;
            return (
              <button
                key={cat.name}
                disabled={isExhausted}
                onClick={() => {
                  if (selectedCategories.includes(cat.name)) {
                    setSelectedCategories(selectedCategories.filter(s => s !== cat.name));
                  } else if (selectedCategories.length < 6) {
                    setSelectedCategories([...selectedCategories, cat.name]);
                  }
                }}
                className={`relative aspect-[4/3] rounded-xl md:rounded-[1.5rem] overflow-hidden border-2 md:border-4 transition-all group flex flex-col ${
                  isExhausted 
                    ? 'border-slate-200 opacity-50 grayscale cursor-not-allowed'
                    : selectedCategories.includes(cat.name) 
                        ? 'border-orange-500 scale-[1.02] shadow-xl z-10' 
                        : 'border-white hover:border-orange-200 shadow-md opacity-90 hover:opacity-100'
                }`}
              >
                <img src={cat.img} className="absolute inset-0 w-full h-full object-cover" alt={cat.name} />
                
                {/* Games Remaining Badge */}
                {!isExhausted && (
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] md:text-xs px-2 py-1 rounded-full font-bold border border-slate-700 z-20 shadow-lg">
                    {gameCount} ألعاب
                  </div>
                )}
                
                {isExhausted && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full font-bold z-20 shadow-lg whitespace-nowrap">
                    انتهت الالعاب 🏁
                  </div>
                )}

                <div className={`absolute inset-0 flex items-center justify-center p-2 text-center bg-black/40 transition-colors ${selectedCategories.includes(cat.name) ? 'bg-orange-600/80' : ''}`}>
                  <span className="text-white text-sm md:text-2xl font-black drop-shadow-2xl">{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        <button 
          disabled={selectedCategories.length < 6}
          onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'teams' }))}
          className={`mt-2 md:mt-4 mb-1 md:mb-2 shrink-0 px-10 py-3 md:px-16 md:py-4 rounded-full text-lg md:text-2xl font-black shadow-2xl transition-all ${
            selectedCategories.length === 6 ? 'orange-gradient text-white hover:scale-105 hover:shadow-orange-500/40' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          استمرار
        </button>
      </div>
    );
  }

  if (gameState.gameStatus === 'teams') {
    return (
      <div className="h-[100dvh] w-full p-4 flex flex-col items-center justify-center overflow-hidden relative">
        {/* Back Button */}
        <button 
          onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'setup' }))}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-slate-500 hover:text-orange-600 p-2 md:p-3 rounded-full shadow-md border border-slate-200 hover:border-orange-200 transition-all active:scale-95 group"
          title="عودة لاختيار الفئات"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform transform rotate-180">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl border-t-[8px] md:border-t-[16px] border-orange-500 w-full max-w-3xl transform transition-all hover:scale-[1.01] animate-in slide-in-from-bottom-12 flex flex-col max-h-full overflow-y-auto">
          <h2 className="text-3xl md:text-6xl font-black text-center mb-2 md:mb-4 text-slate-800">أسماء الفرق</h2>
          
          {/* Selected Categories List */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-10">
            {selectedCategories.map((cat, idx) => (
              <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-100 px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                {cat}
              </span>
            ))}
          </div>

          <div className="space-y-4 md:space-y-8">
            <div className="group">
              <label className="block text-orange-600 font-black mb-1 md:mb-2 mr-2 md:mr-6 text-lg md:text-2xl">الفريق الأول</label>
              {/* Reduced input size by 20% */}
              <input 
                type="text" 
                value={gameState.teams[0].name}
                onChange={e => {
                  const nt = [...gameState.teams];
                  nt[0].name = e.target.value;
                  setGameState({...gameState, teams: nt as any});
                }}
                placeholder="أدخل اسم الفريق.."
                className="w-full bg-slate-50 border-2 md:border-4 border-slate-100 rounded-[1.2rem] md:rounded-[2rem] px-3 py-1.5 md:px-6 md:py-3 text-lg md:text-2xl font-black focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div className="group">
              <label className="block text-orange-600 font-black mb-1 md:mb-2 mr-2 md:mr-6 text-lg md:text-2xl">الفريق الثاني</label>
              {/* Reduced input size by 20% */}
              <input 
                type="text" 
                value={gameState.teams[1].name}
                onChange={e => {
                  const nt = [...gameState.teams];
                  nt[1].name = e.target.value;
                  setGameState({...gameState, teams: nt as any});
                }}
                placeholder="أدخل اسم الفريق.."
                className="w-full bg-slate-50 border-2 md:border-4 border-slate-100 rounded-[1.2rem] md:rounded-[2rem] px-3 py-1.5 md:px-6 md:py-3 text-lg md:text-2xl font-black focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>
          <button 
            disabled={!gameState.teams[0].name || !gameState.teams[1].name}
            onClick={handleStartGame}
            className="w-full mt-8 md:mt-16 orange-gradient text-white py-4 md:py-6 rounded-[2rem] md:rounded-[3rem] text-2xl md:text-4xl font-black shadow-2xl hover:shadow-orange-500/40 disabled:opacity-50 active:scale-95 transition-all shrink-0"
          >
            بـدء التـحـدي
          </button>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus === 'loading') {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center gap-8 md:gap-12 overflow-hidden">
        <div className="w-24 h-24 md:w-40 md:h-40 border-[10px] md:border-[16px] border-orange-500 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
        <p className="text-2xl md:text-4xl font-black text-orange-600 animate-pulse tracking-widest text-center px-4">{loadingMsg}</p>
      </div>
    );
  }

  if (gameState.gameStatus === 'playing') {
    return (
      <div className="h-[100dvh] w-full flex flex-col p-1 md:p-4 overflow-hidden bg-slate-50/50 relative">
        <NotificationToast message={notification} />

        {/* Unified Header Section - Responsive sizing */}
        <header className="flex-none flex items-start justify-between gap-1 md:gap-4 mb-2 md:mb-3 z-10 px-1 md:px-4 w-full max-w-full">
          
          {/* Team 1 Score */}
          <div className={`px-2 py-2 md:px-4 md:py-4 rounded-xl md:rounded-2xl shadow-md border-b-[3px] transition-all min-w-[70px] md:min-w-[140px] flex flex-col items-center shrink-0 ${gameState.currentTurn === 0 ? 'bg-orange-600 text-white border-orange-800 scale-105' : 'bg-white text-slate-400 border-slate-200'}`}>
             <p className="text-[9px] md:text-xs font-bold opacity-80 mb-0.5 truncate max-w-[60px] md:max-w-full text-center">فريق {gameState.teams[0].name}</p>
             <p className="text-xl md:text-4xl font-black leading-none mb-1">{gameState.teams[0].score}</p>
             {/* Manual Controls */}
             <div className="flex gap-1 md:gap-3">
                <button onClick={() => adjustScore(0, 100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-xs font-bold p-1">▲</button>
                <button onClick={() => adjustScore(0, -100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-xs font-bold p-1">▼</button>
             </div>
          </div>

          {/* Center Controls (Turn & PowerUps & Cast) */}
          <div className="flex flex-col items-center gap-1 md:gap-2 flex-1 min-w-0 mx-1">
               
               {/* New: Top controls row (Cast + Turn) */}
               <div className="flex items-center justify-center gap-1 md:gap-2 transform scale-100 md:scale-110 origin-bottom w-full">
                   <CastButton className="text-[10px] px-2 py-1 md:px-3 md:py-1.5 shrink-0" showLabel={false} />
                   
                   {/* Turn Indicator */}
                   <div className="bg-white shadow-sm border border-orange-200 rounded-full pl-1 pr-3 py-1 md:pl-2 md:pr-5 md:py-2 flex items-center gap-1 md:gap-2 min-w-0 max-w-full">
                      <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                        <span className="text-[9px] md:text-xs text-orange-600 font-black uppercase whitespace-nowrap">الدور:</span>
                        <span className="text-xs md:text-lg font-black text-slate-800 pb-0.5 md:pb-1 truncate">
                          {gameState.teams[gameState.currentTurn].name}
                        </span>
                      </div>
                      <button 
                        onClick={switchTurn}
                        className="w-4 h-4 md:w-7 md:h-7 flex items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full text-[9px] md:text-sm transition-colors shrink-0"
                        title="تغيير الدور يدوياً"
                      >
                        🔁
                      </button>
                   </div>
               </div>

               {/* Power Up Selectors */}
               <div className="flex gap-1 md:gap-2 bg-white/80 backdrop-blur rounded-xl p-1 shadow-sm border border-slate-100 transform scale-[0.85] md:scale-110 origin-top">
                   <button
                      disabled={gameState.powerUps[gameState.currentTurn].doublePoints === 0}
                      onClick={() => togglePowerUp('doublePoints')}
                      className={`flex items-center gap-1 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl transition-all border ${
                        gameState.activePowerUps.includes('doublePoints')
                        ? 'bg-orange-100 border-orange-500 text-orange-900 scale-105 shadow-md' 
                        : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      } ${gameState.powerUps[gameState.currentTurn].doublePoints === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                   >
                      <span className="text-sm md:text-xl">🤑</span>
                      <div className="flex flex-col items-start leading-none gap-0.5 hidden sm:flex">
                         <span className="text-[8px] md:text-[10px] font-black">دبل نقاط</span>
                         <span className="text-[6px] md:text-[8px] font-bold opacity-70">متبقي: {gameState.powerUps[gameState.currentTurn].doublePoints}</span>
                      </div>
                   </button>

                   <button
                      disabled={gameState.powerUps[gameState.currentTurn].noPenalty === 0}
                      onClick={() => togglePowerUp('noPenalty')}
                      className={`flex items-center gap-1 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl transition-all border ${
                        gameState.activePowerUps.includes('noPenalty')
                        ? 'bg-orange-100 border-orange-500 text-orange-900 scale-105 shadow-md' 
                        : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      } ${gameState.powerUps[gameState.currentTurn].noPenalty === 0 ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                   >
                      <span className="text-sm md:text-xl">✋</span>
                      <div className="flex flex-col items-start leading-none gap-0.5 hidden sm:flex">
                         <span className="text-[8px] md:text-[10px] font-black">منع خصم</span>
                         <span className="text-[6px] md:text-[8px] font-bold opacity-70">متبقي: {gameState.powerUps[gameState.currentTurn].noPenalty}</span>
                      </div>
                   </button>

                   <button
                      disabled={true}
                      className={`flex items-center gap-1 px-1.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl transition-all border bg-slate-50 border-transparent text-slate-300 opacity-60 cursor-not-allowed ${
                           gameState.powerUps[gameState.currentTurn].twoAnswers === 0 ? 'grayscale opacity-30' : ''
                      }`}
                   >
                      <span className="text-sm md:text-xl">✌️</span>
                      <div className="flex flex-col items-start leading-none gap-0.5 hidden sm:flex">
                         <span className="text-[8px] md:text-[10px] font-black">إجابتين</span>
                         <span className="text-[6px] md:text-[8px] font-bold opacity-70">متبقي: {gameState.powerUps[gameState.currentTurn].twoAnswers}</span>
                      </div>
                   </button>
               </div>
          </div>

          {/* Team 2 Score */}
          <div className={`px-2 py-2 md:px-4 md:py-4 rounded-xl md:rounded-2xl shadow-md border-b-[3px] transition-all min-w-[70px] md:min-w-[140px] flex flex-col items-center shrink-0 ${gameState.currentTurn === 1 ? 'bg-orange-600 text-white border-orange-800 scale-105' : 'bg-white text-slate-400 border-slate-200'}`}>
             <p className="text-[9px] md:text-xs font-bold opacity-80 mb-0.5 truncate max-w-[60px] md:max-w-full text-center">فريق {gameState.teams[1].name}</p>
             <p className="text-xl md:text-4xl font-black leading-none mb-1">{gameState.teams[1].score}</p>
             {/* Manual Controls */}
             <div className="flex gap-1 md:gap-3">
                <button onClick={() => adjustScore(1, 100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-xs font-bold p-1">▲</button>
                <button onClick={() => adjustScore(1, -100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-xs font-bold p-1">▼</button>
             </div>
          </div>
        </header>

        {/* Main Grid - Optimized for all screens */}
        <div className="flex-1 min-h-0 px-0.5 md:px-4 pb-1">
          <div className={`h-full grid ${isMobileMode ? "grid-cols-2 grid-rows-3" : "grid-cols-3 grid-rows-2"} gap-1.5 md:gap-4`}>
            {gameState.categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-lg md:rounded-2xl p-1 md:p-2 shadow-sm border border-orange-50 flex flex-col h-full overflow-hidden hover:shadow-md transition-all">
                
                {/* Header: Image + Title - Responsive Size */}
                <div className="flex flex-col items-center mb-1 shrink-0">
                    <div className="w-12 h-12 md:w-32 md:h-32 relative rounded-md md:rounded-xl overflow-hidden border border-orange-100 shadow-sm mb-1 group">
                      <img src={cat.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                    </div>
                    <span className="text-slate-800 font-black text-[10px] md:text-base leading-none truncate w-full text-center">{cat.name}</span>
                </div>

                {/* Buttons Section - Responsive Text */}
                <div className="flex-1 flex flex-col gap-1 min-h-0">
                  {[600, 400, 200].map(points => {
                    const questions = cat.questions.filter(q => q.points === points);
                    return (
                      <div key={points} className="flex-1 flex gap-1 min-h-0">
                        {questions.map(q => (
                          <button
                            key={q.id}
                            disabled={q.isUsed}
                            onClick={() => setGameState({...gameState, activeQuestion: q})}
                            className={`flex-1 h-full rounded md:rounded-lg text-sm md:text-2xl font-black transition-all border-b-2 md:border-b-[3px] active:scale-95 active:border-b-0 shadow-sm flex items-center justify-center ${
                              q.isUsed 
                              ? 'bg-slate-50 border-slate-100 text-slate-200' 
                              : points === 600 
                                ? 'bg-orange-500 border-orange-700 text-white hover:bg-orange-600'
                                : points === 400
                                  ? 'bg-orange-400 border-orange-600 text-white hover:bg-orange-500'
                                  : 'bg-white border-orange-100 text-orange-500 hover:border-orange-200 hover:text-orange-600'
                            }`}
                          >
                            {q.isUsed ? '✓' : points}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {gameState.activeQuestion && (
          <QuestionModal
            question={gameState.activeQuestion}
            activePowerUps={gameState.activePowerUps}
            onAnswer={onAnswer}
            teamNames={[gameState.teams[0].name, gameState.teams[1].name]}
            currentTurn={gameState.currentTurn}
            currentTeamPowerUps={gameState.powerUps[gameState.currentTurn]}
            onToggleTwoAnswers={() => togglePowerUp('twoAnswers')}
          />
        )}
      </div>
    );
  }

  if (gameState.gameStatus === 'finished') {
    const winner = gameState.teams[0].score > gameState.teams[1].score ? gameState.teams[0] : gameState.teams[1];
    const isTie = gameState.teams[0].score === gameState.teams[1].score;

    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-slate-900 relative">
        <FireworksDisplay />
        
        <div className="relative z-10 bg-white/10 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl text-center border border-white/20 w-full max-w-5xl animate-in zoom-in duration-500 flex flex-col max-h-full overflow-y-auto">
           <div className="text-6xl md:text-8xl mb-4 md:mb-8 animate-bounce">
             {isTie ? '🤝' : '👑'}
           </div>
           
           <h1 className="text-4xl md:text-8xl font-black mb-4 md:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 leading-tight drop-shadow-lg">
             {isTie ? 'تـعـــادل!' : `ألف مبروك لـ ${winner.name}!`}
           </h1>

           <div className="flex flex-wrap gap-4 md:gap-8 justify-center mb-8 md:mb-12 mt-4 md:mt-12">
             {/* Team 1 Card */}
             <div className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] min-w-[140px] md:min-w-[280px] backdrop-blur-md border-2 transition-transform ${gameState.teams[0].score >= gameState.teams[1].score ? 'bg-orange-600/90 border-orange-400 scale-110 shadow-[0_0_50px_rgba(234,88,12,0.5)] z-10' : 'bg-slate-800/80 border-slate-600 grayscale opacity-80'}`}>
               <p className={`font-bold mb-1 md:mb-2 text-lg md:text-2xl ${gameState.teams[0].score >= gameState.teams[1].score ? 'text-orange-100' : 'text-slate-400'}`}>{gameState.teams[0].name}</p>
               <p className="text-4xl md:text-7xl font-black text-white">{gameState.teams[0].score}</p>
             </div>

             {/* Team 2 Card */}
             <div className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] min-w-[140px] md:min-w-[280px] backdrop-blur-md border-2 transition-transform ${gameState.teams[1].score >= gameState.teams[0].score ? 'bg-orange-600/90 border-orange-400 scale-110 shadow-[0_0_50px_rgba(234,88,12,0.5)] z-10' : 'bg-slate-800/80 border-slate-600 grayscale opacity-80'}`}>
               <p className={`font-bold mb-1 md:mb-2 text-lg md:text-2xl ${gameState.teams[1].score >= gameState.teams[0].score ? 'text-orange-100' : 'text-slate-400'}`}>{gameState.teams[1].name}</p>
               <p className="text-4xl md:text-7xl font-black text-white">{gameState.teams[1].score}</p>
             </div>
           </div>

           <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
             <button 
               onClick={handlePlayAgain} 
               className="px-8 py-3 md:px-16 md:py-6 bg-white text-orange-600 rounded-full font-black text-lg md:text-2xl hover:scale-105 hover:bg-orange-50 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all shrink-0"
             >
               لعب مرة أخرى 🔄
             </button>

             <button 
               onClick={handleBackToHome} 
               className="px-8 py-3 md:px-16 md:py-6 bg-slate-800 text-slate-300 border-2 border-slate-700 rounded-full font-black text-lg md:text-2xl hover:scale-105 hover:bg-slate-700 hover:text-white shadow-lg transition-all shrink-0"
             >
               الرئيسية 🏠
             </button>
           </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;