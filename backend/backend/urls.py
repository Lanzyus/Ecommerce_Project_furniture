"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# from rest_framework_simplejwt.views import TokenRefreshView
# from shop_app.views import MyTokenObtainPairView
from shop_app.auth_views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path(
        "token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]

urlpatterns = [
    path("admin/", admin.site.urls),

    # =========================
    # API ROUTES
    # =========================
    path("api/", include("shop_app.urls")),

    # =========================
    # JWT AUTH
    # =========================
    path(
        "api/token/",
        MyTokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),


     path(
        "token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]


# ==============================
# MEDIA FILES (DEV ONLY)
# ==============================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )



# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# from shop_app.views import MyTokenObtainPairView
# from rest_framework_simplejwt.views import TokenRefreshView

# urlpatterns = [
#     path("admin/", admin.site.urls),

#     # App routes
#     path("api/", include("shop_app.urls")),

#     # JWT Auth
#     path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)












# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# from shop_app.views import MyTokenObtainPairView


# urlpatterns = [
#     path("admin/", admin.site.urls),

#     # App routes
#     path("api/", include("shop_app.urls")),

#     # JWT Auth
#     # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("api/token/", MyTokenObtainPairView.as_view(),name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

# urlpatterns = [
#     path("admin/", admin.site.urls),

#     # API routes
#     path("api/", include("shop_app.urls")),

#     # JWT auth routes
#     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
# ]

# # Serve media files in development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# 
# from django.contrib import admin
# from django.urls import path,include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )


# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('shop_app.urls')),
#     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
# ]

# urlpatterns += static(settings.MEDIA_URL, document_root =settings.MEDIA_ROOT)  