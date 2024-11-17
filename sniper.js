// ==UserScript==
// @name         Item Notifier
// @include      http://www.strrev.com/
// @namespace    http://www.strrev.com/
// @version      1.5
// @description  Notifies user when new items are available.
// @author       eternal45
// @match        *://www.strrev.com/*
// @icon         https://www.strrev.com/img/logo_R.svg
// @grant        none
// @updateURL    https://raw.githubusercontent.com/eternal-45/repo4tobi/main/sniper.js
// @downloadURL  https://raw.githubusercontent.com/eternal-45/repo4tobi/main/sniper.js
// ==/UserScript==

let itemid = 0; // ID of the item
let interval = 200; // checks every x millisecond
let token = "";


function getToken() {
  fetch("https://strrev.com/apisite/catalog/v1/catalog/items/details", {
    method: "POST",
  }).then((response) => {
    if (response.headers.get("x-csrf-token") == null) {
      maintenance = true;
    } else {
      maintenance = false;
      if (token != response.headers.get("x-csrf-token")) {
        token = response.headers.get("x-csrf-token");
        console.log("Your x-csrf token has been fetched! ", token);
      }
    }
  });
}
let expireLoop = setInterval(getToken, 1250);

if (!("Notification" in window)) {
  alert("This browser does not support desktop notifications.");
} else if (Notification.permission === "granted") {
  new Notification("Item notifier started!", {
    body: "You will now be notified when a new item drops.",
    icon: "https://strrev.com/img/logo_R.svg",
  });
} else if (Notification.permission !== "denied") {
  alert(
    "You will be prompted to accept notifications. Press yes or you won't be notified when a new item drops."
  );
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      new Notification("Item notifier started!", {
        body: "You will now be notified when a new item drops.",
        icon: "https://strrev.com/img/logo_R.svg",
      });
    }
  });
}

function notification(title, text, image, redirect) {
  if (Notification.permission === "granted") {
    const noti = new Notification(title, {
      body: text,
      icon: image,
    });
    if (redirect) {
      noti.onclick = (event) => {
        event.preventDefault();
        window.open(redirect);
        noti.close();
      };
    }
  } else if (Notification.permission !== "denied") {
    new Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        Notification(title, {
          body: text,
          icon: image,
        });
      }
    });
  }
}

function check() {
  fetch("https://strrev.com/apisite/catalog/v1/catalog/items/details", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json",
      "sec-ch-ua":
        '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-csrf-token": token,
    },
    referrer: "https://strrev.com/catalog/18486/Brighteyes-Top-Hat",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: '{"items":[{"itemType":"Asset","id":"'+itemid+'"}]}',
    method: "POST",
    mode: "cors",
    credentials: "include",
  })
    .then((p) => p.json())
    .then((pack) => {
      pack = pack.data[0];
      console.log(pack.saleCount);
      if (pack.saleCount == 9) {
        fetch(
          "https://strrev.com/apisite/economy/v1/purchases/products/" +
            pack.id,
          {
            headers: {
              accept: "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/json",
              "sec-ch-ua":
                '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-csrf-token": token,
            },
            referrer:
              "https://strrev.com/catalog/1140/Blue-eyed-Awesome-Face",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: JSON.stringify({
              assetId: pack.id,
              expectedCurrency: 1,
              expectedPrice: pack.price,
              expectedSellerId: 1,
              userAssetId: null,
            }),
            method: "POST",
            mode: "cors",
            credentials: "include",
            method: "POST",
          }
        ).then(() => {
          console.log("finish buying");
          buying = false;
          notification(
            "Item was bought!",
            pack.name +
              " was bought for " +
              pack.price +
              " Robux. (Click to view)",
            image,
            "https://strrev.com/catalog/" +
              pack.id +
              "/CLICK-TO-REVEAL-NAME"
          );
        });
      }
    });
}

let loop = setInterval(check, interval);
