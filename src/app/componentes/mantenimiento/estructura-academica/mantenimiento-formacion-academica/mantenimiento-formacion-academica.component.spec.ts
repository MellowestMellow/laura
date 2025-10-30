import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoFormacionAcademicaComponent } from './mantenimiento-formacion-academica.component';

describe('MantenimientoFormacionAcademicaComponent', () => {
  let component: MantenimientoFormacionAcademicaComponent;
  let fixture: ComponentFixture<MantenimientoFormacionAcademicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoFormacionAcademicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoFormacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
