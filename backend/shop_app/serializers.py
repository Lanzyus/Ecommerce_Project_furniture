# backend/shop_app/serializers.py

from decimal import Decimal
from datetime import timedelta

import os

import cloudinary
import cloudinary.utils

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Avg

from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
)

from core.models import CustomUser

from .models import (
    Banner,
    ContactMessage,
    Category,
    SubCategory,
    Product,
    ProductMedia,
    ProductVariant,
    ProductReview,
    Wishlist,
    RecentlyViewed,
    Coupon,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Shipment,
    ContactMessage,
    ProductSpecification,
    ProductQuestion,
    StockMovement,
    ShipmentTracking,
)


User = get_user_model()


# ============================================================
# CLOUDINARY PRODUCT MEDIA URL HELPER
# ============================================================

def build_product_media_url(media):
    """
    Build a reliable Cloudinary URL for a ProductMedia object.

    IMPORTANT:

    We do NOT depend on media.file.url here.

    This is intentional because old ProductMedia records may
    contain extensionless Cloudinary public IDs such as:

        product_media/sofa_def_jszjvr

    Django's storage layer receives only that string and therefore
    cannot know whether the asset is an image or video.

    ProductMedia itself has media_type, so we use:

        media.media_type

    as the authoritative resource type.

    Supported database formats:

        image:product_media/sofa_abc.jpg|v123456

        video:product_media/sofa_xyz.mp4|v123456

        product_media/sofa.jpg

        product_media/sofa.mp4

        product_media/sofa_def_jszjvr
    """

    if not media:
        return None

    try:
        stored_name = getattr(
            media.file,
            "name",
            None,
        )
    except Exception:
        stored_name = None

    if not stored_name:
        return None

    try:
        stored_name = (
            str(stored_name)
            .replace("\\", "/")
            .lstrip("/")
        )

        # ----------------------------------------------------
        # DETERMINE RESOURCE TYPE FROM ProductMedia.media_type
        # ----------------------------------------------------

        media_type = str(
            getattr(
                media,
                "media_type",
                "",
            )
        ).lower().strip()

        if media_type == "video":
            resource_type = "video"
        else:
            resource_type = "image"

        # ----------------------------------------------------
        # REMOVE EXPLICIT RESOURCE PREFIX
        # ----------------------------------------------------

        if ":" in stored_name:
            prefix, remainder = (
                stored_name.split(":", 1)
            )

            if prefix in {
                "image",
                "video",
            }:
                stored_name = remainder

        # ----------------------------------------------------
        # REMOVE VERSION
        # ----------------------------------------------------

        version = None

        if "|v" in stored_name:
            stored_name, version_string = (
                stored_name.rsplit("|v", 1)
            )

            try:
                version = int(
                    version_string
                )
            except (
                TypeError,
                ValueError,
            ):
                version = None

        # ----------------------------------------------------
        # CLEAN PATH
        # ----------------------------------------------------

        stored_name = (
            str(stored_name)
            .replace("\\", "/")
            .lstrip("/")
        )

        # ----------------------------------------------------
        # REMOVE product_media PREFIX ONLY IF PRESENT
        # ----------------------------------------------------

        if stored_name.startswith(
            "product_media/"
        ):
            public_id = stored_name[
                len("product_media/") :
            ]
        else:
            public_id = stored_name

        # ----------------------------------------------------
        # REMOVE FILE EXTENSION
        # ----------------------------------------------------

        public_id = os.path.splitext(
            public_id
        )[0]

        public_id = public_id.strip("/")

        if not public_id:
            return None

        # ----------------------------------------------------
        # REBUILD FULL CLOUDINARY PUBLIC ID
        # ----------------------------------------------------

        public_id = (
            f"product_media/{public_id}"
        )

        # ----------------------------------------------------
        # CLOUDINARY CONFIG
        # ----------------------------------------------------

        cloud_name = (
            cloudinary.config().cloud_name
        )

        if not cloud_name:
            return None

        # ----------------------------------------------------
        # BUILD URL
        # ----------------------------------------------------

        url, _ = cloudinary.utils.cloudinary_url(
            public_id,
            resource_type=resource_type,
            type="upload",
            version=version,
            secure=True,
        )

        return url

    except Exception as exc:
        print(
            "PRODUCT MEDIA URL ERROR "
            f"(id={getattr(media, 'id', None)}): "
            f"{exc}"
        )

        return None




# ============================================================
# USER SERIALIZER
# ============================================================

class UserSerializer(serializers.ModelSerializer):

    orders = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "city",
            "country",
            "address",
            "orders",
            "profile_picture",
        ]

    def get_orders(self, obj):
        return OrderSerializer(
            obj.orders.all(),
            many=True,
            context=self.context,
        ).data


# ============================================================
# SHIPMENT TRACKING
# ============================================================

class ShipmentTrackingSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ShipmentTracking

        fields = [
            "id",
            "status",
            "location",
            "note",
            "created_at",
        ]


# ============================================================
# SHIPMENT
# ============================================================

class ShipmentSerializer(
    serializers.ModelSerializer
):

    tracking_updates = (
        ShipmentTrackingSerializer(
            many=True,
            read_only=True,
        )
    )

    order_id = serializers.IntegerField(
        source="order.id",
        read_only=True,
    )

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True,
    )

    customer_username = serializers.CharField(
        source="order.user.username",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    courier_display = serializers.CharField(
        source="get_courier_display",
        read_only=True,
    )

    class Meta:
        model = Shipment

        fields = [
            "id",
            "order_id",
            "order_number",
            "customer_username",
            "courier",
            "courier_display",
            "tracking_number",
            "status",
            "status_display",
            "shipped_at",
            "delivered_at",
            "created_at",
            "tracking_updates",
        ]


# ==========================
# JWT TOKEN SERIALIZER
# ==========================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name

        return token



# ============================================================
# STOCK MOVEMENT
# ============================================================

class StockMovementSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = StockMovement
        fields = "__all__"


# ============================================================
# PRODUCT QUESTION
# ============================================================

class ProductQuestionSerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = ProductQuestion
        fields = "__all__"


# ============================================================
# PRODUCT SPECIFICATION
# ============================================================

class ProductSpecificationSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ProductSpecification
        fields = "__all__"


# ============================================================
# REGISTER
# ============================================================

class RegisterSerializer(
    serializers.ModelSerializer
):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirm_password = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User

        fields = [
            "first_name",
            "last_name",
            "username",
            "email",
            "password",
            "confirm_password",
        ]

    def validate(self, attrs):

        if (
            attrs.get("password")
            != attrs.get("confirm_password")
        ):
            raise serializers.ValidationError(
                {
                    "confirm_password":
                    "Passwords do not match"
                }
            )

        username = attrs.get(
            "username"
        )

        email = attrs.get(
            "email"
        )

        if username and User.objects.filter(
            username=username
        ).exists():
            raise serializers.ValidationError(
                {
                    "username":
                    "Username already exists"
                }
            )

        if email and User.objects.filter(
            email=email
        ).exists():
            raise serializers.ValidationError(
                {
                    "email":
                    "Email already exists"
                }
            )

        return attrs

    def create(
        self,
        validated_data,
    ):

        validated_data.pop(
            "confirm_password",
            None,
        )

        return User.objects.create_user(
            username=validated_data[
                "username"
            ],
            email=validated_data[
                "email"
            ],
            first_name=validated_data.get(
                "first_name",
                "",
            ),
            last_name=validated_data.get(
                "last_name",
                "",
            ),
            password=validated_data[
                "password"
            ],
        )


# ============================================================
# PROFILE UPDATE
# ============================================================

class ProfileUpdateSerializer(
    serializers.ModelSerializer
):

    profile_picture_url = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = User

        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "country",
            "state",
            "city",
            "address",
            "profile_picture",
            "profile_picture_url",
        ]

        read_only_fields = [
            "profile_picture_url",
        ]

    def get_profile_picture_url(
        self,
        obj,
    ):

        if not obj.profile_picture:
            return None

        try:
            url = (
                obj.profile_picture.url
            )
        except (
            ValueError,
            AttributeError,
        ):
            return None

        request = self.context.get(
            "request"
        )

        if request:
            return request.build_absolute_uri(
                url
            )

        return url


# ============================================================
# CONTACT MESSAGE
# ============================================================

class ContactMessageSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ContactMessage
        fields = "__all__"


# ============================================================
# BANNER
# ============================================================

class BannerSerializer(
    serializers.ModelSerializer
):

    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = "__all__"

    def get_image(
        self,
        obj,
    ):

        if not obj.image:
            return None

        try:
            url = obj.image.url
        except (
            ValueError,
            AttributeError,
        ):
            return None

        request = self.context.get(
            "request"
        )

        if request:
            return request.build_absolute_uri(
                url
            )

        return url


# ============================================================
# PRODUCT MEDIA
# ============================================================

class ProductMediaSerializer(
    serializers.ModelSerializer
):

    file = serializers.SerializerMethodField()

    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia

        fields = [
            "id",
            "media_type",
            "file",
            "file_url",
            "is_primary",
            "created_at",
        ]

    def get_file(
        self,
        obj,
    ):
        """
        Always return the Cloudinary URL generated from
        ProductMedia.media_type.
        """

        return build_product_media_url(
            obj
        )

    def get_file_url(
        self,
        obj,
    ):
        """
        Keep file_url identical to file.

        React can therefore safely use either:

            media.file

        or:

            media.file_url
        """

        return build_product_media_url(
            obj
        )


# ============================================================
# PRODUCT VARIANT
# ============================================================

class ProductVariantSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ProductVariant
        fields = "__all__"


# ============================================================
# PRODUCT REVIEW
# ============================================================

class ProductReviewSerializer(
    serializers.ModelSerializer
):

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = ProductReview

        fields = [
            "id",
            "username",
            "rating",
            "comment",
            "created_at",
        ]


# ============================================================
# CATEGORY
# ============================================================

class CategorySerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "slug",
            "image",
        ]


# ============================================================
# SUB CATEGORY
# ============================================================

class SubCategorySerializer(
    serializers.ModelSerializer
):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = SubCategory

        fields = [
            "id",
            "name",
            "slug",
            "image",
            "category",
            "category_name",
        ]


# ============================================================
# CATEGORY DETAIL
# ============================================================

class CategoryDetailSerializer(
    serializers.ModelSerializer
):

    subcategories = (
        SubCategorySerializer(
            many=True,
            read_only=True,
        )
    )

    class Meta:
        model = Category

        fields = [
            "id",
            "name",
            "slug",
            "image",
            "subcategories",
        ]


# ============================================================
# PRODUCT SERIALIZER
# ============================================================

class ProductSerializer(
    serializers.ModelSerializer
):

    is_new = serializers.SerializerMethodField()

    current_price = (
        serializers.SerializerMethodField()
    )

    primary_image = (
        serializers.SerializerMethodField()
    )

    media = ProductMediaSerializer(
        many=True,
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    subcategory_name = serializers.CharField(
        source="subcategory.name",
        read_only=True,
    )

    average_rating = (
        serializers.SerializerMethodField()
    )

    review_count = (
        serializers.SerializerMethodField()
    )

    quantity = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "brand",
            "sku",
            "price",
            "discounted_price",
            "current_price",
            "stock_quantity",
            "rating",
            "total_reviews",
            "is_featured",
            "is_active",
            "category",
            "category_name",
            "subcategory",
            "subcategory_name",
            "primary_image",
            "media",
            "is_new",
            "created_at",
            "updated_at",
            "average_rating",
            "review_count",
            "quantity",
        ]

    # --------------------------------------------------------
    # IS NEW
    # --------------------------------------------------------

    def get_is_new(
        self,
        obj,
    ):

        if not obj.created_at:
            return False

        return obj.created_at >= (
            timezone.now()
            - timedelta(days=7)
        )

    # --------------------------------------------------------
    # CURRENT PRICE
    # --------------------------------------------------------

    def get_current_price(
        self,
        obj,
    ):

        discounted_price = (
            obj.discounted_price
        )

        if (
            discounted_price
            and discounted_price > 0
        ):
            return discounted_price

        return obj.price

    # --------------------------------------------------------
    # AVERAGE RATING
    # --------------------------------------------------------

    # def get_average_rating(
    #     self,
    #     obj,
    # ):

    #     reviews = obj.reviews.filter(
    #         is_approved=True
    #     )
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()

        if not reviews.exists():
            return (
                float(obj.rating)
                if obj.rating
                else 0
            )

        average = reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        if average is None:
            return 0

        return round(
            float(average),
            1,
        )

    # --------------------------------------------------------
    # REVIEW COUNT
    # --------------------------------------------------------

    def get_review_count(
        self,
        obj,
    ):

        return obj.reviews.filter(
            is_approved=True
        ).count()

    # --------------------------------------------------------
    # PRIMARY IMAGE
    # --------------------------------------------------------

    def get_primary_image(
        self,
        obj,
    ):
        """
        Return the primary IMAGE only.

        Never use media.file.url here because old extensionless
        ProductMedia records can make Storage.url() unable to
        determine the Cloudinary resource type.
        """

        media = (
            obj.media.filter(
                media_type="image",
                is_primary=True,
            )
            .first()
        )

        if not media:
            media = (
                obj.media.filter(
                    media_type="image",
                )
                .first()
            )

        if not media:
            return None

        return build_product_media_url(
            media
        )


