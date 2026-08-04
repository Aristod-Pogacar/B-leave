import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NotFoundFilter } from './not-found.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(
    session({
      secret: 'ajdgreyfgcgajycbjeugyfghktehnfugbqkclqhfgyekfsfvbqjbxkqgefrkbgk',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // app.use((req, res, next) => {
  //   res.status(404).render('404');
  //   next();
  // });
  app.useGlobalFilters(new NotFoundFilter());
  app.useWebSocketAdapter(new WsAdapter(app));
  app.use((req: any, res: any, next: any) => {
    if (res.locals.user) {
      res.locals.user = req.session.user;
    }
    next();
  });
  app.enableCors({
    // origin: [
    //   "http://localhost:8081",
    //   "http://localhost:19006",
    //   "tauri://localhost",
    //   "http://tauri.localhost"
    // ],
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
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();

