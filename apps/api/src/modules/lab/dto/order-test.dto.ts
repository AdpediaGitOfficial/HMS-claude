import { IsString, IsUUID } from "class-validator";

export class OrderTestDto {
  @IsUUID()
  encounterId!: string;

  @IsUUID()
  testCatalogId!: string;
}

export class EnterResultDto {
  @IsString()
  resultValue!: string;
}
