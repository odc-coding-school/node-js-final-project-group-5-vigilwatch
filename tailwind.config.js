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
		"./public/**/*.js",// Include any JS files in the public folder (optional)
		"./src/css/**/*.css", 
	],
	theme: {
		extend: {
			colors: {
				darkblue: "#0b0b68",
				customgray:"#969191",
				customblue: "#1877f2"
			},
			
		},
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
