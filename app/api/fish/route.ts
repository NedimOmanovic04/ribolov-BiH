import { NextResponse } from 'next/server';
import fishData from '@/data/fish.json';

export async function GET() {
  return NextResponse.json(fishData);
}
