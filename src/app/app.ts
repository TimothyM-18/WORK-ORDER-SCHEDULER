import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Calendar } from './calendar/calendar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet , Calendar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('erp');
}
