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
# CATEGORY
# ============================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
    )

    search_fields = (
        "name",
    )


# ============================================================
# SUBCATEGORY
# ============================================================

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "category",
    )

    list_filter = (
        "category",
    )

    search_fields = (
        "name",
        "category__name",
    )

    autocomplete_fields = (
        "category",
    )


# ============================================================
# PRODUCT
# ============================================================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "sku",
        "seller",
        "category",
        "subcategory",
        "price",
        "stock_quantity",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
        "is_featured",
        "category",
        "subcategory",
        "seller",
        "created_at",
    )

    search_fields = (
        "name",
        "sku",
        "slug",
        "description",
    )

    autocomplete_fields = (
        "seller",
        "category",
        "subcategory",
        "related_products",
    )


# ============================================================
# PRODUCT MEDIA
# ============================================================

@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "media_type",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "media_type",
        "is_primary",
        "created_at",
    )

    search_fields = (
        "product__name",
        "product__sku",
    )

    autocomplete_fields = (
        "product",
        "related_products",
    )

    readonly_fields = (
        "file_url",
        "cloudinary_resource_type",
    )

    fields = (
        "product",
        "media_type",
        "file",
        "related_products",
        "is_primary",
        "file_url",
        "cloudinary_resource_type",
    )


# ============================================================
# PRODUCT VARIANT
# ============================================================

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
    )

    search_fields = (
        "product__name",
        "product__sku",
    )

    autocomplete_fields = (
        "product",
    )


# ============================================================
# PRODUCT REVIEW
# ============================================================

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "user",
    )

    search_fields = (
        "product__name",
        "product__sku",
        "user__username",
        "user__email",
    )

    autocomplete_fields = (
        "product",
        "user",
    )


# ============================================================
# WISHLIST
# ============================================================

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "product",
    )

    search_fields = (
        "user__username",
        "user__email",
        "product__name",
        "product__sku",
    )

    autocomplete_fields = (
        "user",
        "product",
    )


# ============================================================
# RECENTLY VIEWED
# ============================================================

@admin.register(RecentlyViewed)
class RecentlyViewedAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "product",
    )

    search_fields = (
        "user__username",
        "user__email",
        "product__name",
        "product__sku",
    )

    autocomplete_fields = (
        "user",
        "product",
    )


# ============================================================
# COUPON
# ============================================================

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "code",
    )

    search_fields = (
        "code",
    )

# ============================================================
# CART
# ============================================================

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    autocomplete_fields = (
        "user",
    )


# ============================================================
# CART ITEM
# ============================================================

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "cart",
        "product",
        "quantity",
    )

    search_fields = (
        "product__name",
        "product__sku",
        "cart__user__username",
        "cart__user__email",
    )

    autocomplete_fields = (
        "cart",
        "product",
    )


# ============================================================
# TRANSACTION
# ============================================================

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "payment_method",
        "status",
        "created_at",
    )

    list_filter = (
        "payment_method",
        "status",
        "created_at",
    )

    search_fields = (
        "reference",
        "user__username",
        "user__email",
    )

    autocomplete_fields = (
        "user",
    )


# ============================================================
# ORDER
# ============================================================

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    autocomplete_fields = (
        "user",
    )


# ============================================================
# ORDER ITEM
# ============================================================

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "product",
        "quantity",
    )

    search_fields = (
        "product__name",
        "product__sku",
    )

    autocomplete_fields = (
        "order",
        "product",
    )


# ============================================================
# SHIPMENT
# ============================================================

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "status",
        "courier",
        "tracking_number",
    )

    list_filter = (
        "status",
        "courier",
    )

    search_fields = (
        "tracking_number",
        "courier",
        "order__user__username",
        "order__user__email",
    )

    autocomplete_fields = (
        "order",
    )


# ============================================================
# CONTACT MESSAGE
# ============================================================

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "email",
        "created_at",
    )

    search_fields = (
        "name",
        "email",
        "subject",
        "message",
    )

    list_filter = (
        "created_at",
    )