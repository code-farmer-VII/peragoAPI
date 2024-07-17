import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeePositionDto } from './dto/create-employee-position.dto';
import { UpdateEmployeePositionDto } from './dto/update-employee-position.dto';
import { EmployeePosition } from './entities/employee-position.entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class EmployeePositionService {
  constructor(
    @InjectRepository(EmployeePosition)
    private readonly employeePositionRepository: Repository<EmployeePosition>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // async create(createEmployeePositionDto: CreateEmployeePositionDto): Promise<EmployeePosition> {
  //   const position = this.employeePositionRepository.create(createEmployeePositionDto);

  //   if (createEmployeePositionDto.parentId) {
  //     const parent = await this.employeePositionRepository.findOne({
  //       where: { id: createEmployeePositionDto.parentId },
  //     });
  //     if (!parent) {
  //       throw new NotFoundException(`the parent id  ${createEmployeePositionDto.parentId} is not found in the herarchy of employee position`);
  //     }
  //     position.parent = parent;
  //   }
  //   const savedata = await this.employeePositionRepository.save({
  //     parentId: createEmployeePositionDto.parentId
  //   });
  async create(createEmployeePositionDto: CreateEmployeePositionDto): Promise<EmployeePosition> {
    const position = this.employeePositionRepository.create(createEmployeePositionDto);

    if (createEmployeePositionDto.parentId) {
      const parent = await this.employeePositionRepository.findOne({
              where: { id: createEmployeePositionDto.parentId },
            });
      if (!parent) {
        throw new NotFoundException(`Parent position with ID ${createEmployeePositionDto.parentId} not found.`);
      }
      position.parent = parent;
    }

    const savedPosition = await this.employeePositionRepository.save(position);
        // Schedule deletion
        const jobName = `delete_position_${savedPosition.id}`;
        const deleteDate = new Date();
        deleteDate.setMinutes(deleteDate.getMinutes() + 30); 
    
        const job = new CronJob(deleteDate, async () => {
          await this.deletePosition(savedPosition.id);
        });

        this.schedulerRegistry.addCronJob(jobName, job);
        job.start();
    
        return savedPosition;
  }

  private async deletePosition(positionId: string): Promise<void> {
    const position = await this.employeePositionRepository.findOne({where:{id:positionId}});
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found.`);
    }
    await this.employeePositionRepository.remove(position);

    // Remove the job from scheduler after deletion
    const jobName = `delete_position_${positionId}`;
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    }
  }

   async deleteJobSchedule(jobName: string): Promise<void> {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob(jobName);
    } else {
      throw new NotFoundException(`Job with name ${jobName} not found.`);
    }
  }

   async stopJobSchedule(jobName: string): Promise<void> {
    const job = this.schedulerRegistry.getCronJob(jobName);
    if (job) {
      job.stop();
    } else {
      throw new NotFoundException(`Job with name ${jobName} not found.`);
    }
  }

  getCrons(): string[] {
    return [...this.schedulerRegistry.getCronJobs().keys()];
  }



  async update(id: string, updateEmployeePositionDto: UpdateEmployeePositionDto): Promise<EmployeePosition> {
    const position = await this.employeePositionRepository.findOne({ where: { id } });
    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
  
    if (updateEmployeePositionDto.name !== undefined) {
      position.name = updateEmployeePositionDto.name;
    }
    if (updateEmployeePositionDto.description !== undefined) {
      position.description = updateEmployeePositionDto.description;
    }
    if (updateEmployeePositionDto.parentId) {
      const parent = await this.employeePositionRepository.findOne({
        where: { id: updateEmployeePositionDto.parentId },
      });
      position.parent = parent;
    }
  
    return this.employeePositionRepository.save(position);
  }
  

  async findOne(id: string): Promise<EmployeePosition> {
    return this.employeePositionRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
  }


  async findAll(): Promise<EmployeePosition[]> {
    const positions = await this.employeePositionRepository.find({ relations: ['parent', 'children'] });
     //return positions
    const roots = positions.filter(pos => !pos.parent);
     return this.children(roots);
  }

  async findChildren(id: string): Promise<EmployeePosition> {
    const position = await this.employeePositionRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
    return (await this.children([position]))[0]; 
  }

  private async children(positions: EmployeePosition[]): Promise<EmployeePosition[]> {
    for (const position of positions) {
      const children = await this.employeePositionRepository.find({
        where: { parent: position },
        relations: ['children'],
      });

      position.children = children; 

      await this.children(children);
    }

    return positions;
  }
  async remove(id: string): Promise<void> {
    const position = await this.employeePositionRepository.findOne({
      where: { id },
      relations: ['children'],
    });
  
    if (!position) {
      throw new NotFoundException(` ${id} not found`);
    }
  
    if (position.children && position.children.length > 0) {
      throw new BadRequestException(`${id} cannot be deleted bc it has children`);
    }
  
    await this.employeePositionRepository.remove(position);
  }
  

  // async remove(id: string): Promise<void> {
  //   const position = await this.employeePositionRepository.findOne({
  //     where: { id },
  //     relations: ['children'],
  //   });
  //   if (!position) {
  //     throw new NotFoundException(`Position with id ${id} not found`);
  //   }

  //   await this.removeChildren(position);

  //   await this.employeePositionRepository.remove(position);
  // }

  private async removeChildren(position: EmployeePosition): Promise<void> {
    const children = await this.employeePositionRepository.find({
      where: { parent: position },
      relations: ['children'],
    });

    for (const child of children) {
      await this.removeChildren(child);
      await this.employeePositionRepository.remove(child);
    }
  }

}
