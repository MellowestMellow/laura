import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoModalidadFormacionComponent } from './mantenimiento-modalidad-formacion.component';

describe('MantenimientoModalidadFormacionComponent', () => {
  let component: MantenimientoModalidadFormacionComponent;
  let fixture: ComponentFixture<MantenimientoModalidadFormacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoModalidadFormacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoModalidadFormacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
