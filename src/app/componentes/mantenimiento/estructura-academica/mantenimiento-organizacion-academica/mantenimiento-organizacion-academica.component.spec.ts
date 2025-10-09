import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoOrganizacionAcademicaComponent } from './mantenimiento-organizacion-academica.component';

describe('MantenimientoOrganizacionAcademicaComponent', () => {
  let component: MantenimientoOrganizacionAcademicaComponent;
  let fixture: ComponentFixture<MantenimientoOrganizacionAcademicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoOrganizacionAcademicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoOrganizacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
