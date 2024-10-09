import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LayoutsService {
  sidebarOpen = new BehaviorSubject<boolean>(true);
  constructor() { }
}
