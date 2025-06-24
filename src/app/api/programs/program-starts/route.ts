import { NextRequest, NextResponse } from 'next/server';
import { Program } from '@/models/program';
import { Student } from '@/models/Student';
import { ProgramStart } from '@/models/ProgramStart';
import { initDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const AppDataSource = await initDb();
    const body = await request.json();
    const { programId, programName, studentIds, startDate, endDate } = body;

    if (!programId || !Array.isArray(studentIds) || !startDate || !endDate) {
      return NextResponse.json({ error: '필수 입력값이 누락되었습니다.' }, { status: 400 });
    }

    const programRepo = AppDataSource.getRepository(Program);
    const studentRepo = AppDataSource.getRepository(Student);
    const programStartRepo = AppDataSource.getRepository(ProgramStart);

    const program = await programRepo.findOne({ where: { id: programId } });
    if (!program) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 });
    }

    const students = await studentRepo.findByIds(studentIds);
    if (!students || students.length === 0) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 중복 방지: 동일 프로그램, 동일 기간, isStarted=true
    const duplicate = await programStartRepo.findOne({
      where: { program: { id: programId }, startDate, endDate, isStarted: true },
      relations: ['program']
    });
    if (duplicate) {
      return NextResponse.json({ error: '이미 동일한 기간에 시작된 프로그램이 있습니다.' }, { status: 400 });
    }

    const programStart = programStartRepo.create({
      program,
      students,
      startDate,
      endDate,
      isStarted: true,
      programName
    });
    const saved = await programStartRepo.save(programStart);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('프로그램 시작 생성 오류:', error);
    return NextResponse.json({ error: '프로그램 시작 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const AppDataSource = await initDb();
    const programStartRepo = AppDataSource.getRepository(ProgramStart);
    // isStarted가 true인 프로그램만 반환 + students도 join
    const activeProgramStarts = await programStartRepo
      .createQueryBuilder('ps')
      .leftJoinAndSelect('ps.program', 'program')
      .leftJoinAndSelect('ps.students', 'students')
      .where('ps.isStarted = :isStarted', { isStarted: true })
      .getMany();
    return NextResponse.json({ items: activeProgramStarts }, { status: 200 });
  } catch (error) {
    console.error('진행중인 프로그램 조회 오류:', error);
    return NextResponse.json({ error: '진행중인 프로그램 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 