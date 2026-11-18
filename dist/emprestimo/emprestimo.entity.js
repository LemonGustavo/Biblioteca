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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emprestimo = exports.StatusEmprestimo = void 0;
const typeorm_1 = require("typeorm");
const livro_entity_1 = require("../livro/livro.entity");
var StatusEmprestimo;
(function (StatusEmprestimo) {
    StatusEmprestimo["ATIVO"] = "ATIVO";
    StatusEmprestimo["DEVOLVIDO"] = "DEVOLVIDO";
})(StatusEmprestimo || (exports.StatusEmprestimo = StatusEmprestimo = {}));
let Emprestimo = class Emprestimo {
    id;
    livro;
    leitor;
    data_emprestimo;
    data_devolucao;
    status;
};
exports.Emprestimo = Emprestimo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Emprestimo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => livro_entity_1.Livro),
    (0, typeorm_1.JoinColumn)({ name: 'livro_id' }),
    __metadata("design:type", livro_entity_1.Livro)
], Emprestimo.prototype, "livro", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Emprestimo.prototype, "leitor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Emprestimo.prototype, "data_emprestimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Object)
], Emprestimo.prototype, "data_devolucao", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: StatusEmprestimo,
        default: StatusEmprestimo.ATIVO,
    }),
    __metadata("design:type", String)
], Emprestimo.prototype, "status", void 0);
exports.Emprestimo = Emprestimo = __decorate([
    (0, typeorm_1.Entity)('emprestimos')
], Emprestimo);
//# sourceMappingURL=emprestimo.entity.js.map