import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import session from 'express-session';
import { NotFoundFilter } from './not-found.filter';

export default async (req, res) => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');
  app.useStaticAssets(join(process.cwd(), 'public'));
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
};
