import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "../components/login/login.component";
import { DashboardComponent } from "../components/dashboard/dashboard.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'drow-manager';
}
