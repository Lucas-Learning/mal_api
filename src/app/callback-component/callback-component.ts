import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth-service'
import { TokenResponse } from '../token-response';

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
      if (code) {
        this.http.post<TokenResponse>("http://localhost:3000/auth/callback", { code,state}).subscribe({
          next: (data) => {
            this.authService.setToken(data.access_token);
            this.router.navigate(['/main-page']);
          },
          error: (error) => console.error(error)
        })
      }
    })
  }
}
