import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaPersonalComponent } from './estadistica-personal.component';

describe('EstadisticaPersonalComponent', () => {
  let component: EstadisticaPersonalComponent;
  let fixture: ComponentFixture<EstadisticaPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticaPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticaPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
