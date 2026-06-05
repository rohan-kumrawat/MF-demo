import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { VaultService } from './vault.service';
import { CreateVaultCardDto, UpdateVaultCardDto } from './dto/vault-card.dto';
import { CreateVaultCredentialDto, UpdateVaultCredentialDto } from './dto/vault-credential.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('vault')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Only admins can access vault
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  // --- PIN Management ---

  @Get('pin-status')
  checkPinStatus(@CurrentUser() user: any) {
    return this.vaultService.checkPinStatus(user.sub);
  }

  @Post('setup-pin')
  setupPin(@CurrentUser() user: any, @Body('pin') pin: string) {
    return this.vaultService.setupPin(user.sub, pin);
  }

  @Post('verify-pin')
  verifyPin(@CurrentUser() user: any, @Body('pin') pin: string) {
    return this.vaultService.verifyPin(user.sub, pin);
  }

  @Post('reset-pin')
  resetPin(
    @CurrentUser() user: any, 
    @Body('password') password: string, 
    @Body('newPin') newPin: string
  ) {
    return this.vaultService.resetPin(user.sub, password, newPin);
  }

  // --- Vault Cards ---

  @Get('cards')
  getCards(@CurrentUser() user: any) {
    return this.vaultService.getCards(user.centreId, user.sub);
  }

  @Post('cards')
  createCard(@CurrentUser() user: any, @Body() dto: CreateVaultCardDto) {
    return this.vaultService.createCard(user.centreId, user.sub, dto);
  }

  @Patch('cards/:id')
  updateCard(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateVaultCardDto) {
    return this.vaultService.updateCard(id, user.centreId, user.sub, dto);
  }

  @Delete('cards/:id')
  deleteCard(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vaultService.deleteCard(id, user.centreId, user.sub);
  }

  // --- Vault Credentials ---

  @Get('credentials')
  getCredentials(@CurrentUser() user: any) {
    return this.vaultService.getCredentials(user.centreId, user.sub);
  }

  @Post('credentials')
  createCredential(@CurrentUser() user: any, @Body() dto: CreateVaultCredentialDto) {
    return this.vaultService.createCredential(user.centreId, user.sub, dto);
  }

  @Patch('credentials/:id')
  updateCredential(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateVaultCredentialDto) {
    return this.vaultService.updateCredential(id, user.centreId, user.sub, dto);
  }

  @Delete('credentials/:id')
  deleteCredential(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vaultService.deleteCredential(id, user.centreId, user.sub);
  }
}
