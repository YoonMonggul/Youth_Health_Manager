import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentType1703123456791 implements MigrationInterface {
    name = 'AddContentType1703123456791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`contents\` 
            ADD \`contentType\` enum('general', 'program') NOT NULL DEFAULT 'general' 
            COMMENT '컨텐츠 타입: 일반 컨텐츠 또는 프로그램용 컨텐츠'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`contents\` 
            DROP COLUMN \`contentType\`
        `);
    }
} 