# 引言

在 HTML framework 技術突飛猛進的今日，我們嘗試著用新的 HTML5/CSS3/JavaScript 來完成更多的事情。Chrome Web Store 裡就有各式各樣的 Web application 來告訴你目前 HTML framework 的能耐。除了視聽娛樂輕鬆實現的應用外，一般人最常用到的軟體多半就是紀錄大小事的應用軟體了。不管是日常筆記、記帳、行事曆…等等，我們常常需要把生活周遭的事情記錄下來，如果能有效的查詢或管理就更棒了。問題是目前 HTML5 所提供的資料的存取及查詢的功能是否能滿足開發者，讓他們能在開發 web application 的過程中輕鬆實現?

在古早的年代，想要達成這件事還真的限制重重。在原生的 framework 中，一般若不是將輕鬆實現資料存放置遠端伺服器，就是以 cookie 的形式存在客戶端。但是前者需要登入的動作，為了一些小功能還要註冊等等的步驟實在是很費工，也讓使用者很掃興；而後者的資料保存實在太不保險了，使用者很容易不知不覺中就將 cookie 清除掉，而且容量也僅有 4KB 的限制。新時代自然有新的解決方案，讓我們趕快介紹今日的主角 – IndexedDB。

其實在原生的 HTML5 中本來還有 localStorage 和 Web SQL Database 兩個選項，雖然 localStorage 的支援度最廣，使用上也最簡單，但是不適合儲存或操作比較複雜的資料，而 Web SQL Database 也已經被 W3C 在 2010年十一月的會議中所捨棄，因此 IndexedDB 自然而然的成為 Firefox OS 最適合的人選（Mozilla 也有對 Database API 的取捨上提出一些看法[1]）。但因為 IndexedDB 仍是 working draft，整體而言在各平台的支援度並不高。這網頁[2]有各家瀏覽器對 indexedDB 的支援。所以在 Firefox OS 以外的地方使用 IndexedDB 可要先睜大眼睛檢查該平台是否支援嘍。

## 萬丈高樓平地起 – 建立及開啟 IndexedDB

想要使用 IndexedDB 的第一件事…當然是先建立它…喔，還有確定瀏覽器有支援它。這裡以筆者最常用的記帳系統來作個小範例：

    //先確定瀏覽器是否支援indexedDB
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    var accountData = [
        { title: "Food", price: "500", date:"2012/07/29", notes:"朋友聚餐吃太好..."},
        { title: "Transportation", price: "30", date:"2012/7/20"}
    ];
     
    var request = indexedDB.open("accountDB", 1);  
    request.onsuccess = function (evt) {
        // 將db暫存起來供以後操作
        db = request.result;                                                            
    };
     
    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
    };
     
    request.onupgradeneeded = function (evt) {                  
        var objectStore = evt.currentTarget.result.createObjectStore("account", { keyPath: "id", autoIncrement: true });
     
        objectStore.createIndex("title", "title", { unique: false });
        objectStore.createIndex("price", "price", { unique: false });
        objectStore.createIndex("date", "date", { unique: false });
     
        accountData.forEach(objectStore.add);
    };

這裡簡單描述流程：我們先呼叫 indexedDB.open 來開啟一個名稱為 “accountDB”，版本編號為”1″的資料庫。若是資料庫未曾建立過，則會先執行 onupgradeneeded 的 callback ，再來才會執行 onsuccess。因此我們可以利用 onupgradeneeded 先做資料庫的初始化，以 createObjectStore 方法建立 account objectStore 來儲存我們需要的資料。針對 account 我們指定 id 這個 index為 keyPath。keyPath 不一定得是資料儲存前必須先設定的 index，這裡我們指定了 autoIncrement: true 表示 id 會隨著資料的增加而自動遞增。另外我們也指定了三個非唯一值的 index：title, price 和 data。如果今天我們拿不可能重複的統一發票作為 index，這裡的 unique 便為 true。要注意的是目前範例中所有 IndexedDB API 都是非同步運作 (Asynchronous mode)，也就是取得開啟資料庫的 request 之後，開啟的工作會排到另外一個執行緒而不影響原來執行緒的運算，結束後request result 才會由指定的 callback function 給使用者完成之後的處理。聽起來似乎是有點複雜，而且 W3C 文件上好像也有同步模式的 API (synchronous mode) 不是嗎？文件中雖有定義同步模式，但可惜的是目前所有瀏覽器平台都尚未支援。至少看在效率的份上，目前還是乖乖使用非同步模式的 API 吧。

## 聚散榮枯自有時 – 資料的讀寫刪除與更新

