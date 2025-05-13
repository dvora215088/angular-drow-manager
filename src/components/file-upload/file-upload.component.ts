import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { UploadService } from '../../services/upload.service';

// Interface for floating icons
interface FloatingIcon {
  name: string;
  color: string;
  x: number;
  y: number;
  xSpeed: number;
  ySpeed: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  // Standalone component setup
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    NgIf,
    NgFor,
    NgStyle,
    ReactiveFormsModule
  ]
})
export class FileUploadComponent implements OnInit, OnDestroy {
  uploadForm!: FormGroup;
  file: File | null = null;
  uploading = false;
  error = '';
  success = false;
  saveSuccess = false;
  isAdmin = true;
  
  // Categories will be fetched from the service
  categories: Category[] = [];
  categoriesLoading = true;
  
  // Floating icons
  floatingIcons: FloatingIcon[] = [];
  animationFrameId: number | null = null;

  difficultyOptions = [
    { value: 'קל', label: 'קל' },
    { value: 'בינוני', label: 'בינוני' },
    { value: 'קשה', label: 'קשה' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private uploadService: UploadService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.checkIfUserIsAdmin();
    this.initForm();
    this.fetchCategories();
    this.initFloatingIcons(); // Initialize floating icons
    this.startIconAnimation(); // Start animation
  }

  ngOnDestroy(): void {
    // Cancel the animation frame when component is destroyed
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  initForm(): void {
    this.uploadForm = this.fb.group({
      drawingName: ['', Validators.required],
      ageGroup: ['', Validators.required],
      difficulty: ['', Validators.required],
      categoryId: ['', Validators.required] // Always required now
    });
  }

  // Initialize floating icons
  initFloatingIcons(): void {
    const iconNames = ['palette', 'brush', 'color_lens', 'format_paint', 'draw'];
    const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#673AB7', '#FF6D00'];
    
    for (let i = 0; i < 8; i++) {
      this.floatingIcons.push({
        name: iconNames[i % iconNames.length],
        color: colors[i % colors.length],
        x: Math.random() * 100,
        y: Math.random() * 20 + 5,
        xSpeed: (Math.random() - 0.5) * 0.3,
        ySpeed: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        scale: 0.8 + Math.random() * 0.8
      });
    }
  }

  // Start animation loop for icons
  startIconAnimation(): void {
    const animate = () => {
      this.updateIconPositions();
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  // Update icon positions for animation
  updateIconPositions(): void {
    this.floatingIcons.forEach(icon => {
      // Update position
      icon.x += icon.xSpeed;
      icon.y += icon.ySpeed;
      
      // Bounce off edges
      if (icon.x <= 0 || icon.x >= 100) {
        icon.xSpeed *= -1;
      }
      if (icon.y <= 0 || icon.y >= 25) {
        icon.ySpeed *= -1;
      }
      
      // Update rotation
      icon.rotation += icon.rotationSpeed;
    });
  }

  // Get style for each icon
  getIconStyle(index: number): any {
    const icon = this.floatingIcons[index];
    return {
      'left': `${icon.x}%`,
      'bottom': `${icon.y}%`,
      'transform': `rotate(${icon.rotation}deg) scale(${icon.scale})`,
      'transition': 'transform 0.5s ease-out'
    };
  }

  fetchCategories(): void {
    this.categoriesLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesLoading = false;
        
        // If there's only one category, select it by default
        if (categories.length === 1) {
          this.uploadForm.patchValue({
            categoryId: categories[0].id
          });
        }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.error = 'שגיאה בטעינת הקטגוריות. נסה שוב מאוחר יותר.';
        this.categoriesLoading = false;
      }
    });
  }

  handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.error = '';
      this.success = false;
    }
  }

  async uploadFile(): Promise<void> {
    if (!this.file || this.uploadForm.invalid) {
      this.error = 'יש למלא את כל השדות ולבחור קובץ';
      return;
    }

    this.uploading = true;
    this.error = '';
    
    try {
      // Get presigned URL using the new service
      const { url, key } = await this.uploadService.getPresignedUrl(this.file.name);
      
      // Upload file to S3 using the new service
      await this.uploadService.uploadFileToS3(url, this.file);
      
      // Save worksheet metadata
      const fileUrl = `https://s3.us-east-1.amazonaws.com/drows.testpnoren/${key}`;
      
      const worksheetData = {
        title: this.uploadForm.get('drawingName')?.value,
        fileUrl,
        ageGroup: this.uploadForm.get('ageGroup')?.value,
        difficulty: this.uploadForm.get('difficulty')?.value,
        categoryId: this.uploadForm.get('categoryId')?.value
      };
      
      if (true) {
        // Use the admin endpoint
        this.uploadService.addWorksheetAsAdmin(worksheetData)
          .subscribe({
            next: (worksheet) => {
              console.log('Worksheet created successfully as admin:', worksheet);
              this.success = true;
              this.resetForm();
              this.uploading = false;
              // Celebrate with animation
              this.celebrateSuccess();
            },
            error: (err) => {
              this.error = this.uploadService.handleError(err);
              this.uploading = false;
            }
          });
      } 
    } catch (err) {
      this.error = this.uploadService.handleError(err);
    } finally {
      if (!this.isAdmin || this.error) {
        this.uploading = false;
      }
    }
  }

  // Add a celebration effect on successful upload
  celebrateSuccess(): void {
    // Speed up the icons temporarily as a success celebration
    this.floatingIcons.forEach(icon => {
      icon.xSpeed *= 2.5;
      icon.ySpeed *= 2.5;
      icon.rotationSpeed *= 2;
      
      // Reset speeds after 2 seconds
      setTimeout(() => {
        icon.xSpeed /= 2.5;
        icon.ySpeed /= 2.5;
        icon.rotationSpeed /= 2;
      }, 2000);
    });
  }

  // Helper method to check if user is admin
  checkIfUserIsAdmin(): boolean {
    // Implementation depends on your authentication mechanism
    // For example, check a token or a user role stored in localStorage
    const userRoles = localStorage.getItem('userRoles');
    return userRoles ? userRoles.includes('Admin') : false;
  }

  saveImage(): void {
    if (!this.file) {
      this.error = 'יש לבחור קובץ תמונה תחילה';
      return;
    }

    // Create URL object for the selected file
    const imageUrl = URL.createObjectURL(this.file);
    
    // Create download link element
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = this.file.name;
    
    // Auto-click the link to start download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Release the URL object
    URL.revokeObjectURL(imageUrl);
    
    this.snackBar.open('התמונה נשמרה בהצלחה!', 'סגור', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
    
    // Celebrate with animation when saving
    this.celebrateSuccess();
  }

  resetForm(): void {
    this.uploadForm.reset();
    this.file = null;
  }
}