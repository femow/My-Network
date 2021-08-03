from django.contrib.auth import authenticate, get_user, login, logout
from django.db import IntegrityError, connections
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json

from .models import *


def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            _user = User.objects.create_user(username, email, password)
            _user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, _user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
@csrf_exempt
def newpost(request):
    if request.method == "POST":
        _user = get_user(request)
        data = json.loads(request.body)
        _post = Post(user = _user,body = data["post_body"])
        _post.save()
        return JsonResponse(_post.serialize(), status = 200)
    
    return JsonResponse({"error": "Something went wrong."}, status = 500)

@login_required
@csrf_exempt
def updatepost(request):
    if request.method == "POST":
        _data = json.loads(request.body)
        _post = Post.objects.get(id=_data["postid"])
        if _post.user == get_user(request):
            _post.body = _data["body"]
            _post.save()
            return JsonResponse("Post update Success", status = 200, safe=False)
    return JsonResponse({"error": "Something went wrong."}, status = 500)

@login_required
@csrf_exempt
def likeunlike(request):
    if request.method == "POST":
        _data = json.loads(request.body)
        _user = get_user(request)
        _post = Post.objects.get(id = _data["postid"])
        if(_data["liked"]):
            _like = Like(post = _post, user = _user)
            _like.save()
            return JsonResponse("liked success.", status = 200, safe=False)
        else:
            _like = Like.objects.filter(post = _post, user = _user)
            _like.delete()
            return JsonResponse("unliked success.", status = 200, safe=False)
    return JsonResponse({"error": "Something went wrong."}, status = 500)

@login_required
@csrf_exempt
def followunfollow(request):
    if request.method == "POST":
        _data = json.loads(request.body)
        _user = get_user(request)
        _followuser = User.objects.get(username = _data["username"])
        if(_data["follow"]):
            _follower = Follower(user = _followuser, flist = _user)
            _follower.save()
            return JsonResponse("liked success.", status = 200, safe=False)
        else:
            _like = Follower.objects.filter(user = _followuser, flist = _user)
            _like.delete()
            return JsonResponse("unliked success.", status = 200, safe=False)
    return JsonResponse({"error": "Something went wrong."}, status = 500)

def perfil(request): 
    if request.method == "GET":
        _user = get_user(request)
        _alluposts = Post.objects.filter(user = _user).order_by('timestamp')
        _list = [{
            "post": post.serialize(),
            "isminepost": post.user == _user,
            "likes": [like.user.username for like in  post.posts.all()],
            "liked": len(post.posts.filter(user = get_user(request))) > 0
        } for post in _alluposts]
        _paginator = Paginator(_list, 10)
        page_number = request.GET.get('page')
        page_obj = _paginator.get_page(page_number)

        return JsonResponse({
            "posts": page_obj.object_list,
            "numpages": _paginator.num_pages,
            "page": page_number or 1,
            "followers": [follow.flist.username for follow in _user.perfils.all()],
            "user": _user.username,
            "followings": [follow.flist.username for follow in _user.followers.all()],
        }, safe=False)
    
    return JsonResponse({"error": "Something went wrong."}, status = 500)

def getperfil(request, username): 
    if request.method == "GET":
        _user = User.objects.get(username=username)
        _alluposts = Post.objects.filter(user = _user).order_by('timestamp')

        _list = [{
            "post": post.serialize(),
            "isminepost": post.user == get_user(request),
            "likes": [like.user.username for like in  post.posts.all()],
            "liked": len(post.posts.filter(user = get_user(request))) > 0
        } for post in _alluposts]
        _paginator = Paginator(_list, 10)
        page_number = request.GET.get('page')
        page_obj = _paginator.get_page(page_number)

        return JsonResponse({
            "posts": page_obj.object_list,
            "numpages": _paginator.num_pages,
            "page": page_number or 1,
            "followers": [follow.flist.username for follow in _user.perfils.all()],
            "ismyperfil": _user == get_user(request),
            "following": len(_user.perfils.filter(flist = get_user(request))) > 0,
            "followings": [follow.flist.username for follow in _user.followers.all()],
        }, safe=False)
    
    return JsonResponse({"error": "Something went wrong."}, status = 500)

def allposts(request): 
    if request.method == "GET":
        _alluposts = Post.objects.all().order_by('-timestamp')
        _list = [{
            "post": post.serialize(),
            "isminepost": post.user == get_user(request),
            "likes": [like.user.username for like in  post.posts.all()],
            "liked": len(post.posts.filter(user = get_user(request))) > 0
        } for post in _alluposts]
        _paginator = Paginator(_list, 10)
        page_number = request.GET.get('page')
        page_obj = _paginator.get_page(page_number)
        return JsonResponse({ "posts": page_obj.object_list, "numpages": _paginator.num_pages, "page": page_number or 1 }, safe=False)
    
    return JsonResponse({"error": "Something went wrong."}, status = 500)

def allpostsfollowing(request): 
    if request.method == "GET":
        _user = get_user(request)
        _alluposts = Post.objects.filter(user__in=[follower.user for follower in  _user.followers.all()]).order_by('-timestamp')
        _list = [{
            "post": post.serialize(),
            "isminepost": post.user == get_user(request),
            "likes": [like.user.username for like in  post.posts.all()],
            "liked": len(post.posts.filter(user = get_user(request))) > 0
        } for post in _alluposts]
        _paginator = Paginator(_list, 10)
        page_number = request.GET.get('page')
        page_obj = _paginator.get_page(page_number)
        return JsonResponse({ "posts": page_obj.object_list, "numpages": _paginator.num_pages, "page": page_number or 1 }, safe=False)
    
    return JsonResponse({"error": "Something went wrong."}, status = 500)