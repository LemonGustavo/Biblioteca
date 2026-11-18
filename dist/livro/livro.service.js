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
exports.LivroService = void 0;
const common_1 = require("@nestjs/common");
const livro_entity_1 = require("./livro.entity");
const livro_repository_1 = require("./repository/livro.repository");
let LivroService = class LivroService {
    livroRepository;
    constructor(livroRepository) {
        this.livroRepository = livroRepository;
    }
    criar(dto) {
        const livro = new livro_entity_1.Livro();
        livro.titulo = dto.titulo;
        livro.autor = dto.autor;
        livro.isbn = dto.isbn;
        return this.livroRepository.criar(livro);
    }
    listar() {
        return this.livroRepository.listar();
    }
};
exports.LivroService = LivroService;
exports.LivroService = LivroService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(livro_repository_1.LIVRO_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], LivroService);
//# sourceMappingURL=livro.service.js.map