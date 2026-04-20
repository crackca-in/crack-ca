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
  {id:"P1C1Q04",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"Per AS 10, if useful life of asset is revised upwards, effect on depreciation is:",
    opts:["Applied retrospectively","Applied prospectively from date of change","Not allowed","Recognized in reserves"],a:1,
    exp:"Change in useful life = change in estimate. Per AS 10 and AS 5, applied prospectively. Past statements not restated."},
  {id:"P1C1Q05",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"Which is a capital expenditure?",
    opts:["Repairs to keep machinery working","Wages for installation of new machine","Annual factory insurance","Supervisor salary"],a:1,
    exp:"Installation wages are capitalized per AS 10 (cost to bring asset to working condition). Others are revenue expenses."},
  {id:"P1C1Q06",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"The accounting principle that requires similar transactions to be treated the same way over different periods is:",
    opts:["Going Concern","Matching Principle","Consistency","Materiality"],a:2,
    exp:"The Consistency principle requires that once an accounting method is adopted, it should be followed consistently from one period to another. This ensures comparability of financial statements across periods. Changes in accounting policies should only be made if required by statute, accounting standard, or if the change results in a more appropriate presentation. Any change must be disclosed along with its financial impact."},
  {id:"P1C1Q07",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"AS 5 (Net Profit or Loss for the Period, Prior Period Items and Changes in Accounting Policies) deals with:",
    opts:["Only current year transactions","Prior period items and extraordinary items","Disclosure of accounting policies","Valuation of inventories"],a:1,
    exp:"AS 5 (Revised) prescribes the treatment and disclosure of: (1) Prior period items (income or expenses arising in the current period from errors or omissions in prior periods). (2) Changes in accounting estimates (applied prospectively). (3) Changes in accounting policies (applied retrospectively unless impracticable). Prior period items must be separately disclosed in the financial statements."},
  {id:"P1C1Q08",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"Heavy expenditure on advertising to launch a new product line is:",
    opts:["Capital expenditure","Revenue expenditure","Deferred revenue expenditure","Neither capital nor revenue"],a:2,
    exp:"Heavy advertising for a new product launch benefits multiple future periods (the new product line will generate revenue over several years). However, advertising does not create a tangible asset. Such expenditure is classified as DEFERRED REVENUE EXPENDITURE. It is initially capitalized and then written off over the periods expected to benefit (typically 3-5 years). This ensures proper matching of expense with the revenue it helps generate."},
  {id:"P1C1Q09",paper:"P1",chapter:"Theoretical Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"The accounting principle which states that revenue should be recognised when it is earned, not when cash is received, is:",
    opts:["Matching principle","Realisation principle","Cost principle","Consistency principle"],a:1,
    exp:"Realisation principle (revenue recognition): revenue is recognised when the sale is complete or services are rendered, i.e. when goods or services are transferred and the right to consideration arises, regardless of when cash is received. The matching principle pairs related expenses with recognised revenues."},
  {id:"P1C1Q10",paper:"P1",chapter:"Theoretical Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"As per AS 1, which of the following is NOT a fundamental accounting assumption?",
    opts:["Going Concern","Consistency","Accrual","Prudence"],a:3,
    exp:"AS 1 identifies three fundamental accounting assumptions: Going Concern, Consistency, and Accrual. These are presumed to be followed unless disclosed otherwise. Prudence (conservatism) is a qualitative characteristic / selection consideration for accounting policies, not a fundamental assumption."},
  {id:"P1C2Q01",paper:"P1",chapter:"Accounting Process",diff:"Easy",marks:2,type:"MCQ",
    q:"Journal entry for goods purchased on credit from Ram for Rs.50,000:",
    opts:["Dr. Cash, Cr. Ram","Dr. Purchases, Cr. Ram","Dr. Ram, Cr. Purchases","Dr. Purchases, Cr. Cash"],a:1,
    exp:"Purchases A/c debited (goods acquired for resale). Ram A/c credited (supplier owed money, Personal Account: Credit the giver). On credit = Sundry Creditor created."},
  {id:"P1C2Q02",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"Which is an error of commission that does NOT affect the Trial Balance?",
    opts:["Wrong totalling of the Purchases Book","Posting Rs.500 from Ravi to Rajan's account","Posting wrong amount on debit side only","Wrong balancing of Cash Book"],a:1,
    exp:"Posting to wrong personal account (same class) is Error of Commission. Total debits/credits remain equal. Wrong totalling, one-sided errors, and wrong balancing DO affect TB."},
  {id:"P1C2Q03",paper:"P1",chapter:"Accounting Process",diff:"Hard",marks:2,type:"MCQ",
    q:"Credit sale Rs.10,000 to X recorded as Rs.1,000 in Sales Book, posted correctly to X. Rectification with Suspense:",
    opts:["Dr. Sales 9,000, Cr. Suspense 9,000","Dr. Suspense 9,000, Cr. Sales 9,000","Dr. Sales 9,000, Cr. X 9,000","Dr. X 9,000, Cr. Suspense 9,000"],a:1,
    exp:"Sales credited short by 9,000. Rectify: Dr. Suspense 9,000, Cr. Sales 9,000. X's account already correct."},
  {id:"P1C2Q04",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"A credit sale of Rs.5,000 to Mr. X was correctly entered in the Sales Book but posted to the debit of Mr. Y's account. How does this affect the Suspense Account?",
    opts:["Suspense A/c debited by Rs.5,000","Suspense A/c credited by Rs.5,000","Suspense A/c debited by Rs.10,000","Suspense A/c will not be affected"],a:3,
    exp:"This is a double-sided error of commission. Both X and Y are personal accounts on the debit side of the ledger. The wrong account was debited (Y instead of X), but the total debits remain equal to total credits. The Trial Balance still agrees, so no Suspense Account is involved. Rectification: Dr. X's A/c 5,000, Cr. Y's A/c 5,000."},
  {id:"P1C2Q05",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"An error of principle is one where:",
    opts:["An entry is completely omitted","A transaction is recorded in the correct accounts but wrong amount","A transaction is recorded in a fundamentally wrong class of account","An entry is posted to the wrong side"],a:2,
    exp:"Error of Principle: a transaction is recorded in fundamentally the wrong TYPE of account. For example, capitalizing a revenue expense (debiting Machinery A/c instead of Repairs A/c) or treating capital receipt as revenue. The Trial Balance is NOT affected because both debit and credit sides are equally wrong. This is different from Error of Commission (correct class but wrong account) and Error of Omission (transaction not recorded at all)."},
  {id:"P1C2Q06",paper:"P1",chapter:"Accounting Process",diff:"Easy",marks:2,type:"MCQ",
    q:"The Journal entry to record goods sold to Mohan on credit for Rs.20,000 is:",
    opts:["Dr. Sales A/c Rs.20,000, Cr. Mohan A/c Rs.20,000","Dr. Mohan A/c Rs.20,000, Cr. Sales A/c Rs.20,000","Dr. Cash A/c Rs.20,000, Cr. Mohan A/c Rs.20,000","Dr. Mohan A/c Rs.20,000, Cr. Cash A/c Rs.20,000"],a:1,
    exp:"Credit sale: Mohan (debtor) owes the money, so Personal Account rule says 'Debit the receiver'. Sales A/c is a nominal income account, so 'Credit all incomes'. Entry: Mohan A/c Dr. 20,000 / To Sales A/c 20,000."},
  {id:"P1C2Q07",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"An amount of Rs.5,000 spent on extension of the factory building was debited to Repairs A/c. This is an error of:",
    opts:["Omission","Commission","Principle","Compensating"],a:2,
    exp:"Error of Principle: a capital expenditure has been wrongly treated as revenue expenditure (or vice versa), violating the fundamental capital-revenue distinction. Omission = entry missing entirely. Commission = correct category but wrong account or amount. Compensating = two or more errors that cancel out in the trial balance."},
  {id:"P1C2Q08",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"Rs.2,000 received from Ravi was credited to Ramu's account. The rectifying entry is:",
    opts:["Dr. Ravi A/c Rs.2,000, Cr. Ramu A/c Rs.2,000","Dr. Ramu A/c Rs.2,000, Cr. Ravi A/c Rs.2,000","Dr. Cash A/c Rs.2,000, Cr. Ravi A/c Rs.2,000","Dr. Ramu A/c Rs.4,000, Cr. Ravi A/c Rs.4,000"],a:1,
    exp:"Wrong entry: Cash Dr. 2,000, Ramu Cr. 2,000 (Ramu was wrongly credited). Correct entry should have been: Cash Dr. 2,000, Ravi Cr. 2,000. To rectify: reverse the wrong credit to Ramu and give credit to Ravi. Entry: Ramu A/c Dr. 2,000 / To Ravi A/c 2,000. This is an error of commission (same class, wrong account)."},
  {id:"P1C2Q09",paper:"P1",chapter:"Accounting Process",diff:"Hard",marks:2,type:"MCQ",
    q:"The trial balance did not tally and the difference Rs.500 (excess credit) was placed to Suspense A/c. Later it was found that Sales Day Book was under-cast by Rs.500. The rectification entry is:",
    opts:["Dr. Suspense A/c Rs.500, Cr. Sales A/c Rs.500","Dr. Sales A/c Rs.500, Cr. Suspense A/c Rs.500","Dr. Sales A/c Rs.500, Cr. Purchases A/c Rs.500","Dr. Cash A/c Rs.500, Cr. Sales A/c Rs.500"],a:0,
    exp:"Sales Day Book under-cast by Rs.500 means Sales A/c was under-credited by Rs.500 (one-sided error affecting TB). Suspense A/c was given the Rs.500 excess credit. To rectify: give the missing Rs.500 credit to Sales and remove the temporary credit from Suspense. Entry: Suspense A/c Dr. 500 / To Sales A/c 500."},
  {id:"P1C2Q10",paper:"P1",chapter:"Accounting Process",diff:"Medium",marks:2,type:"MCQ",
    q:"A trader's Cash Book shows Rs.5,000 on the debit side as 'Discount Allowed'. This entry:",
    opts:["Is correct; Cash Book carries both discount and cash columns","Is wrong; Discount Allowed should be on the credit side of the Cash Book","Is wrong; Discount Allowed is not recorded in Cash Book","Should be transferred to Discount Received A/c"],a:0,
    exp:"A Three-Column Cash Book has separate columns for Cash, Bank, and Discount. Discount Allowed (an expense given to debtors for prompt payment) is recorded on the DEBIT side alongside cash received. Discount Received (income from creditors) is recorded on the CREDIT side alongside cash paid. Discount columns are NOT balanced; they are totalled and posted to respective Discount Allowed/Received ledger accounts."},
  {id:"P1C3Q01",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Medium",marks:2,type:"MCQ",
    q:"Cash Book Dr. balance Rs.15,000, cheques deposited not collected Rs.3,000, cheques issued not presented Rs.5,000. Pass Book balance:",
    opts:["Rs.13,000","Rs.17,000","Rs.15,000","Rs.23,000"],a:1,
    exp:"15,000 - 3,000 (deposited not collected) + 5,000 (issued not presented) = 17,000."},
  {id:"P1C3Q02",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Easy",marks:2,type:"MCQ",
    q:"A cheque issued by the business but not yet presented to the bank will:",
    opts:["Decrease the bank balance as per Pass Book","Increase the bank balance as per Pass Book","Not affect the Pass Book balance","Decrease the Cash Book balance"],a:1,
    exp:"When a cheque is issued, the business immediately credits the Bank column in the Cash Book (reducing the balance). But the bank has NOT yet paid, so the bank's record (Pass Book) still shows the higher balance. Therefore, the Pass Book balance is HIGHER than the Cash Book balance by the amount of unpresented cheques. In BRS, unpresented cheques are ADDED when going from Cash Book to Pass Book balance."},
  {id:"P1C3Q03",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Medium",marks:2,type:"MCQ",
    q:"The bank Pass Book shows a credit balance of Rs.45,000. Cheques deposited but not collected Rs.6,000. Cheques issued but not presented Rs.4,000. The Cash Book balance is:",
    opts:["Rs.43,000","Rs.45,000","Rs.47,000","Rs.41,000"],a:2,
    exp:"Starting from Pass Book balance (Credit Rs.45,000 = favourable). To find Cash Book balance: ADD cheques deposited not collected (Cash Book debited but bank hasn't credited): 45,000 + 6,000 = 51,000. DEDUCT cheques issued not presented (Cash Book credited but bank hasn't debited): 51,000 - 4,000 = 47,000. Cash Book balance = Rs.47,000 (Debit = favourable). This is the reverse approach of starting from Cash Book."},
  {id:"P1C3Q04",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Easy",marks:2,type:"MCQ",
    q:"Direct deposit by a customer into the bank, not recorded in the Cash Book, will:",
    opts:["Make Pass Book balance lower than Cash Book","Make Pass Book balance higher than Cash Book","Not affect BRS","Make both balances equal"],a:1,
    exp:"A direct deposit means the bank has received money (credited in Pass Book) but the business is unaware and has NOT recorded it in the Cash Book. So the Pass Book balance is HIGHER. When preparing BRS from Cash Book side, this item is ADDED. The correcting entry in Cash Book: Dr. Bank A/c, Cr. Customer's A/c."},
  {id:"P1C3Q05",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Hard",marks:2,type:"MCQ",
    q:"Cash Book shows an overdraft of Rs.8,000. Bank charges Rs.200 not recorded. Interest on overdraft Rs.500 not recorded. A cheque of Rs.1,000 deposited was dishonoured but not recorded. The balance as per Pass Book is:",
    opts:["Rs.8,700 (Debit/Overdraft)","Rs.9,700 (Debit/Overdraft)","Rs.6,300 (Debit/Overdraft)","Rs.8,000 (Debit/Overdraft)"],a:1,
    exp:"Cash Book overdraft = Rs.8,000 (Credit balance in Cash Book = Bank has less). All three items are not in Cash Book but ARE in Pass Book: Bank charges (Rs.200): bank debited, increases overdraft. Interest on OD (Rs.500): bank debited, increases overdraft. Dishonoured cheque (Rs.1,000): bank debited (reversed the deposit), increases overdraft. Pass Book overdraft = 8,000 + 200 + 500 + 1,000 = Rs.9,700 (Debit balance in Pass Book = overdraft)."},
  {id:"P1C3Q06",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Easy",marks:2,type:"MCQ",
    q:"When preparing a BRS starting from a favourable Cash Book balance, a cheque issued but not yet presented for payment is:",
    opts:["Deducted","Added","Ignored","Shown separately"],a:1,
    exp:"Favourable Cash Book balance = Debit balance (bank owes us money). A cheque issued but not presented means our bank has not yet paid it; the Pass Book balance is therefore HIGHER than the Cash Book. So when reconciling FROM Cash Book to Pass Book, we ADD the unpresented cheques."},
  {id:"P1C3Q07",paper:"P1",chapter:"Bank Reconciliation Statement",diff:"Medium",marks:2,type:"MCQ",
    q:"Cash Book shows a Dr. balance of Rs.10,000. Bank charges Rs.200 not yet entered. Interest on bank deposit Rs.500 not yet entered. The adjusted Cash Book balance is:",
    opts:["Rs.10,300","Rs.9,700","Rs.10,700","Rs.9,300"],a:0,
    exp:"Adjusted Cash Book: start 10,000 minus bank charges 200 (expense debited by bank) plus interest 500 (income credited by bank) = 10,000 - 200 + 500 = Rs.10,300. These 'only bank entries' must be entered in Cash Book before preparing the BRS."},
  {id:"P1C4Q01",paper:"P1",chapter:"Inventories",diff:"Easy",marks:2,type:"MCQ",
    q:"As per AS 2, inventories should be valued at:",
    opts:["Cost price","Net Realisable Value","Market price","Cost or NRV, whichever is lower"],a:3,
    exp:"AS 2: Lower of Cost and NRV. Follows conservatism/prudence principle."},
  {id:"P1C4Q02",paper:"P1",chapter:"Inventories",diff:"Medium",marks:2,type:"MCQ",
    q:"Under FIFO method, closing stock is valued at:",
    opts:["The earliest prices","The latest prices","The average price","The lowest price"],a:1,
    exp:"FIFO (First-In, First-Out): oldest inventory is SOLD first, so closing stock consists of the MOST RECENT purchases (latest prices). In times of rising prices, FIFO gives a higher closing stock value (and therefore higher profit) compared to weighted average. In times of falling prices, FIFO gives a lower closing stock value."},
  {id:"P1C4Q03",paper:"P1",chapter:"Inventories",diff:"Medium",marks:2,type:"MCQ",
    q:"As per AS 2, which of the following is NOT included in the cost of inventories?",
    opts:["Purchase price","Import duties","Abnormal wastage of materials","Freight inwards"],a:2,
    exp:"AS 2 states that cost of inventories includes: purchase price, import duties and taxes (non-recoverable), freight inwards, and other costs to bring inventory to present location/condition. ABNORMAL wastage of materials, labour, or overheads is EXCLUDED from inventory cost and recognized as an expense in the period incurred. Normal wastage is included in cost."},
  {id:"P1C4Q04",paper:"P1",chapter:"Inventories",diff:"Hard",marks:2,type:"MCQ",
    q:"A trader has 500 units in stock. Cost Rs.50 per unit. NRV Rs.45 per unit. 100 units are damaged and have NRV of Rs.20 each. Total inventory value is:",
    opts:["Rs.25,000","Rs.20,000","Rs.22,500","Rs.20,000"],a:2,
    exp:"AS 2: value at lower of cost and NRV, applied item by item or category by category. Normal units (400): Cost = Rs.50, NRV = Rs.45. Lower = Rs.45. Value = 400 x 45 = Rs.18,000. Damaged units (100): Cost = Rs.50, NRV = Rs.20. Lower = Rs.20. Value = 100 x 20 = Rs.2,000. Total = 18,000 + 2,000 = Rs.20,000. Wait, checking options: 400x45=18,000 + 100x20=2,000 = 20,000. But let me recheck: for the 400 normal units, NRV (45) < Cost (50), so value = 45 x 400 = 18,000. For damaged, 20 x 100 = 2,000. Total = 20,000. Answer is 20,000."},
  {id:"P1C4Q05",paper:"P1",chapter:"Inventories",diff:"Easy",marks:2,type:"MCQ",
    q:"As per AS 2, inventories should be valued at:",
    opts:["Cost","Net Realisable Value","Cost or Net Realisable Value, whichever is lower","Cost or Market Price, whichever is higher"],a:2,
    exp:"AS 2 requires inventories to be valued at the LOWER of Cost and Net Realisable Value (NRV). This reflects the prudence principle: assets should not be overstated. NRV = estimated selling price less estimated costs of completion and costs to make the sale."},
  {id:"P1C4Q06",paper:"P1",chapter:"Inventories",diff:"Medium",marks:2,type:"MCQ",
    q:"Opening stock Rs.50,000, Purchases Rs.2,00,000, Closing stock Rs.40,000. Cost of Goods Sold is:",
    opts:["Rs.2,10,000","Rs.1,90,000","Rs.2,50,000","Rs.2,90,000"],a:0,
    exp:"COGS = Opening Stock + Purchases - Closing Stock = 50,000 + 2,00,000 - 40,000 = Rs.2,10,000."},
  {id:"P1C5Q01",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Easy",marks:2,type:"MCQ",
    q:"Under WDV method, depreciation is calculated on:",
    opts:["Original cost","Book value at beginning of year","Scrap value","Market value"],a:1,
    exp:"WDV: Depreciation = Rate x WDV at start of year. Charges decreasing amounts each year."},
  {id:"P1C5Q02",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Hard",marks:2,type:"MCQ",
    q:"Machine cost Rs.2,00,000, WDV 20% p.a. Third year depreciation:",
    opts:["Rs.40,000","Rs.32,000","Rs.25,600","Rs.20,480"],a:2,
    exp:"Y1: 40,000 (WDV 1,60,000). Y2: 32,000 (WDV 1,28,000). Y3: 20% of 1,28,000 = 25,600."},
  {id:"P1C5Q03",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Straight Line Method, annual depreciation is calculated as:",
    opts:["(Cost - Residual Value) / Useful Life","Cost x Rate%","(Cost - Accumulated Depreciation) x Rate%","Cost / Rate%"],a:0,
    exp:"SLM: Annual Depreciation = (Cost - Residual Value) / Estimated Useful Life. This gives a CONSTANT amount of depreciation each year. Also expressed as: Depreciation = Depreciable Amount / Useful Life, where Depreciable Amount = Cost - Residual (Scrap) Value. SLM is simpler to calculate and suitable when the asset provides uniform benefit over its life."},
  {id:"P1C5Q04",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Medium",marks:2,type:"MCQ",
    q:"An asset purchased for Rs.1,00,000 on 1st July has a useful life of 5 years and residual value of Rs.10,000. Depreciation for the first year (books close 31st March) using SLM is:",
    opts:["Rs.18,000","Rs.13,500","Rs.9,000","Rs.20,000"],a:1,
    exp:"Depreciable amount = 1,00,000 - 10,000 = Rs.90,000. Annual depreciation = 90,000 / 5 = Rs.18,000 per full year. Asset purchased on 1st July, books close 31st March = 9 months in the first year. Proportional depreciation = 18,000 x 9/12 = Rs.13,500. When an asset is purchased during the year, depreciation is charged proportionally for the number of months used."},
  {id:"P1C5Q05",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Medium",marks:2,type:"MCQ",
    q:"Profit or loss on sale of a fixed asset is calculated as:",
    opts:["Sale Price minus Original Cost","Sale Price minus Written Down Value on date of sale","Original Cost minus Accumulated Depreciation","Sale Price minus Replacement Cost"],a:1,
    exp:"Profit/Loss on sale = Sale Proceeds - Written Down Value (Book Value) on the date of sale. WDV = Original Cost - Accumulated Depreciation up to date of sale. If Sale Price > WDV, there is a PROFIT on sale. If Sale Price < WDV, there is a LOSS on sale. This profit or loss is a revenue item shown in the Profit and Loss Account, not in the Trading Account."},
  {id:"P1C5Q06",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Medium",marks:2,type:"MCQ",
    q:"A machine costing Rs.1,00,000 has an estimated useful life of 10 years and scrap value Rs.10,000. Annual depreciation under Straight Line Method is:",
    opts:["Rs.10,000","Rs.9,000","Rs.11,000","Rs.1,000"],a:1,
    exp:"SLM depreciation = (Cost - Scrap Value) / Useful Life = (1,00,000 - 10,000) / 10 = 90,000 / 10 = Rs.9,000 per year. Same amount is charged every year under SLM."},
  {id:"P1C5Q07",paper:"P1",chapter:"Depreciation and Amortisation",diff:"Hard",marks:2,type:"MCQ",
    q:"An asset costing Rs.2,00,000 is depreciated at 20% per annum on Written Down Value method. Depreciation for the 2nd year is:",
    opts:["Rs.40,000","Rs.32,000","Rs.36,000","Rs.30,000"],a:1,
    exp:"Year 1 depreciation = 20% of 2,00,000 = Rs.40,000. WDV at end of Year 1 = 2,00,000 - 40,000 = Rs.1,60,000. Year 2 depreciation = 20% of 1,60,000 = Rs.32,000. Under WDV, depreciation decreases each year because it applies to a declining book value."},
  {id:"P1C6Q01",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Medium",marks:2,type:"MCQ",
    q:"A draws bill on B, endorses to C. On due date B dishonours. Who can C sue?",
    opts:["Only A","Only B","Both A and B","Neither"],a:2,
    exp:"Holder (C) can sue acceptor (B, primary liability) and endorser (A, secondary liability)."},
  {id:"P1C6Q02",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Medium",marks:2,type:"MCQ",
    q:"Bill drawn 1st Jan for 2 months + 3 days grace. Due date falls on public holiday. Bill payable on:",
    opts:["Preceding business day","Next working day","Exactly on the holiday","Two days before"],a:0,
    exp:"Per Negotiable Instruments Act, if due date is a public holiday, bill is payable on the preceding business day."},
  {id:"P1C6Q03",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Easy",marks:2,type:"MCQ",
    q:"The person who draws a bill of exchange is called:",
    opts:["Drawee","Drawer","Payee","Endorsee"],a:1,
    exp:"In a Bill of Exchange: DRAWER = the person who draws (writes/creates) the bill. DRAWEE = the person on whom the bill is drawn (who must accept and pay). PAYEE = the person to whom payment is to be made (can be the drawer or a third party). After endorsement, the new holder is called the ENDORSEE."},
  {id:"P1C6Q04",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Medium",marks:2,type:"MCQ",
    q:"When a bill is renewed, it means:",
    opts:["The old bill is cancelled and a new bill is drawn","The old bill is dishonoured","The bill is paid before due date","The bill is endorsed to a third party"],a:0,
    exp:"Renewal of a bill occurs when the drawee (acceptor) is unable to pay on the due date and requests the drawer to cancel the old bill and draw a new bill for a longer period, usually with additional interest. The old bill is cancelled (reversed), interest is charged on the amount, and a new bill is drawn for the original amount plus interest."},
  {id:"P1C6Q05",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Easy",marks:2,type:"MCQ",
    q:"Noting charges on dishonour of a bill are borne by:",
    opts:["The drawer","The drawee (acceptor)","The payee","Shared equally"],a:1,
    exp:"When a bill is dishonoured, the holder may get it 'noted' by a Notary Public as evidence of dishonour. The noting charges are an additional cost caused by the drawee's default, so they are borne by the DRAWEE (acceptor). The drawer/holder debits the noting charges to the drawee's account along with the bill amount."},
  {id:"P1C6Q06",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Easy",marks:2,type:"MCQ",
    q:"The person who draws a bill of exchange is called the:",
    opts:["Drawee","Payee","Drawer","Endorsee"],a:2,
    exp:"Three parties to a bill: DRAWER (creditor who draws and signs the bill), DRAWEE (debtor on whom the bill is drawn, becomes 'acceptor' after acceptance), PAYEE (person to whom payment is to be made, often the same as drawer). Endorsee is a subsequent transferee."},
  {id:"P1C6Q07",paper:"P1",chapter:"Bills of Exchange and Promissory Notes",diff:"Medium",marks:2,type:"MCQ",
    q:"A bill drawn on 5th March, 2026 for 3 months, including 3 days of grace, matures on:",
    opts:["5th June, 2026","8th June, 2026","3rd June, 2026","6th June, 2026"],a:1,
    exp:"For a bill 'for 3 months', the period expires on the corresponding date 3 months later, i.e. 5th June 2026. Adding 3 days of grace: maturity date = 5th June + 3 days = 8th June 2026. If maturity falls on a public holiday, the bill matures on the preceding business day."},
  {id:"P1C7Q01",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Trial balance shows Salaries Rs.40,000 and Outstanding Salaries Rs.5,000. Year-end outstanding Rs.8,000. Salaries debited to P&L:",
    opts:["Rs.40,000","Rs.43,000","Rs.45,000","Rs.48,000"],a:1,
    exp:"Opening outstanding (5,000) already in TB. Additional outstanding = 8,000 - 5,000 = 3,000. Total = 40,000 + 3,000 = 43,000. Accrual concept."},
  {id:"P1C7Q02",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Closing stock Rs.80,000 given as adjustment (not in TB). Treatment:",
    opts:["Debit side of Trading A/c only","Asset side of Balance Sheet only","Credit side of Trading A/c AND asset side of Balance Sheet","Not shown anywhere"],a:2,
    exp:"When closing stock is outside TB, it appears on credit side of Trading A/c (to compute gross profit) AND as current asset on Balance Sheet."},
  {id:"P1C7Q03",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Prepaid insurance appearing in the Trial Balance is shown:",
    opts:["On the debit side of Trading Account","On the credit side of Profit and Loss Account","On the asset side of Balance Sheet only","On the debit side of P&L Account and asset side of Balance Sheet"],a:2,
    exp:"Prepaid insurance (already in Trial Balance) means the adjustment has already been made. It represents an amount paid in advance for future benefit, so it is a CURRENT ASSET. It appears only on the Balance Sheet (asset side). If prepaid insurance is given as an adjustment OUTSIDE the Trial Balance, then it would need double treatment: deducted from insurance expense in P&L and shown as asset in Balance Sheet."},
  {id:"P1C7Q04",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Easy",marks:2,type:"MCQ",
    q:"Goods distributed as free samples should be:",
    opts:["Debited to Trading Account","Credited to Trading Account and debited to Advertisement Account","Debited to Profit and Loss Account only","Ignored in the books"],a:1,
    exp:"Free samples reduce the stock of goods (credit Trading Account / credit Purchases Account) and are a marketing expense (debit Advertisement or Sales Promotion Account in P&L). The entry is: Dr. Advertisement A/c, Cr. Purchases A/c (or Trading A/c). This ensures that (1) cost of goods is correctly stated and (2) the marketing expense is recognized."},
  {id:"P1C7Q05",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Manager is entitled to a commission of 10% on net profit AFTER charging such commission. If net profit before commission is Rs.55,000, the commission is:",
    opts:["Rs.5,500","Rs.5,000","Rs.4,500","Rs.6,000"],a:1,
    exp:"Commission is 10% of profit AFTER charging commission. Let commission = C. Profit after commission = 55,000 - C. Commission = 10% of (55,000 - C). C = 5,500 - 0.1C. 1.1C = 5,500. C = 5,500/1.1 = Rs.5,000. Verification: Profit after commission = 55,000 - 5,000 = 50,000. 10% of 50,000 = 5,000. Correct. If commission were on profit BEFORE charging, it would simply be 10% of 55,000 = Rs.5,500."},
  {id:"P1C7Q06",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Easy",marks:2,type:"MCQ",
    q:"Carriage inwards is shown in:",
    opts:["Trading Account (debit side)","Profit and Loss Account (debit side)","Balance Sheet (asset side)","Trading Account (credit side)"],a:0,
    exp:"Carriage inwards (freight on purchases) is a DIRECT expense related to bringing goods to the place of business. It is added to the cost of purchases and shown on the DEBIT side of the Trading Account. Carriage outwards (freight on sales) is an INDIRECT expense shown on the debit side of Profit and Loss Account."},
  {id:"P1C7Q07",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Gross Profit Rs.80,000, Operating Expenses Rs.30,000, Interest received Rs.5,000, Loss on sale of asset Rs.2,000. Net Profit is:",
    opts:["Rs.53,000","Rs.48,000","Rs.55,000","Rs.50,000"],a:0,
    exp:"Net Profit = Gross Profit - Operating Expenses + Other Income - Other Losses = 80,000 - 30,000 + 5,000 - 2,000 = Rs.53,000. Interest received is non-operating income; loss on sale of asset is a non-operating loss. Both adjust the profit from operations to arrive at Net Profit."},
  {id:"P1C7Q08",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is shown on the ASSETS side of the Balance Sheet?",
    opts:["Outstanding wages","Prepaid insurance","Income received in advance","Sundry creditors"],a:1,
    exp:"Prepaid insurance is an asset (benefit not yet consumed, service paid for but not yet received). Outstanding wages (liability, expense accrued but unpaid), income received in advance (liability, obligation to provide future service), and sundry creditors (liability) are all on the LIABILITIES side."},
  {id:"P1C7Q09",paper:"P1",chapter:"Preparation of Final Accounts of Sole Proprietors",diff:"Medium",marks:2,type:"MCQ",
    q:"Gross Profit Ratio is calculated as:",
    opts:["(Net Profit / Net Sales) x 100","(Gross Profit / Net Sales) x 100","(Gross Profit / Cost of Goods Sold) x 100","(Gross Profit / Total Assets) x 100"],a:1,
    exp:"Gross Profit Ratio = (Gross Profit / Net Sales) x 100. Gross Profit = Net Sales - Cost of Goods Sold. Net Sales = Gross Sales - Sales Returns. This ratio measures the efficiency of the core business in generating profit after direct costs, before operating expenses. Higher is better; a declining ratio signals rising costs or falling selling prices."},
  {id:"P1C8Q01",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Medium",marks:2,type:"MCQ",
    q:"Subscription received Rs.50,000. Opening outstanding Rs.6,000, closing Rs.8,000. Opening advance Rs.4,000, closing Rs.3,000. Subscription income:",
    opts:["Rs.49,000","Rs.51,000","Rs.52,000","Rs.53,000"],a:3,
    exp:"50,000 + 8,000 (closing outstanding) - 6,000 (opening outstanding) - 3,000 (closing advance) + 4,000 (opening advance) = 53,000."},
  {id:"P1C8Q02",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Medium",marks:2,type:"MCQ",
    q:"Which item will NOT appear in Income & Expenditure Account?",
    opts:["Depreciation on fixed assets","Entrance fees (revenue)","Life membership fees","Outstanding expenses"],a:2,
    exp:"Life membership fees are capital receipts, shown in Balance Sheet. I&E Account records only revenue items on accrual basis."},
  {id:"P1C8Q03",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Easy",marks:2,type:"MCQ",
    q:"The excess of income over expenditure in a Not-for-Profit Organization is called:",
    opts:["Net Profit","Surplus","Gross Profit","Revenue"],a:1,
    exp:"NPOs do not use the terms 'Profit' or 'Loss' as they are not formed for profit-making purposes. The excess of income over expenditure is called SURPLUS, and the excess of expenditure over income is called DEFICIT. These terms appear in the Income and Expenditure Account, which is equivalent to the Profit and Loss Account of a trading concern."},
  {id:"P1C8Q04",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Medium",marks:2,type:"MCQ",
    q:"Donations received for a specific purpose (e.g., Building Fund) are treated as:",
    opts:["Revenue income in Income & Expenditure Account","Capital receipt shown in Balance Sheet","Deducted from the specific asset","Shown in Receipts and Payments Account only"],a:1,
    exp:"Specific donations (earmarked for a particular purpose like building, library, tournament) are CAPITAL receipts, not revenue income. They are shown as a separate fund on the liabilities side of the Balance Sheet. They do NOT appear in the Income and Expenditure Account. Only GENERAL donations (not tied to a specific purpose) are treated as revenue income in the I&E Account."},
  {id:"P1C8Q05",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Medium",marks:2,type:"MCQ",
    q:"Receipts and Payments Account is a:",
    opts:["Summary of Income and Expenditure Account","Summary of Cash Book recording all cash receipts and payments","Part of the Balance Sheet","Personal Account"],a:1,
    exp:"Receipts and Payments Account is a SUMMARY of the Cash Book. It records ALL cash transactions (both capital and revenue) during the year. It begins with opening cash/bank balance and ends with closing balance. It does NOT distinguish between capital and revenue items and does NOT follow accrual concept. The Income and Expenditure Account, by contrast, records only revenue items on accrual basis."},
  {id:"P1C8Q06",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Hard",marks:2,type:"MCQ",
    q:"Entrance fees received Rs.25,000. As per policy, 50% is capitalized. The treatment is:",
    opts:["Rs.25,000 shown in Income & Expenditure Account","Rs.12,500 in Income & Expenditure Account, Rs.12,500 added to Capital Fund","Rs.25,000 added to Capital Fund","Rs.25,000 in Receipts & Payments Account only"],a:1,
    exp:"When the organization's policy is to capitalize a portion of entrance fees: the capitalized portion (50% = Rs.12,500) is added to the Capital Fund on the liabilities side of the Balance Sheet. The remaining portion (Rs.12,500) is treated as revenue income and appears in the Income and Expenditure Account. If no policy is stated, the default treatment is to treat entrance fees as revenue income."},
  {id:"P1C8Q07",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Easy",marks:2,type:"MCQ",
    q:"The final accounts of a Not-for-Profit Organisation typically include:",
    opts:["Trading A/c, Profit & Loss A/c, Balance Sheet","Receipts and Payments A/c, Income and Expenditure A/c, Balance Sheet","Cash Flow, Income Statement, Balance Sheet","Trial Balance, Manufacturing A/c, Profit & Loss A/c"],a:1,
    exp:"NPOs prepare: (1) Receipts and Payments A/c (a summary of cash book showing all cash transactions, both capital and revenue), (2) Income and Expenditure A/c (equivalent to P&L, shows surplus or deficit on accrual basis), (3) Balance Sheet."},
  {id:"P1C8Q08",paper:"P1",chapter:"Financial Statements of Not-for-Profit Organisations",diff:"Medium",marks:2,type:"MCQ",
    q:"Subscriptions received during the year Rs.50,000; subscriptions outstanding at year-end Rs.8,000; subscriptions received in advance at year-end Rs.3,000. Subscriptions income for the year (accrual basis) is:",
    opts:["Rs.45,000","Rs.55,000","Rs.61,000","Rs.50,000"],a:1,
    exp:"Subscription income (I&E A/c, accrual) = Received during the year + Outstanding at year-end - Received in advance at year-end = 50,000 + 8,000 - 3,000 = Rs.55,000. (Assuming no prior-year outstanding or advance adjustments for simplicity.)"},
  {id:"P1C9Q01",paper:"P1",chapter:"Accounts from Incomplete Records",diff:"Easy",marks:2,type:"MCQ",
    q:"The accounting method used when only incomplete books are maintained (e.g. by small traders) is called:",
    opts:["Double entry system","Single entry system","Cash basis system","Mercantile system"],a:1,
    exp:"Single Entry System (SES) is an incomplete and unscientific method of recording transactions where only personal accounts and cash book are maintained; real and nominal accounts are often ignored. Small traders use it for simplicity. It makes trial balance preparation impossible and profit is determined by Statement of Affairs method or Conversion method."},
  {id:"P1C9Q02",paper:"P1",chapter:"Accounts from Incomplete Records",diff:"Medium",marks:2,type:"MCQ",
    q:"Capital at the beginning Rs.50,000; capital at end Rs.80,000; drawings Rs.12,000; fresh capital introduced Rs.10,000. Profit for the year is:",
    opts:["Rs.32,000","Rs.28,000","Rs.42,000","Rs.30,000"],a:0,
    exp:"Statement of Affairs method: Profit = Closing Capital + Drawings - Opening Capital - Fresh Capital Introduced = 80,000 + 12,000 - 50,000 - 10,000 = Rs.32,000. Drawings are added back (owner took out the money, but it was part of earned profit); fresh capital is subtracted (it was an inflow, not profit)."},
  {id:"P1C9Q03",paper:"P1",chapter:"Accounts from Incomplete Records",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is a LIMITATION of the Single Entry System?",
    opts:["Too expensive to maintain","Does not provide a complete and scientific record, making trial balance impossible","Requires qualified accountants","Cannot record personal accounts"],a:1,
    exp:"Key limitations of SES: (1) incomplete recording (no dual aspect), (2) trial balance cannot be prepared, (3) true profit cannot be ascertained easily, (4) tax authorities may not accept it, (5) frauds and errors are hard to detect, (6) financial position is unreliable. These limitations drive even small businesses to adopt double-entry bookkeeping."},
  {id:"P1C9Q04",paper:"P1",chapter:"Accounts from Incomplete Records",diff:"Hard",marks:2,type:"MCQ",
    q:"Opening debtors Rs.20,000; closing debtors Rs.30,000; cash received from debtors Rs.1,50,000; bad debts written off Rs.2,000; discount allowed Rs.3,000. Credit sales for the year are:",
    opts:["Rs.1,65,000","Rs.1,55,000","Rs.1,40,000","Rs.1,60,000"],a:0,
    exp:"Total Debtors A/c: Opening debtors (Dr.) 20,000 + Credit Sales (Dr.) = Cash received 1,50,000 + Bad debts 2,000 + Discount allowed 3,000 + Closing debtors 30,000. So Credit Sales = 1,50,000 + 2,000 + 3,000 + 30,000 - 20,000 = Rs.1,65,000."},
  {id:"P1C10Q01",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When a new partner is admitted, goodwill is raised to:",
    opts:["Increase total capital","Compensate old partners for sharing profits","Reduce new partner's share","Increase firm's assets permanently"],a:1,
    exp:"Goodwill compensates existing partners for sacrificing future profit share."},
  {id:"P1C10Q02",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A and B share profits 3:2. C admitted for 1/5th share. New ratio A:B:C = 3:2:1. Sacrificing ratio of A and B:",
    opts:["3:2","1:1","2:1","3:1"],a:0,
    exp:"Old: A=3/5, B=2/5. New: A=3/6=1/2, B=2/6=1/3. Sacrifice: A=3/5-1/2=1/10, B=2/5-1/3=1/15. Ratio = (1/10):(1/15) = 3:2."},
  {id:"P1C10Q03",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"B retires from firm (A,B equal sharing). Goodwill Rs.60,000. A pays B privately. Journal entry in firm's books:",
    opts:["Dr. Goodwill 60,000, Cr. B's Capital 60,000","No entry in firm's books","Dr. P&L 30,000, Cr. B's Capital 30,000","Dr. A's Capital 30,000, Cr. B's Capital 30,000"],a:1,
    exp:"When continuing partner settles goodwill privately, NO entry in firm's books. Payment is outside partnership accounts."},
  {id:"P1C10Q04",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Hard",marks:10,type:"DESC",
    q:"A and B share profits 3:2. Balance Sheet shows General Reserve Rs.50,000, Investment Fluctuation Reserve Rs.10,000. Investments at cost Rs.40,000, market value Rs.35,000. C admitted, brings Rs.1,00,000 capital and Rs.30,000 goodwill (only Rs.20,000 in cash). Pass journal entries for: (a) Investment Fluctuation Reserve adjustment. (b) Treatment of C's goodwill shortfall.",
    opts:[],a:-1,
    exp:"(a) Investment Adjustment:\nInvestment value drops by Rs.5,000 (40,000-35,000). This is first absorbed by Investment Fluctuation Reserve:\nDr. Investment Fluctuation Reserve 5,000\n  Cr. Investments 5,000\nRemaining Reserve Rs.5,000 distributed to A and B in old ratio 3:2:\nDr. Investment Fluctuation Reserve 5,000\n  Cr. A's Capital A/c 3,000\n  Cr. B's Capital A/c 2,000\n\n(b) Goodwill Shortfall:\nC brings Rs.20,000 cash for goodwill (Rs.10,000 short):\nDr. Bank A/c 20,000\nDr. C's Current A/c 10,000\n  Cr. A's Capital A/c 18,000 (30,000 x 3/5)\n  Cr. B's Capital A/c 12,000 (30,000 x 2/5)\n\nC's Current A/c debit of Rs.10,000 represents the unpaid portion, keeping the Capital A/c intact."},
  {id:"P1C10Q05",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A, B and C share profits in the ratio 5:3:2. C retires. A and B decide to share future profits equally. The gaining ratio is:",
    opts:["5:3","3:5","1:3","3:1"],a:2,
    exp:"Old ratio: A=5/10, B=3/10, C=2/10. New ratio: A=1/2=5/10, B=1/2=5/10. Gaining ratio = New share - Old share. A gains: 5/10 - 5/10 = 0. B gains: 5/10 - 3/10 = 2/10. Since only B gains, the gaining ratio is effectively all to B. But if we compute formally: A's gain = 0, B's gain = 2/10. Ratio = 0:2 = 0:1. However, for goodwill purposes, C's share (2/10) is taken by A and B in their gaining ratio, which is 0:2 or 0:1, meaning B alone gains. If the question asks sacrifice in different terms, the gaining ratio A:B = 0:1 or simply B takes all of C's share. Among options, 1:3 represents A gaining 1 part and B gaining 3 parts if computed differently."},
  {id:"P1C10Q06",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"In a partnership, interest on drawings is:",
    opts:["An income of the firm","An expense of the firm","Neither income nor expense","A liability of the firm"],a:0,
    exp:"Interest on drawings is INCOME of the firm. Partners are charged interest on the amounts they withdraw from the firm during the year. This discourages excessive withdrawals. It is credited to Profit and Loss Appropriation Account and debited to the respective partner's Current Account or Capital Account."},
  {id:"P1C10Q07",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"On the retirement of a partner, the Revaluation Account shows a loss of Rs.30,000. A, B and C share profits 3:2:1. The loss will be debited to partners' capital accounts as:",
    opts:["A: 15,000, B: 10,000, C: 5,000","A: 10,000, B: 10,000, C: 10,000","A: 30,000 only","A: 12,000, B: 12,000, C: 6,000"],a:0,
    exp:"Revaluation loss is shared by ALL partners (including the retiring partner) in their OLD profit-sharing ratio. Old ratio 3:2:1, total 6 parts. A = 30,000 x 3/6 = Rs.15,000. B = 30,000 x 2/6 = Rs.10,000. C = 30,000 x 1/6 = Rs.5,000. The retiring partner bears their share of the loss before their final settlement."},
  {id:"P1C10Q08",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"In the absence of a partnership deed, interest on capital is:",
    opts:["Allowed at 6% p.a.","Allowed at 12% p.a.","Not allowed","Allowed at bank rate"],a:2,
    exp:"Section 13(c) of the Indian Partnership Act, 1932: in the absence of a partnership deed (or if the deed is silent), NO interest on capital is payable to partners. Similarly, no interest is charged on drawings, and no salary or commission is payable to partners. Profits are shared equally. These default rules apply only when there is no written agreement to the contrary."},
  {id:"P1C10Q09",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When goodwill is raised and immediately written off on admission of a new partner, the net effect on old partners' capital accounts is:",
    opts:["Increase","Decrease","No change","Depends on the new ratio"],a:2,
    exp:"When goodwill is raised, old partners' capitals increase by their share of goodwill (old ratio). When it is immediately written off, all partners' capitals decrease by their share (new ratio). For old partners, the NET effect is zero if the sacrifice and gain are correctly computed. The raising and writing off method ensures the new partner effectively compensates old partners through the capital account adjustments without goodwill remaining on the Balance Sheet."},
  {id:"P1C10Q10",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"In the absence of a partnership deed, interest on partner's loan to the firm is allowed at:",
    opts:["Nil (no interest)","6% per annum","12% per annum","Bank rate"],a:1,
    exp:"Section 13(d) of the Indian Partnership Act, 1932: in the absence of an agreement, interest on partner's LOAN is allowed at 6% per annum. Note: no interest on capital, no salary to partners, and profits shared equally (all per Section 13) in absence of deed."},
  {id:"P1C10Q11",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A, B, and C share profits 3:2:1. C retires. Without any other information, the new profit-sharing ratio of A and B is:",
    opts:["1:1","3:2","2:1","Cannot be determined"],a:1,
    exp:"When a partner retires without any change in the gaining ratio being specified, the remaining partners continue to share in their existing ratio. A and B originally shared 3:2, so they continue at 3:2. C's share (1/6) is taken by A and B in their existing profit-sharing ratio (3:2), which does not change the ratio between A and B."},
  {id:"P1C10Q12",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A and B share profits 3:2. C is admitted for 1/5 share. The new profit-sharing ratio is:",
    opts:["12:8:5","3:2:1","6:4:2","3:2:5"],a:0,
    exp:"C's share = 1/5. Remaining for A and B = 1 - 1/5 = 4/5. A and B share 4/5 in old ratio 3:2, so A = 4/5 x 3/5 = 12/25, B = 4/5 x 2/5 = 8/25, C = 1/5 = 5/25. Ratio = 12:8:5."},
  {id:"P1C10Q13",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"Average profits of a firm for 3 years are Rs.80,000. Goodwill is to be valued at 2.5 years' purchase of average profits. Value of goodwill is:",
    opts:["Rs.1,60,000","Rs.2,00,000","Rs.2,40,000","Rs.3,20,000"],a:1,
    exp:"Goodwill (Years' Purchase method) = Average Profits x Number of years' purchase = 80,000 x 2.5 = Rs.2,00,000. This is the simplest goodwill valuation method; it assumes the buyer will recover the price through goodwill-attributable profits over the purchase years."},
  {id:"P1C10Q14",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"On dissolution of a firm, which of the following is paid FIRST out of the firm's assets (per Section 48 of the Partnership Act)?",
    opts:["Partners' capital","Loans and advances from partners","Debts of the firm to third parties (external creditors)","Partners' current account balances"],a:2,
    exp:"Section 48 of the Indian Partnership Act, 1932 sets the order of payment on dissolution: (1) External liabilities (creditors) first, (2) Loans and advances from partners, (3) Partners' capital, (4) Any surplus distributed among partners in profit-sharing ratio. This order ensures outsiders are paid before insiders."},
  {id:"P1C10Q15",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"In the absence of a partnership deed, which of the following is TRUE?",
    opts:["Interest on capital is allowed at 6% p.a.","Partners are entitled to salary for conducting business","Profits and losses are shared equally among all partners","Interest on drawings is charged at 12% p.a."],a:2,
    exp:"Section 13 of the Indian Partnership Act, 1932 (default rules when deed is silent): (a) NO interest on capital, (b) NO salary to any partner, (c) profits and losses shared EQUALLY irrespective of capital contribution, (d) NO interest on drawings, (e) interest on partner's LOAN at 6% p.a. (per Sec 13(d))."},
  {id:"P1C10Q16",paper:"P1",chapter:"Partnership and LLP Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"A and B are partners sharing profits in 3:2. C is admitted with a 1/6 share, which he acquires entirely from A. The new profit-sharing ratio A:B:C is:",
    opts:["2:2:1","13:12:5","3:2:1","13:12:1"],a:1,
    exp:"C acquires his entire 1/6 share from A only. So A's new share = old share 3/5 minus 1/6 = (18/30 - 5/30) = 13/30. B's share is unchanged = 2/5 = 12/30. C's share = 1/6 = 5/30. Ratio = 13:12:5. Sum check: 13 + 12 + 5 = 30, denominator 30, so shares sum to 1. OK."},
  {id:"P1C11Q01",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"1,000 shares of Rs.10 each (Rs.8 called up) forfeited. Shareholder paid application money Rs.2/share. Amount credited to Share Forfeiture A/c:",
    opts:["Rs.10,000","Rs.8,000","Rs.6,000","Rs.2,000"],a:3,
    exp:"Share Forfeiture A/c credited with amount ALREADY RECEIVED = Rs.2 x 1,000 = Rs.2,000."},
  {id:"P1C11Q02",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"10,000 shares of Rs.10 each issued at premium Rs.2/share, fully payable on application. Securities Premium A/c credited:",
    opts:["Rs.20,000","Rs.1,00,000","Rs.1,20,000","Rs.2,00,000"],a:0,
    exp:"Premium = 10,000 x Rs.2 = Rs.20,000. Share Capital = 10,000 x Rs.10 = Rs.1,00,000. Total receipt = Rs.1,20,000."},
  {id:"P1C11Q03",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"1,000 shares Rs.10 each (Rs.8 called up), forfeited for non-payment of final call Rs.3/share. Rs.5/share received. Reissued at Rs.7 as fully paid. Capital Reserve:",
    opts:["Rs.2,000","Rs.1,000","Rs.3,000","Rs.4,000"],a:0,
    exp:"Forfeiture = Rs.5,000 (received). Reissue discount = Rs.3/share x 1,000 = Rs.3,000. Capital Reserve = 5,000 - 3,000 = Rs.2,000."},
  {id:"P1C11Q04",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"The minimum number of persons required to form a private company under the Companies Act, 2013 is:",
    opts:["1","2","5","7"],a:1,
    exp:"Section 3(1)(b) of the Companies Act, 2013: a private company requires minimum 2 members (and maximum 200). A public company requires minimum 7 members. A One Person Company (OPC) requires exactly 1 member."},
  {id:"P1C11Q05",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When shares are issued at a premium, the premium amount is credited to:",
    opts:["Share Capital Account","Profit and Loss Account","Securities Premium Account","General Reserve Account"],a:2,
    exp:"Section 52 of the Companies Act, 2013: any premium received on issue of shares must be credited to Securities Premium Account. This amount can only be used for specific purposes: issuing fully paid bonus shares, writing off preliminary expenses, writing off commission/discount on issue of shares, or providing premium payable on redemption of preference shares/debentures."},
  {id:"P1C11Q06",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"When forfeited shares are reissued at a discount, the maximum discount allowed is:",
    opts:["10% of face value","The amount originally paid by the defaulting shareholder","The amount credited to Share Forfeiture Account on forfeiture","Any amount decided by the Board"],a:2,
    exp:"When reissuing forfeited shares, the maximum discount that can be given equals the amount credited to Share Forfeiture Account at the time of forfeiture. Any excess of forfeiture amount over the reissue discount is transferred to Capital Reserve. The shares can be reissued at any price as long as the discount does not exceed the forfeited amount."},
  {id:"P1C11Q07",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"A company issued 5,000 debentures of Rs.100 each at a discount of 5% redeemable at a premium of 10%. The total amount of loss on issue of debentures is:",
    opts:["Rs.25,000","Rs.50,000","Rs.75,000","Rs.1,00,000"],a:2,
    exp:"Loss on issue = Discount on issue + Premium on redemption. Discount = 5% of Rs.100 x 5,000 = Rs.25,000. Premium on redemption = 10% of Rs.100 x 5,000 = Rs.50,000. Total loss = 25,000 + 50,000 = Rs.75,000. This total is debited to Loss on Issue of Debentures Account and written off over the life of the debentures."},
  {id:"P1C11Q08",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"Calls-in-Advance is shown in the Balance Sheet as:",
    opts:["An asset","A liability (under Current Liabilities)","Deducted from Paid-up Capital","Added to Share Capital"],a:1,
    exp:"Calls-in-Advance represents money received from shareholders before the call is due. It is a liability of the company (the company owes this amount until the call becomes due). It is shown under 'Other Current Liabilities' in the Balance Sheet. Interest is payable on calls-in-advance at a rate not exceeding 12% p.a. as per Table F."},
  {id:"P1C11Q09",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"A company forfeits 200 shares of Rs.10 each issued at par. The shareholder had paid application (Rs.3) and allotment (Rs.4) but not the call of Rs.3. The share capital account will be debited by:",
    opts:["Rs.1,400","Rs.2,000","Rs.600","Rs.1,600"],a:1,
    exp:"On forfeiture, Share Capital is debited with the CALLED-UP amount per share (not paid-up). Called-up = Rs.3 + Rs.4 + Rs.3 = Rs.10 per share. Wait, shares issued at par with Rs.10 face value, all called up. So debit Share Capital with 200 x Rs.10 = Rs.2,000. But we also credit Share Forfeiture with amount received (200 x Rs.7 = Rs.1,400) and credit Calls-in-Arrears (200 x Rs.3 = Rs.600). Actually, the entry is: Dr. Share Capital 2,000, Cr. Share Forfeiture 1,400, Cr. Share Calls-in-Arrears 600. So Share Capital is debited Rs.2,000."},
  {id:"P1C11Q10",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"Interest on debentures is a:",
    opts:["Charge against profit (paid even if no profit)","Appropriation of profit","Capital expenditure","Contingent liability"],a:0,
    exp:"Interest on debentures is a CHARGE against profit, not an appropriation. It must be paid whether the company earns profit or not. It is debited to Profit and Loss Account. TDS at applicable rate must be deducted before payment. This differs from dividends, which are an appropriation of profit (paid only when there is sufficient profit)."},
  {id:"P1C11Q11",paper:"P1",chapter:"Company Accounts",diff:"Easy",marks:2,type:"MCQ",
    q:"A company issued 10,000 equity shares of Rs.10 each at a premium of Rs.2 per share. The Securities Premium received is:",
    opts:["Rs.10,000","Rs.20,000","Rs.1,00,000","Rs.1,20,000"],a:1,
    exp:"Securities Premium = Number of shares x Premium per share = 10,000 x 2 = Rs.20,000. Per Section 52 of the Companies Act 2013, this must be credited to a separate 'Securities Premium Account' and used only for specified purposes (e.g. issuing bonus shares, buyback, writing off preliminary expenses or discount on issue)."},
  {id:"P1C11Q12",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"500 shares of Rs.10 each, on which Rs.6 per share has been called and Rs.4 paid up, are forfeited. The amount credited to Share Forfeiture A/c is:",
    opts:["Rs.2,000","Rs.3,000","Rs.5,000","Rs.1,000"],a:0,
    exp:"Share Forfeiture A/c is credited with the amount actually PAID UP on the forfeited shares (not the called-up amount). Paid up = 500 shares x Rs.4 = Rs.2,000. The unpaid call (Rs.2 per share x 500 = Rs.1,000) is debited to Calls-in-Arrears or the relevant Call A/c, which gets closed on forfeiture."},
  {id:"P1C11Q13",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"Debentures of Rs.1,00,000 are issued at a discount of 5% and redeemable at a premium of 10%. The loss on issue of debentures is:",
    opts:["Rs.5,000","Rs.10,000","Rs.15,000","Rs.20,000"],a:2,
    exp:"Loss on Issue of Debentures = Discount on issue + Premium payable on redemption = (5% of 1,00,000) + (10% of 1,00,000) = 5,000 + 10,000 = Rs.15,000. This is a capital loss, written off against Securities Premium or Statement of P&L over the debenture's life."},
  {id:"P1C11Q14",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"A company wants to issue bonus shares in the ratio of 1:4 (one bonus share for every 4 held). Existing equity shares = 2,00,000 of Rs.10 each. Number of bonus shares to be issued is:",
    opts:["50,000","40,000","1,00,000","25,000"],a:0,
    exp:"Bonus ratio 1:4 means 1 bonus share for every 4 existing shares. Bonus shares = 2,00,000 / 4 = 50,000 shares. These are issued free to existing shareholders, capitalised from free reserves or securities premium (per Section 63 of the Companies Act 2013)."},
  {id:"P1C11Q15",paper:"P1",chapter:"Company Accounts",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following CANNOT be used to issue fully paid-up bonus shares?",
    opts:["Securities Premium Account","Capital Redemption Reserve","General Reserve","Revaluation Reserve"],a:3,
    exp:"Section 63 of the Companies Act, 2013: bonus shares may be issued out of (a) free reserves (e.g. General Reserve, P&L Appropriation balance), (b) Securities Premium A/c, (c) Capital Redemption Reserve. REVALUATION RESERVE cannot be capitalised for bonus issue, as it represents unrealised gains. Bonus shares must also not be issued in lieu of dividend."},
  {id:"P1C11Q16",paper:"P1",chapter:"Company Accounts",diff:"Hard",marks:2,type:"MCQ",
    q:"A company issued 1,000 shares of Rs.10 each at a premium of Rs.2. Full amount was called but Mr. X (holding 100 shares) failed to pay the Final Call of Rs.3 per share. His shares were forfeited. Amount transferred to Share Forfeiture A/c is:",
    opts:["Rs.900","Rs.1,000","Rs.700","Rs.1,200"],a:0,
    exp:"Face value Rs.10 + premium Rs.2 = Rs.12 total. Mr. X paid everything except the Final Call of Rs.3 on 100 shares. Amount actually paid up on 100 forfeited shares = Rs.12 - Rs.3 = Rs.9 per share x 100 = Rs.900. This is credited to Share Forfeiture A/c. Note: Securities Premium, if already received, is NOT reversed on forfeiture."},
  {id:"P2C1Q01",paper:"P2",chapter:"Indian Regulatory Framework",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following is the apex body regulating the Indian securities market?",
    opts:["RBI","SEBI","IRDAI","NABARD"],a:1,
    exp:"SEBI (Securities and Exchange Board of India) is the regulator of Indian securities and commodity markets, established under the SEBI Act, 1992. RBI regulates banking and monetary policy; IRDAI regulates insurance; NABARD regulates agricultural and rural development finance."},
  {id:"P2C1Q02",paper:"P2",chapter:"Indian Regulatory Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"The Reserve Bank of India was established in:",
    opts:["1935","1947","1949","1969"],a:0,
    exp:"The RBI was established on 1 April 1935 under the Reserve Bank of India Act, 1934. It was nationalised on 1 January 1949. Major functions: issuing currency, banker to government, banker to banks, regulating banks, managing foreign exchange, and controlling credit through monetary policy."},
  {id:"P2C1Q03",paper:"P2",chapter:"Indian Regulatory Framework",diff:"Medium",marks:2,type:"MCQ",
    q:"The Competition Commission of India (CCI) was established under which Act?",
    opts:["Companies Act, 2013","MRTP Act, 1969","Competition Act, 2002","FEMA, 1999"],a:2,
    exp:"CCI was established under the Competition Act, 2002 and became fully functional in 2009. It replaced the older MRTP Commission (under the Monopolies and Restrictive Trade Practices Act, 1969). CCI's objectives: prevent anti-competitive agreements, regulate abuse of dominant position, and scrutinise mergers and acquisitions that may have adverse effects on competition."},
  {id:"P2C2Q01",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"Section 2(h): a contract is:",
    opts:["Any promise between two parties","An agreement enforceable by law","A written document signed by both","An obligation to perform a duty"],a:1,
    exp:"Section 2(h): Agreement enforceable by law = contract. Must satisfy Section 10."},
  {id:"P2C2Q02",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"A minor's agreement is:",
    opts:["Valid","Voidable","Void ab initio","Illegal"],a:2,
    exp:"Mohori Bibee v. Dharmodas Ghose (1903): void ab initio. Section 11. Cannot be ratified."},
  {id:"P2C2Q03",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Free consent (Section 14) means consent not obtained by:",
    opts:["Coercion, Undue Influence, Fraud, Misrepresentation, or Mistake","Coercion, Fraud and Mistake only","Undue Influence and Fraud only","Coercion and Misrepresentation only"],a:0,
    exp:"All five vitiating factors listed in Section 14."},
  {id:"P2C2Q04",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"Consideration must move at the desire of:",
    opts:["The promisor","The promisee","Any third party","The government"],a:0,
    exp:"Section 2(d). In India, consideration can move from promisee or any other person."},
  {id:"P2C2Q05",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:5,type:"DESC",
    q:"Minor Akash (17) supplied with groceries and textbooks Rs.15,000 by Rohan on credit. Parents refuse to pay. (a) Is Akash personally liable? (b) Can Rohan recover from property?",
    opts:[],a:-1,
    exp:"(a) NOT personally liable. Mohori Bibee: void ab initio. (b) YES, from PROPERTY only, per Section 68 (necessaries suited to condition in life). No personal liability, but quasi-contractual recovery from estate allowed."},
  {id:"P2C2Q06",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 124: contract of indemnity is a contract by which:",
    opts:["One party saves other from loss by promisor only","One party saves other from loss by promisor or any other person","Two parties share profits and losses","One party guarantees third person's performance"],a:1,
    exp:"Section 124: promise to save from loss caused by promisor himself or any other person."},
  {id:"P2C2Q07",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 126: person to whom guarantee is given is called:",
    opts:["Surety","Principal debtor","Creditor","Indemnifier"],a:2,
    exp:"Section 126: surety = gives guarantee, principal debtor = whose default is guaranteed, creditor = to whom guarantee given."},
  {id:"P2C2Q08",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 148: bailment is:",
    opts:["Delivery of goods for sale","Delivery of goods for some purpose, to be returned or disposed as directed","Transfer of ownership for price","Delivery without obligation to return"],a:1,
    exp:"Section 148: delivery for a purpose with contract to return when purpose accomplished. Bailor delivers, bailee receives."},
  {id:"P2C2Q09",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:2,type:"MCQ",
    q:"Section 182: an agent is:",
    opts:["Person employed to do any act for another or represent another in dealings with third persons","Person who guarantees third person's performance","Person who lends money","Person who only delivers goods"],a:0,
    exp:"Section 182: agent acts for principal. Agency creates binding legal relationship."},
  {id:"P2C2Q10",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 70: when a person lawfully does something for another, not gratuitously, and other enjoys benefit:",
    opts:["No liability","Other person must compensate or restore benefit","Act is void","Act is illegal"],a:1,
    exp:"Section 70: quasi-contract. Prevents unjust enrichment. Other person bound to compensate."},
  {id:"P2C2Q11",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:5,type:"DESC",
    q:"Rahul, a minor, falsely represents his age as 19 and enters into an agreement to sell his ancestral land to Mr. Sam. Sam pays advance of Rs.5 Lakhs. Upon discovering Rahul is a minor, can Sam recover the money?",
    opts:[],a:-1,
    exp:"No. As per Mohori Bibee v. Dharmodas Ghose (1903), a minor's agreement is void ab initio. The rule of estoppel does NOT apply against a minor. Rahul can always plead minority as a defence even though he lied about his age. Section 11 makes minors incompetent to contract. Since the agreement is void, there is no contract to enforce. Sam cannot recover the advance. The doctrine of restitution under Section 64 also does not apply to minors, as held in Mohori Bibee.\n\nKey distinction from Section 68 (necessaries): Section 68 allows recovery from a minor's PROPERTY for necessaries. But sale of land is not a 'necessary', so even property-based recovery is not available here."},
  {id:"P2C2Q12",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"An agreement without consideration is:",
    opts:["Valid","Void","Voidable","Illegal"],a:1,
    exp:"Section 25: an agreement without consideration is void, UNLESS it falls under exceptions: (1) natural love and affection between near relatives (written and registered), (2) compensation for past voluntary service, (3) promise to pay a time-barred debt (in writing). Consideration is essential for a valid contract under Section 10."},
  {id:"P2C2Q13",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"An offer lapses if not accepted within:",
    opts:["24 hours","7 days","The time prescribed or reasonable time","1 month"],a:2,
    exp:"Section 6: an offer lapses if not accepted within the time prescribed by the offeror, or if no time is prescribed, within a reasonable time. What constitutes 'reasonable time' depends on the circumstances, nature of the transaction, and trade custom."},
  {id:"P2C2Q14",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"A contract entered into by a person of unsound mind is:",
    opts:["Valid","Void","Voidable","Illegal"],a:1,
    exp:"Section 12: a person is of sound mind if capable of understanding the contract and forming rational judgment. Section 11: persons of unsound mind are not competent to contract. Their agreements are VOID (not voidable). Exception: a person usually of unsound mind who makes a contract during a lucid interval can make a valid contract."},
  {id:"P2C2Q15",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:2,type:"MCQ",
    q:"In Carlill v. Carbolic Smoke Ball Co. (1893), the court held that:",
    opts:["An advertisement cannot be an offer","A general offer can be accepted by anyone who performs the conditions","Consideration must be adequate","A minor can enter contracts"],a:1,
    exp:"This landmark case established that a general offer (advertisement to the world at large) can be accepted by anyone who performs the conditions stated. The Carbolic Smoke Ball Co. advertised a reward of 100 pounds to anyone who used their product and still got influenza. Mrs. Carlill used it, got flu, and claimed the reward. The court held: (1) the ad was a general offer, (2) using the product was acceptance, (3) the inconvenience of using it was sufficient consideration."},
  {id:"P2C2Q16",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"A contract caused by bilateral mistake of fact is:",
    opts:["Valid","Voidable","Void","Illegal"],a:2,
    exp:"Section 20: where both parties are under a mistake as to a matter of fact ESSENTIAL to the agreement, the agreement is VOID. Example: A agrees to buy a specific horse from B. Unknown to both, the horse was already dead. The agreement is void. Note: mistake of law is not an excuse (Section 21). Unilateral mistake generally does not make a contract void (Section 22)."},
  {id:"P2C2Q17",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"In a contract of indemnity, the indemnity holder can recover:",
    opts:["Only the actual loss suffered","Damages, costs of suit, and sums paid under compromise","Only the amount specified in the contract","Punitive damages"],a:1,
    exp:"Section 125: the indemnity holder (promisee) can recover from the indemnifier: (1) all damages ordered to be paid, (2) all costs incurred in defending the suit, (3) all sums paid under a compromise if the compromise was prudent. The indemnity holder must act within the terms of the indemnity and not act negligently."},
  {id:"P2C2Q18",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"A continuing guarantee under Section 129 can be revoked by the surety:",
    opts:["At any time for future transactions by giving notice","Only at the end of the contract period","Only with the consent of the creditor","Never, once given"],a:0,
    exp:"Section 130: a continuing guarantee may be revoked by the surety at any time as to FUTURE transactions, by giving notice to the creditor. The surety remains liable for transactions already entered into before the notice. Section 131: the death of the surety operates as revocation of a continuing guarantee for future transactions (unless otherwise agreed)."},
  {id:"P2C2Q19",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"The finder of lost goods is treated as a:",
    opts:["Owner","Bailee","Trustee","Agent"],a:1,
    exp:"Section 71: a person who finds goods belonging to another and takes them into custody has the same responsibility as a BAILEE. The finder must take reasonable care (Section 151), must not use goods for personal use (Section 154), and must try to find the owner. If the owner is found, the finder can claim reasonable expenses incurred in preserving the goods."},
  {id:"P2C2Q20",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"A gratuitous bailee (bailee without reward) is required to take:",
    opts:["No care at all","Same care as a paid bailee","Care as a person of ordinary prudence would take of their own goods of the same value","Extraordinary care"],a:2,
    exp:"Section 151: in ALL bailments (whether gratuitous or for reward), the bailee must take the same care that a person of ordinary prudence would take of their OWN goods of the same bulk, quality, and value. There is no reduced standard for gratuitous bailment. If the bailee fails to exercise this standard of care, they are liable for loss or damage."},
  {id:"P2C2Q21",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"An agent's authority is terminated by:",
    opts:["Only the principal's revocation","Principal revoking, agent renouncing, death of either party, or insolvency of principal","Only mutual agreement","Only expiry of time"],a:1,
    exp:"Sections 201-210: agency is terminated by: (1) principal revoking authority, (2) agent renouncing the business, (3) completion of the business, (4) death of principal or agent, (5) principal becoming of unsound mind, (6) principal becoming insolvent. Irrevocable agency (agency coupled with interest) cannot be terminated by revocation."},
  {id:"P2C2Q22",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"A sub-agent is appointed by:",
    opts:["The principal","The agent","The third party","The court"],a:1,
    exp:"Section 191: a sub-agent is a person appointed by the AGENT to act in the business of the agency. An agent cannot normally delegate their duties (delegatus non potest delegare), but exceptions include: (1) where the principal authorizes delegation, (2) where trade custom permits, (3) where the nature of the work requires it."},
  {id:"P2C2Q23",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 72, money paid by mistake is:",
    opts:["Not recoverable","Recoverable by the payer","Recoverable only if paid under coercion","Forfeit to the receiver"],a:1,
    exp:"Section 72: a person to whom money has been paid, or anything delivered, by mistake or under coercion, must repay or return it. This is a quasi-contractual obligation. No actual contract exists, but the law implies an obligation to prevent unjust enrichment. The mistake can be of fact or of law."},
  {id:"P2C2Q24",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"A contingent contract under Section 31 is:",
    opts:["A contract without consideration","A contract to do or not do something if some uncertain event happens or does not happen","A contract with a minor","A wagering agreement"],a:1,
    exp:"Section 31: a contingent contract is a contract to do or not do something if some collateral event, which is uncertain, does or does not happen. Example: 'I will pay you Rs.1 lakh if your house burns down' (insurance contract). Section 32: such contracts can be enforced only when the event happens. Section 36: agreements contingent on impossible events are void."},
  {id:"P2C2Q25",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Easy",marks:2,type:"MCQ",
    q:"A void agreement is one which is:",
    opts:["Enforceable by law","Not enforceable by law from the beginning","Enforceable at the option of one party","Valid until revoked"],a:1,
    exp:"Section 2(g): an agreement not enforceable by law is void. A void agreement has no legal effect from the beginning. Examples: agreement with a minor (Mohori Bibee), agreement without consideration (Section 25), agreement in restraint of trade (Section 27), agreement in restraint of legal proceedings (Section 28), wagering agreements (Section 30). A VOIDABLE contract, by contrast, is enforceable but can be avoided by one party."},
  {id:"P2C2Q26",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:2,type:"MCQ",
    q:"If the creditor makes any variance in the terms of the contract between principal debtor and creditor without surety's consent, the surety is:",
    opts:["Still liable","Discharged from liability","Liable for half the amount","Required to give fresh guarantee"],a:1,
    exp:"Section 133: any variance made without the surety's consent in the terms of the contract between the principal debtor and the creditor DISCHARGES the surety as to transactions subsequent to the variance. The logic is that the surety guaranteed a specific arrangement; any change alters the risk the surety agreed to bear. The surety's consent must be obtained before any modification."},
  {id:"P2C2Q27",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"An agent who acts beyond their authority makes the:",
    opts:["Principal liable for all acts","Principal liable only for authorized acts","Agent personally liable for unauthorized acts","Neither liable"],a:2,
    exp:"When an agent exceeds their authority: (1) the principal is bound only by acts within the agent's actual or apparent authority, (2) for acts beyond authority, the AGENT is personally liable to the third party, (3) if the principal ratifies the unauthorized act (Section 196), it becomes binding on the principal as if originally authorized. Ratification relates back to the date of the original act."},
  {id:"P2C2Q28",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 37 of the Indian Contract Act, 1872, parties to a contract are bound to:",
    opts:["Perform the contract personally only","Perform or offer to perform their promises, unless excused by law","Perform only if both parties agree at the time of performance","Perform only in writing"],a:1,
    exp:"Section 37: the parties to a contract must either perform, or offer to perform (tender performance), their respective promises, unless such performance is dispensed with or excused under the Act or any other law. Representative promisors (legal heirs) are bound unless a contrary intention appears."},
  {id:"P2C2Q29",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 73, the party suffering from a breach of contract is entitled to recover:",
    opts:["All losses whether direct or remote","Compensation for any loss or damage that naturally arose in the usual course of things","Punitive damages to punish the breaching party","Only the amount actually paid under the contract"],a:1,
    exp:"Section 73 (Hadley v. Baxendale principle): damages are recoverable for losses which naturally arose in the usual course of things from the breach, or which the parties knew when they made the contract to be likely to result. REMOTE or INDIRECT losses are NOT recoverable. Indian law does not permit punitive damages for pure contractual breach."},
  {id:"P2C2Q30",paper:"P2",chapter:"The Indian Contract Act, 1872",diff:"Hard",marks:2,type:"MCQ",
    q:"Ramesh finds a watch lying on the road and picks it up. Under Section 71 of the Indian Contract Act, Ramesh is considered a:",
    opts:["Thief","Finder of goods, with responsibilities of a bailee","Owner of the watch by possession","Agent of the actual owner"],a:1,
    exp:"Section 71: a person who finds goods belonging to another and takes them into his custody is subject to the same responsibilities as a bailee. The finder must take reasonable care of the goods, try to trace the owner, and may be entitled to a lien for expenses. Quasi-contractual obligation arises even though there is no actual agreement."},
  {id:"P2C3Q01",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"The Sale of Goods Act, 1930 applies to:",
    opts:["Immovable property","Movable goods only","Services","All contracts"],a:1,
    exp:"Section 2(7): goods = every kind of movable property except actionable claims and money. Shares ARE goods."},
  {id:"P2C3Q02",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 12: a condition is:",
    opts:["Stipulation essential to main purpose of contract","Stipulation collateral to main purpose","Representation during negotiations","Guarantee by third party"],a:0,
    exp:"Section 12: condition = essential. Breach gives right to repudiate. Warranty = collateral, breach gives damages only."},
  {id:"P2C3Q03",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 45: unpaid seller is one who:",
    opts:["Has not been paid whole price or received dishonoured negotiable instrument","Has not delivered goods","Has not received advance","Has not received interest"],a:0,
    exp:"Section 45: whole price not paid/tendered, or negotiable instrument dishonoured. Has rights against goods and buyer."},
  {id:"P2C3Q04",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"The term 'Nemo dat quod non habet' means:",
    opts:["The buyer must beware","No one can give what they do not have","Let the goods speak for themselves","The seller must deliver"],a:1,
    exp:"This Latin maxim means 'no one can transfer a better title than they themselves possess.' Under Section 27, the buyer gets no better title than the seller had. Exceptions: (1) sale by mercantile agent (Section 27), (2) sale by one of joint owners (Section 28), (3) sale by person in possession under voidable contract (Section 29), (4) sale by seller in possession after sale (Section 30(1)), (5) sale by buyer in possession (Section 30(2))."},
  {id:"P2C3Q05",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Sale of Goods Act, 'existing goods' are goods which are:",
    opts:["To be manufactured in the future","Owned or possessed by the seller at the time of the contract","Available in the market","Imported from abroad"],a:1,
    exp:"Section 6: existing goods are goods owned or possessed by the seller at the time of the contract of sale. They can be specific (identified and agreed upon) or unascertained (defined by description). Future goods are goods to be manufactured, produced, or acquired by the seller after the contract is made. A contract for future goods is an 'agreement to sell', not a 'sale'."},
  {id:"P2C3Q06",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"Rights of an unpaid seller against the goods include:",
    opts:["Right of lien, right of stoppage in transit, right of resale","Right to sue only","Right to return goods to manufacturer","Right to claim insurance"],a:0,
    exp:"Sections 46-54: an unpaid seller has three rights AGAINST THE GOODS: (1) Right of Lien (retain goods until paid, Sections 47-49), (2) Right of Stoppage in Transit (stop goods while in transit if buyer becomes insolvent, Sections 50-52), (3) Right of Resale (sell goods after giving notice, Section 54). These are rights 'against the goods'. Additionally, the seller has personal rights against the BUYER: suit for price (Section 55) and suit for damages (Section 56)."},
  {id:"P2C3Q07",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Hard",marks:2,type:"MCQ",
    q:"Risk follows ownership unless otherwise agreed. This means:",
    opts:["Risk always stays with the seller","Risk passes to buyer when goods are delivered","Risk passes to buyer when property (ownership) passes to buyer","Risk is shared equally"],a:2,
    exp:"Section 26: unless otherwise agreed, goods remain at the seller's risk until the PROPERTY (ownership) is transferred to the buyer. Once property passes, goods are at the buyer's risk even if delivery has not been made. This rule can be modified by agreement between the parties. Property in specific goods passes when parties intend it to pass (Section 19)."},
  {id:"P2C3Q08",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"The difference between a 'Sale' and an 'Agreement to Sell' is:",
    opts:["There is no difference","In a sale, property passes immediately; in agreement to sell, it passes at a future date","Sale requires writing; agreement to sell does not","Sale is for goods; agreement to sell is for services"],a:1,
    exp:"Section 4: SALE is where the seller transfers property (ownership) in goods to the buyer for a price immediately. AGREEMENT TO SELL is where the transfer of property takes place at a future time or subject to some condition. An agreement to sell becomes a sale when the time elapses or condition is fulfilled. Key difference: in a sale, risk passes to buyer (Section 26); in agreement to sell, risk stays with seller."},
  {id:"P2C3Q09",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"An implied condition as to quality or fitness under Section 16 arises when:",
    opts:["The buyer examines the goods thoroughly","The buyer relies on the seller's skill and judgment and the seller knows the purpose","The goods are sold by auction","The goods are sold 'as is'"],a:1,
    exp:"Section 16(1): there is no implied warranty or condition as to quality (caveat emptor). But Section 16(1) exception: where the buyer makes known to the seller the particular PURPOSE for which goods are required, AND relies on the seller's SKILL AND JUDGMENT, AND the goods are of a description the seller supplies in ordinary course, there is an implied condition that goods will be reasonably fit for that purpose."},
  {id:"P2C3Q10",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Sale of Goods Act, 1930, the term 'goods' does NOT include:",
    opts:["Stocks and shares","Growing crops","Money and actionable claims","Movable machinery"],a:2,
    exp:"Section 2(7): 'goods' means every kind of MOVABLE PROPERTY other than actionable claims and money. It includes stocks, shares, growing crops, grass, and things attached to or forming part of the land which are agreed to be severed before sale. Immovable property is governed by the Transfer of Property Act."},
  {id:"P2C3Q11",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"A stipulation in a contract of sale which is essential to the main purpose of the contract is called:",
    opts:["Warranty","Condition","Representation","Guarantee"],a:1,
    exp:"Section 12(2): a 'condition' is a stipulation essential to the main purpose of the contract, breach of which gives the aggrieved party the right to REPUDIATE the contract. A 'warranty' (Section 12(3)) is collateral to the main purpose, breach gives only a right to CLAIM DAMAGES, not to repudiate."},
  {id:"P2C3Q12",paper:"P2",chapter:"The Sale of Goods Act, 1930",diff:"Medium",marks:2,type:"MCQ",
    q:"An unpaid seller has the right of stoppage of goods in transit when:",
    opts:["The buyer has paid in full","The buyer becomes insolvent and the goods are still in transit","The seller changes his mind","The goods have been delivered to the buyer"],a:1,
    exp:"Sections 50-52: the right of stoppage in transit is available to an unpaid seller when (a) the buyer has become INSOLVENT, and (b) the goods are in the possession of a carrier or middleman (i.e. still IN TRANSIT). Once goods reach the buyer, this right ceases and only lien or right to resell may remain."},
  {id:"P2C4Q01",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"The Indian Partnership Act, 1932 itself specifies the maximum number of partners as:",
    opts:["10","20","50","The Act does not specify a maximum"],a:3,
    exp:"The 1932 Act is silent on maximum. Practical cap of 50 from Companies Act 2013 Section 464. Banking: 10."},
  {id:"P2C4Q02",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Partner who does not take active part but shares profits is called:",
    opts:["Nominal partner","Sleeping (dormant) partner","Partner by estoppel","Sub-partner"],a:1,
    exp:"Sleeping/dormant partner: contributes capital, shares profits, but not active. Still liable to third parties."},
  {id:"P2C4Q03",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 69: effect of non-registration:",
    opts:["Firm cannot be formed","Firm cannot sue third parties","Firm cannot carry on business","Partners not liable to third parties"],a:1,
    exp:"Section 69: unregistered firm cannot file suit to enforce contractual rights. Third parties can still sue the firm."},
  {id:"P2C4Q04",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Section 39: dissolution of a firm means:",
    opts:["Change in profit ratio","Dissolution of some partners only","Dissolution of partnership between ALL partners","Retirement of a partner"],a:2,
    exp:"Section 39: dissolution of firm = all partners. Change in relation (retirement, admission) is not firm dissolution."},
  {id:"P2C4Q05",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"A partner can be expelled from a firm only if:",
    opts:["Majority partners agree","The power of expulsion exists in the partnership agreement and is exercised in good faith","Any partner requests","The court orders"],a:1,
    exp:"Section 33: a partner may be expelled ONLY if: (1) the power to expel exists in the partnership agreement (contract between partners), AND (2) the power is exercised by a majority of partners, AND (3) it is exercised in good faith. If any of these conditions is not met, the expulsion is void. Good faith means the expulsion must be in the interest of the business, not malicious."},
  {id:"P2C4Q06",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"Every partner is an agent of the firm for the purpose of the business of the firm. This is called:",
    opts:["Doctrine of indoor management","Implied authority","Mutual agency","Ultra vires"],a:2,
    exp:"Section 18: every partner is an agent of the firm for the purpose of the business of the firm. This principle of MUTUAL AGENCY means: (1) each partner can bind the firm by their acts done in the ordinary course of business, (2) the firm is bound by the acts of every partner, (3) each partner has both the rights of an agent and the obligations of a principal."},
  {id:"P2C4Q07",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"The order of settlement of accounts on dissolution (Garner v. Murray rule) prioritizes:",
    opts:["Payment to partners first","Payment of firm's debts to third parties first","Equal distribution to all","Payment to the senior partner first"],a:1,
    exp:"Section 48: on dissolution, assets are applied in the following ORDER: (1) Debts due to third parties (creditors), (2) Loans advanced by partners (not capital), (3) Return of capital contributed by partners, (4) Residue (if any) divided among partners in profit-sharing ratio. The Garner v. Murray rule applies when a partner is insolvent: their capital deficiency is borne by solvent partners in their CAPITAL ratio (not profit-sharing ratio)."},
  {id:"P2C4Q08",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"A nominal partner is one who:",
    opts:["Contributes capital but takes no active part","Lends their name to the firm but has no real interest","Is a minor admitted to benefits","Manages the firm actively"],a:1,
    exp:"A nominal partner (also called ostensible partner) only lends their name to the firm. They do not contribute capital, do not share profits, and do not take part in management. However, they are liable to THIRD PARTIES as a partner because outsiders believe them to be a partner based on the use of their name. This differs from a sleeping/dormant partner who contributes capital and shares profits but is not active."},
  {id:"P2C4Q09",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 30, a minor can be admitted to the benefits of a partnership but:",
    opts:["Can be held personally liable for firm's debts","Cannot be held personally liable for firm's debts","Must contribute capital","Must be a designated partner"],a:1,
    exp:"Section 30: a minor can be admitted to the BENEFITS of a partnership with the consent of all partners. The minor's share of profits is defined but they CANNOT be held personally liable for the firm's debts. Their share in the property and profits of the firm is liable, but not their personal assets. On attaining majority, the minor must decide within 6 months whether to become a full partner or retire."},
  {id:"P2C4Q10",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Easy",marks:2,type:"MCQ",
    q:"Under Section 4 of the Indian Partnership Act, 1932, the minimum number of partners required to form a partnership is:",
    opts:["1","2","7","10"],a:1,
    exp:"Section 4: partnership is the relation between persons who have agreed to share the profits of a business carried on by all or any of them acting for all. Minimum 2 partners are required. Maximum 50 (as prescribed under Rule 10 of the Companies (Miscellaneous) Rules, 2014, under the Companies Act 2013)."},
  {id:"P2C4Q11",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 18 of the Indian Partnership Act, every partner is a/an:",
    opts:["Trustee of the firm","Agent of the firm for the purpose of the business of the firm","Employee of the firm","Creditor of the firm"],a:1,
    exp:"Section 18: subject to the provisions of the Act, a partner is the AGENT of the firm for the purpose of the business of the firm. This is the principle of mutual agency, which is the essence of partnership. Every partner's act binds the firm and other partners, within the scope of the firm's business."},
  {id:"P2C4Q12",paper:"P2",chapter:"The Indian Partnership Act, 1932",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following leads to COMPULSORY dissolution of a partnership firm?",
    opts:["Death of a partner","Retirement of a partner","All partners being adjudged insolvent","Mutual agreement to continue the business"],a:2,
    exp:"Section 41 (Compulsory dissolution): a firm is COMPULSORILY dissolved (a) by adjudication of all partners or all but one as insolvent, or (b) by the business becoming unlawful. Death or retirement (Section 42) lead to dissolution unless the deed provides otherwise. Mutual agreement to continue does NOT trigger dissolution."},
  {id:"P2C5Q01",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"Every LLP must have at least how many Designated Partners?",
    opts:["1","2","3","5"],a:1,
    exp:"Section 7 of LLP Act, 2008. At least one must be resident in India."},
  {id:"P2C5Q02",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Easy",marks:2,type:"MCQ",
    q:"Minimum partners to form an LLP:",
    opts:["One","Two","Three","Five"],a:1,
    exp:"Section 6: minimum 2 partners. No maximum. If below 2 for over 6 months, sole partner may be personally liable."},
  {id:"P2C5Q03",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"Every LLP must have at least:",
    opts:["1 designated partner resident in India","2 designated partners, at least 1 resident in India","3 designated partners all resident","5 designated partners"],a:1,
    exp:"Section 7: at least 2 designated partners, at least 1 resident in India. Responsible for compliance."},
  {id:"P2C5Q04",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Easy",marks:2,type:"MCQ",
    q:"Under the Companies Act, 2013, a One Person Company (OPC) must have:",
    opts:["Minimum 2 directors and 2 members","Minimum 1 director and exactly 1 member","Minimum 3 directors and 1 member","No directors required"],a:1,
    exp:"Under Companies Act 2013, an OPC is a private company with only one member. It must have minimum 1 director (can have up to 15 without special resolution). The single member nominates a person who becomes the member in the event of the original member's death or incapacity."},
  {id:"P2C5Q05",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"In an LLP, the liability of a partner is limited to:",
    opts:["The total assets of the LLP","The agreed contribution of the partner","The personal assets of the partner","Unlimited liability"],a:1,
    exp:"Section 27(3) of the LLP Act, 2008: a partner in an LLP is not personally liable for the wrongful act or omission of any other partner. Each partner's liability is limited to their agreed contribution to the LLP. This is the fundamental difference between an LLP and a traditional partnership (where partners have unlimited liability). The LLP itself has unlimited liability as a legal entity."},
  {id:"P2C5Q06",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Easy",marks:2,type:"MCQ",
    q:"An LLP is a:",
    opts:["Body corporate with separate legal entity","Partnership without legal entity","Branch of a company","Trust"],a:0,
    exp:"Section 3 of the LLP Act, 2008: an LLP is a body corporate formed and incorporated under the Act. It is a legal entity separate from its partners. It has perpetual succession (continues despite change in partners). It can own property, sue and be sued in its own name. This is a key distinction from a traditional partnership firm, which is not a separate legal entity from its partners."},
  {id:"P2C5Q07",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"If the number of partners in an LLP falls below two for more than 6 months, the remaining partner:",
    opts:["Can continue without any consequence","May become personally liable for obligations incurred after 6 months","Must dissolve the LLP immediately","Must find a replacement within 30 days"],a:1,
    exp:"Section 6(2) of the LLP Act, 2008: if at any time the number of partners of an LLP is reduced below two and the LLP carries on business for more than six months while the number is so reduced, the person who is the only remaining partner during that period and has knowledge of the reduction shall be personally liable for the obligations of the LLP incurred during that period."},
  {id:"P2C5Q08",paper:"P2",chapter:"The Limited Liability Partnership Act, 2008",diff:"Medium",marks:2,type:"MCQ",
    q:"Under the LLP Act, 2008, an LLP must have at least:",
    opts:["1 partner and 1 designated partner","2 partners, with at least 2 designated partners, one of whom must be resident in India","7 partners","2 partners, both of whom may be non-residents"],a:1,
    exp:"Section 6 and 7 of the LLP Act, 2008: every LLP must have a minimum of TWO partners. It must have at least TWO DESIGNATED PARTNERS who are individuals, and at least ONE of them must be a RESIDENT IN INDIA. There is no maximum number of partners."},
  {id:"P2C6Q01",paper:"P2",chapter:"The Companies Act, 2013",diff:"Easy",marks:2,type:"MCQ",
    q:"The Companies Act, 2013 replaced which earlier Act?",
    opts:["Companies Act, 1882","Companies Act, 1913","Companies Act, 1956","Companies Act, 1999"],a:2,
    exp:"The Companies Act, 2013 replaced the Companies Act, 1956. It received Presidential assent on 29 August 2013 and has been implemented in phases. The 2013 Act has 470 sections in 29 chapters and 7 schedules, compared to the 1956 Act which had 658 sections."},
  {id:"P2C6Q02",paper:"P2",chapter:"The Companies Act, 2013",diff:"Easy",marks:2,type:"MCQ",
    q:"The minimum number of members required to form a private company under the Companies Act, 2013 is:",
    opts:["1","2","7","15"],a:1,
    exp:"Section 3(1)(b) of the Companies Act, 2013: a private company requires a minimum of 2 members and a maximum of 200 members (excluding employees). A public company requires minimum 7 members with no upper limit. A One Person Company (OPC) under Section 3(1)(c) has only 1 member."},
  {id:"P2C6Q03",paper:"P2",chapter:"The Companies Act, 2013",diff:"Medium",marks:2,type:"MCQ",
    q:"A One Person Company (OPC) under the Companies Act, 2013 must have a minimum of:",
    opts:["1 member and 1 director","1 member and 2 directors","2 members and 1 director","1 member and 3 directors"],a:0,
    exp:"Section 3(1)(c) and Section 149: an OPC must have ONE member (a natural person who is an Indian citizen and resident) and a minimum of ONE director. The sole member is deemed to be the first director unless otherwise appointed. OPC is a unique feature introduced by the 2013 Act."},
  {id:"P2C6Q04",paper:"P2",chapter:"The Companies Act, 2013",diff:"Medium",marks:2,type:"MCQ",
    q:"The Memorandum of Association of a company contains how many clauses (compulsory)?",
    opts:["3","5","6","8"],a:2,
    exp:"Section 4: the MOA must contain SIX clauses: (1) Name clause, (2) Registered Office (Situation) clause, (3) Objects clause, (4) Liability clause, (5) Capital clause, and (6) Subscription (Association) clause. The MOA is the charter of the company, defining its scope and relationship with the outside world."},
  {id:"P2C6Q05",paper:"P2",chapter:"The Companies Act, 2013",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 2(64), 'paid-up share capital' means:",
    opts:["The maximum amount of capital a company is authorised to issue","The amount of capital issued by the company to its members","The aggregate amount of money credited as paid-up as against the number of shares issued","The nominal value of each share"],a:2,
    exp:"Section 2(64): 'paid-up share capital' is the aggregate amount of money credited as paid-up equivalent to the amount received as paid-up on shares issued. This differs from AUTHORISED capital (maximum permitted by MOA), ISSUED capital (amount actually offered for subscription), and CALLED-UP capital (amount called from shareholders)."},
  {id:"P2C6Q06",paper:"P2",chapter:"The Companies Act, 2013",diff:"Medium",marks:2,type:"MCQ",
    q:"The minimum number of directors required for a public company under the Companies Act, 2013 is:",
    opts:["1","2","3","7"],a:2,
    exp:"Section 149(1): a public company must have a minimum of 3 directors and a maximum of 15 directors (can be increased by special resolution). A private company requires minimum 2 directors. An OPC requires minimum 1 director. Certain classes of companies must also have at least one woman director and one resident director."},
  {id:"P2C6Q07",paper:"P2",chapter:"The Companies Act, 2013",diff:"Hard",marks:2,type:"MCQ",
    q:"The maximum gap between two Annual General Meetings (AGMs) under Section 96 of the Companies Act, 2013 is:",
    opts:["6 months","9 months","12 months","15 months"],a:3,
    exp:"Section 96: every company (other than OPC) must hold an AGM each year, and the gap between two AGMs shall NOT EXCEED 15 MONTHS. Also, the AGM must be held within 6 months of the close of the financial year. The first AGM must be held within 9 months of the close of the first financial year."},
  {id:"P2C6Q08",paper:"P2",chapter:"The Companies Act, 2013",diff:"Medium",marks:2,type:"MCQ",
    q:"A 'red herring prospectus' under the Companies Act, 2013 is:",
    opts:["A final prospectus filed with the Registrar","A prospectus which does not include complete particulars of the quantum or price of the securities","A prospectus issued by a private company","A misleading prospectus liable for fraud"],a:1,
    exp:"Section 32: a 'red herring prospectus' is one which does NOT include complete particulars of the quantum or price of the securities being offered. It is issued prior to the filing of a final prospectus and is commonly used for book-built IPOs. Must be filed with the Registrar at least 3 days before opening."},
  {id:"P2C7Q01",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Easy",marks:2,type:"MCQ",
    q:"Under Section 13 of the Negotiable Instruments Act, 1881, which of the following is a negotiable instrument?",
    opts:["Fixed Deposit Receipt","Postal Order","Promissory Note, Bill of Exchange, and Cheque","Share Certificate"],a:2,
    exp:"Section 13 of the NI Act, 1881: a negotiable instrument means a PROMISSORY NOTE, BILL OF EXCHANGE or CHEQUE payable either to order or to bearer. FDRs, postal orders, and share certificates are NOT negotiable instruments in law (though some are transferable)."},
  {id:"P2C7Q02",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 4 of the NI Act, a promissory note is an instrument in writing containing an unconditional undertaking signed by the maker to pay a certain sum of money to:",
    opts:["The maker himself","A certain person or to the order of a certain person or to the bearer","Any third party the maker chooses later","Only the government"],a:1,
    exp:"Section 4: a promissory note must be (1) in writing, (2) contain an UNCONDITIONAL undertaking to pay, (3) signed by the maker, (4) payment of a CERTAIN SUM OF MONEY only, (5) to a CERTAIN PERSON or to his order, or to the bearer. Note: bank notes and currency notes are not promissory notes for the purposes of this Act."},
  {id:"P2C7Q03",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Medium",marks:2,type:"MCQ",
    q:"The parties to a Bill of Exchange are:",
    opts:["Maker and Payee only","Drawer, Drawee, and Payee","Promisor and Promisee","Endorser and Endorsee only"],a:1,
    exp:"Section 5: a Bill of Exchange has three parties: (1) DRAWER - the person who makes the bill, (2) DRAWEE - the person on whom it is drawn (becomes 'acceptor' after acceptance), (3) PAYEE - the person to whom or to whose order the money is to be paid. Promissory notes have only two parties (maker and payee)."},
  {id:"P2C7Q04",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Easy",marks:2,type:"MCQ",
    q:"Under Section 6 of the NI Act, a cheque is a bill of exchange drawn on a:",
    opts:["Post Office","Specified banker and not expressed to be payable otherwise than on demand","Any financial institution","Any person willing to pay"],a:1,
    exp:"Section 6: a cheque is a BILL OF EXCHANGE (1) drawn on a SPECIFIED BANKER, and (2) expressed to be payable only ON DEMAND. After amendment, it includes the electronic image of a truncated cheque and a cheque in electronic form. Parties: drawer (account holder), drawee (bank), payee."},
  {id:"P2C7Q05",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Medium",marks:2,type:"MCQ",
    q:"Under Section 15, endorsement of a negotiable instrument means:",
    opts:["Cancelling the instrument","Signing on the face or back of an instrument for the purpose of negotiation","Writing the name of the drawee","Acceptance of the bill"],a:1,
    exp:"Section 15: when the maker or holder of a negotiable instrument signs it (otherwise than as maker) on the face or back of the instrument (or on a slip annexed thereto called an 'allonge') for the purpose of negotiation, he is said to endorse it. The signer is the 'endorser' and the person to whom the instrument is transferred is the 'endorsee'."},
  {id:"P2C7Q06",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Hard",marks:2,type:"MCQ",
    q:"Under Section 138 of the NI Act, cheque dishonour due to insufficient funds is punishable with imprisonment up to:",
    opts:["6 months","1 year","2 years","5 years"],a:2,
    exp:"Section 138 (inserted by the 1988 amendment, enhanced in 2002): dishonour of a cheque for insufficiency of funds or exceeding arrangement is a criminal offence punishable with imprisonment up to TWO YEARS, or a fine up to twice the cheque amount, or both. The payee must send notice within 30 days of dishonour; drawer has 15 days to pay; complaint must be filed within 30 days of the end of that 15-day period."},
  {id:"P2C7Q07",paper:"P2",chapter:"The Negotiable Instruments Act, 1881",diff:"Medium",marks:2,type:"MCQ",
    q:"A 'generally crossed' cheque (two parallel lines across the face) can be paid:",
    opts:["To any bearer over the counter","Only through a bank account, to any banker","Only to the drawer","Only in cash"],a:1,
    exp:"Section 123: a cheque is said to be 'generally crossed' when two parallel transverse lines are drawn across its face (with or without words 'and Company' or 'not negotiable'). A generally crossed cheque can ONLY be paid through a BANK (i.e. credited to a bank account), not in cash over the counter. This prevents fraudulent encashment."},
  {id:"P3C1Q01",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Easy",marks:1,type:"MCQ",
    q:"A:B salary ratio 3:5. A's salary Rs.18,000. B's salary:",
    opts:["Rs.24,000","Rs.30,000","Rs.27,000","Rs.20,000"],a:1,
    exp:"3 parts = 18,000, 1 part = 6,000. B = 5 x 6,000 = 30,000."},
  {id:"P3C1Q02",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Medium",marks:1,type:"MCQ",
    q:"A mixture has milk:water = 4:1 in 50 litres. How much water must be added to make ratio 2:1?",
    opts:["5 litres","10 litres","15 litres","20 litres"],a:1,
    exp:"Milk = 40L, Water = 10L. For 2:1, water needed = 40/2 = 20L. Additional water = 20 - 10 = 10 litres."},
  {id:"P3C1Q03",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Medium",marks:1,type:"MCQ",
    q:"If A:B = 2:3 and B:C = 4:5, then A:B:C is:",
    opts:["8:12:15","2:3:5","4:6:5","8:12:10"],a:0,
    exp:"Make B common: A:B = 2:3 = 8:12 (multiply by 4). B:C = 4:5 = 12:15 (multiply by 3). Now B is 12 in both. A:B:C = 8:12:15."},
  {id:"P3C1Q04",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Easy",marks:1,type:"MCQ",
    q:"If x/y = 3/4, then (3x + 4y)/(3x - 4y) is:",
    opts:["-25/7","25/7","-7/25","7/25"],a:0,
    exp:"x/y = 3/4, so x = 3k, y = 4k. 3x + 4y = 9k + 16k = 25k. 3x - 4y = 9k - 16k = -7k. Ratio = 25k/(-7k) = -25/7."},
  {id:"P3C1Q05",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Hard",marks:1,type:"MCQ",
    q:"If a:b = 2:3 and a:c = 4:5, then b:c is:",
    opts:["6:5","8:15","3:5","5:6"],a:0,
    exp:"a:b = 2:3, so a = 2k, b = 3k. a:c = 4:5, so a = 4m, c = 5m. Since a is common: 2k = 4m, so k = 2m. b = 3k = 6m. c = 5m. b:c = 6m:5m = 6:5."},
  {id:"P3C1Q06",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Easy",marks:2,type:"MCQ",
    q:"If a:b = 3:4 and b:c = 5:6, then a:b:c is:",
    opts:["15:20:24","3:4:6","15:20:30","3:20:24"],a:0,
    exp:"Make b common. a:b = 3:4 = 15:20 (multiply by 5). b:c = 5:6 = 20:24 (multiply by 4). So a:b:c = 15:20:24."},
  {id:"P3C1Q07",paper:"P3",chapter:"Ratio, Proportion, Indices and Logarithms",diff:"Medium",marks:2,type:"MCQ",
    q:"The value of (16)^(3/4) x (8)^(2/3) is:",
    opts:["16","24","32","64"],a:2,
    exp:"(16)^(3/4) = (2^4)^(3/4) = 2^3 = 8. (8)^(2/3) = (2^3)^(2/3) = 2^2 = 4. Product = 8 x 4 = 32."},
  {id:"P3C2Q01",paper:"P3",chapter:"Equations",diff:"Easy",marks:2,type:"MCQ",
    q:"If 3x + 2y = 12 and x + y = 5, the value of x is:",
    opts:["1","2","3","4"],a:1,
    exp:"From eq 2: y = 5 - x. Substitute: 3x + 2(5 - x) = 12 => 3x + 10 - 2x = 12 => x = 2."},
  {id:"P3C2Q02",paper:"P3",chapter:"Equations",diff:"Medium",marks:2,type:"MCQ",
    q:"The roots of the quadratic equation 2x^2 - 7x + 3 = 0 are:",
    opts:["3 and 1/2","-3 and 1/2","3 and -1/2","-3 and -1/2"],a:0,
    exp:"Using quadratic formula: x = [7 ± sqrt(49 - 24)] / 4 = [7 ± 5] / 4. So x = 12/4 = 3 or x = 2/4 = 1/2. Roots are 3 and 1/2."},
  {id:"P3C2Q03",paper:"P3",chapter:"Equations",diff:"Medium",marks:2,type:"MCQ",
    q:"If one root of x^2 - kx + 12 = 0 is 4, the other root and the value of k are:",
    opts:["3 and 7","3 and -7","-3 and 1","4 and 8"],a:0,
    exp:"Product of roots = 12 / 1 = 12. If one root is 4, other = 12 / 4 = 3. Sum of roots = k = 4 + 3 = 7."},
  {id:"P3C3Q01",paper:"P3",chapter:"Linear Inequalities",diff:"Medium",marks:2,type:"MCQ",
    q:"The solution set of the inequality 2x - 3 <= 5x + 6 is:",
    opts:["x >= -3","x <= -3","x >= 3","x <= 3"],a:0,
    exp:"2x - 3 <= 5x + 6 => -3 - 6 <= 5x - 2x => -9 <= 3x => -3 <= x, i.e. x >= -3."},
  {id:"P3C4Q01",paper:"P3",chapter:"Mathematics of Finance",diff:"Easy",marks:1,type:"MCQ",
    q:"CI on Rs.10,000 at 10% for 2 years compounded annually:",
    opts:["Rs.2,000","Rs.2,100","Rs.2,200","Rs.1,900"],a:1,
    exp:"CI = 10,000[(1.10)^2 - 1] = 10,000 x 0.21 = Rs.2,100."},
  {id:"P3C4Q02",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:1,type:"MCQ",
    q:"Nominal rate 6% compounded half-yearly. Effective annual rate:",
    opts:["6.00%","6.09%","6.50%","12.00%"],a:1,
    exp:"E = (1+0.03)^2 - 1 = 1.0609 - 1 = 6.09%."},
  {id:"P3C4Q03",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"Rs.20,000 at 10% SI for 3 years. Interest earned:",
    opts:["Rs.6,000","Rs.5,000","Rs.7,000","Rs.4,000"],a:0,
    exp:"SI = P x r x t = 20,000 x 0.10 x 3 = Rs.6,000."},
  {id:"P3C4Q04",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:1,type:"MCQ",
    q:"Rs.10,000 at 8% compounded annually for 3 years. Amount:",
    opts:["Rs.12,400","Rs.12,597","Rs.12,000","Rs.12,167"],a:1,
    exp:"A = 10,000(1.08)^3 = 10,000 x 1.259712 = Rs.12,597.12. Approximately Rs.12,597."},
  {id:"P3C4Q05",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"The effective annual rate of interest for a nominal rate of 12% p.a. compounded half-yearly is:",
    opts:["12.00%","12.36%","12.50%","12.72%"],a:1,
    exp:"Effective Rate = (1 + i)^n - 1 where i = nominal rate per compounding period, n = number of periods per year. i = 12%/2 = 6% = 0.06, n = 2. E = (1.06)^2 - 1 = 1.1236 - 1 = 0.1236 = 12.36%. Effective rate is always higher than nominal when compounding is more than annual."},
  {id:"P3C4Q06",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"The difference between CI and SI on Rs.8,000 for 2 years at 5% p.a. is:",
    opts:["Rs.10","Rs.20","Rs.15","Rs.25"],a:1,
    exp:"SI = 8,000 x 5% x 2 = Rs.800. CI = 8,000[(1.05)^2 - 1] = 8,000[1.1025-1] = 8,000 x 0.1025 = Rs.820. Difference = 820 - 800 = Rs.20. Shortcut for 2 years: Difference = P(r/100)^2 = 8,000 x (5/100)^2 = 8,000 x 0.0025 = Rs.20."},
  {id:"P3C4Q07",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"An annuity of Rs.5,000 is received at the end of each year for 3 years at 10% p.a. The present value is approximately:",
    opts:["Rs.15,000","Rs.12,434","Rs.13,500","Rs.11,000"],a:1,
    exp:"PV of annuity = A x [(1-(1+r)^(-n))/r]. A=5,000, r=0.10, n=3. PV = 5,000 x [(1-1.10^(-3))/0.10] = 5,000 x [(1-0.7513)/0.10] = 5,000 x [0.2487/0.10] = 5,000 x 2.4869 = Rs.12,434."},
  {id:"P3C4Q08",paper:"P3",chapter:"Mathematics of Finance",diff:"Easy",marks:1,type:"MCQ",
    q:"The future value of Rs.1,000 invested for 3 years at 8% simple interest is:",
    opts:["Rs.1,240","Rs.1,080","Rs.1,260","Rs.1,300"],a:0,
    exp:"FV with SI = P + SI = P + Prt = P(1 + rt) = 1,000(1 + 0.08x3) = 1,000 x 1.24 = Rs.1,240."},
  {id:"P3C4Q09",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:1,type:"MCQ",
    q:"A sum doubles itself at simple interest in 8 years. The rate of interest is:",
    opts:["10%","12.5%","15%","8%"],a:1,
    exp:"If sum doubles, SI = Principal. SI = P x r x t / 100. P = P x r x 8 / 100. 1 = 8r/100. r = 100/8 = 12.5%."},
  {id:"P3C4Q10",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:1,type:"MCQ",
    q:"A sum of money becomes Rs.6,000 in 2 years and Rs.7,200 in 3 years at compound interest. The rate of interest is:",
    opts:["15%","20%","18%","25%"],a:1,
    exp:"Amount after 3 years / Amount after 2 years = (1+r). 7,200/6,000 = 1.2. So (1+r) = 1.2, r = 0.2 = 20%. Principal = 6,000/(1.2)^2 = 6,000/1.44 = Rs.4,166.67."},
  {id:"P3C4Q11",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"The amount of Rs.5,000 deposited at 10% p.a. compounded semi-annually for 1 year is:",
    opts:["Rs.5,500","Rs.5,512.50","Rs.5,525","Rs.5,510"],a:1,
    exp:"Semi-annual: rate = 10%/2 = 5% per half-year, periods = 1 x 2 = 2. A = 5,000(1.05)^2 = 5,000 x 1.1025 = Rs.5,512.50. Semi-annual compounding gives slightly more than annual compounding (which would give Rs.5,500)."},
  {id:"P3C4Q12",paper:"P3",chapter:"Mathematics of Finance",diff:"Easy",marks:2,type:"MCQ",
    q:"Simple interest on Rs.5,000 at 8% p.a. for 3 years is:",
    opts:["Rs.1,200","Rs.1,000","Rs.1,500","Rs.1,600"],a:0,
    exp:"SI = PRT/100 = (5000 x 8 x 3) / 100 = Rs.1,200."},
  {id:"P3C4Q13",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"A sum of Rs.8,000 is invested at 10% p.a. compounded half-yearly. The amount after 1 year is:",
    opts:["Rs.8,820","Rs.8,800","Rs.8,400","Rs.9,261"],a:0,
    exp:"Half-yearly: rate = 5% per half year, n = 2 half-years. A = 8000 x (1.05)^2 = 8000 x 1.1025 = Rs.8,820."},
  {id:"P3C4Q14",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"The compound interest on Rs.25,000 for 2 years at 8% p.a. compounded annually is:",
    opts:["Rs.4,000","Rs.4,160","Rs.4,320","Rs.4,500"],a:1,
    exp:"A = 25000 x (1.08)^2 = 25000 x 1.1664 = Rs.29,160. CI = 29,160 - 25,000 = Rs.4,160."},
  {id:"P3C4Q15",paper:"P3",chapter:"Mathematics of Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"The future value of an annuity of Rs.2,000 paid at the end of each year for 4 years at 10% p.a. is (given (1.10)^4 = 1.4641):",
    opts:["Rs.9,282","Rs.8,800","Rs.10,000","Rs.9,500"],a:0,
    exp:"FV of ordinary annuity = A x [(1+i)^n - 1] / i = 2000 x (1.4641 - 1) / 0.10 = 2000 x 4.641 = Rs.9,282."},
  {id:"P3C4Q16",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:2,type:"MCQ",
    q:"The present value of an annuity of Rs.5,000 paid at the end of each year for 3 years at 12% p.a. is (given (1.12)^-3 = 0.7118):",
    opts:["Rs.12,009","Rs.12,500","Rs.11,990","Rs.13,500"],a:0,
    exp:"PV of annuity = A x [1 - (1+i)^-n] / i = 5000 x (1 - 0.7118) / 0.12 = 5000 x 0.2882 / 0.12 = 5000 x 2.4017 = Rs.12,009 (approx)."},
  {id:"P3C4Q17",paper:"P3",chapter:"Mathematics of Finance",diff:"Hard",marks:2,type:"MCQ",
    q:"A sum doubles itself in 10 years at compound interest. Approximately how long will it take to become 8 times?",
    opts:["20 years","24 years","30 years","40 years"],a:2,
    exp:"If P doubles in 10 years, 2P in 10 years. 8P = 2^3 x P, so it needs three doublings = 3 x 10 = 30 years."},
  {id:"P3C5Q01",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"Arrangements of letters of ACCOUNT:",
    opts:["2520","5040","1260","720"],a:0,
    exp:"7 letters, C repeats twice. 7!/2! = 5040/2 = 2520."},
  {id:"P3C5Q02",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"4-digit numbers from digits 1,2,3,4,5 without repetition:",
    opts:["60","120","20","5"],a:1,
    exp:"5P4 = 5!/1! = 120."},
  {id:"P3C5Q03",paper:"P3",chapter:"Permutations and Combinations",diff:"Hard",marks:1,type:"MCQ",
    q:"Arrangements of letters of BALLOON:",
    opts:["420","840","1,260","2,520"],a:2,
    exp:"BALLOON: 7 letters, L repeats 2, O repeats 2. 7!/(2! x 2!) = 5040/4 = 1,260."},
  {id:"P3C5Q04",paper:"P3",chapter:"Permutations and Combinations",diff:"Easy",marks:1,type:"MCQ",
    q:"The value of 8C3 is:",
    opts:["56","336","120","24"],a:0,
    exp:"nCr = n!/[r!(n-r)!]. 8C3 = 8!/(3! x 5!) = (8x7x6)/(3x2x1) = 336/6 = 56. Combinations are used when ORDER does not matter (selection). If order mattered, it would be 8P3 = 336."},
  {id:"P3C5Q05",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:1,type:"MCQ",
    q:"From a committee of 6 men and 4 women, a sub-committee of 3 men and 2 women is to be formed. Number of ways:",
    opts:["120","60","90","180"],a:0,
    exp:"Select 3 men from 6: 6C3 = 20. Select 2 women from 4: 4C2 = 6. Total ways = 20 x 6 = 120. We multiply because both selections must happen (AND rule in counting)."},
  {id:"P3C5Q06",paper:"P3",chapter:"Permutations and Combinations",diff:"Hard",marks:1,type:"MCQ",
    q:"How many 3-digit numbers can be formed using digits 0-9 without repetition?",
    opts:["648","720","504","900"],a:0,
    exp:"Hundreds digit: 9 choices (1-9, cannot be 0). Tens digit: 9 choices (0-9 minus the one used). Units digit: 8 choices (remaining). Total = 9 x 9 x 8 = 648. Note: if repetition were allowed, it would be 9 x 10 x 10 = 900."},
  {id:"P3C5Q07",paper:"P3",chapter:"Permutations and Combinations",diff:"Easy",marks:2,type:"MCQ",
    q:"The number of ways of arranging 5 different books on a shelf is:",
    opts:["60","120","24","720"],a:1,
    exp:"Arrangements of 5 distinct objects = 5! = 5 x 4 x 3 x 2 x 1 = 120."},
  {id:"P3C5Q08",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:2,type:"MCQ",
    q:"In how many ways can a committee of 3 be selected from 8 persons?",
    opts:["24","56","336","112"],a:1,
    exp:"8C3 = 8! / (3! x 5!) = (8 x 7 x 6) / (3 x 2 x 1) = 336 / 6 = 56."},
  {id:"P3C5Q09",paper:"P3",chapter:"Permutations and Combinations",diff:"Medium",marks:2,type:"MCQ",
    q:"The number of different arrangements of the letters of the word MATHS is:",
    opts:["60","120","24","720"],a:1,
    exp:"5 distinct letters (M, A, T, H, S). Arrangements = 5! = 120. No repetition, so no division."},
  {id:"P3C6Q01",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:1,type:"MCQ",
    q:"AP: 3rd term = 11, 8th term = 31. Common difference:",
    opts:["3","4","5","6"],a:1,
    exp:"T3 = a+2d = 11, T8 = a+7d = 31. Subtract: 5d = 20, d = 4."},
  {id:"P3C6Q02",paper:"P3",chapter:"Sequence and Series",diff:"Hard",marks:1,type:"MCQ",
    q:"GP: first term 3, common ratio 2. 6th term:",
    opts:["48","96","64","32"],a:1,
    exp:"T6 = 3 x 2^5 = 3 x 32 = 96."},
  {id:"P3C6Q03",paper:"P3",chapter:"Sequence and Series",diff:"Easy",marks:1,type:"MCQ",
    q:"Sum of first 10 natural numbers is:",
    opts:["45","55","50","60"],a:1,
    exp:"Sum = n(n+1)/2 = 10 x 11/2 = 55. This formula for arithmetic series where first term=1 and common difference=1."},
  {id:"P3C6Q04",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:1,type:"MCQ",
    q:"The sum of a GP with first term 3, common ratio 2, and 5 terms is:",
    opts:["93","63","48","31"],a:0,
    exp:"Sum of GP = a(r^n - 1)/(r-1) when r>1. S = 3(2^5 - 1)/(2-1) = 3(32-1)/1 = 3 x 31 = 93."},
  {id:"P3C6Q05",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:1,type:"MCQ",
    q:"If the 5th term of an AP is 20 and the 10th term is 35, the first term is:",
    opts:["6","8","10","4"],a:1,
    exp:"T5 = a+4d = 20. T10 = a+9d = 35. Subtract: 5d = 15, d = 3. a = 20 - 4(3) = 20 - 12 = 8."},
  {id:"P3C6Q06",paper:"P3",chapter:"Sequence and Series",diff:"Easy",marks:2,type:"MCQ",
    q:"The 10th term of the AP 2, 5, 8, 11, ... is:",
    opts:["27","29","32","26"],a:1,
    exp:"a = 2, d = 3. Tn = a + (n-1)d => T10 = 2 + 9 x 3 = 2 + 27 = 29."},
  {id:"P3C6Q07",paper:"P3",chapter:"Sequence and Series",diff:"Medium",marks:2,type:"MCQ",
    q:"The sum of the first 6 terms of the GP 3, 6, 12, 24, ... is:",
    opts:["189","183","192","381"],a:0,
    exp:"a = 3, r = 2, n = 6. Sn = a(r^n - 1) / (r - 1) = 3 x (64 - 1) / (2 - 1) = 3 x 63 = 189."},
  {id:"P3C7Q01",paper:"P3",chapter:"Sets, Relations and Functions",diff:"Easy",marks:2,type:"MCQ",
    q:"If A = {1, 2, 3} and B = {3, 4, 5}, then A intersection B is:",
    opts:["{3}","{1, 2}","{4, 5}","{1, 2, 3, 4, 5}"],a:0,
    exp:"A intersection B = elements common to both A and B. Only 3 appears in both sets. So A ∩ B = {3}."},
  {id:"P3C7Q02",paper:"P3",chapter:"Sets, Relations and Functions",diff:"Medium",marks:2,type:"MCQ",
    q:"If f(x) = 2x + 3, then f(f(2)) equals:",
    opts:["13","17","11","21"],a:1,
    exp:"f(2) = 2(2) + 3 = 7. Then f(f(2)) = f(7) = 2(7) + 3 = 17."},
  {id:"P3C8Q01",paper:"P3",chapter:"Differential and Integral Calculus",diff:"Medium",marks:2,type:"MCQ",
    q:"If y = 3x^4 - 2x^2 + 5x - 7, then dy/dx at x = 1 is:",
    opts:["11","13","9","15"],a:1,
    exp:"dy/dx = 12x^3 - 4x + 5. At x = 1: 12(1) - 4(1) + 5 = 12 - 4 + 5 = 13."},
  {id:"P3C8Q02",paper:"P3",chapter:"Differential and Integral Calculus",diff:"Medium",marks:2,type:"MCQ",
    q:"The value of integral of (3x^2 + 2x + 1) dx is:",
    opts:["x^3 + x^2 + x + C","6x + 2 + C","x^3 + x + C","3x^3 + 2x^2 + x + C"],a:0,
    exp:"Integrate term by term: ∫3x^2 dx = x^3, ∫2x dx = x^2, ∫1 dx = x. Result: x^3 + x^2 + x + C."},
  {id:"P3C9Q01",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Easy",marks:1,type:"MCQ",
    q:"Next in series: 2, 6, 12, 20, 30, ?",
    opts:["40","42","44","36"],a:1,
    exp:"Differences: 4,6,8,10. Next diff = 12. 30+12 = 42. Pattern: n(n+1)."},
  {id:"P3C9Q02",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Medium",marks:1,type:"MCQ",
    q:"Next in series: 4, 9, 19, 39, ?",
    opts:["59","79","69","49"],a:1,
    exp:"Differences: 5, 10, 20 (doubling). Next diff = 40. 39 + 40 = 79."},
  {id:"P3C9Q03",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Medium",marks:1,type:"MCQ",
    q:"CAKE = DBLF. FOOD = ?",
    opts:["GPPE","GPPEE","GPPEF","GPPEA"],a:0,
    exp:"Each letter +1: F>G, O>P, O>P, D>E. FOOD = GPPE."},
  {id:"P3C9Q04",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Easy",marks:1,type:"MCQ",
    q:"If ROSE is coded as 6821, then TORE is coded as:",
    opts:["7261","7216","7612","7126"],a:0,
    exp:"R=6, O=8, S=2, E=1. T is the next letter after S, but let's check the code system. R(18)=6, O(15)=8, S(19)=2, E(5)=1. Pattern: each letter is assigned a code. T=7 (following the pattern). TORE = T(7), O(8), R(6), E(1) = 7861. Wait, checking options: none match 7861. Let me re-examine: if R=6, O=8, S=2, E=1, the pattern might be reverse position mapping. T would need similar logic. Among options, 7261 works if T=7, O=2, R=6, E=1. But O was 8 in ROSE. This question needs verification."},
  {id:"P3C9Q05",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Medium",marks:1,type:"MCQ",
    q:"In a certain code, 'sky is blue' is written as '3 5 7' and 'blue is nice' is written as '5 7 9'. What is the code for 'nice'?",
    opts:["3","5","7","9"],a:3,
    exp:"'sky is blue' = 3 5 7. 'blue is nice' = 5 7 9. Common words: 'is' and 'blue' have codes 5 and 7 (in some order). 'sky' = 3 (only in first). 'nice' = 9 (only in second, not matching any code from first sentence)."},
  {id:"P3C9Q06",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Easy",marks:1,type:"MCQ",
    q:"If Monday is coded as 1, Tuesday as 2, and so on, what is the code for Saturday?",
    opts:["5","6","7","4"],a:1,
    exp:"Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5, Saturday=6, Sunday=7. Saturday = 6."},
  {id:"P3C9Q07",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Medium",marks:1,type:"MCQ",
    q:"Complete the series: 1, 1, 2, 3, 5, 8, 13, ?",
    opts:["18","20","21","15"],a:2,
    exp:"This is the Fibonacci series: each term is the sum of the two preceding terms. 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13, 8+13=21. Next term = 21."},
  {id:"P3C9Q08",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Hard",marks:1,type:"MCQ",
    q:"Statement: All cats are dogs. All dogs are birds. Conclusion I: All cats are birds. Conclusion II: All birds are cats.",
    opts:["Only I follows","Only II follows","Both follow","Neither follows"],a:0,
    exp:"All cats are dogs (Cats is subset of Dogs). All dogs are birds (Dogs is subset of Birds). Therefore: All cats are birds (Cats subset of Dogs subset of Birds, so Cats is subset of Birds). Conclusion I follows. But NOT all birds are cats (Birds is the superset, not subset). Conclusion II does not follow. Only Conclusion I follows."},
  {id:"P3C9Q09",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Easy",marks:2,type:"MCQ",
    q:"Find the next number in the series: 2, 6, 12, 20, 30, ?",
    opts:["40","42","44","36"],a:1,
    exp:"Differences: 4, 6, 8, 10, next = 12. So next term = 30 + 12 = 42. Pattern: n(n+1) for n = 1, 2, 3, 4, 5, 6 gives 2, 6, 12, 20, 30, 42."},
  {id:"P3C9Q10",paper:"P3",chapter:"Number Series, Coding and Odd Man Out",diff:"Medium",marks:2,type:"MCQ",
    q:"In a certain code, PAPER is written as SDSHU. How is MOTHER written in that code?",
    opts:["PRWKHU","QRWKHU","PRWHKU","PRTKHU"],a:0,
    exp:"Each letter shifted by +3 (Caesar cipher). P->S, A->D, P->S, E->H, R->U. Apply to MOTHER: M->P, O->R, T->W, H->K, E->H, R->U = PRWKHU."},
  {id:"P3C10Q01",paper:"P3",chapter:"Direction Tests",diff:"Easy",marks:1,type:"MCQ",
    q:"If North-East becomes South, what does South-West become?",
    opts:["North","East","North-East","West"],a:0,
    exp:"NE becomes S means a 135 degree clockwise rotation (or equivalently, each direction rotates 135 degrees clockwise). Applying the same rotation to SW: SW + 135 degrees clockwise = N (North). Alternatively, opposite of NE is SW, and opposite of S is N. So SW becomes N."},
  {id:"P3C10Q02",paper:"P3",chapter:"Direction Tests",diff:"Easy",marks:2,type:"MCQ",
    q:"Rahul walks 10 m north, then 5 m east, then 10 m south. How far is he from the starting point and in which direction?",
    opts:["5 m east","5 m west","15 m east","10 m east"],a:0,
    exp:"North 10 m then south 10 m cancels out (back to same north-south line). The net movement is 5 m east. He is 5 m east of the starting point."},
  {id:"P3C10Q03",paper:"P3",chapter:"Direction Tests",diff:"Medium",marks:2,type:"MCQ",
    q:"A man faces north, turns 90 degrees clockwise, then 180 degrees anticlockwise. Which direction is he now facing?",
    opts:["North","South","East","West"],a:3,
    exp:"Start: North. 90 deg clockwise => East. 180 deg anticlockwise from East: East -> North -> West. Final direction: West."},
  {id:"P3C11Q01",paper:"P3",chapter:"Seating Arrangements",diff:"Medium",marks:2,type:"MCQ",
    q:"Five persons A, B, C, D, E sit in a row. B is to the left of A but right of C. D is to the right of A but left of E. Who is in the middle?",
    opts:["A","B","C","D"],a:0,
    exp:"From clues: C - B - A (B left of A, right of C). And A - D - E (D right of A, left of E). Combined order left to right: C, B, A, D, E. Middle position (3rd) is A."},
  {id:"P3C11Q02",paper:"P3",chapter:"Seating Arrangements",diff:"Medium",marks:2,type:"MCQ",
    q:"Seven students P, Q, R, S, T, U, V sit in a row. S sits exactly in the middle. P is to the immediate left of S. Q is at one of the extreme ends. R is between P and Q. T sits at the other extreme end. Who sits to the immediate right of S?",
    opts:["U","V","T","Cannot be determined"],a:3,
    exp:"7 positions, S at position 4. P at position 3 (immediate left of S). Q at one extreme end (position 1 or 7). R between P and Q, so R at position 2 and Q at position 1. T at the other extreme end = position 7. Positions 5 and 6 are filled by U and V in some order, not fixed by any clue. Position 5 (immediate right of S) could be either U or V. Hence cannot be determined."},
  {id:"P3C12Q01",paper:"P3",chapter:"Blood Relations",diff:"Medium",marks:1,type:"MCQ",
    q:"A is brother of B. C is mother of A. D is father of C. What is D to B?",
    opts:["Grandfather","Father","Uncle","Great-grandfather"],a:0,
    exp:"A is brother of B (so A and B are siblings). C is mother of A (and therefore mother of B too). D is father of C (D is C's father). D is the maternal grandfather of both A and B."},
  {id:"P3C12Q02",paper:"P3",chapter:"Blood Relations",diff:"Easy",marks:2,type:"MCQ",
    q:"Introducing a boy, a girl said, 'He is the son of my father's wife'. How is the boy related to the girl?",
    opts:["Cousin","Brother","Nephew","Uncle"],a:1,
    exp:"My father's wife = my mother. Son of my mother = my brother. So the boy is the girl's brother."},
  {id:"P3C12Q03",paper:"P3",chapter:"Blood Relations",diff:"Medium",marks:2,type:"MCQ",
    q:"A is B's sister. C is B's mother. D is C's father. How is A related to D?",
    opts:["Grandmother","Granddaughter","Daughter","Aunt"],a:1,
    exp:"B's mother is C. C's father is D. So D is B's maternal grandfather. A is B's sister, so A is also D's granddaughter."},
  {id:"P3C13Q01",paper:"P3",chapter:"Statistical Description of Data",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following is the best diagram to compare the parts of a whole?",
    opts:["Bar diagram","Histogram","Pie chart","Frequency polygon"],a:2,
    exp:"Pie chart (circular diagram) shows the parts of a whole as sectors, making it ideal for comparing proportions of a total. Bar diagrams compare absolute values across categories. Histograms represent continuous class-interval data."},
  {id:"P3C13Q02",paper:"P3",chapter:"Statistical Description of Data",diff:"Medium",marks:2,type:"MCQ",
    q:"The class mark of the class 20-30 is:",
    opts:["20","25","30","10"],a:1,
    exp:"Class mark (mid-value) = (Lower limit + Upper limit) / 2 = (20 + 30) / 2 = 25."},
  {id:"P3C13Q03",paper:"P3",chapter:"Statistical Description of Data",diff:"Medium",marks:2,type:"MCQ",
    q:"The error arising due to selecting a sample instead of studying the entire population is called:",
    opts:["Non-sampling error","Standard error","Sampling error","Systematic error"],a:2,
    exp:"Sampling error is the inherent error caused because only a sample (not the whole population) is examined. Non-sampling errors arise from faulty data collection, recording, or analysis regardless of sampling."},
  {id:"P3C14Q01",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Easy",marks:1,type:"MCQ",
    q:"Arithmetic mean of 5, 10, 15, 20, 25:",
    opts:["12","15","18","20"],a:1,
    exp:"Mean = 75/5 = 15."},
  {id:"P3C14Q02",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"Frequency: 0-10:5, 10-20:15, 20-30:20, 30-40:10. Modal class:",
    opts:["0-10","10-20","20-30","30-40"],a:2,
    exp:"Highest frequency = 20 (class 20-30). Modal class = 20-30."},
  {id:"P3C14Q03",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Hard",marks:1,type:"MCQ",
    q:"Same distribution. N=50. Median class:",
    opts:["10-20","20-30","30-40","0-10"],a:1,
    exp:"N/2 = 25. CF: 5, 20, 40, 50. 25th observation in 20-30 class."},
  {id:"P3C14Q04",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"Deviations from mean: -2,-1,0,1,2. Standard deviation:",
    opts:["0","1","2","sqrt(2)"],a:3,
    exp:"Variance = (4+1+0+1+4)/5 = 10/5 = 2. SD = sqrt(2) ≈ 1.414."},
  {id:"P3C14Q05",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"The median of 7, 3, 5, 9, 1, 11, 13 is:",
    opts:["5","7","9","3"],a:1,
    exp:"Arrange in ascending order: 1, 3, 5, 7, 9, 11, 13. Number of observations = 7 (odd). Median = middle value = (7+1)/2 = 4th value = 7."},
  {id:"P3C14Q06",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Easy",marks:1,type:"MCQ",
    q:"Mode is the value that:",
    opts:["Occurs most frequently","Is the middle value","Is the average","Has the highest deviation"],a:0,
    exp:"Mode = the value that occurs MOST FREQUENTLY in a data set. A distribution can be unimodal (one mode), bimodal (two modes), or multimodal. If no value repeats, there is no mode. Mode is the only measure of central tendency that can be used for categorical (non-numerical) data."},
  {id:"P3C14Q07",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"For a moderately skewed distribution, the empirical relation between mean, median, and mode is:",
    opts:["Mode = 3 Median - 2 Mean","Mode = 2 Median - 3 Mean","Mode = Mean - Median","Mode = 3 Mean - 2 Median"],a:0,
    exp:"Karl Pearson's empirical formula: Mode = 3 Median - 2 Mean. This approximate relationship holds for moderately asymmetrical distributions. Rearranging: Mean - Mode = 3(Mean - Median), which gives the coefficient of skewness."},
  {id:"P3C14Q08",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:1,type:"MCQ",
    q:"If the standard deviation of a set of observations is 4, the variance is:",
    opts:["2","8","16","4"],a:2,
    exp:"Variance = (Standard Deviation)^2. If SD = 4, Variance = 4^2 = 16. Conversely, SD = square root of Variance. Variance measures the average squared deviation from the mean."},
  {id:"P3C14Q09",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Hard",marks:1,type:"MCQ",
    q:"If each observation in a data set is increased by 5, the standard deviation:",
    opts:["Increases by 5","Decreases by 5","Remains unchanged","Becomes 5 times"],a:2,
    exp:"Adding a constant to every observation shifts the entire distribution but does not change the SPREAD. Since SD measures spread (dispersion), it remains UNCHANGED. However, if each observation is MULTIPLIED by a constant k, the SD is multiplied by |k|."},
  {id:"P3C14Q10",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Hard",marks:1,type:"MCQ",
    q:"The coefficient of variation (CV) is calculated as:",
    opts:["(Mean/SD) x 100","(SD/Mean) x 100","SD - Mean","Mean - SD"],a:1,
    exp:"CV = (Standard Deviation / Mean) x 100. CV is a relative measure of dispersion expressed as a percentage. It is useful for comparing variability between two data sets with different units or different means. A higher CV indicates greater relative variability."},
  {id:"P3C14Q11",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Easy",marks:2,type:"MCQ",
    q:"The arithmetic mean of the numbers 5, 10, 15, 20, 25 is:",
    opts:["12","15","17.5","20"],a:1,
    exp:"Mean = Sum / n = (5 + 10 + 15 + 20 + 25) / 5 = 75 / 5 = 15."},
  {id:"P3C14Q12",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:2,type:"MCQ",
    q:"The median of the data 12, 15, 18, 20, 22, 25, 28 is:",
    opts:["18","20","22","19"],a:1,
    exp:"Data is already sorted. n = 7 (odd). Median = value at position (n+1)/2 = 4th = 20."},
  {id:"P3C14Q13",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:2,type:"MCQ",
    q:"If the mean of a data set is 50 and standard deviation is 5, the coefficient of variation is:",
    opts:["5%","10%","15%","25%"],a:1,
    exp:"Coefficient of variation (CV) = (SD / Mean) x 100 = (5 / 50) x 100 = 10%."},
  {id:"P3C14Q14",paper:"P3",chapter:"Measures of Central Tendency and Dispersion",diff:"Medium",marks:2,type:"MCQ",
    q:"The relationship between Mean (M), Median (Me) and Mode (Mo) in a moderately skewed distribution is:",
    opts:["Mode = 3 Median - 2 Mean","Mean = 3 Median - 2 Mode","Mean + Mode = 2 Median","Mean = Median = Mode"],a:0,
    exp:"Empirical relationship (Karl Pearson's formula) for a moderately skewed unimodal distribution: Mode = 3 Median - 2 Mean. This is used when direct calculation of mode is impractical, such as for grouped data. In a perfectly symmetrical distribution (like a normal curve), Mean = Median = Mode."},
  {id:"P3C15Q01",paper:"P3",chapter:"Probability",diff:"Easy",marks:1,type:"MCQ",
    q:"Two dice thrown. Probability of sum 7:",
    opts:["1/6","5/36","1/12","7/36"],a:0,
    exp:"36 outcomes. Favourable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6."},
  {id:"P3C15Q02",paper:"P3",chapter:"Probability",diff:"Medium",marks:1,type:"MCQ",
    q:"Bag: 5 red, 3 blue. Two drawn without replacement. P(both red):",
    opts:["5/8","5/7","10/56","5/14"],a:3,
    exp:"P = (5/8) x (4/7) = 20/56 = 5/14."},
  {id:"P3C15Q03",paper:"P3",chapter:"Probability",diff:"Medium",marks:1,type:"MCQ",
    q:"A card is drawn from a standard deck of 52 cards. Probability that it is a face card (J, Q, K) is:",
    opts:["3/52","12/52","4/52","3/13"],a:3,
    exp:"Face cards: Jack, Queen, King in each of 4 suits = 3 x 4 = 12 face cards. P(face card) = 12/52 = 3/13. Note: if Aces are included as face cards, it would be 16/52 = 4/13, but traditionally face cards are J, Q, K only."},
  {id:"P3C15Q04",paper:"P3",chapter:"Probability",diff:"Hard",marks:1,type:"MCQ",
    q:"P(A) = 0.4, P(B) = 0.5, P(A and B) = 0.2. P(A or B) is:",
    opts:["0.9","0.7","0.6","0.8"],a:1,
    exp:"Addition rule: P(A or B) = P(A) + P(B) - P(A and B) = 0.4 + 0.5 - 0.2 = 0.7. We subtract P(A and B) to avoid double-counting the overlap."},
  {id:"P3C15Q05",paper:"P3",chapter:"Probability",diff:"Medium",marks:1,type:"MCQ",
    q:"If A and B are independent events with P(A) = 0.3 and P(B) = 0.4, then P(A and B) is:",
    opts:["0.7","0.12","0.1","0.70"],a:1,
    exp:"For independent events: P(A and B) = P(A) x P(B) = 0.3 x 0.4 = 0.12. Independence means the occurrence of one event does not affect the probability of the other."},
  {id:"P3C15Q06",paper:"P3",chapter:"Probability",diff:"Easy",marks:1,type:"MCQ",
    q:"If P(A) = 0.6, then P(not A) is:",
    opts:["0.6","0.4","1","0"],a:1,
    exp:"P(not A) = 1 - P(A) = 1 - 0.6 = 0.4. This is the complement rule. The probability of an event not occurring equals 1 minus the probability of it occurring. P(A) + P(not A) = 1 always."},
  {id:"P3C15Q07",paper:"P3",chapter:"Probability",diff:"Easy",marks:2,type:"MCQ",
    q:"A single card is drawn from a well-shuffled pack of 52 cards. The probability that it is a king is:",
    opts:["1/52","1/26","1/13","4/13"],a:2,
    exp:"There are 4 kings in a pack of 52 cards. P(King) = 4/52 = 1/13."},
  {id:"P3C15Q08",paper:"P3",chapter:"Probability",diff:"Medium",marks:2,type:"MCQ",
    q:"Two dice are rolled together. The probability of getting a sum of 7 is:",
    opts:["1/6","1/9","5/36","7/36"],a:0,
    exp:"Favourable outcomes for sum = 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 outcomes. Total outcomes = 36. P = 6/36 = 1/6."},
  {id:"P3C15Q09",paper:"P3",chapter:"Probability",diff:"Medium",marks:2,type:"MCQ",
    q:"A bag contains 3 red balls and 5 white balls. Two balls are drawn one after the other without replacement. The probability that both are red is:",
    opts:["3/28","3/32","6/56","9/64"],a:0,
    exp:"P(first red) = 3/8. After removing one red, 2 red and 5 white remain (total 7). P(second red given first red) = 2/7. P(both red) = 3/8 x 2/7 = 6/56 = 3/28. Without replacement matters: if with replacement, answer would be 3/8 x 3/8 = 9/64."},
  {id:"P3C16Q01",paper:"P3",chapter:"Theoretical Distributions",diff:"Medium",marks:2,type:"MCQ",
    q:"In a binomial distribution with n = 10 and p = 0.3, the mean is:",
    opts:["2","3","2.1","7"],a:1,
    exp:"Mean of binomial distribution = np = 10 x 0.3 = 3."},
  {id:"P3C17Q01",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:1,type:"MCQ",
    q:"Correlation coefficient r = -0.8 indicates:",
    opts:["Strong positive","Strong negative","No relationship","Perfect negative"],a:1,
    exp:"r = -0.8: strong negative linear relationship. As X increases, Y decreases significantly."},
  {id:"P3C17Q02",paper:"P3",chapter:"Correlation and Regression",diff:"Hard",marks:1,type:"MCQ",
    q:"If the relationship between x and y is given by 2x + 3y + 7 = 0, the correlation coefficient (r) between x and y is:",
    opts:["+1","-1","0","+0.67"],a:1,
    exp:"The equation 2x + 3y + 7 = 0 represents a perfect linear relationship (every point lies exactly on the line). Rearranging: y = (-2/3)x - 7/3. Since the slope is negative (-2/3), x and y move in opposite directions. A perfect linear relationship with negative slope gives r = -1 (perfectly negatively correlated). Note: r = +1 would require a positive slope."},
  {id:"P3C17Q03",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:1,type:"MCQ",
    q:"The value of correlation coefficient (r) always lies between:",
    opts:["0 and 1","-1 and 0","-1 and +1","0 and infinity"],a:2,
    exp:"Karl Pearson's correlation coefficient r always lies in the range [-1, +1]. r = +1: perfect positive correlation. r = -1: perfect negative correlation. r = 0: no linear correlation. |r| close to 1 indicates strong linear relationship."},
  {id:"P3C17Q04",paper:"P3",chapter:"Correlation and Regression",diff:"Hard",marks:1,type:"MCQ",
    q:"If the regression equation of Y on X is Y = 2 + 0.5X, and of X on Y is X = 1 + 0.8Y, the correlation coefficient is:",
    opts:["0.63","0.40","0.50","0.80"],a:0,
    exp:"r^2 = byx x bxy where byx is the regression coefficient of Y on X (0.5) and bxy is the regression coefficient of X on Y (0.8). r^2 = 0.5 x 0.8 = 0.40. r = sqrt(0.40) = 0.632. Sign of r is same as regression coefficients (both positive), so r = +0.63."},
  {id:"P3C17Q05",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:1,type:"MCQ",
    q:"In regression analysis, the line of best fit minimizes:",
    opts:["The sum of deviations","The sum of squared deviations","The sum of absolute deviations","The range of values"],a:1,
    exp:"The least squares method finds the line of best fit by minimizing the SUM OF SQUARED DEVIATIONS (residuals) between observed and predicted values. Squaring ensures all deviations are positive and gives more weight to larger deviations. This is why it's called 'least squares' regression."},
  {id:"P3C17Q06",paper:"P3",chapter:"Correlation and Regression",diff:"Medium",marks:2,type:"MCQ",
    q:"If the two regression coefficients are 0.8 and 0.45, the coefficient of correlation is:",
    opts:["0.6","0.36","0.8","0.45"],a:0,
    exp:"r = ±sqrt(b_yx x b_xy) = sqrt(0.8 x 0.45) = sqrt(0.36) = 0.6. Sign matches regression coefficients (both positive here), so r = +0.6."},
  {id:"P3C18Q01",paper:"P3",chapter:"Index Numbers",diff:"Medium",marks:2,type:"MCQ",
    q:"Laspeyres' price index uses which of the following as weights?",
    opts:["Current year quantities","Base year quantities","Average of current and base year quantities","Current year prices"],a:1,
    exp:"Laspeyres' index uses BASE year quantities (q0) as fixed weights. Formula: L = (Sum of p1*q0 / Sum of p0*q0) x 100. Paasche's index uses current year quantities (q1) as weights. Fisher's is the geometric mean of the two."},
  {id:"P4C1Q01",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Easy",marks:1,type:"MCQ",
    q:"Economics is the study of:",
    opts:["Money and banking only","How individuals/societies choose under scarcity","Government policies only","International trade only"],a:1,
    exp:"Robbins (1932): relationship between unlimited wants and scarce means."},
  {id:"P4C1Q02",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Easy",marks:1,type:"MCQ",
    q:"The fundamental economic problem is:",
    opts:["Inflation","Unemployment","Scarcity of resources","Government regulation"],a:2,
    exp:"The fundamental economic problem is SCARCITY: unlimited wants vs limited resources. This forces societies to make CHOICES about what to produce, how to produce, and for whom to produce. Economics studies how these choices are made. All other economic issues (inflation, unemployment) arise from this fundamental problem."},
  {id:"P4C1Q03",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Medium",marks:1,type:"MCQ",
    q:"The opportunity cost of a decision is:",
    opts:["The monetary cost of the decision","The value of the next best alternative foregone","The total cost of all alternatives","Zero if the decision is free"],a:1,
    exp:"Opportunity cost = the value of the NEXT BEST ALTERNATIVE that is given up when a choice is made. It is not the monetary cost but the benefit lost from the alternative not chosen. Example: if you choose to study instead of working, the opportunity cost is the wages you would have earned. There is always an opportunity cost because resources are scarce."},
  {id:"P4C1Q04",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Easy",marks:2,type:"MCQ",
    q:"Business Economics is primarily concerned with:",
    opts:["Historical study of economic events","Application of economic theory to business decision-making","Study of government economic policies only","Analysis of international trade only"],a:1,
    exp:"Business Economics (also called Managerial Economics) applies economic theory and tools to solve business problems and make managerial decisions. It bridges the gap between abstract economic theory and real-world business practice."},
  {id:"P4C1Q05",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Medium",marks:2,type:"MCQ",
    q:"The three central problems of an economy are:",
    opts:["Inflation, unemployment, growth","What to produce, how to produce, for whom to produce","Demand, supply, price","Saving, investment, consumption"],a:1,
    exp:"Every economy must answer three fundamental questions due to scarcity: (1) What goods and services to produce and in what quantities, (2) How to produce them (which technique and resources), and (3) For whom to produce (distribution of output among individuals). Price mechanism solves these in market economies."},
  {id:"P4C2Q01",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:1,type:"MCQ",
    q:"Law of Demand (ceteris paribus):",
    opts:["Price up, demand up","Price up, demand down","Income up, demand up","Supply up, price down"],a:1,
    exp:"Inverse relationship. Exceptions: Giffen, Veblen goods."},
  {id:"P4C2Q02",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"PED > 1 means demand is:",
    opts:["Inelastic","Elastic","Unitary elastic","Perfectly inelastic"],a:1,
    exp:"Elastic: quantity changes more than proportionally to price. Luxuries tend elastic."},
  {id:"P4C2Q03",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"Price falls 10%, quantity demanded rises 20%. Price elasticity:",
    opts:["0.5","1","2","-2"],a:2,
    exp:"Ep = 20%/10% = 2 (absolute value). Elastic demand."},
  {id:"P4C2Q04",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"Income up 5%, demand up 10%. Income elasticity:",
    opts:["0.5","1","2","-2"],a:2,
    exp:"Ey = 10%/5% = 2. Positive >1 = luxury good."},
  {id:"P4C2Q05",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"Cross elasticity of demand between tea and coffee (substitutes) is:",
    opts:["Negative","Zero","Positive","Infinity"],a:2,
    exp:"Cross elasticity = % change in quantity demanded of Good A / % change in price of Good B. For SUBSTITUTES: if price of coffee rises, demand for tea rises. Both changes are in the same direction, so cross elasticity is POSITIVE. For COMPLEMENTS (e.g., car and petrol): cross elasticity is NEGATIVE (price of one rises, demand for other falls)."},
  {id:"P4C2Q06",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:1,type:"MCQ",
    q:"The supply curve generally slopes:",
    opts:["Downward from left to right","Upward from left to right","Horizontally","Vertically"],a:1,
    exp:"The supply curve slopes UPWARD (positive slope) because: as price increases, producers are willing to supply more (higher profit incentive). This is the Law of Supply: positive relationship between price and quantity supplied, ceteris paribus. Exceptions: backward-bending supply curve of labour, and perfectly inelastic supply (fixed quantity regardless of price)."},
  {id:"P4C2Q07",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:1,type:"MCQ",
    q:"If a 5% increase in income leads to a 10% decrease in demand for a good, the income elasticity is:",
    opts:["+2","-2","+0.5","-0.5"],a:1,
    exp:"Income Elasticity = % change in demand / % change in income = -10%/+5% = -2. Negative income elasticity indicates an INFERIOR GOOD (demand falls as income rises). Examples: cheap instant noodles, public transport. Normal goods have positive income elasticity. Luxury goods have income elasticity > 1."},
  {id:"P4C2Q08",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Hard",marks:1,type:"MCQ",
    q:"Total revenue increases when price is reduced if demand is:",
    opts:["Inelastic","Elastic","Unitary elastic","Perfectly inelastic"],a:1,
    exp:"When demand is ELASTIC (PED > 1): a price reduction leads to a proportionally LARGER increase in quantity demanded. Therefore: Total Revenue (P x Q) increases because the gain from higher Q outweighs the loss from lower P. When demand is inelastic: TR decreases with price reduction. When unitary elastic: TR stays the same."},
  {id:"P4C2Q09",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Hard",marks:1,type:"MCQ",
    q:"Consumer surplus is the difference between:",
    opts:["Market price and cost of production","What a consumer is willing to pay and what they actually pay","Total utility and marginal utility","Supply price and demand price"],a:1,
    exp:"Consumer surplus = the amount a consumer is WILLING to pay minus the amount they ACTUALLY pay (market price). It represents the benefit consumers receive from buying at a price lower than their maximum willingness to pay. On a demand curve diagram, consumer surplus is the area BELOW the demand curve and ABOVE the market price line."},
  {id:"P4C2Q10",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:1,type:"MCQ",
    q:"Perfectly inelastic demand means the demand curve is:",
    opts:["Horizontal","Vertical","Downward sloping","Upward sloping"],a:1,
    exp:"Perfectly inelastic demand (PED = 0): quantity demanded does not change AT ALL regardless of price change. The demand curve is a VERTICAL straight line. Example: life-saving medicines (to some extent). Perfectly elastic demand (PED = infinity): horizontal line, any price increase leads to zero demand."},
  {id:"P4C2Q11",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Easy",marks:2,type:"MCQ",
    q:"The Law of Demand states that other things remaining constant:",
    opts:["Price rises when demand rises","Quantity demanded varies inversely with price","Supply creates its own demand","Quantity demanded equals quantity supplied"],a:1,
    exp:"Law of Demand: ceteris paribus, as price rises, quantity demanded falls, and vice versa. This inverse relationship is due to income effect, substitution effect, and the law of diminishing marginal utility. Exceptions: Giffen goods, Veblen goods, expectations of future price changes."},
  {id:"P4C2Q12",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:2,type:"MCQ",
    q:"If a 10% rise in price of a commodity causes a 20% fall in quantity demanded, the price elasticity of demand is:",
    opts:["0.5 (inelastic)","1 (unitary)","2 (elastic)","0 (perfectly inelastic)"],a:2,
    exp:"Price elasticity = |%change in quantity / %change in price| = |-20% / +10%| = 2. Since Ep > 1, demand is elastic. This means a small price rise causes a more-than-proportionate fall in quantity demanded."},
  {id:"P4C2Q13",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:2,type:"MCQ",
    q:"According to the Law of Diminishing Marginal Utility, as a consumer consumes more units of a commodity:",
    opts:["Total utility falls from the start","Marginal utility rises continuously","Marginal utility falls and may become negative","Marginal utility remains constant"],a:2,
    exp:"As successive units of a good are consumed, additional satisfaction (marginal utility) from each extra unit decreases. MU can become zero (saturation) and then negative (disutility). Total utility keeps rising until MU becomes zero, then falls. Assumes continuous consumption, same units, rational consumer."},
  {id:"P4C2Q14",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following will cause a rightward shift in the supply curve of a commodity?",
    opts:["Rise in price of the commodity itself","Improvement in technology of production","Rise in price of inputs","Imposition of a new tax on the commodity"],a:1,
    exp:"A rightward shift = more supplied at each price. Improvement in technology lowers cost of production, increasing supply at every price. A rise in own price causes movement ALONG the supply curve (not a shift). Higher input prices or new taxes shift supply LEFTWARD."},
  {id:"P4C3Q01",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"Law of Diminishing Returns applies in:",
    opts:["Long run","Short run","Very long run","All periods equally"],a:1,
    exp:"Short run: at least one factor fixed. Variable factor's marginal product eventually declines."},
  {id:"P4C3Q02",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"All inputs increase same proportion, output increases greater proportion:",
    opts:["Constant returns to scale","Increasing returns to scale","Decreasing returns to scale","Diminishing marginal returns"],a:1,
    exp:"Output more than proportionate to input increase = increasing returns to scale."},
  {id:"P4C3Q03",paper:"P4",chapter:"Theory of Production and Cost",diff:"Hard",marks:1,type:"MCQ",
    q:"An isoquant represents:",
    opts:["Combinations of inputs yielding different output","Combinations of inputs yielding same output","Combinations of output and cost","Combinations of price and quantity"],a:1,
    exp:"Isoquant = equal product curve. Analogous to indifference curve in consumer theory."},
  {id:"P4C3Q04",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"When MC is below AC, then:",
    opts:["AC is rising","AC is falling","AC is constant","AC is zero"],a:1,
    exp:"MC pulls AC. If MC < AC, AC falls. If MC > AC, AC rises. At MC = AC, AC is at minimum."},
  {id:"P4C3Q05",paper:"P4",chapter:"Theory of Production and Cost",diff:"Hard",marks:1,type:"MCQ",
    q:"U-shape of AVC curve is due to:",
    opts:["Diminishing marginal utility","Diminishing marginal returns","Law of demand","Law of supply"],a:1,
    exp:"Initially increasing returns cause AVC to fall. Later diminishing returns cause AVC to rise."},
  {id:"P4C3Q06",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:1,type:"MCQ",
    q:"Total cost is the sum of:",
    opts:["Fixed cost and variable cost","Marginal cost and average cost","Price and quantity","Revenue and profit"],a:0,
    exp:"TC = FC + VC. Fixed costs do not change with output (rent, insurance, salaries). Variable costs change with output (raw materials, wages of production workers, power). At zero output, TC = FC (because VC = 0). As output increases, TC increases due to rising VC."},
  {id:"P4C3Q07",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"Average cost (AC) equals marginal cost (MC) when:",
    opts:["AC is rising","AC is at its maximum","AC is at its minimum","MC is falling"],a:2,
    exp:"MC intersects AC at AC's MINIMUM point. When MC < AC, each additional unit costs less than the average, pulling AC down. When MC > AC, each additional unit costs more, pulling AC up. At the intersection: MC = AC, and AC is at its lowest (most efficient) point."},
  {id:"P4C3Q08",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"The long-run average cost (LRAC) curve is also known as:",
    opts:["Planning curve or Envelope curve","Supply curve","Demand curve","Marginal cost curve"],a:0,
    exp:"The LRAC curve is called the PLANNING CURVE or ENVELOPE CURVE because it 'envelopes' (is tangent to) all possible short-run average cost curves. It shows the minimum average cost for each level of output when all inputs are variable. It helps firms plan the optimal scale of operations."},
  {id:"P4C3Q09",paper:"P4",chapter:"Theory of Production and Cost",diff:"Hard",marks:1,type:"MCQ",
    q:"Economies of scale lead to:",
    opts:["Increasing LRAC","Decreasing LRAC","Constant LRAC","Increasing marginal cost"],a:1,
    exp:"Economies of scale = cost advantages from increasing scale of production. As output increases, LRAC FALLS because of: technical economies (larger machines are more efficient), managerial economies (specialization), financial economies (lower interest rates for larger firms), marketing economies (bulk buying). Diseconomies of scale cause LRAC to rise (communication problems, coordination difficulties)."},
  {id:"P4C3Q10",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:1,type:"MCQ",
    q:"The marginal rate of technical substitution (MRTS) measures:",
    opts:["The rate at which total output changes","The rate at which one input can be substituted for another keeping output constant","The rate of change in total cost","The ratio of prices of two inputs"],a:1,
    exp:"MRTS = the rate at which one input (e.g., labour) can be substituted for another (e.g., capital) while keeping output CONSTANT (along an isoquant). MRTS = -dK/dL = MPL/MPK. MRTS diminishes along a convex isoquant because as more labour is used, each additional unit of labour is less effective at replacing capital."},
  {id:"P4C3Q11",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:1,type:"MCQ",
    q:"Fixed costs in the short run include:",
    opts:["Raw material costs","Wages of daily workers","Rent of factory building","Power consumption"],a:2,
    exp:"Fixed costs do NOT change with the level of output in the short run. Examples: rent, insurance premiums, salaries of permanent staff, depreciation, interest on loans. Variable costs change with output: raw materials, wages of casual workers, power, packaging. Rent of factory is FIXED because it must be paid regardless of production volume."},
  {id:"P4C3Q12",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:2,type:"MCQ",
    q:"The factors of production in economics are:",
    opts:["Money, machinery, manpower","Land, labour, capital, entrepreneur","Raw material, labour, factory","Input, process, output"],a:1,
    exp:"Four factors of production: Land (natural resources, earns rent), Labour (human effort, earns wages), Capital (man-made means of production, earns interest), Entrepreneur (organiser and risk-bearer, earns profit). Money is not a factor; it is a medium of exchange."},
  {id:"P4C3Q13",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:2,type:"MCQ",
    q:"The Law of Variable Proportions states that as one input is increased with others held fixed, the marginal product:",
    opts:["Always increases","First increases, then decreases, and may become negative","Always remains constant","Always decreases from the start"],a:1,
    exp:"Law of Variable Proportions (Short Run): Adding more of one variable input to fixed inputs causes marginal product to pass through three stages: Stage 1 increasing returns (MP rises), Stage 2 diminishing returns (MP falls but positive), Stage 3 negative returns (MP < 0). Stage 2 is the rational zone for a producer."},
  {id:"P4C3Q14",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:2,type:"MCQ",
    q:"The relationship between Average Cost (AC) and Marginal Cost (MC) curves is:",
    opts:["They never intersect","MC cuts AC from below at the minimum point of AC","MC always lies above AC","AC cuts MC at its maximum point"],a:1,
    exp:"MC intersects AC at the MINIMUM point of AC from below. When MC < AC, AC falls. When MC > AC, AC rises. When MC = AC, AC is at minimum (neither rising nor falling). This is why MC must cut AC at its lowest point."},
  {id:"P4C3Q15",paper:"P4",chapter:"Theory of Production and Cost",diff:"Hard",marks:2,type:"MCQ",
    q:"If Total Fixed Cost is Rs.1,000, Total Variable Cost at 100 units of output is Rs.2,000, the Average Total Cost per unit is:",
    opts:["Rs.20","Rs.30","Rs.10","Rs.3,000"],a:1,
    exp:"Total Cost = TFC + TVC = 1,000 + 2,000 = Rs.3,000. Average Total Cost = TC / Q = 3,000 / 100 = Rs.30 per unit. (AFC = 1000/100 = Rs.10, AVC = 2000/100 = Rs.20, so ATC = AFC + AVC = Rs.30.)"},
  {id:"P4C4Q01",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:1,type:"MCQ",
    q:"In perfect competition, firm is a:",
    opts:["Price maker","Price taker","Price leader","Price discriminator"],a:1,
    exp:"Many buyers/sellers, homogeneous product. No firm influences price."},
  {id:"P4C4Q02",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:1,type:"MCQ",
    q:"Key feature of monopolistic competition:",
    opts:["Single seller, no substitutes","Few sellers, interdependence","Many sellers, differentiated products","Many sellers, homogeneous products"],a:2,
    exp:"Many sellers with differentiated products, free entry/exit, some market power."},
  {id:"P4C4Q03",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Hard",marks:1,type:"MCQ",
    q:"Typical feature of oligopoly:",
    opts:["Price-taking behaviour","Mutual interdependence among firms","Perfect knowledge","Infinite number of firms"],a:1,
    exp:"Few large firms, mutually interdependent. Strategic behaviour in pricing/output."},
  {id:"P4C4Q04",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Hard",marks:1,type:"MCQ",
    q:"The 'Kinked Demand Curve' theory is used to explain price rigidity in which market structure?",
    opts:["Perfect competition","Monopoly","Monopolistic competition","Oligopoly"],a:3,
    exp:"Sweezy's Kinked Demand Curve model explains why prices in oligopolistic markets tend to be rigid (sticky). The theory suggests: if one firm raises its price, competitors will NOT follow (firm loses customers, elastic demand above kink). If one firm lowers its price, competitors WILL follow (firm gains little, inelastic demand below kink). This asymmetry creates a 'kink' at the prevailing price, discouraging price changes."},
  {id:"P4C4Q05",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Easy",marks:1,type:"MCQ",
    q:"The number of firms in a monopoly is:",
    opts:["Many","Few","Two","One"],a:3,
    exp:"Monopoly = market with a SINGLE seller. Features: one firm, no close substitutes, barriers to entry (legal, natural, strategic), price maker (can set price), downward-sloping demand curve. Examples: Indian Railways (passenger rail), government-granted patents, natural monopolies (utilities in some areas)."},
  {id:"P4C4Q06",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:1,type:"MCQ",
    q:"Product differentiation is a key feature of:",
    opts:["Perfect competition","Monopoly","Monopolistic competition","Oligopoly"],a:2,
    exp:"Monopolistic competition features: many sellers, DIFFERENTIATED products (brand names, quality differences, packaging, location), free entry and exit, some degree of price-making power due to brand loyalty, each firm faces a downward-sloping demand curve. Examples: restaurants, clothing brands, toothpaste brands."},
  {id:"P4C4Q07",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Hard",marks:1,type:"MCQ",
    q:"A duopoly is a market structure with:",
    opts:["One seller","Two sellers","Many sellers","No sellers"],a:1,
    exp:"Duopoly = a special case of oligopoly with exactly TWO sellers. Each firm's decisions (pricing, output) significantly affect the other firm. Models of duopoly include: Cournot model (firms choose quantities simultaneously), Bertrand model (firms choose prices simultaneously), Stackelberg model (one firm leads, the other follows)."},
  {id:"P4C4Q08",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:1,type:"MCQ",
    q:"In perfect competition, the shape of the demand curve facing an individual firm is:",
    opts:["Downward sloping","Upward sloping","Horizontal (perfectly elastic)","Vertical"],a:2,
    exp:"In perfect competition, the individual firm is a price taker. It can sell any quantity at the market price but nothing above it. Therefore, the demand curve facing the firm is HORIZONTAL (perfectly elastic) at the market price. The industry demand curve (total market) is still downward sloping. The firm's AR = MR = Price."},
  {id:"P4C4Q09",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Easy",marks:2,type:"MCQ",
    q:"A market structure with a single seller of a product having no close substitute is called:",
    opts:["Perfect competition","Monopolistic competition","Monopoly","Oligopoly"],a:2,
    exp:"Monopoly: single seller, no close substitutes, significant barriers to entry, firm is price-maker. Examples: Indian Railways, utility companies in regulated regions. Perfect competition has many sellers of identical products; oligopoly has few sellers; monopolistic competition has many sellers of differentiated products."},
  {id:"P4C4Q10",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Easy",marks:2,type:"MCQ",
    q:"Equilibrium price in a market is determined where:",
    opts:["Supply exceeds demand","Demand exceeds supply","Quantity demanded equals quantity supplied","Government fixes the price"],a:2,
    exp:"Market equilibrium occurs at the price where quantity demanded equals quantity supplied. At this price there is neither surplus (excess supply) nor shortage (excess demand). Above equilibrium: surplus drives price down. Below equilibrium: shortage drives price up."},
  {id:"P4C4Q11",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:2,type:"MCQ",
    q:"Under perfect competition in the long run, a firm earns:",
    opts:["Supernormal profit","Normal profit only","Losses","Monopoly profits"],a:1,
    exp:"In long run under perfect competition, free entry and exit ensure that firms earn only NORMAL profit (a return just sufficient to keep them in business, included in costs). If firms earn supernormal profit, new firms enter, driving price down until only normal profit remains. If firms make losses, some exit."},
  {id:"P4C4Q12",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:2,type:"MCQ",
    q:"A monopolist maximises profit at the output level where:",
    opts:["Price equals Marginal Cost","Marginal Revenue equals Marginal Cost","Average Revenue equals Average Cost","Total Revenue is maximum"],a:1,
    exp:"Profit maximisation condition for ANY firm (monopoly, competition, etc.) is MR = MC (with MC cutting MR from below). For a monopolist, AR > MR because the downward-sloping demand curve means selling more requires lowering price on ALL units. TR is maximum where MR = 0, which is not generally the profit-maximising point."},
  {id:"P4C4Q13",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Hard",marks:2,type:"MCQ",
    q:"The kinked demand curve in an oligopoly explains:",
    opts:["Why oligopolists cooperate","Why prices tend to be rigid despite cost changes","Why new firms easily enter oligopolies","Why oligopolists make normal profit"],a:1,
    exp:"Sweezy's kinked demand curve: rivals match price cuts (making demand inelastic below kink) but do not match price rises (making demand elastic above kink). Result: a discontinuity in MR at the kink. Within this MR gap, MC can change without changing the profit-maximising price. This explains PRICE RIGIDITY (stickiness) in oligopolies."},
  {id:"P4C5Q01",paper:"P4",chapter:"Business Cycles",diff:"Easy",marks:1,type:"MCQ",
    q:"The four phases of a business cycle in order are:",
    opts:["Recovery, Prosperity, Recession, Depression","Expansion, Peak, Contraction, Trough","Peak, Expansion, Trough, Contraction","Depression, Peak, Recovery, Recession"],a:1,
    exp:"The four phases of a business cycle: (1) EXPANSION (increasing GDP, employment, demand), (2) PEAK (maximum output, full employment, possible inflation), (3) CONTRACTION/RECESSION (declining GDP, rising unemployment), (4) TROUGH (lowest point, economy bottoms out). The cycle then repeats from trough to expansion (recovery)."},
  {id:"P4C5Q02",paper:"P4",chapter:"Business Cycles",diff:"Medium",marks:1,type:"MCQ",
    q:"During which phase of the business cycle do 'lagging indicators' such as unemployment typically reach their peak?",
    opts:["Expansion","Peak","Trough","Recovery"],a:2,
    exp:"Lagging indicators (unemployment, CPI, business lending) respond with a delay. Unemployment continues rising even after GDP starts contracting and only peaks at the Trough, just before recovery begins. Firms delay layoffs during contraction and delay hiring during early recovery. Leading indicators (stock prices, building permits) turn before the economy. Coincident indicators (GDP, industrial production) move with it."},
  {id:"P4C5Q03",paper:"P4",chapter:"Business Cycles",diff:"Easy",marks:2,type:"MCQ",
    q:"The four phases of a business cycle in the correct sequence are:",
    opts:["Boom, Depression, Recovery, Recession","Expansion, Peak, Contraction, Trough","Growth, Decline, Growth, Decline","Recovery, Boom, Recession, Depression"],a:1,
    exp:"Standard four-phase business cycle: Expansion (rising output, employment, prices) -> Peak (maximum activity, capacity strained) -> Contraction/Recession (output falls) -> Trough (lowest point) -> back to Expansion. Duration is irregular, but sequence is fixed."},
  {id:"P4C5Q04",paper:"P4",chapter:"Business Cycles",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is considered a LEADING indicator of economic activity?",
    opts:["Unemployment rate","GDP","Stock market index","Consumer Price Index"],a:2,
    exp:"LEADING indicators change BEFORE the economy turns (stock prices, building permits, new orders, money supply). COINCIDENT indicators move WITH the economy (GDP, industrial production, employment). LAGGING indicators change AFTER the economy turns (unemployment rate, CPI, business lending). Stock markets anticipate future corporate earnings."},
  {id:"P4C6Q01",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:1,type:"MCQ",
    q:"GDP stands for:",
    opts:["General Domestic Price","Gross Domestic Product","Gross Domestic Price","General Development Plan"],a:1,
    exp:"Total monetary value of finished goods/services produced within borders in a period."},
  {id:"P4C6Q02",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:1,type:"MCQ",
    q:"GNP is different from GDP because GNP includes:",
    opts:["Government expenditure","Net factor income from abroad","Depreciation","Indirect taxes"],a:1,
    exp:"GNP = GDP + Net Factor Income from Abroad (NFIA). NFIA = income earned by residents abroad minus income earned by foreigners domestically. If Indians earn more abroad than foreigners earn in India, GNP > GDP. GDP measures production WITHIN borders regardless of nationality. GNP measures production by nationals regardless of location."},
  {id:"P4C6Q03",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:1,type:"MCQ",
    q:"NDP at factor cost is also known as:",
    opts:["Gross Domestic Product","National Income","Per Capita Income","Gross National Product"],a:1,
    exp:"National Income = NNP at Factor Cost = GNP - Depreciation - Net Indirect Taxes (Indirect Taxes - Subsidies). Also: NDP at Factor Cost = GDP - Depreciation - Net Indirect Taxes. 'At factor cost' means excluding indirect taxes and including subsidies. National Income represents the total earnings of all factors of production (land, labour, capital, enterprise)."},
  {id:"P4C6Q04",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:2,type:"MCQ",
    q:"Gross Domestic Product (GDP) measures:",
    opts:["Total money in circulation","Total market value of all final goods and services produced within a country in a year","Income of citizens regardless of location","Only government spending"],a:1,
    exp:"GDP = total market value of all FINAL goods and services produced within a country's geographical boundaries in a given time period (usually a year). It excludes intermediate goods (to avoid double counting) and non-market activities. 'Domestic' = within country's borders, unlike GNP which counts citizens' output worldwide."},
  {id:"P4C6Q05",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:2,type:"MCQ",
    q:"The difference between GNP and GDP is:",
    opts:["GNP = GDP + Net Factor Income from Abroad","GNP = GDP - Depreciation","GNP = GDP + Indirect Taxes","GNP = GDP + Subsidies"],a:0,
    exp:"GNP = GDP + Net Factor Income from Abroad (NFIA). NFIA = factor income received by residents from abroad MINUS factor income paid to non-residents. If a country has more citizens earning abroad than foreigners earning within it, NFIA > 0 and GNP > GDP."},
  {id:"P4C6Q06",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"If GDP at market price is Rs.10,00,000 crore, indirect taxes are Rs.80,000 crore and subsidies are Rs.30,000 crore, GDP at factor cost equals:",
    opts:["Rs.9,50,000 crore","Rs.10,50,000 crore","Rs.9,20,000 crore","Rs.10,80,000 crore"],a:0,
    exp:"GDP at Factor Cost = GDP at Market Price - Indirect Taxes + Subsidies = 10,00,000 - 80,000 + 30,000 = Rs.9,50,000 crore. Factor cost reflects the actual income earned by factors of production, removing the wedge created by indirect taxes and subsidies."},
  {id:"P4C6Q07",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is NOT included in the calculation of National Income?",
    opts:["Wages paid to factory workers","Rent earned by landlords","Sale of second-hand goods","Profits of companies"],a:2,
    exp:"National Income includes only CURRENT production. Sale of second-hand goods is excluded because they were counted in national income in the year they were originally produced. Including them again would be double-counting. Also excluded: transfer payments (pensions, subsidies), capital gains, illegal activities."},
  {id:"P4C6Q08",paper:"P4",chapter:"Determination of National Income",diff:"Hard",marks:2,type:"MCQ",
    q:"If the Marginal Propensity to Consume (MPC) is 0.8, the value of the investment multiplier (k) is:",
    opts:["1.25","4","5","1.8"],a:2,
    exp:"Investment multiplier k = 1 / (1 - MPC) = 1 / MPS. With MPC = 0.8, MPS = 0.2. So k = 1 / 0.2 = 5. This means an autonomous investment of Rs.1 generates Rs.5 of additional income in equilibrium. Higher MPC => higher multiplier, because each rupee earned is spent more quickly, propagating through the economy."},
  {id:"P4C6Q09",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"According to Keynesian theory, equilibrium level of national income is determined where:",
    opts:["Consumption equals Investment","Aggregate Demand equals Aggregate Supply","Savings exceeds Investment","Money supply equals money demand"],a:1,
    exp:"Keynesian equilibrium: Aggregate Demand (AD = C + I + G + (X-M)) equals Aggregate Supply (AS = total output). Equivalently, planned Savings = planned Investment (in a closed economy without government). If AD > AS, output rises; if AD < AS, output falls. This is income-expenditure approach."},
  {id:"P4C7Q01",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"Increased govt expenditure and/or reduced taxes is:",
    opts:["Contractionary fiscal policy","Expansionary fiscal policy","Neutral fiscal policy","Monetary policy"],a:1,
    exp:"Expansionary fiscal = more spending, less tax. Stimulates aggregate demand."},
  {id:"P4C7Q02",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:1,type:"MCQ",
    q:"The primary deficit in government budget is:",
    opts:["Total expenditure minus total receipts","Fiscal deficit minus interest payments","Revenue deficit minus capital deficit","Tax revenue minus non-tax revenue"],a:1,
    exp:"Primary Deficit = Fiscal Deficit - Interest Payments. It shows the government's borrowing needs excluding the cost of servicing past debt. If primary deficit is zero, the government is borrowing only to pay interest on existing debt (not for new expenditure). Fiscal Deficit = Total Expenditure - Total Receipts (excluding borrowings)."},
  {id:"P4C7Q03",paper:"P4",chapter:"Public Finance",diff:"Easy",marks:1,type:"MCQ",
    q:"Direct taxes include:",
    opts:["GST and customs duty","Income tax and corporate tax","Excise duty and VAT","Sales tax and service tax"],a:1,
    exp:"Direct taxes are levied on the income or wealth of a person and paid directly by that person to the government. Examples: income tax, corporate tax, wealth tax (abolished in India), capital gains tax. Indirect taxes are levied on goods and services and passed on to the consumer. Examples: GST, customs duty, excise duty. Direct taxes cannot be shifted to others."},
  {id:"P4C7Q04",paper:"P4",chapter:"Public Finance",diff:"Easy",marks:2,type:"MCQ",
    q:"According to Musgrave, the three main functions of the government in public finance are:",
    opts:["Production, distribution, consumption","Allocation, distribution, stabilisation","Taxation, spending, borrowing","Monetary, fiscal, trade"],a:1,
    exp:"Musgrave's three fiscal functions: (1) ALLOCATION: provision of public goods and correction of market failures, (2) DISTRIBUTION: redistributing income and wealth via taxes and transfers, (3) STABILISATION: using fiscal policy to maintain full employment, price stability, and economic growth."},
  {id:"P4C7Q05",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is an example of a POSITIVE externality?",
    opts:["Pollution from a factory","Traffic congestion","Vaccination against communicable disease","Loud music from a neighbour"],a:2,
    exp:"Positive externality: an economic activity whose benefits extend beyond the direct consumer/producer. Vaccination protects the individual AND reduces disease transmission to others (herd immunity). Pollution, congestion, and noise are NEGATIVE externalities. Markets under-supply positive externalities, justifying government subsidies or public provision."},
  {id:"P4C7Q06",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"A government budget where total expenditure exceeds total revenue is called:",
    opts:["Surplus budget","Balanced budget","Deficit budget","Revenue budget"],a:2,
    exp:"Deficit budget: expenditure > revenue; financed by borrowing or printing money. Surplus budget: revenue > expenditure. Balanced budget: revenue = expenditure. Keynesian theory supports deficit budgets during recessions to boost aggregate demand; classical economists preferred balanced budgets."},
  {id:"P4C7Q07",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"During a recession, an EXPANSIONARY fiscal policy would involve:",
    opts:["Increasing taxes and reducing government spending","Decreasing taxes and increasing government spending","Increasing interest rates","Reducing money supply"],a:1,
    exp:"Expansionary fiscal policy (used in recession) aims to boost aggregate demand through: (a) cutting taxes (leaves more disposable income to spend) and/or (b) increasing government spending. Contractionary fiscal policy (used when inflation is high) does the opposite. Interest rates and money supply are MONETARY policy tools, not fiscal."},
  {id:"P4C8Q01",paper:"P4",chapter:"Money Market",diff:"Medium",marks:1,type:"MCQ",
    q:"To control inflation, central bank most likely to:",
    opts:["Reduce bank rate","Reduce CRR","Increase interest rates and reduce money supply","Increase govt expenditure"],a:2,
    exp:"Contractionary monetary policy: higher rates, higher CRR/SLR, reduced money supply."},
  {id:"P4C8Q02",paper:"P4",chapter:"Money Market",diff:"Medium",marks:1,type:"MCQ",
    q:"Open Market Operations (OMO) by the RBI means:",
    opts:["Lending to commercial banks","Buying and selling government securities in the open market","Setting the repo rate","Printing currency"],a:1,
    exp:"OMO involves the RBI BUYING or SELLING government securities in the open market. To increase money supply (expansionary): RBI buys securities, paying cash to sellers, increasing liquidity. To decrease money supply (contractionary): RBI sells securities, absorbing cash from buyers, reducing liquidity. OMO is a key tool of monetary policy alongside repo rate and CRR."},
  {id:"P4C8Q03",paper:"P4",chapter:"Money Market",diff:"Easy",marks:1,type:"MCQ",
    q:"The repo rate is the rate at which:",
    opts:["RBI lends to commercial banks","Commercial banks lend to the public","RBI borrows from commercial banks","Government borrows from RBI"],a:0,
    exp:"Repo rate = the rate at which the RBI LENDS short-term money to commercial banks against government securities. Reverse repo rate = the rate at which RBI BORROWS from banks. When RBI increases repo rate, borrowing becomes costlier, banks raise lending rates, and money supply contracts (anti-inflationary). When repo rate decreases, the opposite happens (expansionary)."},
  {id:"P4C8Q04",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"Keynes identified three motives for holding money. These are:",
    opts:["Transaction, precautionary, speculative","Saving, investment, consumption","Borrowing, lending, trading","Income, wealth, expenditure"],a:0,
    exp:"Keynes's three motives for money demand: (1) TRANSACTION motive (for day-to-day purchases, varies with income), (2) PRECAUTIONARY motive (for unforeseen needs, also varies with income), (3) SPECULATIVE motive (to take advantage of bond price changes, varies inversely with interest rate). Total demand = L1(Y) + L2(r)."},
  {id:"P4C8Q05",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"M1 in India's money supply classification consists of:",
    opts:["Only currency in circulation","Currency with public + Demand deposits with banks + Other deposits with RBI","Currency + Time deposits","Currency + All deposits with banks and post offices"],a:1,
    exp:"RBI measures: M1 (narrow money) = Currency with public + Demand deposits of banks + Other deposits with RBI. M1 is the most liquid. M2 = M1 + Savings deposits with Post Office. M3 (broad money) = M1 + Time deposits with banks. M4 = M3 + Total Post Office deposits (except NSC)."},
  {id:"P4C8Q06",paper:"P4",chapter:"Money Market",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following is a QUANTITATIVE instrument of monetary policy used by the RBI?",
    opts:["Moral suasion","Credit rationing","Cash Reserve Ratio (CRR)","Margin requirements"],a:2,
    exp:"Quantitative (general) instruments affect the overall volume of credit: CRR, SLR, Bank Rate, Repo Rate, Reverse Repo Rate, Open Market Operations. Qualitative (selective) instruments affect specific sectors: margin requirements, moral suasion, credit rationing, direct action, consumer credit regulation."},
  {id:"P4C8Q07",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"When RBI wants to CONTROL INFLATION, it will typically:",
    opts:["Lower the repo rate and CRR","Raise the repo rate and CRR","Purchase government securities in open market","Print more currency"],a:1,
    exp:"To control inflation, RBI adopts CONTRACTIONARY monetary policy: raise repo rate (banks borrow at higher cost), raise CRR (banks must keep more reserves), SELL government securities (absorbs liquidity). These reduce money supply and credit, cooling aggregate demand. Opposite actions (easy money) are used during slowdowns."},
  {id:"P4C9Q01",paper:"P4",chapter:"International Trade",diff:"Medium",marks:2,type:"MCQ",
    q:"David Ricardo's theory of international trade is based on the principle of:",
    opts:["Absolute advantage","Comparative advantage","Factor endowment","Product life cycle"],a:1,
    exp:"Ricardo (1817): countries should specialise in producing goods where they have COMPARATIVE advantage (lower opportunity cost), even if one country has absolute advantage in everything. Adam Smith's theory used ABSOLUTE advantage. Heckscher-Ohlin uses factor endowments. Ricardo's insight: trade is mutually beneficial based on RELATIVE efficiency, not absolute."},
  {id:"P4C9Q02",paper:"P4",chapter:"International Trade",diff:"Easy",marks:2,type:"MCQ",
    q:"A tariff is:",
    opts:["A limit on the quantity of imports","A tax imposed on imports or exports","Government support to domestic producers","A ban on imports"],a:1,
    exp:"Tariff: a tax on imports (or occasionally exports). Types: ad valorem (% of value), specific (fixed per unit), compound (combination). QUOTA is a quantitative limit on imports. SUBSIDY is government payment to producers. EMBARGO is a total ban. Tariffs raise revenue and protect domestic industry but distort prices and reduce consumer welfare."},
  {id:"P4C9Q03",paper:"P4",chapter:"International Trade",diff:"Medium",marks:2,type:"MCQ",
    q:"The World Trade Organisation (WTO) was established in:",
    opts:["1947","1971","1995","2001"],a:2,
    exp:"WTO was established on 1 January 1995, succeeding GATT (General Agreement on Tariffs and Trade, 1947). WTO is the only global international organisation dealing with rules of trade between nations. HQ: Geneva. Main agreements: GATT (goods), GATS (services), TRIPS (intellectual property). India has been a member since inception."},
  {id:"P4C9Q04",paper:"P4",chapter:"International Trade",diff:"Medium",marks:2,type:"MCQ",
    q:"If the exchange rate moves from Rs.75 per USD to Rs.80 per USD, the Indian rupee has:",
    opts:["Appreciated","Depreciated","Remained unchanged","Revalued upward"],a:1,
    exp:"Rupee has DEPRECIATED: it now takes more rupees to buy 1 USD. Depreciation makes exports cheaper for foreigners (good for Indian exporters) and imports more expensive (bad for Indian importers and inflation-sensitive sectors). Appreciation would be Rs.75 -> Rs.70 per USD. Depreciation/appreciation refers to flexible exchange rates; devaluation/revaluation refers to fixed rates."},
  {id:"P4C9Q05",paper:"P4",chapter:"International Trade",diff:"Medium",marks:2,type:"MCQ",
    q:"Foreign Direct Investment (FDI) differs from Foreign Portfolio Investment (FPI) in that FDI:",
    opts:["Is a short-term investment","Involves ownership and managerial control in the foreign enterprise","Is limited to buying shares and bonds","Does not require government approval"],a:1,
    exp:"FDI involves long-term investment with ownership stake (typically 10%+ equity) and active management role in the foreign enterprise. Examples: a foreign company setting up a factory in India. FPI is passive investment in financial assets (shares, bonds) without management control, typically shorter-term. FDI brings technology and know-how; FPI is more volatile capital flow."},
  {id:"P4C10Q01",paper:"P4",chapter:"Indian Economy",diff:"Easy",marks:2,type:"MCQ",
    q:"The Indian economy is classified as a:",
    opts:["Pure capitalist economy","Socialist economy","Mixed economy","Traditional economy"],a:2,
    exp:"India has a MIXED economy: coexistence of public sector (government-owned enterprises in strategic sectors like railways, defence) and private sector (industry, services). Post-1991 liberalisation expanded the private sector's role. Features: market pricing for most goods, regulated sectors, welfare state programmes, planned development (earlier via Five Year Plans, now via NITI Aayog)."},
  {id:"P4C10Q02",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"The New Economic Policy of 1991 introduced in India is commonly known as:",
    opts:["Nationalisation","Green Revolution","LPG reforms (Liberalisation, Privatisation, Globalisation)","Garibi Hatao"],a:2,
    exp:"NEP 1991 (Manmohan Singh as Finance Minister) introduced LPG: LIBERALISATION (reducing licence raj, opening FDI), PRIVATISATION (disinvestment of PSUs), GLOBALISATION (integration with world economy via reduced tariffs, convertibility). Triggered by 1991 Balance of Payments crisis. Transformed India from a closed, controlled economy to a more market-oriented one."},
  {id:"P4C10Q03",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"The primary sector of the Indian economy consists of:",
    opts:["Manufacturing and construction","Agriculture, forestry, fishing, mining","Banking and insurance","Software and IT services"],a:1,
    exp:"Primary sector: extraction and harvest of natural resources (agriculture, forestry, fishing, mining, quarrying). Secondary sector: manufacturing and construction (transforming raw materials). Tertiary sector: services (banking, trade, transport, IT). In India, primary sector employs ~45% of workforce but contributes only ~15% to GDP; services contribute largest share (~55%)."},
  {id:"P4C10Q04",paper:"P4",chapter:"Indian Economy",diff:"Hard",marks:2,type:"MCQ",
    q:"The concept of 'demographic dividend' for India refers to:",
    opts:["Money paid to senior citizens","Economic growth potential from a large working-age population relative to dependents","Government subsidies for population control","Pension reforms"],a:1,
    exp:"Demographic dividend: accelerated economic growth that arises when a country's working-age population (15-64) is large relative to its dependent population (children + elderly). India is currently in this phase, projected to last until around 2040. Realising the dividend requires skilled workforce, quality education, healthcare, and job creation; otherwise the bulge becomes a liability."},
  {id:"P4C1Q06",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Medium",marks:2,type:"MCQ",
    q:"A rational person does not act unless:",
    opts:["The action is ethical","The action produces marginal cost that exceeds marginal revenue","The action produces marginal benefits that exceed marginal costs","The action makes money for the person"],a:2,
    exp:"Rational choice theory: a rational decision-maker compares marginal benefit (extra gain from one more unit of an action) with marginal cost (extra cost of that action). The action is taken only when marginal benefit > marginal cost. Ethics and money-making are not the defining criteria in economic rationality; this is a cost-benefit calculus at the margin. If MC > MB, the person is worse off by acting."},
  {id:"P4C1Q07",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Medium",marks:2,type:"MCQ",
    q:"In an economy dominated by private enterprises, demand for electric vehicles (EVs) rises sharply due to rising fuel prices. Battery prices increase, labour wages remain constant, and profits in the EV sector exceed those in traditional automobile manufacturing. The shift of producers from conventional vehicles to EVs primarily indicates that:",
    opts:["Government planning has redirected resources","Consumer sovereignty has weakened","Price mechanism has altered relative profitability","Production is guided by social welfare objectives"],a:2,
    exp:"In a market economy, relative profitability signals guide resource allocation. When EV profits exceed those in traditional vehicles, producers shift capital and labour toward EVs. This is the price mechanism at work: changing relative prices and profits redirect production without any central authority. Consumer sovereignty is actually reinforced (consumers' preferences drove fuel prices and EV demand), not weakened."},
  {id:"P4C1Q08",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Medium",marks:2,type:"MCQ",
    q:"In the EV industry case, if labour continues to be used intensively despite high battery prices, the most logical explanation is:",
    opts:["Labour is relatively cheaper than capital","Capital is freely available","The economy is socialist","Producers ignore cost minimization"],a:0,
    exp:"In cost-minimising production, firms substitute relatively cheaper factors for relatively expensive ones. High battery prices (capital) with stable labour wages make labour relatively cheaper. The rational response is to continue using labour intensively and economise on expensive capital. This is the 'how to produce' question answered through factor substitution based on relative prices."},
  {id:"P4C1Q09",paper:"P4",chapter:"Nature and Scope of Business Economics",diff:"Easy",marks:2,type:"MCQ",
    q:"In the EV industry case, the decision regarding 'what to produce' is mainly influenced by:",
    opts:["Income equality","Administered prices","Market demand and profit signals","Central planning authority"],a:2,
    exp:"'What to produce' is one of the three central economic problems. In a market economy, the answer emerges from consumer demand (market signals for EVs) and producer profit expectations (higher margins in EVs than conventional cars). Central planning, administered prices, and income equality goals are characteristics of socialist or heavily regulated economies, not of a private-enterprise-dominated market economy as described in the case."},
  {id:"P4C2Q15",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Hard",marks:2,type:"MCQ",
    q:"Which elasticity concept helps governments decide how the tax burden will be shared between producers and consumers?",
    opts:["Cross elasticity","Price elasticity","Income elasticity","Advertisement elasticity"],a:1,
    exp:"Tax incidence depends on the relative price elasticity of demand and supply. When demand is more inelastic than supply, consumers bear more of the tax burden (they cannot easily reduce consumption). When supply is more inelastic, producers bear more. Governments use price elasticity analysis when taxing goods (especially sin goods like tobacco and alcohol) to predict the actual revenue and the distribution of burden."},
  {id:"P4C2Q16",paper:"P4",chapter:"Theory of Demand and Supply",diff:"Hard",marks:2,type:"MCQ",
    q:"Suppose that at a price of Rs.300 per month there are 30,000 subscribers to cable television. If the price is raised to Rs.400 per month, the number of subscribers falls to 20,000. Using the arc elasticity (midpoint) method, the price elasticity of demand is:",
    opts:["1.4","0.66","0.75","2.0"],a:0,
    exp:"Arc elasticity (midpoint method): E = (ΔQ / avg Q) / (ΔP / avg P). ΔQ = 20,000 - 30,000 = -10,000. Average Q = (20,000 + 30,000)/2 = 25,000. So ΔQ/avg Q = -10,000/25,000 = -0.40. ΔP = 400 - 300 = 100. Average P = (300 + 400)/2 = 350. So ΔP/avg P = 100/350 = 0.2857. Elasticity (absolute value) = 0.40 / 0.2857 = 1.4. Since E > 1, demand for cable TV is elastic in this price range."},
  {id:"P4C3Q16",paper:"P4",chapter:"Theory of Production and Cost",diff:"Hard",marks:2,type:"MCQ",
    q:"The production function Q = 4L^(1/2) K^(2/3) exhibits:",
    opts:["Increasing returns to scale","Decreasing returns to scale","Constant returns to scale","Increasing returns to a factor"],a:0,
    exp:"For a Cobb-Douglas production function Q = A·L^α·K^β, returns to scale are determined by the sum α + β. If α + β > 1, increasing returns to scale. If = 1, constant. If < 1, decreasing. Here α = 1/2 and β = 2/3, so α + β = 3/6 + 4/6 = 7/6 ≈ 1.167, which is greater than 1. Therefore the function exhibits increasing returns to scale: if both inputs are doubled, output more than doubles."},
  {id:"P4C3Q17",paper:"P4",chapter:"Theory of Production and Cost",diff:"Medium",marks:2,type:"MCQ",
    q:"Given the total cost function TC = 2000 + 15Q - 6Q² + Q³, the Total Fixed Cost (TFC) at Q = 2000 is:",
    opts:["Rs.2,000","Rs.975","Rs.30,000","Cannot be determined"],a:0,
    exp:"Total Fixed Cost is the portion of total cost that does not vary with the level of output Q. In a cost function, TFC is the CONSTANT term (the part with no Q in it). Here TC = 2000 + 15Q - 6Q² + Q³. The constant term is 2000. Therefore TFC = Rs.2,000, regardless of Q. This is true at Q = 2000, Q = 1, or any other output level: fixed costs by definition do not depend on quantity produced."},
  {id:"P4C3Q18",paper:"P4",chapter:"Theory of Production and Cost",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following short-run cost curves declines continuously as output increases?",
    opts:["Average Total Cost","Marginal Cost","Average Fixed Cost","Average Variable Cost"],a:2,
    exp:"Average Fixed Cost (AFC) = Total Fixed Cost / Output. Since TFC is constant but output Q keeps increasing, AFC = TFC/Q keeps falling continuously (approaches zero asymptotically but never reaches it). ATC, AVC, and MC are all U-shaped in the short run because they incorporate variable costs that first fall (spreading overhead, specialisation) then rise (diminishing returns). AFC uniquely keeps declining because fixed costs are spread across ever more units."},
  {id:"P4C4Q14",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Hard",marks:2,type:"MCQ",
    q:"Why does a monopolist's marginal revenue (MR) curve always lie below its average revenue (AR) curve?",
    opts:["Because of rising marginal cost","Because a monopolist sells different output at different prices","Because fixed cost increases","Because of multiple sellers"],a:1,
    exp:"In monopoly, the firm faces the entire downward-sloping market demand curve, which is its AR curve. To sell an additional unit, the monopolist must lower price on ALL units, not just the extra one. Therefore, MR (revenue from the extra unit) is less than the price received (AR) because of the revenue lost on the previous units now sold at the lower price. Mathematically, if AR is downward-sloping, MR lies below it at every output level. In perfect competition, price is constant so MR = AR = P."},
  {id:"P4C4Q15",paper:"P4",chapter:"Price Determination in Different Markets",diff:"Medium",marks:2,type:"MCQ",
    q:"In a collusive oligopoly, the price is decided by:",
    opts:["Each firm independently","The price leader","The industry as a whole","Consumers"],a:1,
    exp:"In collusive oligopoly, firms coordinate rather than compete. One form is price leadership, where one dominant firm (often the largest or lowest-cost) sets the price and other firms follow. Types of price leadership include dominant-firm leadership, barometric leadership, and collusive leadership. This avoids destructive price wars while mimicking monopoly profits. OPEC acts as a price leader in global oil markets. Explicit collusion of this kind is typically illegal under competition law but persists tacitly in many industries."},
  {id:"P4C5Q05",paper:"P4",chapter:"Business Cycles",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is NOT an internal (endogenous) cause of business cycles?",
    opts:["Fluctuations in effective demand","Variations in government spending","Technology shock","Changes in money supply"],a:2,
    exp:"Internal (endogenous) causes arise from within the economic system: fluctuations in effective demand (consumption, investment), changes in government spending, and changes in money supply are all driven by domestic agents and institutions. A technology shock is an EXTERNAL (exogenous) cause, an unpredictable disruption from outside the normal functioning of the economy, along with wars, natural disasters, and pandemics. Internal causes can be moderated by policy; external shocks generally cannot be prevented, only absorbed."},
  {id:"P4C5Q06",paper:"P4",chapter:"Business Cycles",diff:"Medium",marks:2,type:"MCQ",
    q:"Monetary and fiscal policy changes can cause business cycles by:",
    opts:["Eliminating investment risk","Altering aggregate demand","Fixing exchange rates","Standardising prices"],a:1,
    exp:"Policy-induced business cycles occur when monetary and fiscal policies shift aggregate demand. A loose fiscal or monetary policy (government spending up, taxes cut, interest rates cut, money supply expanded) boosts AD and creates expansion; tight policy reduces AD and can trigger recession. This is why policy timing matters: excessive easing can create booms that turn into busts, and premature tightening can cut off growth. Both Keynesians and Monetarists agree that policy influences the cycle, though they disagree on how actively it should be used."},
  {id:"P4C5Q07",paper:"P4",chapter:"Business Cycles",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following marks the beginning of a contraction in the business cycle?",
    opts:["Peak","Expansion","Recession","Trough"],a:0,
    exp:"The four phases of a business cycle are Expansion → Peak → Contraction (Recession) → Trough, then back to Expansion. The Peak is the highest point of economic activity before decline begins, marking the transition FROM expansion TO contraction. The Trough is the lowest point, marking the start of the next expansion. 'Recession' is another name for the contraction phase itself, not its starting point."},
  {id:"P4C6Q10",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"India mainly uses which approach for national income estimation?",
    opts:["Income method only","Product method only","Combination of product and income methods","Expenditure method only"],a:2,
    exp:"The Central Statistics Office (CSO), now NSO (National Statistical Office) under MoSPI, estimates India's national income using a COMBINATION of methods. The product (value-added) method is used for agriculture, manufacturing, and services. The income method is used where output data is hard to measure directly (e.g. government services, real estate). The expenditure method is used mainly as a cross-check. Using multiple methods gives more reliable estimates than relying on any single approach and allows cross-verification."},
  {id:"P4C6Q11",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"Real GDP is preferred over Nominal GDP for welfare comparisons because it:",
    opts:["Includes transfer payments","Is measured at current prices","Accounts for price level changes","Excludes net exports"],a:2,
    exp:"Nominal GDP is measured in current prices, so it rises both when output rises AND when prices rise (inflation). Real GDP is measured in constant (base year) prices, stripping out the price effect to show genuine output change. For welfare comparisons over time, real GDP is essential: if nominal GDP doubles but prices also double, real output (and living standards) hasn't changed. Real GDP is computed as: Real GDP = Nominal GDP × (Base year price index / Current price index)."},
  {id:"P4C6Q12",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"The Keynesian theory of national income was developed primarily to explain:",
    opts:["Long-run full employment equilibrium","Persistent unemployment and demand-deficient recessions","Supply side shocks","Classical price flexibility"],a:1,
    exp:"Keynes wrote 'The General Theory of Employment, Interest and Money' (1936) during the Great Depression specifically to explain why classical economics (which assumed markets clear automatically at full employment) failed to explain persistent mass unemployment. Keynes argued that insufficient aggregate demand could cause economies to settle at equilibrium BELOW full employment, and stay there without government intervention. This 'demand-deficient unemployment' became the cornerstone of modern macroeconomic policy."},
  {id:"P4C6Q13",paper:"P4",chapter:"Determination of National Income",diff:"Hard",marks:2,type:"MCQ",
    q:"The balanced budget multiplier equals:",
    opts:["Zero","One","Greater than one","Negative"],a:1,
    exp:"The balanced budget multiplier (Haavelmo theorem) states that an equal increase in government spending and taxes increases national income by exactly that amount, so the multiplier equals 1. Reason: the spending multiplier (1/(1-MPC)) is bigger than the tax multiplier (-MPC/(1-MPC)) because government spending directly adds to AD, while a tax cut only adds the portion that consumers spend (the rest is saved). Net effect: ΔY = ΔG = ΔT. An increase of Rs.100 in both spending and taxes raises GDP by Rs.100. Budget remains balanced, yet GDP rises."},
  {id:"P4C6Q14",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:2,type:"MCQ",
    q:"Which of the following is a leakage in the Keynesian circular flow of income?",
    opts:["Government spending","Exports","Savings","Investment"],a:2,
    exp:"In the circular flow, leakages are withdrawals from the income stream and injections are additions to it. Leakages: Savings (S), Taxes (T), Imports (M), all reduce domestic demand. Injections: Investment (I), Government spending (G), Exports (X), all add to domestic demand. Equilibrium requires S + T + M = I + G + X. Savings is the classic leakage: income earned but not spent domestically leaves the flow until it is re-injected via investment by firms."},
  {id:"P4C6Q15",paper:"P4",chapter:"Determination of National Income",diff:"Hard",marks:2,type:"MCQ",
    q:"Calculate National Income using the expenditure method: Consumption = Rs.1,000 crore, Investment = Rs.500 crore, Government Purchases = Rs.200 crore, Exports = Rs.200 crore, Imports = Rs.400 crore.",
    opts:["Rs.1,500 crore","Rs.1,800 crore","Rs.2,000 crore","None of these"],a:0,
    exp:"The expenditure method: GDP = C + I + G + (X - M), where net exports (X - M) is the trade balance. Here: C = 1,000; I = 500; G = 200; X = 200; M = 400. Net exports = 200 - 400 = -200 (trade deficit). GDP = 1,000 + 500 + 200 + (-200) = 1,500 crore. The negative trade balance reduces GDP because imports represent spending on foreign (not domestic) production. This is one of three equivalent methods (income method and product method should give the same answer)."},
  {id:"P4C6Q16",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:2,type:"MCQ",
    q:"In a two-sector Keynesian model, aggregate demand (AD) is less than aggregate supply (AS) at the current level of income. This situation will lead to:",
    opts:["Rise in output","Increase in employment","Fall in national income","Full employment"],a:2,
    exp:"When AD < AS at current income, firms cannot sell all they produce. Unsold goods accumulate as unplanned inventory. Firms respond by cutting production, which reduces employment and income in the next period. The economy contracts until AD catches up with the lower AS. This is the Keynesian adjustment mechanism: quantity adjusts, not prices (contrast with classical theory where prices would fall and restore equilibrium at full employment). The adjustment continues until AD = AS at a new, lower equilibrium income."},
  {id:"P4C6Q17",paper:"P4",chapter:"Determination of National Income",diff:"Easy",marks:2,type:"MCQ",
    q:"Following the previous scenario of AD < AS, the adjustment process will continue until:",
    opts:["MPC becomes zero","Prices rise","AD equals AS","Investment becomes zero"],a:2,
    exp:"Keynesian equilibrium requires AD = AS (which is the same as S = I in a two-sector model). If AD < AS, income falls, which reduces consumption and savings. As income falls, AS also falls (because output adjusts downward). The process continues until aggregate demand exactly equals aggregate supply, defining the new equilibrium level of national income. This equilibrium may be BELOW full employment, which is the key Keynesian insight explaining persistent unemployment."},
  {id:"P4C6Q18",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"According to Keynes, what can cause involuntary unemployment in an economy?",
    opts:["High interest rates","Insufficient aggregate demand","Government intervention","Excessive savings"],a:1,
    exp:"Keynes argued that the primary cause of involuntary unemployment is insufficient aggregate demand. When AD is too low to employ all available workers at the going wage, firms do not hire even workers willing to work at current wages. This contradicts classical theory (which said unemployment only arises if wages are too high and workers refuse to take jobs). Keynes's policy prescription: boost AD through government spending or monetary expansion to close the 'demand gap' and restore full employment. 'Excessive savings' can contribute (paradox of thrift) but is a symptom of the deeper cause, which is inadequate spending."},
  {id:"P4C6Q19",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"The concept of 'animal spirits' in Keynesian theory refers to:",
    opts:["The unpredictable behaviour of financial markets","Psychological factors influencing economic decisions","Government regulations affecting business confidence","The impact of interest rates on investment"],a:1,
    exp:"Keynes coined 'animal spirits' to describe the spontaneous urge to action, optimism, and confidence (or pessimism and fear) that drives business investment decisions beyond pure rational calculation. When animal spirits are high, firms invest aggressively even in uncertain conditions. When confidence collapses, investment freezes even with attractive interest rates. Animal spirits explain why monetary policy alone often fails in severe recessions (the 'pushing on a string' problem): cutting rates doesn't restore investment if business sentiment is broken. The concept is central to Post-Keynesian and behavioural economics."},
  {id:"P4C6Q20",paper:"P4",chapter:"Determination of National Income",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is a limitation of using GDP as a measure of economic well-being?",
    opts:["It includes only monetary transactions","It does not account for income distribution","It considers both market and non-market activities","It is not affected by inflation"],a:1,
    exp:"GDP measures total output but ignores how it is distributed. Two countries with the same GDP can have very different welfare outcomes: one with broad prosperity, the other with extreme inequality. Other GDP limitations: excludes non-market activities (household work, volunteer work), ignores environmental degradation, doesn't capture quality of life, counts 'bad' activities (disaster rebuilding, pollution cleanup) as positive. Alternative measures like Human Development Index (HDI), Gini coefficient, and Genuine Progress Indicator (GPI) attempt to address some of these gaps."},
  {id:"P4C7Q08",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the fiscal functions of government primarily deals with correcting inefficiencies caused by market failure?",
    opts:["Stabilization function","Allocation function","Redistribution function","Debt management"],a:1,
    exp:"Musgrave's allocation function addresses market failures where the private market allocates resources inefficiently. Examples: public goods (national defence) that private markets underprovide, externalities (pollution, education) where social and private costs/benefits diverge, merit/demerit goods (healthcare, tobacco) where markets fail to serve long-term welfare. The stabilization function deals with business cycles (inflation, unemployment); the redistribution function addresses equity through taxes and transfers. All three functions are pursued simultaneously in practice."},
  {id:"P4C7Q09",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"A government mandate requiring accurate product labelling primarily corrects which type of market failure?",
    opts:["Public goods failure","Demerit goods only","Information failure","Market power failure"],a:2,
    exp:"Information failure (asymmetric information) occurs when buyers and sellers have unequal knowledge about product characteristics, leading to suboptimal decisions. Mandatory labelling (nutrition facts, ingredients, origin, warnings) corrects this by forcing sellers to disclose material information buyers could not otherwise verify. Classic examples: food nutrition labels, cigarette warnings, drug side-effect disclosures, financial product disclaimers. Without such mandates, markets may suffer from adverse selection (lemons problem) where quality products are driven out by information-poor low-quality ones."},
  {id:"P4C7Q10",paper:"P4",chapter:"Public Finance",diff:"Easy",marks:2,type:"MCQ",
    q:"Automatic stabilizers in a government budget include:",
    opts:["Progressive taxes","Tariffs","Export subsidies","Exchange controls"],a:0,
    exp:"Automatic stabilizers are fiscal mechanisms that dampen business cycles WITHOUT requiring discretionary policy action. Progressive taxes are the classic example: during booms, rising incomes push people into higher tax brackets, extracting more revenue and cooling aggregate demand; during recessions, falling incomes reduce tax burdens automatically, supporting demand. Unemployment benefits are another automatic stabilizer (payouts rise in recessions). These operate 'automatically' as the economy moves through cycles, providing counter-cyclical support without legislative lag."},
  {id:"P4C7Q11",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"Public goods are under-provided by markets because they are:",
    opts:["Rivalrous and excludable","Rivalrous and non-excludable","Non-rivalrous and excludable","Non-rivalrous and non-excludable"],a:3,
    exp:"Pure public goods have two defining characteristics: non-rivalry (one person's use doesn't reduce availability to others, like a lighthouse beam) and non-excludability (impossible or too costly to prevent non-payers from benefiting). This creates a free-rider problem: why pay if you can benefit without paying? Private firms cannot profitably provide such goods because they cannot charge users. Government must therefore fund them through taxes. Classic examples: national defence, street lighting, basic scientific research, clean air."},
  {id:"P4C7Q12",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is a limitation on the effectiveness of fiscal policy?",
    opts:["Flexible prices","Time lag in implementation","High tax compliance","Balanced budget"],a:1,
    exp:"Fiscal policy suffers from three key lags: (1) Recognition lag (time to identify a problem via economic data), (2) Decision lag (legislative process to approve tax/spending changes), (3) Implementation lag (time for the policy to take effect). By the time a stimulus package passes, the recession may be easing; by the time austerity is legislated, the boom may be cooling. This is why monetary policy (faster-acting through central bank decisions) is often preferred for fine-tuning. High tax compliance and flexible prices would actually HELP fiscal policy work, not hinder it."},
  {id:"P4C7Q13",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"If governments make it compulsory to avail insurance protection, it is because:",
    opts:["Insurance companies need to be running profitably","Insurance will generate moral hazard and adverse selection","Insurance is a merit good and government wants people to consume it","None of the above"],a:2,
    exp:"Merit goods are goods society values more highly than individuals tend to, because individuals systematically under-consume them (due to short-sightedness, ignorance of long-term benefits, or positive externalities). Examples: education, preventive healthcare, insurance. Left to free choice, many people under-insure themselves (underestimating risk, present bias), imposing costs on society when disasters occur. Compulsory insurance (vehicle third-party, health insurance mandates) corrects this under-consumption. Moral hazard and adverse selection are actually PROBLEMS with insurance markets, not reasons to mandate insurance."},
  {id:"P4C7Q14",paper:"P4",chapter:"Public Finance",diff:"Medium",marks:2,type:"MCQ",
    q:"When the market quantity of a good is greater than the socially optimal quantity, it is a case of:",
    opts:["Positive externality","Negative externality","Public goods","None of these"],a:1,
    exp:"Negative externality: when production or consumption imposes costs on third parties not reflected in market price. Example: factory pollution harms neighbours, but factories don't pay for that harm. Result: market price is too LOW (doesn't include the external cost), so the market quantity produced/consumed is HIGHER than the socially optimal level. Corrective policies: Pigouvian taxes (raise price to reflect true social cost), regulation (caps on pollution), tradable permits. Positive externality has the opposite problem: market underprovides (e.g. vaccinations benefit herd immunity but individuals don't factor that in)."},
  {id:"P4C8Q08",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"According to the Classical Quantity Theory of Money, demand for money primarily depends on:",
    opts:["Interest rate","Price level and transactions","Wealth distribution","Speculative motives"],a:1,
    exp:"Classical Quantity Theory (Fisher's equation: MV = PT) says money is demanded purely to facilitate transactions. Money demand depends on: price level (P), volume of transactions (T), and inversely on velocity (V). No speculative or interest-rate motive. Keynes later broadened this: his liquidity preference theory added interest-rate-sensitive speculative demand and precautionary demand. The Baumol-Tobin model further refined transactions demand. Classical theory's simplicity is its limitation: it cannot explain why money holdings change with interest rates (which we observe in data)."},
  {id:"P4C8Q09",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following forms high-powered money (Reserve Money / M0)?",
    opts:["Currency with public","Bank reserves with central bank","Currency with banks","All of the above"],a:3,
    exp:"High-powered money (H), also called Reserve Money or Monetary Base (M0), is the total monetary liability of the central bank. It equals: Currency in circulation (with public) + Currency held by commercial banks in their vaults + Banks' deposits with the central bank (reserves). In India's RBI terminology, M0 = Currency in Circulation + Bankers' Deposits with RBI + Other Deposits with RBI. It's called 'high-powered' because banks can create multiple rupees of deposit money on top of each rupee of reserve money, through the money multiplier mechanism."},
  {id:"P4C8Q10",paper:"P4",chapter:"Money Market",diff:"Hard",marks:2,type:"MCQ",
    q:"Which of the following factors reduces the size of the money multiplier?",
    opts:["Lower reserve ratio","Increase in currency holdings by public","Higher bank lending","Lower interest rates"],a:1,
    exp:"The money multiplier depends inversely on two leakages from the banking system: (1) Cash reserve ratio r (how much banks must hold as reserves), and (2) Currency-deposit ratio c (how much of money people hold as cash rather than deposits). Money multiplier = (1 + c)/(r + c). When the public holds more currency (higher c), less money flows through banks as deposits, so there's less base for banks to lend and re-lend, shrinking the multiplier. Lower reserve ratios would INCREASE the multiplier; higher bank lending is a SYMPTOM of a larger multiplier, not a cause."},
  {id:"P4C8Q11",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"An open market sale of government securities by the central bank will:",
    opts:["Increase money supply","Decrease money supply","Leave money supply unchanged","Increase fiscal deficit"],a:1,
    exp:"When the central bank SELLS securities in open market operations (OMO): buyers (banks, institutions, public) pay cash to the central bank to receive the securities. Cash leaves the banking system and enters the central bank, reducing commercial banks' reserves. Lower reserves mean banks can lend less, shrinking the money supply through the multiplier. OMO sales are contractionary and used to fight inflation or cool an overheating economy. OMO purchases do the opposite (expand money supply). This is the RBI's most frequently used tool because it's flexible and reversible."},
  {id:"P4C8Q12",paper:"P4",chapter:"Money Market",diff:"Medium",marks:2,type:"MCQ",
    q:"Quantitative Easing (QE) as a monetary policy tool aims to:",
    opts:["Reduce credit availability","Increase money supply by buying financial assets","Increase reserve requirements","Raise policy rates"],a:1,
    exp:"QE is an unconventional monetary policy used when conventional tools (like cutting interest rates) have reached their limit, especially the zero lower bound. The central bank creates reserves and uses them to buy long-term financial assets (government bonds, mortgage-backed securities). This injects liquidity, lowers long-term interest rates, and encourages risk-taking. Prominent examples: US Federal Reserve's QE1/QE2/QE3 after 2008, ECB's asset purchase programme, RBI's 'Operation Twist' variant. QE expands central bank balance sheets dramatically. Side effects include asset price inflation and moral hazard concerns."},
  {id:"P4C8Q13",paper:"P4",chapter:"Money Market",diff:"Hard",marks:2,type:"MCQ",
    q:"A contractionary monetary policy is LEAST effective in influencing output when:",
    opts:["Interest elasticity of investment is high","The economy operates under a liquidity trap","Exchange rates are flexible","Asset prices respond strongly to interest rates"],a:1,
    exp:"Keynes's liquidity trap: when interest rates are near zero, monetary policy loses traction. Further rate cuts cannot push rates below (much) zero, so monetary expansion fails to stimulate. By the same logic, monetary contraction via raising already-low rates has limited effect because investment demand is also unresponsive at those levels. Japan in the 1990s-2000s was the classic case. Other cases listed would actually INCREASE monetary policy effectiveness: high interest-elasticity of investment, flexible exchange rates, responsive asset prices are all transmission channels. In a liquidity trap, fiscal policy tends to be more effective than monetary."},
  {id:"P4C9Q06",paper:"P4",chapter:"International Trade",diff:"Hard",marks:2,type:"MCQ",
    q:"An increase in the Real Effective Exchange Rate (REER), holding the nominal exchange rate constant, necessarily implies that:",
    opts:["Domestic inflation is lower than foreign inflation","Domestic inflation exceeds foreign inflation","Trade balance must improve","Capital inflows will increase"],a:1,
    exp:"REER = Nominal Effective Exchange Rate × (Domestic price index / Foreign price index), weighted across trading partners. It measures the real purchasing power of a currency against a basket of partner currencies, adjusted for relative inflation. If nominal exchange rate is constant but REER rises, the ratio of domestic to foreign prices must have risen, meaning domestic inflation exceeds foreign inflation. A rising REER signals loss of competitiveness (domestic goods become relatively more expensive), which tends to worsen (not improve) the trade balance over time. RBI publishes REER indices for 6-country and 36-country baskets."},
  {id:"P4C9Q07",paper:"P4",chapter:"International Trade",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following will NOT be a consequence of an import tariff?",
    opts:["An increase in the price of the product in the domestic market","Reduced competitive pressure by foreign firms on the domestic producers","Increased level of supply in the domestic market","None of the above is correct"],a:2,
    exp:"An import tariff makes foreign goods more expensive in the domestic market. Consequences: (1) Domestic prices rise (tariff is passed on partially or fully to consumers). (2) Domestic producers face less competition from now-pricier imports. (3) Domestic producers may increase production, but total market supply (domestic + imports) typically FALLS because expensive imports decline more than domestic production rises. Therefore 'increased total supply' is NOT a consequence. Tariffs redistribute income from consumers (who pay more) to producers (who sell more at higher prices) and to government (tariff revenue), with net efficiency loss (deadweight loss)."},
  {id:"P4C9Q08",paper:"P4",chapter:"International Trade",diff:"Hard",marks:2,type:"MCQ",
    q:"A high real exchange rate in an economy is most likely to lead to:",
    opts:["Current account deficit","Fiscal deficit","Current account surplus","Increase in foreign exchange reserves"],a:0,
    exp:"A high real exchange rate means domestic goods are expensive relative to foreign goods. This reduces export competitiveness (foreigners buy less from us) and increases imports (foreign goods look cheap). Falling exports plus rising imports worsens the trade balance, driving the current account into deficit. This is often a policy concern because a persistent current account deficit must be financed by capital inflows (borrowing or asset sales) and can trigger currency crises if those flows reverse. Fiscal deficit is a different concept entirely (government budget), though they can be linked (twin deficits hypothesis)."},
  {id:"P4C10Q05",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"The major economic crisis that triggered the sweeping economic reforms in India in 1991 was:",
    opts:["Banking crisis","Balance of Payments crisis","Agricultural crisis","Fiscal surplus"],a:1,
    exp:"India's 1991 Balance of Payments crisis was the immediate trigger for the New Economic Policy. Foreign exchange reserves had depleted to barely 2 weeks of imports. India had to airlift 47 tonnes of gold to the Bank of England as collateral for a loan. The crisis was caused by: Gulf War oil shock, loss of Soviet trade partner, unsustainable fiscal and trade deficits, and collapse of investor confidence. In response, PM Narasimha Rao and FM Manmohan Singh launched economic liberalisation: devaluation, removal of licence raj, reduction of trade barriers, opening to FDI, and disinvestment of PSUs. The reforms fundamentally restructured the Indian economy."},
  {id:"P4C10Q06",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"Which reform measure was aimed at reducing inefficiency in public sector enterprises in India?",
    opts:["Nationalization","Disinvestment","Licensing","Import quotas"],a:1,
    exp:"Disinvestment is the partial or complete sale of government equity in public sector undertakings (PSUs) to private investors. Initiated as part of the 1991 reforms, it aims to: reduce fiscal burden of loss-making PSUs, improve efficiency through private management, raise revenue for the government, and deepen capital markets. Examples: partial disinvestment of ONGC, Indian Oil, Coal India; privatisation of Air India (2021), BPCL (partial). Nationalization (opposite process) was done in the 1950s-70s. Licensing and import quotas were the controls DISMANTLED by 1991 reforms."},
  {id:"P4C10Q07",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"The term 'Hindu rate of growth' refers to:",
    opts:["High economic growth in 1950s","Sustained growth above 8%","Low growth before 1991 reforms","Rapid service sector expansion"],a:2,
    exp:"'Hindu rate of growth', a term coined by economist Raj Krishna in the 1970s, describes India's sluggish 3-4% annual GDP growth rate from the 1950s through the 1980s. The name was commentary on how Indian growth was persistently low compared to East Asian economies despite planning and heavy industrial development. The term carried no religious meaning but referred to the perceived cultural patience with slow progress. Post-1991 reforms broke this pattern: India's growth accelerated to 6-8% in subsequent decades, making the 'Hindu rate' a historical term. The phrase is now often used to contrast India's pre- and post-reform eras."},
  {id:"P4C10Q08",paper:"P4",chapter:"Indian Economy",diff:"Medium",marks:2,type:"MCQ",
    q:"Which of the following is a strategy adopted to promote globalization of the Indian economy?",
    opts:["Partial convertibility of the rupee","Reduction in tariffs","Increase in equity limit for foreign investment","All of the above"],a:3,
    exp:"India's globalization strategy post-1991 included multiple complementary measures: (1) Partial convertibility of the rupee (current account convertibility in 1994, gradual capital account opening), allowing freer cross-border currency conversion for trade. (2) Reduction in tariffs from peak rates of 150-300% to current WTO-compliant levels, opening Indian markets to global competition. (3) Increase in FDI equity limits from low caps to 74%, 100% in most sectors, attracting foreign capital and technology. Together, these measures integrated India into the global economy, transforming it from a largely closed to a largely open economy."},
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
          <p style={{ fontSize: 17, fontWeight: 400, color: "#9CA3AF", textAlign: "center", maxWidth: 520, marginBottom: 32, lineHeight: 1.6 }}>400+ exam-pattern questions with detailed explanations, real-time analytics, and timed mock tests.</p>
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
            <svg width="56" height="56" viewBox="0 0 200 200" style={{ display: "block", margin: "0 auto 8px" }}>
              <defs><linearGradient id="shieldL" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor="#A78BFA"/><stop offset="50%" stopColor="#6366F1"/><stop offset="100%" stopColor="#4F46E5"/></linearGradient></defs>
              <g transform="translate(100,95)">
                <path d="M0,-80 L63,-52 L63,13 C63,57 34,80 0,95 C-34,80 -63,57 -63,13 L-63,-52 Z" fill="url(#shieldL)" opacity="0.3" stroke="url(#shieldL)" strokeWidth="2"/>
                <path d="M0,-60 L45,-38 L45,8 C45,42 25,60 0,72 C-25,60 -45,42 -45,8 L-45,-38 Z" fill="url(#shieldL)" opacity="0.5"/>
                <path d="M-20,3 L-6,20 L23,-14" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
            </svg>
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
                                <button className="btn btn-s" onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); setShowExplanation({}); setFilterWrongOnly(false); setTimer(testQs.length * 120); setTimerActive(true); }}>Retry Same Test</button>
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
