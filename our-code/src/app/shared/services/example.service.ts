import { Injectable } from '@angular/core';
import { fetchToJson } from '../utils/fetch.utils';

export interface ExampleMessage {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  constructor() {}

  public getExampleText(): Promise<ExampleMessage> {
    const exampleMessage = fetchToJson<ExampleMessage>(
      'http://localhost:3000/',
      {
        method: 'GET',
      }
    );

    return exampleMessage;
  }
}
