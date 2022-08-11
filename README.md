# NGRX-Traits

NGRX Traits is a library to help you compose and reuse a set ngrx actions, selectors, effects and reducers across your app.

# Features

- ✅ Reduce boilerplate with generated strongly typed actions, selectors, reducers, and effects.
- ✅ Easily mix with your own actions, selectors, reducers, and effects
- ✅ Create your own traits, to easily reuse business logic
- ✅ Transform any trait config from a global store to a local store bound to a components lifecycle
- ✅ Trait to load entities list
- ✅ Trait to filter remote and locally entities list
- ✅ Trait to sort remote and locally entities list
- ✅ Trait to paginate entities list
- ✅ Trait to add single or multi selection entities list
- ✅ Trait to add crud operations to an entities list
- ✅ Trait to load single entities
- ✅ Trait to reduce boilerplate needed when calling backend apis
- ✅ Trait to set a value in the store 
- ✅ Caching

## Table of Contents

### [Getting Started](#getting-started)

### [Playground](https://stackblitz.com/edit/ngrx-traits-playground?file=src%2Fapp%2Fproduct-list-page%2Fstate%2Fproducts%2Fproducts.traits.ts)

### [Videos](https://youtube.com/playlist?list=PL2tNsdEpssGcxOct3kNA7p84TLzI4gYo0)

### [Extensible Setup](#extensible-setup-1)

### [Local store traits](libs/ngrx-traits/core/src/lib/local-store/README.md)

### [Custom Traits](libs/ngrx-traits/common/src/lib/custom-traits.md)

### [Examples](apps/example-app/src/app/examples)

### [Caching](libs/ngrx-traits/core/src/lib/cache/README.md)

### [Core API](libs/ngrx-traits/core/api-docs.md)

### [Common Traits API](libs/ngrx-traits/common/api-docs.md)
## Installation

Besides angular, you will need to have ngrx installed with this lib you can do so with: 
```
npm i @ngrx/{store,effects,entity} --save
```
Now install ngrx-traits like:
```
npm i @ngrx-traits/{core,common} --save
```

> **ngrx-traits versions** 
>
> Although we use semantic versioning to do releases,  the mayor number on the version is link to the angular and ngrx versions this project depends on, e.g.  ngrx-traits 13.x will depend on ngrx 13.x and angular 13.x, this is so you can easily choose the right version for your current setup, but also facilitates doing patches to older versions 

## Getting Started

The best way to understand how to use the traits is to see an example. Let's imagine that you need to implement a page that shows a list of products which you can selectEntity and purchase. Start by creating the interface for a Product Entity:

```ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}
```

The next step is to create our traits file. We have two ways to configure them, one which we call minimal setup, that is better suited for cases where you don't intend to mix the generated actions,selectors, reducers, effects of your traits with your own normal ngrx action, selectors, reducer,effects and is the chosen one for this guide because is more compact (the extensible setup is design to mix it with normal ngrx actions, reducers, etc, you can see more [here](#extensible-setup)). The traits config for both cases is best to be contained in its own file with a _.traits.ts_ extension with a content like:

#### products-basket.traits.ts

```ts
import { createFeatureSelector } from '@ngrx/store';
import { createEntityFeatureFactory } from '@ngrx-traits/core';
import { addLoadEntitiesTrait } from '@ngrx-traits/common';

export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>() //<-- trait
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products', // or createFeatureSelector<ProductsState>('products'), see Extensible setup section
});
```

The `createEntityFeatureFactory` first parameter is `{entityName: 'product'}`, this provides entityName , entitiesName (optional and default to the entityName + 's') to be use in the generated actions and selectors. Then you need to provide one or more trait functions.

A trait function will provide the actions, selectors, reducer and effects needed by a trait,  for example addLoadEntitiesTrait, returns the actions,selector, ...etc for loading entities with a reducer that stores the result on success and tracks the progress of the request in a status property, if you add addSortEntitiesTrait it will add actions, selectors etc to sort the result.

Then `createEntityFeatureFactory` will return a function that when is executed will mix actions, selectors, ...etc return by the traits.

