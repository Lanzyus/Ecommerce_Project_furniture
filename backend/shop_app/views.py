from decimal import Decimal
import logging
import traceback
import uuid

import requests

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction as db_transaction
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone

from reportlab.pdfgen import canvas

from rest_framework import generics, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    parser_classes,
)
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.permissions import (
    IsAuthenticated,
    IsAdminUser,
    AllowAny,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Banner,
    Cart,
    CartItem,
    Category,
    ContactMessage,
    Order,
    OrderItem,
    Product,
    ProductMedia,
    ProductQuestion,
    ProductReview,
    ProductVariant,
    RecentlyViewed,
    Shipment,
    ShipmentTracking,
    StockMovement,
    SubCategory,
    Transaction,
    Wishlist,
)

from .serializers import (
    BannerSerializer,
    CartSerializer,
    CategoryDetailSerializer,
    CategorySerializer,
    ContactMessageSerializer,
    DetailedProductSerializer,
    MyTokenObtainPairSerializer,
    OrderDetailSerializer,
    OrderSerializer,
    ProductMediaSerializer,
    ProductQuestionSerializer,
    ProductReviewSerializer,
    ProductSerializer,
    ProductSpecificationSerializer,
    ProductVariantSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ShipmentSerializer,
    ShipmentTrackingSerializer,
    SubCategorySerializer,
    UserSerializer,
    WishlistSerializer,
)


print(getattr(settings, "PAYSTACK_PUBLIC_KEY", "NOT FOUND"))
print(settings.FLUTTERWAVE_PUBLIC_KEY)

User = get_user_model()

logger = logging.getLogger(__name__)

BASE_URL = getattr(
    settings,
    "FRONTEND_URL",
    "http://localhost:5173"
)


# ==================================================
# HOME
# ==================================================

def home(request):
    return JsonResponse({
        "status": "success",
        "message": "Ecommerce API Running"
    })



# ==================================================
# verify_paystack_payment
# ==================================================

# @api_view(["POST"])
# @permission_classes([IsAdminUser])
# def update_shipment_status(
#     request,
#     shipment_id
# ):
#     shipment = Shipment.objects.get(
#         id=shipment_id
#     )

#     status = request.data.get("status")
#     location = request.data.get("location")
#     note = request.data.get("note")

#     ShipmentTracking.objects.create(
#         shipment=shipment,
#         status=status,
#         location=location,
#         note=note
#     )

#     shipment.status = status.lower().replace(
#         " ", "_"
#     )
#     shipment.save()

#     return Response({
#         "success": True
#     })


# ==================================================
# UPDATE SHIPMENT STATUS - ADMIN ONLY
# ==================================================

@api_view(["POST"])
@permission_classes([IsAdminUser])
def update_shipment_status(
    request,
    shipment_id
):

    try:
        shipment = Shipment.objects.get(
            id=shipment_id
        )

    except Shipment.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Shipment not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ==========================================
    # GET DATA FROM FRONTEND
    # ==========================================

    new_status = request.data.get(
        "status",
        ""
    ).strip()

    courier = request.data.get(
        "courier",
        ""
    ).strip()

    location = request.data.get(
        "location",
        ""
    ).strip()

    note = request.data.get(
        "note",
        ""
    ).strip()


    # ==========================================
    # VALIDATE COURIER
    # ==========================================

    if not courier:

        return Response(
            {
                "success": False,
                "message": "Please select a courier."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ==========================================
    # VALID SHIPMENT STATUSES
    # ==========================================

    valid_statuses = [
        choice[0]
        for choice in Shipment.STATUS_CHOICES
    ]


    # Allow frontend to send:
    # "In Transit"
    # OR
    # "in_transit"

    normalized_status = (
        new_status
        .lower()
        .replace(" ", "_")
    )


    if normalized_status not in valid_statuses:

        return Response(
            {
                "success": False,
                "message": "Invalid delivery status."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ==========================================
    # UPDATE SHIPMENT
    # ==========================================

    shipment.status = normalized_status

    # IMPORTANT:
    # Save selected courier
    shipment.courier = courier


    # ==========================================
    # AUTOMATIC SHIPPED TIME
    # ==========================================

    if (
        normalized_status == "shipped"
        and not shipment.shipped_at
    ):

        shipment.shipped_at = timezone.now()


    # ==========================================
    # AUTOMATIC DELIVERY TIME
    # ==========================================

    if (
        normalized_status == "delivered"
        and not shipment.delivered_at
    ):

        shipment.delivered_at = timezone.now()


    # ==========================================
    # SAVE SHIPMENT
    # ==========================================

    shipment.save()


    # ==========================================
    # CREATE TRACKING HISTORY
    # ==========================================

    ShipmentTracking.objects.create(
        shipment=shipment,
        status=shipment.get_status_display(),
        location=location,
        note=note
    )


    # ==========================================
    # RETURN UPDATED SHIPMENT
    # ==========================================

    return Response(
        {
            "success": True,
            "message": "Delivery updated successfully.",
            "shipment": ShipmentSerializer(
                shipment
            ).data
        },
        status=status.HTTP_200_OK
    )

# @api_view(["POST"])
# @permission_classes([IsAdminUser])
# def update_shipment_status(
#     request,
#     shipment_id
# ):

#     try:
#         shipment = Shipment.objects.get(
#             id=shipment_id
#         )

#     except Shipment.DoesNotExist:

#         return Response(
#             {
#                 "success": False,
#                 "message": "Shipment not found."
#             },
#             status=status.HTTP_404_NOT_FOUND
#         )

#     new_status = request.data.get(
#         "status",
#         ""
#     ).strip()

#     location = request.data.get(
#         "location",
#         ""
#     ).strip()

#     note = request.data.get(
#         "note",
#         ""
#     ).strip()

#     # ------------------------------------------
#     # Valid shipment statuses
#     # ------------------------------------------

#     valid_statuses = [
#         choice[0]
#         for choice in Shipment.STATUS_CHOICES
#     ]

#     # Allow frontend to send:
#     # "In Transit"
#     # or:
#     # "in_transit"

#     normalized_status = (
#         new_status
#         .lower()
#         .replace(" ", "_")
#     )

#     if normalized_status not in valid_statuses:

#         return Response(
#             {
#                 "success": False,
#                 "message": "Invalid delivery status."
#             },
#             status=status.HTTP_400_BAD_REQUEST
#         )

#     # ------------------------------------------
#     # Update shipment
#     # ------------------------------------------

#     shipment.status = normalized_status

#     # Automatically record shipped time

#     if (
#         normalized_status == "shipped"
#         and not shipment.shipped_at
#     ):
#         shipment.shipped_at = timezone.now()

#     # Automatically record delivery time

#     if normalized_status == "delivered":
#         shipment.delivered_at = timezone.now()

#     shipment.save()

#     # ------------------------------------------
#     # Create tracking history
#     # ------------------------------------------

#     ShipmentTracking.objects.create(
#         shipment=shipment,
#         status=shipment.get_status_display(),
#         location=location,
#         note=note
#     )

#     return Response(
#         {
#             "success": True,
#             "message": "Delivery status updated successfully.",
#             "shipment": ShipmentSerializer(
#                 shipment
#             ).data
#         },
#         status=status.HTTP_200_OK
#     )



# ==================================================
# DELIVERY LIST
# Buyer = own deliveries only
# Admin = all deliveries
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_deliveries(request):

    # ------------------------------------------
    # ADMIN
    # Admin can see every delivery
    # ------------------------------------------

    if request.user.is_staff or request.user.is_superuser:

        shipments = (
            Shipment.objects
            .select_related(
                "order",
                "order__user"
            )
            .prefetch_related(
                "tracking_updates"
            )
            .all()
            .order_by("-created_at")
        )

    # ------------------------------------------
    # NORMAL BUYER
    # Buyer can ONLY see their own deliveries
    # ------------------------------------------

    else:

        shipments = (
            Shipment.objects
            .select_related(
                "order",
                "order__user"
            )
            .prefetch_related(
                "tracking_updates"
            )
            .filter(
                order__user=request.user
            )
            .order_by("-created_at")
        )

    serializer = ShipmentSerializer(
        shipments,
        many=True
    )

    return Response(
        {
            "count": shipments.count(),
            "is_admin": (
                request.user.is_staff
                or request.user.is_superuser
            ),
            "deliveries": serializer.data
        },
        status=status.HTTP_200_OK
    )
# ==================================================
# verify_paystack_payment
# ==================================================

@api_view(["POST"])
@permission_classes([IsAdminUser])
def add_tracking_update(
    request,
    shipment_id
):

    try:
        shipment = Shipment.objects.get(
            id=shipment_id
        )

        tracking = ShipmentTracking.objects.create(
            shipment=shipment,
            status=request.data.get("status"),
            location=request.data.get("location"),
            note=request.data.get("note")
        )

        shipment.status = (
            request.data.get("status")
            .lower()
            .replace(" ", "_")
        )

        shipment.save()

        return Response({
            "success": True,
            "message": "Tracking updated",
            "tracking_id": tracking.id
        })

    except Shipment.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Shipment not found"
            },
            status=404
        )
# ==================================================
#order_detail 
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):

    try:
        order = Order.objects.select_related(
            "shipment"
        ).prefetch_related(
            "items",
            "shipment__tracking_updates"
        ).get(
            id=pk,
            user=request.user
        )

        serializer = OrderDetailSerializer(
            order
        )

        return Response(serializer.data)

    except Order.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Order not found"
            },
            status=404
        )

# ==================================================
# ProductQuestionCreateView
# ==================================================

class ProductQuestionCreateView(
    generics.CreateAPIView
):
    serializer_class = ProductQuestionSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def perform_create(
        self,
        serializer
    ):
        serializer.save(
            user=self.request.user
        )

@api_view(["GET"])
def product_questions(request):
    questions = ProductQuestion.objects.all()
    serializer = ProductQuestionSerializer(
        questions,
        many=True
    )
    return Response(serializer.data)

# ==================================================
# verify_paystack_payment
# ==================================================


@api_view(["GET"])
def shipment_tracking(request, tracking_number):
    shipment = Shipment.objects.get(
        tracking_number=tracking_number
    )

    tracking = ShipmentTracking.objects.filter(
        shipment=shipment
    ).order_by("created_at")

    serializer = ShipmentTrackingSerializer(
        tracking,
        many=True
    )

    return Response(serializer.data)


# ==================================================
# verify_paystack_payment
# ==================================================

