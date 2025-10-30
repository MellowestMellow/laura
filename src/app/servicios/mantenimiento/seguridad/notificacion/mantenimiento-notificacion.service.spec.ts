import { TestBed } from '@angular/core/testing';

import { MantenimientoNotificacionService } from './mantenimiento-notificacion.service';

describe('MantenimientoNotificacionService', () => {
  let service: MantenimientoNotificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoNotificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
