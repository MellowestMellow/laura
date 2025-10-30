import { TestBed } from '@angular/core/testing';

import { MantenimientoCampusService } from './mantenimiento-campus.service';

describe('MantenimientoCampusService', () => {
  let service: MantenimientoCampusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoCampusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
