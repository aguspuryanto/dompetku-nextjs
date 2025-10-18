// src/hooks/useDataPersistence.ts
import { useEffect } from 'react';
import { saveToLocalStorage, loadData } from '@/lib/storagePersistence';
import { Transaction } from '@/types/transaction';

export const useDataPersistence = (dataKey: string, data: Transaction[]) => {
  useEffect(() => {
    // Load data saat komponen dimuat
    const savedData = loadData();
    if (savedData) {
      console.log('Loaded data:', savedData.transactions);
      // Di sini Anda perlu mengupdate state dengan data yang diload
      // Contoh: setTransactions(savedData.transactions);
    }
  }, [dataKey]);

  useEffect(() => {
    // Simpan ke localStorage setiap kali data berubah
    saveToLocalStorage(data);
  }, [data]);
};