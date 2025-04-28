import { AppDataSource } from '@/database/data-source';

let initialized = false;

export async function initDb() {
  if (!initialized) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('데이터베이스 연결 성공');
      }
      initialized = true;
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      throw error;
    }
  }
  return AppDataSource;
} 