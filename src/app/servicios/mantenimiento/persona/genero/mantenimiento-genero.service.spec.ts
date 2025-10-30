import { TestBed } from '@angular/core/testing';

import { MantenimientoGeneroService } from './mantenimiento-genero.service';

describe('MantenimientoGeneroService', () => {
  let service: MantenimientoGeneroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoGeneroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
