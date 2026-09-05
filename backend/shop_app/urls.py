from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

app_name = "shop_app"

urlpatterns = [

    # ==================================================
    # HOME
    # ==================================================
    path("", views.home, name="home"),

    # ==================================================
    # AUTHENTICATION
    # ==================================================
    path(
        "token/",
        views.MyTokenObtainPairView.as_view(),
        name="token",
    ),

    path(
        "register/",
        views.register_user,
        name="register",
    ),

    path(
        "profile/",
        views.user_profile,
        name="user_profile",
    ),

    path(
        "profile/update/",
        views.update_profile,
        name="update_profile",
    ),

    path(
        "user/",
        views.user_info,
        name="user_info",
    ),

    path(
        "contact/",
        views.contact_message,
        name="contact_message",
    ),

    # ==================================================
    # PRODUCTS
    # ==================================================
    path(
        "products/",
        views.products,
        name="products",
    ),

    path(
        "products/<slug:slug>/",
        views.product_detail,
        name="product_detail",
    ),

    path(
        "product-question/",
        views.ProductQuestion,
        name="product_question",
    ),

    # ==================================================
    # CATEGORIES
    # ==================================================
    path(
        "categories/",
        views.CategoryListView.as_view(),
        name="category_list",
    ),

    path(
        "categories/<slug:slug>/",
        views.CategoryDetailView.as_view(),
        name="category_detail",
    ),

    path(
        "subcategories/",
        views.SubCategoryListView.as_view(),
        name="subcategory_list",
    ),

    # ==================================================
    # CART
    # ==================================================
    path(
        "cart/",
        views.get_cart,
        name="get_cart",
    ),

    path(
        "cart/add/",
        views.add_item,
        name="add_item",
    ),

    path(
        "cart/stats/",
        views.get_cart_stat,
        name="get_cart_stat",
    ),

    path(
        "cart/check/",
        views.product_in_cart,
        name="product_in_cart",
    ),

    path(
        "cart/update/<int:item_id>/",
        views.update_cart_item,
        name="update_cart_item",
    ),

    path(
        "cart/remove/<int:item_id>/",
        views.remove_item,
        name="remove_item",
    ),

    path(
        "clear-cart/<str:cart_code>/",
        views.clear_cart,
        name="clear_cart",
    ),

    # ==================================================
    # LEGACY CART ROUTES
    # ==================================================
    path("add_item/", views.add_item),
    path("get_cart/", views.get_cart),
    path("get_cart_stat/", views.get_cart_stat),
    path("product_in_cart/", views.product_in_cart),

    # ==================================================
    # PAYMENTS
    # ==================================================

    # Paystack
    path(
        "paystack/initialize/",
        views.initialize_paystack_payment,
        name="paystack_initialize",
    ),

    path(
        "paystack/verify/<str:reference>/",
        views.verify_paystack_payment,
        name="paystack_verify",
    ),

    # Flutterwave
    path(
        "payment/initiate/",
        views.initiate_payment,
        name="payment_initiate",
    ),

    path(
        "verify-payment/<str:tx_ref>/",
        views.verify_payment,
        name="verify_payment",
    ),

    path(
        "flutterwave/verify/<str:tx_ref>/",
        views.verify_payment,
        name="flutterwave_verify",
    ),

    path(
        "payment/callback/",
        views.payment_callback,
        name="payment_callback",
    ),

    # ==================================================
    # ORDERS
    # ==================================================
    path(
        "my-orders/",
        views.my_orders,
        name="my_orders",
    ),

    path(
        "orders/<int:pk>/",
        views.order_detail,
        name="order_detail",
    ),

    path(
        "orders/delete/<int:order_id>/",
        views.delete_order,
        name="delete_order",
    ),

    path(
        "orders/<int:pk>/invoice/",
        views.download_invoice,
        name="order_invoice",
    ),

    path(
        "download-invoice/<int:pk>/",
        views.download_invoice,
        name="download_invoice",
    ),

    # ==================================================
    # REVIEWS
    # ==================================================
    path(
        "reviews/add/<int:product_id>/",
        views.add_review,
        name="add_review",
    ),

    # ==================================================
    # WISHLIST
    # ==================================================
    path(
        "wishlist/",
        views.wishlist_items,
        name="wishlist_items",
    ),

    path(
        "wishlist/add/<int:product_id>/",
        views.add_to_wishlist,
        name="add_to_wishlist",
    ),

    path(
        "wishlist/remove/<int:product_id>/",
        views.remove_from_wishlist,
        name="remove_from_wishlist",
    ),

    # ==================================================
    # BANNERS
    # ==================================================
    path(
        "banners/",
        views.banners,
        name="banners",
    ),

    # ==================================================
    # RECENTLY VIEWED
    # ==================================================
    path(
        "recently-viewed/",
        views.recently_viewed,
        name="recently_viewed",
    ),

    # ==================================================
    # PRODUCT VARIANTS
    # ==================================================
    path(
        "variants/<int:product_id>/",
        views.product_variants,
        name="product_variants",
    ),

    # ==================================================
    # SHIPMENT TRACKING
    # ==================================================
    # path(
    #     "shipment/<str:tracking_number>/",
    #     views.track_shipment,
    #     name="track_shipment",
    # ),


    # ==================================================
    # SHIPMENT / DELIVERY
    # ==================================================

    # Logged-in buyer:
    # sees own deliveries
    #
    # Admin:
    # sees all deliveries

    path(
        "my-deliveries/",
        views.my_deliveries,
        name="my_deliveries",
    ),

    # Public/existing shipment tracking
    path(
        "shipment/<str:tracking_number>/",
        views.track_shipment,
        name="track_shipment",
    ),

    # Admin only - update delivery status
    path(
        "shipment/<int:shipment_id>/status/",
        views.update_shipment_status,
        name="update_shipment_status",
    ),
    # ==================================================
    # PRODUCT MEDIA
    # ==================================================
    path(
        "media/upload/<int:product_id>/",
        views.upload_product_media,
        name="upload_product_media",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )










# from django.urls import path
# from . import views
# from .views import register_user, update_profile
# from .views import contact_message
# from .views import add_to_wishlist
# from .views import download_invoice

# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     # your urls
# ]

# if settings.DEBUG:
#     urlpatterns += static(
#         settings.MEDIA_URL,
#         document_root=settings.MEDIA_ROOT
#     )

# app_name = "shop_app"

# urlpatterns = [

#     # =====================================
#     # HOME
#     # =====================================
#     path(
#         "",
#         views.home,
#         name="home"
#     ),

#     # =====================================
#     # AUTHENTICATION
#     # =====================================
#     path(
#         "token/",
#         views.MyTokenObtainPairView.as_view(),
#         name="token"
#     ),

#     path(
#         "profile/",
#         views.user_profile,
#         name="user_profile"
#     ),

#     path(
#         "user/",
#         views.user_info,
#         name="user_info"
#     ),

#     path("register/", views.register_user, name="register"),
#     path("profile/update/", views.update_profile, name="update_profile"),
#     # path(
#     #         "register/",
#     #         register_user,
#     #         name="register"
#     #     ),

#     # path(
#     #     "profile/update/",
#     #     update_profile,
#     #     name="update_profile"
#     #     ),
#       path(
#         "contact/",
#         contact_message,
#         name="contact_message"
#         ),
    

#     # =====================================
#     # PRODUCTS
#     # =====================================
#     path(
#         "products/",
#         views.products,
#         name="products"
#     ),

#     path(
#         "products/<slug:slug>/",
#         views.product_detail,
#         name="product_detail"
#     ),

#     path(
#     "product-question/",
#     views.ProductQuestion,
#     name="ProductQuestion"
#     ),

#     # =====================================
#     # CATEGORIES
#     # =====================================
#     path(
#         "categories/",
#         views.CategoryListView.as_view(),
#         name="category_list"
#     ),

#     path(
#         "categories/<slug:slug>/",
#         views.CategoryDetailView.as_view(),
#         name="category_detail"
#     ),

#     path(
#         "subcategories/",
#         views.SubCategoryListView.as_view(),
#         name="subcategory_list"
#     ),

#     # =====================================
#     # CART (PRIMARY ROUTES)
#     # =====================================

#     path(
#         "cart/add/",
#         views.add_item,
#         name="add_item"
#     ),

#     path(
#         "clear-cart/<str:cart_code>/",
#         views.clear_cart,
#         name="clear-cart"
#     ),


#     path(
#         "orders/delete/<int:order_id>/",
#         views.delete_order,
#         name="delete_order"
#     ),

#     path(
#         "cart/",
#         views.get_cart,
#         name="get_cart"
#     ),

#     path(
#         "cart/stats/",
#         views.get_cart_stat,
#         name="get_cart_stat"
#     ),

#     path(
#         "cart/check/",
#         views.product_in_cart,
#         name="product_in_cart"
#     ),

#     # =====================================
#     # CART (LEGACY ROUTES)
#     # KEEP FOR OLD FRONTEND CODE
#     # =====================================
#     path(
#         "add_item/",
#         views.add_item,
#         name="legacy_add_item"
#     ),

#     path(
#         "get_cart/",
#         views.get_cart,
#         name="legacy_get_cart"
#     ),

#     path(
#         "get_cart_stat/",
#         views.get_cart_stat,
#         name="legacy_get_cart_stat"
#     ),

#     path(
#         "product_in_cart/",
#         views.product_in_cart,
#         name="legacy_product_in_cart"
#     ),

#     path(
#         "update_cart_item/<int:item_id>/",
#             views.update_cart_item,
#             name="update_cart_item",
#         ),

#     path(
#         "remove_item/<int:item_id>/",
#         views.remove_item,
#         name="remove_item"
#     ),

#     path(
#         "paystack/initialize/",
#         views.initialize_paystack_payment,
#         name="paystack_initialize"
#     ),

#     path(
#         "paystack/verify/<str:reference>/",
#         views.verify_paystack_payment,
#         name="paystack_verify"
#     ),

#     # =====================================
#     # ORDERS
#     # =====================================

#     path(
#         "my-orders/",
#         views.my_orders,
#         name="my-orders"
#     ),

#     path(
#         "orders/<int:pk>/",
#         views.order_detail,
#         name="order-detail"
#     ),

#     path(
#         "orders/<int:pk>/invoice/",
#         views.download_invoice,
#         name="order-invoice"
#     ),

#     path(
#         "download-invoice/<int:pk>/",
#         views.download_invoice,
#         name="download-invoice"
#     ),

#     # =====================================
#     # PAYMENTS
#     # =====================================
#     path(
#         "payment/initiate/",
#         views.initiate_payment,
#         name="initiate_payment"
#     ),

#     # path(
#     #     "payment/verify/<str:tx_ref>/",
#     #     views.verify_payment,
#     #     name="verify_payment"
#     # ),

#     path(
#         "flutterwave/verify/<str:tx_ref>/",
#         views.verify_payment,
#         name="flutterwave_verify"
#     ),

#     path(
#         "paystack/verify/<str:reference>/",
#         views.verify_paystack_payment,
#         name="paystack_verify"
#     ),
#     path(
#         "verify-payment/<str:tx_ref>/",
#         views.verify_payment,
#         name="verify-payment",
#     ),

#     path(
#         "payment/callback/",
#         views.payment_callback,
#         name="payment_callback"
#     ),

    

#     path(
#         "paystack/verify/<str:reference>/",
#         views.verify_paystack_payment
#     ),

#     path(
#     "paystack/initialize/",
#     views.initialize_paystack_payment,
#     name="paystack_initialize"
# ),

#     # =====================================
#     # REVIEWS
#     # =====================================
#     path(
#         "reviews/add/<int:product_id>/",
#         views.add_review,
#         name="add_review"
#     ),

#     # =====================================
#     # WISHLIST
#     # =====================================
#     path(
#         "wishlist/",
#         views.wishlist_items,
#         name="wishlist_items"
#     ),

#     path(
#         "wishlist/add/<int:product_id>/",
#         views.add_to_wishlist,
#         name="add_to_wishlist"
#     ),

#     path(
#         "wishlist/remove/<int:product_id>/",
#         views.remove_from_wishlist,
#         name="remove_from_wishlist"
#     ),

#     path(
#         "banners/",
#         views.banners,
#         name="banners"
#     ),



#     # =====================================
#     # RECENTLY VIEWED
#     # =====================================
#     path(
#         "recently-viewed/",
#         views.recently_viewed,
#         name="recently_viewed"
#     ),

#     # =====================================
#     # PRODUCT VARIANTS
#     # =====================================
#     path(
#         "variants/<int:product_id>/",
#         views.product_variants,
#         name="product_variants"
#     ),

#     # =====================================
#     # SHIPMENT TRACKING
#     # =====================================
#     path(
#         "shipment/<str:tracking_number>/",
#         views.track_shipment,
#         name="track_shipment"
#     ),

#     # =====================================
#     # PRODUCT MEDIA
#     # =====================================
#     path(
#         "media/upload/<int:product_id>/",
#         views.upload_product_media,
#         name="upload_product_media"
#     ),
# ]













# from django.urls import path
# from . import views

# urlpatterns = [

#     # =====================================
#     # HOME
#     # =====================================
#     path("", views.home, name="home"),

#     # =====================================
#     # AUTH
#     # =====================================
#     path(
#         "token/",
#         views.MyTokenObtainPairView.as_view(),
#         name="token"
#     ),

#     path(
#         "profile/",
#         views.user_profile,
#         name="user_profile"
#     ),

#     path(
#         "user/",
#         views.user_info,
#         name="user_info"
#     ),

#     # =====================================
#     # PRODUCTS
#     # =====================================
#     path(
#         "products/",
#         views.products,
#         name="products"
#     ),

#     path(
#         "products/<slug:slug>/",
#         views.product_detail,
#         name="product_detail"
#     ),

#     # =====================================
#     # CATEGORIES
#     # =====================================
#     path(
#         "categories/",
#         views.CategoryListView.as_view(),
#         name="CategoryListView"
#     ),

#     path(
#         "categories/<slug:slug>/",
#         views.CategoryDetailView.as_view(),
#         name="CategoryDetailView"
#     ),

#     path(
#         "subcategories/",
#         views.SubCategoryListView.as_view(),
#         name="SubCategoryListView"
#     ),

#     # =====================================
#     # CART
#     # =====================================
#     path(
#         "add_item/",
#         views.add_item,
#         name="add_item"
#     ),

#     path(
#         "get_cart/",
#         views.get_cart,
#         name="get_cart"
#     ),

#     path(
#         "get_cart_stat/",
#         views.get_cart_stat,
#         name="get_cart_stat"
#     ),

#     path(
#         "product_in_cart/",
#         views.product_in_cart,
#         name="product_in_cart"
#     ),

#     # Optional aliases for backward compatibility
#     path(
#         "cart/add/",
#         views.add_item,
#         name="cart_add"
#     ),

#     path(
#         "cart/",
#         views.get_cart,
#         name="cart"
#     ),

#     path(
#         "cart/stats/",
#         views.get_cart_stat,
#         name="cart_stats"
#     ),

#     path(
#         "cart/check/",
#         views.product_in_cart,
#         name="cart_check"
#     ),

#     # =====================================
#     # PAYMENT
#     # =====================================
#     path(
#         "payment/initiate/",
#         views.initiate_payment,
#         name="initiate_payment"
#     ),

#     path(
#         "payment/verify/<str:tx_ref>/",
#         views.verify_payment,
#         name="verify_payment"
#     ),

#     path(
#         "payment/callback/",
#         views.payment_callback,
#         name="payment_callback"
#     ),

#     # =====================================
#     # REVIEWS
#     # =====================================
#     path(
#         "reviews/add/<int:product_id>/",
#         views.add_review,
#         name="add_review"
#     ),

#     # =====================================
#     # WISHLIST
#     # =====================================
#     path(
#         "wishlist/",
#         views.wishlist_items,
#         name="wishlist_items"
#     ),

#     path(
#         "wishlist/add/<int:product_id>/",
#         views.add_to_wishlist,
#         name="add_to_wishlist"
#     ),

#     path(
#         "wishlist/remove/<int:product_id>/",
#         views.remove_from_wishlist,
#         name="remove_from_wishlist"
#     ),

#     # =====================================
#     # RECENTLY VIEWED
#     # =====================================
#     path(
#         "recently-viewed/",
#         views.recently_viewed,
#         name="recently_viewed"
#     ),

#     # =====================================
#     # PRODUCT VARIANTS
#     # =====================================
#     path(
#         "variants/<int:product_id>/",
#         views.product_variants,
#         name="product_variants"
#     ),

#     # =====================================
#     # SHIPMENT TRACKING
#     # =====================================
#     path(
#         "shipment/<str:tracking_number>/",
#         views.track_shipment,
#         name="track_shipment"
#     ),

#     # =====================================
#     # PRODUCT MEDIA
#     # =====================================
#     path(
#         "media/upload/<int:product_id>/",
#         views.upload_product_media,
#         name="upload_product_media"
#     ),
# ]









# from django.urls import path
# from shop_app.auth_views import MyTokenObtainPairView
# from . import views

# urlpatterns = [
#     path("", views.home, name="home"),

#     # AUTH
#     path("token/", views.MyTokenObtainPairView.as_view(), name="token"),
#     path("profile/", views.user_profile, name="user_profile"),

#     # PRODUCTS
#     path("products/", views.ProductListView.as_view(), name="products"),
#     path("products/<slug:slug>/", views.product_detail, name="product_detail"),

#     # CART
#     path("cart/add/", views.add_item, name="add_item"),
#     path("cart/", views.get_cart, name="get_cart"),
#     path("cart/stats/", views.get_cart_stat, name="get_cart_stat"),
#     path("cart/check/", views.product_in_cart, name="product_in_cart"),
#     path("get_cart_stat/", views.get_cart_stat, name="get_cart_stat"),
#     path("product_in_cart/", views.product_in_cart, name="product_in_cart" ),


#     # USER
#     path("user/", views.user_info, name="user_info"),

#     # CATEGORY
#     path("categories/", views.CategoryListView.as_view(), name="CategoryListView"),
#     path("categories/<slug:slug>/", views.CategoryDetailView.as_view(), name="CategoryDetailView"),
#     path("subcategories/", views.SubCategoryListView.as_view(), name="SubCategoryListView"),

#     # PAYMENT
#     path("payment/initiate/", views.initiate_payment, name="initiate_payment"),
#     path("payment/verify/<str:tx_ref>/", views.verify_payment, name="verify_payment"),
#     path("payment/callback/", views.payment_callback, name="payment_callback"),

#     # REVIEWS
#     path("reviews/add/<int:product_id>/", views.add_review, name="add_review"),

#     # WISHLIST
#     path("wishlist/", views.wishlist_items, name="wishlist_items"),
#     path("wishlist/add/<int:product_id>/", views.add_to_wishlist, name="add_to_wishlist"),
#     path("wishlist/remove/<int:product_id>/", views.remove_from_wishlist, name="remove_from_wishlist"),

#     # EXTRA FEATURES (ONLY IF THEY EXIST IN views.py)
#     path("recently-viewed/", views.recently_viewed, name="recently_viewed"),
#     path("variants/<int:product_id>/", views.product_variants, name="product_variants"),
#     path("shipment/<str:tracking_number>/", views.track_shipment, name="track_shipment"),
#     path("media/upload/<int:product_id>/", views.upload_product_media, name="upload_product_media"),
# ]


















# import django.urls
# from . import views
# from .views import remove_item

# urlpatterns = [
#     django.urls.path("", views.home, name="home"),

#     django.urls.path("token/", views.MyTokenObtainPairView, name="token"),
#     django.urls.path("profile/", views.user_profile, name="user_profile"),

#     django.urls.path("products/", views.products, name="products"),
#     django.urls.path("products/<slug:slug>/", views.product_detail, name="product_detail"),

#     django.urls.path("cart/add/", views.add_item, name="add_item" ),
#     django.urls.path("cart/", views.get_cart, name="get_cart"),
#     django.urls.path("cart/stats/", views.get_cart_stat, name="get_cart_stat"),
#     django.urls.path("cart/check/", views.product_in_cart),

#     django.urls.path("user/", views.user_info, name="user_info"),
#     django.urls.path("categories/",views.CategoryListView, name="CategoryListView"),
#     django.urls.path("categories/<slug:slug>/", views.CategoryDetailView, name="CategoryDetailView"),
#     django.urls.path("subcategories/", views.SubCategoryListView, name="SubCategoryListView"),

#     django.urls.path("payment/initiate/", views.initiate_payment, name="initiate_payment"),
#     django.urls.path("payment/verify/<str:tx_ref>/", views.verify_payment, name="verify_payment"),
#     django.urls.path("payment/callback/", views.payment_callback, name="payment_callback"),

#     django.urls.path("reviews/add/<int:product_id>/", views.add_review, name="add_review"),

#     django.urls.path("wishlist/", views.wishlist_items, name="wishlist_items"),
#     django.urls.path("wishlist/add/<int:product_id>/", views.add_to_wishlist, name="add_to_wishlist"),
#     django.urls.path("wishlist/remove/<int:product_id>/", views.remove_from_wishlist, name="remove_from_wishlist"),

#     django.urls.path("recently-viewed/", views.recently_viewed, name ="recently_viewed"),

#     django.urls.path("variants/<int:product_id>/", views.product_variants, name="product_variants"),

#     django.urls.path("shipment/<str:tracking_number>/", views.track_shipment, name="track_shipment"),

#     django.urls.path("media/upload/<int:product_id>/", views.upload_product_media, name="upload_product_media"),
# ]



# urlpatterns = [
#     path("products/", views.products, name="products"),
#     path("products/<slug:slug>/", views.product_detail, name="product_detail"),
#     path("add_item/", views.add_item, name="add_item"),
#     path("product_in_cart/", views.product_in_cart, name="product_in_cart"),
#     path("get_cart_stat/", views.get_cart_stat, name="get_cart_stat"),
#     path("get_cart/", views.get_cart, name="get_cart"),
#     path("update_quantity/",views.update_quantity, name="update_quantity"),
#     path("remove_item/<int:item_id>/", remove_item, name="remove_item"),
#     path("user_info/", view=views.user_info, name="user_info"),
#     path('initiate_payment/', views.initiate_payment, name='initiate_payment'),
#     path("verify_payment/<str:tx_ref>/", views.verify_payment, name="verify_payment"),
#     path("payment_callback/", views.payment_callback, name="payment_callback")
    
# ]




