
<style>
.box {
  padding: 8px 16px;
}
</style>

# electronで出勤簿用のpdf作ってみた。

## 使い方
インストール
- git
- nodejs (or nodist)

```bash
$ git clone http::electron-pdfmake
$ cd pdf-make
$ npm update
$ npm dedupe

### electron 実行
$ npm start

### 配布用exe 作成
$ npm run release
```


## 出会った問題点
<div class="box">
日付取得用のモジュールを使ったらなんかエラーが出た。<br>
electronと相性が悪いのかも。他のモジュールでもそういうのありそう。<br>
`npm i -D date-utils ✖`
</div>

<div class="box">
  TypeScriptで書くと定義ファイル作るのがめんどい。のでes6で書く。
</div>

<div class="box">
  pdfmakeなんか書くのめんどい。
</div>

<div class="box">
  ファイル名が長すぎて削除できないとか言われたら、<br>
  `npm dedupe`<br>
  を一旦やってみる。
</div>



