import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { Growth } from '@/models/Growth';
import { Student } from '@/models/Student';

// GET: 성장 데이터 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const searchTerm = searchParams.get('searchTerm');
    const grade = searchParams.get('grade');

    const growthRepository = AppDataSource.getRepository(Growth);
    const queryBuilder = growthRepository
      .createQueryBuilder('growth')
      .leftJoinAndSelect('growth.student', 'student')
      .orderBy('growth.measurementDate', 'DESC');

    // 검색어가 있는 경우
    if (searchTerm) {
      queryBuilder.andWhere('student.name LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    // 학년 필터링
    if (grade) {
      queryBuilder.andWhere('student.grade = :grade', { grade });
    }

    const skip = (page - 1) * limit;
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
    console.error('Growth data fetch error:', error);
    return NextResponse.json(
      { error: '성장 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 성장 데이터 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const growthRepository = AppDataSource.getRepository(Growth);
    const studentRepository = AppDataSource.getRepository(Student);

    // 학생 정보 확인
    const student = await studentRepository.findOne({
      where: { id: body.studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: '학생 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 성장 데이터 생성
    const growth = growthRepository.create({
      ...body,
      student
    });

    const savedGrowth = await growthRepository.save(growth);
    return NextResponse.json(savedGrowth);
  } catch (error) {
    console.error('Growth data creation error:', error);
    return NextResponse.json(
      { error: '성장 데이터 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 성장 데이터 수정
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    const growthRepository = AppDataSource.getRepository(Growth);
    const growth = await growthRepository.findOne({
      where: { id: Number(id) }
    });

    if (!growth) {
      return NextResponse.json(
        { error: '성장 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedGrowth = await growthRepository.save({
      ...growth,
      ...body
    });

    return NextResponse.json(updatedGrowth);
  } catch (error) {
    console.error('Growth data update error:', error);
    return NextResponse.json(
      { error: '성장 데이터 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 성장 데이터 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const growthRepository = AppDataSource.getRepository(Growth);
    const growth = await growthRepository.findOne({
      where: { id: Number(id) }
    });

    if (!growth) {
      return NextResponse.json(
        { error: '성장 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    await growthRepository.remove(growth);
    return NextResponse.json({ message: '성장 데이터가 삭제되었습니다.' });
  } catch (error) {
    console.error('Growth data deletion error:', error);
    return NextResponse.json(
      { error: '성장 데이터 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 