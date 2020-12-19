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