/* ============================================================================
   menu-test.js —— POS 结构验证用的测试套餐
   ----------------------------------------------------------------------------
   只在网址带 ?test=1 时才会出现在 App 里，一般客人看不到。
   内容 = 超值四人套餐，但<只保留 POS 已经有的商品>，每个选项都附上现有的
   pluId，作为对接 ArmLoop 的第一个样板。这样贵司不必先新建商品就能直接搭建。ArmLoop 在 POS 建好之后，把套餐本身的 plu 填进下面的 "plu" 栏。

   对应文件：试点规格-超值四人套餐.html
   本档由 build-test-package.js 自动产生，请勿手改。
   选项：保留 38 项 · 剔除 3 项（POS 尚未建立）
   ============================================================================ */
window.SEASPICE_TEST = {
  "id": 99,
  "test": true,
  "cn": "【测试】四人套餐结构验证",
  "en": "[TEST] 4-Pax Structure Check",
  "price": 168,
  "pax": 4,
  "img": "assets/promo3.jpg",
  "time": "周一至周四 · 全天",
  "plu": "",
  "note": "POS 结构验证专用，非正式菜单项目；选项已限定为 POS 现有商品",
  "groups": [
    {
      "label": "锅底",
      "en": "Broth Base",
      "pick": 1,
      "opts": [
        {
          "n": "全辣",
          "en": "Spicy hotpot",
          "img": "assets/menu/0101.jpg",
          "desc": "Choose soup base first, then choose fish. One serving of fish is suitable for 1-2 people.",
          "plu": "0101",
          "_src": "alias:牛油（全辣）"
        },
        {
          "n": "原汤",
          "en": "None-spicy fish broth pot",
          "img": "assets/menu/0201.jpg",
          "desc": "Choose soup base first, then choose fish. One serving of fish is suitable for 1-2 people.",
          "plu": "0201",
          "_src": "same"
        }
      ]
    },
    {
      "label": "鱼类",
      "en": "Fish",
      "pick": 1,
      "opts": [
        {
          "n": "银鲈鱼",
          "en": "Silver Perch",
          "img": "assets/menu/1003.jpg",
          "desc": "Silky-smooth and succulent, with a rich, fatty aroma.",
          "plu": "1003",
          "_src": "same"
        },
        {
          "n": "盲曹",
          "en": "Mud Grouper",
          "img": "assets/menu/1002.jpg",
          "desc": "Delicately tender, with a fine texture.",
          "plu": "1002",
          "_src": "same"
        }
      ]
    },
    {
      "label": "菜品",
      "en": "Signature Dish",
      "pick": 1,
      "opts": [
        {
          "n": "香海虾滑",
          "en": "Shrimp Paste",
          "img": "assets/menu/0302.jpg",
          "desc": "Handmade fresh prawn paste. 100% prawns, no additives.",
          "plu": "0302",
          "_src": "same"
        },
        {
          "n": "秘制鱼丸",
          "en": "Fish Balls",
          "img": "assets/menu/0301.jpg",
          "desc": "Handmade fresh fish balls, tender and bouncy.",
          "plu": "0301",
          "_src": "same"
        },
        {
          "n": "手切鲜羊肉",
          "en": "Fresh Hand-cut Lamb",
          "img": "assets/menu/0323.jpg",
          "desc": "Fresh Lamb",
          "plu": "0323",
          "_src": "same"
        },
        {
          "n": "手切和牛三花趾",
          "en": "Hand-sliced beef",
          "img": "assets/menu/0324.jpg",
          "desc": "Fresh Beef",
          "plu": "0324",
          "_src": "same"
        }
      ]
    },
    {
      "label": "肉类",
      "en": "Meat Rolls",
      "pick": 1,
      "opts": [
        {
          "n": "肥牛卷",
          "en": "Wagyu Beef Roll",
          "img": "assets/menu/0303.jpg",
          "desc": "Thinly sliced beef belly, tender.",
          "plu": "0303",
          "_src": "same"
        },
        {
          "n": "羊肉卷",
          "en": "Sliced Lamb",
          "img": "assets/menu/0304.jpg",
          "desc": "",
          "plu": "0304",
          "_src": "same"
        },
        {
          "n": "鸭血",
          "en": "Duck Blood",
          "img": "assets/menu/0318.jpg",
          "desc": "",
          "plu": "0318",
          "_src": "same"
        },
        {
          "n": "午餐肉",
          "en": "Luncheon Meat",
          "img": "assets/menu/0317.jpg",
          "desc": "",
          "plu": "0317",
          "_src": "same"
        },
        {
          "n": "迷你广式香肠",
          "en": "Mini Cantonese Sausage",
          "img": "assets/menu/0319.jpg",
          "desc": "",
          "plu": "0319",
          "_src": "same"
        }
      ]
    },
    {
      "label": "内脏",
      "en": "Offal",
      "pick": 1,
      "opts": [
        {
          "n": "牛百叶",
          "en": "Beef Tripe",
          "img": "assets/menu/0322.jpg",
          "desc": "",
          "plu": "0322",
          "_src": "same"
        },
        {
          "n": "黄喉",
          "en": "Aorta",
          "img": "assets/menu/0311.jpg",
          "desc": "",
          "plu": "0311",
          "_src": "same"
        },
        {
          "n": "鸭舌",
          "en": "Duck Tongue",
          "img": "assets/menu/0310.jpg",
          "desc": "",
          "plu": "0310",
          "_src": "same"
        },
        {
          "n": "鸭掌",
          "en": "Duck Feet",
          "img": "assets/menu/0309.jpg",
          "desc": "",
          "plu": "0309",
          "_src": "same"
        },
        {
          "n": "火箭鱿鱼",
          "en": "Rocket-cut Squid",
          "img": "assets/menu/0331.jpg",
          "desc": "",
          "plu": "0331",
          "_src": "live"
        }
      ]
    },
    {
      "label": "丸类",
      "en": "Balls",
      "pick": 1,
      "opts": [
        {
          "n": "猪肚",
          "en": "Fresh Pork Tripe",
          "img": "assets/menu/0330.jpg",
          "desc": "",
          "plu": "0330",
          "_src": "live"
        },
        {
          "n": "鱼豆腐",
          "en": "Fish Tofu",
          "img": "assets/menu/0314.jpg",
          "desc": "",
          "plu": "0314",
          "_src": "same"
        },
        {
          "n": "蟹肉棒",
          "en": "Crab Sticks",
          "img": "assets/menu/0316.jpg",
          "desc": "",
          "plu": "0316",
          "_src": "same"
        },
        {
          "n": "花枝丸",
          "en": "Squid Ball",
          "img": "assets/menu/0313.jpg",
          "desc": "",
          "plu": "0313",
          "_src": "same"
        },
        {
          "n": "鹌鹑蛋",
          "en": "Quail Eggs",
          "img": "assets/menu/0315.jpg",
          "desc": "",
          "plu": "0315",
          "_src": "same"
        }
      ]
    },
    {
      "label": "蔬菜",
      "en": "Vegetables",
      "pick": 1,
      "opts": [
        {
          "n": "豆腐",
          "en": "Tofu",
          "img": "assets/menu/0423.jpg",
          "desc": "",
          "plu": "0423",
          "_src": "same"
        },
        {
          "n": "白萝卜",
          "en": "Raddish",
          "img": "assets/menu/0410.jpg",
          "desc": "",
          "plu": "0410",
          "_src": "same"
        },
        {
          "n": "冬瓜",
          "en": "Winter Melon",
          "img": "assets/menu/0411.jpg",
          "desc": "",
          "plu": "0411",
          "_src": "same"
        },
        {
          "n": "鲍鱼菇",
          "en": "Oyster Mushroom",
          "img": "assets/menu/0402.jpg",
          "desc": "",
          "plu": "0402",
          "_src": "same"
        },
        {
          "n": "金针菇",
          "en": "Enoki Mushroom",
          "img": "assets/menu/0401.jpg",
          "desc": "",
          "plu": "0401",
          "_src": "same"
        },
        {
          "n": "大白菜",
          "en": "Wombok",
          "img": "assets/menu/0417.jpg",
          "desc": "",
          "plu": "0417",
          "_src": "same"
        }
      ]
    },
    {
      "label": "主食",
      "en": "Staple",
      "pick": 1,
      "opts": [
        {
          "n": "红薯粉",
          "en": "Sweet Potato Noodles",
          "img": "assets/menu/0430.jpg",
          "desc": "",
          "plu": "0430",
          "_src": "live"
        },
        {
          "n": "土豆粉",
          "en": "Potato Noodles",
          "img": "assets/menu/0431.jpg",
          "desc": "Soft and chewy noodles made from potato starch.",
          "plu": "0431",
          "_src": "live"
        },
        {
          "n": "年糕",
          "en": "Rice Cake",
          "img": "assets/menu/0433.jpg",
          "desc": "",
          "plu": "0433",
          "_src": "same"
        },
        {
          "n": "土豆",
          "en": "Potato",
          "img": "assets/menu/0405.jpg",
          "desc": "",
          "plu": "0405",
          "_src": "same"
        },
        {
          "n": "甜玉米",
          "en": "Corn",
          "img": "assets/menu/0415.jpg",
          "desc": "",
          "plu": "0415",
          "_src": "same"
        },
        {
          "n": "白米饭（2碗）",
          "en": "Steamed Rice ×2",
          "img": "assets/menu/0509.jpg",
          "desc": "",
          "plu": "0509",
          "_src": "alias:米饭"
        }
      ]
    },
    {
      "label": "甜品",
      "en": "Dessert",
      "pick": 4,
      "opts": [
        {
          "n": "冰粉",
          "en": "Ice Jelly",
          "img": "assets/menu/0501.jpg",
          "desc": "Soft and slightly chewy jelly made from Sichuan ice powder, served \ncold with brown sugar syrup and toppings, refreshing and light. \n*Contains peanut and sesame",
          "plu": "0501",
          "_src": "alias:爽口冰粉"
        },
        {
          "n": "豆花",
          "en": "Tofu Pudding",
          "img": "assets/menu/0504.jpg",
          "desc": "Silky soft tofu pudding served sweet, topped with fragrant\n osmanthus flowers for a delicated floral aroma. \n*Contains Nuts",
          "plu": "0504",
          "_src": "alias:桂花冰豆花"
        },
        {
          "n": "凉虾",
          "en": "Sweet Rice Jelly",
          "img": "assets/menu/0502.jpg",
          "desc": "Soft, translucent jelly made from rice starch, served cold with brown sugar syrup, refreshing and cool. \n*Contains peanut and sesame",
          "plu": "0502",
          "_src": "same"
        }
      ]
    }
  ]
};
