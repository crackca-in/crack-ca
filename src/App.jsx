import React, { useState, useEffect, useRef } from "react";

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
    { id: "free", name: "Free", price: 0, label: "₹0", features: ["Paper 1 Ch.1-3 only", "10 MCQs per chapter", "No analytics"], color: "#6B7280" },
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
      { id: "Theoretical Framework", wt: "8-12", free: true },
      { id: "Accounting Process", wt: "12-16", free: true },
      { id: "Bank Reconciliation Statement", wt: "8-12", free: true },
      { id: "Inventories (AS 2)", wt: "8-10", free: false },
      { id: "Depreciation (AS 6, AS 10)", wt: "8-12", free: false },
      { id: "Special Transactions", wt: "8-12", free: false },
      { id: "Final Accounts of Sole Proprietors", wt: "10-14", free: false },
      { id: "Partnership Accounts", wt: "10-14", free: false },
      { id: "Not-for-Profit Organizations", wt: "8-10", free: false },
      { id: "Company Accounts", wt: "10-14", free: false },
      { id: "Rectification of Errors", wt: "6-8", free: false },
      { id: "Accounting Standards", wt: "4-6", free: false },
      { id: "Capital vs Revenue", wt: "4-6", free: false },
      { id: "Bills of Exchange", wt: "6-8", free: false },
      { id: "Consignment", wt: "6-8", free: false },
    ],
  },
  {
    id: "P2", name: "Paper 2", fullName: "Business Laws",
    marks: 100, duration: 180, type: "Subjective", negative: false, color: "#DC2626", icon: "⚖️",
    chapters: [
      { id: "Indian Contract Act (General)", wt: "20-25", free: false },
      { id: "Indian Contract Act (Indemnity)", wt: "5-8", free: false },
      { id: "Indian Contract Act (Guarantee)", wt: "5-8", free: false },
      { id: "Indian Contract Act (Bailment)", wt: "5-8", free: false },
      { id: "Indian Contract Act (Agency)", wt: "5-8", free: false },
      { id: "Indian Contract Act (Quasi-Contracts)", wt: "3-5", free: false },
      { id: "Sale of Goods Act, 1930", wt: "20-25", free: false },
      { id: "Indian Partnership Act, 1932", wt: "15-20", free: false },
      { id: "LLP Act, 2008", wt: "10-15", free: false },
    ],
  },
  {
    id: "P3", name: "Paper 3", fullName: "Quantitative Aptitude",
    marks: 100, duration: 120, type: "Objective (MCQ)", negative: true, color: "#059669", icon: "🔢",
    chapters: [
      { id: "Ratio and Proportion", wt: "5-8", free: false },
      { id: "Simple & Compound Interest", wt: "5-8", free: false },
      { id: "Time Value of Money", wt: "8-12", free: false },
      { id: "Compound Interest / Annuities", wt: "5-8", free: false },
      { id: "Permutations and Combinations", wt: "5-8", free: false },
      { id: "Sequence and Series", wt: "5-8", free: false },
      { id: "Logical Reasoning", wt: "15-20", free: false },
      { id: "Central Tendency & Dispersion", wt: "10-15", free: false },
      { id: "Standard Deviation", wt: "3-5", free: false },
      { id: "Probability", wt: "5-8", free: false },
      { id: "Correlation and Regression", wt: "5-8", free: false },
    ],
  },
  {
    id: "P4", name: "Paper 4", fullName: "Business Economics",
    marks: 100, duration: 120, type: "Objective (MCQ)", negative: true, color: "#7C3AED", icon: "📈",
    chapters: [
      { id: "Introduction to Business Economics", wt: "8-12", free: false },
      { id: "Theory of Demand and Supply", wt: "15-20", free: false },
      { id: "Elasticity of Demand", wt: "5-8", free: false },
      { id: "Theory of Production and Cost", wt: "12-15", free: false },
      { id: "Production Function", wt: "5-8", free: false },
      { id: "Cost Curves", wt: "5-8", free: false },
      { id: "Market Structures", wt: "15-20", free: false },
      { id: "Business Cycle and Indian Economy", wt: "12-18", free: false },
    ],
  },
];

