# shop_app/models.py

import os
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator,
)
from django.db import models
from django.db.models import Avg
from django.utils import timezone
from django.utils.text import slugify

from .storage import ProductMediaCloudinaryStorage


# ==================================================
# CONTACT
# ==================================================
class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ==================================================
# ProductSpecification
# ==================================================

class ProductSpecification(models.Model):
    product = models.ForeignKey(
        "Product",
        related_name="specifications",
        on_delete=models.CASCADE
    )

    name = models.CharField(
        max_length=100
    )

    value = models.CharField(
        max_length=255
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Product Specification"
        verbose_name_plural = "Product Specifications"

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"


# ==================================================
# OrderTracking
# ==================================================

class OrderTracking(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    order = models.ForeignKey(
        "Order",
        on_delete=models.CASCADE,
        related_name="tracking_history"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES
    )

    note = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"


# ==================================================
# BANNER
# ==================================================

class CarouselImage(models.Model):
    title = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to="carousel/")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title or f"Carousel {self.id}"


class Banner(models.Model):
    SEASON_CHOICES = [
        ("default", "Default"),
        ("valentine", "Valentine"),
        ("salah", "Salah"),
        ("christmas", "Christmas"),
        ("newyear", "New Year"),
    ]

    title = models.CharField(max_length=255)

    image = models.ImageField(
        upload_to="banners/"
    )

    season = models.CharField(
        max_length=50,
        choices=SEASON_CHOICES,
        default="default"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# ==================================================
# CATEGORY
# ==================================================

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1

            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ==================================================
# SUBCATEGORY
# ==================================================

class SubCategory(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="subcategories",
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="subcategories/",
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)

            slug = base_slug
            counter = 1

            while SubCategory.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.name}"


# ==================================================
# PRODUCT
# ==================================================

class Product(models.Model):

    # ==========================
    # SEO
    # ==========================
    meta_title = models.CharField(
        max_length=255,
        blank=True
    )

    meta_description = models.TextField(
        blank=True
    )

    meta_keywords = models.TextField(
        blank=True
    )

    # ==========================
    # RELATIONSHIPS
    # ==========================
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="products",
        on_delete=models.CASCADE
    )

    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.SET_NULL,
        null=True
    )

    subcategory = models.ForeignKey(
        SubCategory,
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    related_products = models.ManyToManyField(
        "self",
        blank=True
    )

    # ==========================
    # BASIC INFORMATION
    # ==========================
    name = models.CharField(
        max_length=255
    )

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    description = models.TextField()

    short_description = models.CharField(
        max_length=500
    )

    brand = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True
    )

    barcode = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    # ==========================
    # PRICING
    # ==========================
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    discounted_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    cost_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=7.50
    )

    # ==========================
    # INVENTORY
    # ==========================
    stock_quantity = models.PositiveIntegerField(
        default=0
    )

    reorder_level = models.PositiveIntegerField(
        default=5
    )

    # ==========================
    # PHYSICAL DETAILS
    # ==========================
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )

    length = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )

    width = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )

    height = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )

    # ==========================
    # REVIEWS
    # ==========================
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0
    )

    total_reviews = models.PositiveIntegerField(
        default=0
    )

    # ==========================
    # FLAGS
    # ==========================
    is_featured = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    is_digital = models.BooleanField(
        default=False
    )

    # ==========================
    # TIMESTAMPS
    # ==========================
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    # ==========================
    # PROPERTIES
    # ==========================
    @property
    def current_price(self):
        return (
            self.discounted_price
            if self.discounted_price
            else self.price
        )

    @property
    def average_rating(self):
        avg = self.reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        return round(avg or 0, 2)

    @property
    def review_count(self):
        return self.reviews.count()

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def discount_percentage(self):
        if (
            self.discounted_price
            and self.price > 0
        ):
            return round(
                (
                    (self.price - self.discounted_price)
                    / self.price
                ) * 100
            )
        return 0

    # ==========================
    # SAVE
    # ==========================
    def save(self, *args, **kwargs):

        if not self.slug:
            base_slug = slugify(self.name)

            slug = base_slug
            counter = 1

            while Product.objects.filter(
                slug=slug
            ).exists():
                slug = (
                    f"{base_slug}-{counter}"
                )
                counter += 1

            self.slug = slug

        if not self.meta_title:
            self.meta_title = self.name

        super().save(
            *args,
            **kwargs
        )

    def __str__(self):
        return self.name


# ==================================================
# PRODUCT MEDIA
# ==================================================

