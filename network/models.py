from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="publisher")
    body = models.CharField(max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="posts", default="")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="users", default="")

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="perfils")
    flist = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")
    def serialize(self):
        return {
            "flist": [user for user in self.flist.all()]
        }
