"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../dist/app.module");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const platform_ws_1 = require("@nestjs/platform-ws");
const express_session_1 = __importDefault(require("express-session"));
const not_found_filter_1 = require("../dist/not-found.filter");
exports.default = async (req, res) => {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        const viewsDir = (0, path_1.join)(__dirname, '..', 'views');
        const publicDir = (0, path_1.join)(__dirname, '..', 'public');
        console.error('VERCEL_PATHS', { viewsDir, publicDir, __dirname });
        app.setBaseViewsDir(viewsDir);
        app.setViewEngine('ejs');
        app.useStaticAssets(publicDir);
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
    }
    catch (err) {
        console.error('VERCEL_ENTRY_ERROR', err);
        res.status(500).json({ statusCode: 500, message: 'Internal server error', error: err.message });
    }
};
//# sourceMappingURL=vercel-entry.js.map