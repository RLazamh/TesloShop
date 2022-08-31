import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes( 
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
  await app.listen(process.env.APP_PORT);
  console.log(`Teslo Shop is running in port: ${process.env.APP_PORT}`)
}
bootstrap();
