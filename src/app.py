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

#-------------------------------GET PLATOS ----------------------------------------
@app.route('/plates', methods=['GET'])
def get_plates():
    plates= Plates.query.all()
    print (plates)
    plates_serialized = []
    for plates in plates:
        plates_serialized.append(plates.serialize())
    return jsonify({'msg': 'ok', 'results' : plates_serialized}), 200

#--------------------------------GET UN PLATO POR  id -----------------------------
@app.route('/plates/<int:id>', methods=['GET'])
def get_plate_by_id(id):
    plates= Plates.query.get(id)
    print (plates)
    if plates is None:
        return jsonify ({'msg': 'Plato no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': plates.serialize()}), 200

#------------------------------ELIMINAR UNA COMANDA CON EL ID DE LA MESA----------??????
#DELETE 
@app.route('/orders/<int:order_id>', methods = ['DELETE'])
def eliminar_comanda_por_id(order_id):
    order= Orders.query.get(order_id) # duda , aqui solo obtengo el id o toda la instancia 
    if order is None :
        return jsonify({'msg': f'no existe la comanda con id {order_id}'}), 400
    db.session.delete(order)
    db.session.commit()
    return jsonify({'msg':'ok', 'results': f'el comanda con id {order_id} perteneciente a la mesa {mesa_id} ha sido borrado dela lista de comandas'}), 200
    

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



if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
