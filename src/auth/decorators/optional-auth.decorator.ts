import { ExecutionContext, UseGuards, applyDecorators, createParamDecorator } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt.guard';

export const OptionalAuth = () => {
  return applyDecorators(
    UseGuards(OptionalJwtAuthGuard),
  );
};

export const OptionalUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    return !data ? user : user?.[data];
  },
); 