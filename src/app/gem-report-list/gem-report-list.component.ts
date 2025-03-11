import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GemReportService } from '../services/gem-report.service';
import { GemReport } from '../models/gem-report.model';
import { BrowserQRCodeReader } from '@zxing/browser';

interface FilterValues {
  species: string[];
  variety: string[];
  origin: string[];
}

interface Filters {
  species?: string;
  variety?: string;
  origin?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ActiveFilter {
  field: string;
  value: string;
}

@Component({
  selector: 'app-gem-report-list',
  templateUrl: './gem-report-list.component.html'
})
export class GemReportListComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  reports: GemReport[] = [];
  filteredReports: GemReport[] = [];
  loading = true;
  error = false;
  searchQuery = '';
  showScanner = false;
  codeReader: BrowserQRCodeReader;
  
  filters: Filters = {};
  uniqueValues: FilterValues = {
    species: [],
    variety: [],
    origin: []
  };
  activeFilters: ActiveFilter[] = [];

  constructor(
    private gemReportService: GemReportService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.codeReader = new BrowserQRCodeReader();
  }

  ngOnInit() {
    this.loadReports();
  }

  ngOnDestroy() {
    this.closeQRScanner();
  }

  loadReports() {
    this.loading = true;
    this.error = false;
    this.gemReportService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.updateUniqueValues();
        this.applyFilters();
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

  private updateUniqueValues() {
    this.uniqueValues = {
      species: [...new Set(this.reports.map(r => r.species))],
      variety: [...new Set(this.reports.map(r => r.variety))],
      origin: [...new Set(this.reports.map(r => r.origin))]
    };
  }

  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      const matchesSearch = !this.searchQuery || 
        Object.values(report).some(value => 
          String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
        );

      const matchesSpecies = !this.filters.species || 
        report.species === this.filters.species;

      const matchesVariety = !this.filters.variety || 
        report.variety === this.filters.variety;

      const matchesOrigin = !this.filters.origin || 
        report.origin === this.filters.origin;

      const reportDate = new Date(report.date);
      const matchesDateFrom = !this.filters.dateFrom || 
        reportDate >= this.filters.dateFrom;
      const matchesDateTo = !this.filters.dateTo || 
        reportDate <= this.filters.dateTo;

      return matchesSearch && matchesSpecies && matchesVariety && 
             matchesOrigin && matchesDateFrom && matchesDateTo;
    });

    this.updateActiveFilters();
  }

  private updateActiveFilters() {
    this.activeFilters = [];
    if (this.searchQuery) {
      this.activeFilters.push({ field: 'Search', value: this.searchQuery });
    }
    if (this.filters.species) {
      this.activeFilters.push({ field: 'Species', value: this.filters.species });
    }
    if (this.filters.variety) {
      this.activeFilters.push({ field: 'Variety', value: this.filters.variety });
    }
    if (this.filters.origin) {
      this.activeFilters.push({ field: 'Origin', value: this.filters.origin });
    }
    if (this.filters.dateFrom) {
      this.activeFilters.push({ 
        field: 'From', 
        value: this.filters.dateFrom.toLocaleDateString() 
      });
    }
    if (this.filters.dateTo) {
      this.activeFilters.push({ 
        field: 'To', 
        value: this.filters.dateTo.toLocaleDateString() 
      });
    }
  }

  hasActiveFilters(): boolean {
    return this.activeFilters.length > 0;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filters = {};
    this.activeFilters = [];
    this.applyFilters();
  }

  removeFilter(filter: ActiveFilter) {
    if (filter.field === 'Search') {
      this.searchQuery = '';
    } else {
      switch (filter.field.toLowerCase()) {
        case 'species':
          this.filters.species = undefined;
          break;
        case 'variety':
          this.filters.variety = undefined;
          break;
        case 'origin':
          this.filters.origin = undefined;
          break;
        case 'from':
          this.filters.dateFrom = undefined;
          break;
        case 'to':
          this.filters.dateTo = undefined;
          break;
      }
    }
    this.applyFilters();
  }

  async openQRScanner() {
    try {
      this.showScanner = true;
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices.length > 1 ? videoInputDevices[1].deviceId : videoInputDevices[0].deviceId ;
      
      const previewStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId }
      });
      
      this.videoElement.nativeElement.srcObject = previewStream;
      this.videoElement.nativeElement.play();

      this.codeReader.decodeFromVideoElement(
        this.videoElement.nativeElement,
        (result) => {
          if (result) {
            const reportId = result.getText();
            this.closeQRScanner();
            this.router.navigate(['/reports', reportId]);
          }
        }
      );
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.showNotification('Error accessing camera');
      this.closeQRScanner();
    }
  }

  closeQRScanner() {
    if (this.showScanner) {
      this.showScanner = false;
      if (this.videoElement?.nativeElement.srcObject) {
        const stream = this.videoElement.nativeElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      // this.codeReader.reset();
    }
  }

  deleteReport(id: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      this.gemReportService.deleteReport(id).subscribe({
        next: () => {
          this.reports = this.reports.filter(report => report.id !== id);
          this.applyFilters();
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