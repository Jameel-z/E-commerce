import type { ProductDetail } from "@/shared/types/api.types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://961shop.com";
const SITE_NAME = "961shop.com";
const CURRENCY = "USD";

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.jpg`,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hamdan Building, Main Road, 1st Floor",
      addressLocality: "Zefta",
      addressRegion: "Nabatieh Governorate",
      postalCode: "7104",
      addressCountry: "LB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+96176840474",
      contactType: "customer service",
      email: "support@961shop.com",
    },
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getProductSchema(product: ProductDetail) {
  const price = parseFloat(product.price);
  const images: string[] = [];
  if (product.primary_image_url) images.push(product.primary_image_url);
  product.images?.forEach((img) => images.push(img.url));

  const availability =
    product.stock_quantity > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const conditionMap: Record<string, string> = {
    new: "https://schema.org/NewCondition",
    used: "https://schema.org/UsedCondition",
    refurbished: "https://schema.org/RefurbishedCondition",
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${SITE_URL}/products/${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.brand || SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.id}`,
      priceCurrency: CURRENCY,
      price: price.toFixed(2),
      availability,
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "LB",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnNotPermitted",
        itemDefectReturnFees: "https://schema.org/FreeReturn",
        merchantReturnLink: `${SITE_URL}/return-policy`,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: CURRENCY,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "LB",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
  };

  if (product.description) schema.description = product.description;
  if (images.length > 0) schema.image = images;
  if (product.sku) {
    schema.sku = product.sku;
    schema.mpn = product.sku;
  }
  if (product.condition) {
    schema.itemCondition =
      conditionMap[product.condition.toLowerCase()] ??
      "https://schema.org/NewCondition";
  }
  if (product.category?.name) {
    schema.category = product.category.name;
  }

  return schema;
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
