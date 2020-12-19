# Next-MDX-Books

## Purpose/Design
This package generates/consumes a tree where nodes contain urls that serve markdown/MDX files. We refer to this as the URL tree.

The URL tree can be generated from a table of contents written in markdown, compatible with existing GitBooks. Utility functions are provided to reformat the URL tree to play well with Next.js functions getStaticPaths and getStaticProps so that you can serve all the files specified in your table of contents.

## Installation
```
yarn add next-mdx-boooks
#or
npm install next-mdx-books
```

## Usage
We document the workings of this package on this page, but the best way to **get started** is to use the [minimal example](https://github.com/Open-EdTech/next-mdx-book-minimal)

```
npx create-next-app -e https://github.com/Open-EdTech/next-mdx-book-minimal
# or
yarn create next-app -e https://github.com/Open-EdTech/
```

https://github.com/Open-EdTech/openedtech.dev
This documentation site is also built using next-mdx-books, check it out [on GitHub]().
