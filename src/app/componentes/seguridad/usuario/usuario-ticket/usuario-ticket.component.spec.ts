import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioTicketComponent } from './usuario-ticket.component';

describe('UsuarioTicketComponent', () => {
  let component: UsuarioTicketComponent;
  let fixture: ComponentFixture<UsuarioTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
