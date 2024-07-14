import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeePositionDto } from './create-employee-position.dto';

export class UpdateEmployeePositionDto extends PartialType(CreateEmployeePositionDto) {}
