from django.db import models

class Product(models.Model):
    
    title = models.CharField(max_length=255)
    title_en = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=100)
    material = models.CharField(max_length=100)
    img = models.ImageField(upload_to='products/')
    description_ar = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    extra_details = models.TextField(blank=True, null=True)


    def __str__(self):
        return self.title
