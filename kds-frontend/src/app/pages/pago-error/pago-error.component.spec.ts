import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoErrorComponent } from './pago-error.component';

describe('PagoErrorComponent', () => {
  let component: PagoErrorComponent;
  let fixture: ComponentFixture<PagoErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
