import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedWorkspaceComponent } from './sharedworkspace.component';

describe('SharedWorkspaceComponent', () => {
  let component: SharedWorkspaceComponent;
  let fixture: ComponentFixture<SharedWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedWorkspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
