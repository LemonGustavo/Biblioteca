import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LivroModule } from "./livro/livro.module";
import { Livro } from "./livro/livro";

@Module ({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sua_senha',
      database: 'biblioteca',
      entities: [Livro],
      autoLoadEntities: true,
      synchronize: true,
    }),
    LivroModule
  ],
})

export class AppModule{}
