import { Question, Points } from "../types";
import { getUsedQuestionIds } from "./storageService";

// Global cache for questions fetched from API
let GLOBAL_QUESTIONS_CACHE: any[] = [];
let ACTIVE_TIER_MODE: 'free' | 'plus' | 'pro' = 'free';

const CODES_API_URL = 'https://api.sheety.co/e1d05c2504d597feb758d2d88e581b32/activationCode/sheet1';

// Basic Auth Credentials
// Encodes 'USERNAME:PASSWORD' to Base64
const AUTH_CREDENTIALS = btoa('DhoomM7mdRakan7madh:DMR722231918');
const AUTH_HEADER = {
  'Authorization': `Basic ${AUTH_CREDENTIALS}`
};

export const setGameTier = (mode: 'free' | 'plus' | 'pro') => {
  ACTIVE_TIER_MODE = mode;
  console.log(`Tier set to: ${mode}`);
};

/**
 * Verifies an activation code against the Sheety API.
 * 
 * Logic:
 * 1. Fetch all codes.
 * 2. Find row where:
 *    - activationCode === input
 *    - isUsed === 'No'
 *    - packageType === requiredPackageType
 */
export const verifyActivationCode = async (
  code: string, 
  requiredTier: 'plus' | 'pro'
): Promise<{ isValid: boolean; rowId?: number; error?: string }> => {
  try {
    // Determine expected package name string in Sheet
    const expectedPackageType = requiredTier === 'plus' ? 'باقة البلس' : 'باقة البرو';

    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await fetch(`${CODES_API_URL}?t=${timestamp}`, { 
      cache: 'no-store',
      headers: {
        ...AUTH_HEADER
      }
    });

    if (!response.ok) {
       console.error("API Error:", response.status, response.statusText);
       return { isValid: false, error: 'حدث خطأ في الاتصال بقاعدة البيانات' };
    }

    const json = await response.json();
    const rows = json.sheet1 || [];

    // Find matching code
    const match = rows.find((r: any) => {
      // Normalize comparison (trim spaces)
      const sheetCode = String(r.activationCode || '').trim();
      const inputCode = code.trim();
      const sheetIsUsed = String(r.isUsed || '').trim().toLowerCase(); // 'yes' or 'no'
      const sheetPackage = String(r.packageType || '').trim();

      return (
        sheetCode === inputCode &&
        sheetIsUsed === 'no' &&
        sheetPackage === expectedPackageType
      );
    });

    if (match) {
      return { isValid: true, rowId: match.id };
    } else {
      return { isValid: false, error: 'الكود غير صحيح أو مستخدم مسبقاً أو غير مطابق للباقة المختارة' };
    }

  } catch (error) {
    console.error("Error verifying code:", error);
    return { isValid: false, error: 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً' };
  }
};

/**
 * Consumes the code by setting isUsed to 'Yes' via PUT request
 */
export const consumeActivationCode = async (rowId: number): Promise<boolean> => {
  try {
    const url = `${CODES_API_URL}/${rowId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER
      },
      body: JSON.stringify({
        sheet1: {
          isUsed: 'Yes'
        }
      })
    });

    if (response.ok) {
      return true;
    } else {
      console.error("Failed to update code status");
      return false;
    }
  } catch (error) {
    console.error("Error consuming code:", error);
    return false;
  }
};

export const preloadAllQuestions = async (): Promise<boolean> => {
  try {
    // Add timestamp to bypass browser/network caching
    const timestamp = Date.now();
    const response = await fetch(`https://api.sheety.co/e1d05c2504d597feb758d2d88e581b32/dagshny/sheet1?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        ...AUTH_HEADER
      }
    });

    if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        return false;
    }

    const json = await response.json();
    GLOBAL_QUESTIONS_CACHE = json.sheet1 || [];
    console.log("Questions loaded:", GLOBAL_QUESTIONS_CACHE.length);
    
    // Debug: Log unique categories found in the sheet to help verify spelling
    const categories = new Set(GLOBAL_QUESTIONS_CACHE.map((q: any) => q.category?.trim()));
    console.log("Categories found in Sheet:", Array.from(categories));
    
    return true;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return false;
  }
};

