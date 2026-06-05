import { IsOptional, IsString } from 'class-validator';

export class ApplyBulletPenaltyDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