# ============================================================
# DETAILED PRODUCT
# ============================================================

class DetailedProductSerializer(
    serializers.ModelSerializer
):

    media = ProductMediaSerializer(
        many=True,
        read_only=True,
    )

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    reviews = ProductReviewSerializer(
        many=True,
        read_only=True,
    )

    specifications = (
        ProductSpecificationSerializer(
            many=True,
            read_only=True,
        )
    )

    questions = (
        ProductQuestionSerializer(
            many=True,
            read_only=True,
        )
    )

    current_price = (
        serializers.SerializerMethodField()
    )

    average_rating = (
        serializers.SerializerMethodField()
    )

    review_count = (
        serializers.SerializerMethodField()
    )

    similar_products = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "slug",
            "description",
            "short_description",
            "brand",
            "sku",
            "price",
            "discounted_price",
            "current_price",
            "stock_quantity",
            "rating",
            "total_reviews",
            "average_rating",
            "review_count",
            "is_featured",
            "is_active",
            "category",
            "subcategory",
            "media",
            "variants",
            "reviews",
            "specifications",
            "questions",
            "similar_products",
            "created_at",
        ]

    # --------------------------------------------------------
    # CURRENT PRICE
    # --------------------------------------------------------

    def get_current_price(
        self,
        obj,
    ):

        try:
            return obj.current_price
        except AttributeError:

            if (
                obj.discounted_price
                and obj.discounted_price > 0
            ):
                return obj.discounted_price

            return obj.price

    # --------------------------------------------------------
    # AVERAGE RATING
    # --------------------------------------------------------

    def get_average_rating(
        self,
        obj,
    ):

        reviews = obj.reviews.all()

        if not reviews.exists():

            return (
                float(obj.rating)
                if obj.rating
                else 0
            )

        average = sum(
            float(review.rating)
            for review in reviews
        ) / reviews.count()

        return round(
            average,
            1,
        )

    # --------------------------------------------------------
    # REVIEW COUNT
    # --------------------------------------------------------

    def get_review_count(
        self,
        obj,
    ):

        return obj.reviews.count()

    # --------------------------------------------------------
    # SIMILAR PRODUCTS
    # --------------------------------------------------------

    def get_similar_products(
        self,
        obj,
    ):

        products = (
            Product.objects.filter(
                category=obj.category,
                is_active=True,
            )
            .exclude(
                id=obj.id
            )
            .prefetch_related(
                "media",
                "reviews",
            )[:8]
        )

        return ProductSerializer(
            products,
            many=True,
            context=self.context,
        ).data


# ============================================================
# CART ITEM
# ============================================================

class CartItemSerializer(
    serializers.ModelSerializer
):

    product = ProductSerializer(
        read_only=True,
    )

    total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem

        fields = [
            "id",
            "product",
            "quantity",
            "total",
        ]

    def get_total(
        self,
        obj,
    ):

        if not obj.product:
            return 0

        return float(
            obj.product.current_price
            * obj.quantity
        )


# ============================================================
# CART
# ============================================================

class CartSerializer(
    serializers.ModelSerializer
):

    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    num_of_items = (
        serializers.SerializerMethodField()
    )

    sum_total = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Cart

        fields = [
            "id",
            "cart_code",
            "paid",
            "num_of_items",
            "sum_total",
            "items",
            "created_at",
            "updated_at",
        ]

    def get_num_of_items(
        self,
        obj,
    ):

        return sum(
            item.quantity
            for item in obj.items.all()
        )

    def get_sum_total(
        self,
        obj,
    ):

        total = Decimal("0.00")

        for item in obj.items.all():

            if not item.product:
                continue

            total += (
                item.product.current_price
                * item.quantity
            )

        return float(total)


# ============================================================
# WISHLIST
# ============================================================

class WishlistSerializer(
    serializers.ModelSerializer
):

    product = ProductSerializer(
        read_only=True,
    )

    class Meta:
        model = Wishlist
        fields = "__all__"
        read_only_fields = [
            "user"
        ]


# ============================================================
# RECENTLY VIEWED
# ============================================================

class RecentlyViewedSerializer(
    serializers.ModelSerializer
):

    product = ProductSerializer(
        read_only=True,
    )

    class Meta:
        model = RecentlyViewed

        fields = [
            "id",
            "product",
            "viewed_at",
        ]


# ============================================================
# ORDER ITEM
# ============================================================

class OrderItemSerializer(
    serializers.ModelSerializer
):

    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
        allow_null=True,
    )

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
        allow_null=True,
    )

    product_slug = serializers.CharField(
        source="product.slug",
        read_only=True,
        allow_null=True,
    )

    product_image = (
        serializers.SerializerMethodField()
    )

    shop_name = serializers.CharField(
        source="product.shop.name",
        read_only=True,
        allow_null=True,
    )

    seller_username = serializers.CharField(
        source="product.seller.username",
        read_only=True,
        allow_null=True,
    )

    total_price = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = OrderItem

        fields = [
            "id",

            "product_id",
            "product_name",
            "product_slug",
            "product_image",

            "shop_name",
            "seller_username",

            "quantity",
            "unit_price",
            "total_price",
        ]

        read_only_fields = fields

    # --------------------------------------------------------
    # PRODUCT IMAGE
    # --------------------------------------------------------

    def get_product_image(
        self,
        obj,
    ):
        """
        Return an IMAGE URL only.

        Videos are deliberately excluded.

        The URL is generated using ProductMedia.media_type,
        so extensionless legacy Cloudinary records work.
        """

        product = getattr(
            obj,
            "product",
            None,
        )

        if not product:
            return None

        # ----------------------------------------------------
        # PRIMARY IMAGE
        # ----------------------------------------------------

        media = (
            product.media.filter(
                media_type="image",
                is_primary=True,
            )
            .first()
        )

        # ----------------------------------------------------
        # FALLBACK IMAGE
        # ----------------------------------------------------

        if not media:

            media = (
                product.media.filter(
                    media_type="image",
                )
                .first()
            )

        if not media:
            return None

        return build_product_media_url(
            media
        )

    # --------------------------------------------------------
    # TOTAL PRICE
    # --------------------------------------------------------

    def get_total_price(
        self,
        obj,
    ):

        quantity = (
            obj.quantity
            or 0
        )

        unit_price = (
            obj.unit_price
            if obj.unit_price is not None
            else Decimal("0.00")
        )

        return (
            quantity
            * unit_price
        )





# from decimal import Decimal
# from django.contrib.auth import get_user_model
# from rest_framework import serializers
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from django.contrib.auth import get_user_model
# from django.utils import timezone
# from datetime import timedelta

# from datetime import timedelta

# from rest_framework import serializers

# from core.models import CustomUser
   
# from rest_framework import serializers

# from .models import (
#     Banner,
#     ContactMessage,
#     Category,
#     SubCategory,
#     Product,
#     ProductMedia,
#     ProductVariant,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Coupon,
#     Cart,
#     CartItem,
#     Order,
#     OrderItem,
#     Shipment,
#     ContactMessage,
#     ProductSpecification,
#     ProductQuestion,
#     StockMovement,
#     ShipmentTracking,
    
# )

# User = get_user_model()


# # ==================================================
# # RegisterSerializer
# # ==================================================
 
# # ==================================================
# # SHIPMENT TRACKING SERIALIZER
# # ==================================================

# class ShipmentTrackingSerializer(
#     serializers.ModelSerializer
# ):

#     class Meta:
#         model = ShipmentTracking
#         fields = [
#             "id",
#             "status",
#             "location",
#             "note",
#             "created_at",
#         ]


# # ==================================================
# # SHIPMENT SERIALIZER
# # ==================================================
# class ShipmentSerializer(
#     serializers.ModelSerializer
# ):

#     tracking_updates = ShipmentTrackingSerializer(
#         many=True,
#         read_only=True
#     )

#     order_id = serializers.IntegerField(
#         source="order.id",
#         read_only=True
#     )

#     order_number = serializers.CharField(
#         source="order.order_number",
#         read_only=True
#     )

#     customer_username = serializers.CharField(
#         source="order.user.username",
#         read_only=True
#     )

#     status_display = serializers.CharField(
#         source="get_status_display",
#         read_only=True
#     )

#     courier_display = serializers.CharField(
#         source="get_courier_display",
#         read_only=True
#     )

#     class Meta:
#         model = Shipment

#         fields = [
#             "id",
#             "order_id",
#             "order_number",
#             "customer_username",
#             "courier",
#             "courier_display",
#             "tracking_number",
#             "status",
#             "status_display",
#             "shipped_at",
#             "delivered_at",
#             "created_at",
#             "tracking_updates",
#         ]


# # class ShipmentSerializer(
# #     serializers.ModelSerializer
# # ):

# #     tracking_updates = ShipmentTrackingSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     order_id = serializers.IntegerField(
# #         source="order.id",
# #         read_only=True
# #     )

# #     order_number = serializers.CharField(
# #         source="order.order_number",
# #         read_only=True
# #     )

# #     customer_username = serializers.CharField(
# #         source="order.user.username",
# #         read_only=True
# #     )

# #     status_display = serializers.CharField(
# #         source="get_status_display",
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Shipment

# #         fields = [
# #             "id",
# #             "order_id",
# #             "order_number",
# #             "customer_username",
# #             "courier",
# #             "tracking_number",
# #             "status",
# #             "status_display",
# #             "shipped_at",
# #             "delivered_at",
# #             "created_at",
# #             "tracking_updates",
# #         ]

# # ==================================================
# # RegisterSerializer
# # ================================================== 

# class StockMovementSerializer(
#     serializers.ModelSerializer
# ):
#     class Meta:
#         model = StockMovement
#         fields = "__all__"


# # ==================================================
# # ProductQuestionSerializer
# # ================================================== 

# class ProductQuestionSerializer(
#     serializers.ModelSerializer
# ):
#     username = serializers.CharField(
#         source="user.username",
#         read_only=True
#     )

#     class Meta:
#         model = ProductQuestion
#         fields = "__all__"

# # ==================================================
# # RegisterSerializer
# # ================================================== 

# class ProductSpecificationSerializer(
#     serializers.ModelSerializer
# ):
#     class Meta:
#         model = ProductSpecification
#         fields = "__all__"

# # ==================================================
# # RegisterSerializer
# # ================================================== 

# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, min_length=6)
#     password2 = serializers.CharField(write_only=True)

#     class Meta:
#         model = User
#         fields = [
#             "username",
#             "email",
#             "password",
#             "password2",
#             "first_name",
#             "last_name",
#         ]

#     def validate(self, attrs):
#         if attrs["password"] != attrs["password2"]:
#             raise serializers.ValidationError(
#                 {"password": "Passwords do not match"}
#             )

#         if User.objects.filter(username=attrs["username"]).exists():
#             raise serializers.ValidationError(
#                 {"username": "Username already exists"}
#             )

#         if User.objects.filter(email=attrs["email"]).exists():
#             raise serializers.ValidationError(
#                 {"email": "Email already exists"}
#             )

#         return attrs

#     def create(self, validated_data):
#         validated_data.pop("password2")

#         user = User.objects.create_user(
#             username=validated_data["username"],
#             email=validated_data["email"],
#             password=validated_data["password"],
#             first_name=validated_data.get("first_name", ""),
#             last_name=validated_data.get("last_name", ""),
#         )

#         return user

# # ==================================================
# # UserUpdate
# # ==================================================

# class ProfileUpdateSerializer(serializers.ModelSerializer):

#     profile_picture_url = serializers.SerializerMethodField()

#     class Meta:
#         model = User

#         fields = [
#             "first_name",
#             "last_name",
#             "email",
#             "phone",
#             "country",
#             "state",
#             "city",
#             "address",
#             "profile_picture",
#             "profile_picture_url",
#         ]

#         read_only_fields = [
#             "profile_picture_url",
#         ]

#     def get_profile_picture_url(self, obj):

#         if not obj.profile_picture:
#             return None

#         try:
#             url = obj.profile_picture.url
#         except ValueError:
#             return None

