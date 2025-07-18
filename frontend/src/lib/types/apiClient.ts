import {
  Api,
  ProductCreate,
  ProductUpdate,
  CartItemCreate,
  CartUpdate,
  UserCreate,
  UserUpdate,
  CategoryCreate,
} from "./apiTypes";

const api = new Api({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  baseApiParams: {
    format: "json",
  },
});

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const apiClient = {
  // Product APIs
  getAllProducts: async () => {
    const res = await api.products.listProductsProductsGet();
    return res.data;
  },
  getProductById: async (id: number) => {
    const res = await api.products.getProductProductsProductIdGet(id);
    return res.data;
  },
  createProduct: async (product: ProductCreate, token: string) => {
    const res = await api.products.createProductProductsPost(product, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  updateProduct: async (id: number, data: ProductUpdate, token: string) => {
    const res = await api.products.updateProductProductsProductIdPut(
      id,
      data,
      getAuthHeaders(token)
    );
    return res.data;
  },
  deleteProduct: async (id: number, token: string) => {
    const res = await api.products.deleteProductProductsProductIdDelete(id, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Category APIs
  // No getAllCategories method available in generated API
  createCategory: async (category: CategoryCreate, token: string) => {
    const res = await api.categories.createCategoryCategoriesPost(category, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  deleteCategory: async (id: number, token: string) => {
    const res = await api.categories.deleteCategoryCategoriesCategoryIdDelete(
      id,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  // Cart APIs
  getMyCart: async (token: string) => {
    const res = await api.carts.getMyCartCartsMyCartGet({
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  addItemToCart: async (item: CartItemCreate, token: string) => {
    const res = await api.carts.addToCartCartsAddItemPost(item, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  updateCartItem: async (cartUpdate: CartUpdate, token: string) => {
    const res = await api.carts.updateCartItemCartsUpdateItemPatch(cartUpdate, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  removeItemFromCart: async (productId: number, token: string) => {
    const res =
      await api.carts.removeItemFromCartCartsRemoveItemProductIdDelete(
        productId,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    return res.data;
  },
  clearCart: async (token: string) => {
    const res = await api.carts.clearCartCartsClearDelete({
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // User APIs
  registerUser: async (user: UserCreate) => {
    const res = await api.users.createUserUsersPost(user);
    return res.data;
  },
  loginUser: async (username: string, password: string) => {
    const res = await api.users.loginForAccessTokenUsersTokenPost({
      username,
      password,
    });
    return res.data;
  },
  getCurrentUser: async (token: string) => {
    const res = await api.users.readCurrentUserUsersMeGet({
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  updateCurrentUser: async (user: UserUpdate, token: string) => {
    const res = await api.users.updateCurrentUserUsersMePatch(user, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
