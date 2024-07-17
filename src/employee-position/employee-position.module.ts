
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeePosition } from './entities/employee-position.entity';
import { EmployeePositionController } from './employee-position.controller';
import { EmployeePositionService } from './employee-position.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeePosition]),
    ScheduleModule.forRoot(), 
  ],
  controllers: [EmployeePositionController],
  providers: [EmployeePositionService],
  exports: [EmployeePositionService], 
})
export class EmployeePositionModule {}

