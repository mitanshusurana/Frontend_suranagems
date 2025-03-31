import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import Cropper from 'cropperjs';
import { GemReportService } from '../services/gem-report.service';
import { ImageUploadService } from '../services/image-upload.service';
import { GemReport } from '../models/gem-report.model';
import { BrowserQRCodeReader } from '@zxing/browser';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-gem-report-form',
  templateUrl: './gem-report-form.component.html',
  styleUrls: ['./gem-report-form.component.css']
})
export class GemReportFormComponent implements OnInit, OnDestroy {
  @ViewChild('imageInput') imageInput!: ElementRef;
  @ViewChild('imagePreview') imagePreview!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef;

  reportForm!: FormGroup;
  images: string[] = [];
  cropper: Cropper | null = null;
  isImageModalOpen = false;
  currentImage: string | null = null;
  imageQueue: File[] = [];
  isSubmitting = false;
  showQRScanner = false;
  codeReader: BrowserQRCodeReader;

  constructor(
    private fb: FormBuilder,
    private gemReportService: GemReportService,
    private imageUploadService: ImageUploadService,
    private snackBar: MatSnackBar
  ) {
    this.codeReader = new BrowserQRCodeReader();
  }

  ngOnInit() {
    this.reportForm = this.fb.group({
      id: ['24073175', [Validators.required]],
      date: ['2024-07-25', [Validators.required]],
      colour: ['pinkish-purple', [Validators.required]],
      species: ['Natural corundum', [Validators.required]],
      item: ['One faceted gemstone', [Validators.required]],
      variety: ['Purple sapphire', [Validators.required]],
      weight: ['17.04', [Validators.required]],
      origin: ['Burma (Myanmar)', [Validators.required]],
      shape: ['cushion-shape', [Validators.required]],
      condition: ['No indications of heating (NTE)', [Validators.required]],
      cut: ['modified brilliant cut / step cut', [Validators.required]],
      measurements: ['17.96 x 13.40 x 7.12', [Validators.required]],
      transparency: ['translucent', [Validators.required]]
    });
  }

  ngOnDestroy() {
    this.closeQRScanner();
  }

  onImageCapture() {
    this.imageInput.nativeElement.click();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const validFiles = files.filter(file => this.isValidImageFile(file));

      if (validFiles.length > 0) {
        this.imageQueue = [...validFiles];
        this.processNextImage();
      } else {
        this.showNotification('Please select valid image files (JPEG, PNG, or WebP)');
      }
    }
  }

  private processNextImage() {
    if (this.imageQueue.length > 0) {
      const file = this.imageQueue[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.isImageModalOpen = true;
        this.currentImage = e.target?.result as string;
        setTimeout(() => this.initCropper(), 100);
      };
      reader.readAsDataURL(file);
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  initCropper() {
    if (this.imagePreview && this.currentImage) {
      if (this.cropper) {
        this.cropper.destroy();
      }
      this.cropper = new Cropper(this.imagePreview.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    }
  }

  async saveCroppedImage() {
    if (this.cropper) {
      try {
        const croppedCanvas = this.cropper.getCroppedCanvas({
          width: 800,
          height: 800,
        });

        // Convert canvas to blob with explicit MIME type
        const blob = await new Promise<Blob>((resolve, reject) => {
          croppedCanvas.toBlob(
            (b) => {
              if (b) {
                resolve(b);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            },
            'image/jpeg',
            0.8
          );
        });

        // Create a File object from the Blob
        const file = new File([blob], 'cropped-image.jpg', { 
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        // Log the file object for debugging
        console.log('File object created:', file);

        this.imageUploadService.uploadImage(file).subscribe({
          next: (response) => {
            console.log('Upload successful:', response);
            this.images.push(response.url);
            this.imageQueue.shift();
            
            if (this.imageQueue.length === 0) {
              this.closeImageModal();
            } else {
              this.processNextImage();
            }
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.showNotification('Failed to upload image. Please try again.');
          }
        });
      } catch (error) {
        console.error('Error processing image:', error);
        this.showNotification('Failed to process image. Please try again.');
      }
    }
  }

  closeImageModal() {
    this.isImageModalOpen = false;
    this.currentImage = null;
    this.imageQueue = [];
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  async openQRScanner(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    try {
      this.showQRScanner = true;
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[videoInputDevices.length - 1].deviceId;
      
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
            this.reportForm.patchValue({ id: reportId });
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
    if (this.showQRScanner) {
      this.showQRScanner = false;
      if (this.videoElement?.nativeElement.srcObject) {
        const stream = this.videoElement.nativeElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  onSubmit() {
    if (this.reportForm.valid) {
      const formData: GemReport = {
        ...this.reportForm.value,
        images: this.images
      };

      this.isSubmitting = true;
      this.gemReportService.createReport(formData).subscribe({
        next: (response) => {
          this.showNotification('Report created successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating report:', error);
          this.showNotification('Error creating report. Please try again.');
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  private resetForm() {
    this.reportForm.reset();
    this.images = [];
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}