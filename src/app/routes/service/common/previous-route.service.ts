import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteService {
  private previousUrl: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.previousUrl = this.router.url;
      }
    });
  }

  getPreviousUrl(): string {
    return this.previousUrl;
  }
}
