import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/database/data-source';
import { Content } from '@/models/Content';
import { initDb } from '@/lib/db';

// GET: 컨텐츠 목록 조회
export async function GET(request: NextRequest) {
  try {
    await initDb();
    const repository = AppDataSource.getRepository(Content);
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm');
    const category = searchParams.get('category');
    const weekNumber = searchParams.get('weekNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 쿼리 빌더 생성
    let query = repository.createQueryBuilder('content')
      .leftJoinAndSelect('content.program', 'program');
    
    // 검색 조건 추가
    if (searchTerm) {
      query = query.where('content.title LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`
      });
    }
    
    // 카테고리 필터 추가
    if (category) {
      query = query.andWhere('content.category = :category', { category });
    }
    
    // 주차 필터 추가
    if (weekNumber) {
      query = query.andWhere('content.weekNumber = :weekNumber', { weekNumber: parseInt(weekNumber) });
    }
    
    // 정렬 및 페이지네이션
    const offset = (page - 1) * limit;
    const [items, total] = await query
      .orderBy('content.weekNumber', 'ASC')
      .addOrderBy('content.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('컨텐츠 조회 오류:', error);
    return NextResponse.json(
      { error: '컨텐츠 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 컨텐츠 생성
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const repository = AppDataSource.getRepository(Content);
    
    const body = await request.json();
    const { title, weekNumber, category, programId, contentItems, note } = body;
    
    // 필수 필드 검증
    if (!title || !weekNumber || !contentItems || contentItems.length !== 3) {
      return NextResponse.json(
        { error: '제목, 주차, 그리고 3개의 컨텐츠 아이템이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // contentItems 검증
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      if (!item.title || !item.description || !item.imageUrl) {
        return NextResponse.json(
          { error: `컨텐츠 아이템 ${i + 1}의 제목, 설명, 이미지가 필요합니다.` },
          { status: 400 }
        );
      }
      // 아이템 ID 설정
      item.id = i + 1;
    }
    
    const newContent = repository.create({
      title,
      weekNumber,
      category,
      programId: programId || null,
      contentItems,
      note,
      status: 'active'
    });
    
    const savedContent = await repository.save(newContent);
    
    return NextResponse.json(savedContent, { status: 201 });
  } catch (error) {
    console.error('컨텐츠 생성 오류:', error);
    return NextResponse.json(
      { error: '컨텐츠 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 컨텐츠 수정
export async function PUT(request: NextRequest) {
  try {
    await initDb();
    const repository = AppDataSource.getRepository(Content);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '컨텐츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { title, weekNumber, category, programId, contentItems, note } = body;
    
    // 기존 컨텐츠 조회
    const existingContent = await repository.findOne({ where: { id: parseInt(id) } });
    if (!existingContent) {
      return NextResponse.json(
        { error: '컨텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 필수 필드 검증
    if (!title || !weekNumber || !contentItems || contentItems.length !== 3) {
      return NextResponse.json(
        { error: '제목, 주차, 그리고 3개의 컨텐츠 아이템이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // contentItems 검증
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      if (!item.title || !item.description || !item.imageUrl) {
        return NextResponse.json(
          { error: `컨텐츠 아이템 ${i + 1}의 제목, 설명, 이미지가 필요합니다.` },
          { status: 400 }
        );
      }
      // 아이템 ID 설정
      item.id = i + 1;
    }
    
    // 컨텐츠 업데이트
    existingContent.title = title;
    existingContent.weekNumber = weekNumber;
    existingContent.category = category;
    existingContent.programId = programId || null;
    existingContent.contentItems = contentItems;
    existingContent.note = note;
    
    const updatedContent = await repository.save(existingContent);
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('컨텐츠 수정 오류:', error);
    return NextResponse.json(
      { error: '컨텐츠 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 컨텐츠 삭제
export async function DELETE(request: NextRequest) {
  try {
    await initDb();
    const repository = AppDataSource.getRepository(Content);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '컨텐츠 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 기존 컨텐츠 조회
    const existingContent = await repository.findOne({ where: { id: parseInt(id) } });
    if (!existingContent) {
      return NextResponse.json(
        { error: '컨텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 컨텐츠 삭제
    await repository.remove(existingContent);
    
    return NextResponse.json({ message: '컨텐츠가 삭제되었습니다.' });
  } catch (error) {
    console.error('컨텐츠 삭제 오류:', error);
    return NextResponse.json(
      { error: '컨텐츠 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 