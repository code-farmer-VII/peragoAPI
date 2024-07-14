import { Test, TestingModule } from '@nestjs/testing';
import { EmployeePositionService } from './employee-position.service';

describe('EmployeePositionService', () => {
  let service: EmployeePositionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeePositionService],
    }).compile();

    service = module.get<EmployeePositionService>(EmployeePositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
