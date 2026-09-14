import { NextResponse } from 'next/server';
import watersData from '@/data/waters.json';

export async function GET() {
  return NextResponse.json(watersData);
}
