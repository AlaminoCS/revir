import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSaleDialog } from './confirm-sale-dialog';

describe('ConfirmSaleDialog', () => {
  let component: ConfirmSaleDialog;
  let fixture: ComponentFixture<ConfirmSaleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmSaleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmSaleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
