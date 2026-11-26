import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LivroModule } from "./livro/livro.module";
import { EmprestimoModule } from "./emprestimo/emprestimo.module";

@Module ({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'biblioteca',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    LivroModule,
    EmprestimoModule,
  ],
})

export class AppModule{}
