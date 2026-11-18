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
exports.EmprestimoService = void 0;
const common_1 = require("@nestjs/common");
const emprestimo_entity_1 = require("./emprestimo.entity");
const emprestimo_repository_1 = require("./repository/emprestimo.repository");
let EmprestimoService = class EmprestimoService {
    emprestimoRepository;
    constructor(emprestimoRepository) {
        this.emprestimoRepository = emprestimoRepository;
    }
    async criar(dto) {
        const livro = await this.emprestimoRepository.buscarLivroPorId(dto.livro_id);
        if (!livro) {
            throw new common_1.NotFoundException('Livro não encontrado');
        }
        if (!livro.disponivel) {
            throw new common_1.ConflictException('Livro indisponível para empréstimo');
        }
        livro.disponivel = false;
        await this.emprestimoRepository.atualizarLivro(livro);
        const emprestimo = new emprestimo_entity_1.Emprestimo();
        emprestimo.livro = livro;
        emprestimo.leitor = dto.leitor;
        emprestimo.status = emprestimo_entity_1.StatusEmprestimo.ATIVO;
        emprestimo.data_devolucao = null;
        return this.emprestimoRepository.criar(emprestimo);
    }
    async devolver(id) {
        const emprestimo = await this.emprestimoRepository.buscarPorId(id);
        if (!emprestimo) {
            throw new common_1.NotFoundException('Empréstimo não encontrado');
        }
        if (emprestimo.status === emprestimo_entity_1.StatusEmprestimo.DEVOLVIDO) {
            throw new common_1.ConflictException('Empréstimo já devolvido');
        }
        emprestimo.status = emprestimo_entity_1.StatusEmprestimo.DEVOLVIDO;
        emprestimo.data_devolucao = new Date();
        emprestimo.livro.disponivel = true;
        await this.emprestimoRepository.atualizarLivro(emprestimo.livro);
        return this.emprestimoRepository.atualizar(emprestimo);
    }
    listar() {
        return this.emprestimoRepository.listar();
    }
};
exports.EmprestimoService = EmprestimoService;
exports.EmprestimoService = EmprestimoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(emprestimo_repository_1.EMPRESTIMO_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], EmprestimoService);
//# sourceMappingURL=emprestimo.service.js.map