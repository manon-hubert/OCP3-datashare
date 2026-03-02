import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ErrorCode, ErrorMessage } from '../constants/error-codes';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_UNAUTHORIZED,
        message: ErrorMessage[ErrorCode.AUTH_UNAUTHORIZED],
      });
    }

    try {
      const payload = this.jwtService.verify<{ sub: number; email: string }>(token);
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_TOKEN_EXPIRED,
        message: ErrorMessage[ErrorCode.AUTH_TOKEN_EXPIRED],
      });
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
