
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString({ message: 'Nama kategori harus berupa teks' })
  @IsNotEmpty({ message: 'Nama kategori harus diisi' })
  @MaxLength(100, { message: 'Nama kategori maksimal 100 karakter' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;
}
