import CategorySection from "../components/CategorySection";
import orderSvg from "../assets/img/order.svg";
import tableSvg from "../assets/img/table.svg";
import { Link, useParams } from "react-router-dom";

export const Menu = () => {
    const params = useParams();

    const categories = [
        { id: 'starters', title: 'Starters', icon: 'bi-1-circle' },
        { id: 'main_dishes', title: 'Main Dishes', icon: 'bi-2-circle' },
        { id: 'desserts', title: 'Desserts', icon: 'bi-cake' },
        { id: 'drinks', title: 'Drinks', icon: 'bi-cup-straw' },
    ];

    return (
        <div className="container-menuview">
            <div className="content-menuview">

                {/* Icon links */}
                <header className="mb-5 text-center d-flex flex-wrap justify-content-center gap-3">
                    <Link
                        to={`/table-order/${params.order_id}`}
                        className="text-decoration-none"
                    >
                        <div className="p-3 bg-white rounded shadow-sm d-flex align-items-center justify-content-center" style={{ height: "80px", width: "80px" }}>
                            <img
                                src={orderSvg}
                                alt="Order Icon"
                                style={{ height: "50px", width: "auto" }}
                            />
                        </div>
                    </Link>

                    <Link to="/tables" className="text-decoration-none">
                        <div className="p-3 bg-white rounded shadow-sm d-flex align-items-center justify-content-center" style={{ height: "80px", width: "80px" }}>
                            <img
                                src={tableSvg}
                                alt="Table Icon"
                                style={{ height: "50px", width: "auto" }}
                            />
                        </div>
                    </Link>
                </header>

                {/* Category buttons */}
                <section className="mb-5 text-center">
                    <h4 className="list-title-menuview mb-3 text-white fs-2">
                        Categories
                    </h4>
                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
                        {categories.map((cat) => (
                            <div key={cat.id} className="col d-flex justify-content-center ">
                                <a
                                    href={`#${cat.id}`}
                                    className="d-flex flex-column align-items-center justify-content-center text-decoration-none w-100"
                                    style={{ minHeight: "60px" }}
                                >
                                    <span className="card-menuview category-button mt-2 fw-bold text-white text-center w-100 p-2">
                                        {cat.title}
                                    </span>
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="text-secondary" />

                {/* Category sections */}
                {categories.map((cat) => (
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
        </div>
    );
};

export default Menu;
