import { WorkCenter } from '../calendar/calendar.types';

// Define work centers
export const WORK_CENTERS: WorkCenter[] = [
  { id: 'wc-fabrication', name: 'Fabrication' },
  { id: 'wc-coating', name: 'Coating' },
  { id: 'wc-inspection', name: 'Inspection' },
  { id: 'wc-repair', name: 'Repair' },
  { id: 'wc-shipping', name: 'Shipping' },
];

// Work Order statuses
export type WorkOrderStatus = 'Open' | 'Blocked' | 'In_progress' | 'Complete';

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
    docId: 'wo-101',
    docType: 'workOrder',
    data: {
      name: 'Fabrication Phase 1',
      workCenterId: 'wc-fabrication',
      status: 'Open',
      startDate: '2025-07-01',
      endDate: '2026-01-15',
    },
  },
  {
    docId: 'wo-102',
    docType: 'workOrder',
    data: {
      name: 'Fabrication Phase 2',
      workCenterId: 'wc-fabrication',
      status: 'In_progress',
      startDate: '2026-01-20',
      endDate: '2026-08-30',
    },
  },
  {
    docId: 'wo-103',
    docType: 'workOrder',
    data: {
      name: 'Coating Program',
      workCenterId: 'wc-coating',
      status: 'Complete',
      startDate: '2025-09-10',
      endDate: '2026-06-05',
    },
  },
  {
    docId: 'wo-104',
    docType: 'workOrder',
    data: {
      name: 'Coating Delay Hold',
      workCenterId: 'wc-coating',
      status: 'Blocked',
      startDate: '2026-06-10',
      endDate: '2026-10-20',
    },
  },
  {
    docId: 'wo-105',
    docType: 'workOrder',
    data: {
      name: 'Inspection Cycle',
      workCenterId: 'wc-inspection',
      status: 'In_progress',
      startDate: '2025-08-01',
      endDate: '2026-03-31',
    },
  },
  {
    docId: 'wo-106',
    docType: 'workOrder',
    data: {
      name: 'Scheduled Repairs',
      workCenterId: 'wc-repair',
      status: 'Open',
      startDate: '2025-12-15',
      endDate: '2026-07-15',
    },
  },
  {
    docId: 'wo-107',
    docType: 'workOrder',
    data: {
      name: 'Emergency Equipment Overhaul',
      workCenterId: 'wc-repair',
      status: 'Complete',
      startDate: '2025-06-20',
      endDate: '2025-11-05',
    },
  },
  {
    docId: 'wo-108',
    docType: 'workOrder',
    data: {
      name: 'Shipping Optimization',
      workCenterId: 'wc-shipping',
      status: 'Blocked',
      startDate: '2026-02-01',
      endDate: '2026-11-30',
    },
  },
];

