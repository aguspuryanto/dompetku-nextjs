// src/app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'db');
const DB_FILE = path.join(DB_DIR, 'uangku_zai_data.json');

async function readTransactions() {
  try {
    await fs.mkdir(DB_DIR, { recursive: true });
    const data = await fs.readFile(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    console.error('Error reading transactions:', error);
    return [];
  }
}

async function writeTransactions(transactions: any[]) {
  console.log('Writing transactions:', transactions);
  await fs.mkdir(DB_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const transactions = await readTransactions();
    const index = transactions.findIndex((t: any) => t.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    transactions[index] = { ...transactions[index], ...updates };
    await writeTransactions(transactions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const transactions = await readTransactions();
    const filtered = transactions.filter((t: any) => t.id !== params.id);
    
    if (filtered.length === transactions.length) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await writeTransactions(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}