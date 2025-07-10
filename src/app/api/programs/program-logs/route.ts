import { NextRequest, NextResponse } from 'next/server';
import { ProgramLog } from '@/models/ProgramLog';
import { initDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const AppDataSource = await initDb();
    const { searchParams } = new URL(request.url);
    
    const programStartId = searchParams.get('programStartId');
    const logType = searchParams.get('logType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const programLogRepo = AppDataSource.getRepository(ProgramLog);
    
    // 쿼리 빌더 생성
    const queryBuilder = programLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.programStart', 'programStart')
      .orderBy('log.createdAt', 'DESC');

    // 필터 조건 추가
    if (programStartId) {
      queryBuilder.andWhere('log.programStartId = :programStartId', { programStartId: parseInt(programStartId) });
    }
    
    if (logType) {
      queryBuilder.andWhere('log.logType = :logType', { logType });
    }

    // 전체 개수 조회
    const total = await queryBuilder.getCount();
    
    // 페이지네이션 적용
    const logs = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    return NextResponse.json({
      items: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('프로그램 로그 조회 오류:', error);
    return NextResponse.json({ error: '프로그램 로그 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 