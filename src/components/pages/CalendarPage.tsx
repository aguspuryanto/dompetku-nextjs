'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/types/transaction';
import { cn } from '@/lib/utils';

interface CalendarPageProps {
  transactions: Transaction[];
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export function CalendarPage({ transactions, onEditTransaction, onDeleteTransaction }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  interface CalendarData {
    daysInMonth: number;
    startingDayOfWeek: number;
    year: number;
    month: number;
  }

  const calendarData = useMemo<CalendarData>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return {
      daysInMonth,
      startingDayOfWeek,
      year,
      month
    };
  }, [currentDate]);

  const { daysInMonth, startingDayOfWeek, year, month } = calendarData;

  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    
    transactions.forEach(transaction => {
      try {
        // Ensure the date is in the correct format (YYYY-MM-DD)
        const date = new Date(transaction.date);
        if (isNaN(date.getTime())) {
          console.error('Invalid date for transaction:', transaction);
          return;
        }
        
        const dateKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(transaction);
      } catch (error) {
        console.error('Error processing transaction:', transaction, error);
      }
    });

    // console.log('Grouped transactions:', grouped);
    return grouped;
  }, [transactions]);

  const getDayTransactions = (day: number): Transaction[] => {
    try {
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) {
        console.error(`Invalid date: ${year}-${month + 1}-${day}`);
        return [];
      }
      
      const dateKey = date.toISOString().split('T')[0];
      const dayTransactions = transactionsByDate[dateKey] || [];
      
      // Debug log
      if (dayTransactions.length > 0) {
        // console.log(`Found ${dayTransactions.length} transactions for ${dateKey}:`, dayTransactions);
      }
      
      return dayTransactions;
    } catch (error) {
      console.error(`Error getting transactions for day ${day}:`, error);
      return [];
    }
  };

  const getDaySummary = (day: number) => {
    const dayTransactions = getDayTransactions(day);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const summary = { 
      income, 
      expenses, 
      count: dayTransactions.length,
      hasIncome: income > 0,
      hasExpenses: expenses > 0
    };
    
    // console.log(`Summary for day ${day}:`, summary);
    return summary;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    setIsDetailModalOpen(true);
  };

  const getTransactionsForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return transactionsByDate[dateKey] || [];
  };

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-20 border border-border/50 bg-muted/20" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const daySummary = getDaySummary(day);
      const isToday = isCurrentMonth && day === todayDate;
      const hasTransactions = daySummary.count > 0;

      days.push(
        <motion.div
          key={day}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (day - 1) * 0.01 }}
          className={cn(
            "h-20 border border-border/50 p-2 cursor-pointer transition-all",
            "hover:bg-muted/50 hover:border-primary/50",
            isToday && "bg-primary/10 border-primary/50",
            hasTransactions && "bg-muted/30"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDayClick(day)}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-sm font-medium",
                isToday && "text-primary font-bold"
              )}>
                {day}
              </span>
              {hasTransactions && (
                <Badge variant="secondary" className="text-xs h-5 px-1">
                  {daySummary.count}
                </Badge>
              )}
            </div>
            
            {hasTransactions && (
              <div className="flex-1 space-y-1 overflow-hidden">
                {daySummary.income > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="truncate">{formatCurrency(daySummary.income)}</span>
                  </div>
                )}
                {daySummary.expenses > 0 && (
                  <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <TrendingDown className="w-3 h-3" />
                    <span className="truncate">{formatCurrency(daySummary.expenses)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const getMonthSummary = () => {
    // Use the year and month from calendarData
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    let totalIncome = 0;
    let totalExpenses = 0;
    let transactionCount = 0;

    // console.log('Calculating month summary for:', monthKey);
    // console.log('Available transaction dates:', Object.keys(transactionsByDate));

    Object.entries(transactionsByDate).forEach(([dateKey, dayTransactions]) => {
      if (dateKey.startsWith(monthKey)) {
        // console.log(`Processing transactions for ${dateKey}:`, dayTransactions);
        dayTransactions.forEach(transaction => {
          if (transaction.type === 'income') {
            totalIncome += Number(transaction.amount) || 0;
          } else if (transaction.type === 'expense') {
            totalExpenses += Number(transaction.amount) || 0;
          }
          transactionCount++;
        });
      }
    });

    // console.log('Month summary:', { totalIncome, totalExpenses, transactionCount });
    return { 
      totalIncome, 
      totalExpenses, 
      transactionCount 
    };
  };

  const monthSummary = getMonthSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-foreground">Kalender</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAllTransactions(true)}
            className="text-xs"
          >
            Lihat Semua
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hari Ini
          </Button>
        </div>
      </motion.div>

      {/* Month Summary - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-950/60 ring-1 ring-blue-200 dark:ring-blue-900/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ringkasan Bulan Ini</p>
                <h3 className="text-xl font-bold text-foreground">
                  {monthNames[month]} {year}
                </h3>
              </div>
              <div className="flex items-center gap-1 bg-white/60 dark:bg-black/40 px-2.5 py-1 rounded-full border border-white/20">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-foreground/80">
                  {monthSummary.transactionCount} transaksi
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">Pemasukan</p>
                </div>
                <p className="text-base font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(monthSummary.totalIncome)}
                </p>
              </div>
              
              <div className="bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-xs text-muted-foreground">Pengeluaran</p>
                </div>
                <p className="text-base font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(monthSummary.totalExpenses)}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goToToday}
                  className="text-xs h-8"
                >
                  Hari Ini
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Legend - Hidden for now
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 text-sm">Legenda</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Pemasukan</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-xs text-muted-foreground">Hari ini</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      */}

      {/* All Transactions Modal */}
      <AnimatePresence>
        {showAllTransactions && (
          <Dialog open={showAllTransactions} onOpenChange={setShowAllTransactions}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Semua Transaksi</DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTransactions(false)}
                    className="h-8 w-8 p-0"
                  >
                    {/* <X className="w-4 h-4" /> */}
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Belum ada transaksi</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {[...transactions]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
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
                            <span>{new Date(transaction.date).toLocaleDateString('id-ID', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
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
                          <div className="flex gap-1">
                            {onEditTransaction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  onEditTransaction(transaction);
                                  setShowAllTransactions(false);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                aria-label="Edit transaksi"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {onDeleteTransaction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  onDeleteTransaction(transaction.id);
                                  setShowAllTransactions(false);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                aria-label="Hapus transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Summary */}
                {transactions.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Transaksi:</span>
                        <span className="font-medium">{transactions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Pemasukan:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(
                            transactions
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Pengeluaran:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(
                            transactions
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span>Saldo Keseluruhan:</span>
                        <span className={
                          transactions
                            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {formatCurrency(
                            transactions
                              .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedDate && (
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>
                    {selectedDate.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    {/* <X className="w-4 h-4" /> */}
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {getTransactionsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Tidak ada transaksi pada tanggal ini</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getTransactionsForDate(selectedDate).map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
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
                          {transaction.notes && (
                            <p className="text-xs text-muted-foreground">{transaction.notes}</p>
                          )}
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
                          <div className="flex gap-1">
                            {onEditTransaction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  onEditTransaction(transaction);
                                  setIsDetailModalOpen(false);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                aria-label="Edit transaksi"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {onDeleteTransaction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  onDeleteTransaction(transaction.id);
                                  setIsDetailModalOpen(false);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                aria-label="Hapus transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Daily Summary */}
                {getTransactionsForDate(selectedDate).length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Pemasukan:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(
                            getTransactionsForDate(selectedDate)
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Pengeluaran:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          {formatCurrency(
                            getTransactionsForDate(selectedDate)
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span>Saldo Hari Ini:</span>
                        <span className={
                          getTransactionsForDate(selectedDate)
                            .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }>
                          {formatCurrency(
                            getTransactionsForDate(selectedDate)
                              .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}