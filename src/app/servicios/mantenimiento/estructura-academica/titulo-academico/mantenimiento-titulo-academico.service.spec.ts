import { TestBed } from '@angular/core/testing';

import { MantenimientoTituloAcademicoService } from './mantenimiento-titulo-academico.service';

describe('MantenimientoTituloAcademicoService', () => {
  let service: MantenimientoTituloAcademicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoTituloAcademicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