@api_view(["GET"])
def verify_paystack_payment(request, reference):

    print("=" * 50)
    print("REFERENCE RECEIVED:", reference)
    print("=" * 50)

    try:
        payment_transaction = Transaction.objects.select_related(
            "user",
            "cart"
        ).get(ref=reference)

    except Transaction.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": f"Transaction not found: {reference}"
            },
            status=400
        )

    headers = {
        "Authorization": (
            f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        )
    }

    response = requests.get(
        f"https://api.paystack.co/transaction/verify/{reference}",
        headers=headers,
        timeout=30
    )

    data = response.json()

    print("Paystack Status:", response.status_code)
    print("Paystack Response:", data)

    if not data.get("status"):
        return Response(
            {
                "success": False,
                "message": data.get("message")
            },
            status=400
        )

    if data["data"]["status"] != "success":
        return Response(
            {
                "success": False,
                "message": "Payment not successful"
            },
            status=400
        )

    existing_order = Order.objects.filter(
        transaction=payment_transaction
    ).first()

    if existing_order:
        return Response(
            {
                "success": True,
                "message": "Order already created",
                "order_id": existing_order.id,
                "order_number": existing_order.order_number
            }
        )

    if not payment_transaction.user:
        return Response(
            {
                "success": False,
                "message": "Transaction has no user attached."
            },
            status=400
        )

    cart = payment_transaction.cart

    with db_transaction.atomic():

        payment_transaction.status = "completed"
        payment_transaction.save()

        subtotal = Decimal(
            str(payment_transaction.amount)
        )

        vat = (
            subtotal * Decimal("0.075")
        ).quantize(
            Decimal("0.01")
        )

        delivery_fee = Decimal("0.00")

        total_amount = (
            subtotal +
            vat +
            delivery_fee
        )

        order = Order.objects.create(
            user=payment_transaction.user,
            transaction=payment_transaction,

            shipping_address=
                payment_transaction.shipping_address
                or "",

            city=
                payment_transaction.city
                or "",

            subtotal=subtotal,
            vat=vat,
            delivery_fee=delivery_fee,
            total_amount=total_amount,

            payment_status="paid",
            payment_method="paystack",
            status="processing"
        )

        # Create Shipment
        # shipment = Shipment.objects.create(
        #     order=order,
        #     courier="GIG Logistics",
        #     tracking_number=f"TRK-{order.id}",
        #     status="processing"
        # )
        shipment = Shipment.objects.create(
            order=order,
            courier="",
            tracking_number=f"TRK-{order.id}",
            status="processing"
        )

        ShipmentTracking.objects.create(
            shipment=shipment,
            status="Order Received",
            location="Warehouse",
            note="Order received and awaiting packaging."
        )

        # Process Cart Items
        for item in cart.items.select_related(
            "product"
        ).all():

            product = item.product

            if product.stock_quantity < item.quantity:
                return Response(
                    {
                        "success": False,
                        "message":
                            f"Insufficient stock for {product.name}"
                    },
                    status=400
                )

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                unit_price=product.current_price
            )

            # Deduct Stock
            product.stock_quantity -= item.quantity
            product.save()

            # Stock Movement Log
            StockMovement.objects.create(
                product=product,
                movement_type="out",
                quantity=item.quantity,
                reference=f"ORDER-{order.order_number}"
            )

        # Mark cart paid
        cart.paid = True
        cart.save()

        # Empty cart
        CartItem.objects.filter(
            cart=cart
        ).delete()

    return Response(
        {
            "success": True,
            "message":
                "Payment verified successfully",

            "order_id": order.id,
            "order_number": order.order_number,

            "shipment_id": shipment.id,
            "tracking_number":
                shipment.tracking_number,

            "payment_status":
                payment_transaction.status
        }
    )



# ==================================================
# initialize_paystack_payment
# ==================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initialize_paystack_payment(request):

    print("REQUEST DATA:", request.data)

    cart_code = request.data.get("cart_code")

    try:
        print("CART CODE:", cart_code)

        cart = Cart.objects.get(
            cart_code=cart_code
        )

        print("CART FOUND:", cart)

        # amount = cart.total

        amount = sum(
            item.product.current_price * item.quantity
            for item in cart.items.all()
        )
        print("AMOUNT:", amount)                

        reference = str(uuid.uuid4())

        Transaction.objects.create(
            ref=reference,
            user=request.user,
            cart=cart,
            amount=amount,
            payment_method="paystack",
            # status="pending"
            status="pending"
        )

      
        print("REFERENCE CREATED:", reference)
        print("TRANSACTION ID:", Transaction.id)
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }

     
        payload = {
            "email": request.user.email,
            "amount": int(amount * 100),
            "reference": reference,
            "callback_url": "http://localhost:5173/payment-status"
        }

        print("PAYLOAD:", payload)

        response = requests.post(
            "https://api.paystack.co/transaction/initialize",
            json=payload,
            headers=headers
        )

        print("PAYSTACK RESPONSE:", response.json())

        return Response(response.json())


    except Exception as e:
        print("\n" + "=" * 80)
        print("FULL ERROR TRACEBACK")
        traceback.print_exc()
        print("=" * 80 + "\n")

        return Response(
            {
                "error": str(e),
                "traceback": traceback.format_exc(),
            },
            status=400,
        )


    # except Exception as e:
    #     print("PAYSTACK ERROR:", str(e))

    #     return Response(
    #         {"error": str(e)},
    #         status=400
    #     )

# ==================================================
# download_invoice
# ================================================

def download_invoice(request, order_id):
    order = Order.objects.get(id=order_id)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="invoice_{order.id}.pdf"'
    )

    p = canvas.Canvas(response)

    p.drawString(100, 800, f"Invoice #{order.id}")
    p.drawString(100, 780, f"Customer: {order.full_name}")
    p.drawString(100, 760, f"Total: ₦{order.total_price}")

    p.showPage()
    p.save()

    return response
# ==================================================
# ORDER DETAIL
# ==================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):

    try:
        order = (
            Order.objects
            .prefetch_related("items")
            .get(
                id=pk,
                user=request.user
            )
        )

        serializer = OrderDetailSerializer(
            order,
            context={"request": request}
        )

        return Response(serializer.data)

    except Order.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Order not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def order_detail(request, order_id):

#     order = get_object_or_404(
#         Order,
#         id=order_id,
#         user=request.user
#     )

#     data = {
#         "id": order.id,
#         "order_number": order.order_number,
#         "shipping_address": order.shipping_address,
#         "city": order.city,
#         "status": order.status,

#         "payment_type": order.payment_type,
#         "payment_method": order.payment_method,

#         "subtotal": float(order.subtotal),
#         "total_amount": float(order.total_amount),
#         "created_at": order.created_at,

#         "items": [
#             {
#                 "id": item.id,
#                 "product_name": item.product.name,
#                 "quantity": item.quantity,
#                 "unit_price": float(item.unit_price),
#                 "total_price": float(
#                     item.unit_price * item.quantity
#                 ),
#             }
#             for item in order.items.all()
#         ],
#     }


# ==================================================
# UPDATE
# ==================================================

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([
    MultiPartParser,
    FormParser,
    JSONParser,
])
def update_profile(request):

    user = request.user

    # =====================================================
    # PERSONAL INFORMATION
    # =====================================================

    user.first_name = request.data.get(
        "first_name",
        user.first_name
    )

    user.last_name = request.data.get(
        "last_name",
        user.last_name
    )

    user.username = request.data.get(
        "username",
        user.username
    )

    user.email = request.data.get(
        "email",
        user.email
    )

    # =====================================================
    # CONTACT INFORMATION
    # =====================================================

    if "phone" in request.data:
        user.phone = request.data.get("phone", "").strip()

    # =====================================================
    # LOCATION INFORMATION
    # =====================================================

    if "country" in request.data:
        user.country = request.data.get("country", "").strip()

    if "state" in request.data:
        user.state = request.data.get("state", "").strip()

    if "city" in request.data:
        user.city = request.data.get("city", "").strip()

    if "address" in request.data:
        user.address = request.data.get("address", "").strip()

    # =====================================================
    # PROFILE PICTURE
    # =====================================================

    profile_picture = request.FILES.get("profile_picture")

    if profile_picture:
        user.profile_picture = profile_picture

    # =====================================================
    # PASSWORD
    # =====================================================

    password = request.data.get("password")

    if password:
        user.set_password(password)

    # =====================================================
    # SAVE
    # =====================================================

    user.save()

    # =====================================================
    # SERIALIZED USER
    # =====================================================

    from .serializers import UserSerializer

    serializer = UserSerializer(
        user,
        context={"request": request}
    )

    return Response(
        {
            "message": "Profile updated successfully",
            "user": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

# @api_view(["PUT", "PATCH"])
# @permission_classes([IsAuthenticated])
# def update_profile(request):
#     user = request.user

#     user.first_name = request.data.get(
#         "first_name",
#         user.first_name
#     )

#     user.last_name = request.data.get(
#         "last_name",
#         user.last_name
#     )

#     user.username = request.data.get(
#         "username",
#         user.username
#     )

#     user.email = request.data.get(
#         "email",
#         user.email
#     )

#     user.phone = request.data.get(
#         "phone",
#         user.phone
#     )

#     user.country = request.data.get(
#         "country",
#         user.country
#     )

#     user.state = request.data.get(
#         "state",
#         user.state
#     )

#     user.city = request.data.get(
#         "city",
#         user.city
#     )

#     user.address = request.data.get(
#         "address",
#         user.address
#     )

#     password = request.data.get("password")

#     if password:
#         user.set_password(password)

#     user.save()

#     return Response({
#         "message": "Profile updated successfully"
#     })

# ==================================================
# REGISTER
# ==================================================

@api_view(["POST"])
def register_user(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "Registration successful"},
        status=status.HTTP_201_CREATED
    )
# ==================================================
# CONTACT
# ==================================================
@api_view(["POST"])
def contact_message(request):
    serializer = ContactMessageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Message sent successfully"},
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )
# ==================================================
# JWT
# ==================================================

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ==================================================
# PRODUCTS
# ==================================================

class ProductListView(generics.ListAPIView):

    serializer_class = ProductSerializer

    def get_queryset(self):
        return (
            Product.objects
            .filter(is_active=True)
            .select_related(
                "category",
                "subcategory",
                "seller"
            )
            .prefetch_related(
                "media",
                "variants",
                "reviews"
            )
            .order_by("-created_at")
        )



@api_view(["GET"])
@permission_classes([AllowAny])
def products(request):

    queryset = Product.objects.filter(
        is_active=True
    )

    # Search
    search = request.GET.get("search")
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search) |
            Q(brand__icontains=search)
        )

    # Filters
    # category = request.GET.get("category")
    # brand = request.GET.get("brand")
    # min_price = request.GET.get("min_price")
    # max_price = request.GET.get("max_price")

    category = request.GET.get("category")
    subcategory = request.GET.get("subcategory")
    brand = request.GET.get("brand")
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")

    if category:
        queryset = queryset.filter(
            category__slug=category
        )

    if subcategory:
        queryset = queryset.filter(
            subcategory__slug=subcategory
        )

    if brand:
        queryset = queryset.filter(
            brand__icontains=brand
        )

    if min_price:
        queryset = queryset.filter(
            current_price__gte=min_price
        )

    if max_price:
        queryset = queryset.filter(
            current_price__lte=max_price
        )

    serializer = ProductSerializer(
        queryset,
        many=True
    )

    return Response(serializer.data)


# # Search
# search = request.GET.get("search")

# if search:
#     queryset = queryset.filter(
#         Q(name__icontains=search) |
#         Q(description__icontains=search) |
#         Q(brand__icontains=search)
#     )


# # Filters
# category = request.GET.get("category")
# subcategory = request.GET.get("subcategory")
# brand = request.GET.get("brand")
# min_price = request.GET.get("min_price")
# max_price = request.GET.get("max_price")


# if category:
#     queryset = queryset.filter(
#         category__slug=category
#     )


# if subcategory:
#     queryset = queryset.filter(
#         subcategory__slug=subcategory
#     )


# if brand:
#     queryset = queryset.filter(
#         brand__icontains=brand
#     )


# if min_price:
#     queryset = queryset.filter(
#         current_price__gte=min_price
#     )


# if max_price:
#     queryset = queryset.filter(
#         current_price__lte=max_price
#     )


# class ProductDetailView(
#     generics.RetrieveAPIView
# ):
#     permission_classes = [AllowAny]

#     serializer_class = DetailedProductSerializer
#     lookup_field = "slug"

#     queryset = Product.objects.select_related(
#         "category",
#         "subcategory"
#     ).prefetch_related(
#         "media",
#         "variants",
#         "reviews",
#         "specifications",
#         "questions",
#     )

@api_view(["GET"])
@permission_classes([AllowAny])
def product_detail(request, slug):

    product = get_object_or_404(
        Product.objects
        .select_related(
            "category",
            "subcategory"
        )
        .prefetch_related(
            "media",
            "variants",
            "reviews"
        ),
        slug=slug,
        is_active=True
    )

    if request.user.is_authenticated:
        RecentlyViewed.objects.update_or_create(
            user=request.user,
            product=product
        )

    serializer = DetailedProductSerializer(product)

    return Response(serializer.data)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "slug"

