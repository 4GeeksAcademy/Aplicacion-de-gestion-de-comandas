import React from 'react';



function ItemCard({ item }) {

  if (!item) {
    return null;
  }

  return (
    <div className="item-card">
      <img src={item.image} alt={item.name} className="item-image" />
      <div className="item-info">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-description">{item.description}</p>
        <p className="item-price">{item.price} €</p>
      </div>
    </div>
  );
}

export default ItemCard;