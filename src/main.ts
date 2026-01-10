import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( new ValidationPipe( {whitelist:true, forbidNonWhitelisted:true}))
  // midllware 
  app.use( helmet())
  // cors config
  app.enableCors({
    origin:'http://localhost:3001'});

    // swagger config
    const swagger = new DocumentBuilder().setVersion('1.0')
    .setTitle('first_nestjs_proj API')
    .setDescription('API description')
    //.addServer('localhost:3000/api/v1')
    .setLicense('MIT license', 'https://licenseSource.com')
    .setTermsOfService('https://localhost:3000/api/v1/terms-license')
    .addSecurity( 'bearer', { type:'http', scheme:'bearer' })
    .addBearerAuth()
    .build();
    const documentioin =  SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup('swagger', app, documentioin )

    // server
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

