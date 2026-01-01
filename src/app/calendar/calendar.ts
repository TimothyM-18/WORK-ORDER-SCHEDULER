// Angular component for an ERP calendar with infinite scrolling timeline, work order management, and multiple view modes (day/week/month)

// imports for Angular core, material components, forms, and custom services
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

// import mock data for work centers and orders
import {
  WORK_CENTERS,
  WORK_ORDERS,
  WorkOrderDocument
} from '../mock/data';

// interface for work centers (e.g., production lines)
export interface WorkCenter {
  id: string;
  name: string;
}

// possible statuses for work orders
export type WorkOrderStatus =
  | 'Blocked'
  | 'In_progress'
  | 'Complete'
  | 'Open';

// internal WorkOrder interface used in the component
export interface WorkOrder {
  docId: string;
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;
}

// view modes for the calendar (day, week, month)
type ViewMode = 'month' | 'week' | 'day';

// main component class
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatGridListModule, MatListModule, NgSelectModule,  FormsModule, MatButtonModule, MatMenuModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss']
})
export class Calendar implements OnInit {

  // ---------- CONSTANTS ----------

  // constants for infinite scroll and layout tuning
  readonly EDGE_OFFSET = 300;
  readonly MONTH_CHUNK = 3;
  readonly WEEK_CHUNK = 10;
  readonly DAY_CHUNK = 30;
  readonly TOTAL_VISIBLE_ROWS = 20;
  readonly DAY_PAST = 60;
  readonly DAY_FUTURE = 120;

  // column widths in pixels per view mode
  readonly COLUMN_WIDTHS: Record<ViewMode, number> = {
    day: 80,
    week: 100,
    month: 120
  };

  // explicit widths (kept for compatibility with other helpers)
  dayColumnWidth = 80;
  weekColumnWidth = 100;
  monthColumnWidth = 120;

  // ---------- PROPERTIES ----------

  // reference to the scrollable container for the timeline
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // current view mode
  viewMode: ViewMode = 'day';
  // today's date
  today = new Date();
  // current date for padding calculations
  currentDate = new Date();

  // start and end of the visible timeline range
  rangeStart!: Date;
  rangeEnd!: Date;

  // options for the time scale selector
  TimeScale = [
    { id: 'month', name: 'Month' },
    { id: 'week',  name: 'Week' },
    { id: 'day',   name: 'Day' }
  ];

  // currently selected scale (synced with viewMode)
  selectedScale: 'month' | 'week' | 'day' = 'day';

  // list of work centers
  workCenters = WORK_CENTERS;

  // array of work orders (in-memory)
  workOrders: WorkOrder[] = [];

  // currently selected cell (for UI feedback)
  selectedCell?: {
    workCenterId: string;
    date: Date;
  };

  // error state for form validation
  formError: string | null = null;

  // toggle for showing current time indicator
  showCurrentTime = true;

  // ================= STATUS COLORS =================

  // mapping from status to background color generator (alpha supported)
  statusColors: Record<WorkOrderStatus, (alpha?: number) => string> = {
    Blocked:      (a = 0.3) => `rgba(255,193,7,${a})`,
    In_progress: (a = 0.3) => `rgba(79,93,255,${a})`,
    Complete:    (a = 0.3) => `rgba(40,219,0,${a})`,
    Open:        (a = 0.3) => `rgba(47,138,229,${a})`
  };

  // ---------- LIFECYCLE HOOKS ----------

  // initialize component: load orders, set range, scroll to current
  ngOnInit() {
    this.workOrders = this.mapWorkOrders();
    
    this.resetRange();
    setTimeout(() => this.scrollToCurrent(), 0);
    this.selectedScale = this.viewMode;
    this.resetRange();
  }

  // after view init, scroll to current position
  ngAfterViewInit() {
    setTimeout(() => this.scrollToCurrent(), 100);
  }

  // ---------- GETTERS ----------

