import React, { useState, useEffect } from 'react';
import ItemCard from './ItemCard';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;



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
            <div className="row g-4">
                {items.map(item => (
                    <ItemCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;