import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-options')
  async getRegistrationOptions(@Body('email') email: string) {
    return this.authService.getRegistrationOptions(email);
  }

  @Post('register-verify')
  async verifyRegistration(
    @Body('email') email: string,
    @Body() body: RegistrationResponseJSON,
  ) {
    return this.authService.verifyRegistration(email, body);
  }

  @Post('login-options')
  async getAuthenticationOptions(@Body('email') email?: string) {
    return this.authService.getAuthenticationOptions(email);
  }

  @Post('login-verify')
  async verifyAuthentication(@Body() body: AuthenticationResponseJSON) {
    return this.authService.verifyAuthentication(body);
  }

  @Get('validate')
  validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');
    const token = authHeader.split(' ')[1];
    return this.authService.validateToken(token);
  }
}
