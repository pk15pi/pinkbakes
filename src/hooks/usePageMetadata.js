import { useEffect } from "react";
import { POLICIES, policyFromPath } from "../policies";
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from "../appConstants";
import {
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
  isPrivatePath,
  plainText,
  productPath,
  setPageMeta,
} from "../seo";

export default function usePageMetadata({
  product,
  productNotFound,
  adminOpen,
  authOpen,
  cartOpen,
  checkoutOpen,
  orderHistoryOpen,
  catalogLoading,
  policySlug,
}) {
  useEffect(() => {
    const path = window.location.pathname || "/";
    const privateUi = Boolean(
      adminOpen || authOpen || cartOpen || checkoutOpen || orderHistoryOpen || productNotFound || isPrivatePath(path)
    );

    if (product && !privateUi) {
      const desc = plainText(
        product.short_description || product.description || `${product.name} from pinkbakes.`,
        160
      );
      const crumbs = [
        { name: "Home", path: "/" },
        { name: product.category || "Cakes", path: "/#cakes" },
        { name: product.name, path: productPath(product) },
      ];
      setPageMeta({
        title: `${product.name} | pinkbakes`,
        description: desc,
        canonical: productPath(product),
        robots: "index,follow",
        image: product.main_image || product.image || "",
        type: "product",
        jsonLd: [
          buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
          buildWebSiteJsonLd(),
          buildBreadcrumbJsonLd(crumbs),
          buildProductJsonLd(product),
        ],
      });
      return;
    }

    if (productNotFound) {
      setPageMeta({
        title: "Cake not found | pinkbakes",
        description: "This cake is unavailable or no longer listed.",
        canonical: path,
        robots: "noindex,follow",
        jsonLd: [],
      });
      return;
    }

    const policy = POLICIES[policySlug] || policyFromPath(path);
    if (policy && !privateUi) {
      setPageMeta({
        title: `${policy.title} | pinkbakes`,
        description: policy.summary,
        canonical: policy.path,
        robots: "index,follow",
        jsonLd: [
          buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: policy.title, path: policy.path },
          ]),
        ],
      });
      return;
    }

    if (privateUi) {
      setPageMeta({
        title: adminOpen ? "Admin | pinkbakes" : "pinkbakes",
        description: "pinkbakes - handcrafted cakes for birthdays, anniversaries, weddings, and custom celebrations.",
        canonical: SITE_URL + "/",
        robots: "noindex,nofollow",
        jsonLd: [],
      });
      return;
    }

    setPageMeta({
      title: "pinkbakes - Cakes for Every Moment",
      description: "pinkbakes - handcrafted cakes for birthdays, anniversaries, weddings, and custom celebrations.",
      canonical: "/",
      robots: "index,follow",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85",
      jsonLd: [
        buildOrganizationJsonLd({ email: CONTACT_EMAIL, telephone: WHATSAPP_NUMBER }),
        buildWebSiteJsonLd(),
      ],
    });
  }, [product, productNotFound, adminOpen, authOpen, cartOpen, checkoutOpen, orderHistoryOpen, catalogLoading, policySlug]);
}
