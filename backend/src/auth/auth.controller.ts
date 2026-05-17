import { Controller, Post, Body } from '@nestjs/common';
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
}
