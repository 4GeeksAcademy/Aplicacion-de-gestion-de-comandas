from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime, Enum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List
from zoneinfo import ZoneInfo
from datetime import datetime, timezone, timedelta
import uuid

import enum


db = SQLAlchemy()


class EstadoCategorias(enum.Enum):
    primer_plato = "starters"
    segundo_plato = "main_dishes"
    postres = "desserts"
    bebidas = "drinks"


class EstadoComanda(enum.Enum):
    pendiente = "pending"
    en_cocina = "preparing"
    ready = "ready"
    cancelada = "cancelled"


class EstadoMesa(enum.Enum):
    disponible = "available"
    ocupada = "busy"
    reservada = "reserved"
    cerrada = "closed"


class EstadoRol(enum.Enum):
    camarero = "waiter"
    cocinero = "cooker"
    admin = "admin"


class EstadoPlato(enum.Enum):
    pending = "pending"
    completed = "completed"
    rejected = "rejected"


class Plates(db.Model):
    __tablename__ = 'plates'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description:  Mapped[str] = mapped_column(String(200), nullable=True)
    price: Mapped[float] = mapped_column(Numeric, nullable=False)
    available: Mapped[bool] = mapped_column(Boolean, nullable=True)
    categories: Mapped[EstadoCategorias] = mapped_column(
        Enum(EstadoCategorias), nullable=False)
    # category_id: Mapped[int] = mapped_column(ForeignKey('categories.id'))

   # categorias: Mapped["Categories"] = relationship(
    #  back_populates= 'platos')
    comanda_platos: Mapped[List["Orders_Plates"]] = relationship(
        back_populates='plato')

    def __str__(self):
        return f' {self.name}'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "available": self.available,
            "categories": self.categories.value,
            # "category_id": self.category_id

        }


class Tables(db.Model):
    __tablename__ = 'tables'
    id: Mapped[int] = mapped_column(primary_key=True)
    seats: Mapped[int] = mapped_column(nullable=True)
    state: Mapped[EstadoMesa] = mapped_column(Enum(EstadoMesa), nullable=False)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('user.id'), nullable=True)

    comandas: Mapped[List["Orders"]] = relationship(
        back_populates='mesas')
    usuario: Mapped["User"] = relationship(
        back_populates='mesas'
    )

    def __str__(self):
        return f'Mesa {self.id} esta {self.state}'

    def serialize(self):
        return {
            "id": self.id,
            "seats": self.seats,
            "state": self.state.value,  # es un diccionario,
            "user_id": self.user_id,
        }


class User(db.Model):
    __tablename__ = 'user'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)  # ondelete="SET NULL"
    password: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    rol: Mapped[EstadoRol] = mapped_column(Enum(EstadoRol), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    avatar_url: Mapped[str] = mapped_column(String, nullable=True)
   # Campos añadidos para reset de contraseña
   # reset_token: Mapped[str | None] = mapped_column(String(100), nullable=True)
   # token_expiration: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    comandas: Mapped[List['Orders']] = relationship(
        # entre comillas porque la clase Comandas no se ha definido aun
        back_populates='usuarios')
    mesas: Mapped[List['Tables']] = relationship(
        back_populates='usuario')

    def __str__(self):
        return f'Usuario {self.email}'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "rol": self.rol.value,  # es un diccionario
            "avatar_url": self.avatar_url,
            # do not serialize the password, its a security breach
            # "token_expiration": self.token_expiration
        }

    def generate_reset_token(self):
        self.reset_token = str(uuid.uuid4())
        self.token_expiration = datetime.now(UTC) + timedelta(minutes=30)


class Orders(db.Model):
    __tablename__ = 'orders'
    id: Mapped[int] = mapped_column(primary_key=True)
    mesa_id: Mapped[int] = mapped_column(ForeignKey('tables.id'))
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey('user.id'), nullable=True)
    date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now(ZoneInfo("Europe/Madrid")))
    state:  Mapped[EstadoComanda] = mapped_column(
        Enum(EstadoComanda), nullable=False)
    total_price: Mapped[float] = mapped_column(Numeric, nullable=True)
    guest_notes: Mapped[str] = mapped_column(String, nullable=True)

    usuarios: Mapped[User] = relationship(
        back_populates='comandas')
    mesas: Mapped[Tables] = relationship(
        back_populates='comandas')
    comanda_platos: Mapped[List["Orders_Plates"]] = relationship(
        back_populates='comanda',

        cascade="all, delete-orphan",
        passive_deletes=True)

    def __str__(self):
        return f'Comanda {self.id}'

    def serialize(self):
        return {
            "id": self.id,
            "mesa_id": self.mesa_id,
            "usuario_id": self.usuario_id,
            "state": self.state.value,
            "guest_notes": self.guest_notes,
            "date": self.date,
            "total_price": float(self.total_price) if self.total_price is not None else 0.0,
            "platos": [op.serialize() for op in self.comanda_platos]

        }


class Orders_Plates(db.Model):
    __tablename__ = 'orders_plates'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plate_id:  Mapped[int] = mapped_column(ForeignKey('plates.id'))
    order_id:  Mapped[int] = mapped_column(
        ForeignKey('orders.id', ondelete='CASCADE'))
    count_plat: Mapped[int] = mapped_column(Integer, nullable=True)
    status_plate: Mapped[EstadoPlato] = mapped_column(
        Enum(EstadoPlato), default=EstadoPlato.pending, nullable=False)

    comanda: Mapped[Orders] = relationship(
        back_populates='comanda_platos')
    plato: Mapped[Plates] = relationship(
        back_populates='comanda_platos')

    def __str__(self):
        return f'comanda {self.order_id} tiene {self.count_plat}   {self.plato.name if self.plato else "Unknow Plate"}'

    def serialize(self):
        result = Plates.query.filter_by(id=self.plate_id).first()
        return {
            "id": self.id,
            "plato_id": self.plate_id,
            # plato es la relatioship a Plates que deja coger el campo name
            "nombre_plato": self.plato.name,
            "comanda_id": self.order_id,
            "cantidad": self.count_plat,
            "status_plate": self.status_plate.value,

            "subtotal": float(self.plato.price) * self.count_plat if self.plato else 0.0,
            "category": result.serialize()["categories"],
        }

# pipenv run migrate
# pipenv run upgrade
# pipenv run start


# pipenv shell
# pipenv install
# pipenv run diagram para generar el diagrama con python y comprobar las relaciones
