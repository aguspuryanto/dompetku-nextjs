'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  CreditCard,
  FileText,
  LogOut,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { Transaction } from '@/types/transaction';
import { saveAndDownloadData, importData } from '@/lib/storagePersistence';

interface SettingsItemBase {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  action: 'chevron' | 'switch' | 'button';
  display?: string;
}

interface SettingsItemChevron extends SettingsItemBase {
  action: 'chevron';
  badge?: string | null;
}

interface SettingsItemSwitch extends SettingsItemBase {
  action: 'switch';
  value: boolean;
  onChange: (checked: boolean) => void;
}

interface SettingsItemButton extends SettingsItemBase {
  action: 'button';
  buttonText: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onButtonClick: () => void;
  disabled?: boolean;
}

type SettingsItem = SettingsItemChevron | SettingsItemSwitch | SettingsItemButton;

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsPageProps {
  transactions: Transaction[];
  onClearData: () => void;
}

export function SettingsPage({ transactions, onClearData }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // const [transactions, setTransactions] = useState<Transaction[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleBackupData = () => {
    try {
      setIsBackingUp(true);
      
      // Create a data object with metadata
      const backupData = {
        appName: 'UangkuZai',
        backupDate: new Date().toISOString(),
        transactionCount: transactions.length,
        data: transactions
      };

      // Convert to JSON string
      const dataStr = JSON.stringify(backupData, null, 2);
      
      // Create a Blob with the data
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `uangku-zai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert('Backup data berhasil dibuat');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Gagal membuat backup data');
    } finally {
      setIsBackingUp(false);
    }
  };

  const calculateTotalBalance = () => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        return acc + transaction.amount;
      } else {
        return acc - transaction.amount;
      }
    }, 0);
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Akun",
      items: [
        {
          icon: User,
          label: "Profil Saya",
          description: "Kelola informasi profil Anda",
          action: "chevron" as const,
          badge: undefined
        },
        {
          icon: CreditCard,
          label: "Metode Pembayaran",
          description: "Atur metode pembayaran",
          action: "chevron" as const,
          badge: undefined
        }
      ]
    },
    {
      title: "Preferensi",
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: "Tema Gelap",
          description: "Aktifkan mode gelap",
          action: "switch" as const,
          value: theme === 'dark',
          onChange: () => setTheme(theme === 'dark' ? 'light' : 'dark')
        },
        {
          icon: Bell,
          label: "Notifikasi",
          description: "Terima pemberitahuan transaksi",
          action: "switch" as const,
          value: notifications,
          onChange: setNotifications
        },
        {
          icon: Smartphone,
          label: "Autentikasi Biometrik",
          description: "Gunakan sidik jari/face ID",
          action: "switch" as const,
          value: biometric,
          onChange: setBiometric
        }
      ]
    },
    {
      title: "Data & Privasi",
      items: [
        {
          icon: Download,
          label: "Backup Data",
          description: "Simpan data transaksi ke file",
          action: "button" as const,
          buttonText: isBackingUp ? "Memproses..." : "Backup",
          buttonVariant: "outline",
          onButtonClick: () => {
            // This will trigger a download of the data file
            saveAndDownloadData({ transactions });
          },
          disabled: isBackingUp
        },
        {
          icon: Trash2,
          label: "Hapus Semua Data",
          description: "Hapus semua transaksi",
          action: "button" as const,
          buttonText: "Hapus",
          buttonVariant: "destructive",
          onButtonClick: onClearData,
          display: "none"
        }
      ]
    },
    {
      title: "Bantuan",
      items: [
        {
          icon: HelpCircle,
          label: "Pusat Bantuan",
          description: "FAQ dan panduan penggunaan",
          action: "chevron" as const,
          badge: undefined
        },
        {
          icon: Globe,
          label: "Tentang Aplikasi",
          description: "Versi 1.0.0",
          action: "chevron" as const,
          badge: "v1.0.0"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Pengguna MyFinance</h3>
                <p className="text-sm opacity-90">user@myfinance.app</p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span>{transactions.length} transaksi</span>
                  <span>•</span>
                  <span>Saldo: {formatCurrency(calculateTotalBalance())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sectionIndex * 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items
                .filter(item => item.display !== 'none')
                .map((item, itemIndex, filteredItems) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="ml-3">
                        {item.action === 'chevron' && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        {item.action === 'switch' && (
                          <Switch
                            checked={item.value}
                            onCheckedChange={item.onChange}
                          />
                        )}
                        {item.action === 'button' && (
                          <Button
                            variant={item.buttonVariant || 'outline'}
                            size="sm"
                            onClick={item.onButtonClick}
                            disabled={item.disabled}
                          >
                            {item.buttonText}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                    {itemIndex < filteredItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // Implement logout functionality
            console.log('Logout clicked');
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </motion.div>
    </div>
  );
}