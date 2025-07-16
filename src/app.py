"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import smtplib
from api.utils import APIException, generate_sitemap
from api.models import db,  User, EstadoRol, EstadoComanda, EstadoCategorias, EstadoMesa, EstadoPlato, Plates, Tables, Orders, Orders_Plates
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime, timedelta
from sqlalchemy.orm import load_only
from functools import wraps


# from src.api.models import db
from flask import Flask, render_template
# importaciones adicionales para credenciales
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required, JWTManager
from flask_bcrypt import Bcrypt  # para encriptar las contraseñas
from flask_mail import Mail, Message  # para enviar correos para reset password
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from werkzeug.security import generate_password_hash


# from flask_bcrypt import Bcrypt

from flask_cors import CORS


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')


app = Flask(__name__)
app.url_map.strict_slashes = False
bcrypt = Bcrypt(app)  # para encriptar

CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": "https://fantastic-computing-machine-x5w7gj49jvx7fpvpx-3000.app.github.dev"
    }
})


app.url_map.strict_slashes = False
# para tener la llave fuera del codigo
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_KEY')  # la llave esta en .env
serializer = URLSafeTimedSerializer(os.getenv('JWT_KEY'))

jwt = JWTManager(app)


# Configuración del correo. se pone antes de mail=Mail(app)
app.config.update(dict(
    DEBUG=False,
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,

    MAIL_USERNAME='gestiondecomandas@gmail.com',
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER='gestiondecomandas@gmail.com',
))


mail = Mail(app)

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


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


