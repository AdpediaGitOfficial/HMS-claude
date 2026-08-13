import { IsOptional, IsString, IsUUID } from "class-validator";

export class AddAmbulanceDto {
  @IsString()
  vehicleNumber!: string;

  @IsString()
  driverName!: string;
}

export class DispatchAmbulanceDto {
  @IsUUID()
  ambulanceId!: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsString()
  pickupLocation!: string;

  @IsString()
  dropLocation!: string;
}
