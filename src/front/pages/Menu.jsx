import CategorySection from "../components/CategorySection"

export const Menu = () => {

    const categories = [
        { id: 'starters', title: 'Starters', icon: 'bi-1-circle' },
        { id: 'main_dishes', title: 'Main Dishes', icon: 'bi-2-circle' },
        { id: 'desserts', title: 'Desserts', icon: 'bi-cake' },
        { id: 'drinks', title: 'Drinks', icon: 'bi-cup-straw' },
    ];

    return (
        <div className="container-custom my-4">

         
            <header className="d-flex justify-content-center align-items-center mb-4 sticky-top bg-light py-2">
                {categories.map(cat => (
                     <a key={cat.id} href={`#${cat.id}`} className="navbar-brand-custom mx-3">{cat.title}</a>
                ))}
            </header>

           
            <section className="mb-5 text-center">
                <h4 className="section-title mb-3">Categories</h4>
                <div className="d-flex justify-content-around">
                    {categories.map(cat => (
                         <a key={cat.id} href={`#${cat.id}`} className="category-icon d-flex flex-column align-items-center justify-content-center text-decoration-none">
                             <i className={`bi ${cat.icon} fs-2`}></i>
                             <span className="mt-1">{cat.title}</span>
                         </a>
                    ))}
                </div>
            </section>

            <hr />

        
            {categories.map(cat => (
                <CategorySection key={cat.id} category={cat.id} title={cat.title} />
            ))}

        </div>
    );
};

export default Menu;