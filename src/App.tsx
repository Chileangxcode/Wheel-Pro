import { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Trash2, RotateCcw, Play, X, UserPlus, Menu, Volume2, VolumeX, Palette, Users, RefreshCw, Save, Bookmark, Copy, Undo2, Redo2, Moon, Sun, PartyPopper, Sparkles, LogIn, LogOut, CloudCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  db, 
  handleFirestoreError, 
  OperationType,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  User 
} from './lib/firebase';

const PALETTES = {
  vibrant: ['#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899', '#3b82f6'],
  neon: ['#ff0055', '#00ffcc', '#ccff00', '#ff9900', '#ff00ff', '#00ccff', '#66ff00', '#ff3300'],
  pastel: ['#ffcfd2', '#fde4cf', '#fbf8cc', '#d6e2e9', '#bcd4e6', '#c0fdff', '#cfbaf0', '#f1c0e8'],
  indigo: ['#1e1b4b', '#312e81', '#3730a3', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'],
  earth: ['#451a03', '#78350f', '#92400e', '#b45309', '#d97706', '#fbbf24', '#fcd34d', '#fef3c7']
};

const INDICATOR_STYLES = {
  shield: {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
    width: 'w-10',
    height: 'h-12'
  },
  classic: {
    clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
    width: 'w-12',
    height: 'h-10'
  },
  diamond: {
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    width: 'w-10',
    height: 'h-10'
  }
} as const;

const DEFAULT_NAMES = ['Sarah Jenkins', 'Michael Chen', 'Amara Okafor', 'David Miller', 'Elena Rodriguez', 'James Wilson', 'Priya Sharma'];

const TRANSLATIONS = {
  en: {
    title: 'Wheel Pro',
    subtitle: 'Decision Engine',
    entries: 'Entries',
    shuffle: 'Shuffle',
    placeholder: 'Enter names, one per line...',
    updateWheel: 'Update Wheel',
    resetAll: 'Reset All',
    controlPanel: 'Control Panel',
    audioFeed: 'Audio Feed',
    live: 'LIVE',
    muted: 'MUTED',
    cleanup: 'Cleanup',
    autoRemove: 'AUTO-REMOVE',
    persistent: 'PERSISTENT',
    teamBuilder: 'Team Builder',
    count: 'Count',
    capacity: 'Capacity',
    groupCount: 'Group Count',
    membersPerGroup: 'Members per Group',
    assignLeaders: 'Assign Leaders',
    excludeMembers: 'Exclude Members',
    splitIntoTeams: 'Split into Teams',
    visualIdentity: 'Visual Identity',
    custom: 'Custom',
    editor: 'Editor',
    reset: 'Reset',
    indicatorArrow: 'Indicator Arrow',
    style: 'Style',
    color: 'Color',
    physicsEngine: 'Physics Engine',
    momentumDuration: 'Momentum Duration',
    brakingCurve: 'Braking Curve',
    level: 'Level',
    clearAllData: 'Clear All Data',
    running: 'RUNNING',
    system: 'SYSTEM',
    spin: 'SPIN',
    generatedGroups: 'Generated Groups',
    distributedTeams: 'Distributed Teams',
    eachWithLeader: 'Each with Leader',
    historyLog: 'History Log',
    attempt: 'Attempt',
    members: 'Members',
    leader: 'Leader',
    regenerateTeams: 'Regenerate Teams',
    winningSelection: 'Winning Selection',
    selectedByRandomness: 'Selected by Randomness',
    nextSelection: 'Next Selection',
    lastOutcome: 'Last Outcome',
    standby: 'Standby',
    latestWinner: 'Latest Winner',
    awaitingSpin: 'Awaiting Spin',
    poolPopulation: 'Pool Population',
    registered: 'Registered',
    participants: 'Participants',
    realtimeEngine: 'Real-time Engine',
    processing: 'Processing',
    stable: 'Stable',
    savedCollections: 'Saved Collections',
    newCollectionPlaceholder: 'New collection name...',
    noSavedGroups: 'No saved groups',
    victorySecured: 'Victory Secured',
    copyToClipboard: 'Copy to Clipboard',
    saveCurrentList: 'Save Current List',
    celebration: 'Celebration',
    winMessageLabel: 'Win Message',
    winMessagePlaceholder: 'Congrats!',
    confettiStyle: 'Confetti Style',
    confettiStandard: 'Standard',
    confettiFireworks: 'Fireworks',
    confettiStars: 'Stars',
    confettiHearts: 'Hearts',
    animationStyle: 'Animation Style',
    animBounce: 'Bounce',
    animSlide: 'Slide',
    animZoom: 'Zoom',
    loginWithGoogle: 'Login with Google',
    logout: 'Logout',
    syncing: 'Syncing...',
    synced: 'Cloud Synced',
    welcome: 'Welcome'
  },
  km: {
    title: 'កង់សំណាង Pro',
    subtitle: 'ម៉ាស៊ីនសម្រេចចិត្ត',
    entries: 'បញ្ជីឈ្មោះ',
    shuffle: 'ច្របល់',
    placeholder: 'បញ្ចូលឈ្មោះ ម្នាក់មួយបន្ទាត់...',
    updateWheel: 'ធ្វើបច្ចុប្បន្នភាពកង់',
    resetAll: 'កំណត់ឡើងវិញទាំងអស់',
    controlPanel: 'ផ្ទាំងបញ្ជា',
    audioFeed: 'សំឡេង',
    live: 'បើក',
    muted: 'បិទ',
    cleanup: 'សម្អាត',
    autoRemove: 'លុបអ្នកឈ្នះស្វ័យប្រវត្តិ',
    persistent: 'រក្សាទុកអ្នកឈ្នះ',
    teamBuilder: 'បង្កើតក្រុម',
    count: 'ចំនួនក្រុម',
    capacity: 'ចំនួនសមាជិក',
    groupCount: 'ចំនួនក្រុម',
    membersPerGroup: 'សមាជិកក្នុងមួយក្រុម',
    assignLeaders: 'កំណត់ប្រធានក្រុម',
    excludeMembers: 'ដកសមាជិកចេញ',
    splitIntoTeams: 'បែងចែកក្រុម',
    visualIdentity: 'អត្តសញ្ញាណកង់',
    custom: 'តាមចិត្ត',
    editor: 'កែសម្រួល',
    reset: 'កំណត់ឡើងវិញ',
    indicatorArrow: 'ព្រួញចង្អុល',
    style: 'រចនាប័ទ្ម',
    color: 'ពណ៌',
    physicsEngine: 'ម៉ាស៊ីនចលនា',
    momentumDuration: 'រយៈពេលវិល',
    brakingCurve: 'ល្បឿនបញ្ឈប់',
    level: 'កម្រិត',
    clearAllData: 'លុបទិន្នន័យទាំងអស់',
    running: 'កំពុងដំណើរការ',
    system: 'ប្រព័ន្ធ',
    spin: 'វិល',
    generatedGroups: 'ក្រុមដែលបានបង្កើត',
    distributedTeams: 'ក្រុមបែងចែករួច',
    eachWithLeader: 'មានប្រធានក្រុមម្នាក់ៗ',
    historyLog: 'ប្រវត្តិ',
    attempt: 'លើកទី',
    members: 'សមាជិក',
    leader: 'ប្រធាន',
    regenerateTeams: 'បង្កើតក្រុមឡើងវិញ',
    winningSelection: 'ជម្រើសដែលឈ្នះ',
    selectedByRandomness: 'ជ្រើសរើសដោយចៃដន្យ',
    nextSelection: 'បន្តបន្ទាប់',
    lastOutcome: 'លទ្ធផលចុងក្រោយ',
    standby: 'រង់ចាំ',
    latestWinner: 'អ្នកឈ្នះចុងក្រោយ',
    awaitingSpin: 'រង់ចាំការវិល',
    poolPopulation: 'ចំនួនអ្នកចូលរួមសរុប',
    registered: 'បានចុះឈ្មោះ',
    participants: 'អ្នកចូលរួម',
    realtimeEngine: 'ម៉ាស៊ីនពេលវេលាជាក់ស្តែង',
    processing: 'កំពុងវិភាគ',
    stable: 'ធម្មតា',
    savedCollections: 'បញ្ជីដែលបានរក្សាទុក',
    newCollectionPlaceholder: 'ឈ្មោះបញ្ជីថ្មី...',
    noSavedGroups: 'មិនមានក្រុមដែលបានរក្សាទុកទេ',
    victorySecured: 'ជ័យជំនះត្រូវបានបញ្ជាក់',
    copyToClipboard: 'ចម្លងទៅកាន់ Clipboard',
    saveCurrentList: 'រក្សាទុកបញ្ជីបច្ចុប្បន្ន',
    celebration: 'ការអបអរសាទរ',
    winMessageLabel: 'សារអបអរ',
    winMessagePlaceholder: 'អបអរសាទរ!',
    confettiStyle: 'ម៉ូដកន្ត្របផ្កា',
    confettiStandard: 'ស្តង់ដារ',
    confettiFireworks: 'កាំជ្រួច',
    confettiStars: 'ផ្កាយ',
    confettiHearts: 'បេះដូង',
    animationStyle: 'ម៉ូដចលនា',
    animBounce: 'លោត',
    animSlide: 'រុញ',
    animZoom: 'ពង្រីក',
    loginWithGoogle: 'ចូលដោយប្រើ Google',
    logout: 'ចាកចេញ',
    syncing: 'កំពុងភ្ជាប់...',
    synced: 'បានភ្ជាប់ជាមួយ Cloud',
    welcome: 'សូមស្វាគមន៍'
  }
};

const winAnimations = {
  bounce: {
    initial: { scale: 0.8, y: 100, rotate: -3, opacity: 0 },
    animate: { scale: 1, y: 0, rotate: 0, opacity: 1 },
    exit: { scale: 0.8, y: 100, rotate: 3, opacity: 0 },
    transition: { type: "spring", damping: 12 }
  },
  slide: {
    initial: { x: -300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: { type: "spring", damping: 20 }
  },
  zoom: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 2, opacity: 0 },
    transition: { type: "spring", damping: 15 }
  }
} as const;

