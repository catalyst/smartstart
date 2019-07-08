from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^health/$', views.HealthCheckView.as_view()),
]