# ----------------------------------GET TODAS LAS COMANDAS ---OK---OK-----------------------
@app.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    orders = Orders.query.all()
    print(orders)
    user_serialized = []
    for order in orders:
        user_serialized.append(order.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200


# -------------------------------GET DE UNA COMANDA ---OK---OK-----------------------------

@app.route('/orders/<int:id>', methods=['GET'])
@jwt_required()
def get_order_by_id(id):
    usuario_id = get_jwt_identity()  # usuario es el q esta logueado
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    order = Orders.query.get(id)
    print("comanda", order)
    if order is None:
        return jsonify({'msg': 'Comanda no encontrada'}), 404
    return jsonify({'msg': 'ok', 'result': order.serialize()}), 200

# -------------------------------GET DE UNA COMANDA POR MESA -----------------------------------
# nos devuelve el order.id que necesitamos para modificar las comandas

@app.route('/orders/by-table/<int:id>', methods=['GET'])
@jwt_required()
def get_active_order_by_table(id):
    order = Orders.query.filter_by(mesa_id=id, state=EstadoComanda.pendiente).first()

    if order is None:
        return jsonify({'msg': 'No hay comanda activa para esta mesa'}), 404

    return jsonify({'order_id': order.id, 'order': order.serialize()}), 200

# -------------------------------POST DE COMANDAS ---OK---OK---------------------------------


@app.route('/orders', methods=['POST'])
@jwt_required()
def crear_comanda():
    body = request.get_json(silent=True)
    new_order = Orders()

    if body is None:
        return jsonify({'msg': 'Debes enviar informacion para hacer la comanda '}), 404

    if 'mesa_id' in body:
        mesa = Tables.query.get(body['mesa_id'])
        if mesa is None:
            return jsonify({'msg': 'Mesa no existe!!'}), 404
        new_order.mesa_id = body['mesa_id']

    if 'usuario_id' in body:
        user = User.query.get(body['usuario_id'])
        if user is None:
            return jsonify({'msg': 'Usuario inexistente!!'}), 404
        new_order.usuario_id = body['usuario_id']

    if 'mesa_id' not in body:
        return jsonify({'msg': 'Debes introducir el numero de la mesa en el campo "mesa_id"'}), 404
    if 'usuario_id' not in body:
        return jsonify({'msg': 'Debes introducir el usuario que atiende la comanda en el campo "usuario_id" '}), 404

    try:

        # ya instancie Orders, no necesito volver a hacerlo
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

            # instancio platos con un id especifico
            plato = Plates.query.get(plato_id)

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

        return jsonify({
            'msg': 'Comanda creada exitosamente', 
            'order_id': new_order.id, # añadido para recuperar id de la comanda para TablesOrder (lo usaremos en el front)
            'result': new_order.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': f'Error al crear la comanda: {str(e)}'}), 500


# -----------------------------PUT DE COMANDA POR ID ----OK----------------------------------------------------

@app.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_orders(order_id):
    body = request.get_json(silent=True)
    update_order = Orders.query.get(order_id)
    print(update_order)

    if update_order is None:
        return ({'msg': f'la comanda {order_id} no existe'}), 404

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
        update_order.usuario_id = body['usuario_id']

    if 'guest_notes' in body:
        update_order.guest_notes = body['guest_notes']

    if 'platos' in body:
        print('Body recibido:', body)
        print('Contiene platos:', 'platos' in body)
        print(body['platos'])
        try:
            # Eliminar platos anteriores de esa comanda
            # Orders_Plates.query.filter_by(order_id=update_order.id).delete()
            # Orders_Plates.query.filter_by(order_id=update_order.id)

            total = 0
            platos_actuales = Orders_Plates.query.filter_by(
                order_id=update_order.id).all()
            print(platos_actuales)
            platos_actuales_dict = {p.plate_id: p for p in platos_actuales}

            for item in body['platos']:
                plato_id = item.get('plate_id')
                cantidad = item.get('cantidad', 1)

                if plato_id is None:
                    continue

                plato_obj = Plates.query.get(plato_id)

                if not plato_obj:
                    continue
                precio = float(plato_obj.price)
                if cantidad == 0:
                    if plato_id in platos_actuales_dict:
                        # borro el plato
                        db.session.delete(platos_actuales_dict[plato_id])

                    continue

                if plato_id in platos_actuales_dict:
                 # Ya existe: modificar cantidad
                    plato_existente = platos_actuales_dict[plato_id]
                    plato_existente.count_plat = cantidad
                    db.session.add(plato_existente)

                else:
                 # No existe: crear nuevo registro
                    plato_nuevo = Orders_Plates()
                    plato_nuevo.order_id = update_order.id
                    plato_nuevo.plate_id = plato_id
                    plato_nuevo.count_plat = cantidad
                    db.session.add(plato_nuevo)
                # db.session.commit()
                total += precio * cantidad
               # print(total)

            platos_actualizados = Orders_Plates.query.filter_by(
                order_id=update_order.id).all()
            total = 0
            for op in platos_actualizados:
                plato = Plates.query.get(op.plate_id)
                if plato:
                    total += float(plato.price) * op.count_plat

            update_order.total_price = total
            print("Total calculado:", update_order.total_price)
            db.session.add(update_order)

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


# --------------------ELIMINAR UNA COMANDA CON EL ID ----OK---OK---------------------------------------------------
@app.route('/orders/<int:order_id>', methods=['DELETE'])
def eliminar_comanda_por_id(order_id):
    # duda , aqui solo obtengo el id o toda la instancia
    order = Orders.query.get(order_id)
    if order is None:
        return jsonify({'msg': f'no existe la comanda con id {order_id}'}), 400
    db.session.delete(order)
    db.session.commit()
    return jsonify({'msg': 'ok', 'results': f'La comanda con id {order_id} perteneciente a la mesa {order.mesa_id} ha sido borrado dela lista de comandas'}), 200

 # -------------------ELIMINAR TODAS LAS COMANDAS DE UNA MESA--- OK---OK------------------


@app.route('/orders/table/<int:mesa_id>', methods=['DELETE'])
@jwt_required()
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


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


# ---------GET USERS ---OK---OK-------------------------------------------

@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    print(users)
    user_serialized = []
    for user in users:
        user_serialized.append(user.serialize())
    return jsonify({'msg': 'ok', 'results': user_serialized}), 200


# ---------GET by id USERS ---OK---OK------------MODIFICADO PARA QUE REGRESE UN TOKEN

@app.route('/users/<int:id>', methods=['GET'])
@jwt_required()
def get_user_by_id(id):
    # query.get solo funciona para devolver primary key. para devolver otro campo usar query.filter_by
    user = User.query.get(id)
    print(user)
    acces_token = create_access_token(identity=user.email)  # genero token
    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'msg': 'ok', 'token': acces_token, 'result': user.serialize()}), 200


# ---------POST USERS ---OK---OK-------------------------------------------

@app.route('/users', methods=['POST'])
@jwt_required()
def post_user():
    body = request.get_json(silent=True)

    if body is None:
        return jsonify({'msg': 'Debe introducir los datos para crear usuario: email, password, name y rol'}), 400

    required_fields = ['email', 'password', 'name', 'rol']
    if not all(field in body for field in required_fields):
        return jsonify({'msg': 'Some fields like email, password, name, rol are missing to fill'}), 400

    try:
        rol_enum = EstadoRol[body['rol']]
    except KeyError:
        return jsonify({'msg': f"Rol '{body['rol']}' no válido"}), 400

    new_user = User(
        email=body['email'],
        password=bcrypt.generate_password_hash(
            body['password']).decode('utf-8'),
        name=body['name'],
        rol=rol_enum,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'msg': 'Usuario creado correctamente', 'user': new_user.serialize()}), 201


