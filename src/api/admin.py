  
import os
from flask_admin import Admin
from .models import db, User, EstadoComanda, EstadoMesa , Plates, Tables, Orders, Orders_Plates, Ticket
from flask_admin.contrib.sqla import ModelView



class UserModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'email', 'password', 'is_active', 'name', 'rol', 'comandas', 'mesas']

class PlatesModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'name', 'description', 'price', 'available',  'categorias', 'comanda_platos']

class TablesModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'seats', 'state', 'orders']

class OrdersModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'mesa_id', 'usuario_id', 'date', 'guest_notes', 'state', 'count_plat', 'total_price', 'usuarios', 'mesas', 'comanda_platos']

class Orders_PlatesModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id',  'comanda', 'plato', 'count_plat']

class TicketModelView(ModelView):
    column_auto_selected_related =True
    column_list= ['id', 'total_price', 'comanda']


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')   

    
    # Add your models here, for example this is how we add a the User model to the admin
    
    admin.add_view(UserModelView(User, db.session))
   # admin.add_view(CategoriesModelView(Categories, db.session))
    admin.add_view(PlatesModelView(Plates, db.session))
    admin.add_view(TablesModelView(Tables, db.session))
    admin.add_view(OrdersModelView(Orders, db.session))
    admin.add_view(Orders_PlatesModelView(Orders_Plates, db.session))
    admin.add_view(TicketModelView(Ticket, db.session))

    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))