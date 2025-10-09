import { TestBed } from '@angular/core/testing';

import { MantenimientoObjetoService } from './mantenimiento-objeto.service';

describe('MantenimientoObjetoService', () => {
  let service: MantenimientoObjetoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoObjetoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