# ---------PUT USERS POR ID---OK---OK-------------------------------------------

@app.route('/users/<int:id>', methods=['PUT'])
@jwt_required()
def put_user(id):
    body = request.get_json(silent=True)
    update_user = User.query.get(id)

    if body is None:
        return jsonify({'msg': 'Debe introducir los datos  que quiere modificar del usuario'}), 400
    if 'password' in body:
        update_user.password = bcrypt.generate_password_hash(
            body['password']).decode('utf-8'),

    if 'rol' in body:
        try:
            rol_enum = EstadoRol[body['rol']]
        except KeyError:
            return jsonify({'msg': f"Rol '{body['rol']}' no válido"}), 400
        update_user.rol = rol_enum

    if 'name' in body:
        return jsonify({'msg': 'no se puede modificar el nombre del usuario. cree una nueva cuenta'})
    if 'email' in body:
        return jsonify({'msg': 'no se puede modificar el correo del usuario. cree una nueva cuenta'})

    db.session.add(update_user)
    db.session.commit()

    return jsonify({'msg': 'Usuario ACTUALIZADO correctamente', 'user': update_user.serialize()}), 201


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


# -------------------------------GET PLATOS ---OK---OK-------------------------------------
@app.route('/plates', methods=['GET'])
@jwt_required()
def get_plates():
    plates = Plates.query.all()
    print(plates)
    plates_serialized = []
    for plates in plates:
        plates_serialized.append(plates.serialize())
    return jsonify({'msg': 'ok', 'results': plates_serialized}), 200

# -----------------------------GET UN PLATO POR id ---OK---OK--------------------------


@app.route('/plates/<int:id>', methods=['GET'])
@jwt_required()
def get_plate_by_id(id):
    plates = Plates.query.get(id)
    print(plates)
    if plates is None:
        return jsonify({'msg': 'Plato no encontrado'}), 404
    return jsonify({'msg': 'ok', 'result': plates.serialize()}), 200

# -----------------------------GET PLATOS POR CATEGORIAS --------------------------------


@app.route('/plates/<string:category_name>', methods=['GET'])
# @jwt_required()
def get_plates_by_category(category_name):
    try:
        category_enum = EstadoCategorias(category_name)
    except ValueError:
        return jsonify({'msg': f"'{category_name}' is not a valid category."}), 400

    plates = Plates.query.filter_by(categories=category_enum).all()

    if not plates:
        return jsonify({'msg': 'Plates not found for this category'}), 404

    serialized_plates = [plate.serialize() for plate in plates]
    return jsonify({'msg': 'ok', 'results': serialized_plates}), 200


# --------------- PUT DE PLATOS DE EDU ---OK ---OK------------------------------


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


# --------------------------------------------------------------------------------------


# -------------------------------GET DE TABLES ---OK ---OK-----------------------------
@app.route('/tables', methods=['GET'])
@jwt_required()
def get_tables():
    tables = Tables.query.all()
    print(tables)
    tables_serialized = []
    for table in tables:
        tables_serialized.append(table.serialize())
    return jsonify({'msg': 'OK', 'result': tables_serialized})