# ==================================================
# BANNER
# ==================================================
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Banner
from .serializers import BannerSerializer

@api_view(["GET"])
def banner_list(request):

    banners = Banner.objects.filter(
        is_active=True
    ).order_by("-created_at")

    serializer = BannerSerializer(
        banners,
        many=True
    )

    return Response(serializer.data)


@api_view(["GET"])
def banners(request):
    banners = Banner.objects.all()

    data = [
        {
            "id": banner.id,
            "title": banner.title,
            "image": banner.image.url if banner.image else None,
        }
        for banner in banners
    ]

    return Response(data)
# ==================================================
# USER
# ==================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     return Response(
#         UserSerializer(request.user).data
#     )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_info(request):

    serializer = UserSerializer(
        request.user,
        context={
            "request": request,
        },
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    return Response(
        UserSerializer(request.user).data
    )


# ==================================================
# CART
# ==================================================

@api_view(["POST"])
def add_item(request):

    try:
        print("REQUEST DATA:", request.data)

        cart_code = request.data.get("cart_code")
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        product = Product.objects.get(id=product_id)

        cart, created = Cart.objects.get_or_create(
            cart_code=cart_code
        )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if not created:
            cart_item.quantity += int(quantity)
        else:
            cart_item.quantity = int(quantity)

        cart_item.save()

        return Response({
            "success": True
        })

    except Exception as e:

        import traceback

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=500
        )

# @api_view(["POST"])
# @permission_classes([AllowAny])
# def add_item(request):

#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code:
#         return Response(
#             {"error": "cart_code required"},
#             status=400
#         )

#     if not product_id:
#         return Response(
#             {"error": "product_id required"},
#             status=400
#         )

#     product = get_object_or_404(
#         Product,
#         id=product_id,
#         is_active=True
#     )

#     amount = sum(
#         item.product.current_price * item.quantity
#         for item in cart.items.all()
#     )


#     cart, _ = Cart.objects.get_or_create(
#         cart_code=cart_code,
#         defaults={
#             "user": request.user
#             if request.user.is_authenticated
#             else None
#         }
#     )

#     item, created = CartItem.objects.get_or_create(
#         cart=cart,
#         product=product
#     )

#     if not created:
#         item.quantity += 1
#         item.save()

#     return Response(
#         CartSerializer(cart).data
#     )


@api_view(["GET"])
def get_cart(request):

    cart_code = request.GET.get("cart_code")

    if not cart_code:
        return Response(
            {"error": "cart_code required"},
            status=400
        )

    cart = Cart.objects.filter(
        cart_code=cart_code,
        paid=False
    ).first()

    if not cart:
        return Response({
            "items": []
        })

    return Response(
        CartSerializer(cart).data
    )


@api_view(["GET"])
def get_cart_stat(request):

    cart_code = request.GET.get("cart_code")

    if not cart_code:
        return Response(
            {"error": "cart_code required"},
            status=400
        )

    cart = Cart.objects.filter(
        cart_code=cart_code,
        paid=False
    ).first()

    if not cart:
        return Response({
            "cart_code": cart_code,
            "num_of_items": 0,
            "total_quantity": 0,
        })

    return Response({
        "cart_code": cart.cart_code,
        "num_of_items": cart.items.count(),
        "total_quantity": sum(
            item.quantity
            for item in cart.items.all()
        ),
    })


@api_view(["GET"])
def product_in_cart(request):

    cart_code = request.GET.get("cart_code")
    product_id = request.GET.get("product_id")

    exists = CartItem.objects.filter(
        cart__cart_code=cart_code,
        product_id=product_id
    ).exists()

    return Response({
        "product_in_cart": exists
    })


from .models import CartItem

@api_view(["DELETE"])
@permission_classes([AllowAny])
def remove_item(request, item_id):

    print("Deleting Item:", item_id)

    item = CartItem.objects.filter(id=item_id).first()

    print("Database Item:", item)

    if item is None:
        return Response(
            {
                "success": False,
                "message": f"CartItem {item_id} not found"
            },
            status=404
        )

    item.delete()

    return Response(
        {
            "success": True,
            "message": "Deleted"
        }
    )

# @api_view(["DELETE"])
# @permission_classes([AllowAny])
# def remove_item(request, item_id):

#     item = get_object_or_404(
#         CartItem,
#         id=item_id
#     )

#     item.delete()

#     return Response({
#         "success": True,
#         "message": "Item removed successfully"
#     })


@api_view(["PATCH", "POST"])
@permission_classes([AllowAny])
def update_cart_item(request, item_id):

    item = get_object_or_404(
        CartItem,
        id=item_id
    )

    quantity = int(
        request.data.get("quantity", 1)
    )

    if quantity <= 0:
        item.delete()

        return Response({
            "success": True
        })

    item.quantity = quantity
    item.save()

    return Response({
        "success": True,
        "quantity": item.quantity
    })

# @api_view(["PUT"])
# @permission_classes([AllowAny])
# def update_cart_item(request, item_id):

#     item = get_object_or_404(
#         CartItem,
#         id=item_id
#     )

#     quantity = request.data.get("quantity")

#     if not quantity:
#         return Response(
#             {"error": "Quantity required"},
#             status=400
#         )

#     quantity = int(quantity)

#     if quantity < 1:
#         return Response(
#             {"error": "Quantity must be greater than 0"},
#             status=400
#         )

#     item.quantity = quantity
#     item.save()

#     return Response({
#         "success": True,
#         "message": "Cart updated successfully",
#         "quantity": item.quantity
#     })


@api_view(["DELETE"])
def clear_cart(request, cart_code):
    try:
        cart = Cart.objects.get(cart_code=cart_code)

        CartItem.objects.filter(
            cart=cart
        ).delete()

        return Response({
            "success": True,
            "message": "Cart cleared successfully"
        })

    except Cart.DoesNotExist:
        return Response({
            "success": False,
            "message": "Cart not found"
        }, status=status.HTTP_404_NOT_FOUND)


# @api_view(["PUT"])
# @permission_classes([IsAuthenticated])
# def update_cart_item(request, item_id):

#     item = get_object_or_404(
#         CartItem,
#         id=item_id
#     )

#     quantity = request.data.get("quantity")

#     try:
#         quantity = int(quantity)

#         if quantity < 1:
#             raise ValueError

#     except Exception:
#         return Response(
#             {"error": "Invalid quantity"},
#             status=400
#         )

#     item.quantity = quantity
#     item.save()

#     return Response({
#         "success": True,
#         "quantity": item.quantity
#     })


# ==================================================
# CATEGORY
# ==================================================

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(
        is_active=True
    )
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(
        is_active=True
    )
    serializer_class = CategoryDetailSerializer
    lookup_field = "slug"


class SubCategoryListView(generics.ListAPIView):
    queryset = SubCategory.objects.filter(
        is_active=True
    )
    serializer_class = SubCategorySerializer


# ==================================================
# REVIEWS
# ==================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_review(request, product_id):

    product = get_object_or_404(
        Product,
        id=product_id
    )

    ProductReview.objects.update_or_create(
        user=request.user,
        product=product,
        defaults={
            "rating": request.data.get("rating"),
            "comment": request.data.get(
                "comment",
                ""
            )
        }
    )

    return Response({
        "success": True,
        "message": "Review saved"
    })


# ==================================================
# WISHLIST
# ==================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request, product_id):

    product = get_object_or_404(
        Product,
        id=product_id
    )

    Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )

    return Response({
        "message": "Added to wishlist"
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def wishlist_items(request):

    items = Wishlist.objects.filter(
        user=request.user
    )

    serializer = WishlistSerializer(
        items,
        many=True
    )

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):

    Wishlist.objects.filter(
        user=request.user,
        product_id=product_id
    ).delete()

    return Response({
        "message": "Removed from wishlist"
    })


# ==================================================
# RECENTLY VIEWED
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recently_viewed(request):

    items = (
        RecentlyViewed.objects
        .filter(user=request.user)
        .select_related("product")
        .order_by("-viewed_at")[:20]
    )

    return Response([
        {
            "id": item.id,
            "product_id": item.product.id,
            "product_name": item.product.name,
            "viewed_at": item.viewed_at,
        }
        for item in items
    ])


# ==================================================
# PRODUCT VARIANTS
# ==================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def product_variants(request, product_id):

    variants = ProductVariant.objects.filter(
        product_id=product_id
    )

    serializer = ProductVariantSerializer(
        variants,
        many=True
    )

    return Response(serializer.data)


# ==================================================
# SHIPMENT
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def track_shipment(
    request,
    tracking_number
):

    shipment = get_object_or_404(
        Shipment,
        tracking_number=tracking_number
    )

    serializer = ShipmentSerializer(
        shipment
    )

    return Response(serializer.data)


# ==================================================
# PRODUCT MEDIA
# ==================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_product_media(
    request,
    product_id
):

    product = get_object_or_404(
        Product,
        id=product_id
    )

    file = request.FILES.get("file")

    if not file:
        return Response(
            {"error": "file is required"},
            status=400
        )

    media = ProductMedia.objects.create(
        product=product,
        media_type=request.data.get(
            "media_type",
            "image"
        ),
        file=file,
        is_primary=request.data.get(
            "is_primary",
            False
        ),
    )

    serializer = ProductMediaSerializer(
        media
    )

    return Response(
        serializer.data,
        status=201
    )


# ==================================================
# PAYMENT
# ==================================================

def verify_transaction(tx_ref):

    try:

        transaction = Transaction.objects.get(
            ref=tx_ref
        )

        headers = {
            "Authorization":
            f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
        }

        response = requests.get(
            f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
            headers=headers,
            timeout=30
        )

        data = response.json()

        if (
            response.status_code == 200
            and data.get("status") == "success"
        ):

            payment_data = data.get("data", {})

            if (
                float(payment_data.get("amount", 0))
                == float(transaction.amount)
                and payment_data.get("currency")
                == transaction.currency
                and payment_data.get("status")
                == "successful"
            ):

                transaction.status = "completed"

                transaction.cart.paid = True
                transaction.cart.save()

                transaction.save()

                return True

        transaction.status = "failed"
        transaction.save()

        return False

    except Transaction.DoesNotExist:
        return False


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    try:
        cart_code = request.data.get("cart_code")

        cart = Cart.objects.filter(
            cart_code=cart_code,
            paid=False,
        ).first()

        if not cart:
            return Response(
                {
                    "status": "error",
                    "message": "Cart not found."
                },
                status=404,
            )

        amount = sum(
            Decimal(item.quantity) * item.product.current_price
            for item in cart.items.all()
        )

        tx_ref = str(uuid.uuid4())

        Transaction.objects.create(
            ref=tx_ref,
            user=request.user,
            cart=cart,
            amount=amount,
            currency="NGN",
        )

        payload = {
            "tx_ref": tx_ref,
            "amount": str(amount),
            "currency": "NGN",
            "redirect_url": f"{settings.FRONTEND_URL}/payment-status",
            "payment_options": "card,banktransfer,ussd",
            "customer": {
                "email": request.user.email,
                "name": request.user.get_full_name() or request.user.username,
            },
            "customizations": {
                "title": "CrystalClear Store",
                "description": "Order Payment",
            },
            "meta": {
                "cart_code": cart_code,
                "user_id": request.user.id,
            },
        }

        # payload = {
        #     "tx_ref": tx_ref,
        #     "amount": float(amount),
        #     "currency": "NGN",
        #     "redirect_url": f"{settings.FRONTEND_URL}/payment-status",
        #     "payment_options": "card,banktransfer,ussd",
        #     "customer": {
        #         "email": request.user.email,
        #         "name": request.user.get_full_name()
        #         or request.user.username,
        #     },
        #     "customizations": {
        #         "title": "CrystalClear Store",
        #         "description": "Order Payment",
        #         "logo": "",
        #     },
        #     "meta": {
        #         "cart_code": cart_code,
        #         "user_id": request.user.id,
        #     },
        # }

        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json",
        }

        response = requests.post(
            "https://api.flutterwave.com/v3/payments",
            json=payload,
            headers=headers,
            timeout=30,
        )

        print("=" * 70)
        print("STATUS:", response.status_code)
        print("BODY:", response.text)
        print("=" * 70)

        data = response.json()

        if response.status_code != 200:
            return Response(
                {
                    "status": "error",
                    "flutterwave": data,
                },
                status=response.status_code,
            )

        return Response(data)

    except Exception as e:
        traceback.print_exc()

        return Response(
            {
                "status": "error",
                "message": str(e),
            },
            status=500,
        )

# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):

#     try:

#         cart_code = request.data.get(
#             "cart_code"
#         )

#         cart = Cart.objects.filter(
#             cart_code=cart_code,
#             paid=False
#         ).first()

#         if not cart:
#             return Response(
#                 {"error": "Cart not found"},
#                 status=400
#             )

#         amount = sum(
#             Decimal(item.quantity)
#             * item.product.current_price
#             for item in cart.items.all()
#         )

#         tx_ref = str(uuid.uuid4())

#         Transaction.objects.create(
#             ref=tx_ref,
#             user=request.user,
#             cart=cart,
#             amount=amount,
#             currency="NGN"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(amount),
#             "currency": "NGN",
#             "redirect_url": f"{BASE_URL}/payment-status",
#             "customer": {
#                 "email": request.user.email,
#                 "name": request.user.username
#             }
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers={
#                 "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#                 "Content-Type": "application/json",
#             },
#         )

#         print("=" * 60)
#         print("STATUS:", response.status_code)
#         print("BODY:")
#         print(response.text)
#         print("=" * 60)

#         return Response(response.json(), status=response.status_code)

        # response = requests.post(
        #     "https://api.flutterwave.com/v3/payments",
        #     json=payload,
        #     headers={
        #         "Authorization":
        #         f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
        #     }
        # )

        # print(response.status_code)
        # print(response.json())
        # return Response(
        #     response.json(),
        #     status=response.status_code
        # )

    except Exception as e:
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=500
        )









@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verify_payment(request, tx_ref):

    success = verify_transaction(tx_ref)

    if not success:
        return Response(
            {
                "success": False,
                "message": "Payment verification failed",
                "tx_ref": tx_ref,
            },
            status=400,
        )

    try:

        transaction = Transaction.objects.select_related(
            "user",
            "cart"
        ).get(ref=tx_ref)

        existing_order = Order.objects.filter(
            transaction=transaction
        ).first()

        if existing_order:
            return Response(
                {
                    "success": True,
                    "message": "Order already exists",
                    "order_number": existing_order.order_number,
                    "tx_ref": tx_ref,
                }
            )

        with db_transaction.atomic():

            subtotal = Decimal(str(transaction.amount))

            vat = (
                subtotal * Decimal("0.075")
            ).quantize(
                Decimal("0.01")
            )

            delivery_fee = Decimal("0.00")

            total_amount = (
                subtotal +
                vat +
                delivery_fee
            )

            # Create Order
            order = Order.objects.create(
                user=transaction.user,
                transaction=transaction,

                shipping_address=
                transaction.shipping_address
                or getattr(
                    transaction.user,
                    "address",
                    ""
                ),

                city=
                transaction.city
                or getattr(
                    transaction.user,
                    "city",
                    "Unknown"
                ),

                subtotal=subtotal,
                vat=vat,
                delivery_fee=delivery_fee,
                total_amount=total_amount,

                payment_type="online",
                payment_method="flutterwave",
                payment_status="paid",
                status="processing",
            )

            # Create Shipment
            shipment = Shipment.objects.create(
                order=order,
                courier="GIG Logistics",
                status="processing"
            )

            # Initial Tracking Entry
            ShipmentTracking.objects.create(
                shipment=shipment,
                status="Order Received",
                location="Warehouse",
                note=(
                    "Order received and "
                    "awaiting packaging."
                )
            )

            # Process Cart Items
            for item in transaction.cart.items.select_related(
                "product"
            ):

                product = item.product

                # Validate stock
                if product.stock_quantity < item.quantity:
                    raise Exception(
                        f"Insufficient stock for "
                        f"{product.name}"
                    )

                # Create Order Item
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item.quantity,
                    unit_price=product.current_price,
                )

                # Deduct stock
                product.stock_quantity -= item.quantity
                product.save()

                # Record stock movement
                StockMovement.objects.create(
                    product=product,
                    movement_type="out",
                    quantity=item.quantity,
                )

            # Mark cart paid
            transaction.cart.paid = True
            transaction.cart.save()

            # Clear cart
            CartItem.objects.filter(
                cart=transaction.cart
            ).delete()

            # Mark transaction completed
            transaction.status = "completed"
            transaction.save()

        return Response(
            {
                "success": True,
                "message":
                "Payment verified successfully",

                "order_number":
                order.order_number,

                "shipment_id":
                shipment.id,

                "tx_ref":
                tx_ref,
            }
        )

    except Transaction.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Transaction not found",
            },
            status=404,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": str(e),
            },
            status=500,
        )



# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):

#     success = verify_transaction(tx_ref)

#     if not success:
#         return Response(
#             {
#                 "success": False,
#                 "message": "Payment verification failed",
#                 "tx_ref": tx_ref,
#             },
#             status=400,
#         )

#     try:

#         transaction = Transaction.objects.select_related(
#             "user",
#             "cart"
#         ).get(ref=tx_ref)

#         existing_order = Order.objects.filter(
#             transaction=transaction
#         ).first()

#         if existing_order:
#             return Response(
#                 {
#                     "success": True,
#                     "message": "Order already exists",
#                     "order_number": existing_order.order_number,
#                     "tx_ref": tx_ref,
#                 }
#             )

#         with db_transaction.atomic():

#             order = Order.objects.create(
#                 user=transaction.user,
#                 transaction=transaction,
#                 shipping_address=
#                 transaction.shipping_address
#                 or transaction.user.address
#                 or "",

#                 city=
#                 transaction.city
#                 or transaction.user.city
#                 or "Unknown",

#                 subtotal=transaction.amount,
#                 total_amount=transaction.amount,

#                 payment_type="online",
#                 payment_method="flutterwave",
#                 payment_status="paid",
#                 status="processing",
#             )

#             for item in transaction.cart.items.select_related(
#                 "product"
#             ):

#                 product = item.product

#                 # Validate stock
#                 if product.stock_quantity < item.quantity:
#                     raise Exception(
#                         f"Insufficient stock for "
#                         f"{product.name}"
#                     )

#                 # Create order item
#                 OrderItem.objects.create(
#                     order=order,
#                     product=product,
#                     quantity=item.quantity,
#                     unit_price=product.current_price,
#                 )

#                 # Deduct stock
#                 product.stock_quantity -= item.quantity
#                 product.save()

#                 # Record stock movement
#                 StockMovement.objects.create(
#                     product=product,
#                     movement_type="out",
#                     quantity=item.quantity,
#                 )

#             # Mark cart paid
#             transaction.cart.paid = True
#             transaction.cart.save()

#             # Clear cart
#             CartItem.objects.filter(
#                 cart=transaction.cart
#             ).delete()

#             # Update transaction
#             transaction.status = "completed"
#             transaction.save()

#         return Response(
#             {
#                 "success": True,
#                 "message":
#                     "Payment verified successfully",
#                 "order_number":
#                     order.order_number,
#                 "tx_ref":
#                     tx_ref,
#             }
#         )

#     except Transaction.DoesNotExist:
#         return Response(
#             {
#                 "success": False,
#                 "message": "Transaction not found",
#             },
#             status=404,
#         )

#     except Exception as e:
#         return Response(
#             {
#                 "success": False,
#                 "message": str(e),
#             },
#             status=500,
#         )






@api_view(["GET"])
@permission_classes([AllowAny])
def payment_callback(request):

    tx_ref = request.GET.get("tx_ref")

    success = verify_transaction(tx_ref)

    return Response({
        "success": success,
        "tx_ref": tx_ref
    })


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):

#     tx_ref = request.GET.get("tx_ref")

#     success = verify_transaction(tx_ref)

#     return Response({
#         "success": success,
#         "tx_ref": tx_ref
#     })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):

    orders = (
        Order.objects
        .filter(user=request.user)
        .prefetch_related("items")
        .order_by("-created_at")
    )

    serializer = OrderSerializer(
        orders,
        many=True
    )

    return Response({
        "count": orders.count(),
        "orders": serializer.data
    })


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def my_orders(request):

#     orders = Order.objects.filter(
#         user=request.user
#     ).order_by("-created_at")

#     serializer = OrderSerializer(
#         orders,
#         many=True
#     )