#         request = self.context.get("request")

#         if request:
#             return request.build_absolute_uri(url)

#         return url

# # class ProfileUpdateSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = User
# #         fields = [
# #             "first_name",
# #             "last_name",
# #             "email",
# #             "phone",
# #             "country",
# #             "state",
# #             "city",
# #             "address",
# #         ]

# # class UserUpdateSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = User
# #         fields = [
# #             "first_name",
# #             "last_name",
# #             "email",
# #             "phone",
# #             "address",
# #             "city",
# #             "state",
# #             "country",
# #         ]

# # ==================================================
# # CONTACT
# # ==================================================

# class ContactMessageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ContactMessage
#         fields = "__all__"

# # ==================================================
# # BANNER
# # ==================================================

# class BannerSerializer(serializers.ModelSerializer):
#     image = serializers.SerializerMethodField()

#     class Meta:
#         model = Banner
#         fields = "__all__"

#     def get_image(self, obj):
#         request = self.context.get("request")

#         if obj.image:
#             return request.build_absolute_uri(
#                 obj.image.url
#             )

#         return None

# # ==================================================
# # Register
# # ==================================================
# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(
#         write_only=True,
#         min_length=8
#     )
#     confirm_password = serializers.CharField(
#         write_only=True
#     )

#     class Meta:
#         model = User
#         fields = [
#             "first_name",
#             "last_name",
#             "username",
#             "email",
#             "password",
#             "confirm_password",
#         ]

#     def validate(self, attrs):
#         if attrs.get("password") != attrs.get("confirm_password"):
#             raise serializers.ValidationError(
#                 {"confirm_password": "Passwords do not match"}
#             )
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop("confirm_password", None)

#         return User.objects.create_user(
#             username=validated_data["username"],
#             email=validated_data["email"],
#             first_name=validated_data.get("first_name", ""),
#             last_name=validated_data.get("last_name", ""),
#             password=validated_data["password"],
#         )

# # ==================================================
# # CONTACT
# # ==================================================

# class ContactMessageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ContactMessage
#         fields = "__all__"


# # ==================================================
# # PRODUCT MEDIA
# # ==================================================

# class ProductMediaSerializer(serializers.ModelSerializer):
#     file = serializers.SerializerMethodField()
#     file_url = serializers.SerializerMethodField()

#     class Meta:
#         model = ProductMedia
#         fields = [
#             "id",
#             "media_type",
#             "file",
#             "file_url",
#             "is_primary",
#             "created_at",
#         ]

#     def _get_cloudinary_url(self, obj):
#         """
#         Build the Cloudinary URL using ProductMedia.media_type
#         instead of trying to determine the resource type from
#         the stored filename.
#         """

#         if not obj or not obj.file:
#             return None

#         try:
#             import os
#             import cloudinary

#             cloud_name = cloudinary.config().cloud_name

#             if not cloud_name:
#                 return None

#             stored_name = str(obj.file.name).replace("\\", "/").lstrip("/")

#             # Remove media/ prefix if it exists.
#             if stored_name.startswith("media/"):
#                 stored_name = stored_name[len("media/"):]

#             # Remove product_media/ prefix if it exists.
#             if stored_name.startswith("product_media/"):
#                 public_id = stored_name[len("product_media/"):]
#             else:
#                 public_id = stored_name

#             # Remove extension if one exists.
#             public_id = os.path.splitext(public_id)[0]

#             # IMPORTANT:
#             # Determine Cloudinary resource type from ProductMedia.media_type.
#             if obj.media_type == ProductMedia.VIDEO:
#                 resource_type = "video"
#             else:
#                 resource_type = "image"

#             return (
#                 f"https://res.cloudinary.com/"
#                 f"{cloud_name}/"
#                 f"{resource_type}/upload/"
#                 f"product_media/{public_id}"
#             )

#         except Exception as exc:
#             print(
#                 f"PRODUCT MEDIA URL ERROR "
#                 f"(id={getattr(obj, 'id', None)}): {exc}"
#             )
#             return None

#     def get_file(self, obj):
#         return self._get_cloudinary_url(obj)

#     def get_file_url(self, obj):
#         return self._get_cloudinary_url(obj)
       
# # class ProductMediaSerializer(serializers.ModelSerializer):
# #     file_url = serializers.SerializerMethodField()

# #     class Meta:
# #         model = ProductMedia
# #         fields = [
# #             "id",
# #             "media_type",
# #             "file",
# #             "file_url",
# #             "is_primary",
# #             "created_at",
# #         ]

# #     def get_file_url(self, obj):
# #         if not obj.file:
# #             return None

# #         try:
# #             file_name = obj.file.name

# #             # Cloudinary cloud name
# #             cloud_name = "tkmeq34s"

# #             # Decide Cloudinary resource type from media_type
# #             if obj.media_type == "video":
# #                 resource_type = "video"
# #             else:
# #                 resource_type = "image"

# #             return (
# #                 f"https://res.cloudinary.com/"
# #                 f"{cloud_name}/"
# #                 f"{resource_type}/upload/v1/"
# #                 f"{file_name}"
# #             )

# #         except Exception:
# #             return None
       



# # class ProductMediaSerializer(serializers.ModelSerializer):

# #     file_url = serializers.SerializerMethodField()

# #     class Meta:
# #         model = ProductMedia
# #         fields = [
# #             "id",
# #             "media_type",
# #             "file",
# #             "file_url",
# #             "is_primary",
# #             "created_at",
# #         ]

# #     def get_file_url(self, obj):
# #         request = self.context.get("request")

# #         if not obj.file:
# #             return None

# #         if request:
# #             return request.build_absolute_uri(obj.file.url)

# #         return obj.file.url


# # ==================================================
# # PRODUCT VARIANT
# # ==================================================

# class ProductVariantSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = ProductVariant
#         fields = "__all__"


# # ==================================================
# # PRODUCT REVIEW
# # ==================================================

# class ProductReviewSerializer(serializers.ModelSerializer):

#     username = serializers.CharField(
#         source="user.username",
#         read_only=True
#     )

#     class Meta:
#         model = ProductReview
#         fields = [
#             "id",
#             "username",
#             "rating",
#             "comment",
#             "created_at",
#         ]



# # ==================================================
# # CATEGORY
# # ==================================================

# class CategorySerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Category
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#         ]


# # ==================================================
# # SUB CATEGORY
# # ==================================================

# class SubCategorySerializer(serializers.ModelSerializer):

#     category_name = serializers.CharField(
#         source="category.name",
#         read_only=True
#     )

#     class Meta:
#         model = SubCategory
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "category",
#             "category_name",
#         ]


# # ==================================================
# # CATEGORY DETAIL
# # ==================================================

# class CategoryDetailSerializer(serializers.ModelSerializer):

#     subcategories = SubCategorySerializer(
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = Category
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "subcategories",
#         ]


# # ==================================================
# # PRODUCT LIST
# # ==================================================
# from django.db.models import Avg

# class ProductSerializer(serializers.ModelSerializer):
#     is_new = serializers.SerializerMethodField()
#     current_price = serializers.SerializerMethodField()
#     primary_image = serializers.SerializerMethodField()

#     media = ProductMediaSerializer(
#         many=True,
#         read_only=True
#     )

#     category_name = serializers.CharField(
#         source="category.name",
#         read_only=True
#     )

#     subcategory_name = serializers.CharField(
#         source="subcategory.name",
#         read_only=True
#     )

#     average_rating = serializers.FloatField(
#         read_only=True
#     )

#     review_count = serializers.IntegerField(
#         read_only=True
#     )

#     quantity = serializers.IntegerField(
#         read_only=True
#         )


#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "description",
#             "short_description",
#             "brand",
#             "sku",
#             "price",
#             "discounted_price",
#             "current_price",
#             "stock_quantity",
#             "rating",
#             "total_reviews",
#             "is_featured",
#             "is_active",
#             "category",
#             "category_name",
#             "subcategory",
#             "subcategory_name",
#             "primary_image",
#             "media",
#             "is_new",
#             "created_at",
#             "updated_at",
#             "average_rating",
#             "review_count",
#             "quantity", 
#         ]

#     def get_is_new(self, obj):
#         """
#         Product is considered new if created within the last 7 days.
#         """
#         if not obj.created_at:
#             return False

#         return obj.created_at >= (
#             timezone.now() - timedelta(days=7)
#         )

#     def get_current_price(self, obj):
#         """
#         Returns discounted price if available,
#         otherwise returns regular price.
#         """
#         if obj.discounted_price and obj.discounted_price > 0:
#             return obj.discounted_price

#         return obj.price

  

#     def get_average_rating(self, obj):
#         reviews = obj.reviews.filter(is_approved=True)

#         if reviews.exists():
#             return round(
#                 reviews.aggregate(
#                     Avg("rating")
#                 )["rating__avg"],
#                 1,
#             )

#         return 0


#     def get_review_count(self, obj):
#         return obj.reviews.filter(
#             is_approved=True
#         ).count()

#     def get_primary_image(self, obj):
#         """
#         Returns the primary image URL.
#         Falls back to the first image if no primary image exists.
#         """
#         media = obj.media.filter(
#             media_type="image",
#             is_primary=True
#         ).first()

#         if not media:
#             media = obj.media.filter(
#                 media_type="image"
#             ).first()

#         if media and media.file:
#             request = self.context.get("request")

#             if request:
#                 return request.build_absolute_uri(
#                     media.file.url
#                 )

#             return media.file.url

#         return None


# # ==================================================
# # PRODUCT DETAIL
# # ==================================================


# class DetailedProductSerializer(serializers.ModelSerializer):
#     media = ProductMediaSerializer(
#         many=True,
#         read_only=True
#     )

#     variants = ProductVariantSerializer(
#         many=True,
#         read_only=True
#     )

#     reviews = ProductReviewSerializer(
#         many=True,
#         read_only=True
#     )

#     specifications = ProductSpecificationSerializer(
#             many=True,
#             read_only=True
#         )

#     questions = ProductQuestionSerializer(
#             many=True,
#             read_only=True
#         )

#     current_price = serializers.SerializerMethodField()
#     average_rating = serializers.SerializerMethodField()
#     review_count = serializers.SerializerMethodField()
#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#

#         fields = [
#             "id",
#             "name",
#             "slug",
#             "description",
#             "short_description",
#             "brand",
#             "sku",
#             "price",
#             "discounted_price",
#             "current_price",
#             "stock_quantity",
#             "rating",
#             "total_reviews",
#             "average_rating",
#             "review_count",
#             "is_featured",
#             "is_active",
#             "category",
#             "subcategory",
#             "media",
#             "variants",
#             "reviews",
#             "specifications",
#             "questions",
#             "similar_products",
#             "created_at",
#         ]

#     def get_current_price(self, obj):
#         """
#         Returns discounted price if available,
#         otherwise returns the regular price.
#         """
#         return obj.current_price

#     def get_average_rating(self, obj):
#         """
#         Calculates average rating from reviews.
#         Falls back to product.rating if no reviews exist.
#         """
#         reviews = obj.reviews.all()

#         if reviews.exists():
#             avg = sum(review.rating for review in reviews) / reviews.count()
#             return round(avg, 1)

#         return obj.rating if obj.rating else 0

#     def get_review_count(self, obj):
#         """
#         Returns total number of reviews.
#         """
#         return obj.reviews.count()

#     def get_similar_products(self, obj):
#         """
#         Returns products from the same category.
#         """
#         products = Product.objects.filter(
#             category=obj.category,
#             is_active=True
#         ).exclude(
#             id=obj.id
#         )[:8]

#         return ProductSerializer(
#             products,
#             many=True,
#             context=self.context
#         ).data


# # class DetailedProductSerializer(serializers.ModelSerializer):

# #     media = ProductMediaSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     variants = ProductVariantSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     reviews = ProductReviewSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     similar_products = serializers.SerializerMethodField()

# #     current_price = serializers.SerializerMethodField()

# #     average_rating = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Product
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "description",
# #             "short_description",
# #             "brand",
# #             "sku",
# #             "price",
# #             "discounted_price",
# #             "current_price",
# #             "stock_quantity",
# #             "rating",
# #             "total_reviews",
# #             "average_rating",
# #             "is_featured",
# #             "is_active",
# #             "category",
# #             "subcategory",
# #             "media",
# #             "variants",
# #             "reviews",
# #             "similar_products",
# #             "created_at",
# #         ]

# #     def get_current_price(self, obj):
# #         return obj.current_price

# #     def get_average_rating(self, obj):
# #         return obj.rating

# #     def get_similar_products(self, obj):

# #         products = Product.objects.filter(
# #             category=obj.category,
# #             is_active=True
# #         ).exclude(
# #             id=obj.id
# #         )[:8]

