import { KeyValue } from '@angular/common';
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of, Observable, exhaustMap } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { GetProductsService } from './get-products/get-products.service';
import { Product, SearchProductResponse } from './get-products/products';

@Component({
  selector: 'app-search',
  templateUrl: './app.component.html',
  providers: [ GetProductsService ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('searchField') input : ElementRef<HTMLInputElement>

  title = 'projectSearch';

  constructor( private productGetter: GetProductsService) { }

  // The hashmap data structure allows for very fast searches because each key is hashed to a value between 0 and n-1 (n being the map's length)
  // The hash value maps to an address in memory and we do not have to look through the entire structure to find our key, unlike looking through a list
  productList : Product[] | undefined;

  searchResult : Product[] = [];
  searchControl = new FormControl();
  searchTerm = "";
  search$ = this.searchControl.valueChanges.pipe(
    tap(x => this.searchTerm = x),
    debounceTime(250),
    distinctUntilChanged()
  );

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  get totalPages() {
    return Math.ceil(this.searchResult.length / this.itemsPerPage);
  }

  // inner method
  getProductsFromService = () => {
    return this.productGetter.getProductList(this.productGetter.productUrl)
  }
  // outer method
  getProductList = () => {
    if(!this.productList) {
    return this.getProductsFromService().pipe(
      map(data => { return this.productList = data.content } )
      );
    } else
    return of(this.productList);
  }

  filterProducts(productArr : Product[] , searchTerm : string) {
    return productArr.filter(item => {
      return item.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase());
    })
  }

  // This is the search pipe.
    // search$ handles the search input and starts the pipeline, storing the search term for later
    // exhaustMap with getProductList loads the products, ignoring any new search inputs from the input stream
    // switchmap cancels any current filtering if I change the search term - after the product list has loaded
    // The pipe "pipes" data through itself, ensuring that the fast .filter method in filterProducts does not run before it has anything to filter.
  ngOnInit(): void {
    this.search$.pipe(
      exhaustMap(this.getProductList),
      tap(x => {this.productList = x as Product[]; this.searchResult = []; this.currentPage = 1 }),
      switchMap(data => this.filterProducts(data as Product[], this.searchTerm)),
    ).subscribe(data => {
      this.searchResult.push(data);
    })
  }

  // I attempted free text search but could not get it working in time. My thoughts on getting it working:
    // I would split search term and product.title into arrays.
    // Then I would create a double loop to compare each index and return the product for matching indexes
    // Ideally, I would then sort the resulting array by number of matches, to boost relevancy
  
}
