"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprestimoRepositoryTypeOrm = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const emprestimo_entity_1 = require("../emprestimo.entity");
const livro_entity_1 = require("../../livro/livro.entity");
let EmprestimoRepositoryTypeOrm = class EmprestimoRepositoryTypeOrm {
    emprestimoRepo;
    livroRepo;
    constructor(emprestimoRepo, livroRepo) {
        this.emprestimoRepo = emprestimoRepo;
        this.livroRepo = livroRepo;
    }
    buscarLivroPorId(id) {
        return this.livroRepo.findOneBy({ id });
    }
    criar(emprestimo) {
        return this.emprestimoRepo.save(emprestimo);
    }
    buscarPorId(id) {
        return this.emprestimoRepo.findOne({
            where: { id },
            relations: { livro: true }
        });
    }
    atualizar(emprestimo) {
        return this.emprestimoRepo.save(emprestimo);
    }
    listar() {
        return this.emprestimoRepo.find({ relations: { livro: true } });
    }
    atualizarLivro(livro) {
        return this.livroRepo.save(livro);
    }
};
exports.EmprestimoRepositoryTypeOrm = EmprestimoRepositoryTypeOrm;
exports.EmprestimoRepositoryTypeOrm = EmprestimoRepositoryTypeOrm = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(emprestimo_entity_1.Emprestimo)),
    __param(1, (0, typeorm_1.InjectRepository)(livro_entity_1.Livro)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EmprestimoRepositoryTypeOrm);
//# sourceMappingURL=emprestimo.repository.typeorm.js.map