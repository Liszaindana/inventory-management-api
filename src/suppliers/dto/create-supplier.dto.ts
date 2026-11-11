import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Nama pemasok harus diisi' })
  @IsString({ message: 'Nama pemasok harus berupa teks' })
  @MaxLength(150, { message: 'Nama pemasok maksimal 150 karakter' })
  readonly name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email pemasok harus valid' })
  @MaxLength(150, { message: 'Email pemasok maksimal 150 karakter' })
  readonly email?: string;

  @IsOptional()
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @MaxLength(20, { message: 'Nomor telepon maksimal 20 karakter' })
  readonly phone?: string;

  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  readonly address?: string;
}
