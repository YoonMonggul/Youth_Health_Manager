import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource, initializeDatabase } from '@/database/data-source';
import { Health } from '@/models/health';
import { Student } from '@/models/Student';

// GET: 검진 데이터 목록 조회
export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchTerm = searchParams.get('searchTerm');
    const grade = searchParams.get('grade');
    const studentId = searchParams.get('studentId');

    const skip = (page - 1) * limit;

    const healthRepository = AppDataSource.getRepository(Health);
    const queryBuilder = healthRepository
      .createQueryBuilder('health')
      .leftJoinAndSelect('health.student', 'student')
      .orderBy('student.grade', 'ASC')
      .addOrderBy('student.classNumber', 'ASC')
      .addOrderBy('student.studentNumber', 'ASC')
      .addOrderBy('health.checkupDate', 'DESC');

    // 학생 ID로 필터링
    if (studentId) {
      queryBuilder.andWhere('health.studentId = :studentId', { studentId: parseInt(studentId) });
    }

    if (searchTerm) {
      queryBuilder.andWhere('student.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    if (grade) {
      queryBuilder.andWhere('student.grade = :grade', { grade: parseInt(grade) });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return NextResponse.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Health data fetch error:', error);
    return NextResponse.json(
      { error: '검진 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 검진 데이터 등록
export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const data = await req.json();
    const healthRepository = AppDataSource.getRepository(Health);
    const studentRepository = AppDataSource.getRepository(Student);

    // 학생 존재 여부 확인
    const student = await studentRepository.findOne({
      where: { id: data.studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 검진 데이터 생성
    const health = healthRepository.create({
      ...data,
      student
    });

    // 저장
    const savedHealth = await healthRepository.save(health);

    return NextResponse.json(savedHealth);
  } catch (error) {
    console.error('Health data creation error:', error);
    return NextResponse.json(
      { error: '검진 데이터 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 검진 데이터 수정
export async function PUT(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: '검진 데이터 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const healthRepository = AppDataSource.getRepository(Health);
    const health = await healthRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['student']
    });

    if (!health) {
      return NextResponse.json(
        { error: '검진 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 데이터 업데이트
    healthRepository.merge(health, data);
    const updatedHealth = await healthRepository.save(health);

    return NextResponse.json(updatedHealth);
  } catch (error) {
    console.error('Health data update error:', error);
    return NextResponse.json(
      { error: '검진 데이터 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 검진 데이터 삭제
export async function DELETE(req: NextRequest) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '검진 데이터 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const healthRepository = AppDataSource.getRepository(Health);
    const health = await healthRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!health) {
      return NextResponse.json(
        { error: '검진 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await healthRepository.remove(health);

    return NextResponse.json({ message: '검진 데이터가 삭제되었습니다.' });
  } catch (error) {
    console.error('Health data deletion error:', error);
    return NextResponse.json(
      { error: '검진 데이터 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 