import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Global ValidationPipe ─────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // strip unknown properties
      forbidNonWhitelisted: true,   // throw on unknown properties
      transform: true,   // auto-transform primitives
      transformOptions: { enableImplicitConversion: true },

      // ── Format validation errors as { field, message } objects ──────────
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errors = flattenValidationErrors(validationErrors);
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors,
        });
      },
    }),
  );

  // ── Global exception filter ───────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── CORS ─────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    'https://gurukripaconnect.top',
    'https://www.gurukripaconnect.top',
    'http://gurukripaconnect.top',
    'http://www.gurukripaconnect.top',
    // Local development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4200',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'User-Agent',
      'X-Requested-With',
      'Idempotency-Key',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 Microfinance API running on http://localhost:${port}/api/v1\n`);
}

bootstrap();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively flattens class-validator ValidationError[] into
 * { field: string; message: string }[] with dot-notation paths.
 * Example: guarantors[0].phone → "guarantors.0.phone"
 */
function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { field: string; message: string }[] {
  const result: { field: string; message: string }[] = [];

  for (const err of errors) {
    // Build dot-notation path (strip surrounding brackets from array indices)
    const field = parentPath
      ? `${parentPath}.${err.property}`
      : err.property;

    if (err.constraints) {
      // Pick first constraint message (most specific)
      const message = Object.values(err.constraints)[0];
      result.push({ field, message });
    }

    if (err.children && err.children.length > 0) {
      result.push(...flattenValidationErrors(err.children, field));
    }
  }

  return result;
}
