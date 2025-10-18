// src/lib/storagePersistence.ts
import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'uangku_zai_data';
const BACKUP_FILE = 'uangku_zai_data.json';

// Hanya simpan ke localStorage
export const saveToLocalStorage = (data: any) => {
  try {
    const dataStr = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, dataStr);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Simpan ke localStorage dan download file
export const saveAndDownloadData = (data: any) => {
  try {
    const dataStr = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, dataStr);
    
    // Hanya lakukan download jika dipanggil secara eksplisit
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = BACKUP_FILE;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Load data dari localStorage
export const loadData = () => {
  try {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    return dataStr ? JSON.parse(dataStr) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Import data dari file
export const importData = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        resolve(data);
      } catch (error) {
        console.error('Error importing data:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};