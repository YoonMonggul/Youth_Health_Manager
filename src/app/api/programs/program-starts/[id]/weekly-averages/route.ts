import { NextRequest, NextResponse } from 'next/server';
import { ProgramStart } from '@/models/ProgramStart';
import { Growth } from '@/models/Growth';
import { initDb } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const AppDataSource = await initDb();
    const { id } = await params;
    const programId = Number(id);
    if (!programId) return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const trendType = searchParams.get('trendType') || 'BMI'; // BMI 또는 WAIST

    const programStartRepo = AppDataSource.getRepository(ProgramStart);
    const growthRepo = AppDataSource.getRepository(Growth);

    // 프로그램 정보 조회
    const programStart = await programStartRepo.findOne({ 
      where: { id: programId }, 
      relations: ['students', 'program'] 
    });
    
    if (!programStart) {
      return NextResponse.json({ error: '프로그램을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로그램 기간 계산
    const startDate = new Date(programStart.startDate);
    const endDate = new Date(programStart.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);

    // 주차별 평균값 계산
    const weeklyAverages = [];

    for (let week = 1; week <= totalWeeks; week++) {
      // 해당 주차의 시작일과 종료일 계산
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + (week - 1) * 7);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      // 해당 주차에 측정된 모든 학생의 데이터 조회
      const studentIds = programStart.students.map(s => s.id);
      
      const weeklyData = await growthRepo
        .createQueryBuilder('growth')
        .where('growth.student.id IN (:...studentIds)', { studentIds })
        .andWhere('growth.measurementDate >= :weekStart', { weekStart: weekStartDate.toISOString().split('T')[0] })
        .andWhere('growth.measurementDate <= :weekEnd', { weekEnd: weekEndDate.toISOString().split('T')[0] })
        .getMany();

      // 평균값 계산
      let averageValue = 0;
      let validCount = 0;

      if (trendType === 'WAIST') {
        // 허리둘레 평균
        const validData = weeklyData.filter(d => d.waistCircumference);
        if (validData.length > 0) {
          averageValue = validData.reduce((sum, d) => sum + Number(d.waistCircumference), 0) / validData.length;
          validCount = validData.length;
        }
      } else {
        // BMI 평균
        if (weeklyData.length > 0) {
          averageValue = weeklyData.reduce((sum, d) => sum + Number(d.bmi), 0) / weeklyData.length;
          validCount = weeklyData.length;
        }
      }

      weeklyAverages.push({
        week,
        averageValue: validCount > 0 ? Number(averageValue.toFixed(2)) : null,
        participantCount: validCount,
        weekStartDate: weekStartDate.toISOString().split('T')[0],
        weekEndDate: weekEndDate.toISOString().split('T')[0]
      });
    }

    return NextResponse.json({
      programId: programId,
      programName: programStart.programName,
      trendType,
      totalWeeks,
      weeklyAverages
    });

  } catch (error) {
    console.error('주차별 평균값 계산 오류:', error);
    return NextResponse.json({ error: '주차별 평균값 계산 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 