
import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ItemCard = ({ item }) => (
    <div className="col-md-4 col-sm-6 col-12 mb-4">
        <div className="card product-card h-100">
            <div className="card-body text-center d-flex flex-column">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text flex-grow-1">{item.description}</p>
                {item.price && <p className="card-text fw-bold">Precio: ${item.price}</p>}
                <button className="btn btn-add-cart mt-auto">Add Cart</button>
            </div>
        </div>
    </div>
);

const CategorySection = ({ category, title }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`${BASE_URL}/plates/${category}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setItems(data.results);
            } catch (error) {
                console.error(`Error fetching ${category}:`, error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [category]);

    if (loading) return <p>Loading {title}...</p>;
    if (error) return <p>Error loading {title}.</p>;
    if (items.length === 0) return null;

    return (
        <section id={category} className="mb-5">
            <h2 className="section-title mb-4">{title}</h2>
            <div className="items-grid-menuview">
                {items.map(item => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
