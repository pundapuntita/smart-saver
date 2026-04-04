import { useState, useMemo, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
  Download,
  FileText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  Sparkles,
  Bot
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './index.css';

const CATEGORY_KEYWORDS = {
  'ค่าน้ำมัน': ['น้ำมัน', 'ปตท', 'บางจาก', 'เชลล์', 'gas', 'oil', 'essso', 'ptt', 'ปั้ม'],
  'ค่าน้ำ/ไฟ': ['ค่าน้ำ', 'ประปา', 'water', 'mwa', 'pwa', 'ค่าไฟ', 'mea', 'pea', 'ไฟฟ้า'],
  'ค่าอาหาร': ['ข้าว', 'อาหาร', 'กิน', 'ขนม', 'ดื่ม', 'น้ำ', 'food', 'เคเอฟซี', 'kfc', 'mk', 'ชาบู', 'หมูกระทะ', 'ปิ้งย่าง', 'แม็ค', 'กาแฟ', 'คาเฟ่', 'cafe', 'มื้อ'],
  'ค่าของใช้': ['ของใช้', 'สบู่', 'ยาสระผม', 'ทิชชู่', 'โลตัส', 'บิ๊กซี', 'เซเว่น', '7-11', '711', 'cj', 'ซีเจ', 'แม็คโคร', 'makro', 'ตลาด', 'shopee', 'lazada', 'ช้อป'],
  'ค่าใช้จ่ายของคนอื่น': ['ออกให้', 'รูดให้', 'รูดบัตร', 'สำรองจ่าย', 'คนอื่น', 'เพื่อน', 'ฝากซื้อ', 'แทน']
};

const DEFAULT_BUDGETS = {
  'ค่าน้ำมัน': 1500,
  'ค่าน้ำ/ไฟ': 1500,
  'ค่าอาหาร': 5000,
  'ค่าของใช้': 2000,
  'ค่าใช้จ่ายของคนอื่น': 1000,
  'อื่นๆ': 1000,
};

const DEFAULT_INCOME_CATEGORIES = ['เงินเดือน', 'ฟรีแลนซ์/งานเสริม', 'คืนเงิน/เงินค้าง', 'โบนัส/ปันผล', 'อื่นๆ'];

const PAYMENT_METHODS = ['เงินสด', 'โอน', 'บัตรเครดิต', 'ช้อปปี้'];

function SmartSaverApp({ profileName }) {
  const [editingId, setEditingId] = useState(null);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [tempAccountVal, setTempAccountVal] = useState("");
  const [accounts, setAccounts] = useState([{ id: '1', name: 'บัญชีหลัก', balance: 0 }]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [incomeCategories, setIncomeCategories] = useState(DEFAULT_INCOME_CATEGORIES);
  const [projects, setProjects] = useState([]);
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [category, setCategory] = useState('อื่นๆ');
  
  const [dateStr, setDateStr] = useState(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState('โอน');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedIncomeAccountId, setSelectedIncomeAccountId] = useState('');
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState('');
  const [selectedTargetAccountId, setSelectedTargetAccountId] = useState('');

  useEffect(() => {
    if (accounts.length > 0) {
      if (!accounts.some(a => a.id === selectedIncomeAccountId)) setSelectedIncomeAccountId(accounts[0].id);
      if (!accounts.some(a => a.id === selectedSourceAccountId)) setSelectedSourceAccountId(accounts[0].id);
      if (!accounts.some(a => a.id === selectedTargetAccountId)) setSelectedTargetAccountId(accounts.length > 1 ? accounts[1].id : accounts[0].id);
    }
  }, [accounts, selectedIncomeAccountId, selectedSourceAccountId, selectedTargetAccountId]);

  // View Month State
  const [viewMonth, setViewMonth] = useState(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().substring(0, 7);
  });

  useEffect(() => {
    let savedData = localStorage.getItem(`smartSaverData_${profileName}`);
    
    // Migration: If loading Punda's profile and it's empty, try to fetch legacy 'smartSaverData'
    if (!savedData && profileName === 'ปัณด้า') {
      savedData = localStorage.getItem('smartSaverData');
      if (savedData) localStorage.setItem(`smartSaverData_ปัณด้า`, savedData);
    }

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.accounts && Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
        setTransactions(parsed.transactions || []);
        if (parsed.budgets) setBudgets(Object.keys(parsed.budgets).length > 0 ? parsed.budgets : DEFAULT_BUDGETS);
        if (parsed.incomeCategories) setIncomeCategories(parsed.incomeCategories.length > 0 ? parsed.incomeCategories : DEFAULT_INCOME_CATEGORIES);
        if (parsed.projects) setProjects(parsed.projects);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem(`smartSaverData_${profileName}`, JSON.stringify({ accounts, transactions, budgets, incomeCategories, projects }));
  }, [accounts, transactions, budgets, incomeCategories, projects, profileName]);

  const CATEGORIES = useMemo(() => Object.keys(budgets), [budgets]);

  // Reset category fallback when switching type
  useEffect(() => {
    if (type === 'income' && !incomeCategories.includes(category)) setCategory(incomeCategories[0] || 'อื่นๆ');
    if (type === 'expense' && !CATEGORIES.includes(category)) setCategory('อื่นๆ');
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (type !== 'expense' || !memo) return;
    const text = memo.toLowerCase();
    let guessedCategory = 'อื่นๆ';
    for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
      if (words.some(w => text.includes(w))) {
        guessedCategory = cat;
        break;
      }
    }
    if (CATEGORIES.includes(guessedCategory)) {
      setCategory(guessedCategory);
    }
  }, [memo, type, CATEGORIES]);

  const getCycleMonth = (dateString, isCC) => {
    const d = new Date(dateString);
    if (!isCC) return dateString.substring(0, 7);
    if (d.getDate() >= 20) {
      const nextM = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const mm = String(nextM.getMonth() + 1).padStart(2, '0');
      return `${nextM.getFullYear()}-${mm}`;
    }
    return dateString.substring(0, 7);
  };

  const tzOffset = (new Date()).getTimezoneOffset() * 60000;
  const todayLocalStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const isCC = t.paymentMethod === 'บัตรเครดิต';
      return getCycleMonth(t.date, isCC) === viewMonth;
    });
  }, [transactions, viewMonth]);

  const allTimeProjectExpenses = useMemo(() => {
    const map = {};
    projects.forEach(p => map[p.id] = 0);
    transactions.forEach(t => {
      if (t.type === 'expense' && t.projectId && map[t.projectId] !== undefined) {
        map[t.projectId] += t.amount;
      }
    });
    return map;
  }, [transactions, projects]);

  // Overall calculations across ALL TIME for wallet balance
  const displayBalances = useMemo(() => {
    let bals = {};
    accounts.forEach(a => bals[a.id] = parseFloat(a.balance) || 0);
    transactions.forEach(t => {
      if (t.type === 'income' && t.targetAccountId && bals[t.targetAccountId] !== undefined) {
        bals[t.targetAccountId] += t.amount;
      } else if (t.type === 'transfer') {
        if (t.sourceAccountId && bals[t.sourceAccountId] !== undefined) {
          bals[t.sourceAccountId] -= t.amount;
        }
        if (t.targetAccountId && bals[t.targetAccountId] !== undefined) {
          bals[t.targetAccountId] += t.amount;
        }
      } else if (t.type === 'expense' && t.paymentMethod !== 'บัตรเครดิต' && t.paymentMethod !== 'ช้อปปี้' && t.sourceAccountId && bals[t.sourceAccountId] !== undefined) {
        bals[t.sourceAccountId] -= t.amount;
      } else if (t.type === 'cc_payment' && t.sourceAccountId && bals[t.sourceAccountId] !== undefined) {
        bals[t.sourceAccountId] -= t.amount;
      }
    });
    return bals;
  }, [accounts, transactions]);

  const totalInitialBalance = useMemo(() => Object.values(displayBalances).reduce((sum, val) => sum + val, 0), [displayBalances]);
  // incomes that didn't go to any specific account
  const totalIncomeAllTime = useMemo(() => transactions.filter(t => t.type === 'income' && !t.targetAccountId).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  // expenses that didn't deduct from any specific account (excluding Credit/Shopee which create debt instead)
  const unallocatedCashExpense = useMemo(() => transactions.filter(t => t.type === 'expense' && t.paymentMethod !== 'บัตรเครดิต' && t.paymentMethod !== 'ช้อปปี้' && !t.sourceAccountId).reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  // Credit Card Debt
  const ccExpenseAllTime = useMemo(() => transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'บัตรเครดิต').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const ccPaymentAllTime = useMemo(() => transactions.filter(t => t.type === 'cc_payment' && t.paymentMethod !== 'ช้อปปี้').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  // Shopee Debt
  const shopeeExpenseAllTime = useMemo(() => transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'ช้อปปี้').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const shopeePaymentAllTime = useMemo(() => transactions.filter(t => t.type === 'cc_payment' && t.paymentMethod === 'ช้อปปี้').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  
  // all cc/shopee payments
  const totalDebtPayment = useMemo(() => transactions.filter(t => t.type === 'cc_payment').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  // payments that didn't deduct from any specific account
  const unallocatedDebtPayment = useMemo(() => transactions.filter(t => t.type === 'cc_payment' && !t.sourceAccountId).reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const currentBalance = useMemo(() => totalInitialBalance + totalIncomeAllTime - unallocatedCashExpense - unallocatedDebtPayment, [totalInitialBalance, totalIncomeAllTime, unallocatedCashExpense, unallocatedDebtPayment]);
  const currentCCDebt = useMemo(() => ccExpenseAllTime - ccPaymentAllTime, [ccExpenseAllTime, ccPaymentAllTime]);
  const currentShopeeDebt = useMemo(() => shopeeExpenseAllTime - shopeePaymentAllTime, [shopeeExpenseAllTime, shopeePaymentAllTime]);

  const monthIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income' && !t.projectId).reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);
  const monthExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense' && !t.projectId).reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);

  const categoryExpenses = useMemo(() => {
    const expenses = {};
    CATEGORIES.forEach(c => expenses[c] = 0);
    filteredTransactions.forEach(t => {
      if (t.type === 'expense' && !t.projectId) {
        const c = t.category;
        expenses[c !== undefined && expenses[c] !== undefined ? c : 'อื่นๆ'] += t.amount;
      }
    });
    return expenses;
  }, [filteredTransactions, CATEGORIES]);

  const paymentMethodSummary = useMemo(() => {
    const summary = {};
    PAYMENT_METHODS.forEach(m => {
      if (m === 'บัตรเครดิต') {
        summary[m] = { total: 0, fromPrevMonth: 0, fromCurrentMonth: 0 };
      } else {
        summary[m] = 0;
      }
    });

    filteredTransactions.forEach(t => {
      if (t.type === 'expense' && !t.projectId) {
        const m = t.paymentMethod || 'โอน';
        if (m === 'บัตรเครดิต') {
          summary[m].total += t.amount;
          const tYYYYMM = t.date.substring(0, 7);
          if (tYYYYMM < viewMonth) {
            summary[m].fromPrevMonth += t.amount;
          } else {
            summary[m].fromCurrentMonth += t.amount;
          }
        } else if (summary[m] !== undefined) {
          summary[m] += t.amount;
        }
      }
    });
    return summary;
  }, [filteredTransactions, viewMonth]);

  const pieData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: categoryExpenses[cat] || 0
    })).filter(d => d.value > 0);
  }, [categoryExpenses, CATEGORIES]);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const aiRec = useMemo(() => {
    if (pieData.length === 0) return { message: "ยังไม่มีข้อมูลรายจ่ายในรอบบิลนี้ ลองเริ่มบันทึกรายจ่ายกันดูนะ 🐼", status: "neutral" };
    
    let overBudgets = CATEGORIES.filter(cat => {
      const budget = parseFloat(budgets[cat]);
      const spent = categoryExpenses[cat] || 0;
      return !isNaN(budget) && spent > budget;
    });
    let highestExpense = [...pieData].sort((a, b) => b.value - a.value)[0];
    
    if (overBudgets.length > 0) {
      return { 
        message: `🚨 ตอนนี้คุณใช้จ่ายเกินงบในหมวด "${overBudgets.join(', ')}" แนะนำให้ลดการใช้จ่ายในส่วนนี้ หรือหาโปรโมชั่นเพื่อเซฟเงินช่วงปลายเดือนนะ`,
        status: "warning" 
      };
    }
    
    if (highestExpense && monthExpense > 0) {
       const percent = ((highestExpense.value / monthExpense) * 100).toFixed(0);
       return {
         message: `💡 หมวด "${highestExpense.name}" เป็นรายจ่ายที่สูงที่สุดของคุณ (คิดเป็น ${percent}%) ลองพิจารณาว่าสามารถลดรายจ่ายส่วนนี้ลงได้ไหม เช่น ลดความถี่ลง หรือตั้งงบแยกให้ชัดเจนขึ้น`,
         status: "info"
       };
    }

    return { message: "🌟 ยอดเยี่ยมมาก! คุณบริหารรายจ่ายได้ดีและยังอยู่ในงบประมาณทุกหมวด พยายามรักษาวินัยแบบนี้ต่อไปนะ", status: "success" };
  }, [pieData, categoryExpenses, budgets, CATEGORIES, monthExpense]);

  // View Navigation
  const changeMonth = (offset) => {
    const [y, m] = viewMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    setViewMonth(`${d.getFullYear()}-` + mm);
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setMemo(tx.memo);
    setCategory(tx.category || '');
    setPaymentMethod(tx.paymentMethod || 'โอน');
    setDateStr(tx.date.split('T')[0]);
    setSelectedProjectId(tx.projectId || '');
    setSelectedIncomeAccountId(tx.targetAccountId || '');
    setSelectedSourceAccountId(tx.sourceAccountId || '');
    setSelectedTargetAccountId(tx.type === 'transfer' ? (tx.targetAccountId || '') : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) return;
    const isIncome = type === 'income';
    const newTx = {
      id: editingId || Date.now().toString(),
      type, amount: parseFloat(amount),
      memo: memo || (isIncome ? 'รายรับ' : type === 'transfer' ? 'โอนเก็บ / ภายใน' : type === 'cc_payment' ? `ชำระบิล${paymentMethod === 'ช้อปปี้' ? 'ช้อปปี้' : 'บัตรเครดิต'}` : 'รายจ่าย'),
      category: (type === 'expense' && !selectedProjectId) || isIncome ? category : null,
      paymentMethod: type === 'expense' || type === 'cc_payment' ? paymentMethod : null,
      date: new Date(dateStr).toISOString(),
      projectId: selectedProjectId || null,
      targetAccountId: isIncome ? (selectedIncomeAccountId || null) : (type === 'transfer' ? (selectedTargetAccountId || null) : null),
      sourceAccountId: type === 'transfer' ? (selectedSourceAccountId || null) : ((type === 'expense' && paymentMethod !== 'บัตรเครดิต' && paymentMethod !== 'ช้อปปี้') || type === 'cc_payment' ? (selectedSourceAccountId || null) : null)
    };
    
    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? newTx : t));
      setEditingId(null);
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }
    setAmount(''); setMemo('');
  };

  const deleteTransaction = (id) => {
    if(confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = () => {
    const name = prompt('กรุณาใส่ชื่อหมวดหมู่ใหม่:');
    if (!name || CATEGORIES.includes(name)) return;
    const budget = prompt(`ตั้งค่างบประมาณสำหรับ "${name}":`, 1000);
    if (!budget || isNaN(budget)) return;
    setBudgets(prev => ({ ...prev, [name]: parseFloat(budget) }));
  };

  const addProject = () => {
    const name = prompt('กรุณาใส่ชื่อโปรเจคใหม่ (เช่น รีโนเวทห้อง):');
    if (!name) return;
    setProjects(prev => [...prev, { id: 'p_'+Date.now(), name }]);
  };

  const editProject = (id, currentName) => {
    const name = prompt('แก้ไขชื่อโปรเจค:', currentName);
    if (!name || name === currentName) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const deleteProject = (id) => {
    const hasTransactions = transactions.some(t => t.projectId === id);
    if (hasTransactions) {
      if (!confirm('โปรเจคนี้มีรายการรายจ่ายผูกอยู่ หากลบ โปรเจคในรายการเหล่านั้นจะกลายเป็น "ไม่มีโปรเจค" ยืนยันการลบใช่หรือไม่?')) return;
      setTransactions(prev => prev.map(t => t.projectId === id ? { ...t, projectId: null } : t));
    } else {
      if (!confirm('ต้องการลบโปรเจคพิเศษนี้ใช่หรือไม่?')) return;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId('');
  };

  const addAccount = () => {
    const name = prompt('กรุณาใส่ชื่อบัญชีใหม่:', 'บัญชีใหม่');
    if (!name) return;
    const newId = 'acc_'+Date.now();
    setAccounts(prev => [...prev, { id: newId, name, balance: 0 }]);
    setEditingAccountId(newId);
    setTempAccountVal("0");
  };

  const updateAccountBalance = (id, newBalance) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, balance: newBalance } : a));
  };
  const handleEditBalance = (acc) => {
    setEditingAccountId(acc.id);
    setTempAccountVal(acc.balance);
  };
  const saveBalance = (id) => {
    updateAccountBalance(id, tempAccountVal);
    setEditingAccountId(null);
  };
  const editAccountName = (id, currentName) => {
    const name = prompt('แก้ไขชื่อบัญชี:', currentName);
    if (name) setAccounts(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };
  const deleteAccount = (id) => {
    if (accounts.length <= 1) return alert('คุณต้องมีอย่างน้อย 1 บัญชี');
    if (confirm('ต้องการลบบัญชีนี้ใช่หรือไม่?')) setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const exportExcel = () => {
    const categoryRows = [['หมวดหมู่', 'รายจ่ายที่ใช้ไป (บาท)', 'งบประมาณ (บาท)']];
    CATEGORIES.forEach(cat => categoryRows.push([cat, categoryExpenses[cat] || 0, budgets[cat]]));
    
    const paymentRows = [['ช่องทางชำระเงิน', 'รายจ่ายเดือนรอบบิล (บาท)']];
    PAYMENT_METHODS.forEach(m => {
      if (m === 'บัตรเครดิต') {
        paymentRows.push([m + ' (รวม)', paymentMethodSummary[m].total]);
        paymentRows.push(['  ↳ ยกมาจากเดือนก่อน', paymentMethodSummary[m].fromPrevMonth]);
        paymentRows.push(['  ↳ ใช้จ่ายเดือนนี้', paymentMethodSummary[m].fromCurrentMonth]);
      } else {
        paymentRows.push([m, paymentMethodSummary[m]]);
      }
    });

    const projectRows = [['โปรเจคพิเศษ', 'รายจ่ายสะสม (บาท)']];
    projects.forEach(p => projectRows.push([p.name, allTimeProjectExpenses[p.id]]));

    const rows = [
      [`สรุปภาพรวม (รอบบิล ${viewMonth})`],
      ['รายรับรวมปกติ', monthIncome],
      ['รายจ่ายรวมปกติ', monthExpense],
      ['* ยอดเหล่านี้ไม่รวมโปรเจคพิเศษ'],
      [],
      ['สรุปรายจ่ายแต่ละหมวดหมู่'],
      ...categoryRows,
      [],
      ['สรุปรายจ่ายแยกตามช่องทางชำระเงิน'],
      ...paymentRows,
      [],
      ['สรุปโปรเจคพิเศษ (ทั้งหมด)'],
      ...projectRows
    ];
    
    let csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartSaver-${viewMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBackup = () => {
    const data = JSON.stringify({ accounts, transactions, budgets, projects });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartSaver-Backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (confirm('⚠️ การสำรองข้อมูล: ข้อมูลปัจจุบันในเครื่องนี้จะถูก "แทนที่" ด้วยข้อมูลจากไฟล์ทั้งหมด คุณแน่ใจหรือไม่?')) {
          if (parsed.accounts && Array.isArray(parsed.accounts)) setAccounts(parsed.accounts);
          if (parsed.transactions) setTransactions(parsed.transactions);
          if (parsed.budgets) setBudgets(parsed.budgets);
          if (parsed.projects) setProjects(parsed.projects);
          alert('✅ กู้คืนข้อมูลสำเร็จ!');
        }
      } catch (err) {
        alert('❌ ไฟล์ไม่ถูกต้อง หรือข้อมูลเสียหาย');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatMoney = (val) => val.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const displayDate = (isoString) => {
    const localDate = new Date(new Date(isoString).getTime() - tzOffset);
    return localDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute:'2-digit' }).replace(' 00:00', '');
  };

  const PaymentChips = () => (
    <div className="flex flex-wrap gap-2 mt-1">
      {PAYMENT_METHODS.map(method => (
        <button key={method} type="button" onClick={() => setPaymentMethod(method)}
          className={`flex-1 min-w-[50px] py-1 px-1 rounded-lg text-sm transition-all border ${
            paymentMethod === method ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-medium' : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
          }`}
          style={paymentMethod === method ? { borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}
        >
          {method}
        </button>
      ))}
    </div>
  );

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const [vY, vM] = viewMonth.split('-');
  const displayMonthStr = `${monthNames[parseInt(vM)-1]} ${vY}`;

  return (
    <div className="app-container" style={{ paddingBottom: '3rem' }}>
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gradient mb-1">Smart Saver</h1>
          <p className="text-muted">ระบบสรุปรายรับ-รายจ่ายรายเดือน</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={exportExcel} className="btn-secondary text-sm" style={{ padding: '0.5rem 0.75rem' }}>
            <Download size={16} className="text-green-500" /> <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Excel</span>
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-sm" style={{ padding: '0.5rem 0.75rem' }}>
            <FileText size={16} className="text-red-500" /> <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-6 text-black">
        <h1 className="text-2xl font-bold mb-2">สรุปรายรับ-รายจ่าย รอบบิล {displayMonthStr}</h1>
        <p>พิมพ์เมื่อ: {new Date().toLocaleString('th-TH')}</p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-6 no-print w-full">
        <button onClick={() => changeMonth(-1)} className="btn-secondary rounded-full p-2"><ChevronLeft size={20}/></button>
        <h2 className="text-xl font-bold px-4 py-1 bg-slate-800/80 rounded border border-gray-700">รอบบิล {displayMonthStr}</h2>
        <button onClick={() => changeMonth(1)} className="btn-secondary rounded-full p-2"><ChevronRight size={20}/></button>
      </div>
      <p className="text-center text-xs text-muted mb-6 no-print">* บัตรเครดิต ตัดรอบบิลวันที่ 19 ของทุกเดือน (ยอดวันที่ 20 จะถูกยกยอดไปรอบบิลเดือนถัดไปอัตโนมัติ)</p>

      <section className="dashboard-grid mb-8 no-print" style={{ alignItems: 'stretch' }}>
        <div className="glass-card flex flex-col items-center justify-start text-center">
          <div className="flex items-center gap-2 mb-4 w-full justify-center">
            <Wallet size={24} style={{ color: 'var(--accent-blue)' }} />
            <h2 className="text-lg font-bold">บัญชีเงินต้น</h2>
            <button onClick={addAccount} className="ml-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded px-2 py-1 transition-colors">
              + เพิ่ม
            </button>
          </div>
          <div className="flex flex-col gap-3 w-full max-h-[160px] overflow-y-auto pr-2 mb-4">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between text-sm bg-slate-800/40 p-2.5 rounded border border-slate-700/50 min-h-[44px]">
                 <div className="font-medium flex-1 text-left cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-1 min-w-0 group" onClick={() => editAccountName(acc.id, acc.name)}>
                    <span className="truncate">{acc.name}</span><span className="text-[10px] text-muted opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-0.5" title="แก้ไขชื่อ">✎</span>
                 </div>
                 <div className="flex items-center justify-end gap-1.5 shrink-0 ml-3">
                    <span className="text-muted font-medium">฿</span>
                    {editingAccountId === acc.id ? (
                      <div className="flex items-center gap-1.5">
                        <input type="number" value={tempAccountVal} onChange={e => setTempAccountVal(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') saveBalance(acc.id); }} className="w-[70px] sm:w-[90px] h-[28px] bg-slate-900 border border-blue-500 rounded px-2 text-right font-bold text-main" style={{ boxShadow: 'none' }} autoFocus />
                        <button onClick={() => saveBalance(acc.id)} className="text-white bg-blue-600 hover:bg-blue-500 text-xs px-2 h-[28px] rounded transition-colors shadow-sm font-bold flex items-center justify-center">บันทึก</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group/bal cursor-pointer" onClick={() => handleEditBalance(acc)}>
                        <span className="text-right font-bold text-main group-hover/bal:text-blue-400 transition-colors" style={{ minWidth: '35px' }}>{formatMoney(displayBalances[acc.id] || 0)}</span>
                        <span className="text-[10px] text-muted opacity-0 group-hover/bal:opacity-60 transition-opacity flex items-center h-full mt-0.5" title="แก้ไขจำนวนเงินเริ่มต้น">✎</span>
                      </div>
                    )}
                    <button onClick={() => deleteAccount(acc.id)} className="text-gray-500 hover:text-red-400 transition-colors bg-transparent border-none p-1 shadow-none rounded-full flex items-center justify-center h-6 w-6 ml-1" title="ลบบัญชี"> × </button>
                 </div>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-gray-700 w-full flex justify-between items-center px-1">
            <span className="text-sm text-gray-400 font-medium">รวมเงินต้นทั้งหมด:</span>
            <span className="text-xl font-bold text-blue-400">฿ {formatMoney(totalInitialBalance)}</span>
          </div>
        </div>
        
        <div className="glass-card flex flex-col justify-center gap-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mt-1">
            <div className="text-left">
              <h2 className="text-sm font-bold text-gray-300">เงินคงเหลือ (ในบัญชี)</h2>
              <div className="text-xs text-muted pr-2 hidden sm:block">รวมเงินต้น + รับ - จ่าย (ไม่รวมรูดบัตร) - จ่ายบิลบัตร</div>
            </div>
            <div className={`text-2xl font-black whitespace-nowrap ${currentBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ฿ {formatMoney(currentBalance)}
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 mb-1">
            <div className="text-left">
              <h2 className="text-sm font-bold text-indigo-400">หนี้บัตร/ช้อปปี้ (รอจ่าย)</h2>
              <div className="text-xs text-muted">ยอดรูดสะสม - ยอดจ่ายบิลสะสม</div>
            </div>
            <div className="text-right">
               <div className={`text-base font-black whitespace-nowrap ${currentCCDebt > 0 ? 'text-orange-400' : 'text-green-500'}`}>
                 💳 ฿ {formatMoney(Math.max(0, currentCCDebt))}
               </div>
               <div className={`text-base font-black whitespace-nowrap ${currentShopeeDebt > 0 ? 'text-orange-400' : 'text-green-500'}`}>
                 🧡 ฿ {formatMoney(Math.max(0, currentShopeeDebt))}
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid-3 grid gap-6 mb-8" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="text-green" size={24} />
            <h3 className="font-medium text-muted">รายรับ (รอบบิลนี้)</h3>
          </div>
          <p className="text-2xl font-bold text-green">฿ {formatMoney(monthIncome)}</p>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="text-red" size={24} />
            <h3 className="font-medium text-muted">รายจ่ายปกติ (รอบบิลนี้)</h3>
          </div>
          <p className="text-2xl font-bold text-red">฿ {formatMoney(monthExpense)}</p>
        </div>
      </section>

      <div className="dashboard-grid" style={{ alignItems: 'start' }}>
        <div className="flex flex-col gap-6 w-full print:hidden">
          <div className="glass-card no-print">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} /> เพิ่มรายการใหม่
            </h2>
            <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm md:text-base">
                <button type="button" className={`py-1 sm:py-2 rounded-lg font-medium transition ${type === 'income' ? 'bg-green-600 border border-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-transparent border border-gray-600 text-gray-400'}`} style={type === 'income' ? { backgroundColor: 'var(--accent-green)', borderColor: 'var(--accent-green)' } : {}} onClick={() => setType('income')}>รายรับ</button>
                <button type="button" className={`py-1 sm:py-2 rounded-lg font-medium transition ${type === 'expense' ? 'bg-red-600 border border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-transparent border border-gray-600 text-gray-400'}`} style={type === 'expense' ? { backgroundColor: 'var(--accent-red)', borderColor: 'var(--accent-red)' } : {}} onClick={() => setType('expense')}>รายจ่าย</button>
                <button type="button" className={`py-1 sm:py-2 rounded-lg font-medium transition ${type === 'cc_payment' ? 'bg-indigo-600 border border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-transparent border border-gray-600 text-gray-400'}`} onClick={() => { setType('cc_payment'); if (paymentMethod !== 'บัตรเครดิต' && paymentMethod !== 'ช้อปปี้') setPaymentMethod('บัตรเครดิต'); }}>จ่ายบิล</button>
                <button type="button" className={`py-1 sm:py-2 rounded-lg font-medium transition ${type === 'transfer' ? 'bg-teal-600 border border-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'bg-transparent border border-gray-600 text-gray-400'}`} style={type === 'transfer' ? { backgroundColor: '#0d9488', borderColor: '#0d9488' } : {}} onClick={() => setType('transfer')}>โอนย้าย/เก็บ</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>วันที่</label>
                  <input type="date" required value={dateStr} onChange={e => setDateStr(e.target.value)} />
                </div>
                <div>
                  <label>จำนวนเงิน (บาท)</label>
                  <input type="number" required min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
              </div>

              <div>
                <label>รายละเอียด</label>
                <input type="text" placeholder={type === 'expense' ? 'เช่น เติมน้ำมัน...' : type === 'cc_payment' ? 'เช่น จ่ายบิลบัตรเครดิตรอบเดือน...' : type === 'transfer' ? 'เช่น โอนเงินเข้าออมทรัพย์...' : 'เช่น เงินเดือน...'} value={memo} onChange={e => setMemo(e.target.value)} />
              </div>

              {type !== 'cc_payment' && type !== 'transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center justify-between">
                       {type === 'income' ? 'หมวดหมู่รายรับ' : 'หมวดหมู่ (ปกติ)'}
                       {type === 'expense' && <span className="text-xs text-blue-400">ถ้าเลือกโปรเจคพิเศษจะไม่คิดตรงนี้</span>}
                    </label>
                    <select value={category} onChange={e => setCategory(e.target.value)} disabled={type === 'expense' && !!selectedProjectId}>
                      {type === 'income' 
                        ? incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                        : CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                      }
                    </select>
                  </div>
                  {type === 'income' && (
                    <div>
                      <label>เข้าบัญชี (ถ้ามี)</label>
                      <select value={selectedIncomeAccountId} onChange={e => setSelectedIncomeAccountId(e.target.value)}>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                      </select>
                    </div>
                  )}
                  {type === 'expense' && (
                    <>
                      <div>
                        <label>ผูกกับโปรเจคพิเศษ (แยกงบอิสระ)</label>
                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                          <option value="">-- ไม่ผูกโปรเจค (รายจ่ายปกติ) --</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      {paymentMethod !== 'บัตรเครดิต' && paymentMethod !== 'ช้อปปี้' && (
                        <div>
                           <label>หักจากบัญชี</label>
                           <select value={selectedSourceAccountId} onChange={e => setSelectedSourceAccountId(e.target.value)}>
                             {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                           </select>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label>ช่องทางชำระเงิน</label>
                        <PaymentChips />
                      </div>
                    </>
                  )}
                </div>
              )}

              {type === 'cc_payment' && (
                 <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label>บิลที่ต้องการจ่าย</label>
                       <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                         <option value="บัตรเครดิต">💳 บิลบัตรเครดิต</option>
                         <option value="ช้อปปี้">🧡 บิลช้อปปี้</option>
                       </select>
                     </div>
                     <div>
                       <label>หักจากบัญชี</label>
                       <select value={selectedSourceAccountId} onChange={e => setSelectedSourceAccountId(e.target.value)}>
                         {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="p-3 bg-indigo-900/30 border border-indigo-500/50 rounded-lg text-sm text-indigo-300">
                      ℹ️ การ <b>"จ่ายบิล"</b> จะหักยอดออกจาก <u className="px-1 text-white">เงินในบัญชี</u> และไปลดยอด <u className="px-1 text-white">หนี้สะสม</u> ให้โดยอัตโนมัติ (และไม่ถูกนับเป็นรายจ่ายซ้ำ)
                   </div>
                 </div>
              )}

              {type === 'transfer' && (
                 <div className="flex flex-col gap-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label>โอนจากบัญชี (ต้นทาง)</label>
                       <select value={selectedSourceAccountId} onChange={e => setSelectedSourceAccountId(e.target.value)}>
                         {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                       </select>
                     </div>
                     <div>
                       <label>เข้าบัญชี (ปลายทาง)</label>
                       <select value={selectedTargetAccountId} onChange={e => setSelectedTargetAccountId(e.target.value)}>
                         {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="p-3 bg-teal-900/30 border border-teal-500/50 rounded-lg text-sm text-teal-300">
                      ℹ️ <b>"โอนย้าย / เก็บเงิน"</b> ใช้จดบันทึกช่วยจำเมื่อโยกเงินระหว่างบัญชีของตัวเอง <u className="px-1 text-white">จะข้ามการคำนวณยอดเงินรวม</u> และไม่ถูกนับเป็นรายรับ/รายจ่ายให้ซ้ำซ้อน
                   </div>
                 </div>
              )}

              <div className="flex gap-2 mt-2">
                <button type="submit" className="btn-primary flex-1">
                   {editingId ? 'อัพเดทรายการ' : 'บันทึกรายการ'}
                </button>
                {editingId && (
                   <button type="button" className="btn-secondary flex-1" onClick={() => {
                      setEditingId(null);
                      setAmount(''); setMemo('');
                   }}>
                      ยกเลิกแก้ไข
                   </button>
                )}
              </div>
            </form>
          </div>

          <div className="glass-card print:border-gray-300">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 print:text-black">
              <Calendar size={20} /> ประวัติรอบบิลนี้ ({displayMonthStr})
            </h2>
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
              {filteredTransactions.length === 0 ? (
                <p className="text-center text-muted py-4 print:text-black">ยังไม่มีรายการ</p>
              ) : (
                filteredTransactions.map(tx => (
                  <div key={tx.id} className="glass-card hover:bg-opacity-80 transaction-item flex justify-between items-center print:border-gray-300 print:text-black print:mb-2" style={{ padding: '0.75rem 1rem' }}>
                    <div className="flex flex-col min-w-0 flex-1 pr-3">
                      <span className="font-medium text-main print:text-black truncate">{tx.memo}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-muted font-light px-1.5 py-0.5 bg-slate-800 rounded border border-gray-700 print:border-gray-300 print:bg-transparent print:text-black whitespace-nowrap">
                          {displayDate(tx.date)}
                        </span>
                        {tx.type === 'income' && tx.category && (
                          <span className="text-[11px] text-green border border-green-500/30 px-1.5 py-0.5 rounded print:text-green-700 whitespace-nowrap">{tx.category}</span>
                        )}
                        {tx.type === 'expense' && !tx.projectId && (
                          <span className="text-[11px] text-blue-400 border border-blue-400/30 px-1.5 py-0.5 rounded print:text-blue-700 whitespace-nowrap">{tx.category}</span>
                        )}
                        {tx.type === 'expense' && tx.projectId && (
                           <span className="text-[11px] text-purple-400 border border-purple-400/30 px-1.5 py-0.5 rounded flex items-center gap-1 print:text-purple-700 whitespace-nowrap">
                              <Briefcase size={10} /> {projects.find(p=>p.id===tx.projectId)?.name || 'โปรเจค'}
                           </span>
                        )}
                        {tx.type === 'expense' && (
                          <span className="text-[11px] text-indigo-400 border border-indigo-400/30 px-1.5 py-0.5 rounded print:text-indigo-700 whitespace-nowrap">
                            {tx.paymentMethod === 'ช้อปปี้' ? '🧡 ' : ''}{tx.paymentMethod}{tx.sourceAccountId && tx.paymentMethod !== 'บัตรเครดิต' && tx.paymentMethod !== 'ช้อปปี้' && accounts.find(a => a.id === tx.sourceAccountId) ? ` (${accounts.find(a => a.id === tx.sourceAccountId).name})` : ''}
                          </span>
                        )}
                        {tx.type === 'cc_payment' && (
                          <span className="text-[11px] text-indigo-300 border border-indigo-500/50 px-1.5 py-0.5 rounded print:text-indigo-700 whitespace-nowrap">
                            {tx.paymentMethod === 'ช้อปปี้' ? '🧡 บิลช้อปปี้' : '💳 บิลบัตรเครดิต'}{tx.sourceAccountId && accounts.find(a => a.id === tx.sourceAccountId) ? ` (${accounts.find(a => a.id === tx.sourceAccountId).name})` : ''}
                          </span>
                        )}
                        {tx.type === 'transfer' && (
                          <span className="text-[11px] text-teal-300 border border-teal-500/50 px-1.5 py-0.5 rounded print:text-teal-700 whitespace-nowrap">
                            🔄 โอน {tx.sourceAccountId && accounts.find(a => a.id === tx.sourceAccountId) ? accounts.find(a => a.id === tx.sourceAccountId).name : 'ภายใน'}
                            {tx.targetAccountId && accounts.find(a => a.id === tx.targetAccountId) ? ` → ${accounts.find(a => a.id === tx.targetAccountId).name}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`font-bold ${tx.type === 'income' ? 'text-green print:text-green-700' : tx.type === 'transfer' ? 'text-teal-400 print:text-teal-700' : tx.type === 'cc_payment' ? 'text-indigo-400 print:text-indigo-700' : 'text-red print:text-red-700'}`}>
                        {tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-'} {formatMoney(tx.amount)}
                      </span>
                      <div className="flex gap-1 sm:gap-2 items-center ml-2">
                        <button onClick={() => handleEdit(tx)} className="text-gray-400 hover:text-blue-400 transition-colors bg-transparent p-1 shadow-none no-print"> <Edit2 size={16} /> </button>
                        <button onClick={() => deleteTransaction(tx.id)} className="text-gray-400 hover:text-red-400 transition-colors bg-transparent p-1 shadow-none no-print"> <Trash2 size={16} /> </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full print:mb-8">
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 print:text-black">
                <Briefcase size={20} /> โปรเจคพิเศษ (แยกงบจากปกติ)
              </h2>
              <button onClick={addProject} className="btn-secondary flex items-center gap-1 text-xs no-print" style={{ padding: '0.4rem 0.6rem' }}>
                <Plus size={14} /> สร้างโปรเจค
              </button>
            </div>
            {projects.length === 0 ? (
               <p className="text-xs text-muted mb-4">ยังไม่มีโปรเจคพิเศษ คุณสามารถสร้างไว้เพื่อแยกรวมยอด เช่น ค่าซ่อมรถ, เที่ยวญี่ปุ่น, รีโนเวทบ้าน</p>
            ) : (
                <div className="flex flex-col gap-3">
                  {projects.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 p-3 rounded print:border-gray-300 group">
                      <span className="font-medium print:text-black">{p.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-main print:text-black">฿ {formatMoney(allTimeProjectExpenses[p.id] || 0)}</span>
                        <div className="flex gap-1 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => editProject(p.id, p.name)} className="text-gray-400 hover:text-blue-400 bg-transparent p-1 shadow-none rounded-full ml-1" title="แก้ไข">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteProject(p.id)} className="text-gray-400 hover:text-red-400 bg-transparent p-1 shadow-none rounded-full" title="ลบ">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>

          <div className="glass-card">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 print:text-black">
                <CreditCard size={20} /> สรุปแยกช่องทาง (รอบบิลนี้)
                </h2>
             </div>
             
             <div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   {PAYMENT_METHODS.map(m => {
                      if (m === 'บัตรเครดิต') {
                        const d = paymentMethodSummary[m];
                        return (
                          <div key={'m-'+m} className="col-span-2 flex flex-col gap-1 bg-slate-800/50 p-2.5 rounded print:border print:border-gray-300">
                             <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-700 print:border-gray-300">
                                <span className="text-gray-300 print:text-black font-medium">{m} <span className="text-[10px] text-indigo-400 print:text-indigo-600 font-normal">(รวมรอบบิล)</span></span>
                                <span className="font-bold print:text-black">฿ {formatMoney(d.total)}</span>
                             </div>
                             <div className="flex justify-between items-center pl-2 text-xs opacity-80 print:text-black">
                                <span>↳ ยอดยกมาจากเดือนก่อน (20 - สิ้นเดือน)</span>
                                <span>฿ {formatMoney(d.fromPrevMonth)}</span>
                             </div>
                             <div className="flex justify-between items-center pl-2 text-xs opacity-80 print:text-black">
                                <span>↳ ยอดใช้จ่ายเดือนนี้ (1 - 19)</span>
                                <span>฿ {formatMoney(d.fromCurrentMonth)}</span>
                             </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={'m-'+m} className="flex justify-between bg-slate-800/50 p-2.5 rounded print:border print:border-gray-300">
                            <span className="text-gray-300 print:text-black">{m}</span>
                            <span className="font-medium print:text-black">฿ {formatMoney(paymentMethodSummary[m])}</span>
                          </div>
                        );
                      }
                   })}
                </div>
             </div>
          </div>

          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 print:text-black">
                <PieChartIcon size={20} /> เป้าหมายรายจ่าย
              </h2>
              <button onClick={addCategory} className="btn-secondary flex items-center gap-1 text-xs no-print" style={{ padding: '0.4rem 0.6rem' }}>
                <Plus size={14} /> เพิ่มหมวด
              </button>
            </div>
            
            <p className="text-xs text-muted mb-6 opacity-75 no-print">💡 แตะที่ตัวเลขยอดเงิน / งบ เพื่อแก้ไขเป้าหมาย</p>

            <div className="flex flex-col gap-5">
              {CATEGORIES.map(cat => {
                const spent = categoryExpenses[cat] || 0;
                const limit = budgets[cat];
                const percent = Math.min((spent / limit) * 100, 100);
                
                let statusColor = 'var(--accent-green)'; // default green
                if (percent > 85) statusColor = 'var(--accent-red)';
                else if (percent > 65) statusColor = 'var(--accent-orange)';

                return (
                  <div key={cat} className="w-full">
                    <div className="flex justify-between items-end mb-1 print:text-black">
                      <span className="font-medium text-sm">{cat}</span>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-sm">
                          <span className="font-bold text-main print:text-black" style={{ color: percent >= 100 ? 'var(--accent-red)' : ''}}>
                            {formatMoney(spent)}
                          </span> 
                          <span className="text-muted text-xs mx-1 print:text-black">/</span>
                          <span 
                            className="text-muted text-sm cursor-pointer hover:text-white transition-colors bg-slate-800/50 px-1.5 py-0.5 rounded cursor-pointer print:bg-transparent print:text-black print:px-0"
                            onClick={() => {
                              const newLimit = prompt(`ตั้งค่างบประมาณสำหรับ: ${cat}`, limit);
                              if (newLimit !== null && !isNaN(newLimit) && newLimit !== '') {
                                setBudgets(prev => ({...prev, [cat]: parseFloat(newLimit)}));
                              }
                            }}
                          >
                            {formatMoney(limit)} <span className="no-print">✎</span>
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="progress-container h-2 bg-slate-800 print:bg-gray-200">
                      <div className="progress-bar print:!bg-black print:!opacity-50" style={{ width: `${percent}%`, backgroundColor: statusColor }} />
                    </div>
                    {percent >= 100 && (
                      <p className="text-xs text-red mt-1 text-right font-medium print:text-black">⚠️ เกินงบที่ตั้งไว้แล้ว!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 print:text-black">
              <PieChartIcon size={20} /> สัดส่วนรายจ่าย (รอบบิลนี้)
            </h2>
            {pieData.length === 0 ? (
              <p className="text-center text-muted py-4">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="w-full h-[250px] no-print" style={{ color: '#fff' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="rgba(255,255,255,0.1)"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => {
                        const num = Number(value);
                        return isNaN(num) ? value : `฿ ${num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
                      }} 
                      contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#f8fafc', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <div className="glass-card bg-indigo-900/20 border-indigo-500/30">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-indigo-400 print:text-indigo-700">
              <Bot size={22} /> AI แนะนำการเงิน
            </h2>
            <div className="flex gap-3 items-start bg-slate-800/60 p-4 rounded-xl print:border print:border-gray-300 print:bg-transparent print:text-black">
              <Sparkles size={24} className={`shrink-0 ${aiRec.status === 'warning' ? 'text-red-400' : aiRec.status === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
              <p className="text-sm leading-relaxed whitespace-pre-line print:text-black text-gray-200">
                 {aiRec.message}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Backup and Restore */}
      <div className="glass-card mt-8 no-print text-center">
        <h2 className="text-lg font-bold mb-3 flex items-center justify-center gap-2">
          <span>🔒</span> สำรองข้อมูลให้ปลอดภัย (Backup & Restore)
        </h2>
        <p className="text-sm text-muted mb-6">
          แอปนี้เก็บข้อมูลไว้ในเบราว์เซอร์ของเครื่องคุณแบบ <b>ถาวร (10 ปีก็ยังอยู่ถ้าไม่ล้างประวัติเว็บ)</b> 
          <br/>คุณสามารถกดย้อนกลับไปดูเดือนที่แล้วได้เรื่อยๆ โดยใช้ลูกศร <b>&lt; ถอยหลัง</b> ด้านบน
          <br/>แต่หากต้องการย้ายเครื่องมือถือ/คอม หรือกลัวข้อมูลหาย สามารถดาวน์โหลดไฟล์สำรองเก็บไว้ได้ครับ
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={exportBackup} className="btn-secondary text-sm bg-slate-800/80 hover:bg-slate-700">
            💾 ดาวน์โหลดไฟล์สำรองข้อมูล (Export JSON)
          </button>
          <label className="btn-secondary text-sm bg-slate-800/80 hover:bg-slate-700 cursor-pointer mb-0">
            📂 อัปโหลดไฟล์เพื่อกู้คืน (Import JSON)
            <input type="file" accept=".json" className="hidden" onChange={importBackup} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(() => localStorage.getItem('smartSaverProfile') || 'ปัณด้า');

  const handleProfileChange = (newProfile) => {
    localStorage.setItem('smartSaverProfile', newProfile);
    setProfile(newProfile);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      {/* Profile Switcher placed in normal flow to avoid overlapping header on small phones */}
      <div className="w-full max-w-[1000px] flex justify-end px-4 pt-4 sm:px-4 sm:pt-6 z-[100] no-print relative">
        <div className="flex gap-1 sm:gap-2 bg-[#0f172a] p-1 sm:p-1.5 rounded-xl border border-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => handleProfileChange('ปัณด้า')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${profile === 'ปัณด้า' ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)]' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            👩🏻 ของปัณด้า
          </button>
          <button 
            onClick={() => handleProfileChange('ก้อง')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${profile === 'ก้อง' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-transparent text-gray-400 hover:text-white'}`}
          >
            👨🏻 ของก้อง
          </button>
        </div>
      </div>
      
      {/* Remount entirely when profile changes to sandbox all states perfectly */}
      <div className="w-full relative sm:mt-[-1rem]">
        <SmartSaverApp key={profile} profileName={profile} />
      </div>
    </div>
  );
}
