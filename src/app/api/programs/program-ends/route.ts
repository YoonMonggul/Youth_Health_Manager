import { NextResponse } from 'next/server';
import { ProgramEnd } from '@/models/ProgramEnd';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    const AppDataSource = await initDb();
    const programEndRepo = AppDataSource.getRepository(ProgramEnd);
    const ends = await programEndRepo.find();
    return NextResponse.json({ items: ends }, { status: 200 });
  } catch (error) {
    console.error('종료된 프로그램 목록 조회 오류:', error);
    return NextResponse.json({ error: '종료된 프로그램 목록 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 