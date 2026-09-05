from django.contrib import admin
from .models import Product, Cart, CartItem
from .models import ProductMedia
from .models import *
from .models import (
    Category,
    SubCategory
)
from .models import Banner

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "is_active",
        "created_at",
    )

    list_filter = ("is_active",)

    search_fields = ("title",)





# Register your models here.

admin.site.register(Product)
admin.site.register(ProductMedia)
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