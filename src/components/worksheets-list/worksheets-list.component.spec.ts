import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksheetListComponent } from './worksheets-list.component';

describe('WorksheetsListComponent', () => {
  let component: WorksheetListComponent;
  let fixture: ComponentFixture<WorksheetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorksheetListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorksheetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