  // getter to ensure we always render a fixed number of rows by adding empty placeholders
  get displayRows() {
    const filled = this.workCenters;
    const emptyCount = Math.max(
      this.TOTAL_VISIBLE_ROWS - filled.length,
      0
    );

    const emptyRows = Array.from({ length: emptyCount }).map((_, i) => ({
      id: `EMPTY-${i}`,
      name: ''
    }));

    return [...filled, ...emptyRows];
  }

  // compute array of Date units (month/week/day) between rangeStart and rangeEnd
  get timelineUnits(): Date[] {
    const units: Date[] = [];
    const d = new Date(this.rangeStart);

    while (d <= this.rangeEnd) {
      units.push(new Date(d));

      if (this.viewMode === 'month') d.setMonth(d.getMonth() + 1);
      if (this.viewMode === 'week')  d.setDate(d.getDate() + 7);
      if (this.viewMode === 'day')   d.setDate(d.getDate() + 1);
    }

    return units;
  }

  // getter for column width based on view mode
  get columnWidth(): number {
    if (this.viewMode === 'day') return this.dayColumnWidth;
    if (this.viewMode === 'week') return this.weekColumnWidth;
    return this.monthColumnWidth;
  }

  // when a cell is clicked, set selection and log existing ranges for debugging
  onCellClick(workCenterId: string, unit: Date) {
    this.selectedCell = {
      workCenterId,
      date: unit
    };
    const ranges = this.workOrders
      .filter(wo => wo.workCenterId === workCenterId)
      .map(wo => `${wo.startDate} → ${wo.endDate}`);

    console.log('Existing ranges for', workCenterId, ranges);

    console.log('Cell clicked:', {
      workCenterId,
      date: unit
    });
  }

  // format timeline labels per view mode
  formatUnitDate(unit: Date): string {
    if (this.viewMode === 'month') return unit.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (this.viewMode === 'week')  return `Week of ${unit.toDateString()}`;
    return unit.toDateString();
  }

  // handler called when the slide-form submits a work order
  onWorkOrderSubmit(payload: {
    docId?: string;
    data: {
      workCenterId: string;
      name: string;
      status: WorkOrderStatus;
      startDate: string;
      endDate: string;
    };
  }) {

    // overlap validation: ensure no existing work order for same center overlaps
    const overlap = this.workOrders.some(order => {
      if (order.workCenterId !== payload.data.workCenterId) return false;
      if (payload.docId && order.docId === payload.docId) return false;

      return (
        this.normalize(payload.data.startDate) <= this.normalize(order.endDate) &&
        this.normalize(payload.data.endDate) >= this.normalize(order.startDate)
      );
    });

    // ===============================
    // ✅ SAVE HERE - in-memory operations
    // ===============================

    if (payload.docId) {
      // ✏️ EDIT EXISTING: replace item in array
      const index = this.workOrders.findIndex(
        wo => wo.docId === payload.docId
      );

      if (index !== -1) {
        this.workOrders[index] = {
          docId: payload.docId,
          ...payload.data
        };
      }

    } else {
      // ➕ CREATE NEW: generate an id and push
      this.workOrders.push({
        docId: crypto.randomUUID(),
        ...payload.data
      });
    }

  }

  // toggle current time visibility
  toggleCurrentTime() {
    this.showCurrentTime = !this.showCurrentTime;
  }

  // ---------- VIEW MANAGEMENT ----------

  // switch view mode and reset visible range
  setView(mode: ViewMode) {
    this.viewMode = mode;
    this.selectedScale = mode;
    this.resetRange();
    setTimeout(() => this.scrollToCurrent(), 0);
  }

  // ---------- RANGE MANAGEMENT ----------

  // initialize a reasonable range around "now" per view mode
  resetRange() {
    const now = new Date();

    if (this.viewMode === 'month') {
      const m = this.startOfMonth(now);
      this.rangeStart = this.addMonths(m, -6); // show ~1 year centered
      this.rangeEnd   = this.addMonths(m, 6);
    }

    if (this.viewMode === 'week') {
      const w = this.startOfWeek(now);
      this.rangeStart = this.addWeeks(w, -8);
      this.rangeEnd   = this.addWeeks(w, 12);
    }

    if (this.viewMode === 'day') {
      const d = this.startOfDay(now);
      this.rangeStart = this.addDays(d, -this.DAY_PAST);
      this.rangeEnd   = this.addDays(d, this.DAY_FUTURE);
    }
  }

