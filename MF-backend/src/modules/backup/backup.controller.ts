import { Controller, Post, UseGuards } from '@nestjs/common';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('admin/backup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackupController {
  constructor(private readonly backup: BackupService) {}

  @Post('run')
  @Roles(Role.ADMIN)
  async run() {
    const rec = await this.backup.runBackup();
    return { id: rec.id, status: rec.status };
  }
}
