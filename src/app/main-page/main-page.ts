import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {
  constructor(private http: HttpClient) {}
  Token = sessionStorage.getItem('access_token');
  //maybe make an interface for this
  animeList = signal<any[]>([]);
  getList() {
    this.http.get<any>("http://localhost:3000/myanimelist/list", {
      headers: {
        Authorization: `Bearer ${this.Token}`,
      }
    }).subscribe({ 
      next: (AnimeData) => {
        console.log("anime list", AnimeData);
        this.animeList.set(AnimeData.data);
        console.log("anime list signal", this.animeList());


      },
      error: (error) => console.error(error)
  });
  }
  }
