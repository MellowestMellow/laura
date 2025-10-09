import { TestBed } from '@angular/core/testing';

import { EstructuraAcademicaService } from './estructura-academica.service';

describe('EstructuraAcademicaService', () => {
  let service: EstructuraAcademicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstructuraAcademicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
