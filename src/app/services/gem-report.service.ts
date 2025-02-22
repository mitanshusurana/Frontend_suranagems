import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GemReport } from '../models/gem-report.model';

@Injectable({
  providedIn: 'root'
})
export class GemReportService {
  private mockReports: GemReport[] = [
    {
      id: '1',
      reportNumber: '24073175',
      date: '2024-07-25',
      colour: 'pinkish-purple',
      species: 'Natural corundum',
      item: 'One faceted gemstone',
      variety: 'Purple sapphire',
      weight: '17.04',
      origin: 'Burma (Myanmar)',
      shape: 'cushion-shape',
      condition: 'No indications of heating (NTE)',
      cut: 'modified brilliant cut / step cut',
      measurements: '17.96 x 13.40 x 7.12',
      transparency: 'translucent',
      images: []
    }
  ];

  private nextId = 2;

  constructor(private http: HttpClient) {}

  createReport(report: GemReport): Observable<GemReport> {
    const newReport = {
      ...report,
      id: this.nextId.toString()
    };
    this.nextId++;
    this.mockReports.push(newReport);
    return of(newReport);
  }

  getReport(id: string): Observable<GemReport> {
    const report = this.mockReports.find(r => r.id === id);
    return of(report || this.mockReports[0]);
  }

  updateReport(id: string, report: GemReport): Observable<GemReport> {
    const index = this.mockReports.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReports[index] = { ...report, id };
      return of(this.mockReports[index]);
    }
    return of(report);
  }

  deleteReport(id: string): Observable<void> {
    this.mockReports = this.mockReports.filter(r => r.id !== id);
    return of(void 0);
  }

  getAllReports(): Observable<GemReport[]> {
    return of(this.mockReports);
  }
}