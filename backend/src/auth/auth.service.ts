import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array, isoBase64URL } from '@simplewebauthn/server/helpers';
import { User } from '../users/entities/user.entity';
import { PasskeyCredential } from '../users/entities/passkey-credential.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly rpID: string;
  private readonly origin: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasskeyCredential)
    private credentialRepository: Repository<PasskeyCredential>,
    private configService: ConfigService,
  ) {
    this.rpID = this.configService.get<string>('RP_ID', 'localhost');
    this.origin = this.configService.get<string>(
      'ORIGIN',
      'http://localhost:3000',
    );
  }

  async getRegistrationOptions(email: string) {
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['credentials'],
    });

    if (!user) {
      user = this.userRepository.create({ email });
      await this.userRepository.save(user);
    }

    const options = await generateRegistrationOptions({
      rpName: 'Passkey Auth App',
      rpID: this.rpID,
      // v13: userID must be Uint8Array, not a string
      userID: isoUint8Array.fromUTF8String(user.id),
      userName: user.email,
      userDisplayName: user.email,
      attestationType: 'none',
      // v13: 'type' field removed; id must be a Base64URLString
      excludeCredentials: user.credentials.map((cred) => ({
        id: cred.credentialID,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    user.currentChallenge = options.challenge;
    await this.userRepository.save(user);

    return options;
  }

  async verifyRegistration(email: string, body: any) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.currentChallenge) {
      throw new BadRequestException('Challenge not found');
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      // v13: credentialID and publicKey are now under registrationInfo.credential
      const { id: credentialID, publicKey: credentialPublicKey } =
        verification.registrationInfo.credential;

      const newCredential = this.credentialRepository.create({
        // credentialID is already a Base64URLString in v13
        credentialID,
        // publicKey is a Uint8Array in v13; encode to base64 for storage
        publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
        counter: verification.registrationInfo.credential.counter,
        user,
        transports: JSON.stringify(body.response.transports || []),
      });

      await this.credentialRepository.save(newCredential);
      user.currentChallenge = null;
      await this.userRepository.save(user);

      return { verified: true };
    }

    throw new BadRequestException('Registration verification failed');
  }

  async getAuthenticationOptions(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['credentials'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      // v13: 'type' field removed; id must be a Base64URLString
      allowCredentials: user.credentials.map((cred) => ({
        id: cred.credentialID,
        transports: JSON.parse(cred.transports || '[]'),
      })),
      userVerification: 'preferred',
    });

    user.currentChallenge = options.challenge;
    await this.userRepository.save(user);

    return options;
  }

  async verifyAuthentication(email: string, body: any) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['credentials'],
    });

    if (!user || !user.currentChallenge) {
      throw new BadRequestException('Challenge not found');
    }

    const dbCredential = user.credentials.find(
      (cred) => cred.credentialID === body.id,
    );

    if (!dbCredential) {
      throw new BadRequestException('Credential not found');
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      // v13: 'authenticator' renamed to 'credential'; expects WebAuthnCredential
      credential: {
        id: dbCredential.credentialID,
        publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
        counter: dbCredential.counter,
        transports: JSON.parse(dbCredential.transports || '[]'),
      },
    });

    if (verification.verified) {
      dbCredential.counter = verification.authenticationInfo.newCounter;
      await this.credentialRepository.save(dbCredential);
      user.currentChallenge = null;
      await this.userRepository.save(user);

      return { verified: true };
    }

    throw new BadRequestException('Authentication verification failed');
  }
}
