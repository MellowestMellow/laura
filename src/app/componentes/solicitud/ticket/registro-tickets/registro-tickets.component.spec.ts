import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTicketsComponent } from './registro-tickets.component';

describe('RegistroTicketsComponent', () => {
  let component: RegistroTicketsComponent;
  let fixture: ComponentFixture<RegistroTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
