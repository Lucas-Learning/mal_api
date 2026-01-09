import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service'

@Component({
  selector: 'app-callback-component',
  imports: [],
  templateUrl: './callback-component.html',
  styleUrl: './callback-component.css',
})
export class CallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router, private authService: AuthService) {}
  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
        this.router.navigate([], { replaceUrl: true });
      if (code) {
        this.http.post<{ sessionId: string }>("http://localhost:3000/auth/callback", {code,state}).subscribe({
          next: (data) => {
            this.authService.setSessionId(data.sessionId);
            this.router.navigate(['/main-page'], { replaceUrl: true });
          },
          error: (error) => {  this.router.navigate(['/home'], { replaceUrl: true}), console.error(error)}
        
        })
      }
    })
  }
}
