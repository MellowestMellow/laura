import { TestBed } from '@angular/core/testing';

import { MantenimientoGradoService } from './mantenimiento-grado.service';

describe('MantenimientoGradoService', () => {
  let service: MantenimientoGradoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoGradoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
