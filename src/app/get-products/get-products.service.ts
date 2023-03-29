import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry, take } from 'rxjs/operators';

import { Product, SearchProductResponse } from './products';



@Injectable({
  providedIn: 'root'
})
export class GetProductsService {
  productUrl = 'assets/products.json'

  constructor(private http : HttpClient) { }


  getProductList(input : string) {
    return this.http.get<SearchProductResponse>(input)
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);         //client-side error
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
