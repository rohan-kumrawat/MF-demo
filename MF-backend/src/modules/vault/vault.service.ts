import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultCard } from './entities/vault-card.entity';
import { VaultCredential } from './entities/vault-credential.entity';
import { CreateVaultCardDto, UpdateVaultCardDto } from './dto/vault-card.dto';
import { CreateVaultCredentialDto, UpdateVaultCredentialDto } from './dto/vault-credential.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VaultService {
  constructor(
    @InjectRepository(VaultCard)
    private readonly cardsRepo: Repository<VaultCard>,
    @InjectRepository(VaultCredential)
    private readonly credentialsRepo: Repository<VaultCredential>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  // --- PIN Management ---

  async checkPinStatus(adminId: string): Promise<{ hasPin: boolean }> {
    const user = await this.usersRepo.findOne({ where: { id: adminId } });
    if (!user) throw new NotFoundException('User not found');
    return { hasPin: !!user.vaultPin };
  }

  async setupPin(adminId: string, pin: string): Promise<{ success: boolean }> {
    const user = await this.usersRepo.findOne({ where: { id: adminId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.vaultPin) {
      throw new BadRequestException('Vault PIN is already set. Use reset option to change it.');
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await this.usersRepo.update(adminId, { vaultPin: hashedPin });
    return { success: true };
  }

  async verifyPin(adminId: string, pin: string): Promise<{ success: boolean }> {
    const user = await this.usersRepo.findOne({ where: { id: adminId } });
    if (!user || !user.vaultPin) {
      throw new BadRequestException('Vault PIN not set up');
    }

    const isMatch = await bcrypt.compare(pin, user.vaultPin);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Vault PIN');
    }

    return { success: true };
  }

  async resetPin(adminId: string, accountPassword: string, newPin: string): Promise<{ success: boolean }> {
    const user = await this.usersRepo.findOne({ where: { id: adminId } });
    if (!user) throw new NotFoundException('User not found');

    const isPasswordMatch = await bcrypt.compare(accountPassword, user.passwordHash);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Incorrect account password');
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    await this.usersRepo.update(adminId, { vaultPin: hashedPin });
    return { success: true };
  }

  // --- Vault Cards ---

  async getCards(centreId: string, adminId: string): Promise<VaultCard[]> {
    return this.cardsRepo.find({
      where: { centreId, adminId },
      order: { createdAt: 'DESC' },
    });
  }

  async createCard(centreId: string, adminId: string, dto: CreateVaultCardDto): Promise<VaultCard> {
    const card = this.cardsRepo.create({
      ...dto,
      centreId,
      adminId,
    });
    return this.cardsRepo.save(card);
  }

  async updateCard(id: string, centreId: string, adminId: string, dto: UpdateVaultCardDto): Promise<VaultCard> {
    const card = await this.cardsRepo.findOne({ where: { id, centreId, adminId } });
    if (!card) throw new NotFoundException('Card not found');

    Object.assign(card, dto);
    return this.cardsRepo.save(card);
  }

  async deleteCard(id: string, centreId: string, adminId: string): Promise<{ success: boolean }> {
    const result = await this.cardsRepo.delete({ id, centreId, adminId });
    if (result.affected === 0) throw new NotFoundException('Card not found');
    return { success: true };
  }

  // --- Vault Credentials ---

  async getCredentials(centreId: string, adminId: string): Promise<VaultCredential[]> {
    return this.credentialsRepo.find({
      where: { centreId, adminId },
      order: { createdAt: 'DESC' },
    });
  }

  async createCredential(centreId: string, adminId: string, dto: CreateVaultCredentialDto): Promise<VaultCredential> {
    const credential = this.credentialsRepo.create({
      ...dto,
      centreId,
      adminId,
    });
    return this.credentialsRepo.save(credential);
  }

  async updateCredential(id: string, centreId: string, adminId: string, dto: UpdateVaultCredentialDto): Promise<VaultCredential> {
    const credential = await this.credentialsRepo.findOne({ where: { id, centreId, adminId } });
    if (!credential) throw new NotFoundException('Credential not found');

    Object.assign(credential, dto);
    return this.credentialsRepo.save(credential);
  }

  async deleteCredential(id: string, centreId: string, adminId: string): Promise<{ success: boolean }> {
    const result = await this.credentialsRepo.delete({ id, centreId, adminId });
    if (result.affected === 0) throw new NotFoundException('Credential not found');
    return { success: true };
  }
}
