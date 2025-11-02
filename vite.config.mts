import { defineConfig } from "vite"
import UnoCSS from "unocss/vite"
import solid from "vite-plugin-solid"
import { minify as htmlMinify } from "html-minifier-terser"
import { Features } from "lightningcss"

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [
		UnoCSS(),
		solid(),
		{
			name: "xrrq:minify-html",
			apply: "build",
			enforce: "post",
			transformIndexHtml: {
				order: "post",
				handler: async (html) =>
					await htmlMinify(html, {
						collapseBooleanAttributes: true,
						collapseWhitespace: true,
						continueOnParseError: true,
						decodeEntities: true,
						removeAttributeQuotes: true,
						removeComments: true,
						removeEmptyAttributes: true,
						removeOptionalTags: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true,
						sortAttributes: true
					})
			}
		}
	],
	publicDir: "static",
	css: {
		transformer: "lightningcss",
		lightningcss: {
			exclude: Features.LightDark
		}
	},
	build: {
		target: "esnext",
		modulePreload: {
			polyfill: false
		},
		assetsInlineLimit: 0,
		cssCodeSplit: false,
		cssMinify: "lightningcss",
		rollupOptions: {
			output: {
				assetFileNames: ({ names }): string => {
					const filters = [
						[/\.css$/g, "assets/style.css"],
						[/\.(?:[to]tf|woff2?|eot)$/g, "assets/font/[hash].[ext]"]
					] as const

					for (const [filter, filename] of filters) {
						for (const name of names) {
							if (filter.test(name)) {
								return filename
							}
						}
					}

					return "assets/[hash].[ext]"
				},
				entryFileNames: "assets/main.js",
				chunkFileNames: "assets/[hash].js"
			}
		},
		minify: "terser",
		terserOptions: {
			compress: {
				arguments: true,
				booleans_as_integers: true,
				hoist_funs: true,
				keep_fargs: true,
				passes: 2,
				pure_new: true,
				unsafe: true
			},
			format: {
				comments: false,
				webkit: true
			},
			module: true,
			toplevel: true
		}
	},
	server: {
		host: "0.0.0.0",
		port: 3000,
		strictPort: true,
		hmr: true
	}
})
