import { Controller, Post, Body, Put, Param, Get, Delete, NotFoundException } from '@nestjs/common';
import { EmployeePositionService } from './employee-position.service';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';

@Controller('employee-positions')
export class EmployeePositionController {
  constructor(private readonly employeePositionService: EmployeePositionService) {}

  @Post()
  async create(@Body() createEmployeePositionDto: CreateEmployeePositionDto) {
    return this.employeePositionService.create(createEmployeePositionDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeePositionDto: UpdateEmployeePositionDto,
  ) {
    return this.employeePositionService.update(id, updateEmployeePositionDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const position = await this.employeePositionService.findOne(id);
    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
    return position;
  }

  @Get()
  async findAll() {
    return this.employeePositionService.findAll();
  }

  @Get(':id/children')
  async findChildren(@Param('id') id: string) {
    const children = await this.employeePositionService.findChildren(id);
    if (!children) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
    return children;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.employeePositionService.remove(id);
  }
}
