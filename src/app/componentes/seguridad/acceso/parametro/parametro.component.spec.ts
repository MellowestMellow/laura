import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametroComponent } from './parametro.component';

describe('ParametroComponent', () => {
  let component: ParametroComponent;
  let fixture: ComponentFixture<ParametroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
