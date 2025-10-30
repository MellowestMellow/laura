import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoUniversidadComponent } from './mantenimiento-universidad.component';

describe('MantenimientoUniversidadComponent', () => {
  let component: MantenimientoUniversidadComponent;
  let fixture: ComponentFixture<MantenimientoUniversidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoUniversidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoUniversidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
