import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservacionComponent } from './reservacion.component';

describe('ReservacionComponent', () => {
  let component: ReservacionComponent;
  let fixture: ComponentFixture<ReservacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