# #         return ProductSerializer(
# #             products,
# #             many=True,
# #             context=self.context
# #         ).data


# # ==================================================
# # CART ITEM
# # ==================================================

# class CartItemSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     total = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = [
#             "id",
#             "product",
#             "quantity",
#             "total",
#         ]

#     def get_total(self, obj):

#         return float(
#             obj.product.current_price * obj.quantity
#         )


# # ==================================================
# # CART
# # ==================================================

# class CartSerializer(serializers.ModelSerializer):

#     items = CartItemSerializer(
#         many=True,
#         read_only=True
#     )

#     num_of_items = serializers.SerializerMethodField()

#     sum_total = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "paid",
#             "num_of_items",
#             "sum_total",
#             "items",
#             "created_at",
#             "updated_at",
#         ]

#     def get_num_of_items(self, obj):

#         return sum(
#             item.quantity
#             for item in obj.items.all()
#         )

#     def get_sum_total(self, obj):

#         total = Decimal("0.00")

#         for item in obj.items.all():
#             total += (
#                 item.product.current_price
#                 * item.quantity
#             )

#         return float(total)


# # ==================================================
# # WISHLIST
# # ==================================================

# class WishlistSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(
#         read_only=True
#     )
     
#     class Meta:
#         model = Wishlist
#         fields = "__all__"
#         read_only_fields = ["user"]

# # ==================================================
# # RECENTLY VIEWED
# # ==================================================

# class RecentlyViewedSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     class Meta:
#         model = RecentlyViewed
#         fields = [
#             "id",
#             "product",
#             "viewed_at",
#         ]


# # ==================================================
# # ORDER ITEM
# # ==================================================
# # class OrderItemSerializer(serializers.ModelSerializer):
# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     product_image = serializers.SerializerMethodField()

# #     class Meta:
# #         model = OrderItem
# #         fields = [
# #             "id",
# #             "product_name",
# #             "product_image",
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #         ]

# #     def get_product_image(self, obj):
# #         """
# #         Return the primary product image.
# #         If there is no primary image, return the first available image.
# #         """
# #         product = getattr(obj, "product", None)

# #         if not product:
# #             return None

# #         media = product.media.all()

# #         if not media.exists():
# #             return None

# #         # Prefer primary image
# #         primary_image = media.filter(is_primary=True).first()

# #         # Fall back to first image
# #         image = primary_image or media.first()

# #         if not image or not image.file:
# #             return None

# #         request = self.context.get("request")

# #         if request:
# #             return request.build_absolute_uri(image.file.url)

# #         return image.file.url
# # ============================================================
# # ORDER ITEM SERIALIZER
# # ============================================================

# # ============================================================
# # ORDER ITEM SERIALIZER
# # ============================================================


# from decimal import Decimal
# from rest_framework import serializers

# class OrderItemSerializer(serializers.ModelSerializer):

#     # ========================================================
#     # PRODUCT ID
#     # ========================================================

#     product_id = serializers.IntegerField(
#         source="product.id",
#         read_only=True,
#         allow_null=True,
#     )

#     # ========================================================
#     # PRODUCT NAME
#     # ========================================================

#     product_name = serializers.CharField(
#         source="product.name",
#         read_only=True,
#         allow_null=True,
#     )

#     # ========================================================
#     # PRODUCT SLUG
#     # ========================================================

#     product_slug = serializers.CharField(
#         source="product.slug",
#         read_only=True,
#         allow_null=True,
#     )

#     # ========================================================
#     # PRODUCT IMAGE
#     # ========================================================

#     product_image = serializers.SerializerMethodField()

#     # ========================================================
#     # SHOP
#     # ========================================================

#     shop_name = serializers.CharField(
#         source="product.shop.name",
#         read_only=True,
#         allow_null=True,
#     )

#     # ========================================================
#     # SELLER
#     # ========================================================

#     seller_username = serializers.CharField(
#         source="product.seller.username",
#         read_only=True,
#         allow_null=True,
#     )

#     # ========================================================
#     # TOTAL PRICE
#     # ========================================================

#     total_price = serializers.SerializerMethodField()

#     # ========================================================
#     # META
#     # ========================================================

#     class Meta:
#         model = OrderItem

#         fields = [
#             "id",

#             # Product
#             "product_id",
#             "product_name",
#             "product_slug",
#             "product_image",

#             # Seller / Shop
#             "shop_name",
#             "seller_username",

#             # Order item
#             "quantity",
#             "unit_price",
#             "total_price",
#         ]

#         read_only_fields = fields

#     # ========================================================
#     # PRODUCT IMAGE
#     # ========================================================

#     def get_product_image(self, obj):

#         product = getattr(obj, "product", None)

#         if not product:
#             return None

#         # ----------------------------------------------------
#         # PRIMARY IMAGE
#         # ----------------------------------------------------

#         media = (
#             product.media
#             .filter(
#                 media_type="image",
#                 is_primary=True,
#             )
#             .first()
#         )

#         # ----------------------------------------------------
#         # FALLBACK TO FIRST IMAGE
#         # ----------------------------------------------------

#         if not media:
#             media = (
#                 product.media
#                 .filter(
#                     media_type="image",
#                 )
#                 .first()
#             )

#         # ----------------------------------------------------
#         # NO IMAGE
#         # ----------------------------------------------------

#         if not media or not media.file:
#             return None

#         # ----------------------------------------------------
#         # GET IMAGE URL
#         # ----------------------------------------------------

#         try:
#             image_url = media.file.url
#         except ValueError:
#             return None

#         # ----------------------------------------------------
#         # BUILD ABSOLUTE BACKEND URL
#         # ----------------------------------------------------

#         request = self.context.get("request")

#         if request:
#             return request.build_absolute_uri(image_url)

#         # If request context is unavailable
#         return image_url

#     # ========================================================
#     # TOTAL PRICE
#     # ========================================================

#     def get_total_price(self, obj):

#         quantity = obj.quantity or 0

#         unit_price = (
#             obj.unit_price
#             if obj.unit_price is not None
#             else Decimal("0.00")
#         )

#         return quantity * unit_price


# # from decimal import Decimal

# # from rest_framework import serializers

# # from .models import OrderItem


# # class OrderItemSerializer(serializers.ModelSerializer):

# #     # ========================================================
# #     # PRODUCT ID
# #     # ========================================================

# #     product_id = serializers.IntegerField(
# #         source="product.id",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # ========================================================
# #     # PRODUCT NAME
# #     # ========================================================

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # ========================================================
# #     # PRODUCT SLUG
# #     # ========================================================

# #     product_slug = serializers.CharField(
# #         source="product.slug",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # ========================================================
# #     # PRODUCT IMAGE
# #     # ========================================================

# #     product_image = serializers.SerializerMethodField()

# #     # ========================================================
# #     # SHOP
# #     # ========================================================

# #     shop_name = serializers.CharField(
# #         source="product.shop.name",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # ========================================================
# #     # SELLER
# #     # ========================================================

# #     seller_username = serializers.CharField(
# #         source="product.seller.username",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # ========================================================
# #     # TOTAL PRICE
# #     # ========================================================

# #     total_price = serializers.SerializerMethodField()

# #     # ========================================================
# #     # META
# #     # ========================================================

# #     class Meta:

# #         model = OrderItem

# #         fields = [
# #             "id",

# #             # Product
# #             "product_id",
# #             "product_name",
# #             "product_slug",
# #             "product_image",

# #             # Seller / Shop
# #             "shop_name",
# #             "seller_username",

# #             # Order item
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #         ]

# #         read_only_fields = fields

# #     # ========================================================
# #     # PRODUCT IMAGE
# #     # ========================================================

# #     def get_product_image(self, obj):

# #         product = getattr(obj, "product", None)

# #         # Product does not exist
# #         if not product:
# #             return None

# #         # ----------------------------------------------------
# #         # PRIMARY IMAGE
# #         # ----------------------------------------------------

# #         media = (
# #             product.media
# #             .filter(
# #                 media_type="image",
# #                 is_primary=True,
# #             )
# #             .first()
# #         )

# #         # ----------------------------------------------------
# #         # FALLBACK TO FIRST IMAGE
# #         # ----------------------------------------------------

# #         if not media:

# #             media = (
# #                 product.media
# #                 .filter(
# #                     media_type="image",
# #                 )
# #                 .first()
# #             )

# #         # ----------------------------------------------------
# #         # NO MEDIA
# #         # ----------------------------------------------------

# #         if not media:
# #             return None

# #         if not media.file:
# #             return None

# #         # ----------------------------------------------------
# #         # BUILD URL
# #         # ----------------------------------------------------

# #         try:

# #             image_url = media.file.url

# #         except ValueError:

# #             return None

# #         request = self.context.get("request")

# #         if request:
# #             return request.build_absolute_uri(image_url)

# #         return image_url

# #     # ========================================================
# #     # TOTAL PRICE
# #     # ========================================================

# #     def get_total_price(self, obj):

# #         quantity = obj.quantity or 0

# #         unit_price = (
# #             obj.unit_price
# #             if obj.unit_price is not None
# #             else Decimal("0.00")
# #         )

# #         return quantity * unit_price


# # class OrderItemSerializer(serializers.ModelSerializer):

# #     # --------------------------------------------------------
# #     # PRODUCT ID
# #     # --------------------------------------------------------

# #     product_id = serializers.IntegerField(
# #         source="product.id",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # --------------------------------------------------------
# #     # PRODUCT NAME
# #     # --------------------------------------------------------

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # --------------------------------------------------------
# #     # PRODUCT SLUG
# #     # --------------------------------------------------------

# #     product_slug = serializers.CharField(
# #         source="product.slug",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # --------------------------------------------------------
# #     # PRODUCT IMAGE
# #     # --------------------------------------------------------

# #     product_image = serializers.SerializerMethodField()

# #     # --------------------------------------------------------
# #     # SHOP
# #     # --------------------------------------------------------

# #     shop_name = serializers.CharField(
# #         source="product.shop.name",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # --------------------------------------------------------
# #     # SELLER
# #     # --------------------------------------------------------

# #     seller_username = serializers.CharField(
# #         source="product.seller.username",
# #         read_only=True,
# #         allow_null=True,
# #     )

# #     # --------------------------------------------------------
# #     # TOTAL
# #     # --------------------------------------------------------

# #     total_price = serializers.SerializerMethodField()

# #     # ========================================================
# #     # META
# #     # ========================================================

# #     class Meta:

# #         model = OrderItem

# #         fields = [
# #             "id",

# #             # Product
# #             "product_id",
# #             "product_name",
# #             "product_slug",
# #             "product_image",

# #             # Seller / shop
# #             "shop_name",
# #             "seller_username",

# #             # Order item
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #         ]

# #         read_only_fields = fields

# #     # ========================================================
# #     # PRODUCT IMAGE
# #     # ========================================================

# #     def get_product_image(self, obj):

# #         product = getattr(
# #             obj,
# #             "product",
# #             None,
# #         )

# #         if not product:
# #             return None

# #         # ----------------------------------------------------
# #         # FIRST: PRIMARY IMAGE
# #         # ----------------------------------------------------

# #         media = (
# #             product.media
# #             .filter(
# #                 media_type="image",
# #                 is_primary=True,
# #             )
# #             .first()
# #         )

# #         # ----------------------------------------------------
# #         # FALLBACK: FIRST IMAGE
# #         # ----------------------------------------------------

# #         if not media:

# #             media = (
# #                 product.media
# #                 .filter(
# #                     media_type="image",
# #                 )
# #                 .first()
# #             )

# #         # ----------------------------------------------------
# #         # NO IMAGE
# #         # ----------------------------------------------------

# #         if not media:
# #             return None

# #         if not media.file:
# #             return None

# #         # ----------------------------------------------------
# #         # BUILD ABSOLUTE URL
# #         # ----------------------------------------------------

# #         request = self.context.get(
# #             "request"
# #         )

# #         if request:

# #             return request.build_absolute_uri(
# #                 media.file.url
# #             )

# #         return media.file.url

# #     # ========================================================
# #     # TOTAL PRICE
# #     # ========================================================

# #     def get_total_price(self, obj):

# #         quantity = obj.quantity or 0
# #         unit_price = obj.unit_price or Decimal("0.00")

# #         return quantity * unit_price


# # ============================================================
# # ORDER SERIALIZER
# # ============================================================

# ============================================================
# ORDER SERIALIZER
# ============================================================

