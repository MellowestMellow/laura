import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoDepartamentosAcademicosComponent } from './mantenimiento-departamentos-academicos.component';

describe('MantenimientoDepartamentosAcademicosComponent', () => {
  let component: MantenimientoDepartamentosAcademicosComponent;
  let fixture: ComponentFixture<MantenimientoDepartamentosAcademicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoDepartamentosAcademicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoDepartamentosAcademicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
