import React from 'react';

function ItemCard({ item }) {
  if (!item) return null;

  return (
    <div className="product-card-menuview ">

      <div>
        <h3 className="product-name-menuview d-flex flex-column justify-content-between">{item.name}</h3>
      </div>

      <div>
        <p className="product-description-menuview d-flex flex-column justify-content-between">{item.description}</p>
      </div>

      <div className='d-flex justify-content-between align-items-center'>
        <p className="product-price-menuview mb-0">{item.price} €</p>
        <button
          type="button"
          className="btn btn-secondary"
          /*onClick={}*/
        >
          Add
        </button>
      </div>
      
    </div>

  );
}

export default ItemCard;