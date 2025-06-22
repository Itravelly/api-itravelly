import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware de seguridad con helmet
  app.use(helmet());
  
  // Configurar CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Prefijo global
  app.setGlobalPrefix('api');

  // Interceptor de seguridad global
  app.useGlobalInterceptors(new SecurityInterceptor());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API ITravelly')
    .setDescription('Documentación de la API de ITravelly')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
