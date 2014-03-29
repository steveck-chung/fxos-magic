# 基本開發

本章將向讀者介紹如何快速在 FirefoxOS 平台上完成並發布一個應用(App)。
這個應用的功能非常簡單，但是卻具有足夠的可擴充性，讓讀者可以在之後的章節，利用所學到的新功能對其進行擴充，
從而實際練習這些功能如何在真正的應用上使用。

## 目標與構想

我們將從一個簡單的工作清單開始：

![Todo App](/demo/todoapp/preview.png)

雖然作一個簡單的工作清單，幾乎已經是從新程式語言到平台都會採用的 "Hello World" 。但我們可以向已經開始覺得無趣的讀者保證，
隨著在之後的章節加入更多的新功能，這個應用可能變成 FirefoxOS 市集上最強大的工作清單應用！

## 從既有範例開始

雖然 FirefoxOS 上的應用只是一個網頁加上一個設定檔，但實際上不同應用還還需注意平台上的不同 API 要如何被正確使用的問題
因此開發者在開始的時候，其實可以參考 Gaia 中已經存在的各類應用，快速的上手開發。

以本章為例，因為工作清單並不複雜，所以讀者其實可以複製 FirefoxOS Gaia 中的樣板應用(Template)去取得諸如簡單的圖示，
以及應用描述（manifest）等檔案。具體步驟如下

1. 取得 FirefoxOS Gaia
2. 複製 `gaia/test_apps/template` 到任何地方，例如 `todomagic`
3. 進去該複製後的應用目錄，開始修改應用描述等開發過程

下面的小節將一步步帶讀者從應用描述檔的介紹開始，去完成整個範例應用的開發

### 應用描述檔

對每個 FirefoxOS 應用而言，應用描述檔的作用是在安裝與啟動這個應用時，系統可以知道這個應用的種類，以及其所預先聲明會使用的各種資源。
這也決定了系統會以何種安全性對待該應用。例如，在 Firefox OS 中，非經認證(certified)的應用將不能使用播打電話的相關 API，
因此一個普通應用就無法控制手機播打電話的功能。這並不是意味著讀者只要將應用的型別設定成經認證後，
就可以隨意控制其他人的電話功能。因為除經 Mozilla 認證的應用，在一般的應用市集中並不允許這種應用上架。也就是說，
可以使用愈多功能的應用，其散佈條件越嚴格。這在之後的章節會一一加以介紹，現在讀者只需掌握這種描述檔是用以管控可用資源與描述應用性質即可。

以前述的樣板應用而言，其描述檔的重點可分為下列幾項

#### 名稱與相關描述

在這個複製過來的應用描述中，具有下列幾個描述的屬性

    "name": "Template",
    "description": "Web app template",

    "developer": {
      "name": "The Gaia Team",
      "url": "https://github.com/mozilla-b2g/gaia"
    },
    "locales": {
      "ar": {
        "name": "Template",
        "description": "Web app template"
      }
    // continue...
    }

這些描述的作用如下

* name: 此應用的名稱。會被顯示在圖示下方，也會成為應用市集上的正式名稱
* description: 描述此應用的性質
* developer: 描述開發者與參考網址
* locales: 各種描述性質的翻譯版本。會自動根據使用者的環境選擇並套用

在此我們將這些描述改成下列版本，以符合我們範例的需求

    "name": "TodoMagic",
    "description": "Todo list of FxOS Magic",

    "developer": {
      "name": "FxOS Magic",
      "url": "https://github.com/evanxd/fxos-magic"
    },
    "locales": {
      "ar": {
        "name": "TodoMagic",
        "description": "Todo list of FxMagic"
      }
    // continue...
    }

讀者可以注意到在 `locales` 裡面有各種對應的翻譯版本。這個描述是可以根據讀者所需要的版本進行翻譯，
所以只要修改這次範例想要使用的幾個即可，其他可以移除。

接下來我們將注意到應用的型別屬性

#### 型別

在該描述檔中，讀者可能發現並沒有著關於型別的描述。這其實是表示它是預設的型別，也就相當於明白寫出

  "type": "web"

這樣的描述。這表示該應用能使用的將是最普遍的一群功能，而相對在取用外部函式庫與資源方面的限制也比較寬鬆。
在之後介紹一些需要較高權限的 API 時，我們可能會改變這個型別。

#### 資源與進入點

一個網頁應用會需要各種資源來進行操作與顯示。於本應用中，讀者可以注意

    "launch_path": "/index.html",
    "icons": {
      "128": "/style/icons/Blank.png"
    }

這兩項描述表示了這個應用被啟動時的進入點，以及在桌面顯示時要使用哪些圖示表示。
而在每個圖示前面的文字，例如 `"128"`，則表示了在需要不同大小圖示時，要取用哪些檔案以達到比較好的效果。

