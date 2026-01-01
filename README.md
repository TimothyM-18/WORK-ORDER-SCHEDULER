# Work Order Scheduler

A **Work Order Schedule Timeline** frontend component built with **Angular** for visualizing and managing work orders across work centers.

This project implements an interactive timeline with zoom levels (Day/Week/Month), work order bars with statuses, and slide‑out panels for creating/editing work orders.

---

## 🚀 Demo

(Include a Loom or video link here demonstrating core functionality such as timeline views, create/edit/delete flows.)

---

## 🧩 Features

✔ Interactive timeline showing work orders by date  
✔ Day/Week/Month zoom levels  
✔ Work order status badges (Open, In Progress, Complete, Blocked)  
✔ Slide‑out Create/Edit panel with validation  
✔ Overlap detection per work center  
✔ Sample data with multiple work centers  
✔ Responsive UI and fixed left panel

---

## 📦 Stack

- **Angular 21** (generated with Angular CLI)  
- **TypeScript** (strict mode)  
- **SCSS** styling  
- **ng‑select** for dropdowns  
- **@ng‑bootstrap/ng‑bootstrap** for date picker

---

## 🛠️ Getting Started

### Prerequisites

```bash
npm install -g @angular/cli
node -v
npm -v
```

### Installation

### Clone the repo:

```bash
git clone https://github.com/TimothyM-18/WORK-ORDER-SCHEDULER.git
cd WORK-ORDER-SCHEDULER
```
---
### Intsall dependencies

```
npm install
```

### Running the App

```
ng serve
```

### Open Browser

```
http://localhost:4200
```
---
## Sample Data

### Includes:

✔ 5+ work centers  
✔ 8+ work orders  
✔ All 4 status types   
✔ Range of dates and non-overlapping entries   

---

## 📋 Usage / Timeline Interactions

### Timeline Controls

- **Timescale dropdown:** Switch between **Day**, **Week**, or **Month** views to zoom in or out.  
- **Horizontal scroll:** Pan across dates to see past or future work orders.  
- **Today indicator:** Vertical line showing the current date for quick reference.  

### Managing Work Orders

- **Create Work Order:** Click on an empty area of a work center row → Fill the slide-out form → Click **Create**.  
- **Edit Work Order:** Click the three-dot menu on an existing work order → Select **Edit** → Modify details → Click **Save**.  
- **Delete Work Order:** Click the three-dot menu on a work order → Select **Delete** → Confirm deletion.  
- **Overlap Validation:** The app prevents creating or editing a work order that overlaps with an existing one on the same work center. An error message will appear if there’s a conflict.  

### Additional Tips

- Hover over a row or work order for visual highlights.  
- The left panel with work center names stays fixed while scrolling horizontally.  
- Newly created or edited work orders appear immediately in the timeline.  


