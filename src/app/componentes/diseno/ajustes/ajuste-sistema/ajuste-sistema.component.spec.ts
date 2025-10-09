import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjusteSistemaComponent } from './ajuste-sistema.component';

describe('AjusteSistemaComponent', () => {
  let component: AjusteSistemaComponent;
  let fixture: ComponentFixture<AjusteSistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjusteSistemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjusteSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
