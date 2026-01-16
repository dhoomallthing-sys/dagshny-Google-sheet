import React, { useState, useEffect } from 'react';
import { GameState, Question, Category, Points, PowerUpState, Subscription } from './types';
import { 
  generateQuestionsForCategory, 
  getCategoryGameCount, 
  preloadAllQuestions, 
  setGameTier, 
  verifyActivationCode, 
  consumeActivationCode,
  getRemainingGames
} from './services/geminiService';
import { 
  getGameHistory, 
  saveGameToHistory, 
  markQuestionsAsUsed, 
  unmarkQuestionsAsUsed, 
  deleteGameFromHistory, 
  resetAllProgress, 
  GameHistoryItem,
  getSubscription,
  saveSubscription,
  saveCurrentGameState,
  loadCurrentGameState,
  clearCurrentGameState
} from './services/storageService';
import QuestionModal from './components/QuestionModal';
import CastButton from './components/CastButton';
import PowerUps from './components/PowerUps';

// Updated Categories with new images for 'حنكة' and 'تموينات'
const CATEGORY_META = [
  { name: "أنمي", img: "https://cdn.aptoide.com/imgs/3/c/9/3c93ccd912c43b3b76175b18f74bd52b_fgraphic.png" },
  { name: "اسلاميات", img: "https://islameyat.vercel.app/Images/Books/book.jpg" },
  { name: "فيديو قيمز", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292404/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%A7%D9%84%D8%B9%D8%A7%D8%A8_lb0qsn.jpg" },
  { name: "معلومات عامة", img: "https://cdn.pixabay.com/photo/2023/11/01/19/04/ai-generated-8358821_640.jpg" },
  { name: "علوم", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292405/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%B9%D9%84%D9%88%D9%85_oqowb2.jpg" },
  { name: "قصص الأنبياء", img: "https://play-lh.googleusercontent.com/fjRu2XKWoMJsUU9ukXnWUvNeo2VfZoFh7nYQrEnc69vYairg9hwm_iYeLHfkBCDrvRw" },
  { name: "حنكة", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1768417431/Gemini_Generated_Image_lovwuclovwuclovw_1_wiqp98.png" },
  { name: "أعلام", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292404/%D8%AE%D9%84%D9%81%D9%8A%D8%A9_%D8%A3%D8%B9%D9%84%D8%A7%D9%85_nrhye6.jpg" },
  { name: "للبنات", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356081/photo_2026-01-02_15-12-19_iui6kl.jpg" },
  { name: "حروف", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767471986/photo_2026-01-03_23-12-56_bebkhb.jpg" },
  { name: "يوتيوب سعودي", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1768594989/youtube_saudi_vuapbx.png" },
  { name: "تموينات", img: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1768416158/06d76b29-d1e6-4ce5-902c-b17bfafaa5f1_mh0y2o.jpg" },
  { name: "كرة قدم سعودية", img: "https://cdn.arabsstock.com/uploads/images/315277/playing-in-the-saudi-professional-thumbnail-315277.webp" },
  { name: "تاريخ", img: "https://iraqination.net/wp-content/uploads/2023/10/%D9%81%D9%88%D8%A7%D8%A6%D8%AF-%D8%AF%D8%B1%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE.jpg" },
  { name: "سيارات", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400" }
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
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-10 fade-in duration-300 w-[90vw] md:w-auto">
      <div className="bg-slate-800 text-white px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-2xl border-r-4 border-orange-500 flex items-center gap-3">
        <span className="text-xl md:text-2xl">🔔</span>
        <span className="font-bold text-sm md:text-lg">{message}</span>
      </div>
    </div>
  );
};

// Main Status Badge Component
const StatusBadge = ({ tier }: { tier: 'free' | 'plus' | 'pro' }) => {
  let bgColor = "bg-slate-500";
  let text = "النسخة المجانية 🆓";
  
  if (tier === 'plus') {
    bgColor = "bg-blue-600";
    text = "باقة البلس 💎";
  } else if (tier === 'pro') {
    bgColor = "bg-yellow-500";
    text = "باقة البرو 👑";
  }

  return (
    <div className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl px-4 py-1.5 md:px-6 md:py-2 shadow-lg z-40 ${bgColor} text-white font-black text-xs md:text-base border-x border-b border-white/20 whitespace-nowrap`}>
      {text}
    </div>
  );
};

// Helper to render Tier Badge in History
const HistoryTierBadge = ({ tier }: { tier?: 'free' | 'plus' | 'pro' }) => {
  if (!tier || tier === 'free') {
    return <span className="bg-slate-500/90 text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold shadow-sm">مجاني 🆓</span>;
  }
  if (tier === 'plus') {
    return <span className="bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold shadow-sm">بلس 💎</span>;
  }
  if (tier === 'pro') {
    return <span className="bg-yellow-500/90 text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold shadow-sm">برو 👑</span>;
  }
  return null;
};

const App: React.FC = () => {
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  
  // New State for checking if a saved game exists
  const [hasSavedGame, setHasSavedGame] = useState(false);
  // State to hold details of the active game for display in modal
  const [activeGameDetails, setActiveGameDetails] = useState<GameState | null>(null);

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
    gameStatus: 'tierSelection' // Start with Tier Selection
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");
  // Used to force re-render of Setup screen to update counts
  const [refreshKey, setRefreshKey] = useState(0); 
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  
  // Activation & Tier States
  const [storedSubscription, setStoredSubscription] = useState<Subscription | null>(null);
  const [activeTierMode, setActiveTierMode] = useState<'free' | 'plus' | 'pro'>('free');
  
  const [pendingTier, setPendingTier] = useState<'plus' | 'pro' | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for persistent subscription (Auto-Login)
    const sub = getSubscription();
    setStoredSubscription(sub);

    // 2. Check for saved game state
    const savedGame = loadCurrentGameState();
    if (savedGame) {
      setHasSavedGame(true);
    }

    if (sub) {
      setGameTier(sub.tier);
      setActiveTierMode(sub.tier);
      // Skip tier selection and activation, go straight to Landing
      setGameState(prev => ({ ...prev, gameStatus: 'landing' }));
    } else {
       setGameTier('free');
       setActiveTierMode('free');
    }

    // 3. Preload data for ALL categories to ensure game counts are accurate
    preloadAllQuestions().then((hasData) => {
      if (hasData) {
        setQuestionsLoaded(true);
        // Force refresh to update the "Games Remaining" count in the UI
        setRefreshKey(k => k + 1);
      }
    });
  }, []);

  useEffect(() => {
    if (showHistory) {
      setHistory(getGameHistory());
      // Load active game details to display in the modal
      setActiveGameDetails(loadCurrentGameState());
    }
  }, [showHistory]);

  // When game finishes, save data and CHECK QUOTA
  useEffect(() => {
    if (gameState.gameStatus === 'finished') {
      const winnerIndex = gameState.teams[0].score > gameState.teams[1].score 
        ? 0 
        : gameState.teams[1].score > gameState.teams[0].score 
          ? 1 
          : -1;
      
      // Extract used question IDs from the current game state
      const usedIds = gameState.categories.flatMap(c => 
        c.questions.filter(q => q.isUsed).map(q => q.id)
      );

      // 1. Save Game History WITH TIER & Used IDs
      // CRITICAL: Use the tier locked in gameState to ensure persistence of the original session type
      saveGameToHistory({
        date: new Date().toISOString(),
        teams: gameState.teams,
        categories: gameState.categories.map(c => c.name),
        winnerIndex,
        tier: gameState.tier || activeTierMode, // Fallback to active if missing (should not happen with new logic)
        usedQuestionIds: usedIds
      });

      // 2. Clear the active saved game because it's finished
      clearCurrentGameState();
      setHasSavedGame(false);
      setActiveGameDetails(null);

      // 3. Verify Code Quota if user has a subscription
      if (storedSubscription && storedSubscription.tier !== 'free') {
        getRemainingGames(storedSubscription.activationCode).then(quota => {
          if (quota !== null) {
            if (quota <= 0) {
              // Quota exhausted - Downgrade to free
              const freeSub: Subscription = { tier: 'free', activationCode: 'FREE', date: new Date().toISOString() };
              saveSubscription(freeSub);
              setStoredSubscription(freeSub);
              setGameTier('free');
              setActiveTierMode('free');
              alert("⚠️ انتهى رصيد الألعاب الخاص بك! تم تحويلك للنسخة المجانية.");
            } else {
              showNotification(`المباريات المتبقية في رصيدك: ${quota}`);
            }
          }
        });
      }
    }
  }, [gameState.gameStatus]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTierSelection = (tier: 'free' | 'plus' | 'pro') => {
    // Check if the user already has this tier activated
    const isUnlocked = tier === 'free' || (storedSubscription && storedSubscription.tier === tier);

    if (isUnlocked) {
      // IF FREE TIER: Save persistence so user skips this screen next time
      if (tier === 'free' && !storedSubscription) {
         const freeSub: Subscription = { tier: 'free', activationCode: 'FREE', date: new Date().toISOString() };
         saveSubscription(freeSub);
         setStoredSubscription(freeSub);
      }

      // Direct Access Logic
      setGameTier(tier);
      setActiveTierMode(tier);
      setRefreshKey(prev => prev + 1);
      setGameState(prev => ({ ...prev, gameStatus: 'landing' }));
    } else {
      // Upgrade/Activation Logic
      setPendingTier(tier);
      setActivationCode('');
      setActivationError(null);
      setGameState(prev => ({ ...prev, gameStatus: 'activation' }));
    }
  };

  const handleVerifyCode = async () => {
    if (!activationCode || !pendingTier) return;
    
    setIsVerifying(true);
    setActivationError(null);

    // 1. Verify Code with Sheety
    const result = await verifyActivationCode(activationCode, pendingTier);

    if (result.isValid && result.rowId) {
      // 2. Consume Code (Set isUsed = Yes)
      const consumed = await consumeActivationCode(result.rowId);
      
      if (consumed) {
        // 3. Save Subscription Locally (Overwrite old one)
        const newSub: Subscription = {
          tier: pendingTier,
          activationCode: activationCode,
          date: new Date().toISOString()
        };
        saveSubscription(newSub);
        setStoredSubscription(newSub);

        // 4. Update Game State
        setGameTier(pendingTier);
        setActiveTierMode(pendingTier);
        setRefreshKey(prev => prev + 1);
        setGameState(prev => ({ ...prev, gameStatus: 'landing' }));
        showNotification(`تم تفعيل ${pendingTier === 'plus' ? 'باقة البلس' : 'باقة البرو'} بنجاح! 🎉`);
      } else {
        setActivationError('فشل تفعيل الكود، يرجى المحاولة مرة أخرى.');
      }
    } else {
      setActivationError(result.error || 'الكود غير صحيح.');
    }
    
    setIsVerifying(false);
  };

  const handleStartGame = async () => {
    // Starting a FRESH game, so clear any saved state
    clearCurrentGameState();
    setHasSavedGame(false);
    setActiveGameDetails(null);

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

      // --- UNIQUE QUESTION SELECTION / EARLY DEDUCTION LOGIC ---
      // Extract all Question IDs from the generated categories
      const allQuestionIds = categories.flatMap(c => c.questions.map(q => q.id));
      
      // Mark them as used immediately in LocalStorage, SPECIFIC TO THE ACTIVE TIER
      // This ensures that even if the user refreshes or exits, these questions 
      // are considered "spent" and filtered out in future selections for this tier.
      if (allQuestionIds.length > 0) {
        markQuestionsAsUsed(allQuestionIds, activeTierMode);
      }

      // CRITICAL: Capture and lock the current tier into the session state
      const newGameState: GameState = { 
        ...gameState, 
        categories, 
        gameStatus: 'playing',
        tier: activeTierMode // Locking the package type here
      };
      setGameState(newGameState);
      
      // Save initial state for "Resume" feature
      saveCurrentGameState(newGameState);

    } catch (e) {
      alert("حدث خطأ في تحميل الأسئلة، يرجى المحاولة مرة أخرى.");
      setGameState(prev => ({ ...prev, gameStatus: 'setup' }));
    }
  };

  const handleResumeGame = () => {
    const saved = loadCurrentGameState();
    if (saved) {
      setGameState(saved);
      // Assuming questions are already loaded in the saved state object
      // No need to mark questions as used here; they were marked when this session started.
      showNotification("تم استعادة اللعبة السابقة بنجاح! ▶️");
    } else {
      showNotification("عذراً، لا توجد لعبة محفوظة.");
      setHasSavedGame(false);
      setActiveGameDetails(null);
    }
  };

  // --- DELETE & RECYCLE LOGIC ---
  
  const handleDeleteHistoryGame = (e: React.MouseEvent, id: string, tier: 'free' | 'plus' | 'pro' | undefined, usedQuestionIds: string[]) => {
    // 2. Correct Event Binding & Bubble Prevention
    e.stopPropagation();
    e.preventDefault(); 

    // 5. Verification (Debug Log)
    console.log(`[Delete Operation] Initiated for session ID: ${id}`);

    if (!window.confirm("هل أنت متأكد من حذف هذه اللعبة؟ سيتم استرجاع الأسئلة لتظهر لك مجدداً.")) {
       console.log(`[Delete Operation] Cancelled by user.`);
       return;
    }

    // 3. Deletion Logic - Step B (Recycling)
    if (tier && usedQuestionIds && usedQuestionIds.length > 0) {
      console.log(`[Delete Operation] Recycling ${usedQuestionIds.length} questions for tier: ${tier}`);
      unmarkQuestionsAsUsed(usedQuestionIds, tier);
    } else {
      console.log(`[Delete Operation] No questions to recycle or missing tier info.`);
    }

    // 3. Deletion Logic - Step A & C (Removal)
    deleteGameFromHistory(id);
    console.log(`[Delete Operation] Session removed from storage.`);
    
    // 4. Instant UI Refresh
    setHistory(prev => {
        const updated = prev.filter(g => g.id !== id);
        console.log(`[Delete Operation] UI updated. Remaining games: ${updated.length}`);
        return updated;
    });
    setRefreshKey(prev => prev + 1); // Refresh Home counts
    showNotification("تم حذف اللعبة واسترجاع الأسئلة! ♻️");
  };

  const handleDeleteActiveGame = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!window.confirm("هل أنت متأكد من حذف الجلسة الحالية؟ سيتم استرجاع الأسئلة لتظهر لك مجدداً.")) return;
    
    // Attempt to get active game details from state OR from local storage if state is empty (e.g. on landing page)
    let gameData = activeGameDetails;
    if (!gameData) {
      gameData = loadCurrentGameState();
    }
    
    if (gameData) {
       // 1. Extract IDs from active game
       const usedIds = gameData.categories.flatMap(c => c.questions.map(q => q.id));
       
       // 2. Recycle
       // Use the tier stored in the active game details if available, otherwise fallback to current mode
       const tierToRecycle = gameData.tier || activeTierMode;
       
       if (usedIds.length > 0) {
         unmarkQuestionsAsUsed(usedIds, tierToRecycle);
       }
    }

    // 3. Clear State & Storage
    clearCurrentGameState();
    setHasSavedGame(false);
    setActiveGameDetails(null);
    setRefreshKey(prev => prev + 1);
    showNotification("تم حذف الجلسة واسترجاع الأسئلة! ♻️");
  };

  const handlePlayAgain = () => {
    setSelectedCategories([]);
    clearCurrentGameState();
    setHasSavedGame(false);
    setActiveGameDetails(null);
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
    // When manually going back to home, we do NOT clear the game state, 
    // allowing the user to resume later if they wish.
    setSelectedCategories([]);
    setRefreshKey(prev => prev + 1);
    
    // Check if there is a saved game to update button state
    const saved = loadCurrentGameState();
    setHasSavedGame(!!saved);
    setActiveGameDetails(saved);

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
    setHasSavedGame(false);
    setActiveGameDetails(null);
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
    setGameState(prev => {
      const newState = { ...prev, currentTurn: (prev.currentTurn + 1) % 2 };
      saveCurrentGameState(newState); // Save on turn switch
      return newState;
    });
  };

  const adjustScore = (teamIndex: number, amount: number) => {
    setGameState(prev => {
      const newTeams = [...prev.teams];
      newTeams[teamIndex].score += amount;
      const newState = { ...prev, teams: newTeams as [any, any] };
      saveCurrentGameState(newState); // Save on score adjustment
      return newState;
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

      const newState = {
        ...prev,
        teams: newTeams as [any, any],
        categories: updatedCats,
        activeQuestion: null,
        activePowerUps: [], // Reset for next turn
        powerUps: newPowerUps as [PowerUpState, PowerUpState],
        currentTurn: (prev.currentTurn + 1) % 2,
        gameStatus: isFinished ? 'finished' : 'playing'
      };

      // Save Game State to Persistent Storage
      if (!isFinished) {
        saveCurrentGameState(newState);
      } else {
        clearCurrentGameState(); // Clear if finished
      }

      return newState;
    });
  };

  if (gameState.gameStatus === 'tierSelection') {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full -ml-32 -mb-32 blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-4xl w-full">
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-2 md:mb-4 animate-in slide-in-from-top-10 fade-in duration-500">
             اختر باقتك 📦
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-8 md:mb-12 animate-in slide-in-from-top-12 fade-in duration-700">
             اختر الباقة المناسبة للعبتك اليوم
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            
            {/* Free Tier */}
            <button 
              onClick={() => handleTierSelection('free')}
              disabled={!questionsLoaded}
              className="bg-slate-50 border-4 border-slate-300 rounded-[2rem] p-6 hover:scale-105 hover:shadow-xl hover:border-slate-400 transition-all duration-300 group flex flex-col items-center animate-in zoom-in duration-300 fill-mode-backwards delay-100 relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:bg-slate-300 transition-colors">
                🆓
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-2">النسخة المجانية</h3>
              
              {!questionsLoaded && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                   <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>

            {/* Plus Tier */}
            <button 
              onClick={() => handleTierSelection('plus')}
              disabled={!questionsLoaded}
              className="bg-blue-50 border-4 border-blue-400 rounded-[2rem] p-6 hover:scale-105 hover:shadow-xl hover:shadow-blue-200 hover:border-blue-500 transition-all duration-300 group flex flex-col items-center animate-in zoom-in duration-300 fill-mode-backwards delay-200 relative overflow-hidden"
            >
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-400/20 rounded-full blur-xl group-hover:bg-blue-400/40 transition-all"></div>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-4 group-hover:bg-blue-200 transition-colors text-blue-600 shadow-inner">
                💎
              </div>
              <h3 className="text-2xl font-black text-blue-700 mb-2">باقة البلس</h3>

              {storedSubscription?.tier === 'plus' && (
                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse shadow-md mt-auto">
                   ✅ مفعلة
                </div>
              )}
              
              {!questionsLoaded && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                   <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>

            {/* Pro Tier */}
            <button 
              onClick={() => handleTierSelection('pro')}
              disabled={!questionsLoaded}
              className="bg-yellow-50 border-4 border-yellow-400 rounded-[2rem] p-6 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30 hover:border-yellow-500 transition-all duration-300 group flex flex-col items-center z-10 animate-in zoom-in duration-300 fill-mode-backwards delay-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/0 via-yellow-100/0 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-5xl mb-4 group-hover:bg-yellow-200 transition-colors text-yellow-600 shadow-lg border-2 border-yellow-200">
                👑
              </div>
              <h3 className="text-3xl font-black text-yellow-700 mb-2">باقة البرو</h3>

              {storedSubscription?.tier === 'pro' && (
                <div className="bg-green-600 text-white px-6 py-1.5 rounded-full text-lg font-bold animate-pulse shadow-lg z-20 mt-auto">
                   ✅ مفعلة
                </div>
              )}
              
              {!questionsLoaded && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                   <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>

          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVATION SCREEN ---
  if (gameState.gameStatus === 'activation') {
    const isPro = pendingTier === 'pro';
    const borderColor = isPro ? 'border-yellow-500' : 'border-blue-500';
    const textColor = isPro ? 'text-yellow-600' : 'text-blue-600';
    const bgGradient = isPro ? 'from-yellow-50 to-orange-50' : 'from-blue-50 to-indigo-50';

    return (
      <div className={`h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
        
        <button 
          onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'tierSelection' }))}
          className="absolute top-4 right-4 z-50 text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-full shadow-md font-bold transition-all"
        >
          عودة ↩
        </button>

        <div className={`bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-4 ${borderColor} w-full max-w-2xl animate-in zoom-in duration-300`}>
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto ${isPro ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner`}>
              {isPro ? '👑' : '💎'}
            </div>
            <h2 className={`text-3xl md:text-5xl font-black ${textColor} mb-2`}>
              تفعيل {isPro ? 'باقة البرو' : 'باقة البلس'}
            </h2>
            <p className="text-slate-400 text-lg">أدخل كود التفعيل الخاص بك للبدء</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                className={`w-full bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] px-6 py-4 text-center text-2xl md:text-3xl font-black tracking-widest focus:outline-none focus:border-${isPro ? 'yellow' : 'blue'}-400 transition-all uppercase placeholder:text-slate-300`}
                disabled={isVerifying}
              />
            </div>

            {activationError && (
              <div className="text-red-500 font-bold text-center bg-red-50 py-3 rounded-xl border border-red-200 animate-in shake">
                ⚠️ {activationError}
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={isVerifying || !activationCode}
              className={`w-full py-5 rounded-[1.5rem] text-white text-2xl font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPro 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-yellow-500/30' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 shadow-blue-500/30'
              }`}
            >
              {isVerifying ? 'جاري التحقق...' : 'تفعيل الكود 🔓'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN HOME SCREEN (LANDING) ---
  if (gameState.gameStatus === 'landing') {
    return (
      <div className="h-[100dvh] w-full bg-white relative overflow-hidden flex flex-col justify-evenly">
        
        {/* Status Badge */}
        <StatusBadge tier={activeTierMode} />

        {/* Top Bar with Cast Button */}
        <div className="absolute top-4 left-4 z-50">
           <CastButton />
        </div>
        
        {/* Change Tier Button */}
        <button 
           onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'tierSelection' }))}
           className="absolute top-4 right-4 z-50 text-slate-400 hover:text-orange-500 font-bold text-xs md:text-sm bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 hover:border-orange-200 transition-all shadow-sm"
        >
          📦 {storedSubscription ? 'تغيير الباقة / ترقية' : 'تغيير الباقة'}
        </button>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl animate-pulse pointer-events-none"></div>
        
        {/* Content Container - Flex Col evenly spaced */}
        <div className="relative z-10 flex flex-col items-center justify-evenly h-full w-full max-w-4xl mx-auto px-4 animate-in zoom-in duration-700">
          
          {/* Top Section: Icon & Title */}
          <div className="flex flex-col items-center justify-center">
              <div className="inline-block p-4 md:p-6 rounded-[2rem] bg-orange-50 border-4 border-orange-100 shadow-xl mb-4 md:mb-6">
                <span className="text-6xl md:text-8xl lg:text-9xl">🤔</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-orange-600 leading-none tracking-tighter drop-shadow-2xl text-center">
                داقشني
              </h1>
          </div>

          {/* Middle Section: Main Action Button */}
          <div className="w-full flex justify-center">
             <button 
               onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'setup' }))}
               className="group relative w-full max-w-sm md:max-w-md py-6 md:py-8 orange-gradient text-white rounded-3xl md:rounded-[2.5rem] text-3xl md:text-5xl font-black shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:scale-105 hover:shadow-orange-500/60 transition-all duration-300 cursor-pointer z-20"
             >
               <span className="relative z-10">ابدأ لعبة جديدة</span>
               <div className="absolute inset-0 rounded-3xl md:rounded-[2.5rem] bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
             </button>
          </div>
          
          {/* Bottom Section: Secondary Buttons & Resume */}
          <div className="flex flex-col gap-3 w-full max-w-sm md:max-w-md">
            
            {/* Action Row */}
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsMobileMode(!isMobileMode)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm md:text-lg"
              >
                {isMobileMode ? '📱 وضع الجوال' : '💻 وضع الكمبيوتر'}
              </button>

              <button 
                onClick={() => setShowRules(true)}
                className="flex-1 py-4 rounded-2xl bg-orange-100 border-2 border-orange-200 text-orange-600 font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm md:text-lg"
              >
                📜 كيف تلعب؟
              </button>
            </div>

            {/* History Button */}
            <button 
              onClick={() => setShowHistory(true)}
              className="w-full py-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2 active:scale-95 text-sm md:text-lg shadow-md"
            >
              📂 ألعابي السابقة
            </button>

            {/* Resume Button (Conditional) - with Delete Option */}
            {hasSavedGame && (
               <div className="animate-in slide-in-from-bottom-5 fade-in w-full pt-2 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2 justify-center opacity-60 w-full">
                    <div className="h-px bg-slate-300 flex-1"></div>
                    <span className="text-slate-400 text-xs font-bold">جلسة نشطة</span>
                    <div className="h-px bg-slate-300 flex-1"></div>
                  </div>
                  <div className="flex w-full gap-2">
                    <button 
                      onClick={handleResumeGame}
                      className="flex-[3] relative py-4 bg-white border-2 border-green-500 text-green-600 rounded-2xl text-xl font-black shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>▶️</span>
                      <span>إكمال اللعبة</span>
                      <span className="absolute top-0 left-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping group-hover:animate-none"></span>
                    </button>
                    
                    {/* New Delete Button on Landing Screen */}
                    <button 
                       onClick={handleDeleteActiveGame}
                       className="flex-1 py-4 bg-red-50 border-2 border-red-200 text-red-500 rounded-2xl text-2xl font-black shadow-lg hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center"
                       title="حذف الجلسة الحالية"
                    >
                      🗑️
                    </button>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* History Modal - Shows both unfinished active game AND finished history */}
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
               
               {/* 1. Unfinished / Active Game Card (If Exists) */}
               {activeGameDetails && (
                 <div className="bg-slate-800 rounded-2xl p-4 border-2 border-green-500/50 flex flex-col gap-3 mb-6 relative overflow-hidden animate-in slide-in-from-left-4 shadow-lg shadow-green-900/20">
                   
                   {/* Active Game Badge & Tier Badge */}
                   <div className="absolute top-0 right-0 z-10 flex">
                     {/* Use the TIER LOCKED in activeGameDetails, NOT global state */}
                     <HistoryTierBadge tier={activeGameDetails.tier} />
                     <div className="bg-green-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold shadow-md ml-[-8px]">
                        جاري اللعب ⏳
                     </div>
                   </div>

                   <div className="flex justify-between items-start border-b border-slate-700 pb-2 mt-6">
                       <span className="text-xs text-slate-400 font-mono">جلسة حالية (غير منتهية)</span>
                       
                       {/* Delete Button for Active Game */}
                       <button 
                          onClick={handleDeleteActiveGame}
                          className="text-red-400 hover:text-red-200 text-xs border border-red-900/50 bg-red-900/20 px-2 py-1 rounded hover:bg-red-900/50 transition-colors"
                       >
                         🗑️ حذف الجلسة
                       </button>
                   </div>

                   <div className="flex justify-around items-center bg-slate-900/50 p-3 rounded-xl">
                         <div className="text-center text-slate-300">
                           <div className="font-black text-xl">{activeGameDetails.teams[0].score}</div>
                           <div className="text-xs opacity-70">{activeGameDetails.teams[0].name}</div>
                         </div>
                         <span className="text-slate-600 font-black text-xl">VS</span>
                         <div className="text-center text-slate-300">
                           <div className="font-black text-xl">{activeGameDetails.teams[1].score}</div>
                           <div className="text-xs opacity-70">{activeGameDetails.teams[1].name}</div>
                         </div>
                   </div>

                   <div className="flex gap-2 flex-wrap justify-center mt-1">
                     {activeGameDetails.categories.map((cat, cIdx) => (
                         <div key={cIdx} className="relative group cursor-help">
                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-900 shadow-md">
                               <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                           </div>
                         </div>
                     ))}
                   </div>

                   <button 
                     onClick={() => { setShowHistory(false); handleResumeGame(); }}
                     className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                   >
                     <span>▶️</span> إكمال اللعب
                   </button>
                 </div>
               )}

               {/* Separator if both exist */}
               {activeGameDetails && history.length > 0 && (
                 <div className="flex items-center gap-3 mb-4 opacity-50">
                    <div className="h-px bg-slate-600 flex-1"></div>
                    <span className="text-xs text-slate-400 font-bold">الألعاب المنتهية</span>
                    <div className="h-px bg-slate-600 flex-1"></div>
                 </div>
               )}

               {/* 2. Finished Games List */}
               {history.length === 0 && !activeGameDetails ? (
                 <div className="text-center text-slate-500 py-10 text-lg">
                   لا يوجد سجل ألعاب سابقة حتى الآن.
                 </div>
               ) : (
                 <div className="space-y-4">
                   {history.map((game, idx) => (
                     <div key={game.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col gap-3 relative overflow-hidden group/card">
                        
                        {/* Package Badge - PERSISTED VALUE */}
                        <div className="absolute top-0 right-0 z-10">
                          <HistoryTierBadge tier={game.tier} />
                        </div>

                        <div className="flex justify-between items-start border-b border-slate-700 pb-2 mt-4">
                           <span className="text-xs text-slate-400 font-mono">{new Date(game.date).toLocaleDateString('ar-SA')}</span>
                           <div className="flex items-center gap-3">
                              <span className="text-2xl">{game.winnerIndex === -1 ? '🤝' : '🏆'}</span>
                              {/* Delete Button */}
                              <button 
                                onClick={(e) => handleDeleteHistoryGame(e, game.id, game.tier, game.usedQuestionIds)}
                                className="text-red-400 hover:text-red-200 p-2 rounded-lg hover:bg-red-900/30 transition-colors z-20"
                                title="حذف واسترجاع الأسئلة"
                              >
                                <span className="text-xl">🗑️</span>
                              </button>
                           </div>
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
                     disabled={history.length === 0 && !activeGameDetails}
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
                  <p><strong className="text-orange-600 block mb-1">الميدان:</strong> اختيار 6 فئات عشوائية من أصل 15 فئة متنوعة.</p>
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

  // --- REMAINING RENDERS ---
  
  if (gameState.gameStatus === 'setup') {
    // 2. Sort Logic: Categories with games > 0 first.
    const sortedCategories = [...CATEGORY_META].map(cat => ({
      ...cat,
      count: getCategoryGameCount(cat.name)
    })).sort((a, b) => {
      // Sort descending by count (available first), then inactive/zero last
      if (a.count > 0 && b.count === 0) return -1;
      if (a.count === 0 && b.count > 0) return 1;
      return 0; // Keep original order otherwise
    });

    return (
      <div className="h-[100dvh] w-full p-2 md:p-6 flex flex-col items-center overflow-hidden relative">
        
        {/* Main Screen Status Badge - Increased z-index to avoid clipping */}
        <StatusBadge tier={activeTierMode} />

        {/* Home Button replacing Change Package - Adjust positioning */}
        <button 
          onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'landing' }))}
          className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur text-slate-500 hover:text-orange-600 px-3 py-2 rounded-full shadow-md border border-slate-200 hover:border-orange-200 transition-all active:scale-95 group text-xs md:text-sm font-bold flex items-center gap-2"
          title="عودة للرئيسية"
        >
          <span className="hidden md:inline">الرئيسية</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
             <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.632 8.632a.75.75 0 0 1-1.06 1.061l-.312-.312V19.5a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3V13.222l-.313.312a.75.75 0 0 1-1.06-1.06L11.47 3.84ZM19.5 11.898V19.5a1.5 1.5 0 0 1-1.5 1.5H15V15.75a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75V21H7.5a1.5 1.5 0 0 1-1.5-1.5v-7.602l6-6 6 6Z" />
          </svg>
        </button>

        {/* Header - Added padding-top to clear absolute elements on mobile */}
        <header className="mb-2 md:mb-4 text-center animate-in slide-in-from-top-12 duration-500 shrink-0 mt-12 md:mt-8 pt-2">
          <h1 className="text-4xl md:text-6xl font-black text-orange-600 mb-1 md:mb-2 drop-shadow-xl tracking-tighter">داقشني</h1>
          <p className="text-sm md:text-xl text-slate-400 font-bold bg-white px-4 py-1 md:px-8 md:py-2 rounded-full shadow-sm inline-block">
             اختر 6 فئات ({selectedCategories.length}/6)
          </p>
        </header>

        {/* Categories Grid - Scrollable - Refined for mobile/tablet */}
        <div key={refreshKey} className="flex-1 w-full max-w-7xl overflow-y-auto min-h-0 px-4 pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 content-start">
            {sortedCategories.map(cat => {
              const gameCount = cat.count;
              const isExhausted = gameCount === 0;
              // 3. Logic: Specific tier messaging for 'حنكة' & 'تموينات'
              const isProExclusive = (cat.name === 'حنكة' || cat.name === 'تموينات') && activeTierMode !== 'pro';

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
                    <div className={`absolute top-2 left-2 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full font-bold z-20 shadow-lg whitespace-nowrap ${isProExclusive ? 'bg-yellow-600' : 'bg-red-600'}`}>
                      {isProExclusive ? 'متوفرة في باقة برو 👑' : 'انتهت الالعاب 🏁'}
                    </div>
                  )}

                  <div className={`absolute inset-0 flex items-center justify-center p-2 text-center bg-black/40 transition-colors ${selectedCategories.includes(cat.name) ? 'bg-orange-600/80' : ''}`}>
                    <span className="text-white text-sm md:text-2xl font-black drop-shadow-2xl">{cat.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
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

        {/* Unified Header Section - Responsive sizing with Specific Tablet (md) vs Desktop (lg) scaling */}
        <header className="flex-none flex items-start justify-between gap-1 md:gap-4 mb-2 md:mb-3 z-10 px-1 md:px-4 w-full max-w-full">
          
          {/* Team 1 Score - Scaled down ~20% for tablets (md) vs full size for desktop (lg) */}
          <div className={`px-2 py-2 md:px-3 md:py-3 lg:px-4 lg:py-4 rounded-xl md:rounded-2xl shadow-md border-b-[3px] transition-all min-w-[70px] md:min-w-[110px] lg:min-w-[140px] flex flex-col items-center shrink-0 ${gameState.currentTurn === 0 ? 'bg-orange-600 text-white border-orange-800 scale-105' : 'bg-white text-slate-400 border-slate-200'}`}>
             <p className="text-[9px] md:text-[10px] lg:text-xs font-bold opacity-80 mb-0.5 truncate max-w-[60px] md:max-w-[100px] lg:max-w-full text-center">فريق {gameState.teams[0].name}</p>
             <p className="text-xl md:text-3xl lg:text-4xl font-black leading-none mb-1">{gameState.teams[0].score}</p>
             {/* Manual Controls */}
             <div className="flex gap-1 md:gap-3">
                <button onClick={() => adjustScore(0, 100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-[10px] lg:text-xs font-bold p-1">▲</button>
                <button onClick={() => adjustScore(0, -100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-[10px] lg:text-xs font-bold p-1">▼</button>
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

          {/* Team 2 Score - Scaled down ~20% for tablets (md) vs full size for desktop (lg) */}
          <div className={`px-2 py-2 md:px-3 md:py-3 lg:px-4 lg:py-4 rounded-xl md:rounded-2xl shadow-md border-b-[3px] transition-all min-w-[70px] md:min-w-[110px] lg:min-w-[140px] flex flex-col items-center shrink-0 ${gameState.currentTurn === 1 ? 'bg-orange-600 text-white border-orange-800 scale-105' : 'bg-white text-slate-400 border-slate-200'}`}>
             <p className="text-[9px] md:text-[10px] lg:text-xs font-bold opacity-80 mb-0.5 truncate max-w-[60px] md:max-w-[100px] lg:max-w-full text-center">فريق {gameState.teams[1].name}</p>
             <p className="text-xl md:text-3xl lg:text-4xl font-black leading-none mb-1">{gameState.teams[1].score}</p>
             {/* Manual Controls */}
             <div className="flex gap-1 md:gap-3">
                <button onClick={() => adjustScore(1, 100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-[10px] lg:text-xs font-bold p-1">▲</button>
                <button onClick={() => adjustScore(1, -100)} className="hover:text-orange-200 hover:scale-125 transition-transform text-[8px] md:text-[10px] lg:text-xs font-bold p-1">▼</button>
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
