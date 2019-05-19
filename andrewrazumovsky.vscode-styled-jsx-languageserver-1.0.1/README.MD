# styled-jsx Language Server

🎉 Integrates a language server for [styled-jsx](https://github.com/zeit/styled-jsx).

## Prerequisites

The extension requires that the [vscode-styled-jsx](https://marketplace.visualstudio.com/items?itemName=blanu.vscode-styled-jsx) syntax highliter is installed. The extension will not work without it, because the `vscode-styled-jsx` converts template literals to language which can be detected by language server.

## How it works

It works ridiculously simple 🤣
The extension is fully made from [vscode css extension](https://github.com/Microsoft/vscode/tree/master/extensions/css) sources.

consider this component:

```jsx
const Button = (props) => (
  <button>
     { props.children }
     <style jsx>{`
        button {
          color: #999;
          display: inline-block;
          font-size: 2em;
        }
     `}</style>
     <style jsx>{`
        button {
          padding: ${ 'large' in props ? '50' : '20' }px;
          position: relative;
          background: ${props.theme.background};
        }
     `}</style>
  </button>
)
```

Before language server will do something with document everything is replaced with whitespaces except `CSS` related lines. The result will be:

```css
                           
          
                       
                  
        button {
          color: #999;
          display: inline-block;
          font-size: 2em;
        }
               
                  
        button {
                                                         
          position: relative;
                                                
        }
               
           
 

```

The main idea is to preserve characters number. This is neccessary for the laguage server in order to do completions in the right place, to underline problems on the right words, to highlight right symbols and so on. Also I've tried to make it as close as possible to the original vscode `CSS` language server.

## Features

I believe that it supports all features which native CSS language server provides.

- `CSS` code completion

![css-completion](https://thumbs.gfycat.com/FortunateScarceBufeo-size_restricted.gif)

- Hovers

![hover](https://thumbs.gfycat.com/PolishedIllustriousAmphibian-size_restricted.gif)

- Class names completion

![classname-completion](https://thumbs.gfycat.com/WelllitQuestionableGavial-size_restricted.gif)

- Color picker

![color-picker](https://thumbs.gfycat.com/UnimportantGrossFlatfish-size_restricted.gif)

- Linting

![lint](https://thumbs.gfycat.com/BlaringEmbellishedAfricanjacana-size_restricted.gif)

- Quick fixes

![quick-fixes](https://thumbs.gfycat.com/RelievedHarmoniousIberiannase-size_restricted.gif)

- Multiply `<style jsx/>` tags in file

![multiply-tags](https://i.imgur.com/n7VzljO.png)

- External styles `styled-jsx/css`

![external-styles](https://i.imgur.com/NiSKtQW.png)

## Main caveats

- Template literal expressions is replaced with whitespaces too. So there are no completions, hovers and other features for them. I don't know the way how it can be implemented.

- Extensions is synced to the `CSS` settings in vscode. If settings separation is necessary - PRs are welcome.

- Can be problems with multilined expressions

## TODO

- Update [css language server](https://github.com/Microsoft/vscode-css-languageservice)

- Add an ability to rename symbols in styled-jsx template literal

## Plans

- Create tests (how? 😱).

- Recognize react components class name as a symbol to make it possible to rename by symbol from `CSS`. Currently it can be done with `Change All Occurences` but be careful to not rename other things which have the same pattern.

- There is a registered `applyCodeAction` (but it isn't contributed in `package.json`) which I don't really understand what it does. Couldn't find any information about it.

- Maybe investigate into [stylelint](https://github.com/stylelint/stylelint) support.

## Contribute

I will really appreciate any help. This is my first experience with `typescript`, vscode extension development and it is also my first repo that I contribute to open source (some files can be missing).