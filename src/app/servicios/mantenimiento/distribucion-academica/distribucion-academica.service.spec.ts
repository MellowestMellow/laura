import { TestBed } from '@angular/core/testing';

import { DistribucionAcademicaService } from './distribucion-academica.service';

describe('DistribucionAcademicaService', () => {
  let service: DistribucionAcademicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistribucionAcademicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