  // ---------- INFINITE SCROLL ----------

  // called from template scroll event — prepend/append more timeline units when approaching edges
  onTimelineScroll(event: Event) {
    const el = event.target as HTMLElement;
    const max = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft < this.EDGE_OFFSET) this.prependPast(el);
    if (el.scrollLeft > max - this.EDGE_OFFSET) this.appendFuture();
  }

  // extend the visible timeline into the future
  appendFuture() {
    if (this.viewMode === 'month') this.rangeEnd = this.addMonths(this.rangeEnd, this.MONTH_CHUNK);
    if (this.viewMode === 'week')  this.rangeEnd = this.addWeeks(this.rangeEnd, this.WEEK_CHUNK);
    if (this.viewMode === 'day')   this.rangeEnd = this.addDays(this.rangeEnd, this.DAY_CHUNK);
  }

  // extend into the past and keep scroll position stable
  prependPast(container: HTMLElement) {
    const prevWidth = container.scrollWidth;

    if (this.viewMode === 'month') this.rangeStart = this.addMonths(this.rangeStart, -this.MONTH_CHUNK);
    if (this.viewMode === 'week')  this.rangeStart = this.addWeeks(this.rangeStart, -this.WEEK_CHUNK);
    if (this.viewMode === 'day')   this.rangeStart = this.addDays(this.rangeStart, -this.DAY_CHUNK);

    setTimeout(() => {
      // adjust scrollLeft so user's viewport remains on the same content
      container.scrollLeft += container.scrollWidth - prevWidth;
    });
  }

  // ---------- SCROLLING ----------

  // calculate and scroll the container so "today" is centered
  scrollToCurrent() {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;

    const today = this.startOfDay(new Date());

    const index = this.timelineUnits.findIndex(unit =>
      this.startOfDay(unit).getTime() === today.getTime()
    );

    if (index === -1) return;

    const offset =
      index * this.getcolumnWidth() -
      el.clientWidth / 2 +
      this.getcolumnWidth() / 2;

    el.scrollLeft = Math.max(offset, 0);
  }

  // ---------- POSITION CALCULATIONS ----------

  // helpers for position calculations used by the UI
  getCurrentDayOfMonth(): number {
    return new Date().getDate(); // 1–31
  }

  getDaysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  getCurrentMonthIndex(): number {
    const now = new Date();

    return this.timelineUnits.findIndex(unit =>
      unit.getFullYear() === now.getFullYear() &&
      unit.getMonth() === now.getMonth()
    );
  }

  getCurrentMonthPosition(): number {
    if (this.viewMode !== 'month') return 0;

    const monthIndex = this.getCurrentMonthIndex();
    if (monthIndex === -1) return 0;

    const day = this.getCurrentDayOfMonth();
    const daysInMonth = this.getDaysInCurrentMonth();

    const dayOffset =
      (day / daysInMonth) * this.monthColumnWidth;

    return (monthIndex * this.monthColumnWidth) + dayOffset;
  }

  getCurrentHour(): number {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }

  getCurrentDayPosition(): number {
    if (this.viewMode !== 'day') return 0;

    const today = this.startOfDay(new Date());

    const index = this.timelineUnits.findIndex(unit =>
      this.startOfDay(unit).getTime() === today.getTime()
    );

    if (index === -1) return 0;

    return index * this.dayColumnWidth;
  }

  getCurrentTimePosition(): number {
    if (!this.showCurrentTime) return 0;

    switch (this.viewMode) {
      case 'month':
        return (this.getCurrentMonthPosition());

      case 'day':
        return (
          this.getCurrentDayPosition() +
          (this.getCurrentHour() * (this.dayColumnWidth / 24))
        );

      case 'week':
        return this.getCurrentWeekPosition();

      default:
        return 0;
    }
  }

  getCurrentPosition(): number {

    switch (this.viewMode) {
      case 'month':
        return this.getCurrentMonthPosition();

      case 'day':
        return (
          this.getCurrentDayPosition()
     
        );

      case 'week':
        return this.getCurrentWeekPosition();

      default:
        return 0;
    }
  }

  getCurrentWeekPosition(): number {
    if (this.viewMode !== 'week') return 0;

    const today = this.startOfDay(new Date());
    const weekStart = this.startOfWeek(today);

    const index = this.timelineUnits.findIndex(unit =>
      this.startOfWeek(unit).getTime() === weekStart.getTime()
    );

    if (index === -1) return 0;

    const dayOfWeek = (today.getDay() || 7) - 1; // Mon = 0
    const hourOffset = this.getCurrentHour() / 24;

    const dayFraction = (dayOfWeek + hourOffset) / 7;

    return (index * this.weekColumnWidth) +
           (dayFraction * this.weekColumnWidth);
  }

  // return column width according to active view
  getcolumnWidth(): number {
    return this.COLUMN_WIDTHS[this.viewMode];
  }

  // ---------- WORK ORDER MANAGEMENT ----------

  // filter work orders for a specific center
  getWorkOrdersForCenter(workCenterId: string): WorkOrder[] {
    return this.workOrders.filter(
      wo => wo.workCenterId === workCenterId
    );
  }

  // return orders that occupy the given cell unit (centerId + timeline unit)
  workOrdersForCell(centerId: string, unit: Date): WorkOrder[] {
    return this.workOrders.filter(wo => {
      if (wo.workCenterId !== centerId) return false;

      const start = new Date(wo.startDate);
      const end   = new Date(wo.endDate);

      if (this.viewMode === 'month') {
        // for month view, consider any order that starts in the same month or spans it
        return (
          unit.getMonth() === start.getMonth() ||
          (unit > start && unit < end)
        );
      }

      // for day/week views use inclusive range
      return unit >= start && unit <= end;
    });
  }

  // safe getter for status color with fallback
  getStatusColor(work: WorkOrder, alpha = 1): string {
    return this.statusColors[work.status]?.(alpha) ?? '#6c757d';
  }

  // ---------- UTILITY METHODS ----------

  // utility to return raw date ranges for a center (used by form)
  getDateRangesForCenter(workCenterId: string) {
    return this.workOrders
      .filter(wo => wo.workCenterId === workCenterId)
      .map(wo => ({
        startDate: wo.startDate,
        endDate: wo.endDate
      }));
  }

  // return simplified ranges for a particular work center (used by forms)
  getRangesForWorkCenter(wcId: string) {
    return this.workOrders
      .filter(w => w.workCenterId === wcId)
      .map(w => ({
        start: w.startDate,
        end: w.endDate,
        docId: w.docId
      }));
  }

  // ---------- DATE DIFFERENCE CALCULATIONS ----------

  // calculate the difference in months between two dates, including fractional days for precision
  diffInMonths(start: string | Date, end: string | Date): number {
    const s = new Date(start);
    const e = new Date(end);

    // calculate whole months difference
    let months =
      (e.getFullYear() - s.getFullYear()) * 12 +
      (e.getMonth() - s.getMonth());

    // adjust if end day is before start day in the month (e.g., Jan 31 to Feb 28)
    if (e.getDate() < s.getDate()) months--;

    // calculate fractional days based on the end month's length
    const daysInMonth = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate();
    const dayDiff = e.getDate() - s.getDate();
    const fractional = dayDiff / daysInMonth;

    return months + fractional;
  }

  // calculate fractional months including days
  diffInMonthsDays(start: string | Date, end: string | Date): number {
    const s = new Date(start);
    const e = new Date(end);

    let months =
      (e.getFullYear() - s.getFullYear()) * 12 +
      (e.getMonth() - s.getMonth());

    // calculate fractional days
    const daysInMonth = new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate(); // days in end month
    const dayDiff = e.getDate() - s.getDate();
    const fractional = dayDiff / daysInMonth;

    return months + fractional;
  }

  // calculate difference in days between two dates
  diffInDays(start: string | Date, end: string | Date): number {
    const s = new Date(start);
    const e = new Date(end);

    // normalize to midnight (prevents DST / time drift issues)
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const days = Math.floor((e.getTime() - s.getTime()) / MS_PER_DAY);

    // ensure minimum width of 1 day
    return Math.max(days);
  }

  // convert day diff to week count (ceil)
  diffInWeeks(start: Date, end: Date): number {
    return Math.max(Math.ceil(this.diffInDays(start, end) / 7));
  }

  // get length of work order in current view units
  getLength(work: WorkOrder): number {
    const start = new Date(work.startDate);
    const end   = new Date(work.endDate);

    switch (this.viewMode) {
      case 'month':
        return this.diffInMonthsDays(start, end);

      case 'week':
        return this.diffInWeeks(start, end);

      case 'day':
        return (this.diffInDays(start, end) + 1);

      default:
        return 1;
    }
  }

  // compute padding from "now" to work start in current view units
  getPadding(work: WorkOrder): number {
    const start = new Date(this.currentDate);
    const end   = new Date(work.startDate);

    switch (this.viewMode) {
      case 'month':
        return this.diffInMonthsDays(start, end);

      case 'week':
        return this.diffInWeeks(start, end);

      case 'day':
        return this.diffInDays(start, end);

      default:
        return 1;
    }
  }

  // get length of work order in months
  getWorkOrderMonths(work: WorkOrder) {
    return this.diffInMonths(
      work.startDate,
      work.endDate
    );
  }

  // padding in months from "currentDate" to start of work order
  getWorkOrderPadding(work: WorkOrder) {
    return this.diffInMonths(
      this.currentDate,
      work.startDate
    );
  }

  // get length of work order in days
  getWorkOrderDays(work: WorkOrder) {
    return this.diffInDays(
      work.startDate,
      work.endDate
    );
  }

  // padding in days from current date to work start
  getDayPadding(work: WorkOrder){
    return this.diffInMonths(
      this.currentDate,
      work.startDate
    );
  }

  // ---------- OVERLAP AND RANGE UTILITIES ----------

  // create array of ISO yyyy-mm-dd strings inclusive between start and end
  createDateRange(startDate: string, endDate: string): string[] {
    const range: string[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    // normalize to midnight
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const current = new Date(start);

    while (current <= end) {
      range.push(
        current.toISOString().slice(0, 10) // yyyy-mm-dd
      );
      current.setDate(current.getDate() + 1);
    }

    return range;
  }

  // basic overlap test using timestamps
  Overlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
    return (
      new Date(aStart).getTime() <= new Date(bEnd).getTime() &&
      new Date(aEnd).getTime() >= new Date(bStart).getTime()
    );
  }

  // normalize date to midnight and return ms timestamp
  private normalize(date: string | Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // another overlap helper (used internally) that normalizes dates
  private hasOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean {
    return (
      this.normalize(startA) <= this.normalize(endB) &&
      this.normalize(endA) >= this.normalize(startB)
    );
  }

  // ---------- PRIVATE METHODS ----------

  // map mock DB documents to the internal WorkOrder shape
  private mapWorkOrders(): WorkOrder[] {
    return WORK_ORDERS.map((wo: WorkOrderDocument) => ({
      docId: wo.docId,
      name: wo.data.name,
      workCenterId: wo.data.workCenterId,
      status: wo.data.status,
      startDate: wo.data.startDate,
      endDate: wo.data.endDate
    }));
  }

  // ---------- DATE UTILS ----------

  // returns first day of month at midnight
  startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  // returns Monday of the week for the given date at midnight
  startOfWeek(d: Date) {
    const x = new Date(d);
    const day = x.getDay() || 7;
    x.setDate(x.getDate() - day + 1);
    x.setHours(0,0,0,0);
    return x;
  }

  // return date normalized to midnight
  startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0,0,0,0);
    return x;
  }

  addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  addWeeks(d: Date, n: number) { return this.addDays(d, n * 7); }
  addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
}