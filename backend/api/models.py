import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("L'email est obligatoire")

        user = self.model(
            email=self.normalize_email(email).lower(),
            name=name,
        )

        user.set_password(password)

        user.is_active = False

        user.save(using=self._db)
        return user
    

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    validate_code = models.CharField(max_length=6, blank=True, null=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']


class Famille(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom_famille = models.CharField(max_length=255)
    nom_garrant = models.CharField(max_length=255)
    profession = models.CharField(max_length=50)
    telephone = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='familles')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Famille"
        verbose_name_plural = "Familles"

    def __str__(self):
        return self.nom_famille


class Defunt(models.Model):
    GENRE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    photo = models.TextField(null=True, blank=True) 
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, null=True, blank=True)
    genre = models.CharField(max_length=1, choices=GENRE_CHOICES)
    age = models.IntegerField()
    profession = models.CharField(max_length=50, null=True, blank=True)
    date_naiss = models.DateField()
    date_deces = models.DateField()
    place = models.IntegerField(null=True, blank=True)
    date_inhumation = models.DateField()
    date_incineration = models.DateField()
    statut = models.CharField(max_length=50, default='Inhumé')
    famille = models.ForeignKey(Famille, on_delete=models.SET_NULL, null=True, related_name='defunts')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='defunts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Défunt"
        verbose_name_plural = "Défunts"

    def __str__(self):
        return f"{self.nom} {self.prenom}"


class Paiement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    num_facture = models.CharField(max_length=50, unique=True)
    motif = models.CharField(max_length=50, default='Inhumation')
    montant = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date_incineration_prevue = models.DateField()
    date_paiement = models.DateTimeField(auto_now_add=True)
    moyen_paiement = models.CharField(max_length=50)
    famille = models.ForeignKey(Famille, on_delete=models.SET_NULL, null=True, related_name='paiements')
    defunt = models.ForeignKey(Defunt, on_delete=models.SET_NULL, null=True, related_name='paiements')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='paiements_effectues')

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return self.num_facture