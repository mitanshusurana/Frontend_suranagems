import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GemReportService } from '../services/gem-report.service';
import { GemReport } from '../models/gem-report.model';

@Component({
  selector: 'app-gem-report-list',
  templateUrl: './gem-report-list.component.html'
})
export class GemReportListComponent implements OnInit {
  reports: GemReport[] = [];
  loading = true;
  error = false;

  constructor(
    private gemReportService: GemReportService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.error = false;
    this.gemReportService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.error = true;
        this.loading = false;
        this.showNotification('Error loading reports');
      }
    });
  }

  deleteReport(id: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.gemReportService.deleteReport(id).subscribe({
        next: () => {
          this.reports = this.reports.filter(report => report.id !== id);
          this.showNotification('Report deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting report:', error);
          this.showNotification('Error deleting report');
        }
      });
    }
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}