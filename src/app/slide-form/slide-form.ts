import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SlideFormService } from './slide-form.service';
import { MatDividerModule } from '@angular/material/divider';
import { WorkOrder } from '../calendar/calendar.types';
import { WorkOrderStatus } from '../calendar/calendar.types';

interface StatusOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-slide-form',
  standalone: true,
  imports: [
    CommonModule,
    NgbDatepickerModule,
    NgSelectModule,
    ReactiveFormsModule,
    MatDividerModule
  ],
  templateUrl: './slide-form.html',
  styleUrls: ['./slide-form.scss'],
  animations: [
    trigger('slide', [
      state('void', style({ transform: 'translateX(100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ]),
    trigger('fade', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('300ms ease-in-out'))
    ])
  ]
})
export class SlideFormComponent {
  docId?: string;

  @Output() submitForm = new EventEmitter<{
    docId?: string;
    data: {
      workCenterId: string;
      name: string;
      status: WorkOrderStatus;
      startDate: string;
      endDate: string;
    };
  }>();

  isOpen = false;
  formTitle = 'Add Work Order';
  form: FormGroup;
  private editingDocId?: string;

  statuses: { id: WorkOrderStatus; name: string }[] = [
    { id: 'Open', name: 'Open' },
    { id: 'In_progress', name: 'In Progress' },
    { id: 'Complete', name: 'Complete' },
    { id: 'Blocked', name: 'Blocked' }
  ];

  constructor(
    private fb: FormBuilder,
    private slideService: SlideFormService,
    public slideFormService: SlideFormService
  ) {
    this.form = this.fb.group({
      workCenterId: ['', Validators.required],
      name: ['', Validators.required],
      status: ['', Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required]
    });

    this.slideService.open$.subscribe(data => this.openForm(data));

    this.slideService.close$.subscribe(() => this.closeForm());
  }

  /** Error exposed to template */
  formError: string | null = null;
  hasOverlap = false;
  isOverlapping = false;

  ngOnInit() {
    this.slideFormService.error$.subscribe(err => {
      this.formError = err;
    });

    this.slideFormService.close$.subscribe(() => {
      this.closeForm();
    });

    this.slideFormService.overlap$
      .subscribe(v => this.isOverlapping = v);

    this.form.valueChanges.subscribe(() => {
      this.checkOverlap();
    });

  }

  checkOverlap() {
    const s = this.form.value.startDate;
    const e = this.form.value.endDate;

    if (!s || !e) {
      this.slideFormService.clearError();
      return;
    }

    const start = this.fromNgbDateStruct(s);
    const end = this.fromNgbDateStruct(e);

    const overlap = this.existingRanges.some(r => {
      // ignore self when editing
      if (r.docId && r.docId === this.editingDocId) return false;

      return (
        new Date(start) <= new Date(r.end) &&
        new Date(end) >= new Date(r.start)
      );
    });

    if (overlap) {
      this.slideFormService.setError(
        'Work order overlaps with an existing order for this work center.'
      );
    } else {
      this.slideFormService.clearError();
    }
  }


  existingRanges: { start: string; end: string; docId?: string }[] = [];

  openForm(data?: any) {
    this.isOpen = true;

    this.existingRanges = data?.existingRanges ?? [];

    this.editingDocId = data?.docId;
    this.formTitle = data?.docId ? 'Edit Work Order' : 'Add Work Order';

    if (data) {
      this.form.patchValue({
        workCenterId: data.workCenterId,
        name: data.name ?? '',
        status: data.status ?? 'Open',
        startDate: this.toNgbDateStruct(new Date(data.startDate)),
        endDate: this.toNgbDateStruct(new Date(data.endDate))
      });
    }
  }


  closeForm() {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
    this.form.reset();
    this.editingDocId = undefined;
  }


  onSubmit() {
    if (this.form.invalid || this.isOverlapping) return;

    const payload = {
      docId: this.docId ?? this.editingDocId,
      data: {
        workCenterId: this.form.value.workCenterId,
        name: this.form.value.name,
        status: this.form.value.status as WorkOrderStatus,

        startDate: this.fromNgbDateStruct(this.form.value.startDate),
        endDate: this.fromNgbDateStruct(this.form.value.endDate)
      }
    };

    console.log('SUBMIT PAYLOAD (fixed):', payload);

    this.submitForm.emit(payload);
  }

  /* Date helpers unchanged */
  toNgbDateStruct(date: Date): NgbDateStruct {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }

  fromNgbDateStruct(struct: NgbDateStruct): string {
    return `${struct.year}-${struct.month
      .toString()
      .padStart(2, '0')}-${struct.day.toString().padStart(2, '0')}`;
  }

  isEndDateInvalid(): boolean {
    const start = this.form.get('startDate')?.value;
    const end = this.form.get('endDate')?.value;
    if (!start || !end) return false;
    return this.fromNgbDateStruct(end) < this.fromNgbDateStruct(start);
  }
}

