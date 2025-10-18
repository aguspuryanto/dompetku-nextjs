'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types/transaction';

interface StatisticsPageProps {
  transactions: Transaction[];
}

export function StatisticsPage({ transactions }: StatisticsPageProps) {
  const [timeRange, setTimeRange] = useState('month');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return transactionDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return transactionDate >= yearAgo;
        default:
          return true;
      }
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    // Category breakdown
    const categoryBreakdown = filteredTransactions.reduce((acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = {
          amount: 0,
          count: 0,
          type: transaction.type
        };
      }
      acc[transaction.category].amount += transaction.amount;
      acc[transaction.category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number; type: string }>);

    return {
      income,
      expenses,
      balance,
      transactionCount: filteredTransactions.length,
      categoryBreakdown,
      averageTransaction: filteredTransactions.length > 0 
        ? (income + expenses) / filteredTransactions.length 
        : 0
    };
  }, [transactions, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5);
    
  const getTransactionsByCategory = (category: string, type: string) => {
    return transactions
      .filter(t => t.category === category && t.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="pb-20">
      {/* Modern Header */}
      <motion.div 
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pt-2 pb-3 px-4 border-b"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Statistik</h1>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week" className="text-xs">Minggu Ini</SelectItem>
              <SelectItem value="month" className="text-xs">Bulan Ini</SelectItem>
              <SelectItem value="year" className="text-xs">Tahun Ini</SelectItem>
              <SelectItem value="all" className="text-xs">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="p-4 space-y-4">
        {/* Balance Card - Enhanced with better visual feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <Card className={`border-0 shadow-sm rounded-2xl overflow-hidden transition-colors duration-300 ${
            stats.balance < 0 
              ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-950/60 ring-1 ring-red-200 dark:ring-red-900/50'
              : stats.balance < 500000 
                ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-950/60 ring-1 ring-orange-200 dark:ring-orange-900/50'
                : 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-950/60 ring-1 ring-green-200 dark:ring-green-900/50'
          }`}>
            <CardContent className="p-5">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-muted-foreground">Saldo Saat Ini</p>
                  {stats.balance < 0 ? (
                    <Badge variant="destructive" className="text-xs h-5">
                      Defisit
                    </Badge>
                  ) : stats.balance < 500000 ? (
                    <Badge variant="warning" className="text-xs h-5">
                      Perhatian
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-xs h-5">
                      Sehat
                    </Badge>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className={`text-3xl font-bold tracking-tight ${
                    stats.balance >= 0 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {formatCurrency(stats.balance)}
                  </p>
                  <div className="flex items-center space-x-1.5 bg-white/60 dark:bg-black/40 px-2.5 py-1 rounded-full border border-white/20">
                    {stats.balance >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-xs font-medium text-foreground/80">
                      {stats.transactionCount} transaksi
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {formatCurrency(stats.income)}
                    </span>
                    <span className="text-red-600 dark:text-red-400 flex items-center">
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                      {formatCurrency(stats.expenses)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats - Compact and modern */}
        <div className="grid grid-cols-2 gap-3 hidden md:block">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Pemasukan</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(stats.income)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Pengeluaran</p>
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(stats.expenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-base">Kategori Teratas</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {topCategories.length} kategori
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {topCategories.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
                  <p className="text-xs text-muted-foreground/70">
                    Transaksi akan muncul di sini
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCategories.map(([category, data], index) => {
                    const percentage = (data.amount / (stats.income + stats.expenses)) * 100;
                    const isIncome = data.type === 'income';
                    const isExpanded = expandedCategory === category;
                    const categoryTransactions = getTransactionsByCategory(category, data.type);
                    
                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="space-y-2"
                      >
                        <div 
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                            !isIncome ? 'hover:bg-muted/50' : ''
                          }`}
                          onClick={() => !isIncome && setExpandedCategory(isExpanded ? null : category)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-1.5 rounded-lg ${
                              isIncome 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {isIncome ? (
                                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{category}</p>
                              <p className="text-xs text-muted-foreground">
                                {percentage.toFixed(1)}% • {data.count} transaksi
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-semibold ${
                              isIncome 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatCurrency(data.amount)}
                            </p>
                            {!isIncome && (
                              isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )
                            )}
                          </div>
                        </div>
                        
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${
                              isIncome 
                                ? 'bg-green-500/20' 
                                : 'bg-red-500/20'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                          />
                        </div>
                        
                        {/* Expanded Transactions List */}
                        {!isIncome && (
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 pl-8 space-y-2">
                                  {categoryTransactions.map((transaction) => (
                                    <div 
                                      key={transaction.id} 
                                      className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded-lg"
                                    >
                                      <div>
                                        <p className="text-sm">{transaction.notes || 'Tanpa catatan'}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(transaction.date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        -{formatCurrency(transaction.amount)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}