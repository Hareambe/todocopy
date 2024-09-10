import { PrimeIcons, PrimeReactProvider } from 'primereact/api';
import Tailwind from 'primereact/passthrough/tailwind';
import React, { useCallback } from 'react';

import './index.scss';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';

function PrimeDemo() {
	const click = useCallback(() => {
		alert('click');
	}, []);

	const items = [
		{
			label: 'File',
			items: [
				{ label: 'New', icon: PrimeIcons.PLUS },
				{ label: 'Open', icon: PrimeIcons.DOWNLOAD },
			],
		},
	];

	return (
		<>
			<h1 className="underline font-bold text-2xl text-red-500 mb-2">
				Prime React With Tailwind
			</h1>
			<Menu className="mb-2" model={items} />
			<Button icon={'pi pi-plus'} onClick={click} label="Submit" />
		</>
	);
}

function App() {
	return (
		<>
			<PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
				<div className="p-5">
					<PrimeDemo />
				</div>
			</PrimeReactProvider>
		</>
	);
}

export default App;
