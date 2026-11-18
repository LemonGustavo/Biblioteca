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
exports.EmprestimoController = void 0;
const common_1 = require("@nestjs/common");
const emprestimo_service_1 = require("./emprestimo.service");
const criar_emprestimo_dto_1 = require("./dto/criar-emprestimo.dto");
let EmprestimoController = class EmprestimoController {
    emprestimoService;
    constructor(emprestimoService) {
        this.emprestimoService = emprestimoService;
    }
    criar(dto) {
        return this.emprestimoService.criar(dto);
    }
    devolver(id) {
        return this.emprestimoService.devolver(id);
    }
    listar() {
        return this.emprestimoService.listar();
    }
};
exports.EmprestimoController = EmprestimoController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_emprestimo_dto_1.CriarEmprestimoDto]),
    __metadata("design:returntype", void 0)
], EmprestimoController.prototype, "criar", null);
__decorate([
    (0, common_1.Put)(':id/devolucao'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmprestimoController.prototype, "devolver", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmprestimoController.prototype, "listar", null);
exports.EmprestimoController = EmprestimoController = __decorate([
    (0, common_1.Controller)('emprestimos'),
    __metadata("design:paramtypes", [emprestimo_service_1.EmprestimoService])
], EmprestimoController);
//# sourceMappingURL=emprestimo.controller.js.map