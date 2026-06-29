import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { isoUint8Array, isoBase64URL } from '@simplewebauthn/server/helpers';
import { User } from '../users/entities/user.entity';
import { PasskeyCredential } from '../users/entities/passkey-credential.entity';
import { Challenge } from '../users/entities/challenge.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly rpID: string;
  private readonly origin: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasskeyCredential)
    private credentialRepository: Repository<PasskeyCredential>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    private configService: ConfigService,
    private jwtService: JwtService,
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
      excludeCredentials: (user.credentials || []).map((cred) => ({
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

  async verifyRegistration(email: string, body: RegistrationResponseJSON) {
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

      const payload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);

      return { verified: true, access_token };
    }

    throw new BadRequestException('Registration verification failed');
  }

  async getAuthenticationOptions(email?: string) {
    const cleanEmail = email?.trim() || undefined;
    let allowCredentials:
      | { id: string; transports?: AuthenticatorTransport[] }[]
      | undefined;

    if (cleanEmail) {
      const user = await this.userRepository.findOne({
        where: { email: cleanEmail },
        relations: ['credentials'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      allowCredentials = user.credentials.map((cred) => ({
        id: cred.credentialID,
        transports: JSON.parse(
          cred.transports || '[]',
        ) as AuthenticatorTransport[],
      }));
    }

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    if (cleanEmail) {
      const user = await this.userRepository.findOne({
        where: { email: cleanEmail },
      });
      if (user) {
        user.currentChallenge = options.challenge;
        await this.userRepository.save(user);
      }
    } else {
      const challenge = this.challengeRepository.create({
        challenge: options.challenge,
      });
      await this.challengeRepository.save(challenge);
    }

    return options;
  }

  async verifyAuthentication(body: AuthenticationResponseJSON) {
    // Look up the credential directly by its ID to find the associated user.
    // This is secure because we don't trust any client-supplied email, and
    // it's more robust than relying on userHandle which authenticators may
    // omit when allowCredentials is provided.

    console.log({ body });
    const dbCredential = await this.credentialRepository.findOne({
      where: { credentialID: body.id },
      relations: ['user'],
    });

    console.log({ dbCredential });
    if (!dbCredential) {
      throw new BadRequestException('Credential not found');
    }

    const user = dbCredential.user;

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let expectedChallenge: string | null = null;

    // Decode challenge from clientDataJSON to check challenges table first
    try {
      const clientDataBuffer = isoBase64URL.toBuffer(
        body.response.clientDataJSON,
      );
      const clientData = JSON.parse(
        Buffer.from(clientDataBuffer).toString('utf-8'),
      ) as { challenge?: string };
      const challenge = clientData.challenge;

      if (challenge) {
        const dbChallenge = await this.challengeRepository.findOne({
          where: { challenge },
        });

        if (dbChallenge) {
          const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          if (dbChallenge.createdAt.getTime() < fiveMinutesAgo) {
            await this.challengeRepository.remove(dbChallenge);
            throw new BadRequestException('Challenge expired');
          }
          expectedChallenge = dbChallenge.challenge;
          await this.challengeRepository.remove(dbChallenge);
        }
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        'Invalid authentication data or challenge expired',
      );
    }

    // Fallback to user's currentChallenge if not found in challenges table
    if (!expectedChallenge) {
      expectedChallenge = user.currentChallenge ?? null;
      if (expectedChallenge) {
        user.currentChallenge = null;
        await this.userRepository.save(user);
      }
    }

    if (!expectedChallenge) {
      throw new BadRequestException('Challenge not found or invalid');
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      // v13: 'authenticator' renamed to 'credential'; expects WebAuthnCredential
      credential: {
        id: dbCredential.credentialID,
        publicKey: isoBase64URL.toBuffer(dbCredential.publicKey),
        counter: dbCredential.counter,
        transports: JSON.parse(
          dbCredential.transports || '[]',
        ) as AuthenticatorTransport[],
      },
    });

    if (verification.verified) {
      dbCredential.counter = verification.authenticationInfo.newCounter;
      await this.credentialRepository.save(dbCredential);

      const payload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);

      return { verified: true, access_token };
    }

    throw new BadRequestException('Authentication verification failed');
  }

  validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return { valid: true, user: payload };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
