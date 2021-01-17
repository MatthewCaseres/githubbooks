
# Reading Configuration Files

The `summaryToUrlTree` method takes in the location of a configuration file and lets you transform it to a JavaScript object.

## Getting started

Make an empty node.js project and install `mdxbook`.

```
mkdir mdxbook-tutorial && cd mdxbook-tutorial 
yarn init -y 
yarn add mdxbook
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
We support loading files locally so you don't have to push commits to GitHub to view your book. Enable local development by passing `localPath` to your configuration. The URL tree will automatically be constructed with local paths.

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
Even though you have generated the local paths you will have to enable local development when consuming the files. Local development is off by default.