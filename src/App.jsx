import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const APP_CONFIG = {
  name: "Crack CA",
  tagline: "Crack CA Foundation with confidence",
  version: "2.0.0",
  currency: "₹",
  passingPerPaper: 40,
  passingAggregate: 50,
  totalPapers: 4,
  totalMarks: 400,
  plans: [
    { id: "free", name: "Free", price: 0, label: "₹0", features: ["P1 Chapters 1-3 (full access)", "P2/P3/P4: 2 chapters each (full access)", "12-Question Sampler (2 attempts)", "273 free questions across all 4 papers", "Detailed explanations on every question"], color: "#6B7280" },
    { id: "foundation", name: "Foundation Pass", price: 999, label: "₹999", badge: "POPULAR", features: ["All 4 papers", "Full question bank", "Performance analytics", "Chapter-wise tests", "Full mock exams"], color: "#4F46E5" },
    { id: "mentor", name: "Foundation + Mentor", price: 2499, label: "₹2,499", features: ["Everything in Foundation Pass", "Study planner", "Weak area deep-dive", "Spaced repetition", "Priority updates"], color: "#7C3AED" },
    { id: "bundle", name: "All Levels Bundle", price: 4999, label: "₹4,999/yr", features: ["Foundation + Inter + Final", "Lifetime content updates", "Early access to new papers"], color: "#EC4899" },
  ],
  company: { name: "Your Entity Name", jurisdiction: "Bahrain", email: "support@crackca.in" },
  // ── STRIPE CONFIGURATION ──────────────────────────────
  // Step 1: Replace with your Stripe Publishable Key (starts with pk_live_ or pk_test_)
  stripeKey: "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY",
  // Step 2: Create Products and Prices in Stripe Dashboard (Products > Add Product)
  //         Copy each Price ID (starts with price_) and paste below
  stripePrices: {
    foundation: "price_REPLACE_WITH_FOUNDATION_PASS_PRICE_ID",   // Rs.999 one-time
    mentor:     "price_REPLACE_WITH_MENTOR_PLAN_PRICE_ID",        // Rs.2,499 one-time
    bundle:     "price_REPLACE_WITH_BUNDLE_PLAN_PRICE_ID",        // Rs.4,999 one-time
  },
  // Step 3: Set your domain (used for success/cancel redirect URLs)
  domain: "https://crackca.in",
  // Step 4: Set to true when you have real Stripe keys and are ready to accept payments
  stripeEnabled: false,
};

const PAPERS = [
  {
    id: "P1", name: "Paper 1", fullName: "Principles and Practice of Accounting",
    marks: 100, duration: 180, type: "Subjective", negative: false, color: "#2563EB", icon: "📒",
    chapters: [
      { id: "Theoretical Framework", wt: "5-10", free: true },
      { id: "Accounting Process", wt: "20-25", free: true },
      { id: "Bank Reconciliation Statement", wt: "5-10", free: true },
      { id: "Inventories", wt: "5-10", free: false },
      { id: "Depreciation and Amortisation", wt: "5-10", free: false },
      { id: "Bills of Exchange and Promissory Notes", wt: "5-10", free: false },
      { id: "Preparation of Final Accounts of Sole Proprietors", wt: "10-15", free: false },
      { id: "Financial Statements of Not-for-Profit Organisations", wt: "5-10", free: false },
      { id: "Accounts from Incomplete Records", wt: "5-10", free: false },
      { id: "Partnership and LLP Accounts", wt: "10-15", free: false },
      { id: "Company Accounts", wt: "10-15", free: false },
    ],
  },
  {
    id: "P2", name: "Paper 2", fullName: "Business Laws",
    marks: 100, duration: 180, type: "Subjective", negative: false, color: "#DC2626", icon: "⚖️",
    chapters: [
      { id: "Indian Regulatory Framework", wt: "5-10", free: true },
      { id: "The Indian Contract Act, 1872", wt: "25-30", free: true },
      { id: "The Sale of Goods Act, 1930", wt: "15-20", free: false },
      { id: "The Indian Partnership Act, 1932", wt: "15-20", free: false },
      { id: "The Limited Liability Partnership Act, 2008", wt: "5-10", free: false },
      { id: "The Companies Act, 2013", wt: "10-15", free: false },
      { id: "The Negotiable Instruments Act, 1881", wt: "10-15", free: false },
    ],
  },
  {
    id: "P3", name: "Paper 3", fullName: "Quantitative Aptitude",
    marks: 100, duration: 120, type: "Objective (MCQ)", negative: true, color: "#059669", icon: "🔢",
    chapters: [
      { id: "Ratio, Proportion, Indices and Logarithms", wt: "6-9", free: false },
      { id: "Equations", wt: "6-9", free: false },
      { id: "Linear Inequalities", wt: "3-5", free: false },
      { id: "Mathematics of Finance", wt: "12-15", free: true },
      { id: "Permutations and Combinations", wt: "6-8", free: false },
      { id: "Sequence and Series", wt: "6-8", free: false },
      { id: "Sets, Relations and Functions", wt: "3-5", free: false },
      { id: "Differential and Integral Calculus", wt: "3-5", free: false },
      { id: "Number Series, Coding and Odd Man Out", wt: "5-7", free: false },
      { id: "Direction Tests", wt: "3-5", free: false },
      { id: "Seating Arrangements", wt: "3-5", free: false },
      { id: "Blood Relations", wt: "3-5", free: false },
      { id: "Statistical Description of Data", wt: "4-6", free: false },
      { id: "Measures of Central Tendency and Dispersion", wt: "10-13", free: false },
      { id: "Probability", wt: "6-8", free: true },
      { id: "Theoretical Distributions", wt: "4-6", free: false },
      { id: "Correlation and Regression", wt: "8-10", free: false },
      { id: "Index Numbers", wt: "4-6", free: false },
    ],
  },
  {
    id: "P4", name: "Paper 4", fullName: "Business Economics",
    marks: 100, duration: 120, type: "Objective (MCQ)", negative: true, color: "#7C3AED", icon: "📈",
    chapters: [
      { id: "Nature and Scope of Business Economics", wt: "5-10", free: true },
      { id: "Theory of Demand and Supply", wt: "15-20", free: true },
      { id: "Theory of Production and Cost", wt: "12-15", free: false },
      { id: "Price Determination in Different Markets", wt: "12-15", free: false },
      { id: "Business Cycles", wt: "5-10", free: false },
      { id: "Determination of National Income", wt: "10-15", free: false },
      { id: "Public Finance", wt: "8-12", free: false },
      { id: "Money Market", wt: "8-12", free: false },
      { id: "International Trade", wt: "5-10", free: false },
      { id: "Indian Economy", wt: "5-10", free: false },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// CA PREP PRO - Main Application Component
// Commercial CA Foundation Mock Test Platform
// ═══════════════════════════════════════════════════════════

const ALL_CHAPTERS = PAPERS.flatMap(p => p.chapters.map(c => ({ ...c, paper: p.id, paperName: p.name })));

export default function CAPrepPro() {
  // State
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(() => { try { const s = localStorage.getItem("crackca_user"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [plan, setPlan] = useState(() => { try { return localStorage.getItem("crackca_plan") || "free"; } catch { return "free"; } });
  const [selPaper, setSelPaper] = useState(null);
  const [selChapter, setSelChapter] = useState(null);
  const [testMode, setTestMode] = useState(null);
  const [testQs, setTestQs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [history, setHistory] = useState(() => { try { const s = localStorage.getItem("crackca_history"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [showExplanation, setShowExplanation] = useState({});
  const [filterWrongOnly, setFilterWrongOnly] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: "", email: "" });
  const [sideOpen, setSideOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [metadata, setMetadata] = useState(null);
  const [profile, setProfile] = useState(null);
  const timerRef = useRef(null);

  // Persist user, plan, and history to localStorage
  useEffect(() => { try { if (user) localStorage.setItem("crackca_user", JSON.stringify(user)); else localStorage.removeItem("crackca_user"); } catch {} }, [user]);
  // Fetch question metadata (counts by paper, chapter, difficulty)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('getQuestionMetadata');
        if (!error && data?.ok) {
          setMetadata(data);
        }
      } catch (err) {
        console.error("Failed to fetch metadata:", err);
      }
    };
    fetchMetadata();
  }, []);
  useEffect(() => { try { localStorage.setItem("crackca_plan", plan); } catch {} }, [plan]);
  useEffect(() => { try { localStorage.setItem("crackca_history", JSON.stringify(history)); } catch {} }, [history]);

  // Auto-login from localStorage
  useEffect(() => { if (user && screen === "landing") setScreen("dashboard"); }, [user]);

    // Supabase auth session: real source of truth for who is logged in
  useEffect(() => {
    const mapUser = (session) => {
      if (!session || !session.user) return null;
      const su = session.user;
      const meta = su.user_metadata || {};
      const fallbackName = su.email ? su.email.split("@")[0] : "Student";
      return {
        id: su.id,
        name: meta.full_name || meta.name || fallbackName,
        email: su.email || "",
        joined: su.created_at || new Date().toISOString(),
      };
    };
    const loadProfile = async (session) => {
      if (!session || !session.user) { setProfile(null); return; }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, name, plan, phone, country, phone_verified_at")
          .eq("id", session.user.id)
          .single();
        if (error) { console.error("Profile load failed:", error); setProfile(null); return; }
        setProfile(data);
      } catch (err) {
        console.error("Profile load exception:", err);
        setProfile(null);
      }
    };
    supabase.auth.getSession().then(({ data }) => {
      setUser(mapUser(data.session));
      loadProfile(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session));
      loadProfile(session);
    });
    return () => { sub.subscription.unsubscribe(); };  
  }, []);

  // Timer
  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); setTimerActive(false); return 0; } return t - 1; }), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timerActive]);

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planFromStripe = params.get("plan");
    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");

    if (planFromStripe && sessionId) {
      // Payment successful, activate the plan
      setPlan(planFromStripe);
      setScreen("dashboard");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Show success message after a brief delay
      setTimeout(() => {
        alert(`Payment successful! Your ${APP_CONFIG.plans.find(p=>p.id===planFromStripe)?.name || planFromStripe} plan is now active. Thank you!`);
      }, 500);
    } else if (cancelled) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const formatTime = (s) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Start test
