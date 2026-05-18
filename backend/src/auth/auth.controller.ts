import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-options')
  async getRegistrationOptions(@Body('email') email: string) {
    return this.authService.getRegistrationOptions(email);
  }

  @Post('register-verify')
  async verifyRegistration(@Body('email') email: string, @Body() body: any) {
    return this.authService.verifyRegistration(email, body);
  }

  @Post('login-options')
  async getAuthenticationOptions(@Body('email') email: string) {
    return this.authService.getAuthenticationOptions(email);
  }

  @Post('login-verify')
  async verifyAuthentication(@Body('email') email: string, @Body() body: any) {
    return this.authService.verifyAuthentication(email, body);
  }

  @Get('validate')
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('No token provided');
    const token = authHeader.split(' ')[1];
    return this.authService.validateToken(token);
  }
}