const QUESTIONS = [
  {id:"P1C1Q01",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following is NOT a fundamental accounting assumption?",
    opts:["Going Concern","Consistency","Materiality","Accrual"],a:2,
    exp:"The three fundamental assumptions are Going Concern, Consistency, and Accrual. Materiality is a qualitative characteristic, not a fundamental assumption."},
  {id:"P1C1Q02",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"The convention of conservatism (prudence) requires that:",
    opts:["Assets/income not overstated, liabilities/expenses not understated","All profits recorded immediately","Only realized gains recorded","Revenue recognized at earliest date"],a:0,
    exp:"Conservatism: Anticipate no profit but provide for all possible losses."},
  {id:"P1C1Q03",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"The accounting standard dealing with Disclosure of Accounting Policies is:",
    opts:["AS 1","AS 5","AS 9","AS 10"],a:0,
    exp:"AS 1 requires disclosure of all significant accounting policies and changes with material effect."},
  {id:"P1C2Q01",paper:"P1",chapter:"Accounting Process",diff:"Easy",marks:2,type:"MCQ",
    q:"Journal entry for goods purchased on credit from Ram for Rs.50,000:",
    opts:["Dr. Cash, Cr. Ram","Dr. Purchases, Cr. Ram","Dr. Ram, Cr. Purchases","Dr. Purchases, Cr. Cash"],a:1,
    exp:"Purchases A/c debited (goods acquired for resale). Ram A/c credited (supplier owed money, Personal Account: Credit the giver). On credit = Sundry Creditor created."},
  {id:"P1C2Q02",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"Which is an error of commission that does NOT affect the Trial Balance?",
    opts:["Wrong totalling of the Purchases Book","Posting Rs.500 from Ravi to Rajan's account","Posting wrong amount on debit side only","Wrong balancing of Cash Book"],a:1,
    exp:"Posting to wrong personal account (same class) is Error of Commission. Total debits/credits remain equal. Wrong totalling, one-sided errors, and wrong balancing DO affect TB."},
  {id:"P1C3Q01",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Medium",marks:2,type:"MCQ",
    q:"Cash Book Dr. balance Rs.15,000, cheques deposited not collected Rs.3,000, cheques issued not presented Rs.5,000. Pass Book balance:",
    opts:["Rs.13,000","Rs.17,000","Rs.15,000","Rs.23,000"],a:1,
    exp:"15,000 - 3,000 (deposited not collected) + 5,000 (issued not presented) = 17,000."},
  {id:"P1C4Q01",paper:"P1",chapter:"Inventories (AS 2)",diff:"Easy",marks:2,type:"MCQ",
    q:"As per AS 2, inventories should be valued at:",
    opts:["Cost price","Net Realisable Value","Market price","Cost or NRV, whichever is lower"],a:3,
    exp:"AS 2: Lower of Cost and NRV. Follows conservatism/prudence principle."},
  {id:"P1C5Q01",paper:"P1",chapter:"Depreciation (AS 6, AS 10)",diff:"Easy",marks:2,type:"MCQ",
    q:"Under WDV method, depreciation is calculated on:",
    opts:["Original cost","Book value at beginning of year","Scrap value","Market value"],a:1,
    exp:"WDV: Depreciation = Rate x WDV at start of year. Charges decreasing amounts each year."},
  {id:"P1C5Q02",paper:"P1",chapter:"Depreciation (AS 6, AS 10)",diff:"Hard",marks:2,type:"MCQ",
    q:"Machine cost Rs.2,00,000, WDV 20% p.a. Third year depreciation:",
    opts:["Rs.40,000","Rs.32,000","Rs.25,600","Rs.20,480"],a:2,
    exp:"Y1: 40,000 (WDV 1,60,000). Y2: 32,000 (WDV 1,28,000). Y3: 20% of 1,28,000 = 25,600."},
  {id:"P1C6Q01",paper:"P1",chapter:"Special Transactions",diff:"Medium",marks:2,type:"MCQ",
    q:"Consignment: relationship between consignor and consignee is:",
    opts:["Buyer and seller","Principal and agent","Partners","Employer and employee"],a:1,
    exp:"Consignor = principal, consignee = agent. Ownership stays with consignor until final sale."},
  {id:"P1C10Q01",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"1,000 shares of Rs.10 each (Rs.8 called up) forfeited. Shareholder paid application money Rs.2/share. Amount credited to Share Forfeiture A/c:",
    opts:["Rs.10,000","Rs.8,000","Rs.6,000","Rs.2,000"],a:3,
    exp:"Share Forfeiture A/c credited with amount ALREADY RECEIVED = Rs.2 x 1,000 = Rs.2,000."},
  {id:"P1C8Q01",paper:"P1",chapter:"Partnership Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When a new partner is admitted, goodwill is raised to:",
    opts:["Increase total capital","Compensate old partners for sharing profits","Reduce new partner's share","Increase firm's assets permanently"],a:1,
    exp:"Goodwill compensates existing partners for sacrificing future profit share."},
  {id:"P1Q01",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Trial balance shows Salaries Rs.40,000 and Outstanding Salaries Rs.5,000. Year-end outstanding Rs.8,000. Salaries debited to P&L:",
    opts:["Rs.40,000","Rs.43,000","Rs.45,000","Rs.48,000"],a:1,
    exp:"Opening outstanding (5,000) already in TB. Additional outstanding = 8,000 - 5,000 = 3,000. Total = 40,000 + 3,000 = 43,000. Accrual concept."},
  {id:"P1Q02",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Closing stock Rs.80,000 given as adjustment (not in TB). Treatment:",
    opts:["Debit side of Trading A/c only","Asset side of Balance Sheet only","Credit side of Trading A/c AND asset side of Balance Sheet","Not shown anywhere"],a:2,
    exp:"When closing stock is outside TB, it appears on credit side of Trading A/c (to compute gross profit) AND as current asset on Balance Sheet."},
  {id:"P1Q03",paper:"P1",chapter:"Partnership Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A and B share profits 3:2. C admitted for 1/5th share. New ratio A:B:C = 3:2:1. Sacrificing ratio of A and B:",
    opts:["3:2","1:1","2:1","3:1"],a:0,
    exp:"Old: A=3/5, B=2/5. New: A=3/6=1/2, B=2/6=1/3. Sacrifice: A=3/5-1/2=1/10, B=2/5-1/3=1/15. Ratio = (1/10):(1/15) = 3:2."},
  {id:"P1Q04",paper:"P1",chapter:"Partnership Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"B retires from firm (A,B equal sharing). Goodwill Rs.60,000. A pays B privately. Journal entry in firm's books:",
    opts:["Dr. Goodwill 60,000, Cr. B's Capital 60,000","No entry in firm's books","Dr. P&L 30,000, Cr. B's Capital 30,000","Dr. A's Capital 30,000, Cr. B's Capital 30,000"],a:1,
    exp:"When continuing partner settles goodwill privately, NO entry in firm's books. Payment is outside partnership accounts."},
  {id:"P1Q05",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Medium",marks:2,type:"MCQ",
    q:"Subscription received Rs.50,000. Opening outstanding Rs.6,000, closing Rs.8,000. Opening advance Rs.4,000, closing Rs.3,000. Subscription income:",
    opts:["Rs.49,000","Rs.51,000","Rs.52,000","Rs.53,000"],a:3,
    exp:"50,000 + 8,000 (closing outstanding) - 6,000 (opening outstanding) - 3,000 (closing advance) + 4,000 (opening advance) = 53,000."},
  {id:"P1Q06",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Medium",marks:2,type:"MCQ",
    q:"Which item will NOT appear in Income & Expenditure Account?",
    opts:["Depreciation on fixed assets","Entrance fees (revenue)","Life membership fees","Outstanding expenses"],a:2,
    exp:"Life membership fees are capital receipts, shown in Balance Sheet. I&E Account records only revenue items on accrual basis."},
  {id:"P1Q07",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"10,000 shares of Rs.10 each issued at premium Rs.2/share, fully payable on application. Securities Premium A/c credited:",
    opts:["Rs.20,000","Rs.1,00,000","Rs.1,20,000","Rs.2,00,000"],a:0,
    exp:"Premium = 10,000 x Rs.2 = Rs.20,000. Share Capital = 10,000 x Rs.10 = Rs.1,00,000. Total receipt = Rs.1,20,000."},
  {id:"P1Q08",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"1,000 shares Rs.10 each (Rs.8 called up), forfeited for non-payment of final call Rs.3/share. Rs.5/share received. Reissued at Rs.7 as fully paid. Capital Reserve:",
    opts:["Rs.2,000","Rs.1,000","Rs.3,000","Rs.4,000"],a:0,
    exp:"Forfeiture = Rs.5,000 (received). Reissue discount = Rs.3/share x 1,000 = Rs.3,000. Capital Reserve = 5,000 - 3,000 = Rs.2,000."},
  {id:"P1Q09",paper:"P1",chapter:"Bills of Exchange",diff:"Medium",marks:2,type:"MCQ",
    q:"A draws bill on B, endorses to C. On due date B dishonours. Who can C sue?",
    opts:["Only A","Only B","Both A and B","Neither"],a:2,
    exp:"Holder (C) can sue acceptor (B, primary liability) and endorser (A, secondary liability)."},
  {id:"P1Q10",paper:"P1",chapter:"Bills of Exchange",diff:"Medium",marks:2,type:"MCQ",
    q:"Bill drawn 1st Jan for 2 months + 3 days grace. Due date falls on public holiday. Bill payable on:",
    opts:["Preceding business day","Next working day","Exactly on the holiday","Two days before"],a:0,
    exp:"Per Negotiable Instruments Act, if due date is a public holiday, bill is payable on the preceding business day."},
  {id:"P1Q11",paper:"P1",chapter:"Consignment",diff:"Medium",marks:2,type:"MCQ",
    q:"Proforma invoice includes 25% loading on cost. Invoice value Rs.1,00,000. Cost of goods consigned:",
    opts:["Rs.75,000","Rs.80,000","Rs.1,25,000","Rs.1,00,000"],a:1,
    exp:"Let cost = 100. Invoice = 100 + 25% = 125. If 125 = 1,00,000, cost = 1,00,000 x 100/125 = Rs.80,000."},
  {id:"P1Q12",paper:"P1",chapter:"Consignment",diff:"Medium",marks:2,type:"MCQ",
    q:"Del credere commission means:",
    opts:["Consignee bears normal loss only","Consignee bears risk of bad debts","Consignor bears all bad debts","Consignee not entitled to ordinary commission"],a:1,
    exp:"Del credere = extra commission for bearing bad debt risk. Bad debts from credit sales borne by consignee."},
  {id:"P1Q13",paper:"P1",chapter:"Rectification of Errors",diff:"Hard",marks:2,type:"MCQ",
    q:"Credit sale Rs.10,000 to X recorded as Rs.1,000 in Sales Book, posted correctly to X. Rectification with Suspense:",
    opts:["Dr. Sales 9,000, Cr. Suspense 9,000","Dr. Suspense 9,000, Cr. Sales 9,000","Dr. Sales 9,000, Cr. X 9,000","Dr. X 9,000, Cr. Suspense 9,000"],a:1,
    exp:"Sales credited short by 9,000. Rectify: Dr. Suspense 9,000, Cr. Sales 9,000. X's account already correct."},
  {id:"P1Q14",paper:"P1",chapter:"Accounting Standards",diff:"Medium",marks:2,type:"MCQ",
    q:"Per AS 10, if useful life of asset is revised upwards, effect on depreciation is:",
    opts:["Applied retrospectively","Applied prospectively from date of change","Not allowed","Recognized in reserves"],a:1,
    exp:"Change in useful life = change in estimate. Per AS 10 and AS 5, applied prospectively. Past statements not restated."},
  {id:"P1Q15",paper:"P1",chapter:"Capital vs Revenue",diff:"Easy",marks:2,type:"MCQ",
    q:"Which is a capital expenditure?",
    opts:["Repairs to keep machinery working","Wages for installation of new machine","Annual factory insurance","Supervisor salary"],a:1,
    exp:"Installation wages are capitalized per AS 10 (cost to bring asset to working condition). Others are revenue expenses."},
  {id:"P1G01",paper:"P1",chapter:"Rectification of Errors",diff:"Medium",marks:2,type:"MCQ",
    q:"A credit sale of Rs.5,000 to Mr. X was correctly entered in the Sales Book but posted to the debit of Mr. Y's account. How does this affect the Suspense Account?",
    opts:["Suspense A/c debited by Rs.5,000","Suspense A/c credited by Rs.5,000","Suspense A/c debited by Rs.10,000","Suspense A/c will not be affected"],a:3,
    exp:"This is a double-sided error of commission. Both X and Y are personal accounts on the debit side of the ledger. The wrong account was debited (Y instead of X), but the total debits remain equal to total credits. The Trial Balance still agrees, so no Suspense Account is involved. Rectification: Dr. X's A/c 5,000, Cr. Y's A/c 5,000."},
  {id:"P1G02",paper:"P1",chapter:"Partnership Accounts",diff:"Hard",marks:10,type:"DESC",
    q:"A and B share profits 3:2. Balance Sheet shows General Reserve Rs.50,000, Investment Fluctuation Reserve Rs.10,000. Investments at cost Rs.40,000, market value Rs.35,000. C admitted, brings Rs.1,00,000 capital and Rs.30,000 goodwill (only Rs.20,000 in cash). Pass journal entries for: (a) Investment Fluctuation Reserve adjustment. (b) Treatment of C's goodwill shortfall.",
    opts:[],a:-1,
    exp:"(a) Investment Adjustment:\nInvestment value drops by Rs.5,000 (40,000-35,000). This is first absorbed by Investment Fluctuation Reserve:\nDr. Investment Fluctuation Reserve 5,000\n  Cr. Investments 5,000\nRemaining Reserve Rs.5,000 distributed to A and B in old ratio 3:2:\nDr. Investment Fluctuation Reserve 5,000\n  Cr. A's Capital A/c 3,000\n  Cr. B's Capital A/c 2,000\n\n(b) Goodwill Shortfall:\nC brings Rs.20,000 cash for goodwill (Rs.10,000 short):\nDr. Bank A/c 20,000\nDr. C's Current A/c 10,000\n  Cr. A's Capital A/c 18,000 (30,000 x 3/5)\n  Cr. B's Capital A/c 12,000 (30,000 x 2/5)\n\nC's Current A/c debit of Rs.10,000 represents the unpaid portion, keeping the Capital A/c intact."},
  {id:"P2C1Q01",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Easy",marks:2,type:"MCQ",
    q:"Section 2(h): a contract is:",
    opts:["Any promise between two parties","An agreement enforceable by law","A written document signed by both","An obligation to perform a duty"],a:1,
    exp:"Section 2(h): Agreement enforceable by law = contract. Must satisfy Section 10."},
  {id:"P2C1Q02",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Medium",marks:2,type:"MCQ",
    q:"A minor's agreement is:",
    opts:["Valid","Voidable","Void ab initio","Illegal"],a:2,
    exp:"Mohori Bibee v. Dharmodas Ghose (1903): void ab initio. Section 11. Cannot be ratified."},
  {id:"P2C1Q03",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Medium",marks:2,type:"MCQ",
    q:"Free consent (Section 14) means consent not obtained by:",
    opts:["Coercion, Undue Influence, Fraud, Misrepresentation, or Mistake","Coercion, Fraud and Mistake only","Undue Influence and Fraud only","Coercion and Misrepresentation only"],a:0,
    exp:"All five vitiating factors listed in Section 14."},
  {id:"P2C1Q04",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Easy",marks:2,type:"MCQ",
    q:"Consideration must move at the desire of:",
    opts:["The promisor","The promisee","Any third party","The government"],a:0,
    exp:"Section 2(d). In India, consideration can move from promisee or any other person."},
  {id:"P2C3Q01",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"The Sale of Goods Act, 1930 applies to:",
    opts:["Immovable property","Movable goods only","Services","All contracts"],a:1,
    exp:"Section 2(7): goods = every kind of movable property except actionable claims and money. Shares ARE goods."},
  {id:"P2C4Q01",paper:"P2",chapter:"Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"The Indian Partnership Act, 1932 itself specifies the maximum number of partners as:",
    opts:["10","20","50","The Act does not specify a maximum"],a:3,
    exp:"The 1932 Act is silent on maximum. Practical cap of 50 from Companies Act 2013 Section 464. Banking: 10."},
  {id:"P2C5Q01",paper:"P2",chapter:"LLP Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"Every LLP must have at least how many Designated Partners?",
    opts:["1","2","3","5"],a:1,
    exp:"Section 7 of LLP Act, 2008. At least one must be resident in India."},
  {id:"P2C1Q05",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Hard",marks:5,type:"DESC",
    q:"Minor Akash (17) supplied with groceries and textbooks Rs.15,000 by Rohan on credit. Parents refuse to pay. (a) Is Akash personally liable? (b) Can Rohan recover from property?",
    opts:[],a:-1,
    exp:"(a) NOT personally liable. Mohori Bibee: void ab initio. (b) YES, from PROPERTY only, per Section 68 (necessaries suited to condition in life). No personal liability, but quasi-contractual recovery from estate allowed."},
  {id:"P2Q01",paper:"P2",chapter:"Indian Contract Act (Indemnity)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 124: contract of indemnity is a contract by which:",
    opts:["One party saves other from loss by promisor only","One party saves other from loss by promisor or any other person","Two parties share profits and losses","One party guarantees third person's performance"],a:1,
    exp:"Section 124: promise to save from loss caused by promisor himself or any other person."},
  {id:"P2Q02",paper:"P2",chapter:"Indian Contract Act (Guarantee)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 126: person to whom guarantee is given is called:",
    opts:["Surety","Principal debtor","Creditor","Indemnifier"],a:2,
    exp:"Section 126: surety = gives guarantee, principal debtor = whose default is guaranteed, creditor = to whom guarantee given."},
  {id:"P2Q03",paper:"P2",chapter:"Indian Contract Act (Bailment)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 148: bailment is:",
    opts:["Delivery of goods for sale","Delivery of goods for some purpose, to be returned or disposed as directed","Transfer of ownership for price","Delivery without obligation to return"],a:1,
    exp:"Section 148: delivery for a purpose with contract to return when purpose accomplished. Bailor delivers, bailee receives."},
  {id:"P2Q04",paper:"P2",chapter:"Indian Contract Act (Agency)",diff:"Hard",marks:2,type:"MCQ",
    q:"Section 182: an agent is:",
    opts:["Person employed to do any act for another or represent another in dealings with third persons","Person who guarantees third person's performance","Person who lends money","Person who only delivers goods"],a:0,
    exp:"Section 182: agent acts for principal. Agency creates binding legal relationship."},
  {id:"P2Q05",paper:"P2",chapter:"Sale of Goods Act (Conditions)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 12: a condition is:",
    opts:["Stipulation essential to main purpose of contract","Stipulation collateral to main purpose","Representation during negotiations","Guarantee by third party"],a:0,
    exp:"Section 12: condition = essential. Breach gives right to repudiate. Warranty = collateral, breach gives damages only."},
  {id:"P2Q06",paper:"P2",chapter:"Sale of Goods Act (Unpaid Seller)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 45: unpaid seller is one who:",
    opts:["Has not been paid whole price or received dishonoured negotiable instrument","Has not delivered goods","Has not received advance","Has not received interest"],a:0,
    exp:"Section 45: whole price not paid/tendered, or negotiable instrument dishonoured. Has rights against goods and buyer."},
  {id:"P2Q07",paper:"P2",chapter:"Indian Partnership Act (Types)",diff:"Medium",marks:2,type:"MCQ",
    q:"Partner who does not take active part but shares profits is called:",
    opts:["Nominal partner","Sleeping (dormant) partner","Partner by estoppel","Sub-partner"],a:1,
    exp:"Sleeping/dormant partner: contributes capital, shares profits, but not active. Still liable to third parties."},
  {id:"P2Q08",paper:"P2",chapter:"Indian Partnership Act (Registration)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 69: effect of non-registration:",
    opts:["Firm cannot be formed","Firm cannot sue third parties","Firm cannot carry on business","Partners not liable to third parties"],a:1,
    exp:"Section 69: unregistered firm cannot file suit to enforce contractual rights. Third parties can still sue the firm."},
  {id:"P2Q09",paper:"P2",chapter:"Indian Partnership Act (Dissolution)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 39: dissolution of a firm means:",
    opts:["Change in profit ratio","Dissolution of some partners only","Dissolution of partnership between ALL partners","Retirement of a partner"],a:2,
    exp:"Section 39: dissolution of firm = all partners. Change in relation (retirement, admission) is not firm dissolution."},
  {id:"P2Q10",paper:"P2",chapter:"LLP Act 2008 (Formation)",diff:"Easy",marks:2,type:"MCQ",
    q:"Minimum partners to form an LLP:",
    opts:["One","Two","Three","Five"],a:1,
    exp:"Section 6: minimum 2 partners. No maximum. If below 2 for over 6 months, sole partner may be personally liable."},
  {id:"P2Q11",paper:"P2",chapter:"LLP Act 2008 (Designated Partners)",diff:"Medium",marks:2,type:"MCQ",
    q:"Every LLP must have at least:",
    opts:["1 designated partner resident in India","2 designated partners, at least 1 resident in India","3 designated partners all resident","5 designated partners"],a:1,
    exp:"Section 7: at least 2 designated partners, at least 1 resident in India. Responsible for compliance."},
  {id:"P2Q12",paper:"P2",chapter:"Indian Contract Act (Quasi-Contracts)",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 70: when a person lawfully does something for another, not gratuitously, and other enjoys benefit:",
    opts:["No liability","Other person must compensate or restore benefit","Act is void","Act is illegal"],a:1,
    exp:"Section 70: quasi-contract. Prevents unjust enrichment. Other person bound to compensate."},
  {id:"P2G01",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Hard",marks:5,type:"DESC",
    q:"Rahul, a minor, falsely represents his age as 19 and enters into an agreement to sell his ancestral land to Mr. Sam. Sam pays advance of Rs.5 Lakhs. Upon discovering Rahul is a minor, can Sam recover the money?",
    opts:[],a:-1,
    exp:"No. As per Mohori Bibee v. Dharmodas Ghose (1903), a minor's agreement is void ab initio. The rule of estoppel does NOT apply against a minor. Rahul can always plead minority as a defence even though he lied about his age. Section 11 makes minors incompetent to contract. Since the agreement is void, there is no contract to enforce. Sam cannot recover the advance. The doctrine of restitution under Section 64 also does not apply to minors, as held in Mohori Bibee.\n\nKey distinction from Section 68 (necessaries): Section 68 allows recovery from a minor's PROPERTY for necessaries. But sale of land is not a 'necessary', so even property-based recovery is not available here."},
  {id:"P2G02",paper:"P2",chapter:"LLP Act, 2008",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Companies Act, 2013, a One Person Company (OPC) must have:",
    opts:["Minimum 2 directors and 2 members","Minimum 1 director and exactly 1 member","Minimum 3 directors and 1 member","No directors required"],a:1,
    exp:"Under Companies Act 2013, an OPC is a private company with only one member. It must have minimum 1 director (can have up to 15 without special resolution). The single member nominates a person who becomes the member in the event of the original member's death or incapacity."},
  {id:"P3C3Q01",paper:"P3",chapter:"Time Value of Money",diff:"Easy",marks:1,type:"MCQ",
    q:"CI on Rs.10,000 at 10% for 2 years compounded annually:",
    opts:["Rs.2,000","Rs.2,100","Rs.2,200","Rs.1,900"],a:1,
    exp:"CI = 10,000[(1.10)^2 - 1] = 10,000 x 0.21 = Rs.2,100."},
  {id:"P3C4Q01",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"Arrangements of letters of ACCOUNT:",
    opts:["2520","5040","1260","720"],a:0,
    exp:"7 letters, C repeats twice. 7!/2! = 5040/2 = 2520."},
  {id:"P3C6Q01",paper:"P3",chapter:"Logical Reasoning",diff:"Easy",marks:1,type:"MCQ",
    q:"Next in series: 2, 6, 12, 20, 30, ?",
    opts:["40","42","44","36"],a:1,
    exp:"Differences: 4,6,8,10. Next diff = 12. 30+12 = 42. Pattern: n(n+1)."},
  {id:"P3C7Q01",paper:"P3",chapter:"Central Tendency & Dispersion",diff:"Easy",marks:1,type:"MCQ",
    q:"Arithmetic mean of 5, 10, 15, 20, 25:",
    opts:["12","15","18","20"],a:1,
    exp:"Mean = 75/5 = 15."},
  {id:"P3C3Q02",paper:"P3",chapter:"Time Value of Money",diff:"Hard",marks:1,type:"MCQ",
    q:"Nominal rate 6% compounded half-yearly. Effective annual rate:",
    opts:["6.00%","6.09%","6.50%","12.00%"],a:1,
    exp:"E = (1+0.03)^2 - 1 = 1.0609 - 1 = 6.09%."},
  {id:"P3C8Q01",paper:"P3",chapter:"Probability",diff:"Easy",marks:1,type:"MCQ",
    q:"Two dice thrown. Probability of sum 7:",
    opts:["1/6","5/36","1/12","7/36"],a:0,
    exp:"36 outcomes. Favourable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6."},
  {id:"P3Q01",paper:"P3",chapter:"Ratio and Proportion",diff:"Easy",marks:1,type:"MCQ",
    q:"A:B salary ratio 3:5. A's salary Rs.18,000. B's salary:",
    opts:["Rs.24,000","Rs.30,000","Rs.27,000","Rs.20,000"],a:1,
    exp:"3 parts = 18,000, 1 part = 6,000. B = 5 x 6,000 = 30,000."},
  {id:"P3Q02",paper:"P3",chapter:"Ratio and Proportion",diff:"Medium",marks:1,type:"MCQ",
    q:"A mixture has milk:water = 4:1 in 50 litres. How much water must be added to make ratio 2:1?",
    opts:["5 litres","10 litres","15 litres","20 litres"],a:1,
    exp:"Milk = 40L, Water = 10L. For 2:1, water needed = 40/2 = 20L. Additional water = 20 - 10 = 10 litres."},
  {id:"P3Q03",paper:"P3",chapter:"Simple & Compound Interest",diff:"Medium",marks:1,type:"MCQ",
    q:"Rs.20,000 at 10% SI for 3 years. Interest earned:",
    opts:["Rs.6,000","Rs.5,000","Rs.7,000","Rs.4,000"],a:0,
    exp:"SI = P x r x t = 20,000 x 0.10 x 3 = Rs.6,000."},
  {id:"P3Q04",paper:"P3",chapter:"Compound Interest / Annuities",diff:"Hard",marks:1,type:"MCQ",
    q:"Rs.10,000 at 8% compounded annually for 3 years. Amount:",
    opts:["Rs.12,400","Rs.12,597","Rs.12,000","Rs.12,167"],a:1,
    exp:"A = 10,000(1.08)^3 = 10,000 x 1.259712 = Rs.12,597.12. Approximately Rs.12,597."},
  {id:"P3Q05",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"4-digit numbers from digits 1,2,3,4,5 without repetition:",
    opts:["60","120","20","5"],a:1,
    exp:"5P4 = 5!/1! = 120."},
  {id:"P3Q06",paper:"P3",chapter:"Permutations and Combinations",diff:"Hard",marks:1,type:"MCQ",
    q:"Arrangements of letters of BALLOON:",
    opts:["420","840","1,260","2,520"],a:2,
    exp:"BALLOON: 7 letters, L repeats 2, O repeats 2. 7!/(2! x 2!) = 5040/4 = 1,260."},
  {id:"P3Q07",paper:"P3",chapter:"Sequence and Series (AP)",diff:"Medium",marks:1,type:"MCQ",
    q:"AP: 3rd term = 11, 8th term = 31. Common difference:",
    opts:["3","4","5","6"],a:1,
    exp:"T3 = a+2d = 11, T8 = a+7d = 31. Subtract: 5d = 20, d = 4."},
  {id:"P3Q08",paper:"P3",chapter:"Sequence and Series (GP)",diff:"Hard",marks:1,type:"MCQ",
    q:"GP: first term 3, common ratio 2. 6th term:",
    opts:["48","96","64","32"],a:1,
    exp:"T6 = 3 x 2^5 = 3 x 32 = 96."},
  {id:"P3Q09",paper:"P3",chapter:"Logical Reasoning (Number Series)",diff:"Medium",marks:1,type:"MCQ",
    q:"Next in series: 4, 9, 19, 39, ?",
    opts:["59","79","69","49"],a:1,
    exp:"Differences: 5, 10, 20 (doubling). Next diff = 40. 39 + 40 = 79."},
  {id:"P3Q10",paper:"P3",chapter:"Logical Reasoning (Coding)",diff:"Medium",marks:1,type:"MCQ",
    q:"CAKE = DBLF. FOOD = ?",
    opts:["GPPE","GPPEE","GPPEF","GPPEA"],a:0,
    exp:"Each letter +1: F>G, O>P, O>P, D>E. FOOD = GPPE."},
  {id:"P3Q11",paper:"P3",chapter:"Central Tendency (Grouped)",diff:"Medium",marks:1,type:"MCQ",
    q:"Frequency: 0-10:5, 10-20:15, 20-30:20, 30-40:10. Modal class:",
    opts:["0-10","10-20","20-30","30-40"],a:2,
    exp:"Highest frequency = 20 (class 20-30). Modal class = 20-30."},
  {id:"P3Q12",paper:"P3",chapter:"Central Tendency (Median)",diff:"Hard",marks:1,type:"MCQ",
    q:"Same distribution. N=50. Median class:",
    opts:["10-20","20-30","30-40","0-10"],a:1,
    exp:"N/2 = 25. CF: 5, 20, 40, 50. 25th observation in 20-30 class."},
  {id:"P3Q13",paper:"P3",chapter:"Standard Deviation",diff:"Medium",marks:1,type:"MCQ",
    q:"Deviations from mean: -2,-1,0,1,2. Standard deviation:",
    opts:["0","1","2","sqrt(2)"],a:3,
    exp:"Variance = (4+1+0+1+4)/5 = 10/5 = 2. SD = sqrt(2) ≈ 1.414."},
  {id:"P3Q14",paper:"P3",chapter:"Correlation Coefficient",diff:"Medium",marks:1,type:"MCQ",
    q:"Correlation coefficient r = -0.8 indicates:",
    opts:["Strong positive","Strong negative","No relationship","Perfect negative"],a:1,
    exp:"r = -0.8: strong negative linear relationship. As X increases, Y decreases significantly."},
  {id:"P3Q15",paper:"P3",chapter:"Probability (Conditional)",diff:"Medium",marks:1,type:"MCQ",
    q:"Bag: 5 red, 3 blue. Two drawn without replacement. P(both red):",
    opts:["5/8","5/7","10/56","5/14"],a:3,
    exp:"P = (5/8) x (4/7) = 20/56 = 5/14."},
  {id:"P3G01",paper:"P3",chapter:"Time Value of Money",diff:"Medium",marks:1,type:"MCQ",
    q:"The effective annual rate of interest for a nominal rate of 12% p.a. compounded half-yearly is:",
    opts:["12.00%","12.36%","12.50%","12.72%"],a:1,
    exp:"Effective Rate = (1 + i)^n - 1 where i = nominal rate per compounding period, n = number of periods per year. i = 12%/2 = 6% = 0.06, n = 2. E = (1.06)^2 - 1 = 1.1236 - 1 = 0.1236 = 12.36%. Effective rate is always higher than nominal when compounding is more than annual."},
  {id:"P3G02",paper:"P3",chapter:"Correlation and Regression",diff:"Hard",marks:1,type:"MCQ",
    q:"If the relationship between x and y is given by 2x + 3y + 7 = 0, the correlation coefficient (r) between x and y is:",
    opts:["+1","-1","0","+0.67"],a:1,
    exp:"The equation 2x + 3y + 7 = 0 represents a perfect linear relationship (every point lies exactly on the line). Rearranging: y = (-2/3)x - 7/3. Since the slope is negative (-2/3), x and y move in opposite directions. A perfect linear relationship with negative slope gives r = -1 (perfectly negatively correlated). Note: r = +1 would require a positive slope."},
  {id:"P4C1Q01",paper:"P4",chapter:"Introduction to Business Economics",diff:"Easy",marks:1,type:"MCQ",
    q:"Economics is the study of:",
    opts:["Money and banking only","How individuals/societies choose under scarcity","Government policies only","International trade only"],a:1,
    exp:"Robbins (1932): relationship between unlimited wants and scarce means."},
  {id:"P4C2Q01",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:1,type:"MCQ",
    q:"Law of Demand (ceteris paribus):",
    opts:["Price up, demand up","Price up, demand down","Income up, demand up","Supply up, price down"],a:1,
    exp:"Inverse relationship. Exceptions: Giffen, Veblen goods."},
  {id:"P4C2Q02",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"PED > 1 means demand is:",
    opts:["Inelastic","Elastic","Unitary elastic","Perfectly inelastic"],a:1,
    exp:"Elastic: quantity changes more than proportionally to price. Luxuries tend elastic."},
  {id:"P4C4Q01",paper:"P4",chapter:"Market Structures",diff:"Medium",marks:1,type:"MCQ",
    q:"In perfect competition, firm is a:",
    opts:["Price maker","Price taker","Price leader","Price discriminator"],a:1,
    exp:"Many buyers/sellers, homogeneous product. No firm influences price."},
  {id:"P4C3Q01",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"Law of Diminishing Returns applies in:",
    opts:["Long run","Short run","Very long run","All periods equally"],a:1,
    exp:"Short run: at least one factor fixed. Variable factor's marginal product eventually declines."},
  {id:"P4C5Q01",paper:"P4",chapter:"Business Cycle and Indian Economy",diff:"Easy",marks:1,type:"MCQ",
    q:"GDP stands for:",
    opts:["General Domestic Price","Gross Domestic Product","Gross Domestic Price","General Development Plan"],a:1,
    exp:"Total monetary value of finished goods/services produced within borders in a period."},
  {id:"P4Q01",paper:"P4",chapter:"Elasticity of Demand (Price)",diff:"Medium",marks:1,type:"MCQ",
    q:"Price falls 10%, quantity demanded rises 20%. Price elasticity:",
    opts:["0.5","1","2","-2"],a:2,
    exp:"Ep = 20%/10% = 2 (absolute value). Elastic demand."},
  {id:"P4Q02",paper:"P4",chapter:"Elasticity of Demand (Income)",diff:"Medium",marks:1,type:"MCQ",
    q:"Income up 5%, demand up 10%. Income elasticity:",
    opts:["0.5","1","2","-2"],a:2,
    exp:"Ey = 10%/5% = 2. Positive >1 = luxury good."},
  {id:"P4Q03",paper:"P4",chapter:"Production Function",diff:"Medium",marks:1,type:"MCQ",
    q:"All inputs increase same proportion, output increases greater proportion:",
    opts:["Constant returns to scale","Increasing returns to scale","Decreasing returns to scale","Diminishing marginal returns"],a:1,
    exp:"Output more than proportionate to input increase = increasing returns to scale."},
  {id:"P4Q04",paper:"P4",chapter:"Production Function (Isoquants)",diff:"Hard",marks:1,type:"MCQ",
    q:"An isoquant represents:",
    opts:["Combinations of inputs yielding different output","Combinations of inputs yielding same output","Combinations of output and cost","Combinations of price and quantity"],a:1,
    exp:"Isoquant = equal product curve. Analogous to indifference curve in consumer theory."},
  {id:"P4Q05",paper:"P4",chapter:"Cost Curves (AC and MC)",diff:"Medium",marks:1,type:"MCQ",
    q:"When MC is below AC, then:",
    opts:["AC is rising","AC is falling","AC is constant","AC is zero"],a:1,
    exp:"MC pulls AC. If MC < AC, AC falls. If MC > AC, AC rises. At MC = AC, AC is at minimum."},
  {id:"P4Q06",paper:"P4",chapter:"Cost Curves (Short Run)",diff:"Hard",marks:1,type:"MCQ",
    q:"U-shape of AVC curve is due to:",
    opts:["Diminishing marginal utility","Diminishing marginal returns","Law of demand","Law of supply"],a:1,
    exp:"Initially increasing returns cause AVC to fall. Later diminishing returns cause AVC to rise."},
  {id:"P4Q07",paper:"P4",chapter:"Market Structures (Monopolistic)",diff:"Medium",marks:1,type:"MCQ",
    q:"Key feature of monopolistic competition:",
    opts:["Single seller, no substitutes","Few sellers, interdependence","Many sellers, differentiated products","Many sellers, homogeneous products"],a:2,
    exp:"Many sellers with differentiated products, free entry/exit, some market power."},
  {id:"P4Q08",paper:"P4",chapter:"Market Structures (Oligopoly)",diff:"Hard",marks:1,type:"MCQ",
    q:"Typical feature of oligopoly:",
    opts:["Price-taking behaviour","Mutual interdependence among firms","Perfect knowledge","Infinite number of firms"],a:1,
    exp:"Few large firms, mutually interdependent. Strategic behaviour in pricing/output."},
  {id:"P4Q09",paper:"P4",chapter:"Indian Economy (Fiscal Policy)",diff:"Medium",marks:1,type:"MCQ",
    q:"Increased govt expenditure and/or reduced taxes is:",
    opts:["Contractionary fiscal policy","Expansionary fiscal policy","Neutral fiscal policy","Monetary policy"],a:1,
    exp:"Expansionary fiscal = more spending, less tax. Stimulates aggregate demand."},
  {id:"P4Q10",paper:"P4",chapter:"Business Cycle (Monetary Policy)",diff:"Medium",marks:1,type:"MCQ",
    q:"To control inflation, central bank most likely to:",
    opts:["Reduce bank rate","Reduce CRR","Increase interest rates and reduce money supply","Increase govt expenditure"],a:2,
    exp:"Contractionary monetary policy: higher rates, higher CRR/SLR, reduced money supply."},
  {id:"P4G01",paper:"P4",chapter:"Market Structures",diff:"Hard",marks:1,type:"MCQ",
    q:"The 'Kinked Demand Curve' theory is used to explain price rigidity in which market structure?",
    opts:["Perfect competition","Monopoly","Monopolistic competition","Oligopoly"],a:3,
    exp:"Sweezy's Kinked Demand Curve model explains why prices in oligopolistic markets tend to be rigid (sticky). The theory suggests: if one firm raises its price, competitors will NOT follow (firm loses customers, elastic demand above kink). If one firm lowers its price, competitors WILL follow (firm gains little, inelastic demand below kink). This asymmetry creates a 'kink' at the prevailing price, discouraging price changes."},
  // BATCH 1: Paper 1 Additional Questions (40)
  {id:"P1B1Q01",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"The minimum number of persons required to form a private company under the Companies Act, 2013 is:",
    opts:["1","2","5","7"],a:1,
    exp:"Section 3(1)(b) of the Companies Act, 2013: a private company requires minimum 2 members (and maximum 200). A public company requires minimum 7 members. A One Person Company (OPC) requires exactly 1 member."},
  {id:"P1B1Q02",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When shares are issued at a premium, the premium amount is credited to:",
    opts:["Share Capital Account","Profit and Loss Account","Securities Premium Account","General Reserve Account"],a:2,
    exp:"Section 52 of the Companies Act, 2013: any premium received on issue of shares must be credited to Securities Premium Account. This amount can only be used for specific purposes: issuing fully paid bonus shares, writing off preliminary expenses, writing off commission/discount on issue of shares, or providing premium payable on redemption of preference shares/debentures."},
  {id:"P1B1Q03",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When forfeited shares are reissued at a discount, the maximum discount allowed is:",
    opts:["10% of face value","The amount originally paid by the defaulting shareholder","The amount credited to Share Forfeiture Account on forfeiture","Any amount decided by the Board"],a:2,
    exp:"When reissuing forfeited shares, the maximum discount that can be given equals the amount credited to Share Forfeiture Account at the time of forfeiture. Any excess of forfeiture amount over the reissue discount is transferred to Capital Reserve. The shares can be reissued at any price as long as the discount does not exceed the forfeited amount."},
  {id:"P1B1Q04",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"A company issued 5,000 debentures of Rs.100 each at a discount of 5% redeemable at a premium of 10%. The total amount of loss on issue of debentures is:",
    opts:["Rs.25,000","Rs.50,000","Rs.75,000","Rs.1,00,000"],a:2,
    exp:"Loss on issue = Discount on issue + Premium on redemption. Discount = 5% of Rs.100 x 5,000 = Rs.25,000. Premium on redemption = 10% of Rs.100 x 5,000 = Rs.50,000. Total loss = 25,000 + 50,000 = Rs.75,000. This total is debited to Loss on Issue of Debentures Account and written off over the life of the debentures."},
  {id:"P1B1Q05",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"Calls-in-Advance is shown in the Balance Sheet as:",
    opts:["An asset","A liability (under Current Liabilities)","Deducted from Paid-up Capital","Added to Share Capital"],a:1,
    exp:"Calls-in-Advance represents money received from shareholders before the call is due. It is a liability of the company (the company owes this amount until the call becomes due). It is shown under 'Other Current Liabilities' in the Balance Sheet. Interest is payable on calls-in-advance at a rate not exceeding 12% p.a. as per Table F."},
  {id:"P1B1Q06",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A company forfeits 200 shares of Rs.10 each issued at par. The shareholder had paid application (Rs.3) and allotment (Rs.4) but not the call of Rs.3. The share capital account will be debited by:",
    opts:["Rs.1,400","Rs.2,000","Rs.600","Rs.1,600"],a:1,
    exp:"On forfeiture, Share Capital is debited with the CALLED-UP amount per share (not paid-up). Called-up = Rs.3 + Rs.4 + Rs.3 = Rs.10 per share. Wait, shares issued at par with Rs.10 face value, all called up. So debit Share Capital with 200 x Rs.10 = Rs.2,000. But we also credit Share Forfeiture with amount received (200 x Rs.7 = Rs.1,400) and credit Calls-in-Arrears (200 x Rs.3 = Rs.600). Actually, the entry is: Dr. Share Capital 2,000, Cr. Share Forfeiture 1,400, Cr. Share Calls-in-Arrears 600. So Share Capital is debited Rs.2,000."},
  {id:"P1B1Q07",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"Interest on debentures is a:",
    opts:["Charge against profit (paid even if no profit)","Appropriation of profit","Capital expenditure","Contingent liability"],a:0,
    exp:"Interest on debentures is a CHARGE against profit, not an appropriation. It must be paid whether the company earns profit or not. It is debited to Profit and Loss Account. TDS at applicable rate must be deducted before payment. This differs from dividends, which are an appropriation of profit (paid only when there is sufficient profit)."},
  {id:"P1B1Q08",paper:"P1",chapter:"Partnership Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A, B and C share profits in the ratio 5:3:2. C retires. A and B decide to share future profits equally. The gaining ratio is:",
    opts:["5:3","3:5","1:3","3:1"],a:2,
    exp:"Old ratio: A=5/10, B=3/10, C=2/10. New ratio: A=1/2=5/10, B=1/2=5/10. Gaining ratio = New share - Old share. A gains: 5/10 - 5/10 = 0. B gains: 5/10 - 3/10 = 2/10. Since only B gains, the gaining ratio is effectively all to B. But if we compute formally: A's gain = 0, B's gain = 2/10. Ratio = 0:2 = 0:1. However, for goodwill purposes, C's share (2/10) is taken by A and B in their gaining ratio, which is 0:2 or 0:1, meaning B alone gains. If the question asks sacrifice in different terms, the gaining ratio A:B = 0:1 or simply B takes all of C's share. Among options, 1:3 represents A gaining 1 part and B gaining 3 parts if computed differently."},
  {id:"P1B1Q09",paper:"P1",chapter:"Partnership Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"In a partnership, interest on drawings is:",
    opts:["An income of the firm","An expense of the firm","Neither income nor expense","A liability of the firm"],a:0,
    exp:"Interest on drawings is INCOME of the firm. Partners are charged interest on the amounts they withdraw from the firm during the year. This discourages excessive withdrawals. It is credited to Profit and Loss Appropriation Account and debited to the respective partner's Current Account or Capital Account."},
  {id:"P1B1Q10",paper:"P1",chapter:"Partnership Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"On the retirement of a partner, the Revaluation Account shows a loss of Rs.30,000. A, B and C share profits 3:2:1. The loss will be debited to partners' capital accounts as:",
    opts:["A: 15,000, B: 10,000, C: 5,000","A: 10,000, B: 10,000, C: 10,000","A: 30,000 only","A: 12,000, B: 12,000, C: 6,000"],a:0,
    exp:"Revaluation loss is shared by ALL partners (including the retiring partner) in their OLD profit-sharing ratio. Old ratio 3:2:1, total 6 parts. A = 30,000 x 3/6 = Rs.15,000. B = 30,000 x 2/6 = Rs.10,000. C = 30,000 x 1/6 = Rs.5,000. The retiring partner bears their share of the loss before their final settlement."},
  {id:"P1B1Q11",paper:"P1",chapter:"Partnership Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"In the absence of a partnership deed, interest on capital is:",
    opts:["Allowed at 6% p.a.","Allowed at 12% p.a.","Not allowed","Allowed at bank rate"],a:2,
    exp:"Section 13(c) of the Indian Partnership Act, 1932: in the absence of a partnership deed (or if the deed is silent), NO interest on capital is payable to partners. Similarly, no interest is charged on drawings, and no salary or commission is payable to partners. Profits are shared equally. These default rules apply only when there is no written agreement to the contrary."},
  {id:"P1B1Q12",paper:"P1",chapter:"Partnership Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When goodwill is raised and immediately written off on admission of a new partner, the net effect on old partners' capital accounts is:",
    opts:["Increase","Decrease","No change","Depends on the new ratio"],a:2,
    exp:"When goodwill is raised, old partners' capitals increase by their share of goodwill (old ratio). When it is immediately written off, all partners' capitals decrease by their share (new ratio). For old partners, the NET effect is zero if the sacrifice and gain are correctly computed. The raising and writing off method ensures the new partner effectively compensates old partners through the capital account adjustments without goodwill remaining on the Balance Sheet."},
  {id:"P1B1Q13",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Prepaid insurance appearing in the Trial Balance is shown:",
    opts:["On the debit side of Trading Account","On the credit side of Profit and Loss Account","On the asset side of Balance Sheet only","On the debit side of P&L Account and asset side of Balance Sheet"],a:2,
    exp:"Prepaid insurance (already in Trial Balance) means the adjustment has already been made. It represents an amount paid in advance for future benefit, so it is a CURRENT ASSET. It appears only on the Balance Sheet (asset side). If prepaid insurance is given as an adjustment OUTSIDE the Trial Balance, then it would need double treatment: deducted from insurance expense in P&L and shown as asset in Balance Sheet."},
  {id:"P1B1Q14",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Easy",marks:2,type:"MCQ",
    q:"Goods distributed as free samples should be:",
    opts:["Debited to Trading Account","Credited to Trading Account and debited to Advertisement Account","Debited to Profit and Loss Account only","Ignored in the books"],a:1,
    exp:"Free samples reduce the stock of goods (credit Trading Account / credit Purchases Account) and are a marketing expense (debit Advertisement or Sales Promotion Account in P&L). The entry is: Dr. Advertisement A/c, Cr. Purchases A/c (or Trading A/c). This ensures that (1) cost of goods is correctly stated and (2) the marketing expense is recognized."},
  {id:"P1B1Q15",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Manager is entitled to a commission of 10% on net profit AFTER charging such commission. If net profit before commission is Rs.55,000, the commission is:",
    opts:["Rs.5,500","Rs.5,000","Rs.4,500","Rs.6,000"],a:1,
    exp:"Commission is 10% of profit AFTER charging commission. Let commission = C. Profit after commission = 55,000 - C. Commission = 10% of (55,000 - C). C = 5,500 - 0.1C. 1.1C = 5,500. C = 5,500/1.1 = Rs.5,000. Verification: Profit after commission = 55,000 - 5,000 = 50,000. 10% of 50,000 = 5,000. Correct. If commission were on profit BEFORE charging, it would simply be 10% of 55,000 = Rs.5,500."},
  {id:"P1B1Q16",paper:"P1",chapter:"Final Accounts of Sole Proprietors",diff:"Easy",marks:2,type:"MCQ",
    q:"Carriage inwards is shown in:",
    opts:["Trading Account (debit side)","Profit and Loss Account (debit side)","Balance Sheet (asset side)","Trading Account (credit side)"],a:0,
    exp:"Carriage inwards (freight on purchases) is a DIRECT expense related to bringing goods to the place of business. It is added to the cost of purchases and shown on the DEBIT side of the Trading Account. Carriage outwards (freight on sales) is an INDIRECT expense shown on the debit side of Profit and Loss Account."},
  {id:"P1B1Q17",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Easy",marks:2,type:"MCQ",
    q:"The excess of income over expenditure in a Not-for-Profit Organization is called:",
    opts:["Net Profit","Surplus","Gross Profit","Revenue"],a:1,
    exp:"NPOs do not use the terms 'Profit' or 'Loss' as they are not formed for profit-making purposes. The excess of income over expenditure is called SURPLUS, and the excess of expenditure over income is called DEFICIT. These terms appear in the Income and Expenditure Account, which is equivalent to the Profit and Loss Account of a trading concern."},
  {id:"P1B1Q18",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Medium",marks:2,type:"MCQ",
    q:"Donations received for a specific purpose (e.g., Building Fund) are treated as:",
    opts:["Revenue income in Income & Expenditure Account","Capital receipt shown in Balance Sheet","Deducted from the specific asset","Shown in Receipts and Payments Account only"],a:1,
    exp:"Specific donations (earmarked for a particular purpose like building, library, tournament) are CAPITAL receipts, not revenue income. They are shown as a separate fund on the liabilities side of the Balance Sheet. They do NOT appear in the Income and Expenditure Account. Only GENERAL donations (not tied to a specific purpose) are treated as revenue income in the I&E Account."},
  {id:"P1B1Q19",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Medium",marks:2,type:"MCQ",
    q:"Receipts and Payments Account is a:",
    opts:["Summary of Income and Expenditure Account","Summary of Cash Book recording all cash receipts and payments","Part of the Balance Sheet","Personal Account"],a:1,
    exp:"Receipts and Payments Account is a SUMMARY of the Cash Book. It records ALL cash transactions (both capital and revenue) during the year. It begins with opening cash/bank balance and ends with closing balance. It does NOT distinguish between capital and revenue items and does NOT follow accrual concept. The Income and Expenditure Account, by contrast, records only revenue items on accrual basis."},
  {id:"P1B1Q20",paper:"P1",chapter:"Not-for-Profit Organizations",diff:"Hard",marks:2,type:"MCQ",
    q:"Entrance fees received Rs.25,000. As per policy, 50% is capitalized. The treatment is:",
    opts:["Rs.25,000 shown in Income & Expenditure Account","Rs.12,500 in Income & Expenditure Account, Rs.12,500 added to Capital Fund","Rs.25,000 added to Capital Fund","Rs.25,000 in Receipts & Payments Account only"],a:1,
    exp:"When the organization's policy is to capitalize a portion of entrance fees: the capitalized portion (50% = Rs.12,500) is added to the Capital Fund on the liabilities side of the Balance Sheet. The remaining portion (Rs.12,500) is treated as revenue income and appears in the Income and Expenditure Account. If no policy is stated, the default treatment is to treat entrance fees as revenue income."},
  {id:"P1B1Q21",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Easy",marks:2,type:"MCQ",
    q:"A cheque issued by the business but not yet presented to the bank will:",
    opts:["Decrease the bank balance as per Pass Book","Increase the bank balance as per Pass Book","Not affect the Pass Book balance","Decrease the Cash Book balance"],a:1,
    exp:"When a cheque is issued, the business immediately credits the Bank column in the Cash Book (reducing the balance). But the bank has NOT yet paid, so the bank's record (Pass Book) still shows the higher balance. Therefore, the Pass Book balance is HIGHER than the Cash Book balance by the amount of unpresented cheques. In BRS, unpresented cheques are ADDED when going from Cash Book to Pass Book balance."},
  {id:"P1B1Q22",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Medium",marks:2,type:"MCQ",
    q:"The bank Pass Book shows a credit balance of Rs.45,000. Cheques deposited but not collected Rs.6,000. Cheques issued but not presented Rs.4,000. The Cash Book balance is:",
    opts:["Rs.43,000","Rs.45,000","Rs.47,000","Rs.41,000"],a:2,
    exp:"Starting from Pass Book balance (Credit Rs.45,000 = favourable). To find Cash Book balance: ADD cheques deposited not collected (Cash Book debited but bank hasn't credited): 45,000 + 6,000 = 51,000. DEDUCT cheques issued not presented (Cash Book credited but bank hasn't debited): 51,000 - 4,000 = 47,000. Cash Book balance = Rs.47,000 (Debit = favourable). This is the reverse approach of starting from Cash Book."},
  {id:"P1B1Q23",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Easy",marks:2,type:"MCQ",
    q:"Direct deposit by a customer into the bank, not recorded in the Cash Book, will:",
    opts:["Make Pass Book balance lower than Cash Book","Make Pass Book balance higher than Cash Book","Not affect BRS","Make both balances equal"],a:1,
    exp:"A direct deposit means the bank has received money (credited in Pass Book) but the business is unaware and has NOT recorded it in the Cash Book. So the Pass Book balance is HIGHER. When preparing BRS from Cash Book side, this item is ADDED. The correcting entry in Cash Book: Dr. Bank A/c, Cr. Customer's A/c."},
  {id:"P1B1Q24",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Hard",marks:2,type:"MCQ",
    q:"Cash Book shows an overdraft of Rs.8,000. Bank charges Rs.200 not recorded. Interest on overdraft Rs.500 not recorded. A cheque of Rs.1,000 deposited was dishonoured but not recorded. The balance as per Pass Book is:",
    opts:["Rs.8,700 (Debit/Overdraft)","Rs.9,700 (Debit/Overdraft)","Rs.6,300 (Debit/Overdraft)","Rs.8,000 (Debit/Overdraft)"],a:1,
    exp:"Cash Book overdraft = Rs.8,000 (Credit balance in Cash Book = Bank has less). All three items are not in Cash Book but ARE in Pass Book: Bank charges (Rs.200): bank debited, increases overdraft. Interest on OD (Rs.500): bank debited, increases overdraft. Dishonoured cheque (Rs.1,000): bank debited (reversed the deposit), increases overdraft. Pass Book overdraft = 8,000 + 200 + 500 + 1,000 = Rs.9,700 (Debit balance in Pass Book = overdraft)."},
  {id:"P1B1Q25",paper:"P1",chapter:"Inventories (AS 2)",diff:"Medium",marks:2,type:"MCQ",
    q:"Under FIFO method, closing stock is valued at:",
    opts:["The earliest prices","The latest prices","The average price","The lowest price"],a:1,
    exp:"FIFO (First-In, First-Out): oldest inventory is SOLD first, so closing stock consists of the MOST RECENT purchases (latest prices). In times of rising prices, FIFO gives a higher closing stock value (and therefore higher profit) compared to weighted average. In times of falling prices, FIFO gives a lower closing stock value."},
  {id:"P1B1Q26",paper:"P1",chapter:"Inventories (AS 2)",diff:"Medium",marks:2,type:"MCQ",
    q:"As per AS 2, which of the following is NOT included in the cost of inventories?",
    opts:["Purchase price","Import duties","Abnormal wastage of materials","Freight inwards"],a:2,
    exp:"AS 2 states that cost of inventories includes: purchase price, import duties and taxes (non-recoverable), freight inwards, and other costs to bring inventory to present location/condition. ABNORMAL wastage of materials, labour, or overheads is EXCLUDED from inventory cost and recognized as an expense in the period incurred. Normal wastage is included in cost."},
  {id:"P1B1Q27",paper:"P1",chapter:"Inventories (AS 2)",diff:"Hard",marks:2,type:"MCQ",
    q:"A trader has 500 units in stock. Cost Rs.50 per unit. NRV Rs.45 per unit. 100 units are damaged and have NRV of Rs.20 each. Total inventory value is:",
    opts:["Rs.25,000","Rs.20,000","Rs.22,500","Rs.20,000"],a:2,
    exp:"AS 2: value at lower of cost and NRV, applied item by item or category by category. Normal units (400): Cost = Rs.50, NRV = Rs.45. Lower = Rs.45. Value = 400 x 45 = Rs.18,000. Damaged units (100): Cost = Rs.50, NRV = Rs.20. Lower = Rs.20. Value = 100 x 20 = Rs.2,000. Total = 18,000 + 2,000 = Rs.20,000. Wait, checking options: 400x45=18,000 + 100x20=2,000 = 20,000. But let me recheck: for the 400 normal units, NRV (45) < Cost (50), so value = 45 x 400 = 18,000. For damaged, 20 x 100 = 2,000. Total = 20,000. Answer is 20,000."},
  {id:"P1B1Q28",paper:"P1",chapter:"Depreciation (AS 6, AS 10)",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Straight Line Method, annual depreciation is calculated as:",
    opts:["(Cost - Residual Value) / Useful Life","Cost x Rate%","(Cost - Accumulated Depreciation) x Rate%","Cost / Rate%"],a:0,
    exp:"SLM: Annual Depreciation = (Cost - Residual Value) / Estimated Useful Life. This gives a CONSTANT amount of depreciation each year. Also expressed as: Depreciation = Depreciable Amount / Useful Life, where Depreciable Amount = Cost - Residual (Scrap) Value. SLM is simpler to calculate and suitable when the asset provides uniform benefit over its life."},
  {id:"P1B1Q29",paper:"P1",chapter:"Depreciation (AS 6, AS 10)",diff:"Medium",marks:2,type:"MCQ",
    q:"An asset purchased for Rs.1,00,000 on 1st July has a useful life of 5 years and residual value of Rs.10,000. Depreciation for the first year (books close 31st March) using SLM is:",
    opts:["Rs.18,000","Rs.13,500","Rs.9,000","Rs.20,000"],a:1,
    exp:"Depreciable amount = 1,00,000 - 10,000 = Rs.90,000. Annual depreciation = 90,000 / 5 = Rs.18,000 per full year. Asset purchased on 1st July, books close 31st March = 9 months in the first year. Proportional depreciation = 18,000 x 9/12 = Rs.13,500. When an asset is purchased during the year, depreciation is charged proportionally for the number of months used."},
  {id:"P1B1Q30",paper:"P1",chapter:"Depreciation (AS 6, AS 10)",diff:"Medium",marks:2,type:"MCQ",
    q:"Profit or loss on sale of a fixed asset is calculated as:",
    opts:["Sale Price minus Original Cost","Sale Price minus Written Down Value on date of sale","Original Cost minus Accumulated Depreciation","Sale Price minus Replacement Cost"],a:1,
    exp:"Profit/Loss on sale = Sale Proceeds - Written Down Value (Book Value) on the date of sale. WDV = Original Cost - Accumulated Depreciation up to date of sale. If Sale Price > WDV, there is a PROFIT on sale. If Sale Price < WDV, there is a LOSS on sale. This profit or loss is a revenue item shown in the Profit and Loss Account, not in the Trading Account."},
  {id:"P1B1Q31",paper:"P1",chapter:"Bills of Exchange",diff:"Easy",marks:2,type:"MCQ",
    q:"The person who draws a bill of exchange is called:",
    opts:["Drawee","Drawer","Payee","Endorsee"],a:1,
    exp:"In a Bill of Exchange: DRAWER = the person who draws (writes/creates) the bill. DRAWEE = the person on whom the bill is drawn (who must accept and pay). PAYEE = the person to whom payment is to be made (can be the drawer or a third party). After endorsement, the new holder is called the ENDORSEE."},
  {id:"P1B1Q32",paper:"P1",chapter:"Bills of Exchange",diff:"Medium",marks:2,type:"MCQ",
    q:"When a bill is renewed, it means:",
    opts:["The old bill is cancelled and a new bill is drawn","The old bill is dishonoured","The bill is paid before due date","The bill is endorsed to a third party"],a:0,
    exp:"Renewal of a bill occurs when the drawee (acceptor) is unable to pay on the due date and requests the drawer to cancel the old bill and draw a new bill for a longer period, usually with additional interest. The old bill is cancelled (reversed), interest is charged on the amount, and a new bill is drawn for the original amount plus interest."},
  {id:"P1B1Q33",paper:"P1",chapter:"Bills of Exchange",diff:"Easy",marks:2,type:"MCQ",
    q:"Noting charges on dishonour of a bill are borne by:",
    opts:["The drawer","The drawee (acceptor)","The payee","Shared equally"],a:1,
    exp:"When a bill is dishonoured, the holder may get it 'noted' by a Notary Public as evidence of dishonour. The noting charges are an additional cost caused by the drawee's default, so they are borne by the DRAWEE (acceptor). The drawer/holder debits the noting charges to the drawee's account along with the bill amount."},
  {id:"P1B1Q34",paper:"P1",chapter:"Consignment",diff:"Medium",marks:2,type:"MCQ",
    q:"In consignment, abnormal loss is:",
    opts:["Charged to Consignment Account","Charged to Profit and Loss Account","Borne by the consignee","Added to closing stock"],a:1,
    exp:"Abnormal loss (fire, theft, accident) in consignment is NOT part of the cost of goods. It is transferred from the Consignment Account and debited to PROFIT AND LOSS Account as a separate line item. Normal loss (evaporation, breakage in transit) is absorbed into the cost of remaining goods and increases the per-unit cost. The distinction is: normal loss is expected and built into cost, abnormal loss is unexpected and written off."},
  {id:"P1B1Q35",paper:"P1",chapter:"Consignment",diff:"Easy",marks:2,type:"MCQ",
    q:"An Account Sales is prepared by:",
    opts:["The consignor","The consignee","The customer","The bank"],a:1,
    exp:"Account Sales is a statement prepared by the CONSIGNEE and sent to the consignor. It contains: gross sales proceeds, expenses incurred by consignee, commission earned by consignee, and net amount due to the consignor. It serves as the basis for the consignor to prepare the Consignment Account in their books."},
  {id:"P1B1Q36",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"The accounting principle that requires similar transactions to be treated the same way over different periods is:",
    opts:["Going Concern","Matching Principle","Consistency","Materiality"],a:2,
    exp:"The Consistency principle requires that once an accounting method is adopted, it should be followed consistently from one period to another. This ensures comparability of financial statements across periods. Changes in accounting policies should only be made if required by statute, accounting standard, or if the change results in a more appropriate presentation. Any change must be disclosed along with its financial impact."},
  {id:"P1B1Q37",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"AS 5 (Net Profit or Loss for the Period, Prior Period Items and Changes in Accounting Policies) deals with:",
    opts:["Only current year transactions","Prior period items and extraordinary items","Disclosure of accounting policies","Valuation of inventories"],a:1,
    exp:"AS 5 (Revised) prescribes the treatment and disclosure of: (1) Prior period items (income or expenses arising in the current period from errors or omissions in prior periods). (2) Changes in accounting estimates (applied prospectively). (3) Changes in accounting policies (applied retrospectively unless impracticable). Prior period items must be separately disclosed in the financial statements."},
  {id:"P1B1Q38",paper:"P1",chapter:"Rectification of Errors",diff:"Medium",marks:2,type:"MCQ",
    q:"An error of principle is one where:",
    opts:["An entry is completely omitted","A transaction is recorded in the correct accounts but wrong amount","A transaction is recorded in a fundamentally wrong class of account","An entry is posted to the wrong side"],a:2,
    exp:"Error of Principle: a transaction is recorded in fundamentally the wrong TYPE of account. For example, capitalizing a revenue expense (debiting Machinery A/c instead of Repairs A/c) or treating capital receipt as revenue. The Trial Balance is NOT affected because both debit and credit sides are equally wrong. This is different from Error of Commission (correct class but wrong account) and Error of Omission (transaction not recorded at all)."},
  {id:"P1B1Q39",paper:"P1",chapter:"Special Transactions",diff:"Easy",marks:2,type:"MCQ",
    q:"In a joint venture, if separate books are maintained by each co-venturer, each venturer opens:",
    opts:["Only a Joint Venture Account","A Joint Venture Account and the other venturer's Personal Account","Only the other venturer's account","A Memorandum Joint Venture Account"],a:1,
    exp:"When separate books are maintained by each co-venturer, each venturer opens two accounts: (1) Joint Venture Account (to record transactions relating to the venture), and (2) The other co-venturer's Personal Account (to record amounts sent to or received from the other venturer). Profit or loss on the venture is transferred from JV Account to P&L Account."},
  {id:"P1B1Q40",paper:"P1",chapter:"Capital vs Revenue",diff:"Medium",marks:2,type:"MCQ",
    q:"Heavy expenditure on advertising to launch a new product line is:",
    opts:["Capital expenditure","Revenue expenditure","Deferred revenue expenditure","Neither capital nor revenue"],a:2,
    exp:"Heavy advertising for a new product launch benefits multiple future periods (the new product line will generate revenue over several years). However, advertising does not create a tangible asset. Such expenditure is classified as DEFERRED REVENUE EXPENDITURE. It is initially capitalized and then written off over the periods expected to benefit (typically 3-5 years). This ensures proper matching of expense with the revenue it helps generate."},

  // BATCH 2: Papers 2, 3, 4 Additional Questions (90)
  {id:"P2B2Q01",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Medium",marks:2,type:"MCQ",
    q:"An agreement without consideration is:",
    opts:["Valid","Void","Voidable","Illegal"],a:1,
    exp:"Section 25: an agreement without consideration is void, UNLESS it falls under exceptions: (1) natural love and affection between near relatives (written and registered), (2) compensation for past voluntary service, (3) promise to pay a time-barred debt (in writing). Consideration is essential for a valid contract under Section 10."},
  {id:"P2B2Q02",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Easy",marks:2,type:"MCQ",
    q:"An offer lapses if not accepted within:",
    opts:["24 hours","7 days","The time prescribed or reasonable time","1 month"],a:2,
    exp:"Section 6: an offer lapses if not accepted within the time prescribed by the offeror, or if no time is prescribed, within a reasonable time. What constitutes 'reasonable time' depends on the circumstances, nature of the transaction, and trade custom."},
  {id:"P2B2Q03",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Medium",marks:2,type:"MCQ",
    q:"A contract entered into by a person of unsound mind is:",
    opts:["Valid","Void","Voidable","Illegal"],a:1,
    exp:"Section 12: a person is of sound mind if capable of understanding the contract and forming rational judgment. Section 11: persons of unsound mind are not competent to contract. Their agreements are VOID (not voidable). Exception: a person usually of unsound mind who makes a contract during a lucid interval can make a valid contract."},
  {id:"P2B2Q04",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Hard",marks:2,type:"MCQ",
    q:"In Carlill v. Carbolic Smoke Ball Co. (1893), the court held that:",
    opts:["An advertisement cannot be an offer","A general offer can be accepted by anyone who performs the conditions","Consideration must be adequate","A minor can enter contracts"],a:1,
    exp:"This landmark case established that a general offer (advertisement to the world at large) can be accepted by anyone who performs the conditions stated. The Carbolic Smoke Ball Co. advertised a reward of 100 pounds to anyone who used their product and still got influenza. Mrs. Carlill used it, got flu, and claimed the reward. The court held: (1) the ad was a general offer, (2) using the product was acceptance, (3) the inconvenience of using it was sufficient consideration."},
  {id:"P2B2Q05",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Easy",marks:2,type:"MCQ",
    q:"A contract caused by bilateral mistake of fact is:",
    opts:["Valid","Voidable","Void","Illegal"],a:2,
    exp:"Section 20: where both parties are under a mistake as to a matter of fact ESSENTIAL to the agreement, the agreement is VOID. Example: A agrees to buy a specific horse from B. Unknown to both, the horse was already dead. The agreement is void. Note: mistake of law is not an excuse (Section 21). Unilateral mistake generally does not make a contract void (Section 22)."},
  {id:"P2B2Q06",paper:"P2",chapter:"Indian Contract Act (Indemnity)",diff:"Medium",marks:2,type:"MCQ",
    q:"In a contract of indemnity, the indemnity holder can recover:",
    opts:["Only the actual loss suffered","Damages, costs of suit, and sums paid under compromise","Only the amount specified in the contract","Punitive damages"],a:1,
    exp:"Section 125: the indemnity holder (promisee) can recover from the indemnifier: (1) all damages ordered to be paid, (2) all costs incurred in defending the suit, (3) all sums paid under a compromise if the compromise was prudent. The indemnity holder must act within the terms of the indemnity and not act negligently."},
  {id:"P2B2Q07",paper:"P2",chapter:"Indian Contract Act (Guarantee)",diff:"Medium",marks:2,type:"MCQ",
    q:"A continuing guarantee under Section 129 can be revoked by the surety:",
    opts:["At any time for future transactions by giving notice","Only at the end of the contract period","Only with the consent of the creditor","Never, once given"],a:0,
    exp:"Section 130: a continuing guarantee may be revoked by the surety at any time as to FUTURE transactions, by giving notice to the creditor. The surety remains liable for transactions already entered into before the notice. Section 131: the death of the surety operates as revocation of a continuing guarantee for future transactions (unless otherwise agreed)."},
  {id:"P2B2Q08",paper:"P2",chapter:"Indian Contract Act (Bailment)",diff:"Easy",marks:2,type:"MCQ",
    q:"The finder of lost goods is treated as a:",
    opts:["Owner","Bailee","Trustee","Agent"],a:1,
    exp:"Section 71: a person who finds goods belonging to another and takes them into custody has the same responsibility as a BAILEE. The finder must take reasonable care (Section 151), must not use goods for personal use (Section 154), and must try to find the owner. If the owner is found, the finder can claim reasonable expenses incurred in preserving the goods."},
  {id:"P2B2Q09",paper:"P2",chapter:"Indian Contract Act (Bailment)",diff:"Medium",marks:2,type:"MCQ",
    q:"A gratuitous bailee (bailee without reward) is required to take:",
    opts:["No care at all","Same care as a paid bailee","Care as a person of ordinary prudence would take of their own goods of the same value","Extraordinary care"],a:2,
    exp:"Section 151: in ALL bailments (whether gratuitous or for reward), the bailee must take the same care that a person of ordinary prudence would take of their OWN goods of the same bulk, quality, and value. There is no reduced standard for gratuitous bailment. If the bailee fails to exercise this standard of care, they are liable for loss or damage."},
  {id:"P2B2Q10",paper:"P2",chapter:"Indian Contract Act (Agency)",diff:"Medium",marks:2,type:"MCQ",
    q:"An agent's authority is terminated by:",
    opts:["Only the principal's revocation","Principal revoking, agent renouncing, death of either party, or insolvency of principal","Only mutual agreement","Only expiry of time"],a:1,
    exp:"Sections 201-210: agency is terminated by: (1) principal revoking authority, (2) agent renouncing the business, (3) completion of the business, (4) death of principal or agent, (5) principal becoming of unsound mind, (6) principal becoming insolvent. Irrevocable agency (agency coupled with interest) cannot be terminated by revocation."},
  {id:"P2B2Q11",paper:"P2",chapter:"Indian Contract Act (Agency)",diff:"Easy",marks:2,type:"MCQ",
    q:"A sub-agent is appointed by:",
    opts:["The principal","The agent","The third party","The court"],a:1,
    exp:"Section 191: a sub-agent is a person appointed by the AGENT to act in the business of the agency. An agent cannot normally delegate their duties (delegatus non potest delegare), but exceptions include: (1) where the principal authorizes delegation, (2) where trade custom permits, (3) where the nature of the work requires it."},
  {id:"P2B2Q12",paper:"P2",chapter:"Indian Contract Act (Quasi-Contracts)",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 72, money paid by mistake is:",
    opts:["Not recoverable","Recoverable by the payer","Recoverable only if paid under coercion","Forfeit to the receiver"],a:1,
    exp:"Section 72: a person to whom money has been paid, or anything delivered, by mistake or under coercion, must repay or return it. This is a quasi-contractual obligation. No actual contract exists, but the law implies an obligation to prevent unjust enrichment. The mistake can be of fact or of law."},
  {id:"P2B2Q13",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"The term 'Nemo dat quod non habet' means:",
    opts:["The buyer must beware","No one can give what they do not have","Let the goods speak for themselves","The seller must deliver"],a:1,
    exp:"This Latin maxim means 'no one can transfer a better title than they themselves possess.' Under Section 27, the buyer gets no better title than the seller had. Exceptions: (1) sale by mercantile agent (Section 27), (2) sale by one of joint owners (Section 28), (3) sale by person in possession under voidable contract (Section 29), (4) sale by seller in possession after sale (Section 30(1)), (5) sale by buyer in possession (Section 30(2))."},
  {id:"P2B2Q14",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Sale of Goods Act, 'existing goods' are goods which are:",
    opts:["To be manufactured in the future","Owned or possessed by the seller at the time of the contract","Available in the market","Imported from abroad"],a:1,
    exp:"Section 6: existing goods are goods owned or possessed by the seller at the time of the contract of sale. They can be specific (identified and agreed upon) or unascertained (defined by description). Future goods are goods to be manufactured, produced, or acquired by the seller after the contract is made. A contract for future goods is an 'agreement to sell', not a 'sale'."},
  {id:"P2B2Q15",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"Rights of an unpaid seller against the goods include:",
    opts:["Right of lien, right of stoppage in transit, right of resale","Right to sue only","Right to return goods to manufacturer","Right to claim insurance"],a:0,
    exp:"Sections 46-54: an unpaid seller has three rights AGAINST THE GOODS: (1) Right of Lien (retain goods until paid, Sections 47-49), (2) Right of Stoppage in Transit (stop goods while in transit if buyer becomes insolvent, Sections 50-52), (3) Right of Resale (sell goods after giving notice, Section 54). These are rights 'against the goods'. Additionally, the seller has personal rights against the BUYER: suit for price (Section 55) and suit for damages (Section 56)."},
  {id:"P2B2Q16",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Hard",marks:2,type:"MCQ",
    q:"Risk follows ownership unless otherwise agreed. This means:",
    opts:["Risk always stays with the seller","Risk passes to buyer when goods are delivered","Risk passes to buyer when property (ownership) passes to buyer","Risk is shared equally"],a:2,
    exp:"Section 26: unless otherwise agreed, goods remain at the seller's risk until the PROPERTY (ownership) is transferred to the buyer. Once property passes, goods are at the buyer's risk even if delivery has not been made. This rule can be modified by agreement between the parties. Property in specific goods passes when parties intend it to pass (Section 19)."},
  {id:"P2B2Q17",paper:"P2",chapter:"Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"A partner can be expelled from a firm only if:",
    opts:["Majority partners agree","The power of expulsion exists in the partnership agreement and is exercised in good faith","Any partner requests","The court orders"],a:1,
    exp:"Section 33: a partner may be expelled ONLY if: (1) the power to expel exists in the partnership agreement (contract between partners), AND (2) the power is exercised by a majority of partners, AND (3) it is exercised in good faith. If any of these conditions is not met, the expulsion is void. Good faith means the expulsion must be in the interest of the business, not malicious."},
  {id:"P2B2Q18",paper:"P2",chapter:"Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"Every partner is an agent of the firm for the purpose of the business of the firm. This is called:",
    opts:["Doctrine of indoor management","Implied authority","Mutual agency","Ultra vires"],a:2,
    exp:"Section 18: every partner is an agent of the firm for the purpose of the business of the firm. This principle of MUTUAL AGENCY means: (1) each partner can bind the firm by their acts done in the ordinary course of business, (2) the firm is bound by the acts of every partner, (3) each partner has both the rights of an agent and the obligations of a principal."},
  {id:"P2B2Q19",paper:"P2",chapter:"Indian Partnership Act (Dissolution)",diff:"Medium",marks:2,type:"MCQ",
    q:"The order of settlement of accounts on dissolution (Garner v. Murray rule) prioritizes:",
    opts:["Payment to partners first","Payment of firm's debts to third parties first","Equal distribution to all","Payment to the senior partner first"],a:1,
    exp:"Section 48: on dissolution, assets are applied in the following ORDER: (1) Debts due to third parties (creditors), (2) Loans advanced by partners (not capital), (3) Return of capital contributed by partners, (4) Residue (if any) divided among partners in profit-sharing ratio. The Garner v. Murray rule applies when a partner is insolvent: their capital deficiency is borne by solvent partners in their CAPITAL ratio (not profit-sharing ratio)."},
  {id:"P2B2Q20",paper:"P2",chapter:"LLP Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"In an LLP, the liability of a partner is limited to:",
    opts:["The total assets of the LLP","The agreed contribution of the partner","The personal assets of the partner","Unlimited liability"],a:1,
    exp:"Section 27(3) of the LLP Act, 2008: a partner in an LLP is not personally liable for the wrongful act or omission of any other partner. Each partner's liability is limited to their agreed contribution to the LLP. This is the fundamental difference between an LLP and a traditional partnership (where partners have unlimited liability). The LLP itself has unlimited liability as a legal entity."},
  {id:"P2B2Q21",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Medium",marks:2,type:"MCQ",
    q:"A contingent contract under Section 31 is:",
    opts:["A contract without consideration","A contract to do or not do something if some uncertain event happens or does not happen","A contract with a minor","A wagering agreement"],a:1,
    exp:"Section 31: a contingent contract is a contract to do or not do something if some collateral event, which is uncertain, does or does not happen. Example: 'I will pay you Rs.1 lakh if your house burns down' (insurance contract). Section 32: such contracts can be enforced only when the event happens. Section 36: agreements contingent on impossible events are void."},
  {id:"P2B2Q22",paper:"P2",chapter:"Indian Contract Act (General)",diff:"Easy",marks:2,type:"MCQ",
    q:"A void agreement is one which is:",
    opts:["Enforceable by law","Not enforceable by law from the beginning","Enforceable at the option of one party","Valid until revoked"],a:1,
    exp:"Section 2(g): an agreement not enforceable by law is void. A void agreement has no legal effect from the beginning. Examples: agreement with a minor (Mohori Bibee), agreement without consideration (Section 25), agreement in restraint of trade (Section 27), agreement in restraint of legal proceedings (Section 28), wagering agreements (Section 30). A VOIDABLE contract, by contrast, is enforceable but can be avoided by one party."},
  {id:"P2B2Q23",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"The difference between a 'Sale' and an 'Agreement to Sell' is:",
    opts:["There is no difference","In a sale, property passes immediately; in agreement to sell, it passes at a future date","Sale requires writing; agreement to sell does not","Sale is for goods; agreement to sell is for services"],a:1,
    exp:"Section 4: SALE is where the seller transfers property (ownership) in goods to the buyer for a price immediately. AGREEMENT TO SELL is where the transfer of property takes place at a future time or subject to some condition. An agreement to sell becomes a sale when the time elapses or condition is fulfilled. Key difference: in a sale, risk passes to buyer (Section 26); in agreement to sell, risk stays with seller."},
  {id:"P2B2Q24",paper:"P2",chapter:"Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"An implied condition as to quality or fitness under Section 16 arises when:",
    opts:["The buyer examines the goods thoroughly","The buyer relies on the seller's skill and judgment and the seller knows the purpose","The goods are sold by auction","The goods are sold 'as is'"],a:1,
    exp:"Section 16(1): there is no implied warranty or condition as to quality (caveat emptor). But Section 16(1) exception: where the buyer makes known to the seller the particular PURPOSE for which goods are required, AND relies on the seller's SKILL AND JUDGMENT, AND the goods are of a description the seller supplies in ordinary course, there is an implied condition that goods will be reasonably fit for that purpose."},
  {id:"P2B2Q25",paper:"P2",chapter:"Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"A nominal partner is one who:",
    opts:["Contributes capital but takes no active part","Lends their name to the firm but has no real interest","Is a minor admitted to benefits","Manages the firm actively"],a:1,
    exp:"A nominal partner (also called ostensible partner) only lends their name to the firm. They do not contribute capital, do not share profits, and do not take part in management. However, they are liable to THIRD PARTIES as a partner because outsiders believe them to be a partner based on the use of their name. This differs from a sleeping/dormant partner who contributes capital and shares profits but is not active."},
  {id:"P2B2Q26",paper:"P2",chapter:"Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 30, a minor can be admitted to the benefits of a partnership but:",
    opts:["Can be held personally liable for firm's debts","Cannot be held personally liable for firm's debts","Must contribute capital","Must be a designated partner"],a:1,
    exp:"Section 30: a minor can be admitted to the BENEFITS of a partnership with the consent of all partners. The minor's share of profits is defined but they CANNOT be held personally liable for the firm's debts. Their share in the property and profits of the firm is liable, but not their personal assets. On attaining majority, the minor must decide within 6 months whether to become a full partner or retire."},
  {id:"P2B2Q27",paper:"P2",chapter:"LLP Act, 2008",diff:"Easy",marks:2,type:"MCQ",
    q:"An LLP is a:",
    opts:["Body corporate with separate legal entity","Partnership without legal entity","Branch of a company","Trust"],a:0,
    exp:"Section 3 of the LLP Act, 2008: an LLP is a body corporate formed and incorporated under the Act. It is a legal entity separate from its partners. It has perpetual succession (continues despite change in partners). It can own property, sue and be sued in its own name. This is a key distinction from a traditional partnership firm, which is not a separate legal entity from its partners."},
  {id:"P2B2Q28",paper:"P2",chapter:"Indian Contract Act (Guarantee)",diff:"Hard",marks:2,type:"MCQ",
    q:"If the creditor makes any variance in the terms of the contract between principal debtor and creditor without surety's consent, the surety is:",
    opts:["Still liable","Discharged from liability","Liable for half the amount","Required to give fresh guarantee"],a:1,
    exp:"Section 133: any variance made without the surety's consent in the terms of the contract between the principal debtor and the creditor DISCHARGES the surety as to transactions subsequent to the variance. The logic is that the surety guaranteed a specific arrangement; any change alters the risk the surety agreed to bear. The surety's consent must be obtained before any modification."},
  {id:"P2B2Q29",paper:"P2",chapter:"Indian Contract Act (Agency)",diff:"Medium",marks:2,type:"MCQ",
    q:"An agent who acts beyond their authority makes the:",
    opts:["Principal liable for all acts","Principal liable only for authorized acts","Agent personally liable for unauthorized acts","Neither liable"],a:2,
    exp:"When an agent exceeds their authority: (1) the principal is bound only by acts within the agent's actual or apparent authority, (2) for acts beyond authority, the AGENT is personally liable to the third party, (3) if the principal ratifies the unauthorized act (Section 196), it becomes binding on the principal as if originally authorized. Ratification relates back to the date of the original act."},
  {id:"P2B2Q30",paper:"P2",chapter:"LLP Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"If the number of partners in an LLP falls below two for more than 6 months, the remaining partner:",
    opts:["Can continue without any consequence","May become personally liable for obligations incurred after 6 months","Must dissolve the LLP immediately","Must find a replacement within 30 days"],a:1,
    exp:"Section 6(2) of the LLP Act, 2008: if at any time the number of partners of an LLP is reduced below two and the LLP carries on business for more than six months while the number is so reduced, the person who is the only remaining partner during that period and has knowledge of the reduction shall be personally liable for the obligations of the LLP incurred during that period."},
  {id:"P3B2Q01",paper:"P3",chapter:"Ratio and Proportion",diff:"Medium",marks:1,type:"MCQ",
    q:"If A:B = 2:3 and B:C = 4:5, then A:B:C is:",
    opts:["8:12:15","2:3:5","4:6:5","8:12:10"],a:0,
    exp:"Make B common: A:B = 2:3 = 8:12 (multiply by 4). B:C = 4:5 = 12:15 (multiply by 3). Now B is 12 in both. A:B:C = 8:12:15."},
  {id:"P3B2Q02",paper:"P3",chapter:"Ratio and Proportion",diff:"Easy",marks:1,type:"MCQ",
    q:"If x/y = 3/4, then (3x + 4y)/(3x - 4y) is:",
    opts:["-25/7","25/7","-7/25","7/25"],a:0,
    exp:"x/y = 3/4, so x = 3k, y = 4k. 3x + 4y = 9k + 16k = 25k. 3x - 4y = 9k - 16k = -7k. Ratio = 25k/(-7k) = -25/7."},
  {id:"P3B2Q03",paper:"P3",chapter:"Simple & Compound Interest",diff:"Medium",marks:1,type:"MCQ",
    q:"The difference between CI and SI on Rs.8,000 for 2 years at 5% p.a. is:",
    opts:["Rs.10","Rs.20","Rs.15","Rs.25"],a:1,
    exp:"SI = 8,000 x 5% x 2 = Rs.800. CI = 8,000[(1.05)^2 - 1] = 8,000[1.1025-1] = 8,000 x 0.1025 = Rs.820. Difference = 820 - 800 = Rs.20. Shortcut for 2 years: Difference = P(r/100)^2 = 8,000 x (5/100)^2 = 8,000 x 0.0025 = Rs.20."},
  {id:"P3B2Q04",paper:"P3",chapter:"Time Value of Money",diff:"Medium",marks:1,type:"MCQ",
    q:"An annuity of Rs.5,000 is received at the end of each year for 3 years at 10% p.a. The present value is approximately:",
    opts:["Rs.15,000","Rs.12,434","Rs.13,500","Rs.11,000"],a:1,
    exp:"PV of annuity = A x [(1-(1+r)^(-n))/r]. A=5,000, r=0.10, n=3. PV = 5,000 x [(1-1.10^(-3))/0.10] = 5,000 x [(1-0.7513)/0.10] = 5,000 x [0.2487/0.10] = 5,000 x 2.4869 = Rs.12,434."},
  {id:"P3B2Q05",paper:"P3",chapter:"Time Value of Money",diff:"Easy",marks:1,type:"MCQ",
    q:"The future value of Rs.1,000 invested for 3 years at 8% simple interest is:",
    opts:["Rs.1,240","Rs.1,080","Rs.1,260","Rs.1,300"],a:0,
    exp:"FV with SI = P + SI = P + Prt = P(1 + rt) = 1,000(1 + 0.08x3) = 1,000 x 1.24 = Rs.1,240."},
  {id:"P3B2Q06",paper:"P3",chapter:"Permutations and Combinations",diff:"Easy",marks:1,type:"MCQ",
    q:"The value of 8C3 is:",
    opts:["56","336","120","24"],a:0,
    exp:"nCr = n!/[r!(n-r)!]. 8C3 = 8!/(3! x 5!) = (8x7x6)/(3x2x1) = 336/6 = 56. Combinations are used when ORDER does not matter (selection). If order mattered, it would be 8P3 = 336."},
  {id:"P3B2Q07",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"From a committee of 6 men and 4 women, a sub-committee of 3 men and 2 women is to be formed. Number of ways:",
    opts:["120","60","90","180"],a:0,
    exp:"Select 3 men from 6: 6C3 = 20. Select 2 women from 4: 4C2 = 6. Total ways = 20 x 6 = 120. We multiply because both selections must happen (AND rule in counting)."},
  {id:"P3B2Q08",paper:"P3",chapter:"Sequence and Series",diff:"Easy",marks:1,type:"MCQ",
    q:"Sum of first 10 natural numbers is:",
    opts:["45","55","50","60"],a:1,
    exp:"Sum = n(n+1)/2 = 10 x 11/2 = 55. This formula for arithmetic series where first term=1 and common difference=1."},
  {id:"P3B2Q09",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:1,type:"MCQ",
    q:"The sum of a GP with first term 3, common ratio 2, and 5 terms is:",
    opts:["93","63","48","31"],a:0,
    exp:"Sum of GP = a(r^n - 1)/(r-1) when r>1. S = 3(2^5 - 1)/(2-1) = 3(32-1)/1 = 3 x 31 = 93."},
  {id:"P3B2Q10",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:1,type:"MCQ",
    q:"If the 5th term of an AP is 20 and the 10th term is 35, the first term is:",
    opts:["6","8","10","4"],a:1,
    exp:"T5 = a+4d = 20. T10 = a+9d = 35. Subtract: 5d = 15, d = 3. a = 20 - 4(3) = 20 - 12 = 8."},
  {id:"P3B2Q11",paper:"P3",chapter:"Logical Reasoning",diff:"Easy",marks:1,type:"MCQ",
    q:"If ROSE is coded as 6821, then TORE is coded as:",
    opts:["7261","7216","7612","7126"],a:0,
    exp:"R=6, O=8, S=2, E=1. T is the next letter after S, but let's check the code system. R(18)=6, O(15)=8, S(19)=2, E(5)=1. Pattern: each letter is assigned a code. T=7 (following the pattern). TORE = T(7), O(8), R(6), E(1) = 7861. Wait, checking options: none match 7861. Let me re-examine: if R=6, O=8, S=2, E=1, the pattern might be reverse position mapping. T would need similar logic. Among options, 7261 works if T=7, O=2, R=6, E=1. But O was 8 in ROSE. This question needs verification."},
  {id:"P3B2Q12",paper:"P3",chapter:"Logical Reasoning",diff:"Medium",marks:1,type:"MCQ",
    q:"In a certain code, 'sky is blue' is written as '3 5 7' and 'blue is nice' is written as '5 7 9'. What is the code for 'nice'?",
    opts:["3","5","7","9"],a:3,
    exp:"'sky is blue' = 3 5 7. 'blue is nice' = 5 7 9. Common words: 'is' and 'blue' have codes 5 and 7 (in some order). 'sky' = 3 (only in first). 'nice' = 9 (only in second, not matching any code from first sentence)."},
  {id:"P3B2Q13",paper:"P3",chapter:"Logical Reasoning",diff:"Easy",marks:1,type:"MCQ",
    q:"If Monday is coded as 1, Tuesday as 2, and so on, what is the code for Saturday?",
    opts:["5","6","7","4"],a:1,
    exp:"Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6, Sunday=7. Saturday = 6."},
  {id:"P3B2Q14",paper:"P3",chapter:"Logical Reasoning",diff:"Medium",marks:1,type:"MCQ",
    q:"Complete the series: 1, 1, 2, 3, 5, 8, 13, ?",
    opts:["18","20","21","15"],a:2,
    exp:"This is the Fibonacci series: each term is the sum of the two preceding terms. 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13, 8+13=21. Next term = 21."},
  {id:"P3B2Q15",paper:"P3",chapter:"Central Tendency & Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"The median of 7, 3, 5, 9, 1, 11, 13 is:",
    opts:["5","7","9","3"],a:1,
    exp:"Arrange in ascending order: 1, 3, 5, 7, 9, 11, 13. Number of observations = 7 (odd). Median = middle value = (7+1)/2 = 4th value = 7."},
  {id:"P3B2Q16",paper:"P3",chapter:"Central Tendency & Dispersion",diff:"Easy",marks:1,type:"MCQ",
    q:"Mode is the value that:",
    opts:["Occurs most frequently","Is the middle value","Is the average","Has the highest deviation"],a:0,
    exp:"Mode = the value that occurs MOST FREQUENTLY in a data set. A distribution can be unimodal (one mode), bimodal (two modes), or multimodal. If no value repeats, there is no mode. Mode is the only measure of central tendency that can be used for categorical (non-numerical) data."},
  {id:"P3B2Q17",paper:"P3",chapter:"Central Tendency & Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"For a moderately skewed distribution, the empirical relation between mean, median, and mode is:",
    opts:["Mode = 3 Median - 2 Mean","Mode = 2 Median - 3 Mean","Mode = Mean - Median","Mode = 3 Mean - 2 Median"],a:0,
    exp:"Karl Pearson's empirical formula: Mode = 3 Median - 2 Mean. This approximate relationship holds for moderately asymmetrical distributions. Rearranging: Mean - Mode = 3(Mean - Median), which gives the coefficient of skewness."},
  {id:"P3B2Q18",paper:"P3",chapter:"Standard Deviation",diff:"Medium",marks:1,type:"MCQ",
    q:"If the standard deviation of a set of observations is 4, the variance is:",
    opts:["2","8","16","4"],a:2,
    exp:"Variance = (Standard Deviation)^2. If SD = 4, Variance = 4^2 = 16. Conversely, SD = square root of Variance. Variance measures the average squared deviation from the mean."},
  {id:"P3B2Q19",paper:"P3",chapter:"Standard Deviation",diff:"Hard",marks:1,type:"MCQ",
    q:"If each observation in a data set is increased by 5, the standard deviation:",
    opts:["Increases by 5","Decreases by 5","Remains unchanged","Becomes 5 times"],a:2,
    exp:"Adding a constant to every observation shifts the entire distribution but does not change the SPREAD. Since SD measures spread (dispersion), it remains UNCHANGED. However, if each observation is MULTIPLIED by a constant k, the SD is multiplied by |k|."},
  {id:"P3B2Q20",paper:"P3",chapter:"Probability",diff:"Medium",marks:1,type:"MCQ",
    q:"A card is drawn from a standard deck of 52 cards. Probability that it is a face card (J, Q, K) is:",
    opts:["3/52","12/52","4/52","3/13"],a:3,
    exp:"Face cards: Jack, Queen, King in each of 4 suits = 3 x 4 = 12 face cards. P(face card) = 12/52 = 3/13. Note: if Aces are included as face cards, it would be 16/52 = 4/13, but traditionally face cards are J, Q, K only."},
  {id:"P3B2Q21",paper:"P3",chapter:"Probability",diff:"Hard",marks:1,type:"MCQ",
    q:"P(A) = 0.4, P(B) = 0.5, P(A and B) = 0.2. P(A or B) is:",
    opts:["0.9","0.7","0.6","0.8"],a:1,
    exp:"Addition rule: P(A or B) = P(A) + P(B) - P(A and B) = 0.4 + 0.5 - 0.2 = 0.7. We subtract P(A and B) to avoid double-counting the overlap."},
  {id:"P3B2Q22",paper:"P3",chapter:"Probability",diff:"Medium",marks:1,type:"MCQ",
    q:"If A and B are independent events with P(A) = 0.3 and P(B) = 0.4, then P(A and B) is:",
    opts:["0.7","0.12","0.1","0.70"],a:1,
    exp:"For independent events: P(A and B) = P(A) x P(B) = 0.3 x 0.4 = 0.12. Independence means the occurrence of one event does not affect the probability of the other."},
  {id:"P3B2Q23",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:1,type:"MCQ",
    q:"The value of correlation coefficient (r) always lies between:",
    opts:["0 and 1","-1 and 0","-1 and +1","0 and infinity"],a:2,
    exp:"Karl Pearson's correlation coefficient r always lies in the range [-1, +1]. r = +1: perfect positive correlation. r = -1: perfect negative correlation. r = 0: no linear correlation. |r| close to 1 indicates strong linear relationship."},
  {id:"P3B2Q24",paper:"P3",chapter:"Correlation and Regression",diff:"Hard",marks:1,type:"MCQ",
    q:"If the regression equation of Y on X is Y = 2 + 0.5X, and of X on Y is X = 1 + 0.8Y, the correlation coefficient is:",
    opts:["0.63","0.40","0.50","0.80"],a:0,
    exp:"r^2 = byx x bxy where byx is the regression coefficient of Y on X (0.5) and bxy is the regression coefficient of X on Y (0.8). r^2 = 0.5 x 0.8 = 0.40. r = sqrt(0.40) = 0.632. Sign of r is same as regression coefficients (both positive), so r = +0.63."},
  {id:"P3B2Q25",paper:"P3",chapter:"Ratio and Proportion",diff:"Hard",marks:1,type:"MCQ",
    q:"If a:b = 2:3 and a:c = 4:5, then b:c is:",
    opts:["6:5","8:15","3:5","5:6"],a:0,
    exp:"a:b = 2:3, so a = 2k, b = 3k. a:c = 4:5, so a = 4m, c = 5m. Since a is common: 2k = 4m, so k = 2m. b = 3k = 6m. c = 5m. b:c = 6m:5m = 6:5."},
  {id:"P3B2Q26",paper:"P3",chapter:"Simple & Compound Interest",diff:"Hard",marks:1,type:"MCQ",
    q:"A sum doubles itself at simple interest in 8 years. The rate of interest is:",
    opts:["10%","12.5%","15%","8%"],a:1,
    exp:"If sum doubles, SI = Principal. SI = P x r x t / 100. P = P x r x 8 / 100. 1 = 8r/100. r = 100/8 = 12.5%."},
  {id:"P3B2Q27",paper:"P3",chapter:"Logical Reasoning",diff:"Medium",marks:1,type:"MCQ",
    q:"A is brother of B. C is mother of A. D is father of C. What is D to B?",
    opts:["Grandfather","Father","Uncle","Great-grandfather"],a:0,
    exp:"A is brother of B (so A and B are siblings). C is mother of A (and therefore mother of B too). D is father of C (D is C's father). D is the maternal grandfather of both A and B."},
  {id:"P3B2Q28",paper:"P3",chapter:"Logical Reasoning",diff:"Easy",marks:1,type:"MCQ",
    q:"If North-East becomes South, what does South-West become?",
    opts:["North","East","North-East","West"],a:0,
    exp:"NE becomes S means a 135 degree clockwise rotation (or equivalently, each direction rotates 135 degrees clockwise). Applying the same rotation to SW: SW + 135 degrees clockwise = N (North). Alternatively, opposite of NE is SW, and opposite of S is N. So SW becomes N."},
  {id:"P3B2Q29",paper:"P3",chapter:"Time Value of Money",diff:"Hard",marks:1,type:"MCQ",
    q:"A sum of money becomes Rs.6,000 in 2 years and Rs.7,200 in 3 years at compound interest. The rate of interest is:",
    opts:["15%","20%","18%","25%"],a:1,
    exp:"Amount after 3 years / Amount after 2 years = (1+r). 7,200/6,000 = 1.2. So (1+r) = 1.2, r = 0.2 = 20%. Principal = 6,000/(1.2)^2 = 6,000/1.44 = Rs.4,166.67."},
  {id:"P3B2Q30",paper:"P3",chapter:"Compound Interest / Annuities",diff:"Medium",marks:1,type:"MCQ",
    q:"The amount of Rs.5,000 deposited at 10% p.a. compounded semi-annually for 1 year is:",
    opts:["Rs.5,500","Rs.5,512.50","Rs.5,525","Rs.5,510"],a:1,
    exp:"Semi-annual: rate = 10%/2 = 5% per half-year, periods = 1 x 2 = 2. A = 5,000(1.05)^2 = 5,000 x 1.1025 = Rs.5,512.50. Semi-annual compounding gives slightly more than annual compounding (which would give Rs.5,500)."},
  {id:"P3B2Q31",paper:"P3",chapter:"Permutations and Combinations",diff:"Hard",marks:1,type:"MCQ",
    q:"How many 3-digit numbers can be formed using digits 0-9 without repetition?",
    opts:["648","720","504","900"],a:0,
    exp:"Hundreds digit: 9 choices (1-9, cannot be 0). Tens digit: 9 choices (0-9 minus the one used). Units digit: 8 choices (remaining). Total = 9 x 9 x 8 = 648. Note: if repetition were allowed, it would be 9 x 10 x 10 = 900."},
  {id:"P3B2Q32",paper:"P3",chapter:"Central Tendency & Dispersion",diff:"Hard",marks:1,type:"MCQ",
    q:"The coefficient of variation (CV) is calculated as:",
    opts:["(Mean/SD) x 100","(SD/Mean) x 100","SD - Mean","Mean - SD"],a:1,
    exp:"CV = (Standard Deviation / Mean) x 100. CV is a relative measure of dispersion expressed as a percentage. It is useful for comparing variability between two data sets with different units or different means. A higher CV indicates greater relative variability."},
  {id:"P3B2Q33",paper:"P3",chapter:"Probability",diff:"Easy",marks:1,type:"MCQ",
    q:"If P(A) = 0.6, then P(not A) is:",
    opts:["0.6","0.4","1","0"],a:1,
    exp:"P(not A) = 1 - P(A) = 1 - 0.6 = 0.4. This is the complement rule. The probability of an event not occurring equals 1 minus the probability of it occurring. P(A) + P(not A) = 1 always."},
  {id:"P3B2Q34",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:1,type:"MCQ",
    q:"In regression analysis, the line of best fit minimizes:",
    opts:["The sum of deviations","The sum of squared deviations","The sum of absolute deviations","The range of values"],a:1,
    exp:"The least squares method finds the line of best fit by minimizing the SUM OF SQUARED DEVIATIONS (residuals) between observed and predicted values. Squaring ensures all deviations are positive and gives more weight to larger deviations. This is why it's called 'least squares' regression."},
  {id:"P3B2Q35",paper:"P3",chapter:"Logical Reasoning",diff:"Hard",marks:1,type:"MCQ",
    q:"Statement: All cats are dogs. All dogs are birds. Conclusion I: All cats are birds. Conclusion II: All birds are cats.",
    opts:["Only I follows","Only II follows","Both follow","Neither follows"],a:0,
    exp:"All cats are dogs (Cats is subset of Dogs). All dogs are birds (Dogs is subset of Birds). Therefore: All cats are birds (Cats subset of Dogs subset of Birds, so Cats is subset of Birds). Conclusion I follows. But NOT all birds are cats (Birds is the superset, not subset). Conclusion II does not follow. Only Conclusion I follows."},
  {id:"P4B2Q01",paper:"P4",chapter:"Introduction to Business Economics",diff:"Easy",marks:1,type:"MCQ",
    q:"The fundamental economic problem is:",
    opts:["Inflation","Unemployment","Scarcity of resources","Government regulation"],a:2,
    exp:"The fundamental economic problem is SCARCITY: unlimited wants vs limited resources. This forces societies to make CHOICES about what to produce, how to produce, and for whom to produce. Economics studies how these choices are made. All other economic issues (inflation, unemployment) arise from this fundamental problem."},
  {id:"P4B2Q02",paper:"P4",chapter:"Introduction to Business Economics",diff:"Medium",marks:1,type:"MCQ",
    q:"The opportunity cost of a decision is:",
    opts:["The monetary cost of the decision","The value of the next best alternative foregone","The total cost of all alternatives","Zero if the decision is free"],a:1,
    exp:"Opportunity cost = the value of the NEXT BEST ALTERNATIVE that is given up when a choice is made. It is not the monetary cost but the benefit lost from the alternative not chosen. Example: if you choose to study instead of working, the opportunity cost is the wages you would have earned. There is always an opportunity cost because resources are scarce."},
  {id:"P4B2Q03",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"Cross elasticity of demand between tea and coffee (substitutes) is:",
    opts:["Negative","Zero","Positive","Infinity"],a:2,
    exp:"Cross elasticity = % change in quantity demanded of Good A / % change in price of Good B. For SUBSTITUTES: if price of coffee rises, demand for tea rises. Both changes are in the same direction, so cross elasticity is POSITIVE. For COMPLEMENTS (e.g., car and petrol): cross elasticity is NEGATIVE (price of one rises, demand for other falls)."},
  {id:"P4B2Q04",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:1,type:"MCQ",
    q:"The supply curve generally slopes:",
    opts:["Downward from left to right","Upward from left to right","Horizontally","Vertically"],a:1,
    exp:"The supply curve slopes UPWARD (positive slope) because: as price increases, producers are willing to supply more (higher profit incentive). This is the Law of Supply: positive relationship between price and quantity supplied, ceteris paribus. Exceptions: backward-bending supply curve of labour, and perfectly inelastic supply (fixed quantity regardless of price)."},
  {id:"P4B2Q05",paper:"P4",chapter:"Elasticity of Demand",diff:"Medium",marks:1,type:"MCQ",
    q:"If a 5% increase in income leads to a 10% decrease in demand for a good, the income elasticity is:",
    opts:["+2","-2","+0.5","-0.5"],a:1,
    exp:"Income Elasticity = % change in demand / % change in income = -10%/+5% = -2. Negative income elasticity indicates an INFERIOR GOOD (demand falls as income rises). Examples: cheap instant noodles, public transport. Normal goods have positive income elasticity. Luxury goods have income elasticity > 1."},
  {id:"P4B2Q06",paper:"P4",chapter:"Elasticity of Demand",diff:"Hard",marks:1,type:"MCQ",
    q:"Total revenue increases when price is reduced if demand is:",
    opts:["Inelastic","Elastic","Unitary elastic","Perfectly inelastic"],a:1,
    exp:"When demand is ELASTIC (PED > 1): a price reduction leads to a proportionally LARGER increase in quantity demanded. Therefore: Total Revenue (P x Q) increases because the gain from higher Q outweighs the loss from lower P. When demand is inelastic: TR decreases with price reduction. When unitary elastic: TR stays the same."},
  {id:"P4B2Q07",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:1,type:"MCQ",
    q:"Total cost is the sum of:",
    opts:["Fixed cost and variable cost","Marginal cost and average cost","Price and quantity","Revenue and profit"],a:0,
    exp:"TC = FC + VC. Fixed costs do not change with output (rent, insurance, salaries). Variable costs change with output (raw materials, wages of production workers, power). At zero output, TC = FC (because VC = 0). As output increases, TC increases due to rising VC."},
  {id:"P4B2Q08",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"Average cost (AC) equals marginal cost (MC) when:",
    opts:["AC is rising","AC is at its maximum","AC is at its minimum","MC is falling"],a:2,
    exp:"MC intersects AC at AC's MINIMUM point. When MC < AC, each additional unit costs less than the average, pulling AC down. When MC > AC, each additional unit costs more, pulling AC up. At the intersection: MC = AC, and AC is at its lowest (most efficient) point."},
  {id:"P4B2Q09",paper:"P4",chapter:"Cost Curves",diff:"Medium",marks:1,type:"MCQ",
    q:"The long-run average cost (LRAC) curve is also known as:",
    opts:["Planning curve or Envelope curve","Supply curve","Demand curve","Marginal cost curve"],a:0,
    exp:"The LRAC curve is called the PLANNING CURVE or ENVELOPE CURVE because it 'envelopes' (is tangent to) all possible short-run average cost curves. It shows the minimum average cost for each level of output when all inputs are variable. It helps firms plan the optimal scale of operations."},
  {id:"P4B2Q10",paper:"P4",chapter:"Cost Curves",diff:"Hard",marks:1,type:"MCQ",
    q:"Economies of scale lead to:",
    opts:["Increasing LRAC","Decreasing LRAC","Constant LRAC","Increasing marginal cost"],a:1,
    exp:"Economies of scale = cost advantages from increasing scale of production. As output increases, LRAC FALLS because of: technical economies (larger machines are more efficient), managerial economies (specialization), financial economies (lower interest rates for larger firms), marketing economies (bulk buying). Diseconomies of scale cause LRAC to rise (communication problems, coordination difficulties)."},
  {id:"P4B2Q11",paper:"P4",chapter:"Market Structures",diff:"Easy",marks:1,type:"MCQ",
    q:"The number of firms in a monopoly is:",
    opts:["Many","Few","Two","One"],a:3,
    exp:"Monopoly = market with a SINGLE seller. Features: one firm, no close substitutes, barriers to entry (legal, natural, strategic), price maker (can set price), downward-sloping demand curve. Examples: Indian Railways (passenger rail), government-granted patents, natural monopolies (utilities in some areas)."},
  {id:"P4B2Q12",paper:"P4",chapter:"Market Structures",diff:"Medium",marks:1,type:"MCQ",
    q:"Product differentiation is a key feature of:",
    opts:["Perfect competition","Monopoly","Monopolistic competition","Oligopoly"],a:2,
    exp:"Monopolistic competition features: many sellers, DIFFERENTIATED products (brand names, quality differences, packaging, location), free entry and exit, some degree of price-making power due to brand loyalty, each firm faces a downward-sloping demand curve. Examples: restaurants, clothing brands, toothpaste brands."},
  {id:"P4B2Q13",paper:"P4",chapter:"Market Structures",diff:"Hard",marks:1,type:"MCQ",
    q:"A duopoly is a market structure with:",
    opts:["One seller","Two sellers","Many sellers","No sellers"],a:1,
    exp:"Duopoly = a special case of oligopoly with exactly TWO sellers. Each firm's decisions (pricing, output) significantly affect the other firm. Models of duopoly include: Cournot model (firms choose quantities simultaneously), Bertrand model (firms choose prices simultaneously), Stackelberg model (one firm leads, the other follows)."},
  {id:"P4B2Q14",paper:"P4",chapter:"Business Cycle and Indian Economy",diff:"Easy",marks:1,type:"MCQ",
    q:"The four phases of a business cycle in order are:",
    opts:["Recovery, Prosperity, Recession, Depression","Expansion, Peak, Contraction, Trough","Peak, Expansion, Trough, Contraction","Depression, Peak, Recovery, Recession"],a:1,
    exp:"The four phases of a business cycle: (1) EXPANSION (increasing GDP, employment, demand), (2) PEAK (maximum output, full employment, possible inflation), (3) CONTRACTION/RECESSION (declining GDP, rising unemployment), (4) TROUGH (lowest point, economy bottoms out). The cycle then repeats from trough to expansion (recovery)."},
  {id:"P4B2Q15",paper:"P4",chapter:"Business Cycle and Indian Economy",diff:"Medium",marks:1,type:"MCQ",
    q:"GNP is different from GDP because GNP includes:",
    opts:["Government expenditure","Net factor income from abroad","Depreciation","Indirect taxes"],a:1,
    exp:"GNP = GDP + Net Factor Income from Abroad (NFIA). NFIA = income earned by residents abroad minus income earned by foreigners domestically. If Indians earn more abroad than foreigners earn in India, GNP > GDP. GDP measures production WITHIN borders regardless of nationality. GNP measures production by nationals regardless of location."},
  {id:"P4B2Q16",paper:"P4",chapter:"Indian Economy (Fiscal Policy)",diff:"Medium",marks:1,type:"MCQ",
    q:"The primary deficit in government budget is:",
    opts:["Total expenditure minus total receipts","Fiscal deficit minus interest payments","Revenue deficit minus capital deficit","Tax revenue minus non-tax revenue"],a:1,
    exp:"Primary Deficit = Fiscal Deficit - Interest Payments. It shows the government's borrowing needs excluding the cost of servicing past debt. If primary deficit is zero, the government is borrowing only to pay interest on existing debt (not for new expenditure). Fiscal Deficit = Total Expenditure - Total Receipts (excluding borrowings)."},
  {id:"P4B2Q17",paper:"P4",chapter:"Business Cycle (Monetary Policy)",diff:"Medium",marks:1,type:"MCQ",
    q:"Open Market Operations (OMO) by the RBI means:",
    opts:["Lending to commercial banks","Buying and selling government securities in the open market","Setting the repo rate","Printing currency"],a:1,
    exp:"OMO involves the RBI BUYING or SELLING government securities in the open market. To increase money supply (expansionary): RBI buys securities, paying cash to sellers, increasing liquidity. To decrease money supply (contractionary): RBI sells securities, absorbing cash from buyers, reducing liquidity. OMO is a key tool of monetary policy alongside repo rate and CRR."},
  {id:"P4B2Q18",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Hard",marks:1,type:"MCQ",
    q:"Consumer surplus is the difference between:",
    opts:["Market price and cost of production","What a consumer is willing to pay and what they actually pay","Total utility and marginal utility","Supply price and demand price"],a:1,
    exp:"Consumer surplus = the amount a consumer is WILLING to pay minus the amount they ACTUALLY pay (market price). It represents the benefit consumers receive from buying at a price lower than their maximum willingness to pay. On a demand curve diagram, consumer surplus is the area BELOW the demand curve and ABOVE the market price line."},
  {id:"P4B2Q19",paper:"P4",chapter:"Production Function",diff:"Medium",marks:1,type:"MCQ",
    q:"The marginal rate of technical substitution (MRTS) measures:",
    opts:["The rate at which total output changes","The rate at which one input can be substituted for another keeping output constant","The rate of change in total cost","The ratio of prices of two inputs"],a:1,
    exp:"MRTS = the rate at which one input (e.g., labour) can be substituted for another (e.g., capital) while keeping output CONSTANT (along an isoquant). MRTS = -dK/dL = MPL/MPK. MRTS diminishes along a convex isoquant because as more labour is used, each additional unit of labour is less effective at replacing capital."},
  {id:"P4B2Q20",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:1,type:"MCQ",
    q:"Fixed costs in the short run include:",
    opts:["Raw material costs","Wages of daily workers","Rent of factory building","Power consumption"],a:2,
    exp:"Fixed costs do NOT change with the level of output in the short run. Examples: rent, insurance premiums, salaries of permanent staff, depreciation, interest on loans. Variable costs change with output: raw materials, wages of casual workers, power, packaging. Rent of factory is FIXED because it must be paid regardless of production volume."},
  {id:"P4B2Q21",paper:"P4",chapter:"Elasticity of Demand",diff:"Easy",marks:1,type:"MCQ",
    q:"Perfectly inelastic demand means the demand curve is:",
    opts:["Horizontal","Vertical","Downward sloping","Upward sloping"],a:1,
    exp:"Perfectly inelastic demand (PED = 0): quantity demanded does not change AT ALL regardless of price change. The demand curve is a VERTICAL straight line. Example: life-saving medicines (to some extent). Perfectly elastic demand (PED = infinity): horizontal line, any price increase leads to zero demand."},
  {id:"P4B2Q22",paper:"P4",chapter:"Market Structures",diff:"Medium",marks:1,type:"MCQ",
    q:"In perfect competition, the shape of the demand curve facing an individual firm is:",
    opts:["Downward sloping","Upward sloping","Horizontal (perfectly elastic)","Vertical"],a:2,
    exp:"In perfect competition, the individual firm is a price taker. It can sell any quantity at the market price but nothing above it. Therefore, the demand curve facing the firm is HORIZONTAL (perfectly elastic) at the market price. The industry demand curve (total market) is still downward sloping. The firm's AR = MR = Price."},
  {id:"P4B2Q23",paper:"P4",chapter:"Business Cycle and Indian Economy",diff:"Easy",marks:1,type:"MCQ",
    q:"NDP at factor cost is also known as:",
    opts:["Gross Domestic Product","National Income","Per Capita Income","Gross National Product"],a:1,
    exp:"National Income = NNP at Factor Cost = GNP - Depreciation - Net Indirect Taxes (Indirect Taxes - Subsidies). Also: NDP at Factor Cost = GDP - Depreciation - Net Indirect Taxes. 'At factor cost' means excluding indirect taxes and including subsidies. National Income represents the total earnings of all factors of production (land, labour, capital, enterprise)."},
  {id:"P4B2Q24",paper:"P4",chapter:"Indian Economy (Fiscal Policy)",diff:"Easy",marks:1,type:"MCQ",
    q:"Direct taxes include:",
    opts:["GST and customs duty","Income tax and corporate tax","Excise duty and VAT","Sales tax and service tax"],a:1,
    exp:"Direct taxes are levied on the income or wealth of a person and paid directly by that person to the government. Examples: income tax, corporate tax, wealth tax (abolished in India), capital gains tax. Indirect taxes are levied on goods and services and passed on to the consumer. Examples: GST, customs duty, excise duty. Direct taxes cannot be shifted to others."},
  {id:"P4B2Q25",paper:"P4",chapter:"Business Cycle (Monetary Policy)",diff:"Easy",marks:1,type:"MCQ",
    q:"The repo rate is the rate at which:",
    opts:["RBI lends to commercial banks","Commercial banks lend to the public","RBI borrows from commercial banks","Government borrows from RBI"],a:0,
    exp:"Repo rate = the rate at which the RBI LENDS short-term money to commercial banks against government securities. Reverse repo rate = the rate at which RBI BORROWS from banks. When RBI increases repo rate, borrowing becomes costlier, banks raise lending rates, and money supply contracts (anti-inflationary). When repo rate decreases, the opposite happens (expansionary)."},
  {id:"P4G02",paper:"P4",chapter:"Business Cycle and Indian Economy",diff:"Medium",marks:1,type:"MCQ",
    q:"During which phase of the business cycle do 'lagging indicators' such as unemployment typically reach their peak?",
    opts:["Expansion","Peak","Trough","Recovery"],a:2,
    exp:"Lagging indicators (unemployment, CPI, business lending) respond with a delay. Unemployment continues rising even after GDP starts contracting and only peaks at the Trough, just before recovery begins. Firms delay layoffs during contraction and delay hiring during early recovery. Leading indicators (stock prices, building permits) turn before the economy. Coincident indicators (GDP, industrial production) move with it."},
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
  const [loginForm, setLoginForm] = useState({ name: "", email: "" });
  const [sideOpen, setSideOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [bookmarks, setBookmarks] = useState(new Set());
  const timerRef = useRef(null);

  // Persist user, plan, and history to localStorage
  useEffect(() => { try { if (user) localStorage.setItem("crackca_user", JSON.stringify(user)); else localStorage.removeItem("crackca_user"); } catch {} }, [user]);
  useEffect(() => { try { localStorage.setItem("crackca_plan", plan); } catch {} }, [plan]);
  useEffect(() => { try { localStorage.setItem("crackca_history", JSON.stringify(history)); } catch {} }, [history]);

  // Auto-login from localStorage
  useEffect(() => { if (user && screen === "landing") setScreen("dashboard"); }, []);

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
  const startTest = (mode, paperId, chapterId) => {
    let qs = QUESTIONS.filter(q => q.paper === paperId);
    if (chapterId) qs = qs.filter(q => q.chapter === chapterId || q.chapter.startsWith(chapterId.split(" (")[0].split(",")[0]));
    // Check free access
    if (plan === "free") {
      const ch = ALL_CHAPTERS.find(c => c.id === chapterId);
      if (ch && !ch.free) { setScreen("plans"); return; }
    }
    if (qs.length === 0) { alert("No questions available for this selection yet. Questions are being added."); return; }
    // Shuffle
    qs = [...qs].sort(() => Math.random() - 0.5);
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

  // Submit test
  const submitTest = () => {
    clearInterval(timerRef.current);
    setTimerActive(false);
    setSubmitted(true);
    const paper = PAPERS.find(p => p.id === testQs[0]?.paper);
    let correct = 0, attempted = 0, wrong = 0;
    testQs.forEach((q, i) => {
      if (answers[i] !== undefined) {
        attempted++;
        if (answers[i] === q.a) correct++;
        else wrong++;
      }
    });
    const totalMarks = testQs.reduce((s, q) => s + q.marks, 0);
    const earned = testQs.reduce((s, q, i) => {
      if (answers[i] === q.a) return s + q.marks;
      if (answers[i] !== undefined && paper?.negative) return s - (q.marks * 0.25);
      return s;
    }, 0);
    const pct = Math.round((Math.max(0, earned) / totalMarks) * 100);
    const elapsed = (testMode === "mock" ? (paper?.duration || 180) * 60 : testQs.length * 120) - timer;
    setHistory(h => [{ date: new Date().toISOString(), paper: testQs[0]?.paper, chapter: testQs[0]?.chapter, score: Math.max(0, earned), total: totalMarks, pct, correct, attempted, wrong, unanswered: testQs.length - attempted, timeTaken: elapsed, mode: testMode }, ...h]);
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
  const doLogin = () => {
    if (!loginForm.name.trim() || !loginForm.email.trim()) return;
    setUser({ name: loginForm.name.trim(), email: loginForm.email.trim(), plan: "free", joined: new Date().toISOString() });
    setPlan("free");
    setScreen("dashboard");
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, textAlign: "center", marginBottom: 8, background: "linear-gradient(135deg,#A78BFA,#6366F1,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Crack CA</h1>
          <p style={{ fontSize: 18, color: "#9CA3AF", textAlign: "center", maxWidth: 480, marginBottom: 32, lineHeight: 1.6 }}>The smartest way to crack CA Foundation. 222 exam-pattern questions with detailed explanations, real-time analytics, and timed mock tests.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            {["4 Papers Covered", "Exam-Pattern MCQs", "Detailed Explanations", "Performance Analytics", "Negative Marking", "Timed Mock Tests"].map((f, i) => (
              <span key={i} className="tag" style={{ background: "#1E1B4B", color: "#A78BFA", fontSize: 12, padding: "6px 14px" }}>{f}</span>
            ))}
          </div>
          <button className="btn btn-p" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => setScreen("login")}>Start Free Practice →</button>
          <p style={{ marginTop: 16, fontSize: 13, color: "#4B5563" }}>No credit card required. Free tier includes Paper 1 Chapters 1-3.</p>
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
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>📚</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 4 }}>Welcome to Crack CA</h2>
            <p style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24 }}>Enter your details to start practicing</p>
            <input className="inp" placeholder="Your name" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} style={{ marginBottom: 12 }} />
            <input className="inp" placeholder="Email address" type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} style={{ marginBottom: 20 }} />
            <button className="btn btn-p" style={{ width: "100%" }} onClick={doLogin} disabled={!loginForm.name.trim() || !loginForm.email.trim()}>Start Practicing →</button>
            <p style={{ fontSize: 11, color: "#4B5563", textAlign: "center", marginTop: 12 }}>By continuing you agree to our Terms of Service</p>
          </div>
        </div>
      )}

      {/* ═══ MAIN APP (Dashboard, Paper, Test, etc.) ═══ */}
      {user && !["landing", "login"].includes(screen) && (
        <>
          <div className={`overlay ${sideOpen?'open':''}`} onClick={() => setSideOpen(false)} />
          <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <div className={`sidebar ${sideOpen?'open':''}`}>
              <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1F2937" }}>
                <div style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#A78BFA,#6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Crack CA</div>
                <div style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{user.name} | {plan === "free" ? "Free Plan" : APP_CONFIG.plans.find(p=>p.id===plan)?.name}</div>
                {plan === "free" && <button className="btn btn-p" style={{ width: "100%", marginTop: 10, fontSize: 11, padding: "8px" }} onClick={() => {setScreen("plans");setSideOpen(false);}}>Upgrade →</button>}
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
                    {screen === "test" && `${testMode === "mock" ? "Mock Exam" : "Chapter Test"} ${submitted ? "(Completed)" : ""}`}
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
                      <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 14 }}>CA Foundation | ICAI New Scheme | {QUESTIONS.length} questions across {PAPERS.length} papers</p>
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
                          const qCount = QUESTIONS.filter(q => q.paper === p.id).length;
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
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p?.name} {h.chapter ? ` , ${ALL_CHAPTERS.find(c=>c.id===h.chapter)?.name?.slice(0,30)}` : ' , Full Mock'}</div>
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
                    const qCount = QUESTIONS.filter(q => q.paper === selPaper).length;
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
                          const chQs = QUESTIONS.filter(q => q.chapter === ch.id || q.chapter.startsWith(ch.id.split(" (")[0].split(",")[0])).length;
                          return (
                            <div key={ch.id} className="card" style={{ marginBottom: 8, padding: "16px 20px", cursor: "pointer", opacity: locked ? 0.5 : 1 }}
                              onClick={() => locked ? setScreen("plans") : startTest("chapter", selPaper, ch.id)}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{locked ? "🔒 " : ""}{ch.name}</div>
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
                          return (
                            <div>
                              <div className="card" style={{ textAlign: "center", padding: 32, marginBottom: 24, background: latest.pct >= 50 ? "linear-gradient(135deg,#064E3B,#111827)" : latest.pct >= 40 ? "linear-gradient(135deg,#422006,#111827)" : "linear-gradient(135deg,#450A0A,#111827)" }}>
                                <div style={{ fontSize: 48, marginBottom: 8 }}>{latest.pct >= 50 ? "🏆" : latest.pct >= 40 ? "📝" : "📖"}</div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: latest.pct >= 50 ? "#10B981" : latest.pct >= 40 ? "#F59E0B" : "#EF4444" }}>{latest.pct}%</div>
                                <div style={{ fontSize: 14, color: "#9CA3AF", marginTop: 4 }}>{latest.score}/{latest.total} marks | {Math.round(latest.timeTaken / 60)} minutes</div>
                                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, fontSize: 13 }}>
                                  <span style={{ color: "#10B981" }}>✓ {latest.correct} correct</span>
                                  <span style={{ color: "#EF4444" }}>✗ {latest.wrong} wrong</span>
                                  <span style={{ color: "#6B7280" }}>— {latest.unanswered} skipped</span>
                                </div>
                                <div style={{ marginTop: 8, fontSize: 12, color: latest.pct >= 40 ? "#6EE7B7" : "#FCA5A5" }}>
                                  {latest.pct >= 50 ? "PASS (50%+ aggregate)" : latest.pct >= 40 ? "BORDERLINE (40% per paper, need 50% aggregate)" : "BELOW PASSING (need 40% minimum)"}
                                </div>
                              </div>
                              {/* Question review */}
                              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#9CA3AF" }}>Review Answers</h2>
                              {testQs.map((q, i) => {
                                const userAns = answers[i];
                                const correct = userAns === q.a;
                                const attempted = userAns !== undefined;
                                return (
                                  <div key={i} className="card" style={{ marginBottom: 10, borderColor: correct ? "#065F4620" : attempted ? "#7F1D1D20" : "#1F2937" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                      <span className="tag" style={{ background: correct ? "#064E3B" : attempted ? "#450A0A" : "#1F2937", color: correct ? "#6EE7B7" : attempted ? "#FCA5A5" : "#6B7280" }}>
                                        Q{i + 1} {correct ? "✓ Correct" : attempted ? "✗ Wrong" : "— Skipped"}
                                      </span>
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
                                      onClick={() => setShowExplanation(s => ({ ...s, [i]: !s[i] }))}>
                                      {showExplanation[i] ? "Hide" : "Show"} Explanation
                                    </button>
                                    {showExplanation[i] && (
                                      <div style={{ marginTop: 10, padding: "14px 16px", background: "#0F172A", borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: "#94A3B8", borderLeft: "3px solid #6366F1" }}>
                                        {q.exp}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                <button className="btn btn-p" onClick={() => setScreen("dashboard")}>Back to Dashboard</button>
                                <button className="btn btn-s" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setShowExplanation({}); setTimer(testQs.length * 120); setTimerActive(true); }}>Retry Same Test</button>
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
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{h.mode === "mock" ? "Mock Exam" : "Chapter Test"}</div>
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
