import CategorySection from "../components/CategorySection";
import orderSvg from "../assets/img/order.svg";
import tableSvg from "../assets/img/table.svg";
import { Link } from "react-router-dom";

export const Menu = () => {

    const categories = [
        { id: 'starters', title: 'Starters', icon: 'bi-1-circle' },
        { id: 'main_dishes', title: 'Main Dishes', icon: 'bi-2-circle' },
        { id: 'desserts', title: 'Desserts', icon: 'bi-cake' },
        { id: 'drinks', title: 'Drinks', icon: 'bi-cup-straw' },
    ];

    return (
        <div className="container-menuview">
            <div className="content-menuview">

                <header className="mb-5 text-center">
                    <Link to="/table-order/:id" className="text-decoration-none">
                        <div className="d-inline-block p-3 bg-white rounded shadow-sm me-3 mb-3">
                            <img src={orderSvg} alt="Order Icon" style={{ height: '50px', width: 'auto' }} />
                        </div>
                    </Link>

                    <Link to="/tables" className="text-decoration-none">
                        <div className="d-inline-block p-3 bg-white rounded shadow-sm me-3 mb-3">
                            <img src={tableSvg} alt="Table Icon" style={{ height: '50px', width: 'auto' }} />
                        </div>
                    </Link>
                </header>

                {/*  categorías */}
                <section className="mb-5 text-center">
                    <h4 className="list-title-menuview mb-3 text-white fs-2">Categories</h4>
                    <div className="row row-cols-2 row-cols-sm-4 g-3 card-menuviewjustify-content-center">
                        {categories.map(cat => (
                            <div key={cat.id} className="col ">
                                <a
                                    href={`#${cat.id}`}
                                    className="d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none h-100"
                                >
                                    <span className="card-menuview mt-2 fw-bold text-white">{cat.title}</span>
                                </a>
                            </div>
                        ))}
                    </div>

                </section>

                <hr className="text-secondary" />

                {/* secciones de las categorías */}
                {categories.map(cat => (
                    <div key={cat.id} className="section-menuview" id={cat.id}>
                        <h2 className="text-center my-4 text-white">{cat.title}</h2>
                        <div className="card-menuview">
                            <div className="card-content-menuview">
                                <div className="card-inner-menuview">
                                    <CategorySection category={cat.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div >
    );
};

export default Menu;