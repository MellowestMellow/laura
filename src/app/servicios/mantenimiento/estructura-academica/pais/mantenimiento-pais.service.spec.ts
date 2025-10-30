import { TestBed } from '@angular/core/testing';

import { MantenimientoPaisService } from './mantenimiento-pais.service';

describe('MantenimientoPaisService', () => {
  let service: MantenimientoPaisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoPaisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
