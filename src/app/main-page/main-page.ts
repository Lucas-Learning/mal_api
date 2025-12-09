import { Component, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage implements OnInit {
  constructor(private http: HttpClient) {}
  Token = sessionStorage.getItem('access_token');
  //maybe make an interface for this
  animeList = signal<any[]>([]);
  fullAnimeList = signal<any[]>([]);
  currentFilter = signal<'all' | 'completed' | 'watching' | 'on_hold' | 'dropped'>('all');

  ngOnInit() {
    this.http.get<any>("http://localhost:3000/myanimelist/list", {
      headers: {
        Authorization: `Bearer ${this.Token}`,
      }
    }).subscribe({ 
      next: (AnimeData) => {
        this.fullAnimeList.set(AnimeData.data);
        this.setFilter('all');
      },
      error: (error) => console.error(error)
  });
  }
  setFilter(filter: 'all' | 'completed' | 'watching' | 'on_hold' | 'dropped') {
    this.currentFilter.set(filter);

    if (filter === 'all') {
      this.animeList.set(this.fullAnimeList());
      return;
    }
    this.animeList.set(this.fullAnimeList().filter(a => a.list_status.status === filter));
  }
}
