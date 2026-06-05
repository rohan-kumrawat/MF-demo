import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDiaryAccountDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  diaryName?: string;
}
