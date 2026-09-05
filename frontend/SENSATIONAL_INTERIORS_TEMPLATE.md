# Sensational Interiors Frontend Template

This frontend redesign follows the supplied Sensational Interiors reference: warm ivory backgrounds, restrained gold accents, editorial serif typography, large interior photography, service pillars, featured projects, room navigation, curated product preview and consultation CTA.

## Backend integration

The home page reads from the existing Django API:
- `GET /api/products/`
- `GET /api/categories/`
- `GET /api/banners/`

Existing product/cart/auth/detail pages were left in place. The redesigned navigation points to the existing About, Contact, Cart and Search routes, while Services, Projects, Shop and Blog use sections on the new home page.

## Visual fallbacks

The attached reference image was used to create local fallback photography under:
`src/assets/sensational/`

These fallbacks keep the homepage looking like the supplied design even before banners/categories/products have been populated in the Django admin. API images take priority when available.
