  
import os
from flask_admin import Admin
from .models import db, User, EstadoComanda, EstadoMesa, Categorias , Platos, Mesas, Comandas, Comandas_Platos
from flask_admin.contrib.sqla import ModelView



class UserModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'email', 'password', 'is_active', 'name', 'rol']

class CategoriasModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'name']

class PlatosModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'name', 'description', 'price', 'guest_notes', 'category_id']

class MesasModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'seats', 'state']

class ComandasModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'mesa_id', 'usuario_id', 'date', 'state', 'total_price']

class Comandas_PlatosModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'plato_id', 'comanda_id']


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')   

    
    # Add your models here, for example this is how we add a the User model to the admin
    
    admin.add_view(UserModelView(User, db.session))
    admin.add_view(CategoriasModelView(Categorias, db.session))
    admin.add_view(PlatosModelView(Platos, db.session))
    admin.add_view(MesasModelView(Mesas, db.session))
    admin.add_view(ComandasModelView(Comandas, db.session))
    admin.add_view(Comandas_PlatosModelView(Comandas_Platos, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))