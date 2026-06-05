import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { VaultCard } from './entities/vault-card.entity';
import { VaultCredential } from './entities/vault-credential.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VaultCard, VaultCredential, User])],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
