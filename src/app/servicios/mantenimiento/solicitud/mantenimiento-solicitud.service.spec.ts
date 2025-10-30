import { TestBed } from '@angular/core/testing';

import { MantenimientoSolicitudService } from './mantenimiento-solicitud.service';

describe('MantenimientoSolicitudService', () => {
  let service: MantenimientoSolicitudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoSolicitudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