class OrderSerializer(serializers.ModelSerializer):

    orderitems = OrderItemSerializer(
        source="items",
        many=True,
        read_only=True,
    )

    shipment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "payment_method",
            "payment_type",
            "subtotal",
            "total_amount",
            "created_at",
            "orderitems",
            "shipment",
        ]
        read_only_fields = fields

    def get_shipment(self, obj):
        shipment = getattr(obj, "shipment", None)
        if not shipment:
            return None
        return ShipmentSerializer(shipment, context=self.context).data

# class OrderSerializer(
#     serializers.ModelSerializer
# ):

#     orderitems = OrderItemSerializer(
#         source="items",
#         many=True,
#         read_only=True,
#     )

#     shipment = ShipmentSerializer(
#         read_only=True,
#     )

#     class Meta:

#         model = Order

#         fields = [
#             "id",
#             "order_number",

#             "status",

#             "payment_method",
#             "payment_type",

#             "subtotal",
#             "total_amount",

#             "created_at",

#             "orderitems",

#             "shipment",
#         ]

#         read_only_fields = fields


# # ============================================================
# # ORDER DETAIL SERIALIZER
# # ============================================================

class OrderDetailSerializer(
    serializers.ModelSerializer
):

    # IMPORTANT:
    # The frontend can consistently use "orderitems".

    orderitems = OrderItemSerializer(
        source="items",
        many=True,
        read_only=True,
    )

    shipment = serializers.SerializerMethodField()

    class Meta:

        model = Order

        fields = [
            "id",
            "order_number",

            "status",

            "payment_method",
            "payment_type",
            "payment_status",

            "shipping_address",
            "city",

            "subtotal",
            "vat",
            "delivery_fee",
            "total_amount",

            "created_at",

            "orderitems",

            "shipment",
        ]

        read_only_fields = fields

    def get_shipment(self, obj):

        shipment = getattr(
            obj,
            "shipment",
            None,
        )

        if not shipment:
            return None

        return ShipmentSerializer(
            shipment,
            context=self.context,
        ).data


# # class OrderItemSerializer(serializers.ModelSerializer):

# #     # ==================================================
# #     # PRODUCT
# #     # ==================================================

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     product_image = serializers.SerializerMethodField()

# #     # ==================================================
# #     # TOTAL
# #     # ==================================================

# #     total_price = serializers.SerializerMethodField()

# #     # ==================================================
# #     # SHOP / SELLER
# #     # ==================================================

# #     shop_name = serializers.CharField(
# #         source="product.shop.name",
# #         read_only=True
# #     )

# #     seller_username = serializers.CharField(
# #         source="product.seller.username",
# #         read_only=True
# #     )

# #     # ==================================================
# #     # PRODUCT IMAGE
# #     # ==================================================

# #     def get_product_image(self, obj):

# #         product = getattr(obj, "product", None)

# #         if not product:
# #             return None

# #         # Primary image
# #         media = (
# #             product.media
# #             .filter(
# #                 media_type="image",
# #                 is_primary=True
# #             )
# #             .first()
# #         )

# #         # Fallback image
# #         if not media:

# #             media = (
# #                 product.media
# #                 .filter(
# #                     media_type="image"
# #                 )
# #                 .first()
# #             )

# #         if not media:
# #             return None

# #         if not media.file:
# #             return None

# #         try:

# #             request = self.context.get("request")

# #             if request:

# #                 return request.build_absolute_uri(
# #                     media.file.url
# #                 )

# #             return media.file.url

# #         except Exception:

# #             return None

# #     # ==================================================
# #     # TOTAL PRICE
# #     # ==================================================

# #     def get_total_price(self, obj):

# #         return float(
# #             obj.unit_price * obj.quantity
# #         )

# #     # ==================================================
# #     # META
# #     # ==================================================

# #     class Meta:

# #         model = OrderItem

# #         fields = [

# #             "id",

# #             "product_name",

# #             "quantity",

# #             "unit_price",

# #             "total_price",

# #             "shop_name",

# #             "seller_username",

# #             "product_image",
# #         ]

# #         read_only_fields = fields


# # class OrderItemSerializer(serializers.ModelSerializer):

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     product_image = serializers.SerializerMethodField()

# #     total_price = serializers.SerializerMethodField()

# #     shop_name = serializers.CharField(
# #         source="product.shop.name",
# #         read_only=True
# #     )

# #     seller_username = serializers.CharField(
# #         source="product.seller.username",
# #         read_only=True
# #     )

# #     class Meta:
# #         model = OrderItem

# #         fields = [
# #             "id",
# #             "product",
# #             "product_name",
# #             "product_image",
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #             "shop_name",
# #             "seller_username",
# #         ]

# #         read_only_fields = fields

# #     def get_product_image(self, obj):

# #         product = getattr(
# #             obj,
# #             "product",
# #             None
# #         )

# #         if not product:
# #             return None

# #         media = (
# #             product.media
# #             .filter(
# #                 media_type="image",
# #                 is_primary=True
# #             )
# #             .first()
# #         )

# #         if not media:
# #             media = (
# #                 product.media
# #                 .filter(
# #                     media_type="image"
# #                 )
# #                 .first()
# #             )

# #         if not media or not media.file:
# #             return None

# #         request = self.context.get("request")

# #         if request:
# #             return request.build_absolute_uri(
# #                 media.file.url
# #             )

# #         return media.file.url

# #     def get_total_price(self, obj):

# #         return (
# #             obj.unit_price *
# #             obj.quantity
# #         )

# # class OrderItemSerializer(serializers.ModelSerializer):

# #     # --------------------------------------------------------
# #     # PRODUCT NAME
# #     # --------------------------------------------------------

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     # --------------------------------------------------------
# #     # PRODUCT IMAGE
# #     # --------------------------------------------------------

# #     product_image = serializers.SerializerMethodField()

# #     # --------------------------------------------------------
# #     # TOTAL PRICE
# #     # --------------------------------------------------------

# #     total_price = serializers.SerializerMethodField()

# #     # --------------------------------------------------------
# #     # OPTIONAL PRODUCT INFORMATION
# #     # --------------------------------------------------------

# #     product_slug = serializers.CharField(
# #         source="product.slug",
# #         read_only=True
# #     )

# #     product_brand = serializers.CharField(
# #         source="product.brand",
# #         read_only=True
# #     )

# #     shop_name = serializers.CharField(
# #         source="product.shop.name",
# #         read_only=True
# #     )

# #     seller_username = serializers.CharField(
# #         source="product.seller.username",
# #         read_only=True
# #     )

# #     # ========================================================
# #     # PRODUCT IMAGE
# #     # ========================================================

# #     def get_product_image(self, obj):

# #         product = getattr(
# #             obj,
# #             "product",
# #             None
# #         )

# #         if not product:
# #             return None

# #         # ----------------------------------------------------
# #         # PRIMARY IMAGE
# #         # ----------------------------------------------------

# #         media = (
# #             product.media
# #             .filter(
# #                 media_type="image",
# #                 is_primary=True
# #             )
# #             .first()
# #         )

# #         # ----------------------------------------------------
# #         # FALLBACK TO FIRST IMAGE
# #         # ----------------------------------------------------

# #         if not media:

# #             media = (
# #                 product.media
# #                 .filter(
# #                     media_type="image"
# #                 )
# #                 .order_by("id")
# #                 .first()
# #             )

# #         # ----------------------------------------------------
# #         # NO IMAGE
# #         # ----------------------------------------------------

# #         if not media:
# #             return None

# #         if not media.file:
# #             return None

# #         # ----------------------------------------------------
# #         # BUILD ABSOLUTE URL
# #         # ----------------------------------------------------

# #         request = self.context.get("request")

# #         try:

# #             if request:

# #                 return request.build_absolute_uri(
# #                     media.file.url
# #                 )

# #             return media.file.url

# #         except Exception:

# #             return None

# #     # ========================================================
# #     # TOTAL PRICE
# #     # ========================================================

# #     def get_total_price(self, obj):

# #         if not obj.unit_price:
# #             return 0

# #         return float(
# #             obj.unit_price * obj.quantity
# #         )

# #     # ========================================================
# #     # META
# #     # ========================================================

# #     class Meta:

# #         model = OrderItem

# #         fields = [

# #             # ------------------------------------------------
# #             # IDENTIFICATION
# #             # ------------------------------------------------

# #             "id",

# #             "product",

# #             # ------------------------------------------------
# #             # PRODUCT INFORMATION
# #             # ------------------------------------------------

# #             "product_name",

# #             "product_slug",

# #             "product_brand",

# #             "shop_name",

# #             "seller_username",

# #             # ------------------------------------------------
# #             # PRODUCT IMAGE
# #             # ------------------------------------------------

# #             "product_image",

# #             # ------------------------------------------------
# #             # ORDER ITEM
# #             # ------------------------------------------------

# #             "quantity",

# #             "unit_price",

# #             "total_price",
# #         ]

# #         read_only_fields = [

# #             "id",

# #             "product_name",

# #             "product_slug",

# #             "product_brand",

# #             "shop_name",

# #             "seller_username",

# #             "product_image",

# #             "total_price",
# #         ]

# # class OrderItemSerializer(serializers.ModelSerializer):

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     total_price = serializers.SerializerMethodField()

# #     class Meta:
# #         model = OrderItem
# #         fields = [
# #             "id",
# #             "product",
# #             "product_name",
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #         ]

# #     def get_total_price(self, obj):

# #         return float(
# #             obj.unit_price * obj.quantity
# #         )
# # ==================================================
# # OrderDetailSerializer
# # ==================================================

# class OrderDetailSerializer(serializers.ModelSerializer):

#     orderitems = OrderItemSerializer(
#         source="items",
#         many=True,
#         read_only=True
#     )

#     shipment = serializers.SerializerMethodField()

#     class Meta:

#         model = Order

#         fields = [
#             "id",
#             "order_number",
#             "status",

#             "payment_method",
#             "payment_type",
#             "payment_status",

#             "shipping_address",
#             "city",

#             "subtotal",
#             "vat",
#             "delivery_fee",
#             "total_amount",

#             "created_at",

#             "orderitems",

#             "shipment",
#         ]

#         read_only_fields = fields

#     def get_shipment(self, obj):

#         shipment = getattr(
#             obj,
#             "shipment",
#             None
#         )

#         if not shipment:
#             return None

#         return ShipmentSerializer(
#             shipment,
#             context=self.context
#         ).data


# # class OrderDetailSerializer(serializers.ModelSerializer):
# #     """
# #     Serializer used by the customer's order history/detail page.
# #     """

# #     orderitems = serializers.SerializerMethodField()
# #     shipment = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "payment_method",
# #             "payment_type",
# #             "subtotal",
# #             "total_amount",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]
# #         read_only_fields = fields

# #     def get_orderitems(self, obj):
# #         """
# #         Return the products belonging to this order.
# #         """

# #         # Support the related name used by the Order/OrderItem relationship.
# #         items = getattr(obj, "items", None)

# #         if items is None:
# #             return []

# #         return OrderItemSerializer(
# #             items.all(),
# #             many=True,
# #             context=self.context,
# #         ).data

# #     def get_shipment(self, obj):
# #         """
# #         Return shipment information when available.
# #         """

# #         shipment = getattr(obj, "shipment", None)

# #         if shipment is None:
# #             return None

# #         try:
# #             return ShipmentSerializer(
# #                 shipment,
# #                 context=self.context,
# #             ).data
# #         except Exception:
# #             return {
# #                 "id": getattr(shipment, "id", None),
# #                 "order_id": getattr(shipment, "order_id", None),
# #                 "order_number": getattr(shipment, "order_number", None),
# #                 "courier": getattr(shipment, "courier", "") or "",
# #             }



# # ==================================================
# # ORDER
# # ==================================================

# # ============================================================
# # ORDER SERIALIZER
# # ============================================================

# class OrderSerializer(serializers.ModelSerializer):

#     orderitems = OrderItemSerializer(
#         source="items",
#         many=True,
#         read_only=True
#     )

#     shipment = serializers.SerializerMethodField()

#     class Meta:

#         model = Order

#         fields = [

#             "id",

#             "order_number",

#             "status",

#             "payment_method",

#             "payment_type",

#             "subtotal",

#             "total_amount",

#             "created_at",

#             "orderitems",

#             "shipment",
#         ]

#         read_only_fields = fields

#     def get_shipment(self, obj):

#         shipment = getattr(
#             obj,
#             "shipment",
#             None
#         )

#         if not shipment:
#             return None

#         return ShipmentSerializer(
#             shipment,
#             context=self.context
#         ).data

# # class OrderSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = ShipmentSerializer(
# #         read_only=True
# #     )

# #     class Meta:

# #         model = Order

# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "payment_method",
# #             "payment_type",
# #             "subtotal",
# #             "total_amount",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]

# #         read_only_fields = fields

