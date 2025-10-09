import { TestBed } from '@angular/core/testing';

import { MantenimientoFacultadService } from './mantenimiento-facultad.service';

describe('MantenimientoFacultadService', () => {
  let service: MantenimientoFacultadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoFacultadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
