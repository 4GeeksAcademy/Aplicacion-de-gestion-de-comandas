from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column , relationship
from typing import List
from datetime import datetime
import enum


db = SQLAlchemy()

class EstadoComanda(enum.Enum):
    pendiente = "pendiente"
    en_cocina = "en_cocina"
    servida = "servida"
    cancelada = "cancelada"

class EstadoMesa(enum.Enum):
    disponible = "disponible"
    ocupada = "ocupada"
    reservada = "reservada"
    cerrada = "cerrada"

class Categorias(db.Model):
     __tablename__= 'categorias'
     id: Mapped[int] = mapped_column(primary_key=True)
     name: Mapped[str] = mapped_column(String(50), nullable=False)

     platos :  Mapped[List["Platos"]] = relationship(
        back_populates= 'categorias') 


     def __str__(self):
        return f'Categoria del plato: {self.name}'
     
     def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            # do not serialize the password, its a security breach
        }
     
    
class Platos(db.Model):
    __tablename__= 'platos'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description:  Mapped[str] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    guest_notes: Mapped[str] = mapped_column(String(120),nullable= True)
    category_id: Mapped[int] = mapped_column(ForeignKey('categorias.id'))

    categorias: Mapped["Categorias"] = relationship(
        back_populates= 'platos') 
    comanda_platos: Mapped[List["Comandas_Platos"]] = relationship(
        back_populates= 'plato') 

    def __str__(self):
        return f'Plato {self.name}'
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "guest_notes": self.guest_notes
            # do not serialize the password, its a security breach
        }
    

class Mesas(db.Model):
     __tablename__= 'mesas'
     id: Mapped[int] = mapped_column(primary_key=True)
     seats: Mapped[int] = mapped_column(nullable=True)
     state: Mapped[EstadoMesa] = mapped_column(Enum(EstadoMesa), nullable=False)

     comandas: Mapped[List["Comandas"]] = relationship(
        back_populates= 'mesas') 
     
     def __str__(self):
        return f'Mesa {self.id} con estado {self.state}'
     
     def serialize(self):
        return {
            "id": self.id,
            "seats": self.seats,
            "state": self.state.value, #es un diccionario
        }

class User(db.Model):
    __tablename__= 'usuarios'
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    name: Mapped[str] = mapped_column(nullable=False)
    rol: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    comandas: Mapped[List["Comandas"]] = relationship(
        back_populates= 'usuarios')  #entre comillas porque la clase Comandas no se ha definido aun

    def __str__(self):
        return f'Usuario {self.email}'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    
class Comandas(db.Model):
     __tablename__= 'comandas'
     id: Mapped[int] = mapped_column(primary_key=True)
     mesa_id: Mapped[int] = mapped_column(ForeignKey('mesas.id'))
     usuario_id:Mapped[int] = mapped_column(ForeignKey('usuarios.id'))
     date: Mapped[datetime] = mapped_column( DateTime, nullable=False)
     state:  Mapped[EstadoComanda] = mapped_column(Enum(EstadoComanda), nullable=False)
     total_price: Mapped[float] = mapped_column(nullable=False)

     usuarios: Mapped[User] = relationship(
        back_populates= 'comandas') 
     mesas: Mapped[Mesas] = relationship(
        back_populates= 'comandas') 
     comanda_plato: Mapped[List["Comandas_Platos"]] = relationship(
        back_populates= 'comanda') 
     
     def __str__(self):
        return f'Comanda {self.id}'
     
     def serialize(self):
        return {
            "id": self.id,
            "mesa_id": self.mesa_id,
            "usuario_id": self.usuario_id,
            "state": self.state.value,
            "total_price": self.total_price
            # do not serialize the password, its a security breach
        }


class Comandas_Platos(db.Model):
    __tablename__= 'comandas_platos'
    id: Mapped[int] = mapped_column(Integer, primary_key= True)
    plato_id:  Mapped[int] = mapped_column(ForeignKey('platos.id'))
    comanda_id:  Mapped[int] = mapped_column(ForeignKey('comandas.id'))

    comanda: Mapped[Comandas] = relationship(
        back_populates= 'comanda_platos') 
    plato: Mapped[Platos] = relationship(
        back_populates= 'comanda_platos') 
    
    
    def serialize(self):
        return {
            "plato_id": self.plato_id,
            "comanda_id": self.comanda_id
        }


#pipenv shell
#pipenv install
#pipenv run diagram para generar el diagrama con python y comprobar las relaciones 