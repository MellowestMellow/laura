import { TestBed } from '@angular/core/testing';

import { MantenimientoModalidadService } from './mantenimiento-modalidad.service';

describe('MantenimientoModalidadService', () => {
  let service: MantenimientoModalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoModalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
