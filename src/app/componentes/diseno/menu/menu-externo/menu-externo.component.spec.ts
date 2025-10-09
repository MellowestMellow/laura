import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuExternoComponent } from './menu-externo.component';

describe('MenuExternoComponent', () => {
  let component: MenuExternoComponent;
  let fixture: ComponentFixture<MenuExternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuExternoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
