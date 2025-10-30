import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarTicketsComponent } from './consultar-tickets.component';

describe('ConsultarTicketsComponent', () => {
  let component: ConsultarTicketsComponent;
  let fixture: ComponentFixture<ConsultarTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
