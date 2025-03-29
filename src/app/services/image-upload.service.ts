import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: "https://3145274f44bbf3178e1f2469ff4fdb07.r2.cloudflarestorage.com",
      region: "auto",
      credentials: {
        accessKeyId: "876f9fb20f5eefde33e5797efe255e5c",
        secretAccessKey: "84db7fe89e4de9de6b0c65b772c458efa64ec49482c48670695bfa90ec02ab12"
      },
      forcePathStyle: true,
    });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
    const bucketName = "suranagemsassets";
    const publicUrl = "https://suranagemsassets.3145274f44bbf3178e1f2469ff4fdb07.r2.cloudflarestorage.com";

    return from(
      this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: file,
          ContentType: file.type
        })
      )
    ).pipe(
      map(() => ({
        url: `${publicUrl}/${fileName}`
      }))
    );
  }
}