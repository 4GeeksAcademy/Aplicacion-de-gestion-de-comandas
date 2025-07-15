import CategorySection from "../components/CategorySection";

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

                {/* header */}
                <header className="d-flex flex-wrap justify-content-center align-items-center mb-4 sticky-top  py-2 rounded shadow-sm">
                    {categories.map(cat => (
                        <a
                            key={cat.id}
                            href={`#${cat.id}`}
                            className="button-menuview modern mx-2 my-1"
                        >
                            {cat.title}
                        </a>
                    ))}
                </header>

                {/*  categorías */}
                <section className="mb-5 text-center">
                    <h4 className="list-title-menuview mb-3 text-white">Categories</h4>
                    <div className="row row-cols-2 row-cols-sm-4 g-3 card-menuviewjustify-content-center">
                        {categories.map(cat => (
                            <div key={cat.id} className="col ">
                                <a
                                    href={`#${cat.id}`}
                                    className="d-flex flex-column align-items-center justify-content-center p-3 text-decoration-none h-100"
                                >
                                    <i className={`bi ${cat.icon} fs-2 text-white`}></i>
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
        </div>
    );
};

export default Menu;

