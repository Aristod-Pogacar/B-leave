"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const platform_ws_1 = require("@nestjs/platform-ws");
const express_session_1 = __importDefault(require("express-session"));
const not_found_filter_1 = require("./not-found.filter");
exports.default = async (req, res) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setBaseViewsDir((0, path_1.join)(process.cwd(), 'views'));
    app.setViewEngine('ejs');
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'public'));
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.use((0, express_session_1.default)({ secret: 'ajdgreyfgcgajycbjeugyfghktehnfugbqkclqhfgyekfsfvbqjbxkqgefrkbgk', resave: false, saveUninitialized: false }));
    app.useGlobalFilters(new not_found_filter_1.NotFoundFilter());
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    app.use((req, res, next) => {
        if (res.locals.user)
            res.locals.user = req.session.user;
        next();
    });
    app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], credentials: true });
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
};
//# sourceMappingURL=vercel-entry.js.map