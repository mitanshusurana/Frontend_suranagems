import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private s3Client: S3Client;

  constructor(private http: HttpClient) {
    this.s3Client = new S3Client({
      endpoint: environment.r2.endpoint,
      region: environment.r2.region,
      credentials: environment.r2.credentials
    });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;

    return from(this.getPresignedUrl(fileName)).pipe(
      switchMap(presignedPost => {
        const formData = new FormData();
        
        // Add the policy fields to the form data
        Object.entries(presignedPost.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        
        // Add the file as the last field
        formData.append('file', file);

        return this.http.post(presignedPost.url, formData, {
          reportProgress: true,
          observe: 'response'
        });
      }),
      map(() => ({
        url: `${environment.r2.publicUrl}/${fileName}`
      }))
    );
  }

  private async getPresignedUrl(key: string) {
    return createPresignedPost(this.s3Client, {
      Bucket: environment.r2.bucketName,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10MB
        ['starts-with', '$Content-Type', 'image/']
      ],
      Expires: 600 // URL expires in 10 minutes
    });
  }
}