# # class OrderSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = ShipmentSerializer(
# #         read_only=True
# #     )

# #     class Meta:

# #         model = Order

# #         fields = [

# #             "id",

# #             "order_number",

# #             "status",

# #             "payment_method",

# #             "payment_type",

# #             "subtotal",

# #             "total_amount",

# #             "created_at",

# #             "orderitems",

# #             "shipment",
# #         ]


# # class OrderSerializer(serializers.ModelSerializer):
# #     orderitems = OrderItemSerializer(
# #         many=True,
# #         read_only=True
# #     )
# #     shipment = ShipmentSerializer(
# #         read_only=True
# #     )
# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "payment_method",
# #             "payment_type",
# #             "subtotal",
# #             "total_amount",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]


# # class OrderSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = ShipmentSerializer(
# #         read_only=True
# #     )

# #     class Meta:

# #         model = Order

# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "payment_method",
# #             "payment_type",
# #             "subtotal",
# #             "total_amount",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]

# #         read_only_fields = fields




# # class OrderSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]

# #     def get_shipment(self, obj):
# #         try:
# #             return ShipmentSerializer(
# #                 obj.shipment
# #             ).data
# #         except Exception:
# #             return None

# # class OrderSerializer(
# #     serializers.ModelSerializer
# # ):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = serializers.SerializerMethodField()
# #     # shipment = ShipmentSerializer(
# #     #     read_only=True
# #     # )

# # def get_shipment(self, obj):
# #     try:
# #         return ShipmentSerializer(
# #             obj.shipment
# #         ).data
# #     except Exception:
# #         return None

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]



# # class OrderSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = ShipmentSerializer(
# #             read_only=True
# #         )

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "created_at",
# #             "orderitems",
# #         ]


# # class OrderSerializer(serializers.ModelSerializer):
# #     orderitems = OrderItemSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Order
# #         fields = "__all__"

# class OrderItemSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     product_name = serializers.CharField(
#         source="product.name",
#         read_only=True
#     )

#     total_price = serializers.SerializerMethodField()

#     shop_name = serializers.CharField(
#         source="product.shop.name",
#         read_only=True
#     )

#     seller_username = serializers.CharField(
#         source="product.seller.username",
#         read_only=True
#     )

#     product_image = serializers.SerializerMethodField()

#     def get_product_image(self, obj):

#         product = obj.product

#         if not product:
#             return None

#         media = (
#             product.media
#             .filter(
#                 media_type="image",
#                 is_primary=True
#             )
#             .first()
#         )

#         if not media:

#             media = (
#                 product.media
#                 .filter(
#                     media_type="image"
#                 )
#                 .first()
#             )

#         if not media or not media.file:
#             return None

#         request = self.context.get("request")

#         if request:

#             return request.build_absolute_uri(
#                 media.file.url
#             )

#         return media.file.url

#     def get_total_price(self, obj):

#         return (
#             obj.quantity *
#             obj.unit_price
#         )

#     class Meta:

#         model = OrderItem

#         fields = [
#             "id",

#             "product",
#             "product_name",

#             "quantity",
#             "unit_price",
#             "total_price",

#             "shop_name",
#             "seller_username",

#             "product_image",
#         ]

# # class OrderDetailSerializer(serializers.ModelSerializer):

# #     items = OrderItemSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "vat",
# #             "delivery_fee",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "payment_status",
# #             "created_at",
# #             "items",
# #             "shipment",
# #         ]

# #     def get_shipment(self, obj):
# #         try:
# #             return ShipmentSerializer(obj.shipment).data
# #         except Exception:
# #             return None


# # class OrderDetailSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "vat",
# #             "delivery_fee",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "payment_status",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]

# #     def get_shipment(self, obj):
# #         """
# #         Return shipment data if available,
# #         otherwise return None.
# #         """
# #         try:
# #             shipment = obj.shipment
# #             return ShipmentSerializer(
# #                 shipment,
# #                 context=self.context
# #             ).data
# #         except Exception:
# #             return None


# # class OrderDetailSerializer(serializers.ModelSerializer):

# #     orderitems = OrderItemSerializer(
# #         source="items",
# #         many=True,
# #         read_only=True
# #     )

# #     shipment = ShipmentSerializer(
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Order
# #         fields = [
# #             "id",
# #             "order_number",
# #             "status",
# #             "subtotal",
# #             "vat",
# #             "delivery_fee",
# #             "total_amount",
# #             "payment_type",
# #             "payment_method",
# #             "payment_status",
# #             "created_at",
# #             "orderitems",
# #             "shipment",
# #         ]


# # ==================================================
# # SHIPMENT
# # ==================================================

# # class ShipmentSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = Shipment
# #         fields = "__all__"


# # ==================================================
# # COUPON
# # ==================================================

# class CouponSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Coupon
#         fields = "__all__"


# # ==================================================
# # USER
# # ==================================================


# from django.contrib.auth import get_user_model
# from rest_framework import serializers

# CustomUser = get_user_model()


# class UserSerializer(serializers.ModelSerializer):

#     profile_picture_url = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser

#         fields = [
#             "id",
#             "username",
#             "email",
#             "first_name",
#             "last_name",
#             "phone",
#             "city",
#             "state",
#             "country",
#             "address",
#             # "is_seller",
#             "profile_picture",
#             "profile_picture_url",
#         ]

#         read_only_fields = [
#             "id",
#             # "is_seller",
#             "profile_picture_url",
#         ]

#     def get_profile_picture_url(self, obj):

#         if not obj.profile_picture:
#             return None

#         request = self.context.get("request")

#         if request:
#             return request.build_absolute_uri(
#                 obj.profile_picture.url
#             )

#         return obj.profile_picture.url




# # from django.contrib.auth import get_user_model
# # from rest_framework import serializers

# # CustomUser = get_user_model()


# # class UserSerializer(serializers.ModelSerializer):

# #     profile_picture_url = serializers.SerializerMethodField()

# #     class Meta:
# #         model = CustomUser

# #         fields = [
# #             "id",
# #             "username",
# #             "email",
# #             "first_name",
# #             "last_name",
# #             "phone",
# #             "city",
# #             "state",
# #             "country",
# #             "address",
# #             "is_seller",
# #             "profile_picture",
# #             "profile_picture_url",
# #         ]

# #         read_only_fields = [
# #             "id",
# #             "is_seller",
# #             "profile_picture_url",
# #         ]

# #     def get_profile_picture_url(self, obj):

# #         if not obj.profile_picture:
# #             return None

# #         request = self.context.get("request")

# #         if request:
# #             return request.build_absolute_uri(
# #                 obj.profile_picture.url
# #             )

# #         return obj.profile_picture.url

# # class UserSerializer(serializers.ModelSerializer):
# #     profile_picture_url = serializers.SerializerMethodField()

# #     class Meta:
# #         model = CustomUser
# #         fields = [
# #             "id",
# #             "username",
# #             "email",
# #             "first_name",
# #             "last_name",
# #             "profile_picture",
# #             "profile_picture_url",
# #         ]
# #         read_only_fields = [
# #             "id",
# #             "profile_picture_url",
# #         ]

# #     def get_profile_picture_url(self, obj):
# #         request = self.context.get("request")

# #         if not obj.profile_picture:
# #             return None

# #         try:
# #             url = obj.profile_picture.url

# #             if request:
# #                 return request.build_absolute_uri(url)

# #             return url

# #         except (ValueError, AttributeError):
# #             return None




# # class UserSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = User
# #         fields = [
# #             "id",
# #             "username",
# #             "email",
# #             "first_name",
# #             "last_name",
# #             "phone",
# #             "city",
# #             "state",
# #             "country",
# #             "address",
# #         ]


# # class UserSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = User
# #         fields = [
# #             "id",
# #             "username",
# #             "email",
# #             "first_name",
# #             "last_name",
# #         ]


# # ==================================================
# # JWT TOKEN
# # ==================================================

# # ==================================================
# # JWT TOKEN
# # ==================================================

# class MyTokenObtainPairSerializer(
#     TokenObtainPairSerializer
# ):

#     @classmethod
#     def get_token(cls, user):

#         token = super().get_token(user)

#         token["user_id"] = user.id
#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         # Admin information
#         token["is_staff"] = user.is_staff
#         token["is_superuser"] = user.is_superuser

#         return token




# # from rest_framework import serializers
# # from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# # from django.contrib.auth import get_user_model

# # from .models import (
# #     Category,
# #     SubCategory,
# #     Product,
# #     ProductMedia,
# #     ProductVariant,
# #     ProductReview,
# #     Wishlist,
# #     RecentlyViewed,
# #     Coupon,
# #     Cart,
# #     CartItem,
# #     Order,
# #     OrderItem,
# #     Shipment,
# # )

# # User = get_user_model()


# # # ==================================================
# # # PRODUCT MEDIA
# # # ==================================================

# # class ProductMediaSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = ProductMedia
# #         fields = [
# #             "id",
# #             "media_type",
# #             "file",
# #             "is_primary",
# #             "created_at",
# #         ]


# # # ==================================================
# # # PRODUCT VARIANT
# # # ==================================================

# # class ProductVariantSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = ProductVariant
# #         fields = "__all__"


# # # ==================================================
# # # PRODUCT REVIEW
# # # ==================================================

# # class ProductReviewSerializer(serializers.ModelSerializer):

# #     username = serializers.CharField(
# #         source="user.username",
# #         read_only=True
# #     )

# #     class Meta:
# #         model = ProductReview
# #         fields = [
# #             "id",
# #             "username",
# #             "rating",
# #             "comment",
# #             "created_at",
# #         ]


# # # ==================================================
# # # CATEGORY
# # # ==================================================

# # class CategorySerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = Category
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "image",
# #         ]


# # # ==================================================
# # # SUBCATEGORY
# # # ==================================================

# # class SubCategorySerializer(serializers.ModelSerializer):

# #     category_name = serializers.CharField(
# #         source="category.name",
# #         read_only=True
# #     )

# #     class Meta:
# #         model = SubCategory
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "image",
# #             "category",
# #             "category_name",
# #         ]


# # # ==================================================
# # # CATEGORY DETAIL
# # # ==================================================

# # class CategoryDetailSerializer(serializers.ModelSerializer):

# #     subcategories = SubCategorySerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Category
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "image",
# #             "subcategories",
# #         ]


# # # ==================================================
# # # PRODUCT LIST
# # # ==================================================

# # class ProductSerializer(serializers.ModelSerializer):

# #     media = ProductMediaSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     current_price = serializers.ReadOnlyField()

# #     category_name = serializers.CharField(
# #         source="category.name",
# #         read_only=True
# #     )

# #     subcategory_name = serializers.CharField(
# #         source="subcategory.name",
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Product
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "description",
# #             "short_description",
# #             "brand",
# #             "sku",
# #             "price",
# #             "discounted_price",
# #             "current_price",
# #             "stock_quantity",
# #             "rating",
# #             "total_reviews",
# #             "is_featured",
# #             "is_active",
# #             "category",
# #             "category_name",
# #             "subcategory",
# #             "subcategory_name",
# #             "media",
# #             "created_at",
# #         ]


# # # ==================================================
# # # PRODUCT DETAIL
# # # ==================================================

# # class DetailedProductSerializer(serializers.ModelSerializer):

# #     media = ProductMediaSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     variants = ProductVariantSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     reviews = ProductReviewSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     similar_products = serializers.SerializerMethodField()

# #     current_price = serializers.ReadOnlyField()

# #     class Meta:
# #         model = Product
# #         fields = [
# #             "id",
# #             "name",
# #             "slug",
# #             "description",
# #             "short_description",
# #             "brand",
# #             "sku",
# #             "price",
# #             "discounted_price",
# #             "current_price",
# #             "stock_quantity",
# #             "rating",
# #             "total_reviews",
# #             "is_featured",
# #             "is_active",
# #             "category",
# #             "subcategory",
# #             "media",
# #             "variants",
# #             "reviews",
# #             "similar_products",
# #             "created_at",
# #         ]

# #     def get_similar_products(self, product):

# #         products = Product.objects.filter(
# #             category=product.category,
# #             is_active=True
# #         ).exclude(
# #             id=product.id
# #         )[:8]

# #         return ProductSerializer(
# #             products,
# #             many=True
# #         ).data


# # # ==================================================
# # # CART ITEM
# # # ==================================================

# # class CartItemSerializer(serializers.ModelSerializer):

# #     product = ProductSerializer(
# #         read_only=True
# #     )

# #     total = serializers.SerializerMethodField()

# #     class Meta:
# #         model = CartItem
# #         fields = [
# #             "id",
# #             "product",
# #             "quantity",
# #             "total",
# #         ]

