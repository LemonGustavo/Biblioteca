"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmprestimoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const emprestimo_entity_1 = require("./emprestimo.entity");
const livro_entity_1 = require("../livro/livro.entity");
const emprestimo_service_1 = require("./emprestimo.service");
const emprestimo_controller_1 = require("./emprestimo.controller");
const emprestimo_repository_1 = require("./repository/emprestimo.repository");
const emprestimo_repository_typeorm_1 = require("./repository/emprestimo.repository.typeorm");
let EmprestimoModule = class EmprestimoModule {
};
exports.EmprestimoModule = EmprestimoModule;
exports.EmprestimoModule = EmprestimoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([emprestimo_entity_1.Emprestimo, livro_entity_1.Livro])],
        controllers: [emprestimo_controller_1.EmprestimoController],
        providers: [
            emprestimo_service_1.EmprestimoService,
            { provide: emprestimo_repository_1.EMPRESTIMO_REPOSITORY, useClass: emprestimo_repository_typeorm_1.EmprestimoRepositoryTypeOrm },
        ],
    })
], EmprestimoModule);
//# sourceMappingURL=emprestimo.module.js.map