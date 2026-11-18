import { Emprestimo } from "./emprestimo.entity";
import { CriarEmprestimoDto } from "./dto/criar-emprestimo.dto";
import type { EmprestimoRepository } from "./repository/emprestimo.repository";
export declare class EmprestimoService {
    private readonly emprestimoRepository;
    constructor(emprestimoRepository: EmprestimoRepository);
    criar(dto: CriarEmprestimoDto): Promise<Emprestimo>;
    devolver(id: number): Promise<Emprestimo>;
    listar(): Promise<Emprestimo[]>;
}
