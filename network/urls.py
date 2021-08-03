
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    
    path("perfil", views.perfil, name="perfil"),
    path("getperfil/<str:username>", views.getperfil, name="getperfil"),
    path("allposts", views.allposts, name="allposts"),
    path("newpost", views.newpost, name="newpost"),
    path("likeunlike", views.likeunlike, name="likeunlike"),
    path("updatepost", views.updatepost, name="updatepost"),
    path("followunfollow", views.followunfollow, name="followunfollow"),
    path("allpostsfollowing", views.allpostsfollowing, name="allpostsfollowing"),
]
