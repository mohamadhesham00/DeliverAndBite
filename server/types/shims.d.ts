export {};

declare global {
  const process: {
    env: Record<string, string | undefined>;
    exit: (code?: number) => never;
  };
}

declare module "@nestjs/common" {
  export const Injectable: any;
  export const Module: any;
  export const Global: any;
  export const Controller: any;
  export const Get: any;
  export const Post: any;
  export const Body: any;
  export const Param: any;
  export const Req: any;
  export const UseGuards: any;
  export const ValidationPipe: any;
  export const UnauthorizedException: any;
  export const NotFoundException: any;
  export const BadRequestException: any;
  export type CanActivate = any;
  export type ExecutionContext = any;
}

declare module "@nestjs/core" {
  export const NestFactory: { create: (...args: any[]) => Promise<any> };
}

declare module "@nestjs/config" {
  export const ConfigModule: { forRoot: (...args: any[]) => any };
}

declare module "@nestjs/platform-express" {}

declare module "class-transformer" {
  export const Type: any;
}

declare module "class-validator" {
  export const ArrayMinSize: any;
  export const IsArray: any;
  export const IsInt: any;
  export const IsOptional: any;
  export const IsString: any;
  export const Min: any;
  export const ValidateNested: any;
}

declare module "jose" {
  export const createRemoteJWKSet: any;
  export const jwtVerify: any;
}

declare module "@prisma/client" {
  export class PrismaClient {
    restaurant: any;
    menuItem: any;
    order: any;
    orderItem: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(...args: any[]): void;
  }

  export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
  }

  export enum PaymentStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
  }
}
