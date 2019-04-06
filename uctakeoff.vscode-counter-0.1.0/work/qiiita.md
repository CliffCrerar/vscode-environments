VS Code 拡張で、ワークスペースのコード行をカウントする機能を作った.

TypeScript開発初心者の筆者が、開発した拡張機能の宣伝と、識者からの**暖かい**ご指摘の 一石二鳥を狙って記事を書くことにする.

「TypeScript? そんなハイカラな言語俺には関係ないや」

と思ったレトロエンジニアにこそ、一度 VSCode 拡張開発をやってほしいと感じた.

Electoron があるって? いやでかいでかい. 怖気づくわ.

七面倒臭いお約束をすっ飛ばして、すぐにコードを書き始めることができる.


# 開発の流れ

## チュートリアル

まずはこちらに書かれたとおりに始める.

- [Visual Studio Code はじめての拡張機能開発](https://qiita.com/rma/items/8c53077d1355ab8fa4c6)

最初のジェネレータの選択肢が少々違ったが、どうせ後で直せるだろうと思い、初期値のまま始めた.
VSCode が開発環境であり、デバッグ環境にもなる. これはもうIDEだ.
こりゃ楽チンだ. フロントエンドが人気になるわけだ.


上記記事は、本家の [Example - Hello World](https://code.visualstudio.com/docs/extensions/example-hello-world) に沿って書かれている.
少し物足りなかったため、[Example - Word Count](https://code.visualstudio.com/docs/extensions/example-word-count) くらいまでお手本通りにいじってみる.

## LineCount をよむ

実は、コード行をカウントする拡張は既にあった. [LineCount](https://marketplace.visualstudio.com/items?itemName=lyzerk.linecounter) である[^2].
ただ、これがある程度大きなコード規模になるとレスポンスが返ってこない.
最初はPR[^3]でも送ろうかと思っていたが、いろいろ調べているうちに「なんか根本的に違う」と感じて自分で作ることにしたのがはじまりだ.

[^2]: これにもさらに元ネタがある. README に「1年以上更新がないからフォークした」的なことが書いてある.
[^3]: プルリクエスト. これを読んでいる人たちのほとんどには当たり前の略称だろうが、私のようなレトロエンジニアにはまだまだ耳慣れない言葉なので、そういった人のために注釈にした.


## 言語設定を VSCode から取りたい



`JSON.parse()` で落ちる. なぜだ.

```json:c:\Program Files\Microsoft VS Code\resources\app\extensions\git\languages\ignore.language-configuration.json
{
	"comments": {
		"lineComment": "#",
	}
}
```

うむ. 明らかに JSON フォーマット違反である.  `','` はいらない.

天下の Microsoft がこんなイージーミス? いやいや、だってこれで VSCode は動いてるんでしょ?



[ここ](https://code.visualstudio.com/docs/extensionAPI/extension-manifest#_useful-node-modules) で 

> jsonc-parser - A scanner and fault tolerant parser to process JSON with or without comments.

```
npm install --save jsonc-parser
```

## .gitignore をよみたい

私が [LineCount](https://marketplace.visualstudio.com/items?itemName=lyzerk.linecounter) でイマイチだと思ったところは、ワークスペース上のファイルならなんであろうと片っ端から読んでしまうことだ[^4].
大量の余計なファイル[^5]を勝手にカウント対象にした上、ファイル数が多いと死んでしまう. おお! しんでしまうとは なにごとだ!

「それは数えなくていいだろ」と機械的に判断するための情報として目星をつけたのが `.gitignore` だ.


[^4]: 確かにファイルを除外するための設定はある. でもそれはあくまでもカスタマイズであって、できるなら初期設定で最初から気持ちよく使いたい.
[^5]: 最近特に IDE の大規模化でこちらの預かり知らぬファイルが山程できるようになってきた. 


## 英語と日本語には対応したい

- [VS Code 拡張機能のコマンドタイトル名をローカライズしてみる](https://qiita.com/satokaz/items/dbb009597630b2a946f5)


Problems loading reference 'https://schemastore.azurewebsites.net/schemas/json/tsconfig.json': Unable to load schema from 'https://schemastore.azurewebsites.net/schemas/json/tsconfig.json': Unable to connect to https://schemastore.azurewebsites.net/schemas/json/tsconfig.json. Error: connect ETIMEDOUT 168.62.224.13:443


## ドキュメントを書く

だんだん億劫になってきた.
コードを書くのは楽しいが、説明文は別に楽しくない. 


## マニフェストを書く

後回しにしていた package.json を書く.

[Extension Manifest File - package.json](https://code.visualstudio.com/docs/extensionAPI/extension-manifest)

`author` ってどこにも書いてないようだが、みんな設定しているっぽい.
`publisher` はアカウント名だが、`author` は表示用の名前を書くと良いっぽい.

最初のうちは  `"preview": true,` とか入れておくと気持ちが少し楽になるかも.


## キャプチャ動画

Windows 10 は [標準で動画キャプチャできる](http://ascii.jp/elem/000/001/066/1066550/)ことを初めて知った.



[EZGIF.COM](https://ezgif.com/video-to-gif)

optimize の **Remove every 2nd frame** でフレーム枚数をガンガン減らして、500KB以下になったら Lossy GIF で高圧縮をかけて 200KB くらいにした.


## 

Team Service は Azure DevOps に変わったらしい.


## vsce