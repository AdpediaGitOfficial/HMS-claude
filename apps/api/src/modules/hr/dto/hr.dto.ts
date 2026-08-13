import { IsDateString, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { AttendanceStatus } from "../entities/attendance.entity";

export class CreateEmployeeDto {
  @IsUUID()
  userId!: string;

  @IsString()
  designation!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsDateString()
  dateOfJoining!: string;

  @IsNumber()
  @Min(0)
  monthlySalary!: number;
}

export class MarkAttendanceDto {
  @IsUUID()
  userId!: string;

  @IsIn(["present", "absent", "leave", "half_day"])
  status!: AttendanceStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreatePayrollRunDto {
  @IsNumber()
  @Min(1)
  periodMonth!: number;

  @IsNumber()
  @Min(2000)
  periodYear!: number;
}
