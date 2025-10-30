import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoTipoNotificacionComponent } from './mantenimiento-tipo-notificacion.component';

describe('MantenimientoTipoNotificacionComponent', () => {
  let component: MantenimientoTipoNotificacionComponent;
  let fixture: ComponentFixture<MantenimientoTipoNotificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoTipoNotificacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoTipoNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
