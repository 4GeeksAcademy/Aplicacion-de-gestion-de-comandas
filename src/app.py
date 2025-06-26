"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db,  User, EstadoComanda, EstadoMesa , Plates, Tables, Orders, Orders_Plates
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime

#from src.api.models import db
#from flask import Flask
#importaciones adicionales para credenciales
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
#from flask_bcrypt import Bcrypt
from flask_cors import CORS



ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')


app = Flask(__name__)
app.url_map.strict_slashes = False
#bcrypt = Bcrypt(app) #para encriptar


app.url_map.strict_slashes = False
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_KEY') #para tener la llave fuera del codigo
jwt = JWTManager(app)

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)
CORS(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

#---------------------------------GET TODOS LOS USUARIOS-----------------
@app.route('/users', methods=['GET'])
def get_users():
    users= User.query.all()
    print (users)
    user_serialized = []
    for user in users:
        user_serialized.append(user.serialize())
    return jsonify({'msg': 'ok', 'results' : user_serialized}), 200

#--------------------------------GET UN USUARIO POR SU id ----------------
@app.route('/users/<int:id>', methods=['GET'])
def get_user_by_id(id):
    user= User.query.get(id)# query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    print (user)
    if user is None:
        return jsonify ({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': user.serialize()}), 200


#----------------------------------GET TODAS LAS COMANDAS--------------------------
@app.route('/orders', methods=['GET'])
def get_orders():
    orders= Orders.query.all()
    print (orders)
    user_serialized = []
    for order in orders:
        user_serialized.append(order.serialize())
    return jsonify({'msg': 'ok', 'results' : user_serialized}), 200

#-------------------------------GET DE UNA COMANDA --------------------------------
@app.route('/orders/<int:id>', methods=['GET'])
def get_order_by_id(id):
    order= Orders.query.get(id)# query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    print (order)
    if order is None:
        return jsonify ({'msg': 'Comanda no encontrada'}), 404
    return jsonify({'msg': 'ok', 'result':order.serialize()}), 200

#-------------------------------POST DE COMANDAS ----------------------------------
@app.route('/orders', methods=['POST'])
def crear_comanda():
    body= request.get_json(silent=True)
    if body is None:
        return jsonify ({'msg': 'Debes enviar informacion'}), 404
    if 'date' not in body:
        return jsonify ({'msg': 'Debe introducir la fecha y hora'}), 404
    if 'mesa_id' not in body: 
        return jsonify ({'msg': 'Debes introducir el numero de la mesa'}), 404
    if 'usuario_id' not in body: 
        return jsonify ({'msg': 'Debes introducir el usuario que atiende la comanda '}), 404
    
    
    #required_fields = ['mesa_id', 'usuario_id', 'date', 'state', 'platos']
    #for field in required_fields:
       # if field not in body:
        #    return jsonify({'msg': f'Falta el campo obligatorio: {field}'}), 400
    
    new_order = Orders() # nuevo_comanda es una instancia de la clase 
    new_order.date =datetime.fromisoformat(body['date'])
    new_order.mesa_id= body['mesa_id']
    new_order.guest_notes= body['guest_notes']
    new_order.state= EstadoComanda['pendiente']
    new_order.total_price= 0
      
    db.session.add(new_order)
    db.session.flush()  # para obtener el ID sin hacer commit aún
    total=0

    for item in body['platos']:
        plato_id = item.get('plate_id')
        cantidad = item.get('cantidad', 1)
        if plato_id is None:
                continue

        plato = Plates.query.get(plato_id) #instancio platos 
        if not plato:
                continue  # o podrías hacer return con error

            # Crear relación Orders_Plates
        new_order_plate = Orders_Plates() #instancio Order_Plates
        new_order_plate.plate_id=plato_id,
        new_order_plate.order_id=new_order.id,
        new_order_plate.count_plat=cantidad
            
        db.session.add(new_order_plate)

            # Calcular precio total
        total += float(plato.price) * cantidad

        new_order_plate.total_price = total
        db.session.commit()

        return jsonify({'msg': 'Comanda creada exitosamente', 'result': new_order.serialize()}), 201

    db.session.commit()
    return jsonify({'msg': 'ok', 'result': new_order.serialize()}), 200


# -------------------------------GET DE UNA TABLES --------------------------------
@app.route('/tables', methods=['GET'])
def get_tables():
    tables = Tables.query.all()
    print(tables)
    tables_serialized = []
    for table in tables:
        tables_serialized.append(table.serialize())
    return jsonify({'msg': 'OK', 'result': tables_serialized})


# -------------------------------GET DE UNA TABLES ID --------------------------------
@app.route('/tables/<int:table_id>', methods=['GET'])
def get_table_by_id(table_id):
    table = Tables.query.filter_by(id=table_id).first()
    print(table)
    if table is None:
        return jsonify({'msg': ' Tabla no encontrada o inexistente!!'}), 404
    return jsonify({'msg': 'OK', 'result': table.serialize()})


# -------------------------------PUT DE UNA TABLES ID --------------------------------
@app.route('/tables/<int:table_id>', methods=['PUT'])
def update_tables(table_id):
    body = request.get_json(silent=True)
    table = Tables.query.get(table_id)
    if body is None: #***decia table
        return jsonify({'msg': 'Mesa no encontrada!'}), 404
    if 'state' in body:
        try:
            table.state = EstadoMesa(body['state'])
        except ValueError:
            return jsonify({'msg': f'Estado no válido!!'}), 404
    if 'seats' in body:
        table.seats = body['seats'] #****decia table.state
    if 'user_id' in body:
        user = User.query.get(body['user_id'])
        if user is None:
            return jsonify({'msg':'Usuario inexistente!!'}),404
        table.user_id = body['user_id']
    try:
        db.session.commit()
        return jsonify({'msg': 'Mesa actualizada correctamente!', 'result': table.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Error al actualizar la mesa', 'error': str(e)}), 500









# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