export default function App() {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [inputText, setInputText] = useState(DEFAULT_NAMES.join('\n'));
  const [language, setLanguage] = useState<'en' | 'km'>('en');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('wheel_dark_mode');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [history, setHistory] = useState<string[]>([DEFAULT_NAMES.join('\n')]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [spinDuration, setSpinDuration] = useState(5); // in seconds
  const [decelerationPower, setDecelerationPower] = useState(4);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [currentPalette, setCurrentPalette] = useState<string>('vibrant');
  const [customColors, setCustomColors] = useState<string[]>(['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6']);
  const [indicatorStyle, setIndicatorStyle] = useState<keyof typeof INDICATOR_STYLES>('shield');
  const [indicatorColor, setIndicatorColor] = useState('#4f46e5');
  const [numGroups, setNumGroups] = useState(2);
  const [groupSize, setGroupSize] = useState(3);
  const [groupMode, setGroupMode] = useState<'count' | 'size'>('count');
  const [excludedNames, setExcludedNames] = useState<string[]>([]);
  const [pickLeaders, setPickLeaders] = useState(false);
  const [generatedGroups, setGeneratedGroups] = useState<{ name: string; isLeader: boolean }[][] | null>(null);
  const [groupHistory, setGroupHistory] = useState<{ timestamp: number; groups: { name: string; isLeader: boolean }[][] }[]>([]);
  const [savedGroups, setSavedGroups] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('wheel_presets');
    return saved ? JSON.parse(saved) : {};
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [confettiStyle, setConfettiStyle] = useState<'standard' | 'fireworks' | 'stars' | 'hearts'>('standard');
  const [winAnimationStyle, setWinAnimationStyle] = useState<'bounce' | 'slide' | 'zoom'>('zoom');
  const [customWinMessage, setCustomWinMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Settings sync with Firestore
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Initial fetch
    const fetchSettings = async () => {
      setIsSyncing(true);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.darkMode !== undefined) setDarkMode(data.darkMode);
          if (data.language !== undefined) setLanguage(data.language as 'en' | 'km');
          if (data.spinDuration !== undefined) setSpinDuration(data.spinDuration);
          if (data.decelerationPower !== undefined) setDecelerationPower(data.decelerationPower);
          if (data.currentPalette !== undefined) setCurrentPalette(data.currentPalette);
          if (data.indicatorStyle !== undefined) setIndicatorStyle(data.indicatorStyle as any);
          if (data.indicatorColor !== undefined) setIndicatorColor(data.indicatorColor);
          if (data.confettiStyle !== undefined) setConfettiStyle(data.confettiStyle as any);
          if (data.winAnimationStyle !== undefined) setWinAnimationStyle(data.winAnimationStyle as any);
          if (data.customWinMessage !== undefined) setCustomWinMessage(data.customWinMessage);
        } else {
          // Initialize user doc
          await setDoc(userDocRef, {
            darkMode,
            language,
            spinDuration,
            decelerationPower,
            currentPalette,
            indicatorStyle,
            indicatorColor,
            confettiStyle,
            winAnimationStyle,
            customWinMessage,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchSettings();

    // We don't subscribe to settings in real-time to avoid infinite loops with state updates
    // but we will update Firestore when local state changes
  }, [user]);

  // Push local settings to Firestore when they change
  useEffect(() => {
    if (!user || !authReady) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          darkMode,
          language,
          spinDuration,
          decelerationPower,
          currentPalette,
          indicatorStyle,
          indicatorColor,
          confettiStyle,
          winAnimationStyle,
          customWinMessage,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.warn("Failed to sync settings:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 2000); // Debounce sync

    return () => clearTimeout(timer);
  }, [darkMode, language, spinDuration, decelerationPower, currentPalette, indicatorStyle, indicatorColor, confettiStyle, winAnimationStyle, customWinMessage, user, authReady]);

  // Presets sync
  useEffect(() => {
    if (!user) {
      // If logged out, load from local storage
      const saved = localStorage.getItem('wheel_presets');
      if (saved) setSavedGroups(JSON.parse(saved));
      return;
    }

    const presetsRef = collection(db, 'users', user.uid, 'presets');
    const unsubscribe = onSnapshot(presetsRef, (snapshot) => {
      const presets: Record<string, string[]> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        presets[data.name] = data.names;
      });
      setSavedGroups(presets);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/presets`);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync dark mode to html class
  useEffect(() => {
    localStorage.setItem('wheel_dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('color-scheme', 'light');
    }
  }, [darkMode]);
  
  // Sync groups to local storage
  useEffect(() => {
    localStorage.setItem('wheel_presets', JSON.stringify(savedGroups));
  }, [savedGroups]);

  const saveCurrentList = async () => {
    if (!newGroupName.trim() || names.length === 0) return;
    
    if (user) {
      setIsSyncing(true);
      try {
        const presetId = newGroupName.trim().toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'users', user.uid, 'presets', presetId), {
          name: newGroupName.trim(),
          names: [...names],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/presets`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setSavedGroups(prev => ({
        ...prev,
        [newGroupName.trim()]: [...names]
      }));
    }
    
    setNewGroupName('');
    playUIPop();
  };

  const loadGroup = (groupName: string) => {
    const groupNames = savedGroups[groupName];
    if (groupNames) {
      setNames(groupNames);
      const text = groupNames.join('\n');
      setInputText(text);
      pushToHistory(text);
      playUIPop();
    }
  };

  const deleteGroup = async (groupName: string) => {
    if (user) {
      setIsSyncing(true);
      const presetId = groupName.trim().toLowerCase().replace(/\s+/g, '-');
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'presets', presetId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/presets/${presetId}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      const next = { ...savedGroups };
      delete next[groupName];
      setSavedGroups(next);
    }
    playUIPop(true);
  };

  const pushToHistory = useCallback((newText: string) => {
    setHistory(prev => {
      // Don't push if it's the same as the current position
      if (newText === prev[historyIndex]) return prev;
      
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newText);
      // Keep last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => {
      // If we shifted, we need to adjust index, but since we are at historyIndex + 1 usually...
      // standard slice/push behavior:
      const nextIndex = Math.min(historyIndex + 1, 49);
      return nextIndex;
    });
  }, [historyIndex]);

  const t = useCallback((key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key];
  }, [language]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevText = history[prevIndex];
      setHistoryIndex(prevIndex);
      setInputText(prevText);
      const nextNames = prevText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
      setNames(nextNames);
      playUIPop();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextText = history[nextIndex];
      setHistoryIndex(nextIndex);
      setInputText(nextText);
      const nextNames = nextText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
      setNames(nextNames);
      playUIPop();
    }
  };
  
  const COLORS = currentPalette === 'custom' ? customColors : PALETTES[currentPalette as keyof typeof PALETTES];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSegmentIndexRef = useRef<number>(-1);

  // Audio Helpers
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTick = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted]);

  const playWin = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }, [isMuted]);

  const playUIPop = useCallback((isClosing = false) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = isClosing ? 400 : 600;
    const endFreq = isClosing ? 200 : 800;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [isMuted]);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.45;

    ctx.clearRect(0, 0, size, size);

    const segmentAngle = (2 * Math.PI) / names.length;

    names.forEach((name, i) => {
      const startAngle = i * segmentAngle + rotationRef.current;
      const endAngle = (i + 1) * segmentAngle + rotationRef.current;
      const isHovered = i === hoveredIndex && !isSpinning;

      // Draw segment
      ctx.save();
      
      if (isHovered) {
        // Pop out effect for hovered segment
        const midAngle = startAngle + segmentAngle / 2;
        ctx.translate(Math.cos(midAngle) * 15, Math.sin(midAngle) * 15);
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
      }

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      
      if (isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      }

      ctx.strokeStyle = 'white';
      ctx.lineWidth = isHovered ? 4 : 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.max(14, radius / 10)}px Outfit`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fillText(name, radius - (isHovered ? 30 : 20), 10);
      ctx.restore();
      
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw "SPIN" text in center if not spinning
    if (!isSpinning) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('SPIN', centerX, centerY + 6);
    }
  }, [names, isSpinning, hoveredIndex, COLORS]);

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const dist = Math.sqrt(x * x + y * y);
    const radius = rect.width / 2 * 0.9; 

    if (dist > radius || dist < rect.width / 2 * 0.15) {
      if (hoveredIndex !== null) setHoveredIndex(null);
      return;
    }

    let angle = Math.atan2(y, x) - rotationRef.current;
    while (angle < 0) angle += Math.PI * 2;
    angle = angle % (Math.PI * 2);
    
    const segmentAngle = (2 * Math.PI) / names.length;
    const index = Math.floor(angle / segmentAngle) % names.length;
    
    if (index !== hoveredIndex) {
      setHoveredIndex(index);
    }
  };

  const handleCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const dist = Math.sqrt(x * x + y * y);
    const radius = rect.width / 2 * 0.9; 

    // Clicked in center (Spin Button)
    if (dist < rect.width / 2 * 0.15) {
      spin();
      return;
    }

    // Clicked on segment
    if (dist <= radius) {
      spin();
    }
  };

  useEffect(() => {
    drawWheel();
    window.addEventListener('resize', drawWheel);
    return () => window.removeEventListener('resize', drawWheel);
  }, [drawWheel]);

  const spin = () => {
    if (isSpinning || names.length < 2) return;

    initAudio();
    setIsSpinning(true);
    setWinner(null);
    setHoveredIndex(null);
    lastSegmentIndexRef.current = -1;

    const startTime = performance.now();
    const durationCount = spinDuration * 1000;
    const startRotation = rotationRef.current;
    const totalRotation = startRotation + (Math.PI * 2 * (10 + Math.random() * 5));

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationCount, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, decelerationPower);
      rotationRef.current = startRotation + (totalRotation - startRotation) * easeOut;
      
      // Sound tick detection
      const segmentAngle = (2 * Math.PI) / names.length;
      const indicatorAngle = 3 * Math.PI / 2;
      let winAngle = (indicatorAngle - rotationRef.current) % (Math.PI * 2);
      if (winAngle < 0) winAngle += Math.PI * 2;
      const currentSegmentIndex = Math.floor(winAngle / segmentAngle) % names.length;
      
      if (currentSegmentIndex !== lastSegmentIndexRef.current) {
        playTick();
        lastSegmentIndexRef.current = currentSegmentIndex;
      }

      drawWheel();

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        calculateWinner();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const calculateWinner = () => {
    const segmentAngle = (2 * Math.PI) / names.length;
    const indicatorAngle = 3 * Math.PI / 2;
    
    let winAngle = (indicatorAngle - rotationRef.current) % (Math.PI * 2);
    if (winAngle < 0) winAngle += Math.PI * 2;
    
    const winningIndex = Math.floor(winAngle / segmentAngle) % names.length;
    const winnerName = names[winningIndex];
    
    setWinner(winnerName);
    playWin();
    playUIPop();
    
    // Confetti styles mapping
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    if (confettiStyle === 'fireworks') {
      const duration = 15 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else if (confettiStyle === 'stars') {
      const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'] };
      const shoot = () => {
        confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] });
        confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ['circle'] });
      };
      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    } else if (confettiStyle === 'hearts') {
      const heart = confetti.shapeFromPath({ path: 'M0 200 v-200 h200 a100,100 90 0,1 0,200 a100,100 90 0,1 -200,0 z', matrix: [1, 0, 0, 1, -100, -100] });
      const defaults = { spread: 360, ticks: 100, gravity: 0.5, decay: 0.94, startVelocity: 20, colors: ['#ff0000', '#ff6666', '#ffb3b3'] };
      confetti({ ...defaults, particleCount: 50, scalar: 2, shapes: [heart] });
    } else {
      // Standard Celebration
      const count = 200;
      const burstDefaults = { origin: { y: 0.7 }, colors: COLORS };
      function fire(particleRatio: number, opts: any) {
        confetti({ ...burstDefaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      }
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  };

  const updateNames = () => {
    initAudio();
    const newNames = inputText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    
    if (newNames.length > 0) {
      setNames(newNames);
      pushToHistory(inputText);
    }
  };

  const reset = () => {
    initAudio();
    setNames(DEFAULT_NAMES);
    setInputText(DEFAULT_NAMES.join('\n'));
    pushToHistory(DEFAULT_NAMES.join('\n'));
    rotationRef.current = 0;
    setWinner(null);
    drawWheel();
  };

  const generateGroups = () => {
    const activeNames = names.filter(n => !excludedNames.includes(n));
    if (activeNames.length < 2) return;
    
    initAudio();
    playUIPop();
    
    const shuffled = [...activeNames].sort(() => Math.random() - 0.5);
    
    let targetGroupCount = numGroups;
    if (groupMode === 'size') {
      targetGroupCount = Math.max(1, Math.ceil(shuffled.length / groupSize));
    }
    
    const groups: { name: string; isLeader: boolean }[][] = Array.from({ length: targetGroupCount }, () => []);
    
    shuffled.forEach((name, i) => {
      groups[i % targetGroupCount].push({ name, isLeader: false });
    });

    // Pick leaders if enabled
    if (pickLeaders) {
      groups.forEach(group => {
        if (group.length > 0) {
          const leaderIdx = Math.floor(Math.random() * group.length);
          group[leaderIdx].isLeader = true;
        }
      });
    }
    
    setGeneratedGroups(groups);
    setGroupHistory(prev => [{ timestamp: Date.now(), groups }, ...prev].slice(0, 5));
    
    // Confetti for grouping
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: COLORS
    });
  };

  const toggleExclusion = (name: string) => {
    setExcludedNames(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
    playUIPop();
  };

  const copyGroupsToClipboard = () => {
    if (!generatedGroups) return;
    const text = generatedGroups.map((group, i) => {
      const gName = `Group ${String.fromCharCode(65 + i)}:\n`;
      const gMembers = group.map(m => ` - ${m.name}${m.isLeader ? ' (Leader)' : ''}`).join('\n');
      return gName + gMembers;
    }).join('\n\n');
    
    navigator.clipboard.writeText(text);
    playUIPop();
    // Maybe add a temporary toast or success state if needed
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${language === 'km' ? 'font-khmer' : 'font-sans'} text-slate-900 dark:text-slate-50 flex flex-col select-none overflow-hidden h-screen w-full transition-colors duration-300`}>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden w-full relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{t('title')}</h1>
            <p className="text-[8px] text-indigo-500 font-black uppercase tracking-widest leading-none">{t('subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setDarkMode(!darkMode); playUIPop(); }}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => { setLanguage(l => l === 'en' ? 'km' : 'en'); playUIPop(); }}
            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400"
          >
            {language === 'en' ? 'KM' : 'EN'}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Control Panel (Bento Style) */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside 
            initial={{ opacity: 0, x: -320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -320 }}
            className={`fixed md:relative z-40 inset-y-0 left-0 w-[320px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col space-y-6 shadow-xl md:shadow-none transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto scrollbar-hide`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                  <RotateCw className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t('title')}</h1>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setDarkMode(!darkMode); playUIPop(); }}
                  className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black"
                  title="Toggle Dark Mode"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => { setLanguage(l => l === 'en' ? 'km' : 'en'); playUIPop(); }}
                  className="w-10 h-10 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-indigo-600"
                  title="Switch Language"
                >
                  {language === 'en' ? 'KM' : 'EN'}
                </button>
              </div>
            </div>

            {/* Auth Section */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                 <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{user ? t('welcome') : t('controlPanel')}</label>
                 <div className="flex items-center gap-2">
                   {isSyncing && <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />}
                   {!isSyncing && user && <Bookmark className="w-3.5 h-3.5 text-emerald-500" />}
                 </div>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                 {user ? (
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-indigo-100 dark:border-indigo-900 shadow-sm" referrerPolicy="no-referrer" />
                       <div className="flex flex-col">
                         <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none mb-1 truncate max-w-[120px] uppercase tracking-tight">{user.displayName}</span>
                         <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('synced')}</span>
                         </div>
                       </div>
                     </div>
                     <button
                       onClick={() => signOut(auth)}
                       className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                       title={t('logout')}
                     >
                       <LogOut className="w-4 h-4" />
                     </button>
                   </div>
                 ) : (
                   <button
                     onClick={() => signInWithPopup(auth, googleProvider)}
                     className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-sm transition-all group active:scale-95"
                   >
                     <div className="w-7 h-7 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40 transition-colors">
                       <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                     </div>
                     <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{t('loginWithGoogle')}</span>
                   </button>
                 )}
               </div>
            </div>

            {/* Names Input Bento Section */}
            <div className="flex-1 min-h-[380px] flex flex-col bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] group focus-within:border-indigo-200 dark:focus-within:border-indigo-900 transition-colors">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{t('entries')}</label>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{names.length}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const shuffled = [...names].sort(() => Math.random() - 0.5);
                      setNames(shuffled);
                      const text = shuffled.join('\n');
                      setInputText(text);
                      pushToHistory(text);
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('shuffle')}
                  </button>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700">
                    <button 
                      onClick={undo}
                      disabled={historyIndex === 0}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Undo"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                      title="Redo"
                    >
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onBlur={() => pushToHistory(inputText)}
                placeholder={t('placeholder')}
                className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm font-medium resize-none leading-relaxed text-slate-600 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 outline-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
              />
            </div>

            {/* Saved Groups (Presets) Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('savedCollections')}</label>
                <Bookmark className="w-3 h-3 text-indigo-500" />
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder={t('newCollectionPlaceholder')}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-200"
                  />
                  <button
                    onClick={saveCurrentList}
                    disabled={!newGroupName.trim() || names.length === 0}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-90"
                    title={t('saveCurrentList')}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                  {Object.entries(savedGroups).length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{t('noSavedGroups')}</p>
                    </div>
                  ) : (
                    Object.entries(savedGroups).map(([name, list]: [string, string[]]) => (
                      <div 
                        key={name}
                        className="group flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-sm transition-all"
                      >
                        <button 
                          onClick={() => loadGroup(name)}
                          className="flex-1 flex flex-col items-start text-left"
                        >
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight leading-none mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase">{name}</span>
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{list.length} {t('members')}</span>
                        </button>
                        <button 
                          onClick={() => deleteGroup(name)}
                          className="p-1.5 text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={updateNames}
                className="group relative bg-slate-900 dark:bg-slate-800 overflow-hidden text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95 text-sm"
              >
                <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{t('updateWheel')}</span>
              </button>
              <button
                onClick={reset}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm active:scale-95"
              >
                {t('resetAll')}
              </button>
            </div>

            {/* Decision Settings Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">{t('controlPanel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { initAudio(); setIsMuted(!isMuted); }}
                  className={`p-4 rounded-3xl border transition-all flex flex-col items-start gap-4 ${isMuted ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 shadow-sm shadow-indigo-50 dark:shadow-none'}`}
                >
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${isMuted ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'}`}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">{t('audioFeed')}</span>
                    <span className={`text-[11px] font-black ${isMuted ? 'text-slate-500 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>{isMuted ? t('muted') : t('live')}</span>
                  </div>
                </button>

                <div className={`p-4 rounded-3xl border transition-all flex flex-col items-start gap-4 relative overflow-hidden ${!removeWinner ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 shadow-sm shadow-indigo-50 dark:shadow-none'}`}>
                  <div className="flex justify-between w-full items-start">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${!removeWinner ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'}`}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <button 
                      onClick={() => setRemoveWinner(!removeWinner)}
                      className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${removeWinner ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <motion.div 
                        initial={false}
                        animate={{ x: removeWinner ? 22 : 2 }}
                        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-wider">{t('cleanup')}</span>
                    <span className={`text-[11px] font-black tracking-tight ${!removeWinner ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>{removeWinner ? t('autoRemove') : t('persistent')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Builder Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{t('teamBuilder')}</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button 
                    onClick={() => { setGroupMode('count'); playUIPop(); }}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${groupMode === 'count' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                  >{t('count')}</button>
                  <button 
                    onClick={() => { setGroupMode('size'); playUIPop(); }}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${groupMode === 'size' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}
                  >{t('capacity')}</button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <span>{groupMode === 'count' ? t('groupCount') : t('membersPerGroup')}</span>
                    <span className="text-slate-900 dark:text-slate-100 font-black text-xs">
                      {groupMode === 'count' ? numGroups : groupSize}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max={groupMode === 'count' ? Math.max(2, names.length) : Math.max(2, names.length)} 
                    step="1"
                    value={groupMode === 'count' ? numGroups : groupSize}
                    onChange={(e) => groupMode === 'count' ? setNumGroups(parseInt(e.target.value)) : setGroupSize(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 slider-thumb"
                  />
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('assignLeaders')}</span>
                    <button 
                      onClick={() => { setPickLeaders(!pickLeaders); playUIPop(); }}
                      className={`w-10 h-5 rounded-full transition-all relative ${pickLeaders ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${pickLeaders ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Exclusions */}
                {names.length > 0 && (
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">{t('excludeMembers')}</span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-hide py-1">
                      {names.map(name => (
                        <button
                          key={name}
                          onClick={() => toggleExclusion(name)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all border ${
                            excludedNames.includes(name) 
                              ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 line-through' 
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-100 dark:hover:border-indigo-900'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={generateGroups}
                  disabled={names.filter(n => !excludedNames.includes(n)).length < 2}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale text-white font-black py-4 rounded-2xl transition-all active:scale-95 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                  {t('splitIntoTeams')}
                </button>
              </div>
            </div>

            {/* Visual Theme Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">{t('visualIdentity')}</label>
              <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-3">
                {(Object.keys(PALETTES) as Array<keyof typeof PALETTES>).map((pKey) => (
                  <button
                    key={pKey}
                    onClick={() => { setCurrentPalette(pKey); playUIPop(); }}
                    className={`flex-shrink-0 w-20 p-2 rounded-[1.25rem] border transition-all ${currentPalette === pKey ? 'bg-white dark:bg-slate-800 border-slate-900 dark:border-indigo-500 shadow-md ring-2 ring-slate-900 dark:ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}`}
                  >
                    <div className="grid grid-cols-2 gap-1 mb-2">
                       {PALETTES[pKey].slice(0, 4).map((c, i) => (
                         <div key={i} className="w-full h-3 rounded-md" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${currentPalette === pKey ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                      {pKey}
                    </span>
                  </button>
                ))}
                
                {/* Custom Palette Option */}
                <button
                  onClick={() => { setCurrentPalette('custom'); playUIPop(); }}
                  className={`flex-shrink-0 w-20 p-2 rounded-[1.25rem] border transition-all ${currentPalette === 'custom' ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-400 shadow-md ring-2 ring-indigo-600 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  <div className="grid grid-cols-2 gap-1 mb-2">
                     {customColors.slice(0, 4).map((c, i) => (
                       <div key={i} className="w-full h-3 rounded-md" style={{ backgroundColor: c }} />
                     ))}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${currentPalette === 'custom' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
                    {t('custom')}
                  </span>
                </button>
              </div>

              {/* Custom Color Editor */}
              <AnimatePresence>
                {currentPalette === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                       <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('editor')}</span>
                       <button 
                         onClick={() => setCustomColors(PALETTES.vibrant)}
                         className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                       >
                         {t('reset')}
                       </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {customColors.map((color, idx) => (
                        <div key={idx} className="relative group">
                          <input 
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const next = [...customColors];
                              next[idx] = e.target.value;
                              setCustomColors(next);
                            }}
                            className="w-full h-8 rounded-lg cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Indicator Customization Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">{t('indicatorArrow')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">{t('style')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(INDICATOR_STYLES) as Array<keyof typeof INDICATOR_STYLES>).map((style) => (
                      <button
                        key={style}
                        onClick={() => { setIndicatorStyle(style); playUIPop(); }}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${indicatorStyle === style ? 'bg-indigo-600 border-indigo-600 shadow-md ring-2 ring-indigo-600/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'}`}
                      >
                         <div 
                           className={`w-5 h-6 ${indicatorStyle === style ? 'bg-white' : 'bg-slate-300 dark:bg-slate-700'}`} 
                           style={{ clipPath: INDICATOR_STYLES[style].clipPath }} 
                         />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-1">{t('color')}</span>
                  <div className="flex items-center gap-2 h-full">
                    <input 
                      type="color"
                      value={indicatorColor}
                      onChange={(e) => setIndicatorColor(e.target.value)}
                      className="w-full h-11 rounded-2xl cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Celebration Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">{t('celebration')}</label>
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-3xl">
                {/* Win Message */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('winMessageLabel')}</label>
                  <input
                    type="text"
                    value={customWinMessage}
                    onChange={(e) => setCustomWinMessage(e.target.value)}
                    placeholder={t('winMessagePlaceholder')}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>

                {/* Confetti Style */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('confettiStyle')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['standard', 'fireworks', 'stars', 'hearts'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => { setConfettiStyle(style); playUIPop(); }}
                        className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${confettiStyle === style ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <PartyPopper className="w-3.5 h-3.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">{t(`confetti${style.charAt(0).toUpperCase() + style.slice(1)}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Style */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('animationStyle')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bounce', 'slide', 'zoom'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => { setWinAnimationStyle(style); playUIPop(); }}
                        className={`py-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${winAnimationStyle === style ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter">{t(`anim${style.charAt(0).toUpperCase() + style.slice(1)}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Spin Settings Bento */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-7 text-white space-y-7 shadow-2xl shadow-indigo-200/50 dark:shadow-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('physicsEngine')}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                   <Play className="w-3 h-3 text-indigo-400 translate-x-0.5" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{t('momentumDuration')}</span>
                  <span className="text-white font-black text-xs">{spinDuration}s</span>
                </div>
                <input 
                  type="range" min="2" max="10" step="1"
                  value={spinDuration}
                  onChange={(e) => setSpinDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 slider-thumb"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{t('brakingCurve')}</span>
                  <span className="text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-lg text-[10px] font-black">{t('level')} {decelerationPower}</span>
                </div>
                <input 
                  type="range" min="2" max="8" step="1"
                  value={decelerationPower}
                  onChange={(e) => setDecelerationPower(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400 slider-thumb"
                />
              </div>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => { setInputText(''); setNames([]); playUIPop(true); }}
                className="group flex items-center justify-center gap-1.5 mx-auto text-[10px] font-black text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
              >
                <Trash2 className="w-3 h-3 transition-transform group-hover:scale-110" />
                {t('clearAllData')}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <main className="flex-1 h-full relative flex items-center justify-center bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {/* Procedural Grid Background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

        {/* Decorative Circles */}
        <div className="absolute w-[600px] h-[600px] border border-indigo-200/50 dark:border-indigo-500/20 rounded-full opacity-20 pointer-events-none"></div>
        <div className="absolute w-[750px] h-[750px] border border-indigo-200/30 dark:border-indigo-500/10 rounded-full opacity-10 pointer-events-none"></div>

        {/* The Wheel Visual */}
        <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center drop-shadow-[0_45px_100px_rgba(0,0,0,0.15)] p-6 md:p-12 -translate-y-8">
          
          {/* Top Indicator Pin - Precision Point */}
          <motion.div 
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center"
            animate={isSpinning ? {
              y: [0, 6, 0],
              transition: { 
                repeat: Infinity, 
                duration: 0.12,
                ease: "linear"
              }
            } : { y: 0 }}
          >
            <div 
              className={`${INDICATOR_STYLES[indicatorStyle].width} ${INDICATOR_STYLES[indicatorStyle].height} bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden`} 
              style={{ clipPath: INDICATOR_STYLES[indicatorStyle].clipPath }}
            >
              <div 
                className="w-full h-full shadow-[inset_0_0_15px_rgba(0,0,0,0.05)] flex items-center justify-center"
                style={{ backgroundColor: indicatorColor }}
              >
                <div className="w-1/4 h-1/4 bg-white/30 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="w-1 h-3 rounded-full mt-1 blur-[1px]" style={{ backgroundColor: `${indicatorColor}4d` }} />
          </motion.div>

          {/* Luxury Outer Bezel Ring */}
          <div className="absolute inset-2 md:inset-6 rounded-full border-[16px] md:border-[24px] border-white dark:border-slate-800 z-20 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] pointer-events-none flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-slate-100/50 dark:border-slate-700/50" />
          </div>

          {/* The Canvas Wheel Container */}
          <div className="w-full h-full rounded-full relative overflow-hidden z-10 flex items-center justify-center ring-1 ring-slate-100 dark:ring-slate-800">
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              className="w-full h-full cursor-pointer transition-transform duration-700"
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </div>

          {/* Center Multi-Stage Hub */}
          <div className="absolute z-30 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            {/* Pulsing ring background */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-2xl shadow-slate-400 dark:shadow-indigo-900/50 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-2 border-2 border-slate-50 dark:border-slate-700 rounded-full" />
            
            <button 
              onClick={spin}
              disabled={isSpinning || names.length < 2}
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center text-white transition-all duration-500
                ${isSpinning ? 'bg-slate-800 dark:bg-slate-900 scale-90' : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 active:scale-90 group'}
                ${names.length < 2 ? 'opacity-50 grayscale cursor-not-allowed' : 'opacity-100'}
              `}
            >
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 bg-white transition-opacity" />
              <span className="text-[8px] md:text-[9px] font-black tracking-[0.25em] mb-1 opacity-50">
                {isSpinning ? t('running') : t('system')}
              </span>
              <span className="text-base md:text-xl font-black tracking-widest italic uppercase leading-none">
                {isSpinning ? '...' : t('spin')}
              </span>
              {!isSpinning && names.length >= 2 && (
                <div className="absolute -inset-2 rounded-full border border-indigo-500/20 animate-ping pointer-events-none" />
              )}
            </button>
          </div>
        </div>

        {/* Group Results Modal */}
        <AnimatePresence>
          {generatedGroups && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-xl transition-all"
            >
                <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-white dark:border-slate-800"
              >
                {/* Modal Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-none">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">{t('generatedGroups')}</h2>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em]">
                        {generatedGroups.length} {t('distributedTeams')} {pickLeaders && `• ${t('eachWithLeader')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={copyGroupsToClipboard}
                      className="hidden md:flex w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-slate-700 transition-all active:scale-90"
                      title={t('copyToClipboard')}
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => { setGeneratedGroups(null); playUIPop(true); }}
                      className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Layout: History Sidebar + Main Results */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Session History Sidebar - only desktop */}
                  <div className="hidden lg:flex w-64 border-r border-slate-50 dark:border-slate-800 flex-col bg-slate-50/30">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                      <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('historyLog')}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {groupHistory.map((entry, idx) => (
                        <button
                          key={entry.timestamp}
                          onClick={() => { setGeneratedGroups(entry.groups); playUIPop(); }}
                          className={`w-full text-left p-4 rounded-[1.5rem] border transition-all ${
                            generatedGroups === entry.groups 
                              ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                              : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
                        >
                          <div className="text-[10px] font-black mb-1">{t('attempt')} {groupHistory.length - idx}</div>
                          <div className="text-[9px] font-bold opacity-50">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Carousel/Grid Results */}
                  <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedGroups.map((group, groupIdx) => (
                        <motion.div
                          key={groupIdx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.05 }}
                          className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-slate-900 transition-all group overflow-hidden"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                style={{ backgroundColor: COLORS[groupIdx % COLORS.length] }}
                              >
                                <span className="text-sm font-black uppercase">{String.fromCharCode(65 + groupIdx)}</span>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Group {groupIdx + 1}</span>
                            </div>
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-bold text-slate-500">{group.length} Members</span>
                          </div>
                          
                          <div className="space-y-2">
                            {group.map((item, nameIdx) => (
                              <motion.div 
                                key={nameIdx}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: groupIdx * 0.05 + nameIdx * 0.03 }}
                                className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${item.isLeader ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900 shadow-[0_2px_10px_rgba(79,70,229,0.05)]' : 'bg-white/50 dark:bg-slate-900/50 border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-700'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.isLeader ? '#4f46e5' : COLORS[groupIdx % COLORS.length] }} />
                                  <span className={`text-sm font-black tracking-tight ${item.isLeader ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-800 dark:text-slate-300'}`}>
                                    {item.name}
                                  </span>
                                </div>
                                {item.isLeader && (
                                  <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-indigo-100 dark:border-indigo-900">{t('leader')}</span>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                   <button 
                     onClick={generateGroups}
                     className="px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
                   >
                     <RefreshCw className="w-4 h-4" />
                     {t('regenerateTeams')}
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Modal Overlay - Enhanced Striking Victory Aesthetic */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl"
            >
              {/* Grand Ambient Background */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    background: `conic-gradient(from 0deg, transparent 0deg, ${COLORS[0]} 15deg, transparent 30deg, ${COLORS[2]} 45deg, transparent 60deg, ${COLORS[4]} 75deg, transparent 90deg, ${COLORS[6]} 105deg, transparent 120deg)` 
                  }}
                />
              </div>

              <motion.div
                {...winAnimations[winAnimationStyle]}
                className="relative z-10 bg-white dark:bg-slate-900 rounded-[4rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.5)] max-w-lg w-full overflow-hidden flex flex-col items-center border border-slate-100 dark:border-slate-800"
              >
                {/* Visual Header / Glow */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 to-transparent pointer-events-none" />

                <div className="relative pt-20 pb-16 px-12 md:px-16 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-indigo-200 dark:shadow-none ring-[12px] ring-indigo-50 dark:ring-indigo-900/20"
                  >
                    <PartyPopper className="w-12 h-12" />
                  </motion.div>

                  <div className="space-y-2 mb-10">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-4 inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                        {customWinMessage || t('winningSelection')}
                      </span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="relative"
                    >
                      <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1 break-words">
                        {winner}
                      </h2>
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-4">{t('selectedByRandomness')}</p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="w-full"
                  >
                    <button
                      onClick={() => { 
                        if (removeWinner && winner) {
                          const newNames = names.filter(n => n !== winner);
                          setNames(newNames);
                          setInputText(newNames.join('\n'));
                        }
                        setWinner(null); 
                        playUIPop(true); 
                      }}
                      className="w-full py-6 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                      {t('nextSelection')}
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </motion.div>
                </div>

                {/* Animated Floor Accents */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 flex gap-1 px-10">
                   {COLORS.slice(0, 5).map((c, i) => (
                     <motion.div 
                       key={i}
                       className="flex-1 h-full rounded-full"
                       style={{ backgroundColor: c }}
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                     />
                   ))}
                </div>
              </motion.div>

              {/* Enhanced Floating Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: "50%",
                      y: "50%"
                    }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, Math.random() * 1.5, 0],
                      x: [`${50 + (Math.random() - 0.5) * 10}%`, `${50 + (Math.random() - 0.5) * 80}%`],
                      y: [`${50 + (Math.random() - 0.5) * 10}%`, `${50 + (Math.random() - 0.5) * 80}%`],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      delay: 0.3 + i * 0.1, 
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2
                    }}
                    className="absolute w-2 h-2 rounded-full blur-[1px]"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

      {/* Global Activity Bar - Distinct Footer for Metrics */}
      <div className="hidden lg:flex w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4 space-x-8 justify-center z-20 shadow-[0_-4px_25px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
        <div className="flex items-center space-x-10">
          {/* Last Outcome Block */}
          <div className="flex items-center space-x-4 min-w-[240px]">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">{t('lastOutcome')}</span>
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 flex items-center justify-center font-black text-sm shadow-sm ring-4 ring-indigo-50/50 dark:ring-indigo-900/10">
                   {winner ? winner.substring(0, 1).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col">
                  <p className="font-black text-base text-slate-900 dark:text-white truncate max-w-[150px] tracking-tight leading-tight">
                    {winner || t('standby')}
                  </p>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mt-0.5">
                    {winner ? t('latestWinner') : t('awaitingSpin')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-slate-100/80 dark:bg-slate-800" />

          {/* Stats Cluster */}
          <div className="flex items-center space-x-5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">{t('poolPopulation')}</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{names.length}</span>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">{t('registered')}</span>
                   <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none mt-0.5">{t('participants')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-100/80 dark:bg-slate-800" />

          {/* System Status Cluster */}
          <div className="flex flex-col min-w-[180px]">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">{t('realtimeEngine')}</span>
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-2xl border transition-all duration-300 ${isSpinning ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 shadow-inner'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isSpinning ? 'bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]'}`} />
              <p className={`text-[10px] font-black uppercase tracking-widest ${isSpinning ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {isSpinning ? t('processing') : t('stable')}
              </p>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-100/80 dark:bg-slate-800" />

          {/* Credits Cluster */}
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">Developer</span>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest leading-none">GenZ : OU CHILEANG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
