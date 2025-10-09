import { TestBed } from '@angular/core/testing';

import { MantenimientoDepartamentoService } from './mantenimiento-departamento.service';

describe('MantenimientoDepartamentoService', () => {
  let service: MantenimientoDepartamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoDepartamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
