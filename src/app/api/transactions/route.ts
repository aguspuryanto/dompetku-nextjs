// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface TransactionInput {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date?: string;
  id?: string;
  createdAt?: string;
}

const DB_DIR = path.join(process.cwd(), 'db');
const DB_FILE = path.join(DB_DIR, 'uangku_zai_data.json');

// Helper functions for file operations
async function readTransactions() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure we always return an array, even if the file contains something else
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    console.error('Error reading transactions:', error);
    return []; // Return empty array for any other errors
  }
}

async function writeTransactions(transactions: any[]) {
  console.log('Writing transactions:', transactions);
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const transactions = await readTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error reading transactions:', error);
    return NextResponse.json(
      { error: 'Failed to read transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const transaction: TransactionInput = await request.json();
    // {
    //   "id": "1760763253327",
    //   "type": "expense",
    //   "category": "Lainnya",
    //   "amount": 86500,
    //   "date": "2025-10-13",
    //   "notes": "deposit gotrade",
    //   "createdAt": "2025-10-18T04:54:13.327Z"
    // }
    
    // Basic validation
    if (!transaction.amount || !transaction.type || !transaction.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure amount is a number
    const amount = Number(transaction.amount);
    if (isNaN(amount)) {
      return NextResponse.json(
        { error: 'Amount must be a number' },
        { status: 400 }
      );
    }

    const transactions = await readTransactions();
    const newTransaction = {
      ...transaction,
      amount,
      date: transaction.date || new Date().toISOString().split('T')[0],
      id: transaction.id || Date.now().toString(),
      createdAt: transaction.createdAt || new Date().toISOString(),
    };

    transactions.push(newTransaction);
    
    try {
      await writeTransactions(transactions);
      return NextResponse.json({ 
        success: true, 
        data: newTransaction 
      });
    } catch (writeError) {
      console.error('Error writing to file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save transaction to storage' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}