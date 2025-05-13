import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WorksheetService } from '../../services/worksheet.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

interface Worksheet {
  id: number;
  title: string;
  categoryName: string;
  averageRating: number;
}

@Component({
  selector: 'app-worksheet-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './worksheets-list.component.html',
  styleUrls: ['./worksheets-list.component.css']
})
export class WorksheetListComponent implements OnInit {
  worksheets: Worksheet[] = [];
  filteredWorksheets: Worksheet[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  categories: string[] = [];
  selectedCategory = '';
  sortOption = 'rating';
  worksheetToDelete: Worksheet | null = null;
  isDeleteModalOpen = false;
  isDeleting = false;

  constructor(private worksheetService: WorksheetService) {}

  ngOnInit(): void {
    this.loadWorksheets();
  }

  loadWorksheets(): void {
    this.isLoading = true;
    this.worksheetService.getAllWorksheetsWithRatings().subscribe({
      next: (data: Worksheet[]) => {
        this.worksheets = data;
        this.extractCategories();
        this.filterWorksheets();
        this.sortWorksheets();
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'שגיאה בטעינת גיליונות';
        console.error('שגיאה:', error);
        this.isLoading = false;
      }
    });
  }

  extractCategories(): void {
    // Extract unique categories from worksheets
    const categorySet = new Set<string>();
    this.worksheets.forEach(sheet => {
      if (sheet.categoryName) {
        categorySet.add(sheet.categoryName);
      }
    });
    this.categories = Array.from(categorySet);
  }

  filterWorksheets(): void {
    if (!this.selectedCategory) {
      this.filteredWorksheets = [...this.worksheets];
    } else {
      this.filteredWorksheets = this.worksheets.filter(
        sheet => sheet.categoryName === this.selectedCategory
      );
    }
    this.sortWorksheets();
  }

  sortWorksheets(): void {
    switch (this.sortOption) {
      case 'rating':
        this.filteredWorksheets.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'title':
        this.filteredWorksheets.sort((a, b) => a.title.localeCompare(b.title, 'he'));
        break;
      case 'category':
        this.filteredWorksheets.sort((a, b) => a.categoryName.localeCompare(b.categoryName, 'he'));
        break;
    }
  }



  getRatingCount(stars: number): number {
    return this.filteredWorksheets.filter(
      worksheet => Math.floor(worksheet.averageRating) === stars
    ).length;
  }

  getRatingPercentage(stars: number): number {
    const count = this.getRatingCount(stars);
    return this.filteredWorksheets.length > 0 
      ? (count / this.filteredWorksheets.length) * 100 
      : 0;
  }

  getAverageRating(): string {
    if (this.filteredWorksheets.length === 0) {
      return '0.0';
    }
    
    const sum = this.filteredWorksheets.reduce((total, sheet) => total + sheet.averageRating, 0);
    const average = sum / this.filteredWorksheets.length;
    
    return average.toFixed(1);
  }

  // פונקציות למחיקת גיליון
  openDeleteModal(worksheet: Worksheet): void {
    this.worksheetToDelete = worksheet;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    setTimeout(() => {
      this.worksheetToDelete = null;
    }, 300); 
  }

  confirmDelete(): void {
    if (!this.worksheetToDelete || this.isDeleting) return;
   
    const worksheetId = (this.worksheetToDelete.id);
    alert(worksheetId)
    this.isDeleting = true;
    
    this.worksheetService.deleteWorksheet(worksheetId).subscribe({
      next: () => {
        this.worksheets = this.worksheets.filter(w => w.id !== this.worksheetToDelete?.id);
        this.filterWorksheets();
        
        // Show success message
        this.successMessage = `הגיליון "${this.worksheetToDelete?.title}" נמחק בהצלחה`;
        this.closeDeleteModal();
        this.isDeleting = false;
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('שגיאה במחיקת הגיליון:', error);
        this.errorMessage = 'שגיאה במחיקת הגיליון';
        this.closeDeleteModal();
        this.isDeleting = false;
        
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  // הסרת הודעת הצלחה או שגיאה
  clearMessage(type: 'success' | 'error'): void {
    if (type === 'success') {
      this.successMessage = '';
    } else {
      this.errorMessage = '';
    }
  }
}
