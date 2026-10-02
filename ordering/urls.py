from django.urls import path
from . import views
# this was added for the images 
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [


    path('', views.home_view, name='home'),
    path('menu/', views.menu_view, name='menu'),
    path('menu/<int:item_id>/', views.detail_view, name='detail'),
    path('cart/', views.cart_view, name='cart'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('success/', views.success_view, name='success'),
]

#for images
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)