import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { PasskeyCredential } from '../users/entities/passkey-credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, PasskeyCredential])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