# -------------------------------GET DE UNA TABLE ID ---OK---OK-----------------------------
@app.route('/tables/<int:table_id>', methods=['GET'])
@jwt_required()
def get_table_by_id(table_id):
    table = Tables.query.filter_by(id=table_id).first()
    print(table)
    if table is None:
        return jsonify({'msg': ' Tabla no encontrada o inexistente!!'}), 404
    return jsonify({'msg': 'OK', 'result': table.serialize()})


# -------------------------------PUT DE UNA TABLES ID ---OK---OK-----------------------------
@app.route('/tables/<int:table_id>', methods=['PUT'])
def update_tables(table_id):
    body = request.get_json(silent=True)
    table = Tables.query.get(table_id)
    if body is None:
        return jsonify({'msg': 'Mesa no encontrada!'}), 404
    if 'state' in body:
        try:
            table.state = EstadoMesa(body['state'])
        except ValueError:
            return jsonify({'msg': f'Estado no válido!!'}), 404
    if 'seats' in body:
        table.seats = body['seats']
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


# -------------------------------REGISTER ---OK-OK-------------------------------


@app.route('/register', methods=['POST'])
def register():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Debes enviar informarmación en el body'}), 400
    if 'name' not in body:
        return jsonify({'msg': 'El campo name es obligatorio'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    try:
        rol_enum = EstadoRol[body['rol']]
    except KeyError:
        return jsonify({'msg': f"Rol '{body['rol']}' no válido"}), 400
    if 'password' not in body:
        return jsonify({'msg': 'El campo password es obligatorio'}), 400
    new_user = User()
    new_user.name = body['name']
    new_user.email = body['email']
    new_user.rol = rol_enum
    new_user.password = bcrypt.generate_password_hash(
        body['password']).decode('utf-8')  # se guardo contraseña encriptada
    new_user.is_active = True
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'msg': f'Usuario {new_user.name} CREADO'}), 201


# -------------------------------LOGIN ---OK-OK-------------------------------


@app.route('/login', methods=['POST'])
def login():

    body = request.get_json(silent=True)
    print(body)
    if body is None:
        return jsonify({'msg': 'Debes enviar información en el body'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'El campo email es obligatorio'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'El campo password es obligatorio'}), 400

    user = User.query.filter_by(email=body['email']).first()

    if user is None:
        return jsonify({'msg': 'Usuario o contraseña errónea'}), 400

    print(user.password)

    password_correct = bcrypt.check_password_hash(

        # returns True. chequea si la contraseña recibida es la misma de la BD
        user.password, body['password'])

    if not password_correct:
        return jsonify({'msg': 'Usuario o contraseña errónea'}), 400

    acces_token = create_access_token(identity=user.email)  # genero token
    return jsonify({'msg': 'OK',
                    'Token': acces_token,
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'rol': user.rol.value}}), 200
    


# -------------------------------PROTECCIÓN ---OK--------------------------------


@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # sabemos quien es el usuario que hace la petición
    current_user_id = get_jwt_identity()
    return jsonify({'msg': f'Acceso del usuario {current_user_id} ACEPTADO'}), 200


# ------------------------------- ROLE_REQUIRED ------------------------------------


def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            current_user_email = get_jwt_identity()
            user = User.query.filter_by(email=current_user_email).first()
            if not user or user.rol not in roles:
                return jsonify({'msg': 'Acceso denegado'}), 400
            return fn(*args, *kwargs)
        return decorator
    return wrapper


# ------------------------------------AUTENTICACION-------------------------------------------

# --------------------------------SEND EMAIL----OK---OK----------------------------------
# enviando correo a mi correo de prueba
@app.route('/send-email', methods=['GET'])
def send_email():

    # este sería dinámico normalmente
    reset_url = f'VITE_BACKEND_URL/restore-password'
    msg = Message(
        subject='Recuperación de contraseña',
        sender='gestiondecomandas@gmail.com',

        # aqui va el correo o lista de correos desde donde se recibira un codigo para cambiar la contraseña
        recipients=['gestiondecomandas@gmail.com'],
    )

    # Renderiza el HTML que esta en src/templates
    msg.html = render_template('reset_email.html', reset_url=reset_url)
    mail.send(msg)
    return jsonify({'msg': 'Correo enviado'})

