"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db,  User, EstadoRol, EstadoComanda, EstadoMesa, Plates, Tables, Orders, Orders_Plates
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime

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


# ---------GET USERS ---OK----------------------------------------------

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    print(users)
    user_serialized = []
    for user in users:
        user_serialized.append(user.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200


# ---------GET by id USERS ---OK ---------------------------------------

@app.route('/users/<int:id>', methods=['GET'])
def get_user_by_id(id):
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    user = User.query.get(id)
    print(user)
    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': user.serialize()}), 200


# ---------POST USERS ---OK----------------------------------------------

@app.route('/users', methods=['POST'])
def post_user():
    body = request.get_json(silent=True)

    required_fields = ['email', 'password', 'name', 'rol', 'is_active']
    if not all(field in body for field in required_fields):
        return jsonify({'msg': 'Some fields are missing to fill'}), 400

    try:
        rol_enum = EstadoRol[body['rol']]
    except KeyError:
        return jsonify({'msg': f"Rol '{body['rol']}' no válido"}), 400

    new_user = User(
        email=body['email'],
        password=body['password'],
        name=body['name'],
        rol=rol_enum,
        is_active=body['is_active']
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'Usuario creado correctamente', 'user': new_user.serialize()}), 201


# ----------------------------------GET TODAS LAS COMANDAS ---OK--------------------------
@app.route('/orders', methods=['GET'])
def get_orders():
    orders = Orders.query.all()
    print(orders)
    user_serialized = []
    for order in orders:
        user_serialized.append(order.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200

# -------------------------------GET DE UNA COMANDA ---OK--------------------------------


@app.route('/orders/<int:id>', methods=['GET'])
def get_order_by_id(id):
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    order = Orders.query.get(id)
    print(order)
    if order is None:
        return jsonify({'msg': 'Comanda no encontrada'}), 404
    return jsonify({'msg': 'ok', 'result': order.serialize()}), 200

# -------------------------------POST DE COMANDAS ---OK------------------------------------


@app.route('/orders', methods=['POST'])
def crear_comanda():
    body = request.get_json(silent=True)

    if body is None:
        return jsonify({'msg': 'Debes enviar informacion'}), 404
    if 'mesa_id' not in body:
        return jsonify({'msg': 'Debes introducir el numero de la mesa en el campo "mesa_id"'}), 404
    if 'usuario_id' not in body:
        return jsonify({'msg': 'Debes introducir el usuario que atiende la comanda en el campo "usuario_id" '}), 404

    try:

        new_order = Orders()  # nuevo_comanda es una instancia de la clase
        new_order.mesa_id = body['mesa_id']
        new_order.usuario_id = body['usuario_id']
        # por defecto la inicializo en pendiente
        new_order.state = EstadoComanda['pendiente']
        new_order.total_price = 0
        if 'guest_notes' in body:
            new_order.guest_notes = body['guest_notes']
        db.session.add(new_order)
        db.session.flush()  # para obtener el ID sin hacer commit aún

        total = 0
        print(body['platos'])
        for item in body['platos']:
            plato_id = item.get('plate_id')
            cantidad = item.get('cantidad', 1)
            if plato_id is None:
                continue
            plato = Plates.query.get(plato_id)  # instancio platos

            # Crear relación Orders_Plates
            new_order_plate = Orders_Plates()  # instancio Order_Plates
            new_order_plate.plate_id = plato_id
            new_order_plate.order_id = new_order.id
            new_order_plate.count_plat = cantidad

            db.session.add(new_order_plate)

            # Calcular precio total
            total += float(plato.price) * cantidad

        new_order.total_price = total
        db.session.commit()

        return jsonify({'msg': 'Comanda creada exitosamente', 'result': new_order.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': f'Error al crear la comanda: {str(e)}'}), 500

# -----------------------------PUT DE COMANDA -------------------OJOOO--------------------------------------
# falta actualizar sin borrar los anteriores platos


@app.route('/orders/<int:order_id>', methods=['PUT'])
def update_orders(order_id):
    body = request.get_json(silent=True)
    update_order = Orders.query.get(order_id)
    if body is None:
        return jsonify({'msg': 'Debe introducir los elementos de la comanda a modifiar!'}), 404

    if 'state' in body:
        try:
            update_order.state = EstadoComanda(body['state'])
        except ValueError:
            return jsonify({'msg': f'Estado no válido!!'}), 404

    if 'mesa_id' in body:
        mesa = Tables.query.get(body['mesa_id'])
        if mesa is None:
            return jsonify({'msg': 'Mesa no existe!!'}), 404
        update_order.mesa_id = body['mesa_id']

    if 'usuario_id' in body:
        user = User.query.get(body['usuario_id'])
        if user is None:
            return jsonify({'msg': 'Usuario inexistente!!'}), 404
        update_order.usuario_id = body['user_id']

    if 'guest_notes' in body:
        update_order.guest_notes = body['guest_notes']

    print(body['platos'])
    if 'platos' in body:
        try:
            # Eliminar platos anteriores de esa comanda
            # Orders_Plates.query.filter_by(order_id=update_order.id).delete()
            Orders_Plates.query.filter_by(order_id=update_order.id)
            total = 0
            for item in body['platos']:
                plato_id = item.get('plate_id')
                cantidad = item.get('cantidad', 1)
                if plato_id is None:
                    continue

                plato = Plates.query.get(plato_id)
                if not plato:
                    continue

                new_order_plate = Orders_Plates()
                new_order_plate.plate_id = plato_id
                new_order_plate.order_id = update_order.id,
                new_order_plate.count_plat = cantidad

                db.session.add(new_order_plate)
                total += float(plato.price) * cantidad

            update_order.total_price = total

        except Exception as e:
            db.session.rollback()
            return jsonify({'msg': 'Error al actualizar los platos de la comanda', 'error': str(e)}), 500

    # Guardar cambios
    try:
        db.session.commit()
        return jsonify({'msg': 'Comanda actualizada correctamente!', 'result': update_order.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Error al actualizar la comanda', 'error': str(e)}), 500


# --------------------ELIMINAR UNA COMANDA CON EL ID ----OK------
@app.route('/orders/<int:order_id>', methods=['DELETE'])
def eliminar_comanda_por_id(order_id):
    # duda , aqui solo obtengo el id o toda la instancia
    order = Orders.query.get(order_id)
    if order is None:
        return jsonify({'msg': f'no existe la comanda con id {order_id}'}), 400
    db.session.delete(order)
    db.session.commit()
    return jsonify({'msg': 'ok', 'results': f'La comanda con id {order_id} perteneciente a la mesa {order.mesa_id} ha sido borrado dela lista de comandas'}), 200

 # -------------------ELIMINAR TODAS LAS COMANDAS DE UNA MESA--- OK ----------------------


@app.route('/orders/table/<int:mesa_id>', methods=['DELETE'])
def eliminar_comanda_por_mesa_id(mesa_id):
    # Buscar todas las comandas asociadas a esa mesa
    orders = Orders.query.filter_by(mesa_id=mesa_id).all()

    if not orders:
        return jsonify({'msg': f'No existe ninguna comanda asociada a la mesa {mesa_id}'}), 404

    try:
        for order in orders:
            db.session.delete(order)

        db.session.commit()
        return jsonify({'msg': 'ok', 'result': f'Se eliminaron {len(orders)} comanda(s) de la mesa {mesa_id}'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': f'Error eliminando las comandas: {str(e)}'}), 500


# -------------------------------GET PLATOS ---OK----------------------------------------
@app.route('/plates', methods=['GET'])
def get_plates():
    plates = Plates.query.all()
    print(plates)
    plates_serialized = []
    for plates in plates:
        plates_serialized.append(plates.serialize())
    return jsonify({'msg': 'ok', 'results': plates_serialized}), 200

# -----------------------------GET UN PLATO POR id ---OK-----------------------------


@app.route('/plates/<int:id>', methods=['GET'])
def get_plate_by_id(id):
    plates = Plates.query.get(id)
    print(plates)
    if plates is None:
        return jsonify({'msg': 'Plato no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': plates.serialize()}), 200


# -------------------------------GET DE TABLES ---OK --------------------------------
@app.route('/tables', methods=['GET'])
def get_tables():
    tables = Tables.query.all()
    print(tables)
    tables_serialized = []
    for table in tables:
        tables_serialized.append(table.serialize())
    return jsonify({'msg': 'OK', 'result': tables_serialized})


# -------------------------------GET DE UNA TABLE ID ---OK--------------------------------
@app.route('/tables/<int:table_id>', methods=['GET'])
def get_table_by_id(table_id):
    table = Tables.query.filter_by(id=table_id).first()
    print(table)
    if table is None:
        return jsonify({'msg': ' Tabla no encontrada o inexistente!!'}), 404
    return jsonify({'msg': 'OK', 'result': table.serialize()})


# -------------------------------PUT DE UNA TABLES ID ---OK--------------------------------
@app.route('/tables/<int:table_id>', methods=['PUT'])
def update_tables(table_id):
    body = request.get_json(silent=True)
    table = Tables.query.get(table_id)
    if body is None:  # ***decia table
        return jsonify({'msg': 'Mesa no encontrada!'}), 404
    if 'state' in body:
        try:
            table.state = EstadoMesa(body['state'])
        except ValueError:
            return jsonify({'msg': f'Estado no válido!!'}), 404
    if 'seats' in body:
        table.seats = body['seats']  # ****decia table.state
    if 'user_id' in body:
        user = User.query.get(body['user_id'])
        if user is None:
            return jsonify({'msg': 'Usuario inexistente!!'}), 404
        table.user_id = body['user_id']
    try:
        db.session.commit()
        return jsonify({'msg': 'Mesa actualizada correctamente!', 'result': table.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Error al actualizar la mesa', 'error': str(e)}), 500


@app.route('/reset-password', methods=['POST'])
def reset_password():
    body = request.get_json(silent=True)

    if not body or 'email' not in body or 'new_password' not in body:
        return jsonify({'msg': 'Faltan campos obligatorios: email y new_password'}), 400

    user = User.query.filter_by(email=body['email']).first()

    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    user.password = body['new_password']

    try:
        db.session.commit()
        return jsonify({'msg': 'Contraseña actualizada correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': f'Error al actualizar contraseña: {str(e)}'}), 500


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
