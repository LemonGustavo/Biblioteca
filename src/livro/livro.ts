import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('livros')
export class Livro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  autor: string;

  @Column()
  isbn: string;

  @Column({ default: true })
  disponivel: boolean;
}