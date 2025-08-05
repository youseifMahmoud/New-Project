from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Product
from .serializers import ProductSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.shortcuts import render
def index(request):
    return render(request, 'index.html')
class AdminLoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super(AdminLoginView, self).post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        if not token.user.is_staff:
            token.delete()
            return Response({"error": "Not authorized"}, status=403)
        return Response({'token': token.key})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])   # ✅ تخلي الفانكشن مفتوحة لأي حد
def get_products(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_single_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def add_product(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])   # ✅ كفاية PUT و PATCH بس
@csrf_exempt
@permission_classes([AllowAny])
def update_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # ✅ partial=True عشان يسمح بتعديل جزئي
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@csrf_exempt
@permission_classes([AllowAny])
def delete_product(request, pk):
    try:
        product = Product.objects.get(id=pk)
        product.delete()
        return Response({"message": "Product deleted successfully"})
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

