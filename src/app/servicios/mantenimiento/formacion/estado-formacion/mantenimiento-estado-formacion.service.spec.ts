import { TestBed } from '@angular/core/testing';

import { MantenimientoEstadoFormacionService } from './mantenimiento-estado-formacion.service';

describe('MantenimientoEstadoFormacionService', () => {
  let service: MantenimientoEstadoFormacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoEstadoFormacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