class ProductMedia(models.Model):

    IMAGE = "image"
    VIDEO = "video"

    MEDIA_CHOICES = [
        (IMAGE, "Image"),
        (VIDEO, "Video"),
    ]

    product = models.ForeignKey(
        Product,
        related_name="media",
        on_delete=models.CASCADE,
    )

    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_CHOICES,
        default=IMAGE,
    )

    file = models.FileField(
        upload_to="product_media/",
        storage=ProductMediaCloudinaryStorage(),
        blank=True,
        null=True,
    )

    related_products = models.ManyToManyField(
        "self",
        blank=True,
    )

    is_primary = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # =========================================================
    # VALIDATION
    # =========================================================

    def clean(self):
        """
        Validate the uploaded file according to media_type.
        """

        super().clean()

        if not self.file:
            return

        filename = os.path.basename(
            str(self.file.name)
        )

        extension = os.path.splitext(
            filename
        )[1].lower()

        image_extensions = {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".avif",
            ".gif",
        }

        video_extensions = {
            ".mp4",
            ".webm",
            ".mov",
            ".avi",
            ".mkv",
            ".m4v",
        }

        # -----------------------------
        # IMAGE VALIDATION
        # -----------------------------
        if self.media_type == self.IMAGE:

            if extension not in image_extensions:

                raise ValidationError({
                    "file": (
                        "Invalid image format. "
                        "Allowed formats: JPG, JPEG, PNG, "
                        "WEBP, AVIF and GIF."
                    )
                })

        # -----------------------------
        # VIDEO VALIDATION
        # -----------------------------
        elif self.media_type == self.VIDEO:

            if extension not in video_extensions:

                raise ValidationError({
                    "file": (
                        "Invalid video format. "
                        "Allowed formats: MP4, WEBM, "
                        "MOV, AVI, MKV and M4V."
                    )
                })

        # -----------------------------
        # MEDIA TYPE VALIDATION
        # -----------------------------
        else:

            raise ValidationError({
                "media_type": (
                    "Invalid media type. "
                    "Select either Image or Video."
                )
            })

    # =========================================================
    # CLOUDINARY RESOURCE TYPE
    # =========================================================

    @property
    def cloudinary_resource_type(self):
        """
        Return the Cloudinary resource type used
        for this media.
        """

        if self.media_type == self.VIDEO:
            return "video"

        return "image"

    # =========================================================
    # MEDIA TYPE HELPERS
    # =========================================================

    @property
    def is_video(self):
        """
        Convenient boolean for serializers/frontend.
        """

        return self.media_type == self.VIDEO

    @property
    def is_image(self):
        """
        Convenient boolean for serializers/frontend.
        """

        return self.media_type == self.IMAGE

    # =========================================================
    # FILE URL
    # =========================================================

    @property
    def file_url(self):
        """
        Return the complete URL of the uploaded media.
        """

        if not self.file:
            return None

        try:
            url = self.file.url
        except Exception:
            return str(self.file)

        if not url:
            return None

        return url

    # =========================================================
    # STRING
    # =========================================================

    def __str__(self):

        product_name = (
            self.product.name
            if self.product
            else "Product"
        )

        return (
            f"{product_name} - "
            f"{self.media_type}"
        )


# ==================================================
# PRODUCT BUNDLE
# ==================================================

class ProductBundle(models.Model):
    main_product = models.ForeignKey(
        Product,
        related_name="bundles",
        on_delete=models.CASCADE
    )

    related_product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )


# ==================================================
# PRODUCT QUESTION
# ==================================================

class ProductQuestion(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
        related_name="questions"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="product_questions"
    )

    question = models.TextField()

    answer = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.product.name} - {self.question[:50]}"


# ==================================================
# PRODUCT VARIANT
# ==================================================

class ProductVariant(models.Model):

    product = models.ForeignKey(
        Product,
        related_name="variants",
        on_delete=models.CASCADE
    )

    color = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    size = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    stock_quantity = models.PositiveIntegerField(
        default=0
    )

    additional_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    storage = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    material = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    style = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.product.name}"
            f" {self.color or ''}"
            f" {self.size or ''}"
        )


# ==================================================
# ProductTag
# ==================================================

class ProductTag(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )


class ProductTagMapping(models.Model):
    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
        related_name="tag_mappings"
    )

    tag = models.ForeignKey(
        "ProductTag",
        on_delete=models.CASCADE,
        related_name="product_mappings"
    )

    class Meta:
        unique_together = ("product", "tag")

    def __str__(self):
        return f"{self.product.name} - {self.tag.name}"


# ==================================================
# REVIEW
# ==================================================

class ProductReview(models.Model):

    product = models.ForeignKey(
        Product,
        related_name="reviews",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "user"],
                name="unique_product_review"
            )
        ]

    def __str__(self):
        return (
            f"{self.user} - {self.product}"
        )


class ReviewImage(models.Model):
    review = models.ForeignKey(
        ProductReview,
        related_name="images",
        on_delete=models.CASCADE
    )

    image = models.ImageField(
        upload_to="review_images/"
    )


# ==================================================
# CART
# ==================================================

