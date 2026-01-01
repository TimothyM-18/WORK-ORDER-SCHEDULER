import { WorkCenter } from '../calendar/calendar.types';

// Define work centers
export const WORK_CENTERS: WorkCenter[] = [
   { id: 'wc-assembly', name: 'Assembly Line' },
  { id: 'wc-packaging', name: 'Packaging' },
  { id: 'wc-quality', name: 'Quality Control' },
  { id: 'wc-maintenance', name: 'Maintenance' },
  { id: 'wc-logistics', name: 'Logistics' },// optional extra
];

// Work Order statuses
export type WorkOrderStatus = 'Open' |'Blocked' | 'In_progress' | 'Complete';

// Work Order document type
export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string; // references WorkCenter.id
    status: WorkOrderStatus;
    startDate: string; // ISO format
    endDate: string;   // ISO format
  };
}

// Define work orders
export const WORK_ORDERS: WorkOrderDocument[] = [
  {
    docId: 'wo-001',
    docType: 'workOrder',
    data: {
      name: 'Long-Term Assembly Phase 1',
      workCenterId: 'wc-assembly',
      status: 'Open',
      startDate: '2025-07-01',
      endDate: '2026-01-15',
    },
  },
  {
    docId: 'wo-002',
    docType: 'workOrder',
    data: {
      name: 'Long-Term Assembly Phase 2',
      workCenterId: 'wc-assembly',
      status: 'In_progress',
      startDate: '2026-01-20',
      endDate: '2026-08-30',
    },
  },
  {
    docId: 'wo-003',
    docType: 'workOrder',
    data: {
      name: 'Extended Packaging Program',
      workCenterId: 'wc-packaging',
      status: 'Complete',
      startDate: '2025-09-10',
      endDate: '2026-06-05',
    },
  },
  {
    docId: 'wo-004',
    docType: 'workOrder',
    data: {
      name: 'Export Packaging Hold',
      workCenterId: 'wc-packaging',
      status: 'Blocked',
      startDate: '2026-06-10',
      endDate: '2026-10-20',
    },
  },
  {
    docId: 'wo-005',
    docType: 'workOrder',
    data: {
      name: 'Ongoing Quality Audits',
      workCenterId: 'wc-quality',
      status: 'In_progress',
      startDate: '2025-08-01',
      endDate: '2026-03-31',
    },
  },
  {
    docId: 'wo-006',
    docType: 'workOrder',
    data: {
      name: 'Preventive Maintenance Cycle',
      workCenterId: 'wc-maintenance',
      status: 'Open',
      startDate: '2025-12-15',
      endDate: '2026-07-15',
    },
  },
  {
    docId: 'wo-007',
    docType: 'workOrder',
    data: {
      name: 'Critical Equipment Overhaul',
      workCenterId: 'wc-maintenance',
      status: 'Complete',
      startDate: '2025-06-20',
      endDate: '2025-11-05',
    },
  },
  {
    docId: 'wo-008',
    docType: 'workOrder',
    data: {
      name: 'Long-Term Logistics Optimization',
      workCenterId: 'wc-logistics',
      status: 'Blocked',
      startDate: '2026-02-01',
      endDate: '2026-11-30',
    },
  },
];

