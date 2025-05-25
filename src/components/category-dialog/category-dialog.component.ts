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
      <div class="dialog-header">
        <div class="header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="dialog-title">{{ data.title }}</h2>
      </div>
      
      <div class="dialog-content">
        <div class="form-group">
          <label for="categoryName" class="form-label">
            <span class="label-icon">📝</span>
            שם קטגוריה
          </label>
          <div class="input-wrapper">
            <input 
              id="categoryName" 
              class="text-input" 
              [(ngModel)]="categoryData.categoryName" 
              placeholder="הכנס שם קטגוריה" 
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="description" class="form-label">
            <span class="label-icon">📄</span>
            תיאור
          </label>
          <div class="input-wrapper">
            <textarea 
              id="description" 
              class="text-input textarea" 
              [(ngModel)]="categoryData.description" 
              placeholder="הכנס תיאור מפורט לקטגוריה..." 
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button class="action-btn cancel-btn" (click)="onCancel()">
          <span class="btn-icon">✕</span>
          <span class="btn-text">ביטול</span>
        </button>
        <button class="action-btn save-btn" [disabled]="!isFormValid()" (click)="onSave()">
          <span class="btn-icon">✓</span>
          <span class="btn-text">שמור</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      direction: rtl;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 500px;
      width: 100%;
    }
    
    .dialog-header {
      background: linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%);
      padding: 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .dialog-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%);
      pointer-events: none;
    }
    
    .header-icon {
      color: #e2e8f0;
      margin-bottom: 8px;
      opacity: 0.9;
    }
    
    .dialog-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #f8fafc;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 1;
    }
    
    .dialog-content {
      padding: 32px 24px;
      background: #ffffff;
    }
    
    .form-group {
      margin-bottom: 24px;
    }
    
    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #374151;
    }
    
    .label-icon {
      font-size: 16px;
      opacity: 0.8;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    .text-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      font-family: inherit;
      background: #fafbfc;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }
    
    .text-input:focus {
      outline: none;
      border-color: #3b82f6;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }
    
    .text-input:hover {
      border-color: #d1d5db;
      background: #ffffff;
    }
    
    .textarea {
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
    }
    
    .text-input::placeholder {
      color: #9ca3af;
      font-style: italic;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
      padding: 20px 24px 24px;
      background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
      border-top: 1px solid #e2e8f0;
    }
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      min-width: 100px;
      justify-content: center;
    }
    
    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .action-btn:hover::before {
      left: 100%;
    }
    
    .save-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    
    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    
    .save-btn:active:not(:disabled) {
      transform: translateY(0);
    }
    
    .save-btn:disabled {
      background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
      cursor: not-allowed;
      box-shadow: none;
      opacity: 0.6;
    }
    
    .cancel-btn {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      color: #475569;
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .cancel-btn:hover {
      background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .btn-icon {
      font-size: 16px;
      font-weight: bold;
    }
    
    .btn-text {
      font-size: 14px;
    }
    
    /* RTL adjustments */
    .dialog-container {
      text-align: right;
    }
    
    .form-label {
      justify-content: flex-start;
    }
    
    @media (max-width: 480px) {
      .dialog-container {
        max-width: 100%;
        margin: 8px;
      }
      
      .dialog-content {
        padding: 24px 20px;
      }
      
      .dialog-actions {
        flex-direction: column-reverse;
        gap: 8px;
      }
      
      .action-btn {
        width: 100%;
      }
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