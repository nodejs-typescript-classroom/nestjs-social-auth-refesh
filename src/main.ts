import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
let app: INestApplication;
async function bootstrap() {
  app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  // parse cookie 
  app.use(cookieParser());
  // enable lifecycle hook
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
function gracefulShutdown() {
  console.log('app gracefully shutting down');
  app.close().then(() => {
    console.log('app gracefully shutdown');
    process.exit(0);
  }).catch(err => {
    console.error('failed to close', err);
    return err
  })
  // Force close after 5 seconds
  setTimeout(() =>{
    console.error('Couldn`t close in time, force to close');
    process.exit(1);
  }, 5000);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);