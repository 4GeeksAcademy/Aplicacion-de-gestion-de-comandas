
import React from 'react';

function ItemCard({ item }) {
  if (!item) return null;


  return (
    <div className="product-card-menuview ">
      {item.image && (
        <img src={item.image} alt={item.name} className="product-image-menuview" />
      )}
      <div className="product-info-menuview">
        <h3 className="product-name-menuview">{item.name}</h3>
        <p className="product-description-menuview">{item.description}</p>
        <p className="product-price-menuview">{item.price} €</p>
      </div>
    </div>
  );
}

export default ItemCard;


