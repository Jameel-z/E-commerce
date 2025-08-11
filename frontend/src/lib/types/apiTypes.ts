// src/lib/types/apiTypes.ts

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Body_login_for_access_token_users_token_post */
export interface BodyLoginForAccessTokenUsersTokenPost {
  /** Grant Type */
  grant_type?: string | null;
  /** Username */
  username: string;
  /**
   * Password
   * @format password
   */
  password: string;
  /**
   * Scope
   * @default ""
   */
  scope?: string;
  /** Client Id */
  client_id?: string | null;
  /**
   * Client Secret
   * @format password
   */
  client_secret?: string | null;
}

/**
 * Cart
 * Complete cart schema with timestamp inheritance
 */
export interface Cart {
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id: number;
  /** User Id */
  user_id?: number | null;
  /**
   * Items
   * List of items in the cart
   */
  items?: CartItem[];
  /**
   * Total Price
   * Calculated total price of all items
   * @default 0
   */
  total_price?: number;
}

/**
 * CartItem
 * Complete cart item schema with product details
 */
export interface CartItem {
  /**
   * Product Id
   * ID of the product being added to cart
   */
  product_id: number;
  /**
   * Quantity
   * Quantity must be a positive integer
   * @exclusiveMin 0
   * @default 1
   */
  quantity?: number;
  /** Id */
  id: number;
  /** Complete product schema for API responses */
  product: Product;
  /**
   * Added At
   * When the item was added to cart
   * @format date-time
   */
  added_at?: string;
  /**
   * Updated At
   * When the item was last updated
   */
  updated_at?: string | null;
}

/**
 * CartItemCreate
 * Schema for creating new cart items
 */
export interface CartItemCreate {
  /**
   * Product Id
   * ID of the product being added to cart
   */
  product_id: number;
  /**
   * Quantity
   * Quantity must be a positive integer
   * @exclusiveMin 0
   * @default 1
   */
  quantity?: number;
}

/**
 * CartUpdate
 * Schema for updating cart items with action-based modifications
 */
export interface CartUpdate {
  /**
   * Action
   * Action to perform: set, increment, decrement, or remove
   * @pattern ^(set|increment|decrement|remove)$
   */
  action: string;
  /**
   * Product Id
   * ID of the product to modify
   */
  product_id: number;
  /**
   * Quantity
   * Quantity to set or adjust by
   * @exclusiveMin 0
   * @default 1
   */
  quantity?: number;
}

/**
 * Category
 * Complete category schema for API responses
 * @example {"description":"Devices and accessories","id":1,"name":"Electronics"}
 */
export interface Category {
  /**
   * Name
   * Unique category name
   * @minLength 2
   * @maxLength 50
   * @pattern ^[a-zA-Z0-9\-_ ]+$
   */
  name: string;
  /**
   * Description
   * Brief category description
   */
  description?: string | null;
  /** Id */
  id: number;
}

/**
 * CategoryCreate
 * Schema for creating new categories
 */
export interface CategoryCreate {
  /**
   * Name
   * Unique category name
   * @minLength 2
   * @maxLength 50
   * @pattern ^[a-zA-Z0-9\-_ ]+$
   */
  name: string;
  /**
   * Description
   * Brief category description
   */
  description?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/**
 * Product
 * Complete product schema for API responses
 * @example {"category_id":3,"created_at":"2025-01-01T00:00:00","description":"Noise-cancelling Bluetooth headphones...","id":1,"name":"Premium Wireless Headphones","price":199.99,"stock_quantity":50,"updated_at":"2025-01-02T00:00:00"}
 */
export interface Product {
  /**
   * Name
   * @minLength 2
   * @maxLength 100
   */
  name: string;
  /** Description */
  description?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id: number;
  /** Price */
  price: string;
  /** Stock Quantity */
  stock_quantity: number;
  /** Category Id */
  category_id: number;
}

/**
 * ProductCreate
 * Schema for product creation
 */
export interface ProductCreate {
  /**
   * Name
   * @minLength 2
   * @maxLength 100
   */
  name: string;
  /** Description */
  description?: string | null;
  /** Price */
  price: number;
  /**
   * Stock Quantity
   * @min 0
   */
  stock_quantity: number;
  /** Category Id */
  category_id: number;
}

/**
 * ProductUpdate
 * Schema for partial product updates
 */
export interface ProductUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Price */
  price?: number | string | null;
  /** Stock Quantity */
  stock_quantity?: number | null;
  /** Category Id */
  category_id?: number | null;
}

