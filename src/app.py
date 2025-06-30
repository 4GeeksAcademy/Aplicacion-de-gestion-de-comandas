"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db,  User, EstadoComanda, EstadoCategorias, EstadoMesa, Plates, Tables, Orders, Orders_Plates
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

# from src.api.models import db
# from flask import Flask
# importaciones adicionales para credenciales
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
# from flask_bcrypt import Bcrypt
from flask_cors import CORS


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')


app = Flask(__name__)
app.url_map.strict_slashes = False
# bcrypt = Bcrypt(app) #para encriptar


app.url_map.strict_slashes = False
# para tener la llave fuera del codigo
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_KEY')
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

# ---------------------------------GET TODOS LOS USUARIOS-----------------


@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    print(users)
    user_serialized = []
    for user in users:
        user_serialized.append(user.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200

# --------------------------------GET UN USUARIO POR SU id ----------------


@app.route('/users/<int:id>', methods=['GET'])
def get_user_by_id(id):
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    user = User.query.get(id)
    print(user)
    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': user.serialize()}), 200


# ----------------------------------GET TODAS LAS COMANDAS--------------------------
@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Orders.query.all()
    print(orders)
    user_serialized = []
    for order in orders:
        user_serialized.append(order.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200

# -------------------------------GET DE UNA COMANDA --------------------------------


@app.route('/orders/<int:id>', methods=['GET'])
def get_order_by_id(id):
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    order = Orders.query.get(id)
    print(order)
    if order is None:
        return jsonify({'msg': 'Comanda no encontrada'}), 404
    return jsonify({'msg': 'ok', 'result': order.serialize()}), 200


# -------------------------------PUT DE PLATOS (VERSIÓN MEJORADA) --------------------------------
@app.route('/plates/<int:plate_id>', methods=['PUT'])  # <- RUTA CORREGIDA
def update_plates(plate_id):

    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Petición inválida, se requiere un cuerpo JSON'}), 400

    plate = Plates.query.get(plate_id)
    if plate is None:
        return jsonify({'msg': 'Plato no encontrado!'}), 404

    if 'name' in body:
        plate.name = body['name']

    if 'description' in body:
        plate.description = body['description']

    if 'price' in body:
        plate.price = body['price']

    if 'available' in body:
        plate.available = body['available']

    if 'categories' in body:
        try:

            plate.categories = EstadoCategorias(body['categories'])
        except ValueError:
            return jsonify({'msg': f"Categoría '{body['categories']}' no es válida."}), 400

    try:
        db.session.commit()
        # Se llama a serialize(), no serializa()
        return jsonify({'msg': 'Plato actualizado correctamente!', 'result': plate.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        # Mensaje de error mejorado con código de estado 500
        return jsonify({'msg': 'Error al actualizar el plato', 'error': str(e)}), 500


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
