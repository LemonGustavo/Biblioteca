import { Livro } from "../livro/livro.entity";
export declare enum StatusEmprestimo {
    ATIVO = "ATIVO",
    DEVOLVIDO = "DEVOLVIDO"
}
export declare class Emprestimo {
    id: number;
    livro: Livro;
    leitor: string;
    data_emprestimo: Date;
    data_devolucao: Date | null;
    status: StatusEmprestimo;
}
