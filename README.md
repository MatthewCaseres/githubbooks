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

# Generate bookConfig.json from a script

The `summariesToTrees` method takes an array of SUMMARY.md urls and writes to an array of URL trees as `bookConfig.json`. Run `node script.js` to generate `bookConfig.json`.

```js
var {summariesToTrees} = require("next-mdx-books");

(async () => {
  await summariesToTrees(
    [
      {
        url:
          "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/SUMMARY.md",
      },
      {
        url: "https://github.com/GitbookIO/javascript/blob/master/SUMMARY.md",
        removeHeadings: true
      },
    ],
    "https://raw.githubusercontent.com/"
  );
})();
```

## With Links to Headers
For the legacy gitbook with a SUMMARY.md file at https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/SUMMARY.md we see a root node like this: 
```json
[
  {
    "type": "directory",
    "children": [
      {
        "type": "file",
        "route": "Open-EdTech/mostly-adequate-guide/ch01.md",
        "title": "Chapter 01: What Ever Are We Doing?",
        "rawUrl": "https://raw.githubusercontent.com/Open-EdTech/mostly-adequate-guide/master/ch01.md",
        "ghUrl": "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/ch01.md",
        "children": [
          {
            "title": "Introductions",
            "route": "Open-EdTech/mostly-adequate-guide/ch01.md/#introductions",
            "type": "heading"
          },
          {
            "title": "A Brief Encounter",
            "route": "Open-EdTech/mostly-adequate-guide/ch01.md/#a-brief-encounter",
            "type": "heading"
          }
        ]
      },
//    ...
```

## Without Header Links
`rawUrl` is the location where we fetch the raw text of the page from. `ghUrl` is included to allow for an 'edit' this page button on each page. `title` is for displaying link text in a navigation menu.

We also loaded a non-legacy GitBook from https://github.com/GitbookIO/javascript/blob/master/SUMMARY.md, non-legacy GitBooks navigate to related sub-files, not headers.

```json
// ...
  {
    "type": "directory",
    "children": [
      {
        "type": "file",
        "route": "GitbookIO/javascript/basics/README.md",
        "title": "Basics",
        "children": [
          {
            "type": "file",
            "route": "GitbookIO/javascript/basics/comments.md",
            "title": "Comments",
            "rawUrl": "https://raw.githubusercontent.com/GitbookIO/javascript/master/basics/comments.md",
            "ghUrl": "https://github.com/GitbookIO/javascript/blob/master/basics/comments.md"
          },
          {
            "type": "file",
            "route": "GitbookIO/javascript/basics/variables.md",
            "title": "Variables",
            "rawUrl": "https://raw.githubusercontent.com/GitbookIO/javascript/master/basics/variables.md",
            "ghUrl": "https://github.com/GitbookIO/javascript/blob/master/basics/variables.md"
          },
      //  ...
```

## Function Arguments
Here is the type of summariesToTrees. 
```
declare type LocalConfig = {
    local: true;
    localPath: string;
    url?: string;
    removeHeadings?: boolean;
};
declare type RemoteConfig = {
    localPath?: string;
    url: string;
    removeHeadings?: boolean;
};
export declare type Config = LocalConfig | RemoteConfig;
export declare type AllConfigs = Config[];
export default function summariesToTrees(configs: AllConfigs, rawProvider?: string): Promise<void>;
```

## rawProvider
The second positional argument if not provided defaults to loading markdown from https://gitcdn.xyz/, you can override it to load from https://raw.githubusercontent.com/ at the risk of rate limiting (I have had no problems with this so far).

## local development and localPath
We support loading files locally so you don't have to push commits to GitHub to view your book. Enable local development by passing `local: true` along with the path to the location of your summary file.

