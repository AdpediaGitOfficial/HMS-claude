import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateTpaProviderDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
