"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LivroModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const livro_entity_1 = require("./livro.entity");
const livro_service_1 = require("./livro.service");
const livro_controller_1 = require("./livro.controller");
const livro_repository_1 = require("./repository/livro.repository");
const livro_repository_typeorm_1 = require("./repository/livro.repository.typeorm");
let LivroModule = class LivroModule {
};
exports.LivroModule = LivroModule;
exports.LivroModule = LivroModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([livro_entity_1.Livro])],
        controllers: [livro_controller_1.LivroController],
        providers: [
            livro_service_1.LivroService,
            { provide: livro_repository_1.LIVRO_REPOSITORY, useClass: livro_repository_typeorm_1.LivroRepositoryTypeOrm },
        ],
    })
], LivroModule);
//# sourceMappingURL=livro.module.js.map