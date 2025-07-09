import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ItemCard = ({ item }) => {
    return (
        <div className="col-md-4 col-sm-6 col-12">
            <div className="card product-card">

                <div className="position-relative">
                    <img src={item.image} className="card-img-top" alt={item.name} />
                </div>

                <div className="card-body text-center">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">{item.description}</p>
                    {item.price && <p className="card-text">Precio: ${item.price}</p>}
                    <button className="btn btn-add-cart">Add Cart</button>
                </div>

            </div>
        </div>
    );
};

export const Menu = () => {
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlates = async () => {
            try {
                
                const response = await fetch(BASE_URL+'/api/plates', {
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPlates(data.results);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlates();
    }, []);

    const filterPlatesByCategory = (category) => {
        return plates.filter(plate => plate.categories === category);
    };

    if (loading) return <div className="container-custom my-4">Loading menú...</div>;
    if (error) return <div className="container-custom my-4">Error when loading menu: {error.message}</div>;

    const starters = filterPlatesByCategory('starters');
    const mainDishes = filterPlatesByCategory('main_dishes');
    const desserts = filterPlatesByCategory('desserts');
    const drinks = filterPlatesByCategory('drinks');

    return (
        <div className="container-custom my-4">

            <header className="d-flex justify-content-between align-items-center mb-4">
                <span className="navbar-brand-custom">Drinks</span>
                <span className="navbar-brand-custom">Starters</span>
                <span className="navbar-brand-custom">Main dishes</span>
                <span className="navbar-brand-custom">Deserts</span>
            </header>

            <section className="mb-5">
                <h4 className="section-title mb-3">Category</h4>
                <div className="d-flex justify-content-around">
                    <a href="#" className="category-icon d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-cup-straw"></i>
                    </a>
                    <a href="#" className="category-icon d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-1-circle"></i>
                    </a>
                    <a href="#" className="category-icon d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-2-circle"></i>
                    </a>
                    <a href="#" className="category-icon d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-cake"></i>
                    </a>
                </div>
            </section>

            {starters.length > 0 && (
                <section className="mb-5">
                    <h2 className="section-title mb-3">Starters</h2>
                    <div className="row g-4">
                        {starters.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}

            {mainDishes.length > 0 && (
                <section className="mb-5">
                    <h2 className="section-title mb-3">Main dishes</h2>
                    <div className="row g-4">
                        {mainDishes.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}

            {desserts.length > 0 && (
                <section className="mb-5">
                    <h2 className="section-title mb-3">Desserts</h2>
                    <div className="row g-4">
                        {desserts.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}

            {drinks.length > 0 && (
                <section className="mb-5">
                    <h2 className="section-title mb-3">Drinks</h2>
                    <div className="row g-4">
                        {drinks.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Menu;