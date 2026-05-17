import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('passkey_credentials')
export class PasskeyCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  credentialID: string;

  @Column()
  publicKey: string;

  @Column({ type: 'int', default: 0 })
  counter: number;

  @Column({ nullable: true })
  transports: string; // JSON stringified array of AuthenticatorTransport

  @ManyToOne(() => User, (user) => user.credentials)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