The return function of `createEntityFeatureFactory` requires two params the `actionsGroupKey` is the prefix that we will be added to all action types generated by the factory, which makes them unique. `featureSelector` is the base selector our trait selectors will join using createSelector , if instead of createFeatureSelector you provide a string it will be use as key for a createFeatureSelector internally. It only makes sense to provide your own selector if you are using the [extensible setup](#extensible-setup).


To check what was created by the factory, using your preferred IDE intellisense, inspect the `productFeature` variable

- selectors
- actions
- initialState
- reducer
- effects


Choosing actions and inspecting it, you will see a list of actions with `loadProducts`, `loadProductsSuccess`, `loadProductsFail`, and in selectors you will see `isLoadingProducts`, `selectProductsList`, `selectProductsIds`. I'll give a brief explanation of some of them, the rest can be seen in the docs of each trait.

The most important ones you will see are the loadProducts actions. They are meant to create an effect that will populate the state. These actions are also used by other entities related traits like addFilterEntitiesTrait, addSortEntitiesTrait, addEntitiesPaginationTrait, to load entities data when needed. Let's do one for our product list:

It is advised to export the actions and selectors in the traits file, so we can use them in the effect.

```ts
// in products-basket.traits.ts
export const ProductActions = productFeature.actions;
export const ProductSelectors = productFeature.selectors;
```

Now we create our effect that call the backend and populates our state :
#### products.effects.ts

```ts
import { ProductActions } from './products-basket.traits.ts';

@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        //call your service to get the products data
        this.productService.getProducts().pipe(
          map((res) =>
            ProductActions.loadProductsSuccess({ entities: res.resultList })
          ),
          catchError(() => of(ProductActions.loadProductsFail()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

To be able to use the traits, we must create a module to connect the effects and reducers generated to the store:

```ts
@NgModule({
  imports: [
    EffectsModule.forFeature([...productFeature.effects, ProductsEffects]),
    StoreModule.forFeature('products', productFeature.reducer),
  ],
})
export class ProductsStateModule {}
```

Notice how the reducer generated by **productFeature** is used and the traits effects are combined with the ProductEffects manually created.

Next, just install the ProductsStateModule and use the actions and selectors in the products container component.

#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isLoadingProducts),
  ]).pipe(map(([products, isLoading]) => ({ products, isLoading })));
  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <product-list [data]="data.products"></product-list>
  </ng-template>
</ng-container>
```

A simple product list is now ready and loaded. 
To keep this intro brief it's not intended to show much of the internals of the presentational components that are being used (can be found on the example folder).
[Examples](apps/example-app/src/app/examples)

In order for the selection to work:
  * add the addSelectEntityTrait trait
  

Now we want to logic selectEntity a product in the list , for that add the addSelectEntityTrait trait:
#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  // new trait ↓
  addSelectEntityTrait<Product>()
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```
The result is a new `selectProduct` action and a `selectProductSelected` selector. Notice how this new actions and selectors are mixed with the others, the more traits you add, more actions, selectors, ...etc are mixed, this composability is very porweful, you can go from a local filtered list to a remotely paginated and remotely filtered one with small changes, and it will work the same way with your own custom traits.

Next step is to change the container component to use the new selectEntity action,
for this example, it is assumed that a selectEntity output was added as a prop of the list component called on the click of the row, the container will now look like:
#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isLoadingProduct),
  ]).pipe(map(([products, isLoading]) => ({ products, isLoading })));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }
  // new event handler ↓
  selectEntity(id: string) {
    this.store.dispatch(ProductActions.selectEntity({ id }));
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <!-- new selectEntity event ↓ -->
    <product-list
      [data]="data.products"
      (selectEntity)="selectEntity($event)"
    ></product-list>
  </ng-template>
</ng-container>
```

Next step will be to add a checkout button, for that we can use the addAsyncActionTrait, which again can save some boilerplate. 

#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  // new trait ↓
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  })
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

Checking the productFeature.actions, `checkout()`, `checkoutSuccess({orderId:string})` and `checkoutFail()` are now present, and in the selectors  `isLoadingCheckout()`, `isSuccessCheckout()` and `isFailCheckout()` can be found. These are the typical 3 actions and 3 selectors that are needed to do a backend call, for more details check the docs of the addAsyncActionTrait trait. <!-- TODO Paste link to addAsyncTrait  -->

