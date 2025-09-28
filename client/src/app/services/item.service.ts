import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemFilter, ItemResponse, CreateItemData, ItemCategory } from '../models/item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = '/api/items';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getItems(filter?: ItemFilter): Observable<ItemResponse> {
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ItemResponse>(this.apiUrl, { params });
  }

  getItemById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  getItemsByCategory(category: ItemCategory, page: number = 1, limit: number = 10): Observable<ItemResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ItemResponse>(`${this.apiUrl}/category/${category}`, { params });
  }

  createItem(itemData: CreateItemData): Observable<{ message: string; item: Item }> {
    return this.http.post<{ message: string; item: Item }>(this.apiUrl, itemData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateItem(id: string, itemData: Partial<CreateItemData>): Observable<{ message: string; item: Item }> {
    return this.http.put<{ message: string; item: Item }>(`${this.apiUrl}/${id}`, itemData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  searchItems(query: string, page: number = 1, limit: number = 10): Observable<ItemResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ItemResponse>(this.apiUrl, { params });
  }
}