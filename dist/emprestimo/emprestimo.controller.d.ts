import { EmprestimoService } from "./emprestimo.service";
import { CriarEmprestimoDto } from "./dto/criar-emprestimo.dto";
export declare class EmprestimoController {
    private readonly emprestimoService;
    constructor(emprestimoService: EmprestimoService);
    criar(dto: CriarEmprestimoDto): Promise<import("./emprestimo.entity").Emprestimo>;
    devolver(id: number): Promise<import("./emprestimo.entity").Emprestimo>;
    listar(): Promise<import("./emprestimo.entity").Emprestimo[]>;
}
