import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';

// User 엔티티를 위한 리포지토리 클래스
export const UserRepository = AppDataSource.getRepository(User).extend({
  // 이메일로 사용자 찾기
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true, // 비밀번호 검증을 위해 select
        role: true,
        isActive: true
      }
    });
  },

  // 사용자 생성
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return this.save(user);
  },

  // 로그인 시간 업데이트
  async updateLastLogin(userId: number): Promise<void> {
    await this.update(userId, { 
      lastLoginAt: new Date() 
    });
  },

  // 사용자 활성화 상태 변경
  async updateActiveStatus(userId: number, isActive: boolean): Promise<void> {
    await this.update(userId, { isActive });
  }
}); 