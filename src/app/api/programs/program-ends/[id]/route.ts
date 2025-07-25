import { NextRequest, NextResponse } from 'next/server';
import { ProgramEnd } from '@/models/ProgramEnd';
import { initDb } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const AppDataSource = await initDb();
    const { id } = await params;
    const programEndId = Number(id);
    
    if (!programEndId) {
      return NextResponse.json({ error: '프로그램 ID가 필요합니다.' }, { status: 400 });
    }

    const programEndRepo = AppDataSource.getRepository(ProgramEnd);
    const programEnd = await programEndRepo.findOne({ where: { id: programEndId } });
    
    if (!programEnd) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(programEnd, { status: 200 });
  } catch (error) {
    console.error('프로그램 상세 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '프로그램 상세 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 