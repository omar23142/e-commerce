


import { NestFactory, repl } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await repl(AppModule);
  
}
bootstrap();