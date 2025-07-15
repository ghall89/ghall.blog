import { defineConfig } from 'astro/config';

// https://astro.build/config
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import alpinejs from '@astrojs/alpinejs';

// https://astro.build/config
export default defineConfig({
	site: 'https://ghall.space',
	output: 'static',
	integrations: [mdx(), alpinejs(), tailwind()],
	experimental: {
		svg: true,
	},
	redirects: {
		'/posts/[...slug]': '/blog/[...slug]',
	},
});