而所謂的進入點，則是指當啟動這個應用時，系統要載入哪個網頁開始。由於一個應用可能有很多個對應的網頁，
包括了在被網頁活動(Activity)喚起時所要使用的對應頁面，因此必須在這裡加以指定。讀者也可以注意到，
所謂 FirefoxOS 的應用，確實是以網頁技術為主，甚至啟動也僅是「載入網頁」這樣與一般網站無異的行為。

#### 權限

因為樣板應用是非常簡單的應用，並沒有用到太特別的系統功能，所以我們可以打開另一個範例應用，來看其描述檔是如何聲請要使用的 API。
例如在影片播放器的描述檔案(`gaia/apps/video/manifest.webapp`)中，我們可以發現關於權限的描述如下

  "permissions": {
    "storage":{},
    "device-storage:pictures":{ "access": "readwrite" },
    "device-storage:videos":{ "access": "readwrite" },
    "settings":{ "access": "readonly" },
    "deprecated-hwvideo":{},
    "audio-channel-content":{},
    "nfc": { "access": "readwrite" }
  },

這段關於權限的描述指定了該應用會使用哪些系統所提供的 API。透過這種方式，再配合應用型別的差異，
就可以據此判斷應用在市集公開上架時所需要接受的安全檢查層級。

#### 格式

最後要注意的是 `manifest.webapp` 所使用的是 JSON 格式，而不只是 JavaScript 檔。
這代表讀者可能會因為一些文法錯誤而造成問題。具體的格式與差異可以參考

http://stackoverflow.com/questions/2904131/what-is-the-difference-between-json-and-object-literal-notation

以上就是一些關於應用描述檔的基本知識。除了這些之外，更多關於描述檔的資訊可見

https://developer.mozilla.org/en-US/Apps/Build/Manifest

### 目錄結構與程式架構

介紹完應用描述檔後，如果讀者照著前述的複製與更改動作開始工作清單的開發，會得到以下的目錄結構

    /                       # 應用目錄
    /manifest.webapp        # 應用描述檔
    /index.html             # 進入點
    /js                     # 程式目錄
    /style                  # 應用的樣式目錄
    /test                   # 測試相關檔
    /locales-obj            # L10N 相關檔案。本章將先略過不介紹

下列幾項則是預計增加的內容

    /js/app.js              # 主程式，應用的最主要介面
    /js/task.js             # 每則待辦事項的類別
    /style/app.css          # 應用整體的樣式
    /style/task.css         # 待辦事項的樣式

從程式架構來看，我們需要的類別共有

    window.App              # 整個應用
    window.Task             # 單一待辦事項

`App` 將會在應用被啟動時生成一個實體，而後將負責處理頁面上各元素，以及啟動相關組件。
這個實體的角色主要是協調各組件之間的行為。例如當使用者點了「新增待辦」圖示後，相關的需求會轉給這個實體進行處理，
而後在頁面上就會生成一個新的待辦事項。而從設計模式的角度來看，`App` 與各 `Task` 之間將互相以制定好的一組「需求-回應」模式溝通，
這些需求可以整理出來列在下面

1. `App` 要求各 `Task` 匯出資料給前者，以進行儲存等動作
2. `Task` 被新增或移除後，向 `App` 要求註冊或刪除自己

就所訂定出的規格而言，這代表只要有任何類別可以透過約定的介面去發出與回應這些需求，都可以被 `App` 管理而成為待辦事項的類別。
這樣的溝通模式是為了儘量降低兩者的耦合程度，並且盡量提升此應用的可擴充性，以應付日後章節改寫此應用的需求。

以上就是我們範例應用的整體描述。接著，我們將描述要如何一步步完成這個應用。這也包括了前面提到的一些步驟，現在整理在下面

## 實作過程

下列實作的過程中將不會解釋太多細節，而著重在整體架構如何運作與完成開發上。

### 複製樣板應用

從 FirefoxOS Gaia 中複製樣板應用到讀者的開發環境中。樣板應用的位置在 `gaia/test_apps/template`。

### 修改應用描述檔

要修改的屬性包括

* name: 修改成 "TodoMagic"
* description: 修改成 "Todo list of FxOS Magic"
* developer
  * name: 修改成 "FxOS Magic"
  * url: 修改成 "https://github.com/evanxd/fxos-magic"

其後的 L10N 相關資訊可以修改一部分，其餘刪除即可。

讀者也可以依照自己的喜好更改前述的設定。此小節只是列出一個範本。

### 撰寫程式

在應用中，增加

* `/js/app.js`
* `/js/task.js`
* `/style/app.css`
* `/style/task.css`

## 程式細節

以下將針對工作清單會使用的類別，按照其主要的成員函式與屬性做出詳細解釋

####