/**
 * ProductWithCategory
 * Extended product schema with category details
 * @example {"category":{"id":3,"name":"Electronics"},"category_id":3,"created_at":"2025-01-01T00:00:00","description":"Noise-cancelling Bluetooth headphones...","id":1,"name":"Premium Wireless Headphones","price":199.99,"stock_quantity":50,"updated_at":"2025-01-02T00:00:00"}
 */
export interface ProductWithCategory {
  /**
   * Name
   * @minLength 2
   * @maxLength 100
   */
  name: string;
  /** Description */
  description?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id: number;
  /** Price */
  price: string;
  /** Stock Quantity */
  stock_quantity: number;
  /** Category Id */
  category_id: number;
  /** Complete category schema for API responses */
  category: Category;
}

/** Token */
export interface Token {
  /** Access Token */
  access_token: string;
  /**
   * Token Type
   * @default "bearer"
   */
  token_type?: string;
  /**
   * Expires In
   * Token expiration time in seconds
   */
  expires_in?: number | null;
}

/**
 * User
 * Full user schema returned in responses
 * @example {"created_at":"2025-01-01T00:00:00","email":"user@example.com","id":1,"is_active":true,"updated_at":"2025-01-02T00:00:00"}
 */
export interface User {
  /**
   * Email
   * @format email
   */
  email: string;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Updated At */
  updated_at?: string | null;
  /** Id */
  id: number;
  /**
   * Is Admin
   * @default false
   */
  is_admin?: boolean;
}

/** UserCreate */
export interface UserCreate {
  /**
   * Email
   * @format email
   */
  email: string;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
  /**
   * Password
   * Must be 8-64 chars with at least 1 uppercase, 1 lowercase and 1 number
   * @minLength 8
   * @maxLength 64
   */
  password: string;
}

/**
 * UserUpdate
 * Schema for updating user password
 */
