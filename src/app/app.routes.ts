import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { WorksheetListComponent } from '../components/worksheets-list/worksheets-list.component';
import { CategoryListComponent } from '../components/category-list/category-list.component';
import { FileUploadComponent } from '../components/file-upload/file-upload.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'rangs', component: WorksheetListComponent },
  { path: 'categories', component: CategoryListComponent },
  { path: 'fileUpload', component: FileUploadComponent },
  { path: '**', redirectTo: '' }  // ברירת מחדל אם הנתיב לא נמצא
];

// תצטרך לייצר או לייבא את הקומפוננטות הללו
export class CategoriesComponent {
  template = '<h1>ניהול קטגוריות</h1>';
}

export class WorksheetsComponent {
  template = '<h1>ניהול דפי עבודה</h1>';
}

export class RankingsComponent {
  template = '<h1>צפיה בדירוגים</h1>';
}