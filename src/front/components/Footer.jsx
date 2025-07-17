export const Footer = () => (
	<footer
		className="footer mt-auto py-3 text-center"
		style={{
			fontSize: '0.75rem',
			color: 'rgba(245, 237, 237, 0.7)',
			backgroundColor: 'transparent',
			textShadow: '1px 1px 2px rgba(187, 187, 187, 0.6)',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
		}}
	>
		<div>
			© 2025 Gestión de Comandas. Todos los derechos reservados.
			<i className="fa fa-heart text-danger" />{' '}
		</div>

		<div
			style={{
				fontSize: '0.75rem',
				color: 'rgba(245, 237, 237, 0.7)',
				textShadow: '1px 1px 2px rgba(116, 116, 116, 0.6)',
				marginTop: '0.5rem',
			}}
		>
			<a className="text-decoration-none text-muted mx-2" href="https://github.com/martanvcs">Marta Navarro</a>
			<a className="text-decoration-none text-muted mx-2" href="https://github.com/EduLG">Eduardo LG</a>
			<a className="text-decoration-none text-muted mx-2" href="https://github.com/HeidyDB">Heidy Diaz</a>
			<a className="text-decoration-none text-muted mx-2" href="https://github.com/MohamedRouias">Mohamed Rouias</a>
		</div>
	</footer>
);
