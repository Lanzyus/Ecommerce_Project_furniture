from django.contrib import admin

from .models import (
    Product,
    ProductMedia,
    ProductVariant,
    ProductReview,
    Wishlist,
    RecentlyViewed,
    Coupon,
    Cart,
    CartItem,
    Transaction,
    Order,
    OrderItem,
    Shipment,
    Category,
    SubCategory,
    ContactMessage,
    Banner,
)


# ============================================================
# BANNER
# ============================================================

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "title",
    )


# ============================================================
# PRODUCT MEDIA
# ============================================================

@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):

    list_display = (
        "product",
        "media_type",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "media_type",
        "is_primary",
    )

    search_fields = (
        "product__name",
    )

    autocomplete_fields = (
        "product",
    )

    filter_horizontal = (
        "related_products",
    )


# ============================================================
# PRODUCT
# ============================================================

admin.site.register(Product)


# ============================================================
# PRODUCT VARIANT
# ============================================================

admin.site.register(ProductVariant)


# ============================================================
# PRODUCT REVIEW
# ============================================================

admin.site.register(ProductReview)


# ============================================================
# WISHLIST
# ============================================================

admin.site.register(Wishlist)


# ============================================================
# RECENTLY VIEWED
# ============================================================

admin.site.register(RecentlyViewed)


# ============================================================
# COUPON
# ============================================================

admin.site.register(Coupon)


# ============================================================
# CART
# ============================================================

admin.site.register(Cart)
admin.site.register(CartItem)


# ============================================================
# TRANSACTION
# ============================================================

admin.site.register(Transaction)


# ============================================================
# ORDER
# ============================================================

admin.site.register(Order)
admin.site.register(OrderItem)


# ============================================================
# SHIPMENT
# ============================================================

admin.site.register(Shipment)


# ============================================================
# CATEGORY
# ============================================================

admin.site.register(Category)
admin.site.register(SubCategory)


# ============================================================
# CONTACT MESSAGE
# ============================================================

admin.site.register(ContactMessage)