有了資料庫以後理所當然的對資料有讀寫和刪除更新的需求。當我們需要對資料庫下任何要求，必須先從 IDBDatabase 得到 transaction 後再取得 objectStore。先看一段新增資料的範例：

    var transaction = db.transaction("account", IDBTransaction.READ_WRITE);
    var objectStore = transaction.objectStore("account");                    
    var request = objectStore.add({ title: "beverage", price: "30", date:"2012/12/21" });
    request.onsuccess = function (evt) {
        // 資料儲存成功！                          
    };

transaction 的兩個參數分別為資料表名稱和資料操作權限。資料操作權限有三種：IDBTransaction.READ_ONLY, IDBTransaction.READ_WRITE和IDBTransaction.VERSION_UPDATE，通常只有前兩種操作會用到。而權限參數也可不下，預設為 READ_ONLY。除了 add，基本的 get 和 delete 方法自然也不可少：

    var transaction = db.transaction("account", IDBTransaction.READ_WRITE);
    var objectStore = transaction.objectStore("account");
    var getRequest = objectStore.get(1);
    getRequest.onsuccess = function(evt) {  
      alert("Title of ID =1 :" + getRequest.result.title) ;
    };
    var deleteRequest = objectStore.delete(2);
    deleteRequest.onsuccess = function(evt) {  
      // ID =2 的資料已經被刪除
    };

這個範例中我們以 id 擷取以及刪除資料，但是等等…我們只能用 account objectStore 的 key 來做操作？這似乎不是一件太有效率的事情，特別是我們常常需要知道花了多少錢喝飲料，或是這個月目前為止花了多少錢，難不成我們沒有 id 就無法完成其他的工作？別擔心，接下來就要介紹 objectStore 所提供的其他進階的方法來獲得我們想要的資料。

## 眾裡尋她千百回 – 如何有效的找到你想要得資料

就如同前述的例子，我們是否能用更直覺的方法調出 objectStore 中符合的資料呢？其實 objectStore 還有提供 coursor 來查詢的資料。假設我們想要得到所有 7/20 那天的花費：

    var transaction = db.transaction("account", IDBTransaction.READ_WRITE);
    var objectStore = transaction.objectStore("account");
    objectStore = objectStore.index("date");
     
    var request = objectStore.openCursor(IDBKeyRange.only("2012/07/20"),
                                         IDBCursor.NEXT);
    request.onsuccess = function(evt) {  
        var cursor = evt.target.result;  
        if (cursor) {  
            console.log("title : " + cursor.value.title + " ,price : " + cursor.value.price);
            cursor.continue();  
        }  
        else {  
            //查詢結束  
        }  
    };

openCursor 會回傳 cursor，其中帶有一筆資料，並非一次回傳所有資料。如果要調取其他符合的資料，可以用 continue 這個方法取得下一筆資料，成功後的 callback 依然是 request.onsuccess，如果資料已經全部取得，則 cursor 即為 null。openCursor 有兩個參數可設定，分別是用來提供查詢範圍的 IDBKeyRange 以及控制資料庫瀏覽方向的 IDBCursor。
如果當你想要查詢的日期不是只有7/20限定，IDBKeyRange 也有其他更彈性的設定。以下是 IDBKeyRange 所提供的其他條件：

    // 取得大於但不包括2012/07/20的所有資料：
    IDBKeyRange.lowerBound("2012/07/20", true);  
     
    // 取得小於且包括2012/07/20的所有資料：
    IDBKeyRange.upperBound("2012/07/20", false);  
     
    // 取得2012/06/20 ～ 2012/07/20，包括2012/06/20，但不包括2012/07/20的資料：
    IDBKeyRange.bound("2012/06/20", "2012/07/20", false, true);

我們也可不設定 IDBKeyRange 參數，這樣則會回傳可以瀏覽所有的資料的 cursor。
另外資料讀取的方向除了 IDBCursor.NEXT（順序），還有 IDBCursor.NEXT_NO_DUPLICATE（顺序不重複）、IDBCursor.PREV（倒序）、IDBCursor.PREV_NO_DUPLICATE（顺序不重複）三種，端看使用者是否需要按照順序回傳需要的資料。

## 總結
有這簡單的三步驟教學，相信各位 web app 的開發者對於 IndexedDB 應該都有一些初步的了解和基本操作的能力，如果對想要對 IndexedDB 有更進一步的了解，相信 MDN 上會有更多的文件可供參考，希望大家能夠擺脫以往 HTML framework 對於資料存取的限制，進而開發出更多更棒的應用喔。

---

[1]: https://hacks.mozilla.org/2010/06/beyond-html5-database-apis-and-the-road-to-indexeddb/
[2]: http://caniuse.com/#search=indexedDB