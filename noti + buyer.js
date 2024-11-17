// tremblero#6055
// ECS item notifier

// REVAMPED 2023 edition
// Changes:
// script is a bit unstable but it works most of the time
// csrf token no longer has a chance to be nullified
// now auto-buys items!!!!!1!!11

let itemsLimit = 3; // how many pages should it check?
let interval = 200; // checks every x millisecond
let redirect = false; //confirm("Would you like to redirect as soon as a new item is found?");
let autoBuy = confirm("Would you like to buy it when it drops? [WIP]");

let category = prompt(`What category? (Collectibles, Featured, gear)
Blank = Collectibles`);

let maxPrice = Number(
  prompt("Max price? (Default: 2,500) Leave blank to set as default.")
);

let buying = false;
let removing = false;

if (maxPrice == "0") maxPrice = 2500;
if (category == "") category = "Collectibles";

// MAIN SCRIPT BELOW

itemsLimit *= 31;
if (!localStorage.getItem("Assets")) localStorage.setItem("Assets", "0");

let RanAssetsCheck = false;
let maintenance = false;
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

function forceRemove(id) {
  removing = true;
  localStorage.setItem(
    "Assets",
    localStorage.getItem("Assets").replace(id + "|", "")
  );
  console.log(id + " was removed");
  console.log(localStorage.getItem("Assets"));
  setTimeout(() => {
    removing = false;
  }, 100);
}

function switchCategory(cat) {
  // OMG!! estonianwood#8082 reference?? (CAT!!!)
  RanAssetsCheck = false;
  category = cat;
  console.log("category successfully changed to " + cat);
}

function changePageLimit(number) {
  RanAssetsCheck = false;
  itemsLimit = 31 * number;
  console.log("pages successfully changed to " + number * 31);
}

function check() {
  if (removing == false) {
    if (maintenance == false) {
      let newassets = "0|";
      fetch(
        "https://strrev.com/apisite/catalog/v1/search/items?category=" +
          category +
          "&limit=" +
          itemsLimit +
          "&sortType=0",
        {
          method: "GET",
          credentials: "include",
        }
      )
        .catch((error) => {
          console.log(error);
          clearInterval(loop);
        })
        .then((response) => response.json())
        .then((catalog) => {
          let catalogAssets = catalog.data;
          catalogAssets.forEach(function (asset) {
            newassets += "|" + asset.id;
            if (RanAssetsCheck == true) {
              let assets2 = localStorage.getItem("Assets").split("|");
              let found = false;
              for (let i = 0; i < assets2.length; i++) {
                if (Number(assets2[i]) == Number(asset.id)) {
                  found = true;
                }
              }
              if (!found && buying == false) {
                fetch(
                  "https://strrev.com/apisite/thumbnails/v1/assets?assetIds=" +
                    asset.id +
                    "&format=png&size=420x420",
                  {
                    headers: {
                      accept: "application/json, text/plain, */*",
                      "accept-language": "en-US,en;q=0.9",
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
                      "https://strrev.com/catalog/2171/Voltaires-Treasure-Chest-1",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: null,
                    method: "GET",
                    mode: "cors",
                    credentials: "include",
                  }
                )
                  .then((r) => r.json())
                  .then((icon) => {
                    let iconData = icon.data;
                    let image = "https://strrev.com/" + iconData[0].imageUrl;
                    notification(
                      "ITEM WENT ONSALE!!!",
                      "Click to redirect!",
                      image,
                      "https://strrev.com/catalog/" +
                        asset.id +
                        "/CLICK-TO-REVEAL-NAME"
                    );
                    notification(
                      "ITEM WENT ONSALE!!!",
                      "Click to redirect!",
                      image,
                      "https://strrev.com/catalog/" +
                        asset.id +
                        "/CLICK-TO-REVEAL-NAME"
                    );

                    if (autoBuy) {
                      // fetch item
                      buying = true;
                      console.log("sending fetch");
                      fetch(
                        "https://strrev.com/apisite/catalog/v1/catalog/items/details",
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
                            "https://strrev.com/catalog/2171/Voltaires-Treasure-Chest-1",
                          referrerPolicy: "strict-origin-when-cross-origin",
                          body:
                            '{"items":[{"itemType":"Asset","id":"' +
                            asset.id +
                            '"}]}',
                          method: "POST",
                          mode: "cors",
                          credentials: "include",
                        }
                      )
                        .then((r) => r.json())
                        .then((package) => {
                          // initiate buy
                          let data = package.data;
                          let asset = data[0];
                          console.log(asset);
                          if (asset.price <= maxPrice) {
                            if (asset.priceTickets == null) {
                              setTimeout(() => {
                                fetch(
                                  "https://strrev.com/apisite/economy/v1/purchases/products/" +
                                    asset.id,
                                  {
                                    headers: {
                                      accept:
                                        "application/json, text/plain, */*",
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
                                    referrerPolicy:
                                      "strict-origin-when-cross-origin",
                                    body: JSON.stringify({
                                      assetId: asset.id,
                                      expectedCurrency: 1,
                                      expectedPrice: asset.price,
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
                                    asset.name +
                                      " was bought for " +
                                      asset.price +
                                      " Robux. (Click to view)",
                                    image,
                                    "https://strrev.com/catalog/" +
                                      asset.id +
                                      "/CLICK-TO-REVEAL-NAME"
                                  );
                                });
                              }, 800);
                            } else {
                              setTimeout(() => {
                                fetch(
                                  "https://strrev.com/apisite/economy/v1/purchases/products/" +
                                    asset.id,
                                  {
                                    headers: {
                                      accept:
                                        "application/json, text/plain, */*",
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
                                    referrerPolicy:
                                      "strict-origin-when-cross-origin",
                                    body: JSON.stringify({
                                      assetId: asset.id,
                                      expectedCurrency: 2,
                                      expectedPrice: asset.priceTickets,
                                      expectedSellerId: 1,
                                      userAssetId: null,
                                    }),
                                    method: "POST",
                                    mode: "cors",
                                    credentials: "include",
                                    method: "POST",
                                  }
                                ).then(() => {
                                  buying = false;
                                  notification(
                                    "Item was bought!",
                                    asset.name +
                                      " was bought for " +
                                      asset.priceTickets +
                                      " tix. (Click to view)",
                                    image,
                                    "https://strrev.com/catalog/" +
                                      asset.id +
                                      "/CLICK-TO-REVEAL-NAME"
                                  );
                                });
                              }, 800);
                            }
                          } else {
                            buying = false;
                            notification(
                              "Item was too expensive to auto-buy",
                              "Click to redirect!",
                              "https://i.pinimg.com/originals/b9/42/82/b942828627ec29e4965251121985a5f1.jpg",
                              "https://strrev.com/catalog/" +
                                asset.id +
                                "/CLICK-TO-REVEAL-NAME"
                            );
                          }
                        });
                    }

                    if (redirect) {
                      location.href = `https://strrev.com/catalog/${asset.id}/CLICK-TO-REVEAL-NAME`;
                    }
                  });
              }
            }
          });
          RanAssetsCheck = true;
          localStorage.setItem("Assets", newassets);
        });
      console.log(
        "Searching... (checked " +
          itemsLimit +
          " items in the " +
          category +
          " category)"
      );
    } else {
      console.log("SITE UNDERGOING MAINTENANCE...");
    }
  } else {
    console.log("removing an asset..");
  }
}

let loop = setInterval(check, interval);
