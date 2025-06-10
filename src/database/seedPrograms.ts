import { AppDataSource } from './data-source';
import { Program, ProgramTrendType } from '../models/program';

export async function seedPrograms() {
  const repo = AppDataSource.getRepository(Program);

  const defaultPrograms = [
    { name: '저체중', description: '저체중 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.BMI },
    { name: '정상체중', description: '정상체중 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.BMI },
    { name: '과체중', description: '과체중 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.BMI },
    { name: '비만', description: '비만 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.BMI },
    { name: '복부비만양호', description: '복부비만 양호 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.WAIST },
    { name: '복부비만주의', description: '복부비만 주의 프로그램', startDate: undefined, endDate: undefined, trendType: ProgramTrendType.WAIST },
  ];

  for (const program of defaultPrograms) {
    const exists = await repo.findOneBy({ name: program.name });
    if (!exists) {
      await repo.save(repo.create(program));
    }
  }
  console.log('기본 프로그램 6종이 DB에 등록되었습니다.');
} 