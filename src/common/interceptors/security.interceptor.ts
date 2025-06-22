import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);
  private requestCounts = new Map<string, { count: number; timestamp: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'] || '';
    const path = request.path;
    const method = request.method;

    // Detectar requests sospechosos
    this.detectSuspiciousActivity(ip, userAgent, path, method);

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        
        // Log requests lentos (más de 5 segundos)
        if (duration > 5000) {
          this.logger.warn(
            `Slow request detected: ${method} ${path} from ${ip} took ${duration}ms`,
          );
        }

        // Log requests exitosos para auditoría
        this.logger.log(
          `${method} ${path} from ${ip} - ${duration}ms`,
        );
      }),
    );
  }

  private detectSuspiciousActivity(ip: string, userAgent: string, path: string, method: string) {
    const key = `${ip}-${path}`;
    const now = Date.now();
    const window = 60000; // 1 minuto

    // Limpiar registros antiguos
    if (this.requestCounts.has(key)) {
      const record = this.requestCounts.get(key);
      if (record && now - record.timestamp > window) {
        this.requestCounts.delete(key);
      }
    }

    // Contar requests
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 1, timestamp: now });
    } else {
      const record = this.requestCounts.get(key);
      if (record) {
        record.count++;
      }
    }

    const record = this.requestCounts.get(key);
    const currentCount = record?.count || 0;

    // Detectar patrones sospechosos
    if (currentCount > 50) {
      this.logger.error(
        `Potential DDoS attack detected: ${currentCount} requests to ${path} from ${ip} in 1 minute`,
      );
    }

    if (currentCount > 20 && path.includes('/auth/login')) {
      this.logger.error(
        `Potential brute force attack detected: ${currentCount} login attempts from ${ip}`,
      );
    }

    // Detectar User-Agents sospechosos
    if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent === '') {
      this.logger.warn(
        `Suspicious User-Agent detected: ${userAgent} from ${ip} accessing ${path}`,
      );
    }
  }
} 