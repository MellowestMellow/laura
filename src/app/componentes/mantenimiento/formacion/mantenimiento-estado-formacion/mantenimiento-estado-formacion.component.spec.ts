import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoEstadoFormacionComponent } from './mantenimiento-estado-formacion.component';

describe('MantenimientoEstadoFormacionComponent', () => {
  let component: MantenimientoEstadoFormacionComponent;
  let fixture: ComponentFixture<MantenimientoEstadoFormacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoEstadoFormacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoEstadoFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
