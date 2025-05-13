import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Category, CategoryService } from '../../services/category.service';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatRippleModule,
    MatDividerModule  ],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(15px)' }),
          stagger('60ms', animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(15px)' }))
        ], { optional: true })
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  editMode: { [id: number]: boolean } = {};
  editedCategory: { [id: number]: Category } = {};
  filterText = '';
  themeColors = {
    primary: '#1E88E5', // כחול
    secondary: '#8c9da8', // אפור-ירקרק
    accent: '#f4b2db'    // ורוד בהיר
  };

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        // הוסף אנימציה ע"י עיכוב קל בהצגת הנתונים
        setTimeout(() => {
          this.categories = data;
          this.loading = false;
        }, 300);
      },
      error: () => {
        this.error = 'שגיאה בטעינת הקטגוריות';
        this.loading = false;
        this.showNotification('שגיאה בטעינת הקטגוריות', 'error');
      }
    });
  }

  openCreateCategoryDialog(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { 
        title: 'יצירת קטגוריה חדשה',
        themeColors: this.themeColors
      },
      panelClass: 'modern-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createNewCategory(result);
      }
    });
  }

  createNewCategory(categoryData: Category): void {
    this.loading = true;
    this.categoryService.createCategory(categoryData).subscribe({
      next: (newCategory) => {
        this.categories = [...this.categories, newCategory];
        this.loading = false;
        this.showNotification('הקטגוריה נוצרה בהצלחה', 'success');
      },
      error: () => {
        this.error = 'יצירת הקטגוריה נכשלה';
        this.loading = false;
        this.showNotification('יצירת קטגוריה נכשלה', 'error');
      }
    });
  }

  deleteCategory(id: number, categoryName: string): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      direction: 'rtl',
      data: { 
        title: 'מחיקת קטגוריה',
        confirmDelete: true,
        categoryName: categoryName,
        themeColors: this.themeColors
      },
      panelClass: 'modern-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.performDelete(id);
      }
    });
  }

  performDelete(id: number): void {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== id);
        this.showNotification('הקטגוריה נמחקה בהצלחה', 'success');
      },
      error: () => {
        this.showNotification('מחיקה נכשלה', 'error');
      }
    });
  }

  enableEdit(category: Category): void {
    // סגור כל עריכה אחרת שפתוחה
    Object.keys(this.editMode).forEach(key => {
      if (this.editMode[+key]) {
        this.cancelEdit(+key);
      }
    });
    
    this.editMode[category.id!] = true;
    this.editedCategory[category.id!] = { ...category };
  }

  cancelEdit(id: number): void {
    this.editMode[id] = false;
    delete this.editedCategory[id];
  }

  saveCategory(id: number): void {
    const updated = this.editedCategory[id];
    this.categoryService.updateCategory(id, updated).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === id);
        this.categories = [
          ...this.categories.slice(0, index),
          updatedCategory,
          ...this.categories.slice(index + 1)
        ];
        this.cancelEdit(id);
        this.showNotification('הקטגוריה עודכנה בהצלחה', 'success');
      },
      error: () => {
        this.showNotification('עדכון נכשל', 'error');
      }
    });
  }

  get filteredCategories(): Category[] {
    if (!this.filterText) return this.categories;
    return this.categories.filter(cat => 
      cat.categoryName.toLowerCase().includes(this.filterText.toLowerCase()) || 
      cat.description?.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'סגור', {
      duration: 3000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }

  getCategoryColor(index: number): string {
    const colors = [
      this.themeColors.primary,
      this.themeColors.secondary,
      this.themeColors.accent
    ];
    return colors[index % colors.length];
  }
}