#     return Response({
#         "count": orders.count(),
#         "orders": serializer.data
#     })



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_order(request, order_id):
    try:
        order = Order.objects.get(
            id=order_id,
            user=request.user
        )

        # Optional: Prevent deleting paid orders
        if order.payment_status == "paid":
            return Response(
                {
                    "error": "Paid orders cannot be deleted."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.delete()

        return Response(
            {
                "success": True,
                "message": "Order deleted successfully."
            }
        )

    except Order.DoesNotExist:
        return Response(
            {
                "error": "Order not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def my_orders(request):

#     orders = Order.objects.filter(
#         user=request.user
#     )

#     serializer = OrderSerializer(
#         orders,
#         many=True
#     )

#     return Response(serializer.data)














# from decimal import Decimal
# import uuid
# import requests
# import traceback

# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.conf import settings

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import generics
# from rest_framework.views import APIView

# from rest_framework_simplejwt.views import TokenObtainPairView

# from .models import (
#     Category,
#     SubCategory,
#     Product,
#     ProductVariant,
#     ProductMedia,
#     Shipment,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Cart,
#     CartItem,
#     Transaction,
# )

# from .serializers import (
#     CategorySerializer,
#     SubCategorySerializer,
#     CategoryDetailSerializer,
#     ProductVariantSerializer,
#     ProductMediaSerializer,
#     ShipmentSerializer,
#     ProductSerializer,
#     DetailedProductSerializer,
#     WishlistSerializer,
#     CartSerializer,
#     CartItemSerializer,
#     MyTokenObtainPairSerializer,
#     UserSerializer,
# )

# BASE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# from rest_framework_simplejwt.views import TokenObtainPairView


# # ==================================================
# # GET_CART_STAT
# # ==================================================



# # ==================================================
# # HOME
# # ==================================================
# def home(request):
#     return JsonResponse({"message": "Ecommerce API is running"})



# # ==================================================
# # JWT
# # ==================================================
# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# # ==================================================
# # PRODUCTS
# # ==================================================
# class ProductListView(generics.ListAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer


# @api_view(["GET"])
# def products(request):
#     return Response(ProductSerializer(Product.objects.all(), many=True).data)


# @api_view(["GET"])
# def product_detail(request, slug):
#     product = get_object_or_404(Product, slug=slug)

#     if request.user.is_authenticated:
#         RecentlyViewed.objects.update_or_create(
#             user=request.user,
#             product=product
#         )

#     return Response(DetailedProductSerializer(product).data)


# # ==================================================
# # CART
# # ==================================================
# @api_view(["POST"])
# def add_item(request):
#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     product = get_object_or_404(Product, id=product_id)
#     cart, _ = Cart.objects.get_or_create(cart_code=cart_code)

#     item, created = CartItem.objects.get_or_create(cart=cart, product=product)

#     if not created:
#         item.quantity += 1
#         item.save()

#     return Response({"message": "Item added"})


# @api_view(["GET"])
# def get_cart(request):
#     cart_code = request.GET.get("cart_code")

#     cart = Cart.objects.filter(cart_code=cart_code).first()

#     if not cart:
#         return Response({"items": []})

#     return Response({
#         "items": [
#             {"product": i.product.name, "quantity": i.quantity}
#             for i in cart.items.all()
#         ]
#     })




# @api_view(["GET"])
# def get_cart_stat(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response(
#             {"error": "cart_code required"},
#             status=400
#         )

#     cart = Cart.objects.filter(
#         cart_code=cart_code,
#         paid=False
#     ).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "num_of_items": 0,
#             "total_quantity": 0,
#         })

#     total_quantity = sum(
#         item.quantity for item in cart.items.all()
#     )

#     return Response({
#         "cart_code": cart.cart_code,
#         "num_of_items": cart.items.count(),
#         "total_quantity": total_quantity,
#     })




# # @api_view(["GET"])
# # def get_cart_stat(request):
# #     cart_code = request.GET.get("cart_code")

# #     if not cart_code:
# #         return Response({"error": "cart_code required"}, status=400)

# #     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

# #     if not cart:
# #         return Response({
# #             "cart_code": cart_code,
# #             "num_of_items": 0,
# #             "total_quantity": 0,
# #         })

# #     total_quantity = sum(i.quantity for i in cart.items.all())

# #     return Response({
# #         "cart_code": cart.cart_code,
# #         "num_of_items": cart.items.count(),
# #         "total_quantity": total_quantity,
# #     })


# @api_view(["GET"])
# def product_in_cart(request):
#     cart_code = request.GET.get("cart_code")
#     product_id = request.GET.get("product_id")

#     if not cart_code or not product_id:
#         return Response(
#             {"error": "cart_code and product_id required"},
#             status=400
#         )

#     exists = CartItem.objects.filter(
#         cart__cart_code=cart_code,
#         product_id=product_id
#     ).exists()

#     return Response({
#         "product_in_cart": exists
#     })


# # @api_view(["GET"])
# # def product_in_cart(request):
# #     cart_code = request.GET.get("cart_code")
# #     product_id = request.GET.get("product_id")

# #     if not cart_code or not product_id:
# #         return Response({"error": "cart_code and product_id required"}, status=400)

# #     exists = CartItem.objects.filter(
# #         cart__cart_code=cart_code,
# #         product_id=product_id
# #     ).exists()

# #     return Response({"product_in_cart": exists})


# # ==================================================
# # CART ITEM OPERATIONS (UPDATED FILE COMBINED)
# # ==================================================
# @api_view(["DELETE"])
# @permission_classes([IsAuthenticated])
# def remove_item(request, item_id):
#     item = get_object_or_404(CartItem, id=item_id)
#     item.delete()

#     return Response({"success": True, "message": "Item removed from cart"})


# @api_view(["PUT"])
# @permission_classes([IsAuthenticated])
# def update_cart_item(request, item_id):
#     item = get_object_or_404(CartItem, id=item_id)
#     quantity = request.data.get("quantity")

#     if not quantity:
#         return Response({"error": "Quantity is required"}, status=400)

#     try:
#         quantity = int(quantity)
#         if quantity < 1:
#             return Response({"error": "Quantity must be greater than zero"}, status=400)

#         item.quantity = quantity
#         item.save()

#         return Response({
#             "success": True,
#             "message": "Cart updated",
#             "quantity": item.quantity
#         })

#     except ValueError:
#         return Response({"error": "Invalid quantity"}, status=400)


# class CartItemDetail(APIView):
#     permission_classes = [IsAuthenticated]

#     def delete(self, request, item_id):
#         item = get_object_or_404(CartItem, id=item_id)
#         item.delete()

#         return Response({"success": True, "message": "Item deleted successfully"})

#     def put(self, request, item_id):
#         item = get_object_or_404(CartItem, id=item_id)
#         quantity = request.data.get("quantity")

#         if not quantity:
#             return Response({"error": "Quantity is required"}, status=400)

#         try:
#             quantity = int(quantity)
#             if quantity < 1:
#                 return Response({"error": "Quantity must be greater than zero"}, status=400)

#             item.quantity = quantity
#             item.save()

#             return Response({
#                 "success": True,
#                 "message": "Cart item updated",
#                 "quantity": item.quantity
#             })

#         except ValueError:
#             return Response({"error": "Invalid quantity"}, status=400)


# # ==================================================
# # USER
# # ==================================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     return Response(UserSerializer(request.user).data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     return Response({
#         "id": request.user.id,
#         "username": request.user.username,
#         "email": request.user.email,
#     })


# # ==================================================
# # REVIEW
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_review(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     ProductReview.objects.create(
#         user=request.user,
#         product=product,
#         rating=request.data.get("rating"),
#         comment=request.data.get("comment", "")
#     )

#     return Response({"message": "Review added"})


# # ==================================================
# # WISHLIST (FIXED DUPLICATE REMOVAL)
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_to_wishlist(request, product_id):
#     product = get_object_or_404(Product, id=product_id)
#     Wishlist.objects.get_or_create(user=request.user, product=product)
#     return Response({"message": "Added to wishlist"})


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def wishlist_items(request):
#     items = Wishlist.objects.filter(user=request.user)

#     return Response([
#         {
#             "id": i.id,
#             "product_id": i.product.id,
#             "product_name": i.product.name,
#         }
#         for i in items
#     ])


# @api_view(["DELETE"])
# @permission_classes([IsAuthenticated])
# def remove_from_wishlist(request, product_id):
#     Wishlist.objects.filter(
#         user=request.user,
#         product_id=product_id
#     ).delete()

#     return Response({"message": "Removed from wishlist"})


# # ==================================================
# # CATEGORY
# # ==================================================
# class CategoryListView(generics.ListAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer


# class CategoryDetailView(generics.RetrieveAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategoryDetailSerializer
#     lookup_field = "slug"


# class SubCategoryListView(generics.ListAPIView):
#     queryset = SubCategory.objects.all()
#     serializer_class = SubCategorySerializer


# # ==================================================
# # PRODUCT VARIANTS
# # ==================================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def product_variants(request, product_id):
#     product = get_object_or_404(Product, id=product_id, is_active=True)
#     variants = ProductVariant.objects.filter(product=product)

#     return Response(ProductVariantSerializer(variants, many=True).data)


# # ==================================================
# # SHIPMENT
# # ==================================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def track_shipment(request, tracking_number):
#     shipment = get_object_or_404(Shipment, tracking_number=tracking_number)
#     return Response(ShipmentSerializer(shipment).data)


# # ==================================================
# # MEDIA UPLOAD
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def upload_product_media(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     file = request.FILES.get("file")
#     if not file:
#         return Response({"error": "file is required"}, status=400)

#     media = ProductMedia.objects.create(
#         product=product,
#         media_type=request.data.get("media_type", "image"),
#         file=file,
#         is_primary=request.data.get("is_primary", False),
#     )

#     return Response(ProductMediaSerializer(media).data, status=201)

# # ==================================================
# # INITIATE PAYMENT (UNCHANGED CORE LOGIC)
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):
#     try:
#         cart_code = request.data.get("cart_code")

#         if not cart_code:
#             return Response({"error": "cart_code required"}, status=400)

#         cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#         if not cart or not cart.items.exists():
#             return Response({"error": "Cart is empty"}, status=400)

#         user = request.user
#         tx_ref = str(uuid.uuid4())

#         amount = sum(
#             Decimal(item.quantity) * item.product.price
#             for item in cart.items.all()
#         )

#         total_amount = amount + Decimal("4.00")

#         Transaction.objects.create(
#             ref=tx_ref,
#             cart=cart,
#             amount=total_amount,
#             currency="NGN",
#             user=user,
#             status="pending"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(total_amount),
#             "currency": "NGN",
#             "redirect_url": "http://localhost:5173/payment-status",
#             "customer": {
#                 "email": user.email,
#                 "name": user.username,
#             }
#         }

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#             "Content-Type": "application/json"
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers=headers,
#             timeout=30
#         )

#         return Response(response.json(), status=response.status_code)

#     except Exception as e:
#         return Response({"error": str(e)}, status=500)
# # ==================================================
# # PAYMENT (UNCHANGED CORE LOGIC)
# # ==================================================
# def verify_transaction(tx_ref):
#     try:
#         transaction = Transaction.objects.get(ref=tx_ref)

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
#         }

#         response = requests.get(
#             f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
#             headers=headers,
#             timeout=30
#         )

#         data = response.json()

#         if response.status_code == 200 and data.get("status") == "success":
#             payment_data = data.get("data", {})

#             if (
#                 float(payment_data.get("amount", 0)) == float(transaction.amount)
#                 and payment_data.get("currency") == transaction.currency
#                 and payment_data.get("status") == "successful"
#             ):
#                 transaction.status = "completed"
#                 transaction.cart.paid = True
#                 transaction.cart.save()
#                 transaction.save()
#                 return True

#         transaction.status = "failed"
#         transaction.save()
#         return False

#     except Transaction.DoesNotExist:
#         return False


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     try:
#         success = verify_transaction(tx_ref)
#         return Response({"success": success, "tx_ref": tx_ref})

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):
#     tx_ref = request.GET.get("tx_ref")

#     if not tx_ref:
#         return Response({"success": False, "error": "tx_ref is required"}, status=400)

#     try:
#         success = verify_transaction(tx_ref)
#         return Response({"success": success, "tx_ref": tx_ref})

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# # ==================================================
# # RECENTLY VIEWED (FINAL CLEAN SINGLE VERSION)
# # ==================================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def recently_viewed(request):
#     items = RecentlyViewed.objects.filter(user=request.user).order_by("-id")[:20]

#     return Response([
#         {
#             "product_id": i.product.id,
#             "product_name": i.product.name,
#         }
#         for i in items
#     ])














# from decimal import Decimal
# import uuid
# import requests
# import traceback

# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.conf import settings

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import generics

# from rest_framework_simplejwt.views import TokenObtainPairView

# from .models import (
#     Category,
#     SubCategory,
#     Product,
#     ProductVariant,
#     ProductMedia,
#     Shipment,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,   # ✅ FIX: required but missing in some setups
#     Cart,
#     CartItem,
#     Transaction,      # ✅ FIX: required for payment
# )


# from .serializers import (
#     CategorySerializer,
#     SubCategorySerializer,
#     CategoryDetailSerializer,
#     ProductVariantSerializer,
#     ProductMediaSerializer,
#     ShipmentSerializer, 
#     ProductSerializer,
#     DetailedProductSerializer,
#     WishlistSerializer,
#     CartSerializer,
#     CartItemSerializer,
#     MyTokenObtainPairSerializer,
#     UserSerializer,
# )

# BASE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# # ==================================================
# # HOME
# # ==================================================
# def home(request):
#     return JsonResponse({"message": "Ecommerce API is running"})


# # ==================================================
# # JWT
# # ==================================================
# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# # ==================================================
# # PRODUCTS
# # ==================================================
# class ProductListView(generics.ListAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer


# @api_view(["GET"])
# def products(request):
#     return Response(ProductSerializer(Product.objects.all(), many=True).data)


# @api_view(["GET"])
# def product_detail(request, slug):
#     product = get_object_or_404(Product, slug=slug)

#     if request.user.is_authenticated:
#         RecentlyViewed.objects.update_or_create(
#             user=request.user,
#             product=product
#         )

#     return Response(DetailedProductSerializer(product).data)


# # ==================================================
# # CART
# # ==================================================
# @api_view(["POST"])
# def add_item(request):
#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     product = get_object_or_404(Product, id=product_id)

#     cart, _ = Cart.objects.get_or_create(cart_code=cart_code)

#     item, created = CartItem.objects.get_or_create(cart=cart, product=product)

#     if not created:
#         item.quantity += 1
#         item.save()

#     return Response({"message": "Item added"})


# @api_view(["GET"])
# def get_cart(request):
#     cart_code = request.GET.get("cart_code")

#     cart = Cart.objects.filter(cart_code=cart_code).first()

#     if not cart:
#         return Response({"items": []})

#     return Response({
#         "items": [
#             {"product": i.product.name, "quantity": i.quantity}
#             for i in cart.items.all()
#         ]
#     })


# @api_view(["GET"])
# def get_cart_stat(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "num_of_items": 0,
#             "total_quantity": 0,
#         })

#     total_quantity = sum(i.quantity for i in cart.items.all())

#     return Response({
#         "cart_code": cart.cart_code,
#         "num_of_items": cart.items.count(),
#         "total_quantity": total_quantity,
#     })


# @api_view(["GET"])
# def product_in_cart(request):
#     cart_code = request.GET.get("cart_code")
#     product_id = request.GET.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     exists = CartItem.objects.filter(
#         cart__cart_code=cart_code,
#         product_id=product_id
#     ).exists()

#     return Response({"product_in_cart": exists})


# # ==================================================
# # USER
# # ==================================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     return Response(UserSerializer(request.user).data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     return Response({
#         "id": request.user.id,
#         "username": request.user.username,
#         "email": request.user.email,
#     })


# # ==================================================
# # REVIEW
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_review(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     ProductReview.objects.create(
#         user=request.user,
#         product=product,
#         rating=request.data.get("rating"),
#         comment=request.data.get("comment", "")
#     )

#     return Response({"message": "Review added"})


# # ==================================================
# # WISHLIST
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_to_wishlist(request, product_id):
#     product = get_object_or_404(Product, id=product_id)
#     Wishlist.objects.get_or_create(user=request.user, product=product)
#     return Response({"message": "Added to wishlist"})


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def wishlist_items(request):
#     items = Wishlist.objects.filter(user=request.user)

#     return Response([
#         {
#             "id": i.id,
#             "product_id": i.product.id,
#             "product_name": i.product.name,
#         }
#         for i in items
#     ])


# @api_view(["DELETE"])
# @permission_classes([IsAuthenticated])
# def remove_from_wishlist(request, product_id):
#     try:
#         wishlist_item = Wishlist.objects.filter(
#             user=request.user,
#             product_id=product_id
#         ).first()

#         if not wishlist_item:
#             return Response(
#                 {"message": "Item not found in wishlist"},
#                 status=404
#             )

#         wishlist_item.delete()

#         return Response(
#             {"message": "Removed from wishlist"},
#             status=200
#         )

#     except Exception as e:
#         return Response(
#             {"error": str(e)},
#             status=500
#         )

# # ==================================================
# # CATEGORY
# # ==================================================
# class CategoryListView(generics.ListAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer


# class CategoryDetailView(generics.RetrieveAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategoryDetailSerializer
#     lookup_field = "slug"


# class SubCategoryListView(generics.ListAPIView):
#     queryset = SubCategory.objects.all()
#     serializer_class = SubCategorySerializer


# # ==================================================
# # PAYMENT
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):
#     try:
#         cart_code = request.data.get("cart_code")

#         if not cart_code:
#             return Response({"error": "cart_code required"}, status=400)

#         cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#         if not cart or not cart.items.exists():
#             return Response({"error": "Cart is empty"}, status=400)

#         user = request.user
#         tx_ref = str(uuid.uuid4())

#         amount = sum(
#             Decimal(i.quantity) * i.product.price
#             for i in cart.items.all()
#         )

#         total_amount = amount + Decimal("4.00")

#         Transaction.objects.create(
#             ref=tx_ref,
#             cart=cart,
#             amount=total_amount,
#             currency="NGN",
#             user=user,
#             status="pending"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(total_amount),
#             "currency": "NGN",
#             "redirect_url": f"{BASE_URL}/payment-status",
#             "customer": {
#                 "email": user.email,
#                 "name": user.username,
#             }
#         }

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#             "Content-Type": "application/json"
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers=headers,
#             timeout=30
#         )

#         return Response(response.json(), status=response.status_code)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"error": str(e)}, status=500)

# # ==================================================
# # PRODUCT VARIANTS
# # ==================================================



# @api_view(["GET"])
# @permission_classes([AllowAny])
# def product_variants(request, product_id):

#     product = get_object_or_404(
#         Product,
#         id=product_id,
#         is_active=True
#     )

#     variants = ProductVariant.objects.filter(
#         product=product
#     )

#     serializer = ProductVariantSerializer(
#         variants,
#         many=True
#     )

#     return Response(serializer.data)


# # ==================================================
# # TRACK SHIPMENT
# # ==================================================

# from .models import Shipment
# from .serializers import ShipmentSerializer


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def track_shipment(request, tracking_number):

#     shipment = get_object_or_404(
#         Shipment,
#         tracking_number=tracking_number
#     )

#     serializer = ShipmentSerializer(
#         shipment
#     )

#     return Response(serializer.data)


# # ==================================================
# # UPLOAD PRODUCT MEDIA
# # ==================================================

# from .models import ProductMedia


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def upload_product_media(request, product_id):

#     product = get_object_or_404(
#         Product,
#         id=product_id
#     )

#     media_type = request.data.get(
#         "media_type",
#         "image"
#     )

#     file = request.FILES.get("file")

#     is_primary = request.data.get(
#         "is_primary",
#         False
#     )

#     if not file:
#         return Response(
#             {"error": "file is required"},
#             status=400
#         )

#     media = ProductMedia.objects.create(
#         product=product,
#         media_type=media_type,
#         file=file,
#         is_primary=is_primary
#     )

#     serializer = ProductMediaSerializer(
#         media
#     )

#     return Response(
#         serializer.data,
#         status=201
#     )


# # =====================================
# # VERIFY TRANSACTION
# # =====================================

# def verify_transaction(tx_ref):
#     try:
#         transaction = Transaction.objects.get(ref=tx_ref)

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
#         }

#         response = requests.get(
#             f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
#             headers=headers,
#             timeout=30
#         )

#         data = response.json()

#         if (
#             response.status_code == 200
#             and data.get("status") == "success"
#         ):
#             payment_data = data.get("data", {})

#             if (
#                 float(payment_data.get("amount", 0))
#                 == float(transaction.amount)
#                 and payment_data.get("currency")
#                 == transaction.currency
#                 and payment_data.get("status")
#                 == "successful"
#             ):
#                 transaction.status = "completed"

#                 transaction.cart.paid = True
#                 transaction.cart.save()

#                 transaction.save()

#                 return True

#         transaction.status = "failed"
#         transaction.save()

#         return False

#     except Transaction.DoesNotExist:
#         return False

# # =====================================
# # VERIFY PAYMENT API
# # =====================================


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     try:
#         transaction = Transaction.objects.get(ref=tx_ref)

#         return Response({
#             "success": True,
#             "tx_ref": tx_ref,
#             "status": transaction.status,
#             "amount": transaction.amount,
#             "currency": transaction.currency,
#             "cart_paid": transaction.cart.paid
#         })

#     except Transaction.DoesNotExist:
#         return Response({
#             "success": False,
#             "message": "Transaction not found",
#             "tx_ref": tx_ref
#         }, status=404)




# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     """
#     Verify a Flutterwave payment transaction
#     """

#     try:
#         success = verify_transaction(tx_ref)

#         return Response(
#             {
#                 "success": success,
#                 "tx_ref": tx_ref,
#             },
#             status=200
#         )

#     except Transaction.DoesNotExist:
#         return Response(
#             {
#                 "success": False,
#                 "error": "Transaction not found"
#             },
#             status=404
#         )

#     except Exception as e:
#         traceback.print_exc()

#         return Response(
#             {
#                 "success": False,
#                 "error": str(e)
#             },
#             status=500
#         )

# # =====================================
# # PAYMENT CALLBACK
# # =====================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):
#     """
#     Flutterwave redirect callback
#     """

#     tx_ref = request.GET.get("tx_ref")

#     if not tx_ref:
#         return Response(
#             {
#                 "success": False,
#                 "error": "tx_ref is required"
#             },
#             status=400
#         )

#     try:
#         success = verify_transaction(tx_ref)

#         return Response(
#             {
#                 "success": success,
#                 "tx_ref": tx_ref,
#             }
#         )

#     except Exception as e:
#         traceback.print_exc()

#         return Response(
#             {
#                 "success": False,
#                 "error": str(e)
#             },
#             status=500
#         )

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def recently_viewed(request):
#     items = RecentlyViewed.objects.filter(user=request.user).order_by("-viewed_at")

#     return Response([
#         {
#             "id": item.id,
#             "product_id": item.product.id,
#             "product_name": item.product.name,
#             "viewed_at": item.viewed_at,
#         }
#         for item in items
#     ])


# @api_view(["DELETE"])
# @permission_classes([IsAuthenticated])
# def remove_from_wishlist(request, product_id):
#     from .models import Wishlist

#     Wishlist.objects.filter(
#         user=request.user,
#         product_id=product_id
#     ).delete()

#     return Response({"message": "Removed from wishlist"})


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def recently_viewed(request):
#     from .models import RecentlyViewed

#     items = RecentlyViewed.objects.filter(user=request.user).order_by("-id")[:20]

#     return Response([
#         {
#             "product_id": i.product.id,
#             "product_name": i.product.name,
#         }
#         for i in items
#     ])

# from django.shortcuts import get_object_or_404
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import permission_classes

# from .models import CartItem


# @api_view(["DELETE"])
# @permission_classes([IsAuthenticated])
# def remove_item(request, item_id):
#     item = get_object_or_404(
#         CartItem,
#         id=item_id,
#         cart__user=request.user
#     )

#     item.delete()

#     return Response(
#         {"success": True, "message": "Item removed from cart"}
#     )


# @api_view(["PUT"])
# def update_cart_item(request, item_id):
#     item = get_object_or_404(
#         CartItem,
#         id=item_id,
#         cart__user=request.user
#     )

#     item.quantity = request.data.get("quantity")
#     item.save()

#     return Response({"message": "Updated"})

# class CartItemDetail(APIView):
#     def delete(self, request, item_id):
#         item = get_object_or_404(
#             CartItem,
#             id=item_id,
#             cart__user=request.user
#         )

# from decimal import Decimal
# import uuid
# import requests
# import traceback

# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.conf import settings

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework import generics

# from rest_framework_simplejwt.views import TokenObtainPairView

# from .models import (
#     Category,
#     SubCategory,
#     Product,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Cart,
#     CartItem,
#     Transaction,
# )

# from .serializers import (
#     CategorySerializer,
#     SubCategorySerializer,
#     CategoryDetailSerializer,
#     ProductSerializer,
#     DetailedProductSerializer,
#     WishlistSerializer,
#     CartSerializer,
#     CartItemSerializer,
#     MyTokenObtainPairSerializer,
#     UserSerializer,
# )

# BASE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# # ==================================================
# # HOME
# # ==================================================
# def home(request):
#     return JsonResponse({"message": "Ecommerce API is running"})


# # ==================================================
# # JWT
# # ==================================================
# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# # ==================================================
# # PRODUCTS
# # ==================================================
# class ProductListView(generics.ListAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer


# @api_view(["GET"])
# def products(request):
#     return Response(ProductSerializer(Product.objects.all(), many=True).data)


# @api_view(["GET"])
# def product_detail(request, slug):
#     product = get_object_or_404(Product, slug=slug)

#     if request.user.is_authenticated:
#         RecentlyViewed.objects.update_or_create(
#             user=request.user,
#             product=product
#         )

#     return Response(DetailedProductSerializer(product).data)


# # ==================================================
# # CART
# # ==================================================
# @api_view(["POST"])
# def add_item(request):
#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     product = get_object_or_404(Product, id=product_id)

#     cart, _ = Cart.objects.get_or_create(cart_code=cart_code)

#     item, created = CartItem.objects.get_or_create(cart=cart, product=product)

#     if not created:
#         item.quantity += 1
#         item.save()

#     return Response({"message": "Item added"})


# @api_view(["GET"])
# def get_cart(request):
#     cart_code = request.GET.get("cart_code")

#     cart = Cart.objects.filter(cart_code=cart_code).first()

#     if not cart:
#         return Response({"items": []})

#     return Response({
#         "items": [
#             {"product": i.product.name, "quantity": i.quantity}
#             for i in cart.items.all()
#         ]
#     })


# @api_view(["GET"])
# def get_cart_stat(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "num_of_items": 0,
#             "total_quantity": 0,
#         })

#     total_quantity = sum(i.quantity for i in cart.items.all())

#     return Response({
#         "cart_code": cart.cart_code,
#         "num_of_items": cart.items.count(),
#         "total_quantity": total_quantity,
#     })


# @api_view(["GET"])
# def product_in_cart(request):
#     cart_code = request.GET.get("cart_code")
#     product_id = request.GET.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     exists = CartItem.objects.filter(
#         cart__cart_code=cart_code,
#         product_id=product_id
#     ).exists()

#     return Response({"product_in_cart": exists})


# # ==================================================
# # USER
# # ==================================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     return Response(UserSerializer(request.user).data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     return Response({
#         "id": request.user.id,
#         "username": request.user.username,
#         "email": request.user.email,
#     })


# # ==================================================
# # REVIEW
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_review(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     ProductReview.objects.create(
#         user=request.user,
#         product=product,
#         rating=request.data.get("rating"),
#         comment=request.data.get("comment", "")
#     )

#     return Response({"message": "Review added"})


# # ==================================================
# # WISHLIST
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def add_to_wishlist(request, product_id):
#     product = get_object_or_404(Product, id=product_id)
#     Wishlist.objects.get_or_create(user=request.user, product=product)
#     return Response({"message": "Added to wishlist"})


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def wishlist_items(request):
#     items = Wishlist.objects.filter(user=request.user)

#     return Response([
#         {
#             "id": i.id,
#             "product_id": i.product.id,
#             "product_name": i.product.name,
#         }
#         for i in items
#     ])


# # ==================================================
# # CATEGORY (CLEANED - NO DUPLICATES)
# # ==================================================
# class CategoryListView(generics.ListAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer


# class CategoryDetailView(generics.RetrieveAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategoryDetailSerializer
#     lookup_field = "slug"


# class SubCategoryListView(generics.ListAPIView):
#     queryset = SubCategory.objects.all()
#     serializer_class = SubCategorySerializer


# # ==================================================
# # PAYMENT
# # ==================================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):
#     try:
#         cart_code = request.data.get("cart_code")

#         if not cart_code:
#             return Response({"error": "cart_code required"}, status=400)

#         cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#         if not cart or not cart.items.exists():
#             return Response({"error": "Cart is empty"}, status=400)

#         user = request.user
#         tx_ref = str(uuid.uuid4())

#         amount = sum(
#             Decimal(i.quantity) * i.product.price
#             for i in cart.items.all()
#         )

#         total_amount = amount + Decimal("4.00")

#         Transaction.objects.create(
#             ref=tx_ref,
#             cart=cart,
#             amount=total_amount,
#             currency="NGN",
#             user=user,
#             status="pending"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(total_amount),
#             "currency": "NGN",
#             "redirect_url": f"{BASE_URL}/payment-status",
#             "customer": {
#                 "email": user.email,
#                 "name": user.username,
#             }
#         }

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#             "Content-Type": "application/json"
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers=headers,
#             timeout=30
#         )

#         return Response(response.json(), status=response.status_code)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"error": str(e)}, status=500)



# # =====================================
# # VERIFY TRANSACTION
# # =====================================
# def verify_transaction(tx_ref):
#     transaction = Transaction.objects.get(ref=tx_ref)

#     headers = {
#         "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
#     }

#     response = requests.get(
#         f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
#         headers=headers,
#         timeout=30
#     )

#     data = response.json()

#     if response.status_code == 200 and data.get("status") == "success":
#         payment = data.get("data", {})

#         if (
#             float(payment.get("amount", 0)) == float(transaction.amount)
#             and payment.get("currency") == transaction.currency
#             and payment.get("status") == "successful"
#         ):
#             transaction.status = "completed"
#             transaction.cart.paid = True
#             transaction.cart.save()
#             transaction.save()
#             return True

#     transaction.status = "failed"
#     transaction.save()
#     return False


# # =====================================
# # VERIFY PAYMENT API
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# # =====================================
# # PAYMENT CALLBACK
# # =====================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):
#     tx_ref = request.GET.get("tx_ref")

#     if not tx_ref:
#         return Response({"error": "tx_ref required"}, status=400)

#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)




# from decimal import Decimal
# import uuid
# import requests
# import traceback

# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.conf import settings

# from rest_framework import status, generics
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny

# from rest_framework_simplejwt.views import TokenObtainPairView

# from shop_app.models import Product
# from shop_app.serializers import ProductSerializer

# from .models import (
#     Category,
#     SubCategory,
#     Product,
#     ProductMedia,
#     ProductVariant,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Shipment,
#     Cart,
#     CartItem,
#     Transaction,
# )

# from .serializers import (
#     CategorySerializer,
#     SubCategorySerializer,
#     CategoryDetailSerializer,
#     ProductSerializer,
#     DetailedProductSerializer,
#     ProductMediaSerializer,
#     ProductVariantSerializer,
#     ProductReviewSerializer,
#     WishlistSerializer,
#     RecentlyViewedSerializer,
#     ShipmentSerializer,
#     CartSerializer,
#     CartItemSerializer,
#     MyTokenObtainPairSerializer,
#     UserSerializer,
# )

# BASE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# # =====================================
# # HOME
# # =====================================
# def home(request):
#     return JsonResponse({"message": "Ecommerce API is running"})


# # =====================================
# # JWT LOGIN VIEW
# # =====================================
# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# # =====================================
# # PRODUCT LIST VIEW
# # =====================================
# class ProductListView(generics.ListAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer


# # =====================================
# # USER PROFILE
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     return Response({
#         "id": request.user.id,
#         "username": request.user.username,
#         "first_name": request.user.first_name,
#         "last_name": request.user.last_name,
#         "email": request.user.email,
#     })


# # =====================================
# # PRODUCTS
# # =====================================
# @api_view(["GET"])
# def products(request):
#     qs = Product.objects.all()
#     serializer = ProductSerializer(qs, many=True)
#     return Response(serializer.data)


# @api_view(["GET"])
# def product_detail(request, slug):
#     product = get_object_or_404(Product, slug=slug)

#     if request.user.is_authenticated:
#         RecentlyViewed.objects.update_or_create(
#             user=request.user,
#             product=product
#         )

#     serializer = DetailedProductSerializer(product)
#     return Response(serializer.data)


# # =====================================
# # CART - ADD ITEM
# # =====================================
# @api_view(["POST"])
# def add_item(request):
#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id are required"}, status=400)

#     product = get_object_or_404(Product, id=product_id)

#     cart, _ = Cart.objects.get_or_create(
#         cart_code=cart_code,
#         defaults={"user": request.user if request.user.is_authenticated else None}
#     )

#     item, created = CartItem.objects.get_or_create(
#         cart=cart,
#         product=product,
#         defaults={"quantity": 1}
#     )

#     if not created:
#         item.quantity += 1
#         item.save()

#     serializer = CartItemSerializer(item)

#     return Response({
#         "message": "Item added successfully",
#         "item": serializer.data,
#     }, status=status.HTTP_201_CREATED)


# # =====================================
# # CHECK PRODUCT IN CART
# # =====================================
# @api_view(["GET"])
# def product_in_cart(request):
#     cart_code = request.GET.get("cart_code")
#     product_id = request.GET.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     exists = CartItem.objects.filter(
#         cart__cart_code=cart_code,
#         product_id=product_id
#     ).exists()

#     return Response({"product_in_cart": exists})


# # =====================================
# # CART STATS
# # =====================================
# @api_view(["GET"])
# def get_cart_stat(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "num_of_items": 0,
#             "total_quantity": 0,
#         })

#     total_quantity = sum(i.quantity for i in cart.items.all())

#     return Response({
#         "cart_code": cart.cart_code,
#         "num_of_items": cart.items.count(),
#         "total_quantity": total_quantity,
#     })


# # =====================================
# # GET CART
# # =====================================
# @api_view(["GET"])
# def get_cart(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "items": [],
#             "num_of_items": 0,
#             "cart_total": 0,
#         })

#     serializer = CartSerializer(cart)
#     return Response(serializer.data)


# # =====================================
# # USER INFO
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)


# # =====================================
# # PAYMENT INITIATION
# # =====================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):
#     try:
#         cart_code = request.data.get("cart_code")

#         if not cart_code:
#             return Response({"error": "cart_code required"}, status=400)

#         cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#         if not cart or not cart.items.exists():
#             return Response({"error": "Cart is empty or not found"}, status=400)

#         user = request.user
#         tx_ref = str(uuid.uuid4())

#         amount = sum(
#             Decimal(i.quantity) * i.product.price
#             for i in cart.items.all()
#         )

#         tax = Decimal("4.00")
#         total_amount = amount + tax

#         Transaction.objects.create(
#             ref=tx_ref,
#             cart=cart,
#             amount=total_amount,
#             currency="NGN",
#             user=user,
#             status="pending"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(total_amount),
#             "currency": "NGN",
#             "redirect_url": f"{BASE_URL}/payment-status",
#             "customer": {
#                 "email": user.email,
#                 "name": user.username,
#             }
#         }

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#             "Content-Type": "application/json"
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers=headers,
#             timeout=30
#         )

#         return Response(response.json(), status=response.status_code)

#     except Exception as e:
#         return Response({"error": str(e)}, status=500)


# # =====================================
# # VERIFY TRANSACTION
# # =====================================
# def verify_transaction(tx_ref):
#     transaction = Transaction.objects.get(ref=tx_ref)

#     headers = {
#         "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
#     }

#     response = requests.get(
#         f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
#         headers=headers,
#         timeout=30
#     )

#     data = response.json()

#     if response.status_code == 200 and data.get("status") == "success":
#         payment = data.get("data", {})

#         if (
#             float(payment.get("amount", 0)) == float(transaction.amount)
#             and payment.get("currency") == transaction.currency
#             and payment.get("status") == "successful"
#         ):
#             transaction.status = "completed"
#             transaction.cart.paid = True
#             transaction.cart.save()
#             transaction.save()
#             return True

#     transaction.status = "failed"
#     transaction.save()
#     return False


# # =====================================
# # VERIFY PAYMENT API
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# # =====================================
# # PAYMENT CALLBACK
# # =====================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):
#     tx_ref = request.GET.get("tx_ref")

#     if not tx_ref:
#         return Response({"error": "tx_ref required"}, status=400)

#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# # =====================================
# # CATEGORY VIEWS
# # =====================================
# class CategoryListView(generics.ListAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategorySerializer


# class CategoryDetailView(generics.RetrieveAPIView):
#     queryset = Category.objects.all()
#     serializer_class = CategoryDetailSerializer
#     lookup_field = "slug"


# class SubCategoryListView(generics.ListAPIView):
#     queryset = SubCategory.objects.all()
#     serializer_class = SubCategorySerializer


# # =====================================
# # ADD REVIEW (FIXED)
# # =====================================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_review(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     rating = request.data.get("rating")
#     comment = request.data.get("comment")

#     if not rating:
#         return Response({"error": "Rating is required"}, status=400)

#     review = ProductReview.objects.create(
#         user=request.user,
#         product=product,
#         rating=rating,
#         comment=comment
#     )

#     return Response({
#         "message": "Review added successfully",
#         "review_id": review.id
#     }, status=201)


# # =====================================
# # WISHLIST - ADD
# # =====================================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_to_wishlist(request, product_id):
#     product = get_object_or_404(Product, id=product_id)

#     if Wishlist.objects.filter(user=request.user, product=product).exists():
#         return Response({"message": "Already in wishlist"}, status=200)

#     Wishlist.objects.create(user=request.user, product=product)

#     return Response({"message": "Added to wishlist"}, status=201)


# # =====================================
# # WISHLIST - LIST
# # =====================================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def wishlist_items(request):
#     items = Wishlist.objects.filter(user=request.user)

#     data = [
#         {
#             "id": w.id,
#             "product_id": w.product.id,
#             "product_name": w.product.name,
#         }
#         for w in items
#     ]

#     return Response(data)




# from decimal import Decimal
# import uuid
# import requests
# import traceback

# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.conf import settings

# from rest_framework import status
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny

# from rest_framework import generics
# from shop_app.models import Product  # ✅ ADD THIS

# from shop_app.serializers import ProductSerializer  # if you have serializer

# from rest_framework_simplejwt.views import TokenObtainPairView
# from .models import Wishlist
# from .serializers import WishlistSerializer


# from shop_app.models import Wishlist


# class ProductListView(generics.ListAPIView):
#     queryset = Product.objects.all()
#     serializer_class = ProductSerializer

# from .models import (
#     Category, 
#     SubCategory,
#     Product,
#     ProductMedia,
#     ProductVariant,
#     ProductReview,
#     Wishlist,
#     RecentlyViewed,
#     Shipment,
#     Cart,
#     CartItem,
#     Transaction,
# )

# from .serializers import (
#     CategorySerializer,
#     SubCategorySerializer,
#     CategoryDetailSerializer,
#     ProductSerializer,
#     DetailedProductSerializer,
#     ProductMediaSerializer,
#     ProductVariantSerializer,
#     ProductReviewSerializer,
#     WishlistSerializer,
#     RecentlyViewedSerializer,
#     ShipmentSerializer,
#     CartSerializer,
#     CartItemSerializer,
#     MyTokenObtainPairSerializer,
#     UserSerializer,
# )

# BASE_URL = getattr(settings, "FRONTEND_URL", "http://localhost:5173")


# # =====================================
# # HOME
# # =====================================
# def home(request):
#     return JsonResponse({"message": "Ecommerce API is running"})


# # =====================================
# # JWT LOGIN VIEW
# # =====================================
# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer


# # =====================================
# # USER PROFILE
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     return Response({
#         "id": request.user.id,
#         "username": request.user.username,
#         "first_name": request.user.first_name,
#         "last_name": request.user.last_name,
#         "email": request.user.email,
#     })


# # =====================================
# # PRODUCTS
# # =====================================
# @api_view(["GET"])
# def products(request):
#     qs = Product.objects.all()
#     serializer = ProductSerializer(qs, many=True)
#     return Response(serializer.data)


# @api_view(["GET"])
# def product_detail(request, slug):
#     product = get_object_or_404(Product, slug=slug)

#     if request.user.is_authenticated:
#         RecentlyViewed.objects.update_or_create(
#             user=request.user,
#             product=product
#         )

#     serializer = DetailedProductSerializer(product)
#     return Response(serializer.data)


# # =====================================
# # CART - ADD ITEM
# # =====================================
# @api_view(["POST"])
# def add_item(request):
#     cart_code = request.data.get("cart_code")
#     product_id = request.data.get("product_id")

#     if not cart_code or not product_id:
#         return Response(
#             {"error": "cart_code and product_id are required"},
#             status=400
#         )

#     product = get_object_or_404(Product, id=product_id)

#     cart, _ = Cart.objects.get_or_create(
#         cart_code=cart_code,
#         defaults={"user": request.user if request.user.is_authenticated else None}
#     )

#     item, created = CartItem.objects.get_or_create(
#         cart=cart,
#         product=product,
#         defaults={"quantity": 1}
#     )

#     if not created:
#         item.quantity += 1
#         item.save()

#     serializer = CartItemSerializer(item)

#     return Response({
#         "message": "Item added successfully",
#         "item": serializer.data,
#     }, status=status.HTTP_201_CREATED)


# # =====================================
# # CHECK PRODUCT IN CART
# # =====================================
# @api_view(["GET"])
# def product_in_cart(request):
#     cart_code = request.GET.get("cart_code")
#     product_id = request.GET.get("product_id")

#     if not cart_code or not product_id:
#         return Response({"error": "cart_code and product_id required"}, status=400)

#     exists = CartItem.objects.filter(
#         cart__cart_code=cart_code,
#         product_id=product_id
#     ).exists()

#     return Response({"product_in_cart": exists})


# # =====================================
# # CART STATS
# # =====================================
# @api_view(["GET"])
# def get_cart_stat(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "num_of_items": 0,
#             "total_quantity": 0,
#         })

#     total_quantity = sum(i.quantity for i in cart.items.all())

#     return Response({
#         "cart_code": cart.cart_code,
#         "num_of_items": cart.items.count(),
#         "total_quantity": total_quantity,
#     })


# # =====================================
# # GET CART
# # =====================================
# @api_view(["GET"])
# def get_cart(request):
#     cart_code = request.GET.get("cart_code")

#     if not cart_code:
#         return Response({"error": "cart_code required"}, status=400)

#     cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#     if not cart:
#         return Response({
#             "cart_code": cart_code,
#             "items": [],
#             "num_of_items": 0,
#             "cart_total": 0,
#         })

#     serializer = CartSerializer(cart)
#     return Response(serializer.data)


# # =====================================
# # USER INFO
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def user_info(request):
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)


# # =====================================
# # PAYMENT INITIATION
# # =====================================
# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
# def initiate_payment(request):
#     try:
#         cart_code = request.data.get("cart_code")

#         if not cart_code:
#             return Response({"error": "cart_code required"}, status=400)

#         cart = Cart.objects.filter(cart_code=cart_code, paid=False).first()

#         if not cart or not cart.items.exists():
#             return Response({"error": "Cart is empty or not found"}, status=400)

#         user = request.user
#         tx_ref = str(uuid.uuid4())

#         amount = sum(
#             Decimal(i.quantity) * i.product.price
#             for i in cart.items.all()
#         )

#         tax = Decimal("4.00")
#         total_amount = amount + tax

#         Transaction.objects.create(
#             ref=tx_ref,
#             cart=cart,
#             amount=total_amount,
#             currency="NGN",
#             user=user,
#             status="pending"
#         )

#         payload = {
#             "tx_ref": tx_ref,
#             "amount": str(total_amount),
#             "currency": "NGN",
#             "redirect_url": f"{BASE_URL}/payment-status",
#             "customer": {
#                 "email": user.email,
#                 "name": user.username,
#             }
#         }

#         headers = {
#             "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
#             "Content-Type": "application/json"
#         }

#         response = requests.post(
#             "https://api.flutterwave.com/v3/payments",
#             json=payload,
#             headers=headers,
#             timeout=30
#         )

#         return Response(response.json(), status=response.status_code)

#     except Exception as e:
#         return Response({"error": str(e)}, status=500)


# # =====================================
# # VERIFY TRANSACTION
# # =====================================
# def verify_transaction(tx_ref):
#     transaction = Transaction.objects.get(ref=tx_ref)

#     headers = {
#         "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
#     }

#     response = requests.get(
#         f"https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref={tx_ref}",
#         headers=headers,
#         timeout=30
#     )

#     data = response.json()

#     if response.status_code == 200 and data.get("status") == "success":
#         payment = data.get("data", {})

#         if (
#             float(payment.get("amount", 0)) == float(transaction.amount)
#             and payment.get("currency") == transaction.currency
#             and payment.get("status") == "successful"
#         ):
#             transaction.status = "completed"
#             transaction.cart.paid = True
#             transaction.cart.save()
#             transaction.save()
#             return True

#     transaction.status = "failed"
#     transaction.save()
#     return False


# # =====================================
# # VERIFY PAYMENT API
# # =====================================
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def verify_payment(request, tx_ref):
#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)


# # =====================================
# # PAYMENT CALLBACK
# # =====================================
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def payment_callback(request):
#     tx_ref = request.GET.get("tx_ref")

#     if not tx_ref:
#         return Response({"error": "tx_ref required"}, status=400)

#     try:
#         return Response({"success": verify_transaction(tx_ref)})

#     except Transaction.DoesNotExist:
#         return Response({"success": False, "error": "Transaction not found"}, status=404)

#     except Exception as e:
#         traceback.print_exc()
#         return Response({"success": False, "error": str(e)}, status=500)

# # =====================================
# # CATEGORY LIST
# # =====================================
# class CategoryListView(
#     generics.ListAPIView
# ):

#     queryset = Category.objects.all()

#     serializer_class = CategorySerializer


# # =====================================
# # CATEGORY DETAIL
# # =====================================
# class CategoryDetailView(
#     generics.RetrieveAPIView
# ):

#     queryset = Category.objects.all()

#     serializer_class = CategoryDetailSerializer

#     lookup_field = "slug"

# # =====================================
# # SUBCATEGORY LIST
# # =====================================
# class SubCategoryListView(
#     generics.ListAPIView
# ):

#     queryset = SubCategory.objects.all()

#     serializer_class = SubCategorySerializer

# # =====================================
# # ADD_REVIEWWS
# # =====================================

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def add_review(request, product_id):
#     try:
#         product = Product.objects.get(id=product_id)
#     except Product.DoesNotExist:
#         return Response({"error": "Product not found"}, status=404)

#     rating = request.data.get("rating")
#     comment = request.data.get("comment")

#     if not rating:
#         return Response({"error": "Rating is required"}, status=400)

#     review = Review.objects.create(
#         user=request.user,
#         product=product,
#         rating=rating,
#         comment=comment
#     )

#     return Response({
#         "message": "Review added successfully",
#         "review_id": review.id
#     }, status=201)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def wishlist_items(request):
#     items = Wishlist.objects.filter(user=request.user)

#     data = [
#         {
#             "id": w.id,
#             "product_id": w.product.id,
#             "product_name": w.product.name,
#         }
#         for w in items
#     ]

#     return Response(data)







# @api_view(['PUT'])
# def update_quantity(request):
#     try:
#         cartitem_id = request.data.get("item_id")
#         quantity = request.data.get("quantity")

#         # Validate input
#         if not cartitem_id or quantity is None:
#             return Response(
#                 {"error": "item_id and quantity are required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             quantity = int(quantity)
#         except ValueError:
#             return Response(
#                 {"error": "Quantity must be a number"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         if quantity < 1:
#             return Response(
#                 {"error": "Quantity must be at least 1"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # Get cart item
#         try:
#             cartitem = CartItem.objects.get(id=cartitem_id)
#         except CartItem.DoesNotExist:
#             return Response(
#                 {"error": "CartItem not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # Update
#         cartitem.quantity = quantity
#         cartitem.save()

#         serializer = CartItemSerializer(cartitem)

#         return Response({
#             "data": serializer.data,
#             "message": "CartItem updated successfully"
#         }, status=status.HTTP_200_OK)

#     except Exception as e:
#         return Response(
#             {"error": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )

# @api_view(["DELETE"])
# def remove_item(request, item_id):
#     try:
#         cart_item = CartItem.objects.get(id=item_id)
#         cart_item.delete()

#         return Response(
#             {"message": "Item removed successfully"},
#             status=status.HTTP_200_OK
#         )

#     except CartItem.DoesNotExist:
#         return Response(
#             {"error": "Item not found"},
#             status=status.HTTP_404_NOT_FOUND
#         )

