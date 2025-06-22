import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AuthThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Usar IP + User-Agent para tracking más preciso
    return req.ips.length ? req.ips[0] : req.ip + req.headers['user-agent'];
  }
} 