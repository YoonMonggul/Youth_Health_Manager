import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Student } from "../models/Student";
import { StudentTeacherRelation } from "../models/StudentTeacherRelation";
import path from "path";

// TypeORM 데이터 소스 설정
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "youth_health_manager",
  synchronize: process.env.NODE_ENV !== "production", // 개발 환경에서만 true로 설정
  logging: process.env.NODE_ENV !== "production",
  entities: [User, Student, StudentTeacherRelation], // 엔티티 추가
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [path.join(__dirname, "../subscribers/**/*.{ts,js}")],
});

// 데이터베이스 초기화 함수
export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("데이터베이스 연결 성공");
    }
    return true;
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error);
    return false;
  }
}; 