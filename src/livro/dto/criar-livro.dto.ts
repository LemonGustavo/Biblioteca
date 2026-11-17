import { IsString, IsNotEmpty } from 'class-validator';

export class CriarLivroDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  autor: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;
}