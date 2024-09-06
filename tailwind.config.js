// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

export default {
	content: [
		"./views/**/*.ejs", // Include all EJS files in the views folder
		"./public/**/*.js",
		"./src/css/**/*.css", // Include any JS files in the public folder (optional)
	],
	theme: {
		extend: {},
	},
	plugins: [],
};

// module.exports = {
// 	content: [
// 		"./views/**/*.ejs", // Watch all .ejs files inside the views folder
// 		"./public/**/*.js", // Watch JS files in the public folder
// 		"./src/css/**/*.css", // Watch your custom CSS if needed
// 	],
// 	theme: {
// 		extend: {},
// 	},
// 	plugins: [],
// };
