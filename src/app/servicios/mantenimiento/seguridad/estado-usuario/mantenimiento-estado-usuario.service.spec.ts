import { TestBed } from '@angular/core/testing';

import { MantenimientoEstadoUsuarioService } from './mantenimiento-estado-usuario.service';

describe('MantenimientoEstadoUsuarioService', () => {
  let service: MantenimientoEstadoUsuarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoEstadoUsuarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
