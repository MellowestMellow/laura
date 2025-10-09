import { TestBed } from '@angular/core/testing';

import { MantenimientoUniversidadService } from './mantenimiento-universidad.service';

describe('MantenimientoUniversidadService', () => {
  let service: MantenimientoUniversidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoUniversidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
