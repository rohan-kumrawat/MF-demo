import { Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SequencesService } from './sequences.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('sequences')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}
}