export interface UserUpdate {
  /**
   * Password
   * Must be 8-64 chars with at least 1 uppercase, 1 lowercase and 1 number
   */
  password?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(
      typeof value === "number" ? value : `${value}`
    )}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key]
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${
        queryString ? `?${queryString}` : ""
      }`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title E-commerce Backend API
 * @version 0.1.0
 */
export class Api<
  SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name ReadRootGet
   * @summary Read Root
   * @request GET:/
   */
  readRootGet = (params: RequestParams = {}) =>
    this.request<any, any>({
      path: `/`,
      method: "GET",
      format: "json",
      ...params,
    });

  users = {
    /**
     * No description
     *
     * @tags Users, Users
     * @name LoginForAccessTokenUsersTokenPost
     * @summary Login For Access Token
     * @request POST:/users/token
     */
    loginForAccessTokenUsersTokenPost: (
      data: BodyLoginForAccessTokenUsersTokenPost,
      params: RequestParams = {}
    ) =>
      this.request<Token, HTTPValidationError>({
        path: `/users/token`,
        method: "POST",
        body: data,
        type: ContentType.UrlEncoded,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users, Users
     * @name CreateUserUsersPost
     * @summary Create User
     * @request POST:/users/
     */
    createUserUsersPost: (data: UserCreate, params: RequestParams = {}) =>
      this.request<User, HTTPValidationError>({
        path: `/users/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users, Users
     * @name ReadCurrentUserUsersMeGet
     * @summary Read Current User
     * @request GET:/users/me
     * @secure
     */
    readCurrentUserUsersMeGet: (params: RequestParams = {}) =>
      this.request<User, any>({
        path: `/users/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users, Users
     * @name UpdateCurrentUserUsersMePatch
     * @summary Update Current User
     * @request PATCH:/users/me
     * @secure
     */
    updateCurrentUserUsersMePatch: (
      data: UserUpdate,
      params: RequestParams = {}
    ) =>
      this.request<User, HTTPValidationError>({
        path: `/users/me`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users, Users
     * @name ReadUserUsersUserIdGet
     * @summary Read User
     * @request GET:/users/{user_id}
     * @secure
     */
    readUserUsersUserIdGet: (userId: number, params: RequestParams = {}) =>
      this.request<User, HTTPValidationError>({
        path: `/users/${userId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  products = {
    /**
     * @description List all products with optional filtering and pagination. Returns: - List of products with full details including category information
     *
     * @tags Products
     * @name ListProductsProductsGet
     * @summary List Products
     * @request GET:/products/
     */
    listProductsProductsGet: (
      query?: {
        /**
         * Skip
         * Pagination offset
         * @min 0
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * Items per page
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
        /**
         * Name
         * Filter by product name
         */
        name?: string | null;
        /**
         * Category Id
         * Filter by category ID
         */
        category_id?: number | null;
        /**
         * Min Price
         * Minimum price filter
         */
        min_price?: number | string | null;
        /**
         * Max Price
         * Maximum price filter
         */
        max_price?: number | string | null;
        /**
         * In Stock
         * Only products with stock available
         */
        in_stock?: boolean | null;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory[], void | HTTPValidationError>({
        path: `/products/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new product (Admin only). Parameters: - product_data: Product creation data Returns: - The newly created product with full details
     *
     * @tags Products
     * @name CreateProductProductsPost
     * @summary Create Product
     * @request POST:/products/
     * @secure
     */
    createProductProductsPost: (
      data: ProductCreate,
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory, void | HTTPValidationError>({
        path: `/products/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get detailed information about a specific product. Parameters: - product_id: The ID of the product to retrieve Returns: - Complete product details including category information
     *
     * @tags Products
     * @name GetProductProductsProductIdGet
     * @summary Get Product
     * @request GET:/products/{product_id}
     */
    getProductProductsProductIdGet: (
      productId: number,
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory, void | HTTPValidationError>({
        path: `/products/${productId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Update an existing product (Admin only). Parameters: - product_id: The ID of the product to update - product_data: Product update data (partial updates supported) Returns: - The updated product with full details
     *
     * @tags Products
     * @name UpdateProductProductsProductIdPut
     * @summary Update Product
     * @request PUT:/products/{product_id}
     * @secure
     */
    updateProductProductsProductIdPut: (
      productId: number,
      data: ProductUpdate,
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory, void | HTTPValidationError>({
        path: `/products/${productId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a product (Admin only). Parameters: - product_id: The ID of the product to delete Returns: - 204 No Content on successful deletion
     *
     * @tags Products
     * @name DeleteProductProductsProductIdDelete
     * @summary Delete Product
     * @request DELETE:/products/{product_id}
     * @secure
     */
    deleteProductProductsProductIdDelete: (
      productId: number,
      params: RequestParams = {}
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/products/${productId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description List all products belonging to a specific category.
     *
     * @tags Products
     * @name GetProductsByCategoryProductsCategoryCategoryIdGet
     * @summary Get Products By Category
     * @request GET:/products/category/{category_id}
     */
    getProductsByCategoryProductsCategoryCategoryIdGet: (
      categoryId: number,
      query?: {
        /**
         * Skip
         * Pagination offset
         * @min 0
         * @default 0
         */
        skip?: number;
        /**
         * Limit
         * Items per page
         * @min 1
         * @max 1000
         * @default 100
         */
        limit?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory[], void | HTTPValidationError>({
        path: `/products/category/${categoryId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Adjust product stock quantity (Admin only). Parameters: - product_id: The ID of the product - adjustment: The amount to adjust stock by (positive to add, negative to subtract) Returns: - The updated product with full details
     *
     * @tags Products
     * @name AdjustStockProductsProductIdStockPatch
     * @summary Adjust Stock
     * @request PATCH:/products/{product_id}/stock
     * @secure
     */
    adjustStockProductsProductIdStockPatch: (
      productId: number,
      query: {
        /**
         * Adjustment
         * Amount to adjust stock by (positive or negative)
         */
        adjustment: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<ProductWithCategory, void | HTTPValidationError>({
        path: `/products/${productId}/stock`,
        method: "PATCH",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  categories = {
    /**
     * No description
     *
     * @tags Categories
     * @name CreateCategoryCategoriesPost
     * @summary Create Category
     * @request POST:/categories/
     * @secure
     */
    createCategoryCategoriesPost: (
      data: CategoryCreate,
      params: RequestParams = {}
    ) =>
      this.request<Category, void | HTTPValidationError>({
        path: `/categories/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Categories
     * @name DeleteCategoryCategoriesCategoryIdDelete
     * @summary Delete Category
     * @request DELETE:/categories/{category_id}
     * @secure
     */
    deleteCategoryCategoriesCategoryIdDelete: (
      categoryId: number,
      params: RequestParams = {}
    ) =>
      this.request<void, void | HTTPValidationError>({
        path: `/categories/${categoryId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  carts = {
    /**
     * @description Get the current user's or guest's shopping cart with all items.
     *
     * @tags Carts
     * @name GetMyCartCartsMyCartGet
     * @summary Get My Cart
     * @request GET:/carts/my-cart
     */
    getMyCartCartsMyCartGet: (params: RequestParams = {}) =>
      this.request<Cart, void>({
        path: `/carts/my-cart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Add an item to the cart or update quantity if item already exists.
     *
     * @tags Carts
     * @name AddToCartCartsAddItemPost
     * @summary Add To Cart
     * @request POST:/carts/add-item
     */
    addToCartCartsAddItemPost: (
      data: CartItemCreate,
      params: RequestParams = {}
    ) =>
      this.request<Cart, void | HTTPValidationError>({
        path: `/carts/add-item`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update Cart Item This endpoint allows you to increment (+) or decrement (-) the quantity of an item in the cart. If the quantity reaches 1 and we decrement, the item will be removed from the cart. - **action**: Specify "increment" (+) to add one or "decrement" (-) to remove one. - **product_id**: The ID of the product to update. Returns the updated cart with all items and the total price.
     *
     * @tags Carts
     * @name UpdateCartItemCartsUpdateItemPatch
     * @summary Update Cart Item
     * @request PATCH:/carts/update-item
     */
    updateCartItemCartsUpdateItemPatch: (
      data: CartUpdate,
      params: RequestParams = {}
    ) =>
      this.request<Cart, void | HTTPValidationError>({
        path: `/carts/update-item`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove an item from the cart.
     *
     * @tags Carts
     * @name RemoveItemFromCartCartsRemoveItemProductIdDelete
     * @summary Remove Item From Cart
     * @request DELETE:/carts/remove-item/{product_id}
     */
    removeItemFromCartCartsRemoveItemProductIdDelete: (
      productId: number,
      params: RequestParams = {}
    ) =>
      this.request<Cart, void | HTTPValidationError>({
        path: `/carts/remove-item/${productId}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description Remove all items from the cart.
     *
     * @tags Carts
     * @name ClearCartCartsClearDelete
     * @summary Clear Cart
     * @request DELETE:/carts/clear
     */
    clearCartCartsClearDelete: (params: RequestParams = {}) =>
      this.request<Cart, void>({
        path: `/carts/clear`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description Get the total number of items in the cart (sum of quantities). Works for both authenticated users and guests.
     *
     * @tags Carts
     * @name GetCartItemCountCartsCountGet
     * @summary Get Cart Item Count
     * @request GET:/carts/count
     */
    getCartItemCountCartsCountGet: (params: RequestParams = {}) =>
      this.request<number, void>({
        path: `/carts/count`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get available offline payment methods.
     *
     * @tags Carts
     * @name GetPaymentMethodsCartsPaymentMethodsGet
     * @summary Get Payment Methods
     * @request GET:/carts/payment-methods
     */
    getPaymentMethodsCartsPaymentMethodsGet: (params: RequestParams = {}) =>
      this.request<string[], void>({
        path: `/carts/payment-methods`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Merge guest cart into user cart after login This endpoint should be called after a guest user logs in. It transfers all items from the guest cart to the user's cart, combining quantities for duplicate products.
     *
     * @tags Carts
     * @name MergeCartsCartsMergePost
     * @summary Merge Carts
     * @request POST:/carts/merge
     * @secure
     */
    mergeCartsCartsMergePost: (params: RequestParams = {}) =>
      this.request<Cart, void>({
        path: `/carts/merge`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