# --------------------------POST REQUEST RESET PASSWORD---(SOLICITAR ENLACE)------OK---OK----------------------
#  Request  reset password


@app.route('/api/request-reset-password', methods=['POST'])
def request_reset_password():
    body = request.get_json(silent=True)

    if not body or 'email' not in body:
        return jsonify({'msg': 'Debe introducir el correo electronico'}), 400

    email = body['email']
    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({'msg': 'Usuario no encontrado'}), 400

    additional_claims = {'type': 'reset_password'}

    token = create_access_token(identity=email,
                                additional_claims=additional_claims,
                                expires_delta=timedelta(minutes=30))

    # Intenta leer una variable de entorno llamada FRONTEND_URL, si no existe usa localhost:3000
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"

   # reset_url = url_for('reset_password_token', token=token, _external=True) #reset_password_token es la funcion de abajo que resetea contraseña
    print("token", token)

    # Enviar email real
    msg = Message(
        subject='Recuperación de contraseña',
        sender='gestiondecomandas@gmail.com',
        recipients=[email]  # el email que entro por body
    )

    # el cuerpo del correo esta en reset_email.html
    msg.html = render_template('reset_email.html', reset_url=reset_url)
    mail.send(msg)
    return jsonify({'msg': 'Correo de recuperación enviado',
                    'token': token}), 200


# ------------------------POST CAMBIAR LA CONTRASEÑA CON EL TOKEN---Ok--OK----------------
@app.route('/api/reset-password/<token>', methods=['POST'])
@jwt_required()
def reset_password_token(token):
    claims = get_jwt()
    if claims.get('type') != 'reset_password':
        return jsonify({'msg': 'Invalid Token'}), 403

    email = get_jwt_identity()
    body = request.get_json(silent=True)

    if body is None:
        return jsonify({'msg': 'Debe introducir los datos'}), 400

    new_password = body['password']

    if len(new_password) <= 5:
        return jsonify({"error": "Contraseña inválida. Debe tener al menos 6 caracteres"}), 400

    if 'confirm_password' not in body:
        return jsonify({'msg': 'debe reiterar la contraseña'}), 400
    confirm_password = body['confirm_password']

    if new_password != confirm_password:
        return jsonify({'msg': 'deben coincidir las contraseñas'}), 400

    user = User.query.filter_by(email=email).first()

    hashed_pw = bcrypt.generate_password_hash(
        new_password).decode('utf-8')  # encripto la contraseña
    user.password = hashed_pw
    db.session.commit()
    print("new password", hashed_pw)

    return jsonify({"message": "Contraseña actualizada correctamente"}), 200


# ------------------PUT DE ORDEN PARA MODIFICAR ESTADO DEL PLATO DADO SU ID ---OK---OK-------------------


@app.route('/orders/<int:order_id>/plate-status', methods=['PUT'])
@jwt_required()
def update_plate_status(order_id):
    body = request.get_json(silent=True)

    if not body or 'plate_id' not in body or 'status_plate' not in body:
        return jsonify({'msg': 'Faltan datos en el body (plate_id y status_plate requeridos)'}), 400

    plate_id = body['plate_id']

    try:
        new_status = EstadoPlato(body['status_plate'])
    except KeyError:
        return jsonify({'msg': f"Estado del plato '{body['status_plate']}' no válido"}), 400

    relation = Orders_Plates.query.filter_by(
        order_id=order_id, plate_id=plate_id).first()
    if not relation:
        return jsonify({'msg': f"No se encontró el plato {plate_id} en la comanda {order_id}"}), 404

    relation.status_plate = new_status
    db.session.commit()

    return jsonify({'msg': 'Estado actualizado correctamente', 'result': relation.serialize()}), 200


if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)


# pipenv install flask flask-mail bcrypt
# pipenv install itsdangerous
