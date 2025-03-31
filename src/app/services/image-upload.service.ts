import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private s3Client: S3Client;
  private publicUrl: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: environment.r2.endpoint,
      region: environment.r2.region,
      credentials: environment.r2.credentials,
      forcePathStyle: true
    });
    this.publicUrl = environment.r2.publicUrl;
  }

  uploadImage(file: File): Observable<{ url: string }> {
    return new Observable(observer => {
      // Validate file input
      if (!(file instanceof File)) {
        observer.error(new Error('Invalid file object'));
        return;
      }

      // Create a FileReader instance
      const reader = new FileReader();
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;

      reader.onload = async () => {
        try {
          if (!reader.result) {
            throw new Error('Failed to read file');
          }

          // Convert FileReader result to Uint8Array
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);

          // Send the upload command
          await this.s3Client.send(
            new PutObjectCommand({
              Bucket: environment.r2.bucketName,
              Key: fileName,
              Body: uint8Array,
              ContentType: file.type,
              ACL: 'public-read'
            })
          );

          // Return the public URL
          observer.next({
            url: `${this.publicUrl}/${fileName}`
          });
          observer.complete();
        } catch (error) {
          console.error('Error uploading to R2:', error);
          observer.error(error);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        observer.error(new Error('Failed to read file'));
      };

      // Start reading the file
      try {
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error starting file read:', error);
        observer.error(new Error('Failed to start file reading'));
      }
    });
  }
}
