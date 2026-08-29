import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export interface FileStorageProvider {
  upload(file: Buffer, originalName: string, mimeType: string): Promise<{ fileUrl: string; fileName: string }>;
  getFilePath(fileUrl: string): string;
  delete(fileUrl: string): Promise<void>;
}

export class LocalFileStorage implements FileStorageProvider {
  private uploadDir: string;
  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || path.join(process.cwd(), 'uploads');
  }
  async upload(file: Buffer, originalName: string, mimeType: string) {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const ext = path.extname(originalName);
    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, file);
    return { fileUrl: `/uploads/${fileName}`, fileName: originalName };
  }
  getFilePath(fileUrl: string): string {
    const fileName = fileUrl.replace('/uploads/', '');
    return path.join(this.uploadDir, fileName);
  }
  async delete(fileUrl: string): Promise<void> {
    const filePath = this.getFilePath(fileUrl);
    await fs.unlink(filePath).catch(() => {});
  }
}

export const fileStorage: FileStorageProvider = new LocalFileStorage();