# #     def get_total(self, obj):
# #         return obj.product.current_price * obj.quantity


# # # ==================================================
# # # CART
# # # ==================================================

# # class CartSerializer(serializers.ModelSerializer):

# #     items = CartItemSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     num_of_items = serializers.SerializerMethodField()

# #     sum_total = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Cart
# #         fields = [
# #             "id",
# #             "cart_code",
# #             "paid",
# #             "num_of_items",
# #             "sum_total",
# #             "items",
# #             "created_at",
# #             "updated_at",
# #         ]

# #     def get_num_of_items(self, cart):
# #         return sum(
# #             item.quantity
# #             for item in cart.items.all()
# #         )

# #     def get_sum_total(self, cart):
# #         return sum(
# #             item.product.current_price * item.quantity
# #             for item in cart.items.all()
# #         )


# # # ==================================================
# # # WISHLIST
# # # ==================================================

# # class WishlistSerializer(serializers.ModelSerializer):

# #     product = ProductSerializer(
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Wishlist
# #         fields = [
# #             "id",
# #             "product",
# #             "created_at",
# #         ]


# # # ==================================================
# # # RECENTLY VIEWED
# # # ==================================================

# # class RecentlyViewedSerializer(serializers.ModelSerializer):

# #     product = ProductSerializer(
# #         read_only=True
# #     )

# #     class Meta:
# #         model = RecentlyViewed
# #         fields = "__all__"


# # # ==================================================
# # # ORDER ITEM
# # # ==================================================

# # class OrderItemSerializer(serializers.ModelSerializer):

# #     product_name = serializers.CharField(
# #         source="product.name",
# #         read_only=True
# #     )

# #     total_price = serializers.SerializerMethodField()

# #     class Meta:
# #         model = OrderItem
# #         fields = [
# #             "id",
# #             "product",
# #             "product_name",
# #             "quantity",
# #             "unit_price",
# #             "total_price",
# #         ]

# #     def get_total_price(self, obj):
# #         return obj.unit_price * obj.quantity


# # # ==================================================
# # # ORDER
# # # ==================================================

# # class OrderSerializer(serializers.ModelSerializer):

# #     items = OrderItemSerializer(
# #         many=True,
# #         read_only=True
# #     )

# #     class Meta:
# #         model = Order
# #         fields = "__all__"


# # # ==================================================
# # # SHIPMENT
# # # ==================================================

# # class ShipmentSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = Shipment
# #         fields = "__all__"


# # # ==================================================
# # # COUPON
# # # ==================================================

# # class CouponSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = Coupon
# #         fields = "__all__"


# # # ==================================================
# # # USER
# # # ==================================================

# # class UserSerializer(serializers.ModelSerializer):

# #     class Meta:
# #         model = User
# #         fields = [
# #             "id",
# #             "username",
# #             "email",
# #             "first_name",
# #             "last_name",
# #         ]


# # # ==================================================
# # # JWT TOKEN
# # # ==================================================

# # class MyTokenObtainPairSerializer(
# #     TokenObtainPairSerializer
# # ):

# #     @classmethod
# #     def get_token(cls, user):

# #         token = super().get_token(user)

# #         token["user_id"] = user.id
# #         token["username"] = user.username
# #         token["email"] = user.email
# #         token["first_name"] = user.first_name
# #         token["last_name"] = user.last_name

# #         return token










# from rest_framework import serializers
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# from django.contrib.auth import get_user_model

# from core.models import CustomUser

# from .models import (
#     Category, 
#     SubCategory,
#     Product,
#     ProductMedia,
#     ProductVariant,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Coupon,
#     Cart,
#     CartItem,
#     Order,
#     OrderItem,
#     Shipment,
# )

# User = get_user_model()


# # =====================================
# # PRODUCT MEDIA SERIALIZER
# # =====================================

# class ProductMediaSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = ProductMedia
#         fields = [
#             "id",
#             "media_type",
#             "file",
#             "is_primary",
#             "uploaded_at",
#         ]


# # =====================================
# # PRODUCT VARIANT SERIALIZER
# # =====================================

# class ProductVariantSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = ProductVariant
#         fields = "__all__"


# # =====================================
# # PRODUCT REVIEW SERIALIZER
# # =====================================

# class ProductReviewSerializer(serializers.ModelSerializer):

#     username = serializers.CharField(
#         source="user.username",
#         read_only=True
#     )

#     class Meta:
#         model = ProductReview
#         fields = [
#             "id",
#             "username",
#             "rating",
#             "review",
#             "created_at",
#         ]


# # =====================================
# # COUPON SERIALIZER
# # =====================================

# class CouponSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Coupon
#         fields = "__all__"


# # =====================================
# # SHIPMENT SERIALIZER
# # =====================================

# class ShipmentSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Shipment
#         fields = "__all__"


# # =====================================
# # PRODUCT SERIALIZER
# # =====================================

# class ProductSerializer(serializers.ModelSerializer):

#     media = ProductMediaSerializer(
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = Product

#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "description",
#             "short_description",
#             "brand",
#             "category",
#             "price",
#             "discount_price",
#             "stock_quantity",
#             "is_featured",
#             "media",
#         ]


# # =====================================
# # PRODUCT CATEGORY SERIALIZER
# # =====================================

# class CategorySerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Category
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#         ]


# # =====================================
# # PRODUCT SUBCATEGORY SERIALIZER
# # =====================================
# class SubCategorySerializer(serializers.ModelSerializer):

#     category_name = serializers.CharField(
#         source="category.name",
#         read_only=True
#     )

#     class Meta:
#         model = SubCategory
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "category",
#             "category_name",
#         ]

# # =====================================
# # DETAILED SUBCATEGORY SERIALIZER
# # =====================================
# class CategoryDetailSerializer(serializers.ModelSerializer):

#     subcategories = SubCategorySerializer(
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = Category
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "subcategories",
#         ]


# # =====================================
# # DETAILED PRODUCT SERIALIZER
# # =====================================

# class DetailedProductSerializer(serializers.ModelSerializer):

#     media = ProductMediaSerializer(
#         many=True,
#         read_only=True
#     )

#     variants = ProductVariantSerializer(
#         many=True,
#         read_only=True
#     )

#     reviews = ProductReviewSerializer(
#         many=True,
#         read_only=True
#     )

#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#         model = Product

#         fields = [
#             "id",
#             "name",
#             "price",
#             "discount_price",
#             "slug",
#             "image",
#             "description",
#             "short_description",
#             "brand",
#             "category",
#             "stock_quantity",
#             "media",
#             "variants",
#             "reviews",
#             "similar_products",
#         ]

#     def get_similar_products(self, product):

#         products = Product.objects.filter(
#             category=product.category
#         ).exclude(
#             id=product.id
#         )[:8]

#         return ProductSerializer(
#             products,
#             many=True
#         ).data


# # =====================================
# # ORDER ITEM SERIALIZER
# # =====================================

# class OrderItemSerializer(serializers.ModelSerializer):

#     product_name = serializers.CharField(
#         source="product.name",
#         read_only=True
#     )

#     product_price = serializers.DecimalField(
#         source="product.price",
#         max_digits=10,
#         decimal_places=2,
#         read_only=True
#     )

#     order_id = serializers.IntegerField(
#         source="order.id",
#         read_only=True
#     )

#     order_status = serializers.CharField(
#         source="order.status",
#         read_only=True
#     )

#     order_date = serializers.DateTimeField(
#         source="order.created_at",
#         read_only=True
#     )

#     total_price = serializers.SerializerMethodField()

#     class Meta:
#         model = OrderItem

#         fields = [
#             "id",
#             "order_id",
#             "order_status",
#             "order_date",
#             "product",
#             "product_name",
#             "product_price",
#             "quantity",
#             "total_price",
#         ]

#     def get_total_price(self, obj):
#         return obj.product.price * obj.quantity


# # =====================================
# # CART ITEM SERIALIZER
# # =====================================

# class CartItemSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     total = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem

#         fields = [
#             "id",
#             "quantity",
#             "product",
#             "total",
#         ]

#     def get_total(self, obj):
#         return obj.product.price * obj.quantity


# # =====================================
# # CART SERIALIZER
# # =====================================

# class CartSerializer(serializers.ModelSerializer):

#     items = CartItemSerializer(
#         many=True,
#         read_only=True
#     )

#     sum_total = serializers.SerializerMethodField()

#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart

#         fields = [
#             "id",
#             "cart_code",
#             "sum_total",
#             "num_of_items",
#             "items",
#             "created_at",
#             "modified_at",
#         ]

#     def get_sum_total(self, cart):
#         return sum(
#             item.product.price * item.quantity
#             for item in cart.items.all()
#         )

#     def get_num_of_items(self, cart):
#         return sum(
#             item.quantity
#             for item in cart.items.all()
#         )


# # =====================================
# # WISHLIST SERIALIZER
# # =====================================

# class WishlistSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     class Meta:
#         model = Wishlist
#         fields = "__all__"


# # =====================================
# # RECENTLY VIEWED SERIALIZER
# # =====================================

# class RecentlyViewedSerializer(serializers.ModelSerializer):

#     product = ProductSerializer(
#         read_only=True
#     )

#     class Meta:
#         model = RecentlyViewed
#         fields = "__all__"


# # =====================================
# # USER SERIALIZER
# # =====================================

# class UserSerializer(serializers.ModelSerializer):

#     orders = serializers.SerializerMethodField()

#     items = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser

#         fields = [
#             "id",
#             "username",
#             "email",
#             "first_name",
#             "last_name",
#             "phone",
#             "city",
#             "country",
#             "address",
#             "orders",
#             "items",
#         ]

#     def get_orders(self, obj):

#         order_items = OrderItem.objects.filter(
#             order__user=obj
#         ).order_by("-id")

#         return OrderItemSerializer(
#             order_items,
#             many=True
#         ).data

#     def get_items(self, obj):

#         cartitems = CartItem.objects.filter(
#             cart__user=obj,
#             cart__paid=True
#         ).order_by("-id")[:10]

#         return CartItemSerializer(
#             cartitems,
#             many=True
#         ).data


# # =====================================
# # JWT TOKEN SERIALIZER
# # =====================================

# class MyTokenObtainPairSerializer(
#     TokenObtainPairSerializer
# ):

#     @classmethod
#     def get_token(cls, user):

#         token = super().get_token(user)

#         token["user_id"] = user.id
#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         return token








# from rest_framework import serializers
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# from django.contrib.auth import get_user_model

# from core.models import CustomUser
# from .models import Product, Cart, CartItem, OrderItem

# User = get_user_model()


# # ==========================
# # PRODUCT SERIALIZER
# # ==========================
# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "description",
#             "category",
#             "price",
#         ]


# # ==========================
# # DETAILED PRODUCT SERIALIZER
# # ==========================
# class DetailedProductSerializer(serializers.ModelSerializer):
#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "price",
#             "slug",
#             "image",
#             "description",
#             "similar_products",
#         ]

#     def get_similar_products(self, product):
#         products = Product.objects.filter(
#             category=product.category
#         ).exclude(id=product.id)

#         return ProductSerializer(products, many=True).data


# # ==========================
# # ORDER ITEM SERIALIZER
# # ==========================
# class OrderItemSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source="product.name", read_only=True)
#     product_price = serializers.DecimalField(
#         source="product.price",
#         max_digits=10,
#         decimal_places=2,
#         read_only=True
#     )

#     class Meta:
#         model = OrderItem
#         fields = [
#             "id",
#             "product",
#             "product_name",
#             "product_price",
#             "quantity",
#             "total_price",
#         ]


# # ==========================
# # CART ITEM SERIALIZER
# # ==========================
# class CartItemSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(read_only=True)
#     total = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = [
#             "id",
#             "quantity",
#             "product",
#             "total",
#         ]

#     def get_total(self, obj):
#         return obj.product.price * obj.quantity


# # ==========================
# # CART SERIALIZER
# # ==========================
# class CartSerializer(serializers.ModelSerializer):
#     items = CartItemSerializer(many=True, read_only=True)
#     sum_total = serializers.SerializerMethodField()
#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "sum_total",
#             "num_of_items",
#             "items",
#             "created_at",
#             "modified_at",
#         ]

#     def get_sum_total(self, cart):
#         return sum(item.product.price * item.quantity for item in cart.items.all())

#     def get_num_of_items(self, cart):
#         return sum(item.quantity for item in cart.items.all())


# # ==========================
# # USER SERIALIZER (FIXED)
# # ==========================
# class UserSerializer(serializers.ModelSerializer):
#     orders = serializers.SerializerMethodField()
#     items = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = [
#             "id",
#             "username",
#             "email",
#             "first_name",
#             "last_name",
#             "phone",
#             "city",
#             "country",
#             "address",
#             "orders",
#             "items",
#         ]

