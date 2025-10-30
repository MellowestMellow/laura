import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoFacultadesAcademicasComponent } from './mantenimiento-facultades-academicas.component';

describe('MantenimientoFacultadesAcademicasComponent', () => {
  let component: MantenimientoFacultadesAcademicasComponent;
  let fixture: ComponentFixture<MantenimientoFacultadesAcademicasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoFacultadesAcademicasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoFacultadesAcademicasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
