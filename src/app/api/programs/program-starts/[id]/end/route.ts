import { NextRequest, NextResponse } from 'next/server';
import { ProgramStart } from '@/models/ProgramStart';
import { ProgramEnd } from '@/models/ProgramEnd';
import { ProgramLog, ProgramLogType } from '@/models/ProgramLog';
import { initDb } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const AppDataSource = await initDb();
    const { id } = await params;
    const programId = Number(id);
    if (!programId) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    const body = await request.json();
    const { reason } = body;

    const repo = AppDataSource.getRepository(ProgramStart);
    const programEndRepo = AppDataSource.getRepository(ProgramEnd);
    const programLogRepo = AppDataSource.getRepository(ProgramLog);
    
    // students, program 관계까지 join해서 가져옴
    const programStart = await repo.findOne({ where: { id: programId }, relations: ['program', 'students'] });
    if (!programStart) return NextResponse.json({ error: 'ProgramStart를 찾을 수 없습니다.' }, { status: 404 });
    if (!programStart.isStarted) return NextResponse.json({ error: '이미 종료된 프로그램입니다.' }, { status: 400 });

    // ProgramStart의 모든 주요 필드를 ProgramEnd에 복사
    const programEnd = programEndRepo.create({
      programStartId: programStart.id,
      programId: programStart.program.id,
      programName: programStart.programName,
      startDate: programStart.startDate,
      endDate: programStart.endDate,
      isStarted: false,
      students: programStart.students.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        classNumber: s.classNumber,
        studentNumber: s.studentNumber
      })),
      reason
    });
    await programEndRepo.save(programEnd);

    // 프로그램 종료 로그 생성
    const endLog = programLogRepo.create({
      programStart: programStart,
      logType: ProgramLogType.END,
      title: `${programStart.programName} 프로그램 종료`,
      content: `${programStart.programName} 프로그램이 종료되었습니다. 종료 사유: ${reason || '사유 없음'}`,
      additionalData: {
        reason: reason,
        studentCount: programStart.students.length,
        studentNames: programStart.students.map(s => s.name)
      },
      createdBy: '시스템'
    });
    await programLogRepo.save(endLog);

    // ProgramEnd에 저장한 후 ProgramStart에서 완전히 삭제
    await repo.remove(programStart);
    
    console.log(`[프로그램 종료 및 삭제] id=${programId}, reason=${reason}`);
    return NextResponse.json({ message: '프로그램이 종료되고 삭제되었습니다.' });
  } catch (error) {
    console.error('프로그램 종료 오류:', error);
    return NextResponse.json({ error: '프로그램 종료 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // PATCH와 동일하게 동작
  return PATCH(request, ctx);
} 