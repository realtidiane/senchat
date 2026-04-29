import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
];

const MAX_SIZE = 25 * 1024 * 1024;

@Injectable()
export class FilesService {
  validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(`File too large (max ${MAX_SIZE / 1024 / 1024}MB)`);
    }
  }

  generateFilename(originalname: string): string {
    return uuidv4() + extname(originalname);
  }
}
