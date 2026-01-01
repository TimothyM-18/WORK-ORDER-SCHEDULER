// calendar.types.ts
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}
export type WorkCenterId = string;

export type ViewMode = 'month' | 'week' | 'day';

export interface WorkCenter {
  id: string;
  name: string;
}

export interface WorkOrder {
  id: string;
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  
}

// calendar/calendar.types.ts
export interface CalendarWorkOrder {
  id: string;
  name: string;
  workCenterId: string;
  status: WorkOrderStatus;
  startDate: string;
  endDate: string;

}

export interface WorkCenter {
  id: string;
  name: string;
}

export interface CalendarMonth {
  name: string;
  monthIndex: number; // 0 = Jan
  days: CalendarDay[];
}
export type WorkOrderStatus =
  | 'Open'
  | 'Blocked'
  | 'In_progress'
  | 'Complete';

