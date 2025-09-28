import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private baseUrl = 'http://localhost:5000/api/items';

  constructor(private http: HttpClient) { }

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl);
  }

  getItemById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }
}
