import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GemReportService } from '../services/gem-report.service';
import { GemReport } from '../models/gem-report.model';

@Component({
  selector: 'app-gem-report-update',
  templateUrl: './gem-report-update.component.html',
  styleUrls: ['./gem-report-update.component.css']
})
export class GemReportUpdateComponent implements OnInit {
  reportForm!: FormGroup;
  reportId: string | null = null;
  loading = true;
  saving = false;
  error = false;
  images: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private gemReportService: GemReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportId = id;
      this.loadReport(id);
    }
  }

  private initForm() {
    this.reportForm = this.fb.group({
      reportNumber: ['', [Validators.required]],
      date: ['', [Validators.required]],
      colour: ['', [Validators.required]],
      species: ['', [Validators.required]],
      item: ['', [Validators.required]],
      variety: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      origin: ['', [Validators.required]],
      shape: ['', [Validators.required]],
      condition: ['', [Validators.required]],
      cut: ['', [Validators.required]],
      measurements: ['', [Validators.required]],
      transparency: ['', [Validators.required]]
    });
  }

  loadReport(id: string) {
    this.loading = true;
    this.error = false;
    this.gemReportService.getReport(id).subscribe({
      next: (report) => {
        this.reportForm.patchValue(report);
        this.images = report.images || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading report:', error);
        this.error = true;
        this.loading = false;
        this.showNotification('Error loading report');
      }
    });
  }

  onSubmit() {
    if (this.reportForm.valid && this.reportId) {
      this.saving = true;
      const formData: GemReport = {
        ...this.reportForm.value,
        images: this.images,
        id: this.reportId
      };

      this.gemReportService.updateReport(this.reportId, formData).subscribe({
        next: () => {
          this.showNotification('Report updated successfully');
          this.router.navigate(['/reports', this.reportId]);
        },
        error: (error) => {
          console.error('Error updating report:', error);
          this.showNotification('Error updating report');
          this.saving = false;
        }
      });
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}