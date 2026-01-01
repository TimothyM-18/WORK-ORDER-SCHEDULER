import { Component, signal } from '@angular/core';
import { Calendar } from './calendar/calendar';

@Component({
  selector: 'app-root',
  imports: [Calendar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('calendar');
}