const filterByTier = (item: any): boolean => {
  const tier = Number(item.tier);
  
  if (ACTIVE_TIER_MODE === 'free') {
    // Free Version: Fetch/Filter questions where tier == 1
    return tier === 1;
  }
  
  if (ACTIVE_TIER_MODE === 'plus') {
    // Plus Pack: Fetch/Filter questions where tier == 2
    return tier === 2;
  }
  
  if (ACTIVE_TIER_MODE === 'pro') {
    // Pro Pack: Fetch/Filter questions where tier == 2 OR tier == 3
    return tier === 2 || tier === 3;
  }

  return false;
};

const getQuestionsByCategory = (selectedCategory: string) => {
  // 1. Filter by Category Name (trimmed)
  // 2. Filter by Active Tier Logic
  return GLOBAL_QUESTIONS_CACHE.filter((item: any) => {
    const categoryMatch = (item.category || '').trim() === selectedCategory.trim();
    if (!categoryMatch) return false;
    
    return filterByTier(item);
  });
};

// Helper to map difficulty text to points
const getPoints = (item: any): number => {
  const diff = String(item.difficulty || '').toLowerCase();
  if (diff.includes('400') || diff.includes('متوسط') || diff.includes('medium')) return 400;
  if (diff.includes('600') || diff.includes('صعب') || diff.includes('hard')) return 600;
  return 200; // Default to Easy
};

// Function to calculate how many full games are available for a category
export const getCategoryGameCount = (categoryName: string): number => {
  const questions = getQuestionsByCategory(categoryName);
  if (!questions || questions.length === 0) return 0;
  
  const usedIds = getUsedQuestionIds();
  const isUsed = (idx: number) => usedIds.includes(`${categoryName}-${idx}`);

  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;

  questions.forEach((q, index) => {
    if (isUsed(index)) return;
    const p = getPoints(q);
    if (p === 200) easyCount++;
    else if (p === 400) mediumCount++;
    else if (p === 600) hardCount++;
  });
  
  // A game needs 2 easy, 2 medium, 2 hard.
  const minCount = Math.min(easyCount, mediumCount, hardCount);
  return Math.floor(minCount / 2);
};

export const generateQuestionsForCategory = async (categoryName: string): Promise<Question[]> => {
  // Ensure data is loaded
  if (GLOBAL_QUESTIONS_CACHE.length === 0) {
      await preloadAllQuestions();
  }

  const categoryQuestions = getQuestionsByCategory(categoryName);
  if (categoryQuestions.length === 0) return [];

  const usedIds = getUsedQuestionIds();

  // Map to a structure that includes the original index for ID generation
  const indexedQuestions = categoryQuestions.map((item, index) => ({
    item,
    originalIndex: index,
    points: getPoints(item)
  }));

  // Helper to get random unique items that are NOT used
  const getRandom = (arr: typeof indexedQuestions, n: number) => {
    const available = arr.filter(entry => !usedIds.includes(`${categoryName}-${entry.originalIndex}`));
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  const easy = getRandom(indexedQuestions.filter(e => e.points === 200), 2);
  const medium = getRandom(indexedQuestions.filter(e => e.points === 400), 2);
  const hard = getRandom(indexedQuestions.filter(e => e.points === 600), 2);

  const selectedEntries = [...easy, ...medium, ...hard];

  return selectedEntries.map((entry) => {
    const q = entry.item;
    const index = entry.originalIndex;
    const p = entry.points as Points;

    // Strict Image Mapping based on Sheet Columns
    // theImageOnQuestionScreen -> Appears ONLY on Question Screen
    // theImageOnAnswerScreen -> Appears ONLY on Answer Screen
    const questionImg = q.theImageOnQuestionScreen;
    const answerImg = q.theImageOnAnswerScreen;

    return {
      // Deterministic ID for storage tracking: category-index
      id: `${categoryName}-${index}`, 
      category: categoryName,
      question: q.question,
      answer: q.answer,
      points: p,
      // Legacy imageUrl (not actively used in Modal but good for data completeness)
      imageUrl: questionImg || answerImg, 
      questionImg: questionImg, // Strict mapping: undefined if empty in sheet
      answerImg: answerImg,     // Strict mapping: undefined if empty in sheet
      isUsed: false,
      hint: q.hint,
      tier: q.tier
    };
  });
};