import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import { NotFoundFilter } from './not-found.filter';

export default async (req, res) => {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const viewsDir = join(__dirname, '..', 'views');
    const publicDir = join(__dirname, '..', 'public');
    console.error('VERCEL_PATHS', { viewsDir, publicDir, __dirname });
    app.setBaseViewsDir(viewsDir);
    app.setViewEngine('ejs');
    app.useStaticAssets(publicDir);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.use(session({ secret: 'ajdgreyfgcgajycbjeugyfghktehnfugbqkclqhfgyekfsfvbqjbxkqgefrkbgk', resave: false, saveUninitialized: false }));
    app.useGlobalFilters(new NotFoundFilter());
    app.useWebSocketAdapter(new WsAdapter(app));
    app.use((req: any, res: any, next: any) => {
      if (res.locals.user) res.locals.user = req.session.user;
      next();
    });
    app.enableCors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], credentials: true });
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
  } catch (err) {
    console.error('VERCEL_ENTRY_ERROR', err);
    res.status(500).json({ statusCode: 500, message: 'Internal server error', error: err.message });
  }
};
