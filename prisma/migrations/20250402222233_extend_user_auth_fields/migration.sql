-- AlterTable
ALTER TABLE "users" ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "refresh_token_expires" TIMESTAMP(3),
ADD COLUMN     "reset_pass_expires" TIMESTAMP(3),
ADD COLUMN     "verify_token_expires" TIMESTAMP(3);
