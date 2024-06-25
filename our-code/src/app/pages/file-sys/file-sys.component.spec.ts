import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSysComponent } from './file-sys.component';

describe('DirectoryComponent', () => {
  let component: FileSysComponent;
  let fixture: ComponentFixture<FileSysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});