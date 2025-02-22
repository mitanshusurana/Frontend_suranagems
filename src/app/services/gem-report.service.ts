import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GemReport } from '../models/gem-report.model';

@Injectable({
  providedIn: 'root'
})
export class GemReportService {
  private apiUrl = 'https://backend-suranagems.onrender.com/api/gem-reports'; // Placeholder URL

  constructor(private http: HttpClient) {}

  createReport(report: GemReport): Observable<GemReport> {
    return this.http.post<GemReport>(this.apiUrl, report);
  }

  getReport(id: string): Observable<GemReport> {
    return this.http.get<GemReport>(`${this.apiUrl}/${id}`);
  }

  updateReport(id: string, report: GemReport): Observable<GemReport> {
    return this.http.put<GemReport>(`${this.apiUrl}/${id}`, report);
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllReports(): Observable<GemReport[]> {
    return this.http.get<GemReport[]>(this.apiUrl);
  }
}
