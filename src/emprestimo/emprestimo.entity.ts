import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Livro } from "../livro/livro.entity";

export enum StatusEmprestimo {
    ATIVO = 'ATIVO',
    DEVOLVIDO = 'DEVOLVIDO',
}

@Entity('emprestimos')
export class Emprestimo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Livro)
    @JoinColumn({ name: 'livro_id' })
    livro: Livro;

    @Column()
    leitor: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    data_emprestimo: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    data_devolucao: Date | null;

    @Column({
        type: 'enum',
        enum: StatusEmprestimo,
        default: StatusEmprestimo.ATIVO,
    })
    status: StatusEmprestimo;
}