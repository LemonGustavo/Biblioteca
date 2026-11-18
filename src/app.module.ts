import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LivroModule } from "./livro/livro.module";
import { EmprestimoModule } from "./emprestimo/emprestimo.module";

@Module ({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'Me0wscarada!',
      database: process.env.DATABASE_NAME || 'biblioteca',
      autoLoadEntities: true,
      synchronize: true,
    }),
    LivroModule,
    EmprestimoModule,
  ],
})

export class AppModule{}
