from django.urls import path
from .views import get_products, add_product, update_product, delete_product,index,get_single_product

urlpatterns = [
    path('', index, name='index'),
    # 🔐 تسجيل الدخول كأدمن والحصول على Token
    # path('admin-login/', AdminLoginView.as_view(), name='admin-login'),

    # 📦 عمليات CRUD على المنتجات
    path('products/',get_products,name='products'),
   path('products/<int:pk>/', get_single_product, name='get_single_product'),
         # GET - عرض المنتجات
    path('products/add/', add_product, name='add_product'),          # POST - إضافة منتج
    path('products/update/<int:pk>/', update_product, name='update_product'),  # PUT/PATCH - تعديل منتج
    path('products/delete/<int:pk>/', delete_product, name='delete_product'),  # DELETE - حذف منتج
]
