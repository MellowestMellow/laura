import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoSolicitudComponent } from './mantenimiento-solicitud.component';

describe('MantenimientoSolicitudComponent', () => {
  let component: MantenimientoSolicitudComponent;
  let fixture: ComponentFixture<MantenimientoSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoSolicitudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
