import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GemReportService } from '../services/gem-report.service';
import { GemReport } from '../models/gem-report.model';

@Component({
  selector: 'app-gem-report-details',
  templateUrl: './gem-report-details.component.html',
  styleUrls: ['./gem-report-details.component.css']
})
export class GemReportDetailsComponent implements OnInit {
  report: GemReport | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gemReportService: GemReportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReport(id);
    }
  }

  loadReport(id: string) {
    this.loading = true;
    this.error = false;
    this.gemReportService.getReport(id).subscribe({
      next: (report) => {
        this.report = report;
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

  deleteReport() {
    if (this.report?.id && confirm('Are you sure you want to delete this report?')) {
      this.gemReportService.deleteReport(this.report.id).subscribe({
        next: () => {
          this.showNotification('Report deleted successfully');
          this.router.navigate(['/reports']);
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