import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoObjetosComponent } from './mantenimiento-objetos.component';

describe('MantenimientoObjetosComponent', () => {
  let component: MantenimientoObjetosComponent;
  let fixture: ComponentFixture<MantenimientoObjetosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoObjetosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MantenimientoObjetosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
