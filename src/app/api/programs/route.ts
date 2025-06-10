import { NextResponse } from 'next/server';
import { Program } from '@/models/program';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    const AppDataSource = await initDb();
    const programRepository = AppDataSource.getRepository(Program);
    const programs = await programRepository.find({
      order: { id: 'DESC' }
    });
    return NextResponse.json({ programs });
  } catch (error) {
    return NextResponse.json({ error: '프로그램 목록 조회 실패', detail: String(error) }, { status: 500 });
  }
} 