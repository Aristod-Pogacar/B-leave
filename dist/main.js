"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const not_found_filter_1 = require("./not-found.filter");
const express_session_1 = __importDefault(require("express-session"));
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const platform_ws_1 = require("@nestjs/platform-ws");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setBaseViewsDir((0, path_1.join)(process.cwd(), 'views'));
    app.setViewEngine('ejs');
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'public'));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
    }));
    app.use((0, express_session_1.default)({
        secret: 'ajdgreyfgcgajycbjeugyfghktehnfugbqkclqhfgyekfsfvbqjbxkqgefrkbgk',
        resave: false,
        saveUninitialized: false,
    }));
    app.useGlobalFilters(new not_found_filter_1.NotFoundFilter());
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    app.use((req, res, next) => {
        if (res.locals.user) {
            res.locals.user = req.session.user;
        }
        next();
    });
    app.enableCors({
        origin: '*',
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        credentials: true,
    });
    const port = process.env.PORT ?? 4000;
    if (!process.env.VERCEL) {
        await app.listen(port, '0.0.0.0');
        console.log(`Server running at ${await app.getUrl()}`);
    }
    else {
        await app.init();
    }
}
bootstrap();
//# sourceMappingURL=main.js.map