import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateEmployeePositionDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