class Cart(models.Model):

    cart_code = models.CharField(
        max_length=100,
        unique=True
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    paid = models.BooleanField(default=False)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.cart_code


class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        related_name="items",
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    variant = models.ForeignKey(
        ProductVariant,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    def __str__(self):
        return self.product.name


# ==================================================
# ORDER
# ==================================================

class Order(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    PAYMENT_STATUS_CHOICES = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    )

    PAYMENT_TYPE_CHOICES = (
        ("online", "Online Payment"),
        ("cod", "Cash On Delivery"),
    )

    PAYMENT_METHOD_CHOICES = (
        ("paystack", "Paystack"),
        ("flutterwave", "Flutterwave"),
        ("paypal", "PayPal"),
        ("cash", "Cash"),
    )

    order_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    transaction = models.OneToOneField(
        "Transaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order"
    )

    shipping_address = models.TextField()

    city = models.CharField(
        max_length=100
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default="online"
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="paystack"
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="pending"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    vat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = (
                f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            )

        super().save(*args, **kwargs)

    @property
    def total_items(self):
        return sum(
            item.quantity
            for item in self.items.all()
        )

    def __str__(self):
        return (
            f"{self.order_number} - "
            f"{self.payment_method} - "
            f"{self.status}"
        )


# ==================================================
# Shipment
# ==================================================

class Shipment(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("in_transit", "In Transit"),
        ("out_for_delivery", "Out For Delivery"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    )

    COURIER_CHOICES = [
        ("gig_logistics", "GIG Logistics"),
        ("dhl_express_nigeria", "DHL Express Nigeria"),
        ("fedex_nigeria", "FedEx Nigeria"),
        ("ups_nigeria", "UPS Nigeria"),
        ("abc_cargo_express", "ABC Cargo Express"),
        ("kwik_delivery", "Kwik Delivery"),
        ("sendbox", "Sendbox"),
        ("kobo360", "Kobo360"),
        ("Local_delivery", "Local_delivery"),
        ("red_star_express", "Red Star Express"),
        (
            "tranex",
            "Tranex (Trans-Nationwide Express Plc)"
        ),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="shipment"
    )

    tracking_number = models.CharField(
        max_length=100,
        unique=True
    )

    courier = models.CharField(
        max_length=100,
        choices=COURIER_CHOICES,
        blank=True,
        default=""
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="pending"
    )

    shipped_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    def save(self, *args, **kwargs):

        if not self.tracking_number:
            self.tracking_number = (
                f"TRK-{uuid.uuid4().hex[:10].upper()}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.tracking_number


# ==================================================
# ShipmentTracking
# ==================================================

class ShipmentTracking(models.Model):

    shipment = models.ForeignKey(
        Shipment,
        related_name="tracking_updates",
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=50
    )

    location = models.CharField(
        max_length=255,
        blank=True
    )

    note = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    def __str__(self):
        return (
            f"{self.shipment.tracking_number} "
            f"- {self.status}"
        )


# ==================================================
# WISHLIST
# ==================================================

class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlists"
    )

    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
        related_name="wishlisted_by"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "product"]

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


# ==================================================
# RECENTLY VIEWED
# ==================================================

class RecentlyViewed(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    viewed_at = models.DateTimeField(
        auto_now=True
    )


# ==================================================
# TRANSACTION
# ==================================================

class Transaction(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("paystack", "Paystack"),
        ("flutterwave", "Flutterwave"),
        ("paypal", "PayPal"),
    ]

    ref = models.CharField(
        max_length=255,
        unique=True,
        db_index=True
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    currency = models.CharField(
        max_length=10,
        default="NGN"
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="paystack"
    )

    full_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    phone = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    shipping_address = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.ref} | "
            f"{self.payment_method} | "
            f"{self.status}"
        )


# ==================================================
# ORDER ITEM
# ==================================================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        related_name="items",
        on_delete=models.CASCADE
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return self.product.name


# ==================================================
# StockMovement
# ==================================================

class StockMovement(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    movement_type = models.CharField(
        max_length=20
    )

    quantity = models.PositiveIntegerField()

    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


# ==================================================
# COUPON
# ==================================================

class Coupon(models.Model):

    code = models.CharField(
        max_length=50,
        unique=True
    )

    discount_percentage = models.PositiveIntegerField()

    active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.code










# from django.db import models
# from django.conf import settings
# from django.utils.text import slugify
# from django.core.validators import MinValueValidator, MaxValueValidator



# # ==================================================
# # CATEGORY
# # ==================================================

# class Category(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     slug = models.SlugField(unique=True, blank=True)
#     image = models.ImageField(upload_to="categories/", blank=True, null=True)
#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name_plural = "Categories"
#         ordering = ["name"]

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name


# # ==================================================
# # SUB CATEGORY
# # ==================================================

# class SubCategory(models.Model):
#     category = models.ForeignKey(
#         Category,
#         related_name="subcategories",
#         on_delete=models.CASCADE
#     )

#     name = models.CharField(max_length=100)
#     slug = models.SlugField(unique=True, blank=True)

#     image = models.ImageField(
#         upload_to="subcategories/",
#         blank=True,
#         null=True
#     )

#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ["name"]

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return f"{self.category.name} - {self.name}"


# # ==================================================
# # PRODUCT
# # ==================================================

# class Product(models.Model):
#     seller = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         related_name="products",
#         on_delete=models.CASCADE
#     )

#     category = models.ForeignKey(
#         Category,
#         related_name="products",
#         on_delete=models.SET_NULL,
#         null=True
#     )

#     subcategory = models.ForeignKey(
#         SubCategory,
#         related_name="products",
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
#     )

#     name = models.CharField(max_length=255)

#     slug = models.SlugField(
#         unique=True,
#         blank=True
#     )

#     description = models.TextField()

#     short_description = models.CharField(
#         max_length=500
#     )

#     brand = models.CharField(
#         max_length=200,
#         blank=True,
#         null=True
#     )

#     sku = models.CharField(
#         max_length=100,
#         unique=True,
#         blank=True,
#         null=True
#     )

#     price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     discounted_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         blank=True,
#         null=True
#     )

#     stock_quantity = models.PositiveIntegerField(
#         default=0
#     )

#     weight = models.DecimalField(
#         max_digits=8,
#         decimal_places=2,
#         blank=True,
#         null=True
#     )

#     rating = models.DecimalField(
#         max_digits=3,
#         decimal_places=2,
#         default=0
#     )

#     total_reviews = models.PositiveIntegerField(
#         default=0
#     )

#     is_active = models.BooleanField(default=True)

#     is_featured = models.BooleanField(default=False)

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     class Meta:
#         ordering = ["-created_at"]

#     @property
#     def current_price(self):
#         return self.discounted_price or self.price

#     def save(self, *args, **kwargs):

#         if not self.slug:
#             base_slug = slugify(self.name)

#             slug = base_slug
#             counter = 1

#             while Product.objects.filter(slug=slug).exists():
#                 slug = f"{base_slug}-{counter}"
#                 counter += 1

#             self.slug = slug

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name


# # ==================================================
# # PRODUCT MEDIA
# # ==================================================

# class ProductMedia(models.Model):

#     IMAGE = "image"
#     VIDEO = "video"

#     MEDIA_CHOICES = [
#         (IMAGE, "Image"),
#         (VIDEO, "Video"),
#     ]

#     product = models.ForeignKey(
#         Product,
#         related_name="media",
#         on_delete=models.CASCADE
#     )

#     media_type = models.CharField(
#         max_length=10,
#         choices=MEDIA_CHOICES
#     )

#     file = models.FileField(
#         upload_to="product_media/"
#     )

#     is_primary = models.BooleanField(
#         default=False
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return f"{self.product.name} - {self.media_type}"


# # ==================================================
# # PRODUCT VARIANT
# # ==================================================

# class ProductVariant(models.Model):

#     product = models.ForeignKey(
#         Product,
#         related_name="variants",
#         on_delete=models.CASCADE
#     )

#     color = models.CharField(
#         max_length=50,
#         blank=True,
#         null=True
#     )

#     size = models.CharField(
#         max_length=50,
#         blank=True,
#         null=True
#     )

#     stock_quantity = models.PositiveIntegerField(
#         default=0
#     )

#     additional_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0
#     )

#     def __str__(self):
#         return f"{self.product.name} - {self.color} - {self.size}"


# # ==================================================
# # PRODUCT REVIEW
# # ==================================================

# class ProductReview(models.Model):

#     product = models.ForeignKey(
#         Product,
#         related_name="reviews",
#         on_delete=models.CASCADE
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     rating = models.PositiveSmallIntegerField(
#         validators=[
#             MinValueValidator(1),
#             MaxValueValidator(5)
#         ]
#     )

#     comment = models.TextField(blank=True)

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     class Meta:
#         unique_together = ("product", "user")

#     def __str__(self):
#         return f"{self.user} - {self.product}"


# # ==================================================
# # WISHLIST
# # ==================================================

# class Wishlist(models.Model):

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     class Meta:
#         unique_together = ("user", "product")

#     def __str__(self):
#         return f"{self.user} - {self.product}"


# # ==================================================
# # RECENTLY VIEWED
# # ==================================================

# class RecentlyViewed(models.Model):

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     viewed_at = models.DateTimeField(
#         auto_now=True
#     )


# # ==================================================
# # CART
# # ==================================================

# class Cart(models.Model):

#     cart_code = models.CharField(
#         max_length=100,
#         unique=True
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         null=True,
#         blank=True
#     )

#     paid = models.BooleanField(default=False)

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     def __str__(self):
#         return self.cart_code


# class CartItem(models.Model):

#     cart = models.ForeignKey(
#         Cart,
#         related_name="items",
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(
#         default=1
#     )

#     def __str__(self):
#         return self.product.name




# # ==================================================
# # TRANSACTION
# # ==================================================

# class Transaction(models.Model):

#     STATUS_CHOICES = [
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#     ]

#     ref = models.CharField(
#         max_length=100,
#         unique=True
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     cart = models.ForeignKey(
#         Cart,
#         on_delete=models.CASCADE
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     currency = models.CharField(
#         max_length=10,
#         default="NGN"
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default="pending"
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )


# # ==================================================
# # ORDER
# # ==================================================

# class Order(models.Model):

#     ORDER_STATUS = [
#         ("pending", "Pending"),
#         ("processing", "Processing"),
#         ("shipped", "Shipped"),
#         ("delivered", "Delivered"),
#         ("cancelled", "Cancelled"),
#     ]

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     shipping_address = models.TextField()

#     city = models.CharField(
#         max_length=100
#     )

#     subtotal = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     total_amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=ORDER_STATUS,
#         default="pending"
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     def __str__(self):
#         return f"Order #{self.id}"


# class OrderItem(models.Model):

#     order = models.ForeignKey(
#         Order,
#         related_name="items",
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(
#         default=1
#     )

#     unit_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     def __str__(self):
#         return self.product.name


# # ==================================================
# # SHIPMENT
# # ==================================================

# class Shipment(models.Model):

#     order = models.OneToOneField(
#         Order,
#         related_name="shipment",
#         on_delete=models.CASCADE
#     )

#     courier_name = models.CharField(
#         max_length=100
#     )

#     tracking_number = models.CharField(
#         max_length=255,
#         unique=True
#     )

#     status = models.CharField(
#         max_length=100,
#         default="Pending"
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     def __str__(self):
#         return self.tracking_number


# # ==================================================
# # COUPON
# # ==================================================

# class Coupon(models.Model):

#     code = models.CharField(
#         max_length=50,
#         unique=True
#     )

#     discount_percentage = models.PositiveIntegerField()

#     active = models.BooleanField(
#         default=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return self.code










# from django.db import models
# from django.conf import settings
# from django.utils.text import slugify
# from django.core.validators import MinValueValidator, MaxValueValidator


# # ==================================================
# # CATEGORY
# # ==================================================
# class Category(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     slug = models.SlugField(unique=True, blank=True)
#     image = models.ImageField(upload_to="categories/", blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         verbose_name_plural = "Categories"

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name


# # ==================================================
# # SUBCATEGORY
# # ==================================================
# class SubCategory(models.Model):
#     category = models.ForeignKey(Category, related_name="subcategories", on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     slug = models.SlugField(unique=True, blank=True)
#     image = models.ImageField(upload_to="subcategories/", blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name


# # ==================================================
# # PRODUCT
# # ==================================================
# class Product(models.Model):
#     seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
#     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
#     subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")

#     name = models.CharField(max_length=255)
#     slug = models.SlugField(unique=True, blank=True)
#     description = models.TextField(blank=True)
#     short_description = models.CharField(max_length=500)

#     price = models.DecimalField(max_digits=12, decimal_places=2)
#     discounted_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

#     stock_quantity = models.PositiveIntegerField(default=0)
#     brand = models.CharField(max_length=200, blank=True, null=True)
#     weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

#     rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
#     total_reviews = models.PositiveIntegerField(default=0)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

#     @property
#     def current_price(self):
#         return self.discounted_price or self.price

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             base_slug = slugify(self.name)
#             slug = base_slug
#             counter = 1

#             while Product.objects.filter(slug=slug).exists():
#                 slug = f"{base_slug}-{counter}"
#                 counter += 1

#             self.slug = slug

#         super().save(*args, **kwargs)


# # ==================================================
# # PRODUCT MEDIA
# # ==================================================
# class ProductMedia(models.Model):
#     IMAGE = "image"
#     VIDEO = "video"

#     MEDIA_CHOICES = [
#         (IMAGE, "Image"),
#         (VIDEO, "Video"),
#     ]

#     product = models.ForeignKey(Product, related_name="media", on_delete=models.CASCADE)
#     media_type = models.CharField(max_length=10, choices=MEDIA_CHOICES)
#     file = models.FileField(upload_to="product_media/")
#     is_primary = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)


# # ==================================================
# # PRODUCT VARIANT
# # ==================================================
# class ProductVariant(models.Model):
#     product = models.ForeignKey(Product, related_name="variants", on_delete=models.CASCADE)
#     color = models.CharField(max_length=50)
#     size = models.CharField(max_length=50)
#     stock_quantity = models.PositiveIntegerField(default=0)
#     additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)


# # ==================================================
# # PRODUCT REVIEW (ONLY ONE MODEL)
# # ==================================================
# class ProductReview(models.Model):
#     product = models.ForeignKey(Product, related_name="reviews", on_delete=models.CASCADE)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

#     rating = models.PositiveSmallIntegerField(
#         validators=[MinValueValidator(1), MaxValueValidator(5)]
#     )
#     comment = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)


# # ==================================================
# # WISHLIST (ONLY ONE MODEL)
# # ==================================================
# class Wishlist(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ("user", "product")


# # ==================================================
# # CART
# # ==================================================
# class Cart(models.Model):
#     cart_code = models.CharField(max_length=100, unique=True)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
#     paid = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)


# class CartItem(models.Model):
#     cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField(default=1)


# # ==================================================
# # TRANSACTION
# # ==================================================
# class Transaction(models.Model):
#     STATUS_CHOICES = [
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#     ]

#     ref = models.CharField(max_length=100, unique=True)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     cart = models.ForeignKey(Cart, on_delete=models.CASCADE)

#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     currency = models.CharField(max_length=10, default="NGN")
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

#     created_at = models.DateTimeField(auto_now_add=True)


# # ==================================================
# # ORDER SYSTEM
# # ==================================================
# class Order(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     shipping_address = models.TextField(blank=True, null=True)
#     city = models.CharField(max_length=100, blank=True, null=True)

#     subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
#     total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

#     status = models.CharField(max_length=30, default="pending")
#     created_at = models.DateTimeField(auto_now_add=True)


# class OrderItem(models.Model):
#     order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField(default=1)
#     unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)


# # ==================================================
# # SHIPMENT
# # ==================================================
# class Shipment(models.Model):
#     order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
#     courier_name = models.CharField(max_length=100)
#     tracking_number = models.CharField(max_length=255, unique=True)
#     status = models.CharField(max_length=100, default="Pending")


# # ==================================================
# # RECENTLY VIEWED
# # ==================================================
# class RecentlyViewed(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     viewed_at = models.DateTimeField(auto_now=True)


# # ==================================================
# # COUPON
# # ==================================================
# class Coupon(models.Model):
#     code = models.CharField(max_length=50, unique=True)
#     discount_percentage = models.PositiveIntegerField()
#     active = models.BooleanField(default=True)

# from django.db import models
# from django.conf import settings
# from django.utils.text import slugify
# from django.core.validators import MinValueValidator, MaxValueValidator

# from core.models import CustomUser


# from django.utils import timezone

# created_at = models.DateTimeField(
#     auto_now_add=True,
#     default=timezone.now
# )

 
# # ==================================================
# # CATEGORY1
# # ==================================================

# class Category(models.Model):

#     name = models.CharField(
#         max_length=100,
#         unique=True
#     )

#     slug = models.SlugField(
#         unique=True,
#         blank=True
#     )

#     image = models.ImageField(
#         upload_to="categories/",
#         blank=True,
#         null=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name




# class SubCategory(models.Model):
#     category = models.ForeignKey(
#         Category,
#         related_name="subcategories",
#         on_delete=models.CASCADE,
#     )

#     name = models.CharField(max_length=100)

#     slug = models.SlugField(
#         unique=True,
#         blank=True,
#     )

#     image = models.ImageField(
#         upload_to="subcategories/",
#         blank=True,
#         null=True,
#     )

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify(self.name)

#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name



# # class Category(models.Model):
# #     name = models.CharField(max_length=100, unique=True)
# #     slug = models.SlugField(unique=True, blank=True)
# #     description = models.TextField(blank=True, null=True)
# #     image = models.ImageField(
# #         upload_to="categories/",
# #         blank=True,
# #         null=True
# #     )

# #     created_at = models.DateTimeField(auto_now_add=True)

# #     class Meta:
# #         verbose_name_plural = "Categories"

# #     def __str__(self):
# #         return self.name

# #     def save(self, *args, **kwargs):
# #         if not self.slug:
# #             self.slug = slugify(self.name)

# #         super().save(*args, **kwargs)


# # ==================================================
# # PRODUCT
# # ==================================================

# class Product(models.Model):
#     seller = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE,
#         related_name="products"
#     )

#    category = models.ForeignKey(
#         Category,
#         related_name="products",
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
# )

# subcategory = models.ForeignKey(
#         SubCategory,
#         related_name="products",
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
# )

#     name = models.CharField(max_length=255)

#     slug = models.SlugField(
#         unique=True,
#         blank=True
#     )

#     description = models.TextField()

#     short_description = models.CharField(
#         max_length=500
#     )

#     price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     discounted_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         blank=True,
#         null=True
#     )

#     stock_quantity = models.PositiveIntegerField(default=0)

#     brand = models.CharField(
#         max_length=200,
#         blank=True,
#         null=True
#     )

#     weight = models.DecimalField(
#         max_digits=8,
#         decimal_places=2,
#         blank=True,
#         null=True
#     )

#     rating = models.DecimalField(
#         max_digits=3,
#         decimal_places=2,
#         default=0
#     )

#     total_reviews = models.PositiveIntegerField(default=0)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

#     @property
#     def current_price(self):
#         return self.discounted_price or self.price

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             base_slug = slugify(self.name)
#             slug = base_slug
#             counter = 1

#             while Product.objects.filter(slug=slug).exists():
#                 slug = f"{base_slug}-{counter}"
#                 counter += 1

#             self.slug = slug

#         super().save(*args, **kwargs)


# # ==================================================
# # PRODUCT MEDIA
# # ==================================================

# class ProductMedia(models.Model):
#     IMAGE = "image"
#     VIDEO = "video"

#     MEDIA_CHOICES = (
#         (IMAGE, "Image"),
#         (VIDEO, "Video"),
#     )

#     product = models.ForeignKey(
#         Product,
#         related_name="media",
#         on_delete=models.CASCADE
#     )

#     media_type = models.CharField(
#         max_length=10,
#         choices=MEDIA_CHOICES
#     )

#     file = models.FileField(
#         upload_to="product_media/"
#     )

#     is_primary = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.product.name} - {self.media_type}"


# # ==================================================
# # PRODUCT VARIANTS
# # ==================================================

# class ProductVariant(models.Model):
#     product = models.ForeignKey(
#         Product,
#         related_name="variants",
#         on_delete=models.CASCADE
#     )

#     color = models.CharField(max_length=50)
#     size = models.CharField(max_length=50)

#     stock_quantity = models.PositiveIntegerField(default=0)

#     additional_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0
#     )

#     def __str__(self):
#         return f"{self.product.name} - {self.color} - {self.size}"


# # ==================================================
# # PRODUCT REVIEW
# # ==================================================

# class ProductReview(models.Model):
#     product = models.ForeignKey(
#         Product,
#         related_name="reviews",
#         on_delete=models.CASCADE
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     rating = models.PositiveSmallIntegerField(
#         validators=[
#             MinValueValidator(1),
#             MaxValueValidator(5)
#         ]
#     )

#     review = models.TextField()

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.user.username} - {self.product.name}"


# # ==================================================
# # WISHLIST
# # ==================================================

# class Wishlist(models.Model):
#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         unique_together = ("user", "product")

#     def __str__(self):
#         return f"{self.user.username} - {self.product.name}"


# # ==================================================
# # CART
# # ==================================================

# class Cart(models.Model):
#     cart_code = models.CharField(
#         max_length=100,
#         unique=True
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         blank=True,
#         null=True
#     )

#     paid = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)
#     modified_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.cart_code


# # ==================================================
# # CART ITEM
# # ==================================================

# class CartItem(models.Model):
#     cart = models.ForeignKey(
#         Cart,
#         related_name="items",
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(default=1)

#     def __str__(self):
#         return f"{self.quantity} x {self.product.name}"


# # ==================================================
# # TRANSACTION
# # ==================================================

# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#     )

#     ref = models.CharField(
#         max_length=100,
#         unique=True
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     cart = models.ForeignKey(
#         Cart,
#         on_delete=models.CASCADE
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     currency = models.CharField(
#         max_length=10,
#         default="NGN"
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default="pending"
#     )

#     flutterwave_id = models.CharField(
#         max_length=255,
#         blank=True,
#         null=True
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.ref


# # ==================================================
# # ORDER
# # ==================================================

# class Order(models.Model):
#     ORDER_STATUS = (
#         ("pending", "Pending"),
#         ("paid", "Paid"),
#         ("processing", "Processing"),
#         ("packed", "Packed"),
#         ("shipped", "Shipped"),
#         ("out_for_delivery", "Out For Delivery"),
#         ("delivered", "Delivered"),
#         ("cancelled", "Cancelled"),
#         ("returned", "Returned"),
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="orders"
#     )

#     shipping_address = models.TextField(blank=True, null=True)

#     city = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True
#     )

#     state = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True
#     )

#     country = models.CharField(
#         max_length=100,
#         blank=True,
#         null=True
#     )

#     phone_number = models.CharField(
#         max_length=20,
#         blank=True,
#         null=True
#     )

#     subtotal = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     shipping_fee = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     total_amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     status = models.CharField(
#         max_length=30,
#         choices=ORDER_STATUS,
#         default="pending"
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Order #{self.id}"


# # ==================================================
# # ORDER ITEM
# # ==================================================

# class OrderItem(models.Model):
#     order = models.ForeignKey(
#         Order,
#         related_name="items",
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(default=1)

#     unit_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         default=0
#     )

#     def save(self, *args, **kwargs):
#         if not self.unit_price:
#             self.unit_price = (
#                 self.product.discounted_price
#                 or self.product.price
#             )

#         super().save(*args, **kwargs)

#     @property
#     def total_price(self):
#         return self.unit_price * self.quantity

#     def __str__(self):
#         return f"{self.product.name} x {self.quantity}"


# # ==================================================
# # SHIPMENT
# # ==================================================

# class Shipment(models.Model):
#     order = models.OneToOneField(
#         Order,
#         on_delete=models.CASCADE,
#         related_name="shipment"
#     )

#     courier_name = models.CharField(max_length=100)

#     tracking_number = models.CharField(
#         max_length=255,
#         unique=True
#     )

#     estimated_delivery_date = models.DateField(
#         blank=True,
#         null=True
#     )

#     current_location = models.CharField(
#         max_length=255,
#         blank=True,
#         null=True
#     )

#     status = models.CharField(
#         max_length=100,
#         default="Pending"
#     )

#     def __str__(self):
#         return self.tracking_number

# class RecentlyViewed(models.Model):

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     viewed_at = models.DateTimeField(
#         auto_now=True
#     )

#     def __str__(self):
#         return f"{self.user} viewed {self.product.name}"


# class Coupon(models.Model):

#     code = models.CharField(
#         max_length=50,
#         unique=True
#     )

#     discount_percentage = models.PositiveIntegerField()

#     active = models.BooleanField(
#         default=True
#     )

#     valid_from = models.DateTimeField()

#     valid_to = models.DateTimeField()

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return self.code


# from django.db import models
# from django.conf import settings
# from django.utils.text import slugify
# from django.contrib.auth.models import AbstractUser

# from core.models import CustomUser

# from django.contrib.auth.models import User


# # ---------------- CUSTOM USER ----------------
# # class CustomUser(AbstractUser):
# #     city = models.CharField(max_length=100, blank=True, null=True)
# #     state = models.CharField(max_length=100, blank=True, null=True)
# #     address = models.TextField(blank=True, null=True)
# #     phone = models.CharField(max_length=20, blank=True, null=True)

# #     def __str__(self):
# #         return self.username


# # ---------------- PRODUCT ----------------

# class Product(models.Model):
#     seller = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE,
#         related_name="products"
#     )

#     name = models.CharField(max_length=255)

#     slug = models.SlugField(
#         unique=True
#     )

#     description = models.TextField()

#     short_description = models.CharField(
#         max_length=500
#     )

#     price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     discounted_price = models.DecimalField(
#         max_digits=12,
#         decimal_places=2,
#         null=True,
#         blank=True
#     )

#     stock_quantity = models.PositiveIntegerField(default=0)

#     brand = models.CharField(max_length=200)

#     weight = models.DecimalField(
#         max_digits=8,
#         decimal_places=2,
#         null=True,
#         blank=True
#     )

#     category = models.ForeignKey(
#         "Category",
#         on_delete=models.SET_NULL,
#         null=True
#     )

#     rating = models.DecimalField(
#         max_digits=3,
#         decimal_places=2,
#         default=0
#     )

#     total_reviews = models.PositiveIntegerField(default=0)

#     created_at = models.DateTimeField(auto_now_add=True)

# # 
# class ProductMedia(models.Model):

#     IMAGE = "image"
#     VIDEO = "video"

#     MEDIA_CHOICES = (
#         (IMAGE, "Image"),
#         (VIDEO, "Video"),
#     )

#     product = models.ForeignKey(
#         Product,
#         related_name="media",
#         on_delete=models.CASCADE
#     )

#     media_type = models.CharField(
#         max_length=10,
#         choices=MEDIA_CHOICES
#     )

#     file = models.FileField(
#         upload_to="product_media/"
#     )

#     is_primary = models.BooleanField(
#         default=False
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     def __str__(self):
#         return f"{self.product.name} - {self.media_type}"

# #

# class ProductVariant(models.Model):

#     product = models.ForeignKey(
#         Product,
#         related_name="variants",
#         on_delete=models.CASCADE
#     )

#     color = models.CharField(max_length=50)

#     size = models.CharField(max_length=50)

#     stock_quantity = models.PositiveIntegerField()

#     additional_price = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         default=0
#     )


# class ProductReview(models.Model):

#     product = models.ForeignKey(
#         Product,
#         related_name="reviews",
#         on_delete=models.CASCADE
#     )

#     user = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE
#     )

#     rating = models.PositiveIntegerField()

#     review = models.TextField()

#     created_at = models.DateTimeField(auto_now_add=True)

# #

# class Wishlist(models.Model):

#     user = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

# #

# class Order(models.Model):

#     ORDER_STATUS = (
#         ("pending","Pending"),
#         ("paid","Paid"),
#         ("processing","Processing"),
#         ("packed","Packed"),
#         ("shipped","Shipped"),
#         ("out_for_delivery","Out For Delivery"),
#         ("delivered","Delivered"),
#         ("cancelled","Cancelled"),
#         ("returned","Returned"),
#     )

#     user = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE
#     )

#     shipping_address = models.TextField()

#     city = models.CharField(max_length=100)

#     state = models.CharField(max_length=100)

#     country = models.CharField(max_length=100)

#     phone_number = models.CharField(max_length=20)

#     subtotal = models.DecimalField(max_digits=12, decimal_places=2)

#     shipping_fee = models.DecimalField(max_digits=12, decimal_places=2)

#     total_amount = models.DecimalField(max_digits=12, decimal_places=2)

#     status = models.CharField(
#         max_length=30,
#         choices=ORDER_STATUS,
#         default="pending"
#     )

#     created_at = models.DateTimeField(auto_now_add=True)


# #
# class Shipment(models.Model):

#     order = models.OneToOneField(
#         Order,
#         on_delete=models.CASCADE
#     )

#     courier_name = models.CharField(max_length=100)

#     tracking_number = models.CharField(
#         max_length=255,
#         unique=True
#     )

#     estimated_delivery_date = models.DateField()

#     current_location = models.CharField(
#         max_length=255
#     )

#     status = models.CharField(max_length=100)

# #


# # class Product(models.Model):
# #     CATEGORY = (
# #         ("Electronics", "ELECTRONICS"),
# #         ("Groceries", "GROCERIES"),
# #         ("Clothings", "CLOTHINGS"),
# #     )

# #     name = models.CharField(max_length=100)
# #     slug = models.SlugField(blank=True, null=True)
# #     image = models.ImageField(upload_to="img")
# #     description = models.TextField(blank=True, null=True)
# #     price = models.DecimalField(max_digits=10, decimal_places=2)
# #     category = models.CharField(
# #         max_length=15,
# #         choices=CATEGORY,
# #         blank=True,
# #         null=True
# #     )

# #     def __str__(self):
# #         return self.name

# #     def save(self, *args, **kwargs):
# #         if not self.slug:
# #             base_slug = slugify(self.name)
# #             unique_slug = base_slug
# #             counter = 1

# #             while Product.objects.filter(slug=unique_slug).exists():
# #                 unique_slug = f"{base_slug}-{counter}"
# #                 counter += 1

# #             self.slug = unique_slug

# #         super().save(*args, **kwargs)


# # # ---------------- CART ----------------
# class Cart(models.Model):
#     cart_code = models.CharField(max_length=100, unique=True)

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         blank=True,
#         null=True
#     )

#     paid = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)
#     modified_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.cart_code


# # ---------------- CART ITEM ----------------
# class CartItem(models.Model):
#     cart = models.ForeignKey(
#         Cart,
#         related_name="items",
#         on_delete=models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(default=1)

#     def __str__(self):
#         return f"{self.quantity} x {self.product.name} in cart {self.cart.id}"
    

# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#     )

#     ref = models.CharField(max_length=100, unique=True)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     cart = models.ForeignKey("Cart", on_delete=models.CASCADE)

#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=10, default="NGN")

#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default="pending"
#     )

#     flutterwave_id = models.CharField(max_length=255, null=True, blank=True)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.ref


# # class Order(models.Model):
# #     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="orders")
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     status = models.CharField(max_length=20, default="pending")


# class OrderItem(models.Model):
#     order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
#     product = models.ForeignKey("Product", on_delete=models.CASCADE)
#     quantity = models.PositiveIntegerField(default=1)

#     @property
#     def total_price(self):
#         return self.product.price * self.quantity
    
    
# class Transaction(models.Model):
#     STATUS_PENDING = "pending"
#     STATUS_COMPLETED = "completed"
#     STATUS_FAILED = "failed"

#     STATUS_CHOICES = (
#         (STATUS_PENDING, "Pending"),
#         (STATUS_COMPLETED, "Completed"),
#         (STATUS_FAILED, "Failed"),
#     )

#     ref = models.CharField(
#         max_length=100,
#         unique=True,
#         db_index=True
#     )

#     transaction_id = models.CharField(
#         max_length=255,
#         blank=True,
#         null=True,
#         help_text="Flutterwave transaction ID"
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="transactions"
#     )

#     cart = models.ForeignKey(
#         "Cart",
#         on_delete=models.CASCADE,
#         related_name="transactions"
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     currency = models.CharField(
#         max_length=10,
#         default="NGN"
#     )

#     status = models.CharField(
#         max_length=20,
#         choices=STATUS_CHOICES,
#         default=STATUS_PENDING
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True
#     )

#     updated_at = models.DateTimeField(
#         auto_now=True
#     )

#     class Meta:
#         ordering = ["-created_at"]
#         verbose_name = "Transaction"
#         verbose_name_plural = "Transactions"

#     def __str__(self):
#         return f"{self.ref} - {self.status}"

#     @property
#     def is_successful(self):
#         return self.status == self.STATUS_COMPLETED

#     @property
#     def is_pending(self):
#         return self.status == self.STATUS_PENDING

#     @property
#     def is_failed(self):
#         return self.status == self.STATUS_FAILED


# class Transaction(models.Model):
#     ref = models.CharField(max_length=255, unique=True)

#     cart = models.ForeignKey(
#         Cart,
#         on_delete=models.CASCADE,
#         related_name="transactions"
#     )

#     amount = models.DecimalField(max_digits=10, decimal_places=2)

#     currency = models.CharField(max_length=10, default="NGN")

#     status = models.CharField(
#         max_length=20,
#         default="pending"
#         # can be: pending, completed, failed, etc.
#     )

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         blank=True,
#         null=True
#     )

#     created_at = models.DateTimeField(auto_now_add=True)
#     modified_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Transaction {self.ref} - {self.status}"


# class Transaction(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
#     cart = models.ForeignKey(Cart, on_delete=models.CASCADE)

#     ref = models.CharField(max_length=255, unique=True)

#     transaction_id = models.CharField(
#         max_length=255,
#         null=True,
#         blank=True
#     )

#     amount = models.DecimalField(
#         max_digits=12,
#         decimal_places=2
#     )

#     currency = models.CharField(
#         max_length=10,
#         default="NGN"
#     )

#     status = models.CharField(
#         max_length=20,
#         default="pending"
#     )

#     created_at = models.DateTimeField(auto_now_add=True)

# class Transaction(models.Model):
#     STATUS_CHOICES = (
#         ("pending", "Pending"),
#         ("completed", "Completed"),
#         ("failed", "Failed"),
#     )

#     ref = models.CharField(max_length=100, unique=True)

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE
#     )

#     cart = models.ForeignKey("Cart", on_delete=models.CASCADE)

#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     currency = models.CharField(max_length=10, default="NGN")
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.ref

# from django.db import models
# from django.conf import settings
# from django.utils.text import slugify


# class Product(models.Model):
#     CATEGORY = (
#         ("Electronics", "ELECTRONICS"),
#         ("Groceries", "GROCERIES"),
#         ("Clothings", "CLOTHINGS"),
#     )

#     name = models.CharField(max_length=100)
#     slug = models.SlugField(blank=True, null=True)
#     image = models.ImageField(upload_to="img")
#     description = models.TextField(blank=True, null=True)
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     category = models.CharField(
#         max_length=15,
#         choices=CATEGORY,
#         blank=True,
#         null=True
#     )

#     def __str__(self):
#         return self.name

#     def save(self, *args, **kwargs):
#         if not self.slug:
#             base_slug = slugify(self.name)
#             unique_slug = base_slug
#             counter = 1

#             while Product.objects.filter(slug=unique_slug).exists():
#                 unique_slug = f"{base_slug}-{counter}"
#                 counter += 1

#             self.slug = unique_slug

#         super().save(*args, **kwargs)



# class Cart(models.Model):
#     cart_code = models.CharField(max_length=100, unique=True)

#     user = models.ForeignKey(        
#         settings.AUTH_USER_MODEL,
#         on_delete = models.CASCADE,
#         blank = True,
#         null = True
#     )

#     paid = models.BooleanField(default=False)

#     created_at = models.DateTimeField(auto_now_add=True)
#     modified_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.cart_code


# class CartItem(models.Model):
#     cart = models.ForeignKey(
#         Cart,
#         related_name = "items",
#         on_delete = models.CASCADE
#     )

#     product = models.ForeignKey(
#         Product,
#         on_delete=models.CASCADE
#     )

#     quantity = models.PositiveIntegerField(default=1)

#     def __str__(self):
#         return f"{self.quantity} x {self.product.name} in cart {self.cart.id}"
