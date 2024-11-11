declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"2022/ask-the-darn-question.md": {
	id: "2022/ask-the-darn-question.md";
  slug: "2022/ask-the-darn-question";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/building-ghalldev-30.md": {
	id: "2022/building-ghalldev-30.md";
  slug: "2022/building-ghalldev-30";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/coding-with-depression.md": {
	id: "2022/coding-with-depression.md";
  slug: "2022/coding-with-depression";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/creating-a-dating-profile-with-ai.md": {
	id: "2022/creating-a-dating-profile-with-ai.md";
  slug: "2022/creating-a-dating-profile-with-ai";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/getting-out-of-your-comfort-zone.md": {
	id: "2022/getting-out-of-your-comfort-zone.md";
  slug: "2022/getting-out-of-your-comfort-zone";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/ileopard-a-retrospective.md": {
	id: "2022/ileopard-a-retrospective.md";
  slug: "2022/ileopard-a-retrospective";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/my-favorite-little-apps.md": {
	id: "2022/my-favorite-little-apps.md";
  slug: "2022/my-favorite-little-apps";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/my-macos-home-directory-overview.md": {
	id: "2022/my-macos-home-directory-overview.md";
  slug: "2022/my-macos-home-directory-overview";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/my-top-3-games-of-2022.md": {
	id: "2022/my-top-3-games-of-2022.md";
  slug: "2022/my-top-3-games-of-2022";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/nextjs-13-and-exploring-new-technologies.md": {
	id: "2022/nextjs-13-and-exploring-new-technologies.md";
  slug: "2022/nextjs-13-and-exploring-new-technologies";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022/on-text-editors.md": {
	id: "2022/on-text-editors.md";
  slug: "2022/on-text-editors";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/an-update-on-my-ai-dating-profile.md": {
	id: "2023/an-update-on-my-ai-dating-profile.md";
  slug: "2023/an-update-on-my-ai-dating-profile";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/baldurs-gate-3-feels.md": {
	id: "2023/baldurs-gate-3-feels.md";
  slug: "2023/baldurs-gate-3-feels";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/default-apps-2023.md": {
	id: "2023/default-apps-2023.md";
  slug: "2023/default-apps-2023";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/finding-home-in-hyrule.md": {
	id: "2023/finding-home-in-hyrule.md";
  slug: "2023/finding-home-in-hyrule";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/handheld-gaming.md": {
	id: "2023/handheld-gaming.md";
  slug: "2023/handheld-gaming";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/journal-app-impressions.md": {
	id: "2023/journal-app-impressions.md";
  slug: "2023/journal-app-impressions";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/my-favorite-little-apps-part-2.md": {
	id: "2023/my-favorite-little-apps-part-2.md";
  slug: "2023/my-favorite-little-apps-part-2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/my-gunpla-adventure.md": {
	id: "2023/my-gunpla-adventure.md";
  slug: "2023/my-gunpla-adventure";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/nostalgia.md": {
	id: "2023/nostalgia.md";
  slug: "2023/nostalgia";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/on-using-chat-gpt.md": {
	id: "2023/on-using-chat-gpt.md";
  slug: "2023/on-using-chat-gpt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/questlogger-from-ios-to-mac.md": {
	id: "2023/questlogger-from-ios-to-mac.md";
  slug: "2023/questlogger-from-ios-to-mac";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/reflecting-on-building-my-first-app.md": {
	id: "2023/reflecting-on-building-my-first-app.md";
  slug: "2023/reflecting-on-building-my-first-app";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/reflecting-on-my-first-year-as-a-developer.md": {
	id: "2023/reflecting-on-my-first-year-as-a-developer.md";
  slug: "2023/reflecting-on-my-first-year-as-a-developer";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/thoughs-on-macos.md": {
	id: "2023/thoughs-on-macos.md";
  slug: "2023/thoughs-on-macos";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/using-json-for-data-storage.md": {
	id: "2023/using-json-for-data-storage.md";
  slug: "2023/using-json-for-data-storage";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023/using-tailwind-with-mui-base.md": {
	id: "2023/using-tailwind-with-mui-base.md";
  slug: "2023/using-tailwind-with-mui-base";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/ai-and-creativity.md": {
	id: "2024/ai-and-creativity.md";
  slug: "2024/ai-and-creativity";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/am-i-switching-to-zed.md": {
	id: "2024/am-i-switching-to-zed.md";
  slug: "2024/am-i-switching-to-zed";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/doctor-type-love.md": {
	id: "2024/doctor-type-love.md";
  slug: "2024/doctor-type-love";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/finishing-stuff.md": {
	id: "2024/finishing-stuff.md";
  slug: "2024/finishing-stuff";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/my-backup-solution.md": {
	id: "2024/my-backup-solution.md";
  slug: "2024/my-backup-solution";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/my-five-formative-games.md": {
	id: "2024/my-five-formative-games.md";
  slug: "2024/my-five-formative-games";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/my-terminal-setup.md": {
	id: "2024/my-terminal-setup.md";
  slug: "2024/my-terminal-setup";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/notes-on-these-airpods.md": {
	id: "2024/notes-on-these-airpods.md";
  slug: "2024/notes-on-these-airpods";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/playing-on-easy-mode.md": {
	id: "2024/playing-on-easy-mode.md";
  slug: "2024/playing-on-easy-mode";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/ramblings-on-the-macintosh.md": {
	id: "2024/ramblings-on-the-macintosh.md";
  slug: "2024/ramblings-on-the-macintosh";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024/rip-homepod-mini.md": {
	id: "2024/rip-homepod-mini.md";
  slug: "2024/rip-homepod-mini";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
