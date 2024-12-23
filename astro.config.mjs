import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import icon from 'astro-icon';

// https://astro.build/config
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
	site: 'https://ghall.blog',
	output: 'static',
	adapter: netlify(),
	integrations: [
		mdx(),
		icon({
			iconDir: 'src/styles/svg/icons',
		}),
	],
});
