import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">{{ data.title }}</h2>
      
      <div class="dialog-content">
        <div class="form-group">
          <label for="categoryName">שם קטגוריה</label>
          <input 
            id="categoryName" 
            class="text-input" 
            [(ngModel)]="categoryData.categoryName" 
            placeholder="הכנס שם קטגוריה" 
          />
        </div>
        
        <div class="form-group">
          <label for="description">תיאור</label>
          <textarea 
            id="description" 
            class="text-input textarea" 
            [(ngModel)]="categoryData.description" 
            placeholder="הכנס תיאור קטגוריה" 
            rows="4"
          ></textarea>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button class="action-btn cancel-btn" (click)="onCancel()">
          <span class="btn-text">ביטול</span>
        </button>
        <button class="action-btn save-btn" [disabled]="!isFormValid()" (click)="onSave()">
          <span class="btn-text">שמור</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      direction: rtl;
    }
    
    .dialog-title {
      margin-top: 0;
      margin-bottom: 24px;
      font-size: 20px;
      font-weight: 500;
      color: #333;
      text-align: center;
    }
    
    .dialog-content {
      margin-bottom: 24px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .text-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .textarea {
      resize: vertical;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
    }
    
    .action-btn {
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .save-btn {
      background-color: #3f51b5;
      color: white;
    }
    
    .save-btn:disabled {
      background-color: #c6c9dc;
      cursor: not-allowed;
    }
    
    .cancel-btn {
      background-color: #f5f5f5;
      color: #333;
    }
  `]
})
export class CategoryDialogComponent {
  categoryData: any = {
    categoryName: '',
    description: '',
  };

  constructor(
    public dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  isFormValid(): boolean {
    return this.categoryData.categoryName.trim() !== '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.categoryData);
    }
  }
}