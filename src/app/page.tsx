'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Transaction, TransactionFormData, TransactionSummary } from '@/types/transaction';
import { BottomNavigation } from '@/components/mobile/BottomNavigation';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { StatusBar } from '@/components/mobile/StatusBar';
import { StatisticsPage } from '@/components/pages/StatisticsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { CalendarPage } from '@/components/pages/CalendarPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { useSwipeGestures, usePullToRefresh } from '@/hooks/useSwipeGestures';
import { useHapticButton } from '@/hooks/useHapticFeedback';
// import { useDataPersistence } from '@/lib/useDataPersistence';
import { useTransactions } from '@/contexts/TransactionContext';

const INCOME_CATEGORIES = ['Gaji', 'Freelance', 'Investasi', 'Bisnis', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Tagihan', 'Kesehatan', 'Lainnya'];

export default function Home() {
  // Your existing state and logic
  // const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { transactions = [], isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  // Use the persistence hook
  // useDataPersistence('transactions', transactions);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load transactions from localStorage on mount
  // useEffect(() => {
  //   const savedTransactions = localStorage.getItem('transactions');
  //   if (savedTransactions) {
  //     setTransactions(JSON.parse(savedTransactions));
  //   }
  // }, []);

  // Save transactions to localStorage whenever they change
  // useEffect(() => {
  //   localStorage.setItem('transactions', JSON.stringify(transactions));
  // }, [transactions]);

  // Swipe gestures for navigation
  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      const tabs = ['home', 'statistics', 'calendar', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    },
    onSwipeRight: () => {
      const tabs = ['home', 'statistics', 'calendar', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
      }
    }
  });

  // Pull to refresh functionality
  const handleRefresh = async () => {
    // Simulate refresh - reload transactions from localStorage
    // const savedTransactions = localStorage.getItem('transactions');
    // if (savedTransactions) {
    //   setTransactions(JSON.parse(savedTransactions));
    // }
  };

  const { pullDistance, isPulling, isRefreshing, pullToRefreshProps } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: activeTab !== 'home' // Only enable pull-to-refresh on home tab
  });

  const hapticDelete = useHapticButton('heavy');
  const hapticSuccess = useHapticButton('success');

  // Calculate summary - now we can be sure transactions is an array
  const summary: TransactionSummary = (transactions || []).reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
        acc.totalBalance += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
        acc.totalBalance -= transaction.amount;
      }
      return acc;
    },
    { totalBalance: 0, totalIncome: 0, totalExpenses: 0 }
  );

  // Sort transactions by date (latest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleAddTransaction = () => {
    if (!formData.category || !formData.amount || !formData.date) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    addTransaction(newTransaction);
    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddModalOpen(false);
    hapticSuccess.onClick();
  };

  const handleDeleteTransaction = (id: string) => {
    const handleDelete = async (id: string) => {
      if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        await deleteTransaction(id);
      }
    };
    handleDelete(id);
    hapticDelete.onClick();
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date,
      notes: transaction.notes || ''
    });
    setIsEditModalOpen(true);
    hapticSuccess.onClick();
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !formData.category || !formData.amount || !formData.date) return;

    const updates = {
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: formData.date,
      notes: formData.notes,
      updatedAt: new Date().toISOString()
    };

    await updateTransaction(editingTransaction.id, updates);

    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsEditModalOpen(false);
    setEditingTransaction(null);
    hapticSuccess.onClick();
  };

  const handleClearAllData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data transaksi?')) {
      deleteTransaction('all');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderHomePage = () => (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-sm opacity-90 mb-2">Total Saldo</p>
            <motion.p 
              className="text-4xl font-bold"
              key={summary.totalBalance}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {formatCurrency(summary.totalBalance)}
            </motion.p>
            <div className="mt-3 flex justify-center gap-4 text-xs opacity-80">
              <span>{transactions.length} transaksi</span>
              {summary.totalBalance >= 0 ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Sehat
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Peringatan
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Pemasukan</span>
              </div>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(summary.totalIncome)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Pengeluaran</span>
              </div>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">Belum ada transaksi</p>
                <p className="text-sm text-muted-foreground/70">Mulai lacak keuangan Anda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {sortedTransactions.slice(0, 10).map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={transaction.type === 'income' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                          <span className="font-medium text-sm">{transaction.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.notes && (
                            <span>• {transaction.notes}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`font-bold ${
                            transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          aria-label="Edit transaksi"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          aria-label="Hapus transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sortedTransactions.length > 10 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('calendar')}>
                      Lihat semua transaksi
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomePage();
      case 'statistics':
        return <StatisticsPage transactions={sortedTransactions} />;
      case 'calendar':
        return <CalendarPage 
          transactions={sortedTransactions} 
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />;
      case 'settings':
        return <SettingsPage transactions={sortedTransactions} onClearData={handleClearAllData} />;
      default:
        return renderHomePage();
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'MyFinance';
      case 'statistics':
        return 'Statistik';
      case 'calendar':
        return 'Kalender';
      case 'settings':
        return 'Pengaturan';
      default:
        return 'MyFinance';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <StatusBar /> */}
      
      <div className="max-w-md mx-auto">
        {/* Mobile Header */}
        <MobileHeader
          title={getHeaderTitle()}
          showBell={activeTab === 'home'}
          showSearch={activeTab === 'home'}
          rightAction={
            mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 p-0"
                aria-label="Toggle tema"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )
          }
        />

        {/* Main Content */}
        <div 
          className="px-4 pb-24 pt-4 mobile-viewport"
          {...swipeGestures}
          {...pullToRefreshProps}
        >
          {/* Pull to Refresh Indicator */}
          {(isPulling || isRefreshing) && activeTab === 'home' && (
            <motion.div
              className="flex justify-center py-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
                <span>{isRefreshing ? 'Memperbarui...' : 'Lepas untuk memperbarui'}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'add') {
              setIsAddModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }} 
        />
      </div>

      {/* Add Transaction Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Tipe</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData({ ...formData, type: value, category: '' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Jumlah</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleAddTransaction}
                className="flex-1"
                disabled={!formData.category || !formData.amount || !formData.date}
              >
                Tambah Transaksi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Tipe</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData({...formData, type: value, category: ''})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-amount">Jumlah</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-date">Tanggal</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">Catatan (opsional)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Tambahkan catatan..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTransaction(null);
                  setFormData({
                    type: 'expense',
                    category: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: ''
                  });
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button 
                onClick={handleUpdateTransaction}
                className="flex-1"
                disabled={!formData.category || !formData.amount || !formData.date}
              >
                Perbarui Transaksi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}