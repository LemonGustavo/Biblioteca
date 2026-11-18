import { IsInt, IsNotEmpty, isNotEmpty, IsString, isString } from "class-validator";

export class CriarEmprestimoDto {
    @IsInt()
    livro_id: number;

    @IsString()
    @IsNotEmpty()
    leitor: string;
}