Next, use them in an effect and in the container component:


#### products.effects.ts

```ts
checkout$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ProductActions.checkout),
    concatLatestFrom(() =>
      this.store.select(ProductSelectors.selectProductSelected)
    ),
    exhaustMap((product) =>
      this.productService.checkout({ productId: product.id }).pipe(
        map((orderId) => ProductActions.checkoutSuccess({ orderId })),
        catchError(() => of(ProductActions.checkoutFail()))
      )
    )
  )
);
```

And add the button to the component:
#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isLoadingProducts),
    // new selectors ↓
    this.store.select(ProductSelectors.selectProductSelected),
    this.store.select(ProductSelectors.isLoadingCheckout),
  ]).pipe(
    map(([products, isLoading, selectedProduct, isLoadingCheckout]) => ({
      products,
      isLoading,
      selectedProduct,
      isLoadingCheckout,
    }))
  );

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  selectEntity(id: string) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
  }
  // new event handler ↓
  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <product-list
      [data]="data.products"
      (selectEntity)="selectEntity($event)"
    ></product-list>
  </ng-template>
  <!-- new checkout button ↓ -->
  <button
    type="submit"
    [disabled]="!data.selectedProduct || data.isLoadingCheckout"
    (click)="checkout()"
  >
    <mat-spinner *ngIf="data.isLoadingCheckout"></mat-spinner>
    Checkout
  </button>
</ng-container>
```

The next requirement in this context could be to add a filter section at the top to search by name or description, and sort the results. 
To start with the filters, create an interface that represents that filter form

```ts
export interface ProductFilter {
  search: string;
}
```

Then add the addFilter trait:

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  // new trait ↓
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      // filter function for local filtering
      return (
        entity.name.includes(filter.search) ||
        entity.description.includes(filter.search)
      );
    },
  })
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

This includes a new `filterProducts` action and a `selectProductsFilter` selector.

Next, change the container component to use the new filter action. 
Implement a presentational component for the filter section that has and input box for the search. The changes of that field will be piped to the output prop called search, this changes the container to look like:

#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isLoadingProduct),
    this.store.select(ProductSelectors.selectProductSelected),
    this.store.select(ProductSelectors.isLoadingCheckout),
  ]).pipe(map(([products, isLoading]) => ({ products, isLoading })));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  selectEntity(id: string) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }
  // new event handler ↓
  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filterProducts({ filters }));
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <!-- new search event ↓ -->
    <products-search-form (search)="filter($event)"></products-search-form>
    <product-list
      [list]="data.products"
      (selectProduct)="selectEntity($event)"
    ></product-list>
  </ng-template>
  <button
    type="submit"
    [disabled]="!data.selectedProduct || data.isLoadingCheckout"
    (click)="checkout()"
  >
    <mat-spinner *ngIf="data.isLoadingCheckout"></mat-spinner>
    Checkout
  </button>
</ng-container>
```

One great benefit of using the filter trait is that it already contains debouncing and distinct until change, meaning that, there is no need to implement it in the form component, making it easier to test and saving you some code.

Next stop, sorting. Let's first add addSortEntitiesTrait :
#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return entity.name.includes(filter.search);
    },
  }),
  // ↓ new trait
  addSortEntitiesTrait<Product>()
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

That's it,  the `sortProducts` action and the `selectProductsSort` selector have been added, you just need to use it. By default, it does local sorting (remote sorting can also be done, but for simplicity we choose local)
Next, add it to the component

#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    this.store.select(ProductSelectors.selectProductsList),
    this.store.select(ProductSelectors.isLoadingProduct),
    this.store.select(ProductSelectors.selectProductSelected),
    this.store.select(ProductSelectors.isLoadingCheckout),
  ]).pipe(map(([products, isLoading]) => ({ products, isLoading })));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  selectEntity(id: string) {
    this.store.dispatch(ProductActions.selectEntity({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filter({ filters }));
  }
  // new event handler ↓
  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sort(sort));
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <products-search-form (search)="filter($event)"></products-search-form>
    <!-- new sort event ↓ -->
    <product-list
      [list]="data.products"
      (selectEntity)="selectEntity($event)"
      (sort)="sort($event)"
    ></product-list>
  </ng-template>
  <button
    type="submit"
    [disabled]="!data.selectedProduct || data.isLoadingCheckout"
    (click)="checkout()"
  >
    <mat-spinner *ngIf="data.isLoadingCheckout"></mat-spinner>
    Checkout
  </button>
</ng-container>
```

That's all great, but after a meeting with the backend devs it was decided that the product list is growing too much so better if we implement remote pagination, and if we do pagination that means sorting and filtering also need to be implemented in the backend, lets start with remote filtering.
To do remote filtering you first need to remove the filterFn in the traits like:
#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  // changed trait ↓
  addFilterEntitiesTrait<Product, ProductFilter>(),
  addSortEntitiesTrait<Product>()
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

And to change our effect, it needs to use the selectProductsFilter selector to get the filter params of the search:
#### products.effects.ts

```ts
@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      concatLatestFrom(() =>
        // get filters ↓
        this.store.select(ProductSelectors.selectProductsFilter)
      ),
      switchMap(([_, filters]) =>
        //call your service to get the products data
        this.productService
          .getProducts({
            search: filters.search,
          })
          .pipe(
            map((res) =>
              ProductActions.loadProductsSuccess({ entities: res.resultList })
            ),
            catchError(() => of(ProductActions.loadProductsFail()))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

Now lets use remote sort, in our traits we add the remote param as true
#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addFilterEntitiesTrait<Product, ProductFilter>(),
  // changed trait ↓
  addSortEntitiesTrait<Product>({ remote: true })
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

Now we use our selectProductsSort in the effect , like we did with selectProductsFilter:
#### products.effects.ts

```ts
@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts), // on loadEntities
      concatLatestFrom(() => [
        this.store.select(ProductSelectors.selectProductsFilter),
        // get sorting ↓
        this.store.select(ProductSelectors.selectProductsSort),
      ]),
      switchMap(([_, filters, sort]) =>
        //call your service to get the products data
        this.productService
          .getProducts({
            search: filters.search,
            sortColumn: sort.active,
            sortAcsending: sort.direction === 'asc',
          })
          .pipe(
            map((res) =>
              ProductActions.loadProductsSuccess({ entities: res.resultList })
            ),
            catchError(() => of(ProductActions.loadProductsFail()))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

Notice no changes are needed on the component side for sorting or filtering to make them remote.

Now last thing is pagination, we add the addEntitiesPaginationTrait to the traits like:
#### products-basket.traits.ts

```ts
export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return !filter.search  || entity.name.toLowerCase().includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({ remote: true }),
  // new trait ↓
  addEntitiesPaginationTrait<Product>()
)({
  actionsGroupKey: '[Products]',
  featureSelector: 'products',
});
```

This gives a bunch of extra actions and selectors, for this guide we will only use `loadProductsPage({index: number})` action and the `selectProductsCurrentPage` and `selectProductsPageRequest` selectors , lets start with `selectProductsPageRequest`, this is used in the effect to get pagination details for a backend request:
#### products.effects.ts

```ts
@Injectable()
export class ProductsEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts), // on loadEntities
      concatLatestFrom(() => [
        this.store.select(ProductSelectors.selectProductsFilter),
        this.store.select(ProductSelectors.selectProductsSort),
        // get pagination details for the request ↓
        this.store.select(ProductSelectors.selectProductsPageRequest),
      ]),
      switchMap(([_, filters, sort, pagination]) =>
        //call your service to get the products data
        this.productService
          .getProducts({
            search: filters.search,
            sortColumn: sort.active,
            sortAscending: sort.direction === 'asc',
            skip: pagination.startIndex,
            take: pagination.size,
          })
          .pipe(
            map((res) =>
              ProductActions.loadProductsSuccess({ entities: res.resultList, total: res.total })
            ),
            catchError(() => of(ProductActions.loadProductsFail()))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

Now that we have our effect ready , lets change our container component to use the new actions and selectors

#### product-page.component.ts

```ts
@Component({
  selector: 'product-page',
  templateUrl: './product-page.component.html',
})
export class ProductPageContainerComponent implements OnInit {
  data$ = combineLatest([
    // changed selectAll for selectPage ↓
    this.store.select(ProductSelectors.selectProductsCurrentPage),
    this.store.select(ProductSelectors.isLoadingProduct),
    this.store.select(ProductSelectors.selectProductSelected),
    this.store.select(ProductSelectors.isLoadingCheckout),
  ]).pipe(map(([products, isLoading]) => ({ products, isLoading })));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  selectEntity(id: string) {
    this.store.dispatch(ProductActions.selectProduct({ id }));
  }

  checkout() {
    this.store.dispatch(ProductActions.checkout());
  }

  filter(filters: ProductFilter) {
    this.store.dispatch(ProductActions.filterProducts({ filters }));
  }

  sort(sort: Sort<Product>) {
    this.store.dispatch(ProductActions.sortProducts(sort));
  }
  // new event handler ↓
  loadPage(page: PageEvent) {
    this.store.dispatch(ProductActions.loadProductsPage({ index: page.pageIndex }));
  }
}
```

#### product-page.component.html

```html
<ng-container *ngIf="data$ | async as data">
  <mat-spinner *ngIf="data.isLoading; else listProducts"></mat-spinner>
  <ng-template #listProducts>
    <products-search-form (search)="filter($event)"></products-search-form>
    <!-- new page event ↓ -->
    <product-list
      [data]="data.products"
      (selectEntity)="selectEntity($event)"
      (sort)="sort($event)"
      (page)="loadPage($event)"
    ></product-list>
  </ng-template>
  <button
    type="submit"
    [disabled]="!data.selectedProduct || data.isLoadingCheckout"
    (click)="checkout()"
  >
    <mat-spinner *ngIf="data.isLoadingCheckout"></mat-spinner>
    Checkout
  </button>
</ng-container>
```

The selectProductsCurrentPage returns an object with following interface

```ts
export interface PageModel<T> {
  entities: T[];
  pageIndex: number;
  total: number | undefined;
  pageSize: number;
  pagesCount: number | undefined;
  hasPrevious: boolean;
  hasNext: boolean;
}
```

The entities you should use to render the rows of your table, and the rest of the object can be pass to your paginator component, the `loadProductsPage` action should be call by your paginator component when someone changes the page using the paginator, like hitting a next button, or last page, in doubt check the presentational components in the examples.

## Extensible Setup

In this section we will explain how to mix your traits generated actions, selectors, etc with your own manually created ones, for this we use a very opinionated structure that we recommend, the goal is not only make it easy to extend your store but also avoid circular dependencies, which can happen easily due the traits been needed in many files. Also, we will create a schematic that generates this structure for you in the future, this is based on a ngrx feature schematic, just enhanced to use the traits.

You can see an example of it [here](apps/example-app/src/app/examples/product-list-paginated-page/state/products-extensible-setup)

### Structure
The preferred structure we like to use is to create a state folder with a folder per subject or feature, which all the actions,selector etc inside, for example following the previous products case:

```
state/
    products/
          products.state.ts
          products.traits.ts
          products.actions.ts
          products.selectors.ts
          products.reducer.ts
          products.effects.ts
          products-state.module.ts
          index.ts
    featureX/
          featureX.state.ts
          featureX.traits.ts
          featureX.actions.ts
          .
          .
```

### State

The **.state.ts** file is where we will add the state interface, and we will add the extra props we want for our manually created reducer for example, lets create a interface that represents our state and add a discountCode prop.

#### products.state.ts

```ts

export interface ProductsState
  extends LoadEntitiesState<Product>,
    FilterEntitiesState<ProductFilter>,
    SortEntitiesState<Product>,
    EntitiesPaginationState {
  discountCode?: string; // <-- new prop for our custom reducer and actions
  //... anything else you need
}
```
Notice that, generally each trait  `add[TraitName]Trait` has a `[TraitName]State`, (also has `[TraitName]Actions` and `[TraitName]Selectors`, but those are only needed for custom traits). So create and interface and make it extends from as many [TraitName]State as traits you added in the .traits.ts file, and then add the extra props you need

### Traits

The **.traits.ts** file is where we will add all the traits config, and the base selector for the state:

#### products-basket.traits.ts

```ts
export const selectProductState =
  createFeatureSelector<ProductsState>('products');

export const productFeature = createEntityFeatureFactory(
  {entityName: 'product'},
  addLoadEntitiesTrait<Product>(),
  addSelectEntityTrait<Product>(),
  addAsyncActionTrait({
    name: 'checkout',
    actionSuccessProps: props<{ orderId: string }>(),
  }),
  addFilterEntitiesTrait<Product, ProductFilter>({
    filterFn: (filter, entity) => {
      return !filter.search  || entity.name.includes(filter.search.toLowerCase());
    },
  }),
  addSortEntitiesTrait<Product>({ remote: true }),
  addEntitiesPaginationTrait<Product>()
)({
  actionsGroupKey: '[Products]',
  featureSelector: selectProductState,
});
```

Notice that instead if `featureSelector: 'products'`  we have selectProductState and is exported and using the State interface we created in the previous step, that is here mainly to avoid a circular dependency issue between products.trait.ts and products.selectors.ts, you will understand better in the selectors section.

### Actions

Notice now how we mix the generated and manually created actions

#### products.actions.ts

```ts
import { productFeature } from './products-basket.traits.ts';
// we destruct the generated actions so they get mixed with the normal ones
// it also allows us to only expose some actions, or rename them.
export const {
  loadProducts: loadMyProducts, // rename example
  selectProduct,
  loadProductsSuccess,
  loadProductsFail,
  filterProducts,
  sortProducts,
  loadProductsPage,
  checkout,
  checkoutSuccess,
  checkoutFailure,
} = productFeature.actions;

export const setDiscountCode = createAction(
  '[Products ]',
  props<{ code: string }>()
);
```

### Selectors

Notice now how we mix the generated and manually created selectors

#### products.selectors.ts

```ts
import { productFeature, selectProductState } from './products-basket.traits.ts';
// we destruct the generated selectors so they get mixed with the normal ones
// it also allows us only expose some selectors, or rename them.
export const {
  selectProductsList,
  selectProductSelected: selectMyProductSelected, // rename example
  selectProductsFilters,
  selectProductsSorting,
  selectProductsPagedRequest,
  isLoadingCheckout,
} = productFeature.selectors;

export const selectDiscountCode = createSelector(
  selectProductState,
  (state) => state.discountCode
);
```

Notice if we had created selectProductState here instead of in the traits file , you will be getting a circular dependency between the two.

### Reducers

Here you just need to notice how we mix the reducers, and the initialStates

#### products.reducer.ts

```ts
import { productFeature, selectProductState } from './products-basket.traits.ts';
import { createReducer } from '@ngrx/store';
import * as ProductActions from './products.actions.ts';

const initialState: ProduceState = {
  ...productFeature.initialState,
  discountCode: '',
};
//normal ngrx reducer
const myReducer = createReducer(
  initialState,
  on(ProductActions.setDiscountCode, (state, { code }) => ({
    ...state,
    discountCode: code,
  }))
);
// mixing our productFeature reducers with myReducer
export function productsReducer(state = initialState, action: Action) {
  const s = myReducer(state, action);
  return productFeature.reducer(s, action);
}
// the previous function is the same as using the helper function
// export const productsReducer = joinReducers(myReducer,productFeature.reducer);
```

### Effects

There is nothing special here related to traits, just be sure to add them to a EffectsModule.forFeature mixed with the traits ones like is shown in the next section, also use relative path to actions and selectors from the products.actions.ts, and products.selectors.ts, don't import them from the barrel file, or you will get a circular dependency.

### Module

Here we show how we setup the reducer and effects in the module

#### products-state.module.ts

```ts
import { productsTraits } from './products-basket.traits.ts';
import { ProductsEffects } from './products.effects.ts';
import { productsReducer } from './products.reducer.ts';
@NgModule({
  imports: [
    EffectsModule.forFeature([...productFeature.effects, ProductsEffects]),
    StoreModule.forFeature('products', productFeature.reducer),
  ],
})
export class ProductsStateModule {}
```

We particularly like to add a module in each feature state folder, makes them easier to move if needed

### Barrel file

Finally, the index.ts file where we just re-export our actions and selectors like

#### index.ts

```ts
import * as ProductActions from './products.actions.ts';
import * as ProductSelectors from './products.selectors.ts';
export { ProductActions, ProductSelectors };
```
