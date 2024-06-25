import { TestBed } from '@angular/core/testing';

import { FileService } from './file-sys.service';

describe('DirectoryService', () => {
  let service: FileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
