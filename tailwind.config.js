/** @type {import('tailwindcss').Config} */

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				"hcb-dark": "#17171D",
				"hcb-dark2": "#252429",
				"hcb-snow": "#E1E6EC"
			}
		}
	},
	plugins: []
};