#     # --------------------------
#     # ORDERS (FIXED SAFELY)
#     # --------------------------
#     def get_orders(self, obj):
#         """
#         FIX:
#         Only works IF OrderItem has a relation like:
#         OrderItem -> order -> user
#         """
#         order_items = OrderItem.objects.filter(
#             order__user=obj
#         ).order_by("-id")

#         return OrderItemSerializer(order_items, many=True).data

#     # --------------------------
#     # CART ITEMS (ORDER HISTORY FALLBACK)
#     # --------------------------
#     def get_items(self, obj):
#         cartitems = CartItem.objects.filter(
#             cart__user=obj,
#             cart__paid=True
#         ).order_by("-id")[:10]

#         return CartItemSerializer(cartitems, many=True).data


# # ==========================
# # JWT TOKEN SERIALIZER
# # ==========================
# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         token["user_id"] = user.id
#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         return token



# from rest_framework import serializers
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from django.contrib.auth import get_user_model

# from core.models import CustomUser
# from .models import Product, Cart, CartItem, OrderItem

# User = get_user_model()


# class DetailedProductSerializer(serializers.ModelSerializer):
#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "price",
#             "slug",
#             "image",
#             "description",
#             "similar_products",
#         ]

#     def get_similar_products(self, product):
#         products = Product.objects.filter(
#             category=product.category
#         ).exclude(id=product.id)

#         return ProductSerializer(products, many=True).data

# # ==========================
# # PRODUCT SERIALIZER
# # ==========================
# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "description",
#             "category",
#             "price",
#         ]


# # ==========================
# # ORDER ITEM SERIALIZER
# # ==========================
# class OrderItemSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source="product.name", read_only=True)
#     product_price = serializers.DecimalField(
#         source="product.price",
#         max_digits=10,
#         decimal_places=2,
#         read_only=True
#     )

#     class Meta:
#         model = OrderItem
#         fields = [
#             "id",
#             "product",
#             "product_name",
#             "product_price",
#             "quantity",
#             "total_price",
#         ]


# # ==========================
# # CART ITEM SERIALIZER
# # ==========================
# class CartItemSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(read_only=True)
#     total = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = [
#             "id",
#             "quantity",
#             "product",
#             "total",
#         ]

#     def get_total(self, obj):
#         return obj.product.price * obj.quantity


# # ==========================
# # CART SERIALIZER
# # ==========================
# class CartSerializer(serializers.ModelSerializer):
#     items = CartItemSerializer(many=True, read_only=True)
#     sum_total = serializers.SerializerMethodField()
#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "sum_total",
#             "num_of_items",
#             "items",
#             "created_at",
#             "modified_at",
#         ]

#     def get_sum_total(self, cart):
#         return sum(item.product.price * item.quantity for item in cart.items.all())

#     def get_num_of_items(self, cart):
#         return sum(item.quantity for item in cart.items.all())


# # ==========================
# # USER SERIALIZER (FIXED)
# # ==========================
# class UserSerializer(serializers.ModelSerializer):
#     orders = serializers.SerializerMethodField()
#     items = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = [
#             "id",
#             "username",
#             "email",
#             "first_name",
#             "last_name",
#             "phone",
#             "city",
#             "country",
#             "address",
#             "orders",
#             "items",
#         ]

#     def get_orders(self, obj):
#         # FIX THIS depending on your related_name
#         return OrderItemSerializer(
#             OrderItem.objects.filter(order__user=obj),
#             many=True
#         ).data

#     def get_items(self, obj):
#         cartitems = CartItem.objects.filter(
#             cart__user=obj,
#             cart__paid=True
#         ).order_by("-id")[:10]

#         return CartItemSerializer(cartitems, many=True).data


# # ==========================
# # JWT TOKEN SERIALIZER
# # ==========================
# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         token["user_id"] = user.id
#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         return token

# from rest_framework import serializers
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from django.contrib.auth import get_user_model

# from rest_framework import serializers
# from .models import OrderItem, Product

# from core.models import CustomUser

# from .models import Product, Cart, CartItem

# User = get_user_model()


# # ==========================
# # ORDER HISTORY SERIALIZER
# # ==========================
# class NewCartItemSerializer(serializers.ModelSerializer):
#     order_id = serializers.SerializerMethodField()
#     order_date = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = [
#             "id",
#             "product",
#             "quantity",
#             "order_id",
#             "order_date",
#         ]

#     def get_order_id(self, cartitem):
#         return cartitem.cart.cart_code

#     def get_order_date(self, cartitem):
#         return cartitem.cart.modified_at


# # ==========================
# # USER SERIALIZER
# # ==========================
# class UserSerializer(serializers.ModelSerializer):
#     orders = serializers.SerializerMethodField()

#     class Meta:
#         model = CustomUser
#         fields = [
#             "id",
#             "username",
#             "email",
#             "first_name",
#             "last_name",
#             "phone",
#             "city",
#             "country",
#             "address",
#             "orders",
#         ]

#     def get_orders(self, obj):
#         return OrderItemSerializer(obj.orders.all(), many=True).data
 

# class OrderItemSerializer(serializers.ModelSerializer):
#     product_name = serializers.CharField(source="product.name", read_only=True)
#     product_price = serializers.DecimalField(source="product.price", max_digits=10, decimal_places=2, read_only=True)

#     class Meta:
#         model = OrderItem
#         fields = [
#             "id",
#             "product",
#             "product_name",
#             "product_price",
#             "quantity",
#             "total_price",
#         ]

# class UserSerializer(serializers.ModelSerializer):
#     orders = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = [
#             "id",
#             "username",
#             "first_name",
#             "last_name",
#             "email",
#             "phone",
#             "address",
#             "city",
#             "state",
#             "country", 
#             "orders",
#         ]
    
    

#     def get_items(self, user):
#         cartitems = CartItem.objects.filter(
#             cart__user=user,
#             cart__paid=True
#         ).order_by("-id")[:10]

#         return NewCartItemSerializer(
#             cartitems,
#             many=True
#         ).data

# # ==========================
# # PRODUCT SERIALIZER
# # ==========================
# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "image",
#             "description",
#             "category",
#             "price",
#         ]


# # ==========================
# # PRODUCT DETAIL SERIALIZER
# # ==========================
# class DetailedProductSerializer(serializers.ModelSerializer):
#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#         model = Product
#         fields = [
#             "id",
#             "name",
#             "price",
#             "slug",
#             "image",
#             "description",
#             "similar_products",
#         ]

#     def get_similar_products(self, product):
#         products = Product.objects.filter(
#             category=product.category
#         ).exclude(
#             id=product.id
#         )

#         return ProductSerializer(
#             products,
#             many=True
#         ).data


# # ==========================
# # CART ITEM SERIALIZER
# # ==========================
# class CartItemSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(read_only=True)
#     total = serializers.SerializerMethodField()

#     class Meta:
#         model = CartItem
#         fields = [
#             "id",
#             "quantity",
#             "product",
#             "total",
#         ]

#     def get_total(self, cartitem):
#         return cartitem.product.price * cartitem.quantity


# # ==========================
# # CART SERIALIZER
# # ==========================
# class CartSerializer(serializers.ModelSerializer):
#     items = CartItemSerializer(
#         many=True,
#         read_only=True
#     )

#     sum_total = serializers.SerializerMethodField()
#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "sum_total",
#             "num_of_items",
#             "items",
#             "created_at",
#             "modified_at",
#         ]

#     def get_sum_total(self, cart):
#         return sum(
#             item.product.price * item.quantity
#             for item in cart.items.all()
#         )

#     def get_num_of_items(self, cart):
#         return sum(
#             item.quantity
#             for item in cart.items.all()
#         )


# # ==========================
# # JWT TOKEN SERIALIZER
# # ==========================
# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         token["user_id"] = user.id
#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         return token

# from rest_framework import serializers
# from .models import Product, Cart, CartItem
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from django.contrib.auth import get_user_model


# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = "__all__"


# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = ["id", "name", "slug", "image", "description", "category", "price"]


# class DetailedProductSerializer(serializers.ModelSerializer):
#     similar_products = serializers.SerializerMethodField()

#     class Meta:
#         model = Product
#         fields = ["id", "name", "price", "slug", "image", "description", "similar_products"]

#     def get_similar_products(self, product):
#         products = Product.objects.filter(
#             category = product.category
#         ).exclude(id=product.id)

#         return ProductSerializer(products, many=True).data

# class CartItemSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(read_only=True)
#     total = serializers.SerializerMethodField()
#     class Meta:
#         model = CartItem
#         fields = ["id", "quantity", "product", "total"]

#     def get_total(self, cartitem):
#         total_price = cartitem.product.price * cartitem.quantity
#         return total_price


# # class CartSerializer(serializers.ModelSerializer):
# #     items = CartItemSerializer(read_only=True)
# #     sum_total = serializers.SerializerMethodField()
# #     num_of_items = serializers.SerializerMethodField()

# #     class Meta:
# #         model = Cart
# #         fields = ["id", "cart_code","sum_total","num_of_items", "items","created_at", "modified_at"]
    
# #     def get_sum_total(self,cart):
# #         items = cart.itema.all()
# #         total = sum([item.product.price* item.quantity for item in items])
# #         return total
# #     def get_num_of_items(self,cart):
# #         items = cart.itema.all()
# #         total_items = sum([item.quantity for item in items])
# #         return total_items

# # class SimpleCartSerializer(serializers.ModelSerializer):
# #     num_of_items = serializers.SerializerMethodField()
# #     class Meta:
# #         model = Cart
# #         fields = ["id", "Cart_code", "num_of_items"]

# #     def num_of_items(self,cart):
# #         num_of_items = sum([item.quantity for item in cart.item.all()])
# #         return num_of_items


# class SimpleCartSerializer(serializers.ModelSerializer):
#     num_of_items = serializers.SerializerMethodField()
#     username = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "num_of_items",
#             "username",
#         ]

#     def get_num_of_items(self, cart):
#         return sum(
#             item.quantity
#             for item in cart.items.all()
#         )

#     def get_username(self, cart):
#         return (
#             cart.user.username
#             if cart.user
#             else None
#         )


# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         token["username"] = user.username
#         token["email"] = user.email
#         token["first_name"] = user.first_name
#         token["last_name"] = user.last_name

#         return token

# class UserSerializer(serializers.ModelSerializer):
#     items = serializers.SerializerMethodField()
#     class Meta:
#         model = get_user_model()
#         fields = ["id", "username", "first_name", "last_name", "email", "city", "state", "address", "phone","items"]

# class SimpleCartSerializer(serializers.ModelSerializer):
#     num_of_items = serializers.SerializerMethodField()
#     username = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = ["id", "cart_code", "num_of_items", "username"]

#     def get_num_of_items(self, cart):
#         return sum(item.quantity for item in cart.items.all())

#     def get_username(self, cart):
#         if cart.user:
#             return cart.user.username
#         return None


# class SimpleCartSerializer(serializers.ModelSerializer):
#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = ["id", "cart_code", "num_of_items", "username"]

#     def get_num_of_items(self, cart):
#         return sum(item.quantity for item in cart.items.all())
    



# class CartSerializer(serializers.ModelSerializer):
#     items = CartItemSerializer(many=True, read_only=True)
#     sum_total = serializers.SerializerMethodField()
#     num_of_items = serializers.SerializerMethodField()

#     class Meta:
#         model = Cart
#         fields = [
#             "id",
#             "cart_code",
#             "sum_total",
#             "num_of_items",
#             "items",
#             "created_at",
#             "modified_at"
#         ]

#     def get_sum_total(self, cart):
#         items = cart.items.all()
#         sum_total =sum(item.product.price * item.quantity for item in items)
#         return sum_total
    
#     def get_num_of_items(self, cart):
#         items = cart.items.all()
#         num_of_items = sum(item.quantity for item in items)
#         return num_of_items




# class CartItemSerializer(serializers.ModelSerializer):
#     product = ProductSerializer(read_only=True)
#     cart = CartSerializer(read_only=True)

#     class Meta:
#         model = CartItem
#         fields = ["id", "quantity", "product", "cart"]

# from rest_framework import serializers
# from .models import Product


# class ProductSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Product
#         fields = ["id", "name", "slug", "image", "description", "category", "price"]


# class DetailedProductSerializer(serializers.ModelSerializer):
#     similar_products = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Product
#         fields = ["id", "name", "price", "slug", "image", "description", "similar_products"]

# def get_similar_products(self, product):
#     products = Product.objects.filter(category =product.category).exclude(id=product.id)
#     serializer = ProductSerializer(products, many=True)
#     return serializer.data