// Start test
  const startTest = async (mode, paperId, chapterId) => {
    // Free-tier guard: full mocks are PRO-only
    if (plan === "free" && mode === "mock") { setScreen("plans"); return; }
    
    // Call backend to get questions
    const { data, error } = await supabase.functions.invoke('getTestQuestions', {
      body: { paperId, chapterName: chapterId || undefined },
    });

    if (error || data?.reason === "upgrade_required") {
      alert("You have used all 3 free attempts. Upgrade to continue.");
      setScreen("plans");
      return;
    }

    if (error || !data || !data.questions) {
      alert("Failed to load questions. Please try again.");
      return;
    }

    if (data.questions.length === 0) {
      alert("No questions available for this selection. Questions are being added.");
      return;
    }

    const qs = data.questions;
    setTestQs(qs);
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
    setShowExplanation({});
    setTestMode(mode);
    const paper = PAPERS.find(p => p.id === paperId);
    setTimer(mode === "mock" ? (paper?.duration || 180) * 60 : qs.length * 120);
    setTimerActive(true);
    setScreen("test");
  };

  // Sampler: 12 random MCQs (3 per paper) from FREE chapters across all papers.
  // Free users get 3 completed attempts total (server-enforced across all test types). 30 minute timer. No negative marking on sampler regardless of paper.
  const startSampler = async () => {
// Call backend to get sampler questions
  const responses = await Promise.all([
  supabase.functions.invoke('getTestQuestions', { body: { paperId: "P1", limit: 3 } }),
  supabase.functions.invoke('getTestQuestions', { body: { paperId: "P2", limit: 3 } }),
  supabase.functions.invoke('getTestQuestions', { body: { paperId: "P3", limit: 3 } }),
  supabase.functions.invoke('getTestQuestions', { body: { paperId: "P4", limit: 3 } }),
]);

  // Extract and combine questions from all 4 responses
  let allQuestions = [];
  for (let i = 0; i < responses.length; i++) {
    const { data, error } = responses[i];
    if (error || data?.reason === "upgrade_required") {
      alert("Failed to load sampler questions. Please upgrade to continue.");
      return;
    }
    if (error || !data || !data.questions) {
      alert("Failed to load sampler questions. Please try again.");
      return;
    }
    allQuestions = allQuestions.concat(data.questions);
  }

  if (allQuestions.length === 0) {
    alert("Sampler pool is empty. Please contact support.");
    return;
  }

  const picked = allQuestions;

   setTestQs(picked);
  setAnswers({});
  setSubmitted(false);
  setCurrentQ(0);
  setShowExplanation({});
  setTestMode("sampler");
  setTimer(30 * 60); // 30 minutes
  setTimerActive(true);
  setScreen("test");
};
  // Submit test
   const submitTest = async () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    
    // Build answers array for backend
    const answersArray = testQs.map((q, i) => ({
      question_code: q.code,
      selected_index: answers[i] !== undefined ? answers[i] : null,
    }));
    
    // Calculate elapsed time
    const elapsed = (testMode === "mock" ? (PAPERS.find(p => p.id === testQs[0]?.paper)?.duration || 180) * 60 : testMode === "sampler" ? 30 * 60 : testQs.length * 120) - timer;
    
    // Call backend
    const { data, error } = await supabase.functions.invoke('submitTest', {
      body: {
        testType: testMode,
        paperId: testQs[0]?.paper,
        chapterName: testQs[0]?.chapter || null,
        answers: answersArray,
        timeTakenSec: elapsed,
      },
    });
    
    if (error || data?.reason === "upgrade_required") {
      alert("You have used all 3 free attempts. Upgrade to continue.");
      setScreen("plans");
      return;
    }
    
    if (error || !data || !data.ok) {
      alert("Failed to submit test. Please try again.");
      return;
    }
    
    // Save to history
    setHistory(h => [{
      date: new Date().toISOString(),
      paper: testQs[0]?.paper,
      chapter: testQs[0]?.chapter,
      score: data.correct,
      total: data.total,
      pct: Math.round(data.scorePercent),
      correct: data.correct,
      attempted: answersArray.filter(a => a.selected_index !== null).length,
      wrong: data.total - data.correct,
      unanswered: testQs.length - answersArray.filter(a => a.selected_index !== null).length,
      timeTaken: elapsed,
      mode: testMode,
    }, ...h]);
    
    setSubmitted(true);
  };

  // Analytics
  const paperStats = (pid) => {
    const h = history.filter(x => x.paper === pid);
    if (!h.length) return { avg: 0, best: 0, attempts: 0, trend: [] };
    return { avg: Math.round(h.reduce((s, x) => s + x.pct, 0) / h.length), best: Math.max(...h.map(x => x.pct)), attempts: h.length, trend: h.slice(0, 10).reverse().map(x => x.pct) };
  };

  const overallStats = () => {
    if (!history.length) return { avg: 0, tests: 0, streak: 0, totalTime: 0 };
    return {
      avg: Math.round(history.reduce((s, x) => s + x.pct, 0) / history.length),
      tests: history.length,
      streak: (() => { let s = 0; for (const h of history) { if (h.pct >= 50) s++; else break; } return s; })(),
      totalTime: history.reduce((s, x) => s + x.timeTaken, 0),
    };
  };

  // Quick login
  const doLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
  };

  const doLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPlan("free");
    setScreen("landing");
  };

  const upgradePlan = async (planId) => {
    if (planId === "free") return;

    // Check if Stripe is enabled
    if (!APP_CONFIG.stripeEnabled) {
      // PRE-LAUNCH: redirect to Google Form to capture payment intent
      const selectedPlan = APP_CONFIG.plans.find(p=>p.id===planId);
      const confirmed = window.confirm(
        `${selectedPlan?.name} (${selectedPlan?.label})\n\n` +
        `Full access is launching soon!\n\n` +
        `Sign up now to:\n` +
        `- Get notified when paid plans go live\n` +
        `- Receive an early-bird discount\n` +
        `- Help us prioritize which papers to expand first\n\n` +
        `Click OK to register your interest (30 seconds).`
      );
      if (confirmed) {
        window.open("https://forms.gle/gqUXPEJEe36hMFiA7", "_blank");
      }
      return;
    }

    // LIVE MODE: redirect to Stripe Checkout
    const priceId = APP_CONFIG.stripePrices[planId];
    if (!priceId || priceId.includes("REPLACE")) {
      alert("Payment is not configured for this plan yet. Please contact support.");
      return;
    }

    try {
      // Load Stripe.js dynamically (only once)
      if (!window.Stripe) {
        const script = document.createElement("script");
        script.src = "https://js.stripe.com/v3/";
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const stripe = window.Stripe(APP_CONFIG.stripeKey);
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        successUrl: `${APP_CONFIG.domain}/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${APP_CONFIG.domain}/?cancelled=true`,
        customerEmail: user?.email || undefined,
      });

      if (error) {
        console.error("Stripe error:", error);
        alert("Payment failed to open. Please try again or contact support.");
      }
    } catch (err) {
      console.error("Stripe loading error:", err);
      alert("Could not connect to payment service. Please check your internet connection and try again.");
    }
  };

  const isLocked = (chapter) => plan === "free" && !chapter.free;

  // ─── RENDER ───────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#0B0F19", color: "#E2E8F0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#111827} ::-webkit-scrollbar-thumb{background:#374151;border-radius:3px}
        .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:10px;font-family:'Inter';font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;border:none;text-decoration:none}
        .btn:hover{transform:translateY(-1px)} .btn:disabled{opacity:.4;cursor:not-allowed;transform:none}
        .btn-p{background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;box-shadow:0 4px 15px rgba(99,102,241,.3)}
        .btn-s{background:#1F2937;color:#9CA3AF;border:1px solid #374151} .btn-s:hover{color:#E2E8F0;border-color:#6366F1}
        .btn-g{background:linear-gradient(135deg,#059669,#10B981);color:#fff}
        .btn-d{background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff}
        .card{background:#111827;border:1px solid #1F2937;border-radius:14px;padding:20px;transition:all .25s}
        .card:hover{border-color:#374151}
        .inp{background:#1F2937;border:1px solid #374151;color:#E2E8F0;padding:12px 16px;border-radius:10px;font-family:'Inter';font-size:14px;width:100%;outline:none}
        .inp:focus{border-color:#6366F1}
        .opt{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:10px;border:1px solid #1F2937;background:#0F172A;cursor:pointer;transition:all .2s;width:100%;text-align:left;font-family:'Inter';font-size:14px;color:#CBD5E1}
        .opt:hover{border-color:#374151;background:#111827}
        .opt.sel{border-color:#6366F1;background:#1E1B4B;color:#E2E8F0}
        .opt.correct{border-color:#10B981;background:#064E3B;color:#6EE7B7}
        .opt.wrong{border-color:#EF4444;background:#450A0A;color:#FCA5A5}
        .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
        @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fu .35s ease}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} .pulse{animation:pulse 2s infinite}
        .hamburger{display:none;background:none;border:none;color:#9CA3AF;cursor:pointer}
        .sidebar{width:260px;background:#0F172A;border-right:1px solid #1F2937;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;height:100vh;position:sticky;top:0}
        .nav{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#6B7280;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:'Inter'}
        .nav:hover{background:#1F2937;color:#E2E8F0} .nav.act{background:#1E1B4B;color:#A78BFA}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99;display:none} .overlay.open{display:block}
        @media(max-width:768px){.hamburger{display:block} .sidebar{position:fixed;left:-270px;top:0;z-index:100;transition:left .3s;width:260px} .sidebar.open{left:0;box-shadow:4px 0 30px rgba(0,0,0,.5)}}
      `}</style>

      {/* ═══ LANDING ═══ */}
      {screen === "landing" && (
        <div className="fade" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 60%)" }}>
          <svg width="320" height="360" viewBox="0 0 680 680" style={{ marginBottom: 16, maxWidth: "90vw", height: "auto" }}>
            <defs>
              <linearGradient id="landingShield" x1="0" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#A78BFA"/>
                <stop offset="50%" stopColor="#6366F1"/>
                <stop offset="100%" stopColor="#4F46E5"/>
              </linearGradient>
              <linearGradient id="landingAccent" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1"/>
                <stop offset="100%" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
            <g transform="translate(340, 240)">
              <path d="M0,-140 L110,-90 L110,30 C110,100 60,140 0,170 C-60,140 -110,100 -110,30 L-110,-90 Z" fill="url(#landingShield)" opacity="0.15" stroke="url(#landingShield)" strokeWidth="2"/>
              <path d="M0,-120 L90,-78 L90,22 C90,82 50,115 0,142 C-50,115 -90,82 -90,22 L-90,-78 Z" fill="url(#landingShield)" opacity="0.25"/>
              <path d="M0,-95 L68,-62 L68,14 C68,62 38,88 0,110 C-38,88 -68,62 -68,14 L-68,-62 Z" fill="url(#landingShield)" opacity="0.4"/>
              <path d="M-35,5 L-10,35 L40,-25" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              <text y="-105" textAnchor="end" x="125" fontFamily="Inter,system-ui,sans-serif" fontSize="18" fontWeight="700" fill="#A78BFA" letterSpacing="3" opacity="0.7">CA</text>
            </g>
            <text x="340" y="440" textAnchor="middle" fontFamily="Inter,system-ui,sans-serif" fontSize="72" fontWeight="900" fill="#FFFFFF" letterSpacing="-1">Crack CA</text>
            <text x="340" y="485" textAnchor="middle" fontFamily="Inter,system-ui,sans-serif" fontSize="20" fontWeight="500" fill="#9CA3AF" letterSpacing="4">CA FOUNDATION</text>
            <rect x="178" y="520" width="324" height="3" rx="1.5" fill="url(#landingAccent)" opacity="0.5"/>
          </svg>
          <p style={{ fontSize: 24, fontWeight: 600, color: "#E5E7EB", textAlign: "center", maxWidth: 560, marginBottom: 12, lineHeight: 1.4 }}>The smartest way to crack CA Foundation.</p>
          <p style={{ fontSize: 17, fontWeight: 400, color: "#9CA3AF", textAlign: "center", maxWidth: 620, marginBottom: 32, lineHeight: 1.6 }}>1,078 exam-pattern questions with detailed explanations,<br />real-time analytics, and timed mock tests.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            {["4 Papers Covered", "Exam-Pattern MCQs", "Detailed Explanations", "Performance Analytics", "Negative Marking", "Timed Mock Tests"].map((f, i) => (
              <span key={i} className="tag" style={{ background: "#1E1B4B", color: "#A78BFA", fontSize: 12, padding: "6px 14px" }}>{f}</span>
            ))}
          </div>
          <button className="btn btn-p" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => setScreen("login")}>Start Free Practice →</button>
          <p style={{ marginTop: 16, fontSize: 13, color: "#4B5563" }}>No credit card required. Free tier: 273 questions across 9 chapters plus a 12-question 4-Paper Sampler.</p>
          <div style={{ marginTop: 48, display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {PAPERS.map(p => (
              <div key={p.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#4B5563" }}>{p.chapters.length} chapters</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ LOGIN ═══ */}
      {screen === "login" && (
        <div className="fade" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", padding: 32 }}>
            <svg width="56" height="56" viewBox="0 0 200 200" style={{ display: "block", margin: "0 auto 8px" }}>
              <defs><linearGradient id="shieldL" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#A78BFA"/><stop offset="50%" stopColor="#6366F1"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs>
              <g transform="translate(100,95)">
                <path d="M0,-80 L63,-52 L63,13 C63,57 34,80 0,95 C-34,80 -63,57 -63,13 L-63,-52 Z" fill="url(#shieldL)" opacity="0.3" stroke="url(#shieldL)" strokeWidth="2"/>
                <path d="M0,-60 L45,-38 L45,8 C45,42 25,60 0,72 C-25,60 -45,42 -45,8 L-45,-38 Z" fill="url(#shieldL)" opacity="0.5"/>
                <path d="M-20,3 L-6,20 L23,-14" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
            <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>Welcome to Crack CA</h2>
            <p style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>Sign in with your Google account to start practicing</p>
              <button className="btn btn-p" style={{ width: "100%" }} onClick={doLogin}>Sign in with Google</button>
            <p style={{ fontSize: 11, color: "#4B5563", textAlign: "center", marginTop: 12 }}>By continuing you agree to our Terms of Service</p>
          </div>
        </div>
      )}

      {/* ═══ VERIFY PHONE SCREEN (Block 5) ═══ */}
      {screen === "verifyPhone" && (
        <div className="fade" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div className="card" style={{ maxWidth: 400, width: "100%", padding: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>Verify your phone</h2>
            <p style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>We need to verify a mobile number for your account.</p>

            {/* TEMPORARY DIAGNOSTIC: shows what the gate detected. Remove before merge. */}
            <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginBottom: 16, padding: 10, border: "1px dashed #374151", borderRadius: 8 }}>
              Detected profile phone: <strong>{profile ? (profile.phone === null ? "NULL (needs verification)" : profile.phone) : "profile not loaded yet"}</strong>
            </div>

            {/* TEMPORARY TEST-ONLY ESCAPE (soft gate). MUST be removed before merge to main. */}
            <button className="btn btn-p" style={{ width: "100%" }} onClick={() => setScreen("dashboard")}>Continue to dashboard (test only)</button>
          </div>
        </div>
      )}

      {/* ═══ MAIN APP (Dashboard, Paper, Test, etc.) ═══ */}
      {user && !["landing", "login", "verifyPhone"].includes(screen) && (
        <>
          <div className={`overlay ${sideOpen?'open':''}`} onClick={() => setSideOpen(false)} />
          <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <div className={`sidebar ${sideOpen?'open':''}`}>
              <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1F2937" }}>
                <div style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#A78BFA,#6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Crack CA</div>
                <div style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{user.name} | {plan === "free" ? "Free Plan" : APP_CONFIG.plans.find(p=>p.id===plan)?.name}</div>
                {plan === "free" && <button className="btn btn-p" style={{ width: "100%", marginTop: 10, fontSize: 11, padding: "8px" }} onClick={() => {setScreen("plans");setSideOpen(false);}}>Upgrade →</button>}
                <button className="btn" style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "8px" }} onClick={doLogout}>Sign out</button>
              </div>
              <div style={{ padding: "8px", flex: 1 }}>
                <button className={`nav ${screen==='dashboard'?'act':''}`} onClick={() => {setScreen('dashboard');setSideOpen(false);}}>📊 Dashboard</button>
                <button className={`nav ${screen==='analytics'?'act':''}`} onClick={() => {setScreen('analytics');setSideOpen(false);}}>📈 Analytics</button>
                <button className={`nav ${screen==='plans'?'act':''}`} onClick={() => {setScreen('plans');setSideOpen(false);}}>💎 Plans</button>
                <div style={{ padding: "12px 14px 6px", fontSize: 10, color: "#4B5563", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Papers</div>
                {PAPERS.map(p => (
                  <button key={p.id} className={`nav ${selPaper===p.id && screen==='paper'?'act':''}`}
                    onClick={() => {setSelPaper(p.id);setScreen('paper');setSideOpen(false);}}>
                    <span>{p.icon}</span> {p.name}
                  </button>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #1F2937", fontSize: 10, color: "#374151" }}>
                {APP_CONFIG.company.name}<br/>v{APP_CONFIG.version}
              </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #1F2937", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0B0F19", position: "sticky", top: 0, zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button className="hamburger" onClick={() => setSideOpen(!sideOpen)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    {screen === "dashboard" && "Dashboard"}
                    {screen === "paper" && PAPERS.find(p=>p.id===selPaper)?.fullName}
                    {screen === "test" && `${testMode === "mock" ? "Mock Exam" : testMode === "sampler" ? "4-Paper Sampler" : "Chapter Test"} ${submitted ? "(Completed)" : ""}`}
                    {screen === "analytics" && "Performance Analytics"}
                    {screen === "plans" && "Subscription Plans"}
                  </span>
                </div>
                {screen === "test" && !submitted && (
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 600, color: timer < 300 ? "#EF4444" : "#6366F1" }}>
                    <span className={timer < 60 ? "pulse" : ""}>{formatTime(timer)}</span>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>

                  {/* ═══ DASHBOARD ═══ */}
                  {screen === "dashboard" && (
                    <div className="fade">
                      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Welcome back, {user.name.split(' ')[0]}</h1>
                      <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 14 }}>CA Foundation | ICAI New Scheme | {metadata?.totalQuestions || 0} questions across {PAPERS.length} papers</p>
                      {(() => { const s = overallStats(); return (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 28 }}>
                          {[
                            { l: "Tests Taken", v: s.tests, c: "#6366F1" },
                            { l: "Avg Score", v: s.avg + "%", c: s.avg >= 50 ? "#10B981" : "#EF4444" },
                            { l: "Pass Streak", v: s.streak, c: "#F59E0B" },
                            { l: "Study Time", v: Math.round(s.totalTime / 60) + " min", c: "#8B5CF6" },
                          ].map((x, i) => (
                            <div key={i} className="card" style={{ padding: 16 }}>
                              <div style={{ fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>{x.l}</div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: x.c }}>{x.v}</div>
                            </div>
                          ))
                        }
                        </div>
                      );})()}
                      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#9CA3AF" }}>Choose a Paper</h2>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
                        {PAPERS.map(p => {
                          const s = paperStats(p.id);
                          const qCount = metadata?.byPaper?.[p.id] || 0;
                          return (
                            <div key={p.id} className="card" style={{ cursor: "pointer", borderColor: selPaper === p.id ? p.color : undefined }}
                              onClick={() => { setSelPaper(p.id); setScreen("paper"); }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                <span style={{ fontSize: 24 }}>{p.icon}</span>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                                  <div style={{ fontSize: 11, color: "#6B7280" }}>{qCount} questions</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                <span className="tag" style={{ background: `${p.color}20`, color: p.color }}>{p.marks} marks</span>
                                <span className="tag" style={{ background: "#1F2937", color: "#6B7280" }}>{Math.floor(p.duration / 60)}h {p.duration % 60 > 0 ? (p.duration%60)+'m' : ''}</span>
                                {p.negative && <span className="tag" style={{ background: "#450A0A", color: "#FCA5A5" }}>-0.25</span>}
                              </div>
                              {s.attempts > 0 && (
                                <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280" }}>
                                  <span>Best: {s.best}%</span><span>Avg: {s.avg}%</span><span>{s.attempts} tests</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* ═══ 4-PAPER SAMPLER CARD ═══ */}
{(() => {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 28, background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", border: "1px solid #4338CA" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🎯</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#E0E7FF" }}>4-Paper Sampler</h3>
            <span className="tag" style={{ background: "#4338CA", color: "#E0E7FF", fontSize: 10 }}>FREE</span>
          </div>
          <p style={{ fontSize: 13, color: "#C7D2FE", marginBottom: 4 }}>12 questions, 3 from each paper. 30-minute timer. No negative marking. Pulled fresh from free chapters every attempt.</p>
        </div>
        <button className="btn btn-p" style={{ padding: "12px 22px" }} onClick={() => startSampler()}>
          Start Sampler →
        </button>
      </div>
    </div>
  );
})()}

                      {history.length > 0 && (
                        <>
                          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#9CA3AF" }}>Recent Activity</h2>
                          {history.slice(0, 5).map((h, i) => {
                            const p = PAPERS.find(x => x.id === h.paper);
                            return (
                              <div key={i} className="card" style={{ marginBottom: 8, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                  <span style={{ fontSize: 18 }}>{p?.icon}</span>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{h.mode === "sampler" ? "4-Paper Sampler" : `${p?.name || ''}${h.chapter ? ` , ${(ALL_CHAPTERS.find(c=>c.id===h.chapter)?.id || '').slice(0,30)}` : ' , Full Mock'}`}</div>
                                    <div style={{ fontSize: 11, color: "#4B5563" }}>{new Date(h.date).toLocaleDateString()} | {Math.round(h.timeTaken/60)} min</div>
                                  </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontWeight: 700, fontSize: 16, color: h.pct >= 50 ? "#10B981" : h.pct >= 40 ? "#F59E0B" : "#EF4444" }}>{h.pct}%</div>
                                  <div style={{ fontSize: 11, color: "#6B7280" }}>{h.score}/{h.total}</div>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}

                  {/* ═══ PAPER VIEW ═══ */}
                  {screen === "paper" && selPaper && (() => {
                    const p = PAPERS.find(x => x.id === selPaper);
                    const qCount = metadata?.byPaper?.[selPaper] || 0;
                    return (
                      <div className="fade">
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                          <span style={{ fontSize: 36 }}>{p.icon}</span>
                          <div>
                            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{p.fullName}</h1>
                            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                              <span className="tag" style={{ background: `${p.color}20`, color: p.color }}>{p.marks} marks</span>
                              <span className="tag" style={{ background: "#1F2937", color: "#6B7280" }}>{p.duration} min</span>
                              <span className="tag" style={{ background: "#1F2937", color: "#6B7280" }}>{p.type}</span>
                              {p.negative && <span className="tag" style={{ background: "#450A0A", color: "#FCA5A5" }}>Negative marking: -0.25</span>}
                              <span className="tag" style={{ background: "#1F2937", color: "#6B7280" }}>{qCount} questions</span>
                            </div>
                          </div>
                        </div>
                        {qCount > 0 && (
                          <button className="btn btn-p" style={{ marginBottom: 24 }} onClick={() => startTest("mock", selPaper, null)}>
                            Start Full Mock Test ({p.duration} min) →
                          </button>
                        )}
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#9CA3AF" }}>Chapters</h2>
                        {p.chapters.map(ch => {
                          const locked = isLocked(ch);
                          const chQs = metadata?.byChapter?.[ch.id] || 0;
                          return (
                            <div key={ch.id} className="card" style={{ marginBottom: 8, padding: "16px 20px", cursor: "pointer", opacity: locked ? 0.5 : 1 }}
                              onClick={() => locked ? setScreen("plans") : startTest("chapter", selPaper, ch.id)}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{locked ? "🔒 " : ""}{ch.id}</div>
                                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Weightage: {ch.wt} marks | {chQs} questions</div>
                                </div>
                                {!locked && chQs > 0 && (
                                  <button className="btn btn-s" style={{ fontSize: 12, padding: "8px 16px" }} onClick={e => { e.stopPropagation(); startTest("chapter", selPaper, ch.id); }}>
                                    Practice →
                                  </button>
                                )}
                                {locked && <span className="tag" style={{ background: "#1F2937", color: "#F59E0B" }}>PRO</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ═══ TEST ENGINE ═══ */}
                  {screen === "test" && testQs.length > 0 && (
                    <div className="fade">
                      {!submitted ? (
                        <>
                          {/* Question navigation */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                            {testQs.map((_, i) => (
                              <button key={i} onClick={() => setCurrentQ(i)} style={{
                                width: 32, height: 32, borderRadius: 8, border: `1px solid ${i === currentQ ? '#6366F1' : answers[i] !== undefined ? '#10B981' : '#1F2937'}`,
                                background: i === currentQ ? "#1E1B4B" : answers[i] !== undefined ? "#064E3B" : "#111827",
                                color: i === currentQ ? "#A78BFA" : answers[i] !== undefined ? "#6EE7B7" : "#4B5563",
                                cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono'",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>{i + 1}</button>
                            ))}
                          </div>
                          {/* Current question */}
                          {(() => {
                            const q = testQs[currentQ];
                            const paper = PAPERS.find(p => p.id === q.paper);
                            return (
                              <div className="card" style={{ marginBottom: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                                  <div style={{ display: "flex", gap: 8 }}>
                                    <span className="tag" style={{ background: "#1F2937", color: "#9CA3AF" }}>Q{currentQ + 1}/{testQs.length}</span>
                                    <span className="tag" style={{ background: q.diff === "Easy" ? "#064E3B" : q.diff === "Medium" ? "#422006" : "#450A0A", color: q.diff === "Easy" ? "#6EE7B7" : q.diff === "Medium" ? "#FDE68A" : "#FCA5A5" }}>{q.diff}</span>
                                    <span className="tag" style={{ background: "#1F2937", color: "#9CA3AF" }}>{q.marks} marks</span>
                                  </div>
                                  <button onClick={() => setBookmarks(b => { const n = new Set(b); n.has(currentQ) ? n.delete(currentQ) : n.add(currentQ); return n; })}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: bookmarks.has(currentQ) ? "#F59E0B" : "#374151" }}>
                                    {bookmarks.has(currentQ) ? "★" : "☆"}
                                  </button>
                                </div>
                                <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 18, color: "#F1F5F9" }}>{q.q}</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  {q.opts.map((o, oi) => (
                                    <button key={oi} className={`opt ${answers[currentQ] === oi ? 'sel' : ''}`}
                                      onClick={() => setAnswers({ ...answers, [currentQ]: oi })}>
                                      <span style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                        {String.fromCharCode(65 + oi)}
                                      </span>
                                      <span style={{ flex: 1 }}>{o}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                          {/* Nav buttons */}
                          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", gap: 10 }}>
                              {currentQ > 0 && <button className="btn btn-s" onClick={() => setCurrentQ(currentQ - 1)}>← Previous</button>}
                              {currentQ < testQs.length - 1 && <button className="btn btn-s" onClick={() => setCurrentQ(currentQ + 1)}>Next →</button>}
                            </div>
                            <button className="btn btn-d" onClick={() => { if (window.confirm(`Submit test? ${Object.keys(answers).length}/${testQs.length} answered.`)) submitTest(); }}>
                              Submit Test
                            </button>
                          </div>
                        </>
                      ) : (
                        /* ═══ RESULTS ═══ */
                        (() => {
                          const latest = history[0];
                          const paper = PAPERS.find(p => p.id === testQs[0]?.paper);

                          // Classify every question
                          const wrongIdx = [];
                          const skippedIdx = [];
                          const correctIdx = [];
                          testQs.forEach((q, i) => {
                            const ua = answers[i];
                            if (ua === undefined) skippedIdx.push(i);
                            else if (ua === q.a) correctIdx.push(i);
                            else wrongIdx.push(i);
                          });

                          // Chapter weakness analysis: group wrong + skipped by chapter
                          const chapterStats = {};
                          testQs.forEach((q, i) => {
                            const key = q.chapter;
                            if (!chapterStats[key]) chapterStats[key] = { total: 0, wrong: 0, skipped: 0 };
                            chapterStats[key].total++;
                            const ua = answers[i];
                            if (ua === undefined) chapterStats[key].skipped++;
                            else if (ua !== q.a) chapterStats[key].wrong++;
                          });
                          const weakChapters = Object.entries(chapterStats)
                            .filter(([, s]) => (s.wrong + s.skipped) >= 1 && s.total >= 2)
                            .map(([ch, s]) => ({ ch, missed: s.wrong + s.skipped, total: s.total, pct: Math.round((s.wrong + s.skipped) / s.total * 100) }))
                            .sort((a, b) => b.pct - a.pct || b.missed - a.missed)
                            .slice(0, 3);

                          // "What this means" guidance based on score
                          let guidance = "";
                          if (latest.pct >= 50) guidance = "You've cleared the aggregate pass mark. Keep reinforcing weak chapters below to build a safety margin.";
                          else if (latest.pct >= 40) guidance = "You've cleared the per-paper minimum but are short of the 50% aggregate needed to pass. Focus on the chapters highlighted below and retake soon.";
                          else guidance = "Below the 40% per-paper minimum. Don't worry, this is a practice test. Study the explanations below for every wrong answer, then retake. This is exactly how students move from failing to passing.";

                          // Which questions to display based on filter
                          const displayIdx = filterWrongOnly ? [...wrongIdx, ...skippedIdx] : [...wrongIdx, ...skippedIdx, ...correctIdx];

                          // Helper to render a single question card
                          const renderQ = (i) => {
                            const q = testQs[i];
                            const userAns = answers[i];
                            const correct = userAns === q.a;
                            const attempted = userAns !== undefined;
                            const shouldAutoExpand = !correct; // wrong OR skipped auto-expands
                            const isExpanded = showExplanation[i] !== undefined ? showExplanation[i] : shouldAutoExpand;
                            const cardTint = correct ? "#065F4620" : attempted ? "#7F1D1D20" : "#78350F20";
                            return (
                              <div key={i} className="card" style={{ marginBottom: 10, borderColor: cardTint }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    <span className="tag" style={{ background: correct ? "#064E3B" : attempted ? "#450A0A" : "#78350F", color: correct ? "#6EE7B7" : attempted ? "#FCA5A5" : "#FCD34D" }}>
                                      Q{i + 1} {correct ? "✓ Correct" : attempted ? "✗ Wrong" : "— Skipped"}
                                    </span>
                                    <span className="tag" style={{ background: "#1F2937", color: "#9CA3AF", fontSize: 10 }}>{q.chapter}</span>
                                  </div>
                                  <span className="tag" style={{ background: "#1F2937", color: "#6B7280" }}>{q.marks}m | {q.diff}</span>
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#CBD5E1" }}>{q.q}</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                                  {q.opts.map((o, oi) => (
                                    <div key={oi} className={`opt ${oi === q.a ? 'correct' : userAns === oi ? 'wrong' : ''}`} style={{ cursor: "default", padding: "10px 14px" }}>
                                      <span style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>{String.fromCharCode(65 + oi)}</span>
                                      <span style={{ flex: 1, fontSize: 13 }}>{o}</span>
                                      {oi === q.a && <span>✓</span>}
                                      {userAns === oi && oi !== q.a && <span>✗</span>}
                                    </div>
                                  ))}
                                </div>
                                <button className="btn btn-s" style={{ fontSize: 11, padding: "6px 14px" }}
                                  onClick={() => setShowExplanation(s => ({ ...s, [i]: !(s[i] !== undefined ? s[i] : shouldAutoExpand) }))}>
                                  {isExpanded ? "Hide" : "Show"} Explanation
                                </button>
                                {isExpanded && (
                                  <div style={{ marginTop: 10, padding: "14px 16px", background: "#0F172A", borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: "#94A3B8", borderLeft: `3px solid ${correct ? "#10B981" : attempted ? "#EF4444" : "#F59E0B"}` }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: correct ? "#6EE7B7" : attempted ? "#FCA5A5" : "#FCD34D", marginBottom: 6, letterSpacing: 0.5 }}>
                                      {correct ? "REINFORCE THE CONCEPT" : attempted ? "LET'S UNDERSTAND WHY" : "KEY INSIGHT YOU MISSED"}
                                    </div>
                                    {q.exp}
                                  </div>
                                )}
                              </div>
                            );
                          };

                          return (
                            <div>
                              {/* Score Card */}
                              <div className="card" style={{ textAlign: "center", padding: 32, marginBottom: 16, background: latest.pct >= 50 ? "linear-gradient(135deg,#064E3B,#111827)" : latest.pct >= 40 ? "linear-gradient(135deg,#422006,#111827)" : "linear-gradient(135deg,#450A0A,#111827)" }}>
                                <div style={{ fontSize: 48, marginBottom: 8 }}>{latest.pct >= 50 ? "🏆" : latest.pct >= 40 ? "📝" : "📖"}</div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: latest.pct >= 50 ? "#10B981" : latest.pct >= 40 ? "#F59E0B" : "#EF4444" }}>{latest.pct}%</div>
                                <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4 }}>{latest.score}/{latest.total} marks | {Math.round(latest.timeTaken / 60)} minutes</div>
                                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, fontSize: 13, flexWrap: "wrap" }}>
                                  <span style={{ color: "#10B981" }}>✓ {latest.correct} correct</span>
                                  <span style={{ color: "#EF4444" }}>✗ {latest.wrong} wrong</span>
                                  <span style={{ color: "#F59E0B" }}>— {latest.unanswered} skipped</span>
                                </div>
                                <div style={{ marginTop: 8, fontSize: 12, color: latest.pct >= 40 ? "#6EE7B7" : "#FCA5A5" }}>
                                  {latest.pct >= 50 ? "PASS (50%+ aggregate)" : latest.pct >= 40 ? "BORDERLINE (40% per paper, need 50% aggregate)" : "BELOW PASSING (need 40% minimum)"}
                                </div>
                              </div>

                              {/* What this means */}
                              <div className="card" style={{ padding: "14px 18px", marginBottom: 16, background: "#111827", borderLeft: "3px solid #6366F1" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 6, letterSpacing: 0.5 }}>WHAT THIS MEANS</div>
                                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#CBD5E1", margin: 0 }}>{guidance}</p>
                              </div>

                              {/* Chapter Weakness Summary */}
                              {weakChapters.length > 0 && (
                                <div className="card" style={{ padding: "14px 18px", marginBottom: 16, background: "#111827", borderLeft: "3px solid #F59E0B" }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#FCD34D", marginBottom: 10, letterSpacing: 0.5 }}>FOCUS ON THESE CHAPTERS</div>
                                  {weakChapters.map((w, wi) => (
                                    <div key={wi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: wi < weakChapters.length - 1 ? "1px solid #1F2937" : "none" }}>
                                      <span style={{ fontSize: 13, color: "#CBD5E1" }}>{w.ch}</span>
                                      <span style={{ fontSize: 12, color: "#FCA5A5", fontWeight: 600 }}>{w.missed}/{w.total} missed ({w.pct}%)</span>
                                    </div>
                                  ))}
                                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 10, marginBottom: 0, fontStyle: "italic" }}>Revise these chapters before retaking. You'll see the biggest score jump here.</p>
                                </div>
                              )}

                              {/* Review Section Header + Filter */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 24, flexWrap: "wrap", gap: 8 }}>
                                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#E5E7EB", margin: 0 }}>Review Answers {filterWrongOnly && <span style={{ color: "#F59E0B", fontSize: 12, marginLeft: 8 }}>(showing mistakes only)</span>}</h2>
                                {(wrongIdx.length + skippedIdx.length) > 0 && (
                                  <button
                                    className="btn btn-s"
                                    style={{ fontSize: 11, padding: "6px 12px", background: filterWrongOnly ? "#6366F1" : "#1F2937", color: filterWrongOnly ? "#FFFFFF" : "#9CA3AF" }}
                                    onClick={() => setFilterWrongOnly(f => !f)}
                                  >
                                    {filterWrongOnly ? `Show All (${testQs.length})` : `Show Mistakes Only (${wrongIdx.length + skippedIdx.length})`}
                                  </button>
                                )}
                              </div>

                              {/* Wrong Section */}
                              {wrongIdx.length > 0 && displayIdx.some(i => wrongIdx.includes(i)) && (
                                <>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "#FCA5A5", margin: "10px 0 8px", letterSpacing: 0.5 }}>
                                    ✗ QUESTIONS YOU GOT WRONG ({wrongIdx.length})
                                  </div>
                                  {wrongIdx.map(i => renderQ(i))}
                                </>
                              )}

                              {/* Skipped Section */}
                              {skippedIdx.length > 0 && displayIdx.some(i => skippedIdx.includes(i)) && (
                                <>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "#FCD34D", margin: "20px 0 8px", letterSpacing: 0.5 }}>
                                    — QUESTIONS YOU SKIPPED ({skippedIdx.length})
                                  </div>
                                  {skippedIdx.map(i => renderQ(i))}
                                </>
                              )}

                              {/* Correct Section */}
                              {!filterWrongOnly && correctIdx.length > 0 && (
                                <>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6EE7B7", margin: "20px 0 8px", letterSpacing: 0.5 }}>
                                    ✓ QUESTIONS YOU GOT RIGHT ({correctIdx.length})
                                  </div>
                                  {correctIdx.map(i => renderQ(i))}
                                </>
                              )}

                              {/* Empty state for "mistakes only" when there are no mistakes */}
                              {filterWrongOnly && (wrongIdx.length + skippedIdx.length) === 0 && (
                                <div className="card" style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
                                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                                  <p style={{ fontSize: 14 }}>No mistakes to review. Perfect score!</p>
                                </div>
                              )}

                              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                                <button className="btn btn-p" onClick={() => setScreen("dashboard")}>Back to Dashboard</button>
                                <button className="btn btn-s" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setShowExplanation({}); setFilterWrongOnly(false); setTimer(testMode === "sampler" ? 30 * 60 : testQs.length * 120); setTimerActive(true); }}>Retry Same Test</button>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}

                  {/* ═══ ANALYTICS ═══ */}
                  {screen === "analytics" && (
                    <div className="fade">
                      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Performance Analytics</h1>
                      {history.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: 40 }}>
                          <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
                          <p style={{ color: "#6B7280" }}>Take your first test to see analytics here.</p>
                          <button className="btn btn-p" style={{ marginTop: 16 }} onClick={() => setScreen("dashboard")}>Go to Dashboard</button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
                            {PAPERS.map(p => {
                              const s = paperStats(p.id);
                              return (
                                <div key={p.id} className="card">
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                                  </div>
                                  <div style={{ fontSize: 28, fontWeight: 800, color: s.avg >= 50 ? "#10B981" : s.avg >= 40 ? "#F59E0B" : s.attempts > 0 ? "#EF4444" : "#374151" }}>{s.attempts > 0 ? s.avg + "%" : "--"}</div>
                                  <div style={{ fontSize: 11, color: "#4B5563", marginTop: 4 }}>{s.attempts} tests | Best: {s.best}%</div>
                                  {s.trend.length > 1 && (
                                    <div style={{ display: "flex", alignItems: "end", gap: 3, marginTop: 10, height: 30 }}>
                                      {s.trend.map((v, i) => (
                                        <div key={i} style={{ flex: 1, background: v >= 50 ? "#10B981" : v >= 40 ? "#F59E0B" : "#EF4444", borderRadius: 2, height: `${Math.max(4, v * 0.3)}px`, opacity: 0.7 + (i / s.trend.length) * 0.3 }} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#9CA3AF" }}>Full History</h2>
                          {history.map((h, i) => {
                            const p = PAPERS.find(x => x.id === h.paper);
                            return (
                              <div key={i} className="card" style={{ marginBottom: 6, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <span>{p?.icon}</span>
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{h.mode === "mock" ? "Mock Exam" : h.mode === "sampler" ? "4-Paper Sampler" : "Chapter Test"}</div>
                                    <div style={{ fontSize: 11, color: "#4B5563" }}>{new Date(h.date).toLocaleDateString()} | ✓{h.correct} ✗{h.wrong} —{h.unanswered}</div>
                                  </div>
                                </div>
                                <div style={{ fontWeight: 700, color: h.pct >= 50 ? "#10B981" : h.pct >= 40 ? "#F59E0B" : "#EF4444" }}>{h.pct}%</div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}

                  {/* ═══ PLANS ═══ */}
                  {screen === "plans" && (
                    <div className="fade">
                      <h1 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>Choose Your Plan</h1>
                      <p style={{ textAlign: "center", color: "#6B7280", marginBottom: 28, fontSize: 14 }}>Invest in your future. One payment, one attempt, no subscriptions.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
                        {APP_CONFIG.plans.map(pl => (
                          <div key={pl.id} className="card" style={{ padding: 24, borderColor: pl.id === "foundation" ? "#6366F1" : "#1F2937", position: "relative" }}>
                            {pl.badge && <div style={{ position: "absolute", top: -10, right: 16, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>{pl.badge}</div>}
                            <div style={{ fontSize: 14, fontWeight: 700, color: pl.color, marginBottom: 4 }}>{pl.name}</div>
                            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>{pl.label}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                              {pl.features.map((f, i) => (
                                <div key={i} style={{ fontSize: 13, color: "#9CA3AF", display: "flex", gap: 8, alignItems: "flex-start" }}>
                                  <span style={{ color: "#10B981", flexShrink: 0 }}>✓</span>{f}
                                </div>
                              ))}
                            </div>
                            <button className={`btn ${plan === pl.id ? 'btn-g' : pl.id === 'free' ? 'btn-s' : 'btn-p'}`}
                              style={{ width: "100%" }}
                              onClick={() => plan === pl.id ? setScreen("dashboard") : upgradePlan(pl.id)}
                              disabled={plan === pl.id}>
                              {plan === pl.id ? "Current Plan ✓" : pl.id === "free" ? "Free" : `Get ${pl.name}`}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#4B5563" }}>
                        Payments processed securely via Stripe. Prices in INR. {APP_CONFIG.company.name}, {APP_CONFIG.company.jurisdiction}.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
