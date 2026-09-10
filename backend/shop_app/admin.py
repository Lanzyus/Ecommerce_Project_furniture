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


admin.site.register(Product)
admin.site.register(ProductVariant)
admin.site.register(ProductReview)
admin.site.register(Wishlist)
admin.site.register(RecentlyViewed)
admin.site.register(Coupon)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Transaction)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Shipment)
admin.site.register(Category)
admin.site.register(SubCategory)
admin.site.register(ContactMessage)
