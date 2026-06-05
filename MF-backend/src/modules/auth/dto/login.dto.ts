import { IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  /** Village/centre name — e.g. "BHOINDA" or "DHARAMRAY".
   *  Optional: if omitted, username must be globally unique (single-centre mode). */
  @IsOptional()
  @IsString()
  centreName?: string;
}