This script
```js
var {summariesToTrees} = require("next-mdx-books");

(async () => {
  await summariesToTrees(
    [
      {
        local: true,
        localPath: "C:\\Users\\matth\\OneDrive\\Documents\\GitHub\\mostly-adequate\\SUMMARY.md",
        url:
          "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/SUMMARY.md",
      },
    ],
  );
})();
```
produces this:
```json
[
  {
    "type": "directory",
    "children": [
      {
        "type": "file",
        "route": "Open-EdTech/mostly-adequate-guide/ch01.md",
        "title": "Chapter 01: What Ever Are We Doing?",
        "path": "C:\\Users\\matth\\OneDrive\\Documents\\GitHub\\mostly-adequate\\ch01.md",
        "rawUrl": "https://gitcdn.xyz/repo/Open-EdTech/mostly-adequate-guide/master/ch01.md",
        "ghUrl": "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/ch01.md",
        "children": [
          {
            "title": "Introductions",
            "route": "Open-EdTech/mostly-adequate-guide/ch01.md/#introductions",
            "type": "heading"
          },
          //...
```
# Consuming Configuration Files
After creating `bookConfig.json` we produce routes for each node in the URL tree that has a `rawUrl` property. To do this we use dynamic routes in Next.js with dynamic routes, definitely be familiar with this if you want to know how this software works.

## getAllRoutesInfo
type:
```ts
function getAllRoutesInfo(urlTrees: UrlNode[]): Promise<Record<string, FlatNode>>;
```
`getAllRoutes` takes our URL trees and flattens them to an object that looks like this: 
```json
{
  "Open-EdTech/mostly-adequate-guide/ch01.md": {
    "route": "Open-EdTech/mostly-adequate-guide/ch01.md",
    "title": "Chapter 01: What Ever Are We Doing?",
    "path": "C:\\Users\\matth\\OneDrive\\Documents\\GitHub\\mostly-adequate\\ch01.md",
    "rawUrl": "https://gitcdn.xyz/repo/Open-EdTech/mostly-adequate-guide/master/ch01.md",
    "ghUrl": "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/ch01.md",
    "index": 0
  },
  "Open-EdTech/mostly-adequate-guide/ch02.md": {
    "route": "Open-EdTech/mostly-adequate-guide/ch02.md",
    "title": "Chapter 02: First Class Functions",
    "path": "C:\\Users\\matth\\OneDrive\\Documents\\GitHub\\mostly-adequate\\ch02.md",
    "rawUrl": "https://gitcdn.xyz/repo/Open-EdTech/mostly-adequate-guide/master/ch02.md",
    "ghUrl": "https://github.com/Open-EdTech/mostly-adequate-guide/blob/master/ch02.md",
    "index": 0
  },
  //...
}
```
We can use this `allRoutesInfo` object's keys to specify the dynamic routes to create in getStaticPaths for a file named [...id].tsx.
```js
import { GetStaticPaths, GetStaticProps } from "next";
import { getAllRoutesInfo } from "next-mdx-books";
import bookConfig from '../bookConfig.json'

export const getStaticPaths = async () => {
  const allRoutesInfo = await getAllRoutesInfo(bookConfig);
  return {
    paths: Object.keys(allRoutesInfo).map((routeString) => ({
      params: {
        id: routeString.split("/"),
      },
    })),
    fallback: false,
  };
};
```
In getStaticProps we can grab some information to pass down to our page. Here, we grab the `urlTree` so that each page can display a table of contents in the side navigation. We get the GitHub url, `ghUrl`, to add an 'edit this page' feature. 
```js
import { getMdSource, getAllRoutesInfo } from "next-mdx-books";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate, { Source } from "next-mdx-remote/hydrate";
import bookConfig from '../bookConfig.json'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const allRoutesInfo = await getAllRoutesInfo(bookConfig);
  const stringRoute = (params!.id as string[]).join("/");
  const nodeIndex = allRoutesInfo[stringRoute].index;
  const ghUrl = allRoutesInfo[stringRoute].ghUrl;
  const urlTree = bookConfig[nodeIndex];
  const source = await getMdSource(stringRoute, allRoutesInfo, remote);
  const mdxSource = await renderToString(source);
  return {
    props: { urlTree, mdxSource, stringRoute, ghUrl }, // will be passed to the page component as props
  };
};
//From openedtech.dev
function Post({ urlTree, mdxSource, ghUrl }: { urlTree: UrlNode; mdxSource: Source, ghUrl: string }) {
  const content = hydrate(mdxSource);
  return (
      <SideBarProvider config={urlTree.children as StatefulNode[]}>
        <SideBar ghUrl={ghUrl}>
          <div className="prose dark:prose-dark max-w-sm sm:max-w-md lg:max-w-xl xl:max-w-2xl m-auto px-2 flex-1 ">
            <div>{content}</div>
          </div>
        </SideBar>
      </SideBarProvider>
  );
}
```
