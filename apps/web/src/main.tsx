import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Menu,
  Store,
  Boxes,
  Wallet,
  Truck,
  RefreshCw,
  Sun,
  Moon,
  UserRoundPlus,
} from "lucide-react";
import "./style.css";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Product = {
  id: string;
  name: string;
  amharic: string;
  category: string;
  price: number;
  inStock: boolean;
  minQty: number;
  unit: string;
  emoji: string;
  bg: string;
  note: string;
};

const PAGE_COPY: Partial<Record<LanguageCode, Record<string, string>>> = {
  en: {
    shop: "Shop",
    language: "Language",
    createAccount: "Create account",
    bag: "Bag",
    heroKicker: "THE WHOLESALE MARKETPLACE FOR ETHIOPIA",
    heroTitle: "Merkato, made easier to navigate.",
    heroBody:
      "Discover Addis Ababa’s wholesale markets, compare independent traders and order by the carton, sack or quintal. One clear link from buyer to business.",
    terrasCount: "terras to explore",
    directoryKicker: "The market, organized by terra",
    directoryTitle: "Find your corner",
    directoryEnd: "of Merkato.",
    howKicker: "A simpler way to source wholesale",
    howTitle: "From market discovery to a ready order.",
    howBody:
      "MerkatoLink helps retailers explore Addis Ababa’s wholesale market online, then contact a trader with a clear order request.",
    chooseTerra: "Choose a terra",
    chooseTerraBody:
      "Start with a market section such as Kimem, Shema, Somali, Termus or Minalesh.",
    findTrader: "Find a trader",
    findTraderBody:
      "Compare shop locations, verification badges and wholesale listings. Products show their selling unit and minimum order.",
    sendOrder: "Send your order",
    sendOrderBody:
      "Add quantities, choose pickup or delivery and select a payment method. The trader follows up to confirm the details.",
    storyKicker: "About our website",
    storyTitle: "Meet MerkatoLink, wholesale trade, connected.",
    storyBody:
      "MerkatoLink is an online wholesale marketplace designed around the way Addis Ababa’s Merkato is organized. Browse by terra, discover independent traders and request products by familiar wholesale units such as cartons, sacks and rolls.",
    newsTitle: "Merkato Daily",
    newsIntro: "A short, sourced business and market briefing for Ethiopia.",
    readStory: "Read the full story",
    marketNews: "Business news",
    demoOnly: "Fictional demo data only",
    wholesale: "Wholesale marketplace",
    explore: "Explore the marketplace",
    flowTerra: "Choose a market section",
    flowTrader: "Compare shops and goods",
    flowOrder: "Send quantities and delivery choice",
    newsCoffeeTitle:
      "Ethiopian coffee exports earn $878.5m in the first quarter",
    newsCoffee:
      "Export earnings rose 15% year on year, but remained below the quarter’s target. The report highlights continued demand from Saudi Arabia, Germany and China.",
    newsInflationTitle: "Annual inflation eased to 14.6% in October",
    newsInflation:
      "Food inflation moderated while non-food prices continued to rise. Retailers should check category costs and supplier quotes individually.",
    newsDhlTitle: "Ethiopia and DHL sign a coffee-export support deal",
    newsDhl:
      "The partnership will offer exporters training on logistics, customs and international trade under DHL’s GoTrade programme.",
    accountTitle: "Create a demo account",
    accountDisclosure:
      "This fictional profile is saved to the local demo file. It does not create a password, sign you in, or secure access to a real business account.",
    accountName: "Your name",
    accountPhone: "Ethiopian mobile number",
    accountLanguage: "Preferred language",
    createProfile: "Create fictional demo profile",
    bagTitle: "Your bag",
    bagEmpty: "Your bag is empty.",
    bagEmptyHelp: "Open a shop and add products by the unit they are sold in.",
    phoneLabel: "Phone number",
    delivery: "Delivery",
    payment: "Payment",
    address: "Delivery location",
    subtotal: "Subtotal",
    vat: "VAT",
    deliveryFee: "Delivery",
    total: "Total",
    continueCheckout: "Continue to checkout",
    checkoutTitle: "How should we complete this order?",
    checkoutHelp: "The trader confirms delivery or pickup by phone.",
    pickup: "Pick up at the shop",
    porter: "Porter (inside Merkato)",
    truck: "Truck delivery",
    cash: "Cash on delivery or pickup",
    transfer: "Bank transfer",
    mobileMoney: "Mobile money",
    credit: "Credit (the trader approves)",
    storyBody2:
      "The website brings market discovery and business tools into one place. Buyers can prepare clear order requests; traders can review incoming demo orders and inventory tools. Shops, people and prices here are fictional.",
    newsDisclaimer:
      "Independent publisher reporting; not MerkatoLink prices or financial advice. Links open the original articles.",
    howMore:
      "Navigation and selected prompts are translated. Product names and details supplied by merchants stay in their original language.",
    photoLabel: "A lane in Addis Ababa’s Merkato · 2008",
    photoCredit: "Photo",
    shopNav: "Shop",
    wholesaleListings: "Wholesale listings",
    shopsPrompt: "Pick a terra above, then open one of its shops.",
  },
  am: {
    shop: "ሱቅ",
    language: "ቋንቋ",
    createAccount: "መለያ ይፍጠሩ",
    bag: "ቦርሳ",
    heroKicker: "የኢትዮጵያ የጅምላ ገበያ",
    heroTitle: "መርካቶን ማሰስ ቀላል ሆኗል።",
    heroBody:
      "የአዲስ አበባን የጅምላ ገበያዎች ያግኙ፣ ነጋዴዎችን ያነጻጽሩ፣ እና በካርቶን፣ በከረጢት ወይም በኩንታል ይዘዙ።",
    terrasCount: "የገበያ ክፍሎችን ይመልከቱ",
    directoryKicker: "ገበያው በቴራ ተደራጅቷል",
    directoryTitle: "የሚፈልጉትን ያግኙ",
    directoryEnd: "የመርካቶ ገበያ",
    howKicker: "የጅምላ ግዢን ቀላል ማድረግ",
    howTitle: "ከገበያ ፍለጋ እስከ ትዕዛዝ።",
    howBody: "የአዲስ አበባን ገበያ በመስመር ላይ ይመልከቱ፤ ከዚያ ለነጋዴ ግልጽ የትዕዛዝ ጥያቄ ይላኩ።",
    chooseTerra: "ቴራ ይምረጡ",
    chooseTerraBody: "እንደ ቅመም፣ ሸማ ወይም ሌሎች የገበያ ክፍሎች ይጀምሩ።",
    findTrader: "ነጋዴ ያግኙ",
    findTraderBody: "የሱቅ ቦታዎችን፣ ማረጋገጫዎችን እና የጅምላ ዕቃዎችን ያነጻጽሩ።",
    sendOrder: "ትዕዛዝ ይላኩ",
    sendOrderBody: "ብዛት፣ መውሰጃ ወይም መላኪያ፣ እና የክፍያ ዘዴ ይምረጡ።",
    storyKicker: "ስለ ድረ ገጻችን",
    storyTitle: "MerkatoLink፣ የጅምላ ንግድ በአንድ ቦታ።",
    storyBody:
      "MerkatoLink በአዲስ አበባ መርካቶ የተደራጀ የጅምላ የመስመር ላይ ገበያ ነው። በቴራ ይፈልጉ፣ ነጋዴዎችን ያግኙ፣ እና በተለመዱ የጅምላ መለኪያዎች ይጠይቁ።",
    newsTitle: "የመርካቶ ዕለታዊ ዜና",
    newsIntro: "ለኢትዮጵያ ንግዶች አጭር የገበያ ዝመናዎች።",
    readStory: "ሙሉውን ዜና ያንብቡ",
    marketNews: "የንግድ ዜና",
    demoOnly: "ምናባዊ የሙከራ መረጃ ብቻ",
    wholesale: "የጅምላ ገበያ",
    explore: "ገበያውን ይመልከቱ",
    flowTerra: "የገበያ ክፍል ይምረጡ",
    flowTrader: "ሱቆችንና ዕቃዎችን ያነጻጽሩ",
    flowOrder: "ብዛትና መላኪያ ይምረጡ",
    newsCoffeeTitle: "የኢትዮጵያ ቡና ወደ ውጭ ሽያጭ በሩብ ዓመቱ 878.5 ሚሊዮን ዶላር አስገኘ",
    newsCoffee:
      "የወጪ ንግድ ገቢ ከዓምናው በ15% ጨምሯል፣ ግን ከዕቅዱ በታች ነው። ሪፖርቱ ከሳውዲ ዓረቢያ፣ ጀርመንና ቻይና የቀጠለ ፍላጎት ያመለክታል።",
    newsInflationTitle: "የጥቅምት ዓመታዊ የዋጋ ግሽበት ወደ 14.6% ወረደ",
    newsInflation:
      "የምግብ ዋጋ ግሽበት ቀንሷል፤ የምግብ ያልሆኑ ዋጋዎች ግን ጨምረዋል። ቸርቻሪዎች የእቃ ወጪና የአቅራቢ ዋጋን በተናጠል ማረጋገጥ አለባቸው።",
    newsDhlTitle: "ኢትዮጵያና DHL የቡና ወጪ ንግድ ድጋፍ ስምምነት ፈረሙ",
    newsDhl:
      "በDHL GoTrade ፕሮግራም ስር አጋርነቱ ለወጪ ንግድ አቅራቢዎች በሎጂስቲክስ፣ በጉምሩክና በዓለም ንግድ ስልጠና ይሰጣል።",
    accountTitle: "የሙከራ መለያ ይፍጠሩ",
    accountDisclosure:
      "ይህ ምናባዊ መገለጫ በአካባቢው የሙከራ ፋይል ውስጥ ይቀመጣል። የይለፍ ቃል አይፈጥርም፣ አያስገባዎትም እና የእውነተኛ ንግድ መለያን አይጠብቅም።",
    accountName: "ስምዎ",
    accountPhone: "የኢትዮጵያ ሞባይል ቁጥር",
    accountLanguage: "የሚመርጡት ቋንቋ",
    createProfile: "ምናባዊ መገለጫ ይፍጠሩ",
    bagTitle: "ቦርሳዎ",
    bagEmpty: "ቦርሳዎ ባዶ ነው።",
    bagEmptyHelp: "ሱቅ ይክፈቱና ምርቶችን በሚሸጡበት መለኪያ ይጨምሩ።",
    phoneLabel: "ስልክ ቁጥር",
    delivery: "መላኪያ",
    payment: "ክፍያ",
    address: "የመላኪያ ቦታ",
    subtotal: "ንዑስ ድምር",
    vat: "ተ.እ.ታ",
    deliveryFee: "መላኪያ",
    total: "ጠቅላላ",
    continueCheckout: "ወደ ክፍያ ይቀጥሉ",
    checkoutTitle: "ይህን ትዕዛዝ እንዴት እናጠናቅቅ?",
    checkoutHelp: "ነጋዴው መላኪያውን ወይም መውሰጃውን በስልክ ያረጋግጣል።",
    pickup: "በሱቅ ይውሰዱ",
    porter: "ተሸካሚ (በመርካቶ ውስጥ)",
    truck: "በመኪና ማድረስ",
    cash: "በመላኪያ/መውሰጃ ጊዜ በጥሬ ገንዘብ",
    transfer: "ባንክ ማስተላለፍ",
    mobileMoney: "የሞባይል ገንዘብ",
    credit: "ብድር (ነጋዴው ሲፈቅድ)",
    storyBody2:
      "ድረ ገጹ የገበያ ፍለጋንና የንግድ መሣሪያዎችን በአንድ ቦታ ያመጣል። ገዢዎች ግልጽ የትዕዛዝ ጥያቄ ያዘጋጃሉ፤ ነጋዴዎች የሙከራ ትዕዛዞችንና የእቃ ክምችት መሣሪያዎችን ይመለከታሉ። ሱቆች፣ ሰዎችና ዋጋዎች ምናባዊ ናቸው።",
    newsDisclaimer:
      "ይህ ከMerkatoLink ውጭ የታተመ ዘገባ ነው፤ የMerkatoLink ዋጋ ወይም የፋይናንስ ምክር አይደለም። አገናኞቹ ወደ ዋናው ዘገባ ይወስዳሉ።",
    howMore:
      "የዳሰሳ እና የተመረጡ መመሪያዎች ተተርጉመዋል። የምርት ስሞችና በነጋዴዎች የተጻፉ መረጃዎች በዋናው ቋንቋቸው ይቀራሉ።",
    photoLabel: "በአዲስ አበባ መርካቶ ያለ መንገድ · 2008",
    photoCredit: "ፎቶ",
    shopNav: "ሱቅ",
    wholesaleListings: "የጅምላ ምርቶች",
    shopsPrompt: "ከላይ ቴራ ይምረጡ፣ ከዚያ አንዱን ሱቅ ይክፈቱ።",
  },
  ti: {
    shop: "ድኳን",
    language: "ቋንቋ",
    createAccount: "ሕሳብ ፍጠር",
    bag: "ዓረግ",
    heroKicker: "ናይ ኢትዮጵያ ዕዳጋ ጅምላ",
    heroTitle: "መርካቶ ምድህሳስ ቀሊል ኮይኑ።",
    heroBody: "ናይ ኣዲስ ኣበባ ዕዳጋታት ጅምላ ዳህስሱ፣ ነጋዶ ኣነጻጽሩ፣ ብካርቶን፣ ከረጢት ወይ ኩንታል ኣዝዙ።",
    terrasCount: "ክፍልታት ዕዳጋ ዳህስስ",
    directoryKicker: "ዕዳጋ ብቴራ ተወዲቡ",
    directoryTitle: "ዝደለኹምዎ ርኸቡ",
    directoryEnd: "ናይ መርካቶ።",
    howKicker: "ግዢ ጅምላ ቀሊል ምግባር",
    howTitle: "ካብ ዕዳጋ ምድላይ ክሳብ ትእዛዝ።",
    howBody: "ንዕዳጋ ኣዲስ ኣበባ ብኢንተርነት ዳህስሱ፤ ድሕሪኡ ንነጋዳይ ንጹር ሕቶ ትእዛዝ ስደዱ።",
    chooseTerra: "ቴራ ምረጹ",
    chooseTerraBody: "ከም ቅመማት፣ ሸማ ወይ ካልእ ክፍሊ ዕዳጋ ጀምሩ።",
    findTrader: "ነጋዳይ ርኸቡ",
    findTraderBody: "ቦታ ድኳን፣ ምልክት ምርግጋጽን ኣቕሑን ኣነጻጽሩ።",
    sendOrder: "ትእዛዝ ስደዱ",
    sendOrderBody: "ብዝሒ፣ ምውሳድ ወይ ምብጻሕ፣ ከምኡውን ኣገባብ ክፍሊት ምረጹ።",
    storyKicker: "ብዛዕባ ወብሳይትና",
    storyTitle: "MerkatoLink፣ ንግዲ ጅምላ ኣብ ሓደ ቦታ።",
    storyBody:
      "MerkatoLink ኣብ ኣዲስ ኣበባ መርካቶ ዝተወደበ ናይ ኢንተርነት ዕዳጋ ጅምላ እዩ። ብቴራ ድለዩ፣ ነጋዶ ርኸቡ፣ ብልሙድ መለክዒ ጅምላ ሕተቱ።",
    newsTitle: "ዕለታዊ ዜና መርካቶ",
    newsIntro: "ንኢትዮጵያውያን ንግዲታት ሓጸርቲ ሓበሬታታት ዕዳጋ።",
    readStory: "ሙሉእ ዜና ኣንብቡ",
    marketNews: "ዜና ንግዲ",
    demoOnly: "ምናባዊ ናይ ሙከራ ዳታ ጥራይ",
    wholesale: "ዕዳጋ ጅምላ",
    explore: "ዕዳጋ ዳህስስ",
    flowTerra: "ክፍሊ ዕዳጋ ምረጹ",
    flowTrader: "ድኳናትን ኣቕሑን ኣነጻጽሩ",
    flowOrder: "ብዝሒን ምብጻሕን ስደዱ",
    newsCoffeeTitle: "ወጻኢ ሽያጥ ቡን ኢትዮጵያ ኣብ ቀዳማይ ርብዒ 878.5 ሚልዮን ዶላር ኣምጺኡ",
    newsCoffee:
      "ኣታዊ ወጻኢ ንግዲ ብ15% ዓመታዊ ወሲኹ፣ ግን ካብ ዕላማ ትሑት እዩ። ሪፖርቱ ካብ ስዑዲ ዓረብ፣ ጀርመንን ቻይናን ዝቕጽል ድሌት የርኢ።",
    newsInflationTitle: "ዓመታዊ ውሕጅ ዋጋታት ጥቅምቲ ናብ 14.6% ወሪዱ",
    newsInflation:
      "ውሕጅ ዋጋ መግቢ ቀኒሱ፤ ዋጋ ካልኦት ኣቑሑ ግን ወሲኹ። ኣከፋፈልቲ ወጻኢ ኣቑሑን ዋጋ ኣቕረብትን ብተናጸል ይረጋግጹ።",
    newsDhlTitle: "ኢትዮጵያን DHLን ንወጻኢ ሽያጥ ቡን ዝምልከት ስምምዕ ኣኽቲሞም",
    newsDhl:
      "ኣብ ትሕቲ DHL GoTrade፣ እቲ ሽርክነት ንሰደድቲ ቡን ብሎጂስቲክስ፣ ጉምሩክን ኣህጉራዊ ንግድን ስልጠና ይህብ።",
    accountTitle: "ናይ ሙከራ ሕሳብ ፍጠር",
    accountDisclosure:
      "እዚ ምናባዊ ፕሮፋይል ኣብ ናይ ሙከራ ፋይል ይቕመጥ። ምስጢራዊ ቃል ኣይፈጥርን፣ ኣየእትወካን እዩ፣ ናይ እውነት ንግዲ ሕሳብ ኣይሕሉን።",
    accountName: "ስምካ",
    accountPhone: "ናይ ኢትዮጵያ ሞባይል ቁጽሪ",
    accountLanguage: "ዝመርጽዎ ቋንቋ",
    createProfile: "ምናባዊ ፕሮፋይል ፍጠር",
    storyBody2:
      "ወብሳይት ምድላይ ዕዳጋን ናይ ንግዲ መሳርሒታትን ኣብ ሓደ ቦታ የራኽብ። ገዛእቲ ንጹር ሕቶ ትእዛዝ የዳልዉ፤ ነጋዶ ናይ ሙከራ ትእዛዝን ናይ ኣቑሑ መሳርሒታትን ይርእዩ። ድኳናት፣ ሰባትን ዋጋታትን ምናባዊ እዮም።",
    newsDisclaimer:
      "እዚ ካብ ናጻ ኣሕተምቲ ዝመጸ ዜና እዩ፤ ዋጋ ወይ ምኽሪ ፋይናንስ MerkatoLink ኣይኮነን። ሊንክ ናብ መበገሲ ዜና ይወስድ።",
    howMore:
      "መርገጺ ኣቕጣጫን ዝተመርጹ ምልክታትን ተተርጒሞም ኣለዉ። ስማት ኣቑሑን ብነጋዶ ዝተወሰኸ ዝርዝርን ኣብ ቋንቋኦም ይቕጽሉ።",
    photoLabel: "ኣብ መርካቶ ኣዲስ ኣበባ ዝርከብ መንገዲ · 2008",
    photoCredit: "ስእሊ",
    shopNav: "ድኳን",
    wholesaleListings: "ዝርዝር ጅምላ",
    shopsPrompt: "ኣብ ላዕሊ ቴራ ምረጹ፣ ድሕሪኡ ሓደ ድኳን ክፈቱ።",
    bagTitle: "ናይ ዓረግካ",
    bagEmpty: "ዓረግካ ባዶ እዩ።",
    bagEmptyHelp: "ድኳን ክፈቱ እሞ ኣቑሑ ብመሸጢ መለክዒኦም ወስኹ።",
    phoneLabel: "ቁጽሪ ስልኪ",
    delivery: "ምብጻሕ",
    payment: "ክፍሊት",
    address: "ቦታ ምብጻሕ",
    subtotal: "ንኡስ ድምር",
    vat: "ተ.እ.ታ",
    deliveryFee: "ምብጻሕ",
    total: "ጠቕላላ",
    continueCheckout: "ናብ ክፍሊት ቀጽል",
    checkoutTitle: "ነዚ ትእዛዝ ብኸመይ ንፈጽሞ?",
    checkoutHelp: "ነጋዳይ ኣብ ስልኪ እቲ ምብጻሕ ወይ ምውሳድ የረጋግጽ።",
    pickup: "ኣብ ድኳን ውሰዱ",
    porter: "ተሸካሚ (ኣብ መርካቶ)",
    truck: "ብመኪና ምብጻሕ",
    cash: "ኣብ ምብጻሕ/ምውሳድ ብጥረ ገንዘብ",
    transfer: "ናይ ባንክ ምትሕልላፍ",
    mobileMoney: "ሞባይል ገንዘብ",
    credit: "ዕዳ (ነጋዳይ እንተፈቒዱ)",
  },
  om: {
    shop: "Daldala",
    language: "Afaan",
    createAccount: "Akkaawuntii uumi",
    bag: "Korojoo",
    heroKicker: "GABAA GURGURTAA JIMLAA ITOOPHIYA",
    heroTitle: "Merkato keessa deemuun salphate.",
    heroBody:
      "Gabaa jimlaa Finfinnee qoradhu, daldaltoota wal bira qabi, kaartoona, boorsaa ykn kuntalaan ajaji.",
    terrasCount: "Kutaa gabaa qoradhu",
    directoryKicker: "Gabaan terraan qindaa'e",
    directoryTitle: "Iddoo barbaaddu argadhu",
    directoryEnd: "kan Merkato.",
    howKicker: "Bittaa jimlaa salphisuuf",
    howTitle: "Gabaa qorachuu irraa hanga ajajaatti.",
    howBody:
      "Gabaa jimlaa Finfinnee toora interneetii irratti ilaali; achiis daldalaaf gaafii ajajaa ifa ta'e ergi.",
    chooseTerra: "Terra filadhu",
    chooseTerraBody:
      "Kutaa gabaa kan akka Kimem, Shema ykn kan biraa irraa jalqabi.",
    findTrader: "Daldalaa barbaadi",
    findTraderBody:
      "Iddoo dukaanaa, mallattoo mirkaneessaa fi meeshaalee jimlaa wal bira qabi.",
    sendOrder: "Ajaja ergi",
    sendOrderBody:
      "Baay'ina, fudhachuu ykn geejjiba, akkasumas mala kaffaltii filadhu.",
    storyKicker: "Waa'ee marsariitichaa",
    storyTitle: "MerkatoLink, daldala jimlaa bakka tokkotti.",
    storyBody:
      "MerkatoLink gabaa jimlaa toora interneetii kan akkaataa Merkato Finfinnee irratti hundaa'eedha. Terraan barbaadi, daldaltoota argadhu, safartuuwwan jimlaa beekamoo ta'aniin gaafadhu.",
    newsTitle: "Oduu Merkato Guyyaa",
    newsIntro: "Oduu gabaa gabaabaa daldala Itoophiyaatiif.",
    readStory: "Oduu guutuu dubbisi",
    marketNews: "Oduu gabaa",
    demoOnly: "Daataa yaalii sobaa qofa",
    newsCoffeeTitle:
      "Buna Itoophiyaa ji'a jalqaba keessatti doolaara miiliyoona 878.5 galmeesse",
    newsCoffee:
      "Galiin al-ergii waggaa waggaatti 15% dabale, garuu galma yeroo sanaa hin geenye. Gabaasni gaafii itti fufaa Sa'uudii Arabiyaa, Jarmanii fi Chaayinaa irraa jiru ibsa.",
    newsInflationTitle:
      "Qaala'iinsi jireenyaa waggaa Onkoloolessa keessatti 14.6%tti gadi bu'e",
    newsInflation:
      "Qaala'iinsi nyaataa laafeera; gatiin meeshaalee nyaata hin taane garuu ol ka'eera. Daldaltoonni baasii gosa oomishaa fi gatii dhiyeessitootaa adda addaan haa mirkaneessan.",
    newsDhlTitle:
      "Itoophiyaa fi DHL waliigaltee deeggarsa al-ergii buna mallatteessan",
    newsDhl:
      "Sagantaan DHL GoTrade daldaltoota al-ergiif loojistikii, gumurukaa fi daldala idil-addunyaa irratti leenjii kenna.",
    newsDisclaimer:
      "Oduun kun kan maxxansitoota walabaati; gatii MerkatoLink ykn gorsa faayinaansii miti. Hidhattoonni barruu maddaatti si geessu.",
    howMore:
      "Qajeelfamni fi barruun filataman hiikamaniiru. Maqaan oomishaa fi ibsi daldaltoonni kennan afaan isaanii irratti hafa.",
    photoLabel: "Daandii Merkato Finfinnee keessaa · 2008",
    photoCredit: "Suuraa",
    shopNav: "Daldala",
    wholesaleListings: "Tarree gurgurtaa jimlaa",
    shopsPrompt: "Terra armaan olii filadhu; achiis dukkaana tokko bani.",
    storyBody2:
      "Marsariitichi sakatta'a gabaa fi meeshaalee daldalaa bakka tokkotti qaba. Bittoonni ajaja ifa ta'e qopheessu; daldaltoonnis ajaja yaalii fi meeshaalee kuusaa ilaalu. Dukkaana, namoonni fi gatiin hundi yaalii sobaa dha.",
    bagTitle: "Korojoo kee",
    bagEmpty: "Korojoon kee duwwaadha.",
    bagEmptyHelp:
      "Dukkaana baniitii oomisha safartuu ittiin gurguramuun itti dabali.",
    phoneLabel: "Lakkoofsa bilbilaa",
    delivery: "Geejjiba",
    payment: "Kaffaltii",
    address: "Bakka geessuu",
    subtotal: "Ida'ama xiqqaa",
    vat: "VAT",
    deliveryFee: "Geejjiba",
    total: "Ida'ama",
    continueCheckout: "Gara mirkaneessa ajajaatti ce'i",
    checkoutTitle: "Ajaja kana akkamitti xumurna?",
    checkoutHelp: "Daldalaan bilbilaan geejjiba ykn fudhachuu ni mirkaneessa.",
    pickup: "Dukkaana irraa fudhadhu",
    porter: "Baattuu (Merkato keessatti)",
    truck: "Konkolaataadhaan geessuu",
    cash: "Yeroo geessan ykn fudhatan maallaqa harkaa",
    transfer: "Baankii irratti dabarsuu",
    mobileMoney: "Maallaqa moobaayilaa",
    credit: "Liqii (daldalaan yoo hayyame)",
    accountTitle: "Akkaawuntii yaalii uumi",
    accountDisclosure:
      "Akaakuun yaalii kun faayila yaalii kompiitara kanaa keessatti kuufama. Jecha icciitii hin uumu; seensisa hin go'u; akkaawuntii daldalaa dhugaa hin eegu.",
    accountName: "Maqaa kee",
    accountPhone: "Lakkoofsa moobaayila Itoophiyaa",
    accountLanguage: "Afaan filatame",
    createProfile: "Piroofaayila yaalii uumi",
  },
  so: {
    shop: "Dukaan",
    language: "Luqad",
    createAccount: "Akoon samee",
    bag: "Boorsada",
    heroKicker: "SUUQA JUMLO EE ITOOBIYA",
    heroTitle: "Sahaminta Merkato way fududaatay.",
    heroBody:
      "Sahami suuqyada jumlada Addis Ababa, isbarbar dhig ganacsatada, kuna dalbo kartoon, jawaan ama quintal.",
    terrasCount: "Sahami qaybaha suuqa",
    directoryKicker: "Suuqa oo terra loo habeeyey",
    directoryTitle: "Hel qaybta aad rabto",
    directoryEnd: "ee Merkato.",
    howKicker: "Hab fudud oo jumlo lagu gato",
    howTitle: "Sahaminta suuqa ilaa dalab diyaar ah.",
    howBody:
      "Sahami suuqa jumlada Addis Ababa online; dabadeed ganacsade u dir codsi dalab oo cad.",
    chooseTerra: "Dooro terra",
    chooseTerraBody: "Ka bilow qaybaha suuqa sida Kimem, Shema ama kuwo kale.",
    findTrader: "Hel ganacsade",
    findTraderBody:
      "Isbarbar dhig goobaha dukaamada, xaqiijinta iyo alaabta jumlada.",
    sendOrder: "Dir dalabka",
    sendOrderBody:
      "Dooro tirada, qaadasho ama gaarsiin, iyo habka lacag bixinta.",
    storyKicker: "Ku saabsan mareegteena",
    storyTitle: "MerkatoLink, ganacsiga jumlada oo isku xiran.",
    storyBody:
      "MerkatoLink waa suuq jumlo oo online ah oo loo habeeyey sida Merkato ee Addis Ababa. Ku baadh terra, hel ganacsato madax-bannaan, kuna codso cabbirrada jumlada ee caanka ah.",
    newsTitle: "Wararka Maalinlaha Merkato",
    newsIntro: "Warar suuq oo kooban oo loogu talagalay ganacsiyada Itoobiya.",
    readStory: "Akhri warbixinta",
    marketNews: "Wararka ganacsiga",
    demoOnly: "Xog tijaabo oo mala-awaal ah oo keliya",
    bagTitle: "Boorsadaada",
    bagEmpty: "Boorsadaadu way madhan tahay.",
    bagEmptyHelp: "Fur dukaan oo alaabta ku dar cabbirka lagu iibiyo.",
    phoneLabel: "Lambarka telefoonka",
    delivery: "Gaarsiin",
    payment: "Lacag-bixin",
    address: "Goobta gaarsiinta",
    subtotal: "Wadarta hoose",
    vat: "VAT",
    deliveryFee: "Gaarsiin",
    total: "Wadarta",
    continueCheckout: "U gudub xaqiijinta dalabka",
    checkoutTitle: "Sidee loo dhammaystiraa dalabkan?",
    checkoutHelp:
      "Ganacsaduhu telefoon ayuu ku xaqiijinayaa gaarsiinta ama qaadashada.",
    pickup: "Ka qaado dukaanka",
    porter: "Xamaali (gudaha Merkato)",
    truck: "Gaarsiin gaari xamuul",
    cash: "Lacag caddaan ah marka la gaarsiiyo ama la qaato",
    transfer: "Lacag bangi ku dir",
    mobileMoney: "Lacagta moobilka",
    credit: "Deyn (ganacsaduhu ha oggolaado)",
    storyBody2:
      "Mareegtu waxay hal meel isugu keentaa sahminta suuqa iyo qalabka ganacsiga. Iibsadayaashu waxay diyaarin karaan dalab cad; ganacsataduna waxay eegi karaan dalabyada tijaabada iyo agabka kaydka. Dukaamada, dadka iyo qiimayaashu waa mala-awaal.",
    wholesale: "Suuqa jumlada",
    explore: "Sahami suuqa",
    flowTerra: "Dooro qaybta suuqa",
    flowTrader: "Isbarbar dhig dukaamada iyo alaabta",
    flowOrder: "Dir tirada iyo doorashada gaarsiinta",
    newsCoffeeTitle:
      "Dhoofinta bunka Itoobiya waxay rubuca koowaad keentay $878.5 milyan",
    newsCoffee:
      "Dakhliga dhoofintu wuxuu kordhay 15% sanadkii, balse kama gaarin yoolkii rubuca. Warbixintu waxay xustay dalab ka imanaya Sacuudiga, Jarmalka iyo Shiinaha.",
    newsInflationTitle:
      "Sicir-bararka sannadlaha ah wuxuu Oktoobar u dhacay 14.6%",
    newsInflation:
      "Sicir-bararka cuntadu wuu yaraaday halka qiimaha aan cuntada ahayn kor u kacay. Tafaariiqleyaashu ha hubiyaan kharashka qayb kasta iyo qiimaha alaab-qeybiyeyaasha.",
    newsDhlTitle:
      "Itoobiya iyo DHL waxay saxiixeen heshiis taageeraya dhoofinta bunka",
    newsDhl:
      "Barnaamijka DHL GoTrade wuxuu dhoofiyeyaasha siin doonaa tababar ku saabsan saadka, kastamyada iyo ganacsiga caalamiga ah.",
    accountTitle: "Samee akoon tijaabo ah",
    accountDisclosure:
      "Aqoonsigan mala-awaalka ah waxaa lagu kaydiyaa faylka tijaabada ee kombiyuutarka. Ma abuuro erey-sir, kuma gelinayo nidaam, mana sugo akoon ganacsi oo dhab ah.",
    accountName: "Magacaaga",
    accountPhone: "Lambarka moobilka Itoobiya",
    accountLanguage: "Luqadda aad doorbidayso",
    createProfile: "Samee aqoonsi tijaabo ah",
    newsDisclaimer:
      "Warbixin ka timid warbaahin madax-bannaan; ma aha qiimaha MerkatoLink ama talo maaliyadeed. Xiriiriyayaashu waxay furayaan maqaalka asalka ah.",
    howMore:
      "Qaybaha hagidda iyo qoraallada qaar waa la turjumay. Magacyada alaabta iyo faahfaahinta ganacsatadu ku daraan waxay ku sii jiraan luqaddoodii asalka ahayd.",
    photoLabel: "Waddo ku taal Merkato ee Addis Ababa · 2008",
    photoCredit: "Sawir",
    shopNav: "Dukaan",
    wholesaleListings: "Alaabta jumlada",
    shopsPrompt: "Ka dooro terra kore, dabadeed fur dukaan ka mid ah.",
  },
};

type Terra = {
  id: number;
  name: string;
  name_am: string | null;
  description: string;
  icon: string;
  trader_count: number;
};

type Trader = {
  id: string;
  terra_id: number;
  name: string;
  shop_no: string;
  landmark: string;
  verified: boolean;
  vat_registered: boolean;
  primary_color: string | null;
  tagline: string | null;
};

type CatalogRow = {
  id: string;
  name: string;
  name_am: string | null;
  category: string;
  unit_name: string;
  base_qty: number;
  min_order_qty: number;
  retail_price: number | string;
  in_stock: boolean;
};

type CartLine = { product: Product; qty: number };
type Cart = { trader: Trader | null; lines: Record<string, CartLine> };

type DeliveryType = "pickup" | "porter" | "truck";
type PaymentTerms = "cash" | "transfer" | "mobile_money" | "credit";
type LoadState = "idle" | "loading" | "ready" | "error";
type Placed = { reference: string; saved: boolean; total: number };
type DemoOrder = {
  invoice_no: string;
  buyer_name: string;
  total: number;
  status: "new" | "confirmed" | "delivered" | "cancelled";
  items: { id: string; quantity: number }[];
};
type LanguageCode =
  "en" | "am" | "ti" | "om" | "so" | "aa" | "sid" | "wal" | "gur";
const LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: "en", name: "English" },
  { code: "am", name: "Amharic · አማርኛ" },
  { code: "ti", name: "Tigrinya · ትግርኛ" },
  { code: "om", name: "Afaan Oromo" },
  { code: "so", name: "Somali · Soomaali" },
  { code: "aa", name: "Afaraf" },
  { code: "sid", name: "Sidaamu Afoo" },
  { code: "wal", name: "Wolaytta" },
  { code: "gur", name: "Gurage" },
];
// Additional locale copy is applied to the full customer-facing experience.
const UI_COPY: Record<
  LanguageCode,
  {
    markets: string;
    how: string;
    about: string;
    browse: string;
    languageNote: string;
  }
> = {
  en: {
    markets: "Explore markets",
    how: "How it works",
    about: "About",
    browse: "Explore the marketplace",
    languageNote: "",
  },
  am: {
    markets: "ገበያዎችን ይመልከቱ",
    how: "እንዴት ይሰራል",
    about: "ስለ እኛ",
    browse: "ገበያውን ይመልከቱ",
    languageNote: "የምርት እና የነጋዴ መረጃ በእንግሊዝኛ ሊታይ ይችላል።",
  },
  ti: {
    markets: "ዕዳጋታት ዳህስስ",
    how: "ብኸመይ ይሰርሕ",
    about: "ብዛዕባና",
    browse: "ነቲ ዕዳጋ ዳህስስ",
    languageNote: "ናይ ኣቕሑን ነጋዶን ሓበሬታ ብእንግሊዝኛ ክርአ ይኽእል።",
  },
  om: {
    markets: "Gabaa qoradhu",
    how: "Akkaataa itti hojjetu",
    about: "Waa'ee keenya",
    browse: "Gabaa qoradhu",
    languageNote:
      "Odeeffannoon oomishaa fi daldalaa tokko tokko Afaan Ingiliziitiin mul'achuu danda'a.",
  },
  so: {
    markets: "Baadh suuqa",
    how: "Sida ay u shaqayso",
    about: "Nagu saabsan",
    browse: "Suuqa baadh",
    languageNote:
      "Qaar ka mid ah xogta alaabta iyo ganacsatada waxay ku jiri kartaa Ingiriisi.",
  },
  aa: {
    markets: "Suuqit gexa",
    how: "Maqan abta",
    about: "Ninni ayti",
    browse: "Suuqit gexa",
    languageNote:
      "Translation preview: some page sections, checkout labels and trader-provided content are still in English.",
  },
  sid: {
    markets: "Gibira la'no",
    how: "Hakki nooshshi",
    about: "Ninkera",
    browse: "Gibira la'no",
    languageNote:
      "Translation preview: some page sections, checkout labels and trader-provided content are still in English.",
  },
  wal: {
    markets: "Giyaara be7a",
    how: "Oothiya mala",
    about: "Nu gishsha",
    browse: "Giyaara be7a",
    languageNote:
      "Translation preview: some page sections, checkout labels and trader-provided content are still in English.",
  },
  gur: {
    markets: "ገበያዎችን ይመልከቱ",
    how: "እንዴት ይሰራል",
    about: "ስለ እኛ",
    browse: "ገበያውን ይመልከቱ",
    languageNote:
      "Translation preview: some page sections, checkout labels and trader-provided content are still in English.",
  },
};

/* ------------------------------------------------------------------ */
/* Constants and helpers                                               */
/* ------------------------------------------------------------------ */

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:4000";

const VAT_RATE = 0.15;
// Demo delivery fees. They match the fees used in seed.sql.
const DELIVERY_FEES: Record<DeliveryType, number> = {
  pickup: 0,
  porter: 45,
  truck: 180,
};
const DELIVERY_LABELS: Record<DeliveryType, string> = {
  pickup: "Pick up at the shop",
  porter: "Porter (inside Merkato)",
  truck: "Truck delivery",
};
const PAYMENT_LABELS: Record<PaymentTerms, string> = {
  cash: "Cash on delivery or pickup",
  transfer: "Bank transfer",
  mobile_money: "Mobile money",
  credit: "Credit (the trader approves)",
};

const TERRA_TONE: Record<string, string> = {
  Shema: "t-shema",
  Kimem: "t-kimem",
  Somali: "t-somali",
  Termus: "t-termus",
  Minalesh: "t-mina",
};

const TILE_BACKGROUNDS = ["sand", "rose", "sage", "clay", "cream", "gold"];

// Rate Shock demo: the latest rate in seed.sql is about 147.6.
const BASE_RATE = 147.6;
const RATE_SHOCK_ITEMS = [
  { name: "Brake Pad Set", baseMargin: 30, target: 25 },
  { name: "Wheel Bearing", baseMargin: 33, target: 28 },
  { name: "Vacuum Flask", baseMargin: 29, target: 24 },
];

const SAMPLE_STATS = [
  ["Sales this month", "ETB 284,650", "Up 12.8%"],
  ["Orders", "1,284", "Up 8.2%"],
  ["Average order", "ETB 2,218", "Up 2.4%"],
  ["Needs a restock", "6", "Check stock"],
] as const;
const SAMPLE_ORDERS = [
  ["#2481", "Abebe B.", "4 items", "ETB 4,520", "New"],
  ["#2480", "Sara T.", "2 items", "ETB 1,780", "Confirmed"],
  ["#2479", "Dawit A.", "7 items", "ETB 12,340", "Delivered"],
  ["#2478", "Mimi G.", "3 items", "ETB 2,890", "Delivered"],
] as const;
const SAMPLE_RESTOCK = [
  ["⚙️", "Wheel Bearing", "6 left"],
  ["🫙", "Vacuum Flask", "9 left"],
  ["🧵", "Cotton Shema Roll", "11 left"],
  ["🌶️", "Berbere Spice Sack", "14 left"],
] as const;

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const birr = (n: number) => "ETB " + numberFormat.format(n);
const round2 = (n: number) => Math.round(n * 100) / 100;

function emojiFor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("spare")) return "⚙️";
  if (c.includes("textile")) return "🧵";
  if (c.includes("bottle") || c.includes("container")) return "🫙";
  if (c.includes("spice")) return "🌶️";
  if (c.includes("grain") || c.includes("staple")) return "🌾";
  if (c.includes("house")) return "🏠";
  return "📦";
}

function mapCatalog(rows: CatalogRow[]): Product[] {
  return rows.map((item, index) => ({
    id: String(item.id),
    name: item.name,
    amharic: item.name_am ?? "",
    category: item.category,
    price: Number(item.retail_price),
    inStock: item.in_stock,
    minQty: Math.max(1, Number(item.min_order_qty) || 1),
    unit:
      item.base_qty > 1
        ? `${item.unit_name} of ${item.base_qty}`
        : item.unit_name,
    emoji: emojiFor(item.category),
    bg: TILE_BACKGROUNDS[index % TILE_BACKGROUNDS.length] ?? "sand",
    note: item.in_stock
      ? `Minimum order: ${Math.max(1, Number(item.min_order_qty) || 1)} ${item.unit_name}`
      : "Currently out of stock",
  }));
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const body = (await response.json()) as { data: T };
  return body.data;
}

function scrollToId(id: string) {
  window.setTimeout(
    () =>
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    30,
  );
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  // Page state
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    window.localStorage.getItem("merkatolink-theme") === "dark"
      ? "dark"
      : "light",
  );
  const [language, setLanguage] = useState<LanguageCode>(() =>
    LANGUAGES.some(
      (item) =>
        item.code === window.localStorage.getItem("merkatolink-language"),
    )
      ? (window.localStorage.getItem("merkatolink-language") as LanguageCode)
      : "en",
  );
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [demoAccount, setDemoAccount] = useState<{
    name: string;
    id: string;
  } | null>(() => {
    try {
      const stored = window.localStorage.getItem("merkatolink-demo-account");
      return stored
        ? (JSON.parse(stored) as { name: string; id: string })
        : null;
    } catch {
      return null;
    }
  });
  const [admin, setAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<"bag" | "checkout">("bag");
  const [rate, setRate] = useState(BASE_RATE);

  // Marketplace data
  const [terras, setTerras] = useState<Terra[]>([]);
  const [terraState, setTerraState] = useState<LoadState>("idle");
  const [activeTerra, setActiveTerra] = useState<Terra | null>(null);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [traderState, setTraderState] = useState<LoadState>("idle");
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [catalogState, setCatalogState] = useState<LoadState>("idle");

  // Shop filters
  const [category, setCategory] = useState("Everything");
  const [query, setQuery] = useState("");

  // Cart and checkout
  const [cart, setCart] = useState<Cart>({ trader: null, lines: {} });
  const [delivery, setDelivery] = useState<DeliveryType>("pickup");
  const [payment, setPayment] = useState<PaymentTerms>("cash");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [demoOrders, setDemoOrders] = useState<DemoOrder[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const tradersAbort = useRef<AbortController | null>(null);
  const catalogAbort = useRef<AbortController | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }, []);

  const copy = UI_COPY[language];
  const t = (key: string) =>
    PAGE_COPY[language]?.[key] ?? PAGE_COPY.en?.[key] ?? key;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("merkatolink-theme", theme);
  }, [theme]);
  useEffect(() => {
    window.localStorage.setItem("merkatolink-language", language);
    document.documentElement.lang = language === "aa" ? "aa" : language;
  }, [language]);

  async function createDemoAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAccountMessage("");
    const phone = accountPhone.replace(/[\s-]/g, "");
    if (!/^(?:\+251|0)?[79]\d{8}$/.test(phone)) {
      setAccountMessage("Enter a valid Ethiopian mobile number.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/v1/accounts/demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: accountName.trim(), phone, language }),
      });
      const body = (await response.json()) as {
        data?: { id: string; name: string };
        error?: string;
      };
      if (!response.ok || !body.data) {
        setAccountMessage(body.error ?? "Could not create the demo account.");
        return;
      }
      const account = { id: body.data.id, name: body.data.name };
      window.localStorage.setItem(
        "merkatolink-demo-account",
        JSON.stringify(account),
      );
      setDemoAccount(account);
      setAccountMessage(
        `Demo account created for ${account.name}. This is not a secure sign-in.`,
      );
    } catch {
      setAccountMessage(
        "Could not reach the demo API. Make sure both app servers are running.",
      );
    }
  }

  /* ---------- Load terras ---------- */
  const loadTerras = useCallback((signal?: AbortSignal) => {
    setTerraState("loading");
    getJson<Terra[]>("/v1/terras", signal)
      .then((data) => {
        setTerras(data);
        setTerraState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setTerraState("error");
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTerras(controller.signal);
    return () => controller.abort();
  }, [loadTerras]);

  useEffect(() => {
    if (!admin) return;
    const controller = new AbortController();
    fetch(`${API_BASE}/v1/orders/demo`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: { data: DemoOrder[] }) => setDemoOrders(body.data))
      .catch(() => setDemoOrders([]));
    return () => controller.abort();
  }, [admin, placed]);

  async function updateDemoOrder(
    invoiceNo: string,
    status: DemoOrder["status"],
  ) {
    const response = await fetch(`${API_BASE}/v1/orders/demo/${invoiceNo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      showToast("Could not update this demo order.");
      return;
    }
    setDemoOrders((orders) =>
      orders.map((order) =>
        order.invoice_no === invoiceNo ? { ...order, status } : order,
      ),
    );
    showToast(`Order ${invoiceNo} marked ${status}.`);
  }

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Terra -> traders -> catalog ---------- */
  async function chooseTerra(terra: Terra) {
    tradersAbort.current?.abort();
    catalogAbort.current?.abort();
    const controller = new AbortController();
    tradersAbort.current = controller;

    setActiveTerra(terra);
    setSelectedTrader(null);
    setShopProducts([]);
    setCatalogState("idle");
    setTraders([]);
    setTraderState("loading");
    setCategory("Everything");
    setQuery("");
    scrollToId("trader-directory");

    try {
      const data = await getJson<Trader[]>(
        `/v1/terras/${terra.id}/traders`,
        controller.signal,
      );
      setTraders(data);
      setTraderState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTraderState("error");
    }
  }

  async function openTrader(trader: Trader) {
    catalogAbort.current?.abort();
    const controller = new AbortController();
    catalogAbort.current = controller;

    setSelectedTrader(trader);
    setShopProducts([]);
    setCatalogState("loading");
    setCategory("Everything");
    setQuery("");
    scrollToId("shop");

    try {
      const rows = await getJson<CatalogRow[]>(
        `/v1/traders/${trader.id}/catalog`,
        controller.signal,
      );
      setShopProducts(mapCatalog(rows));
      setCatalogState("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCatalogState("error");
      showToast("The catalog could not load. Check that the API is running.");
    }
  }

  /* ---------- Derived shop data ---------- */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shopProducts.filter(
      (p) =>
        (category === "Everything" || p.category === category) &&
        (q === "" ||
          p.name.toLowerCase().includes(q) ||
          p.amharic.includes(query.trim()) ||
          p.category.toLowerCase().includes(q)),
    );
  }, [category, query, shopProducts]);

  const categories = useMemo(
    () => [
      "Everything",
      ...new Set(shopProducts.map((product) => product.category)),
    ],
    [shopProducts],
  );

  /* ---------- Cart ---------- */
  const cartLines = Object.values(cart.lines);
  const count = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = round2(
    cartLines.reduce((sum, line) => sum + line.product.price * line.qty, 0),
  );
  const vat = cart.trader?.vat_registered ? round2(subtotal * VAT_RATE) : 0;
  const deliveryFee = DELIVERY_FEES[delivery];
  const total = round2(subtotal + vat + deliveryFee);

  function changeQty(product: Product, trader: Trader, delta: 1 | -1) {
    const switching =
      cart.trader !== null &&
      cart.trader.id !== trader.id &&
      cartLines.length > 0;
    if (switching && delta > 0) {
      const ok = window.confirm(
        `Your bag has items from ${cart.trader?.name}. Start a new bag with ${trader.name}?`,
      );
      if (!ok) return;
    }
    setCart((prev) => {
      const base: Cart =
        prev.trader && prev.trader.id !== trader.id
          ? { trader, lines: {} }
          : { trader, lines: { ...prev.lines } };
      const current = base.lines[product.id]?.qty ?? 0;
      let next: number;
      if (delta > 0) next = current === 0 ? product.minQty : current + 1;
      else next = current - 1 < product.minQty ? 0 : current - 1;
      const lines = { ...base.lines };
      if (next <= 0) delete lines[product.id];
      else lines[product.id] = { product, qty: next };
      return { trader: Object.keys(lines).length ? trader : null, lines };
    });
    if (delta > 0) setDrawerOpen(true);
  }

  function resetCheckout() {
    setStep("bag");
    setPlaced(null);
    setErrors({});
    setSubmitError("");
  }

  function closeDrawer() {
    setDrawerOpen(false);
    if (placed) resetCheckout();
  }

  /* ---------- Checkout ---------- */
  function validate(): Record<string, string> {
    const found: Record<string, string> = {};
    if (form.name.trim().length < 2) found.name = "Enter the buyer's name.";
    const digits = form.phone.replace(/[\s-]/g, "");
    if (!/^(?:\+251|0)?[79]\d{8}$/.test(digits)) {
      found.phone = "Enter an Ethiopian mobile number, such as 0912 345 678.";
    }
    if (delivery !== "pickup" && form.address.trim().length < 3) {
      found.address = "Add a landmark or shop number for the delivery.";
    }
    return found;
  }

  async function placeOrder() {
    if (!cart.trader || cartLines.length === 0) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`${API_BASE}/v1/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trader_id: cart.trader.id,
          buyer_name: form.name.trim(),
          buyer_phone: form.phone.replace(/[\s-]/g, ""),
          delivery_type: delivery,
          delivery_address: delivery === "pickup" ? null : form.address.trim(),
          payment_terms: payment,
          items: cartLines.map((line) => ({
            id: line.product.id,
            quantity: line.qty,
          })),
        }),
      });

      if (response.ok) {
        const body = (await response.json().catch(() => null)) as {
          data?: { invoice_no?: string; id?: string };
          mode?: string;
        } | null;
        const reference = body?.data?.invoice_no ?? body?.data?.id ?? "Saved";
        setPlaced({
          reference,
          saved: body?.mode === "database",
          total,
        });
        setCart({ trader: null, lines: {} });
      } else {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        setSubmitError(
          body?.error ??
            body?.message ??
            `The order could not be placed (${response.status}).`,
        );
      }
    } catch {
      setSubmitError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Rate Shock (illustrative) ---------- */
  const rateChange = ((rate - BASE_RATE) / BASE_RATE) * 100;
  const rateRows = RATE_SHOCK_ITEMS.map((item) => {
    // Cost scales with the rate, so margin = 1 - (1 - base margin) x rate / base rate.
    const margin = (1 - (1 - item.baseMargin / 100) * (rate / BASE_RATE)) * 100;
    return { ...item, margin, below: margin < item.target };
  });

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="site">
      <div className="announcement">
        <span>MERKATOLINK · DIGITAL MERKATO</span>
        <b>Wholesale, connected.</b>
        <span>Fictional demo · ETB pricing</span>
      </div>

      <header className="header">
        <button
          type="button"
          className="menuicon"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu />
        </button>
        <a className="wordmark" href="#top">
          <span className="seal">M</span>
          <span>
            MerkatoLink<small>{t("wholesale")}</small>
          </span>
        </a>
        <nav
          className={mobileOpen ? "open" : ""}
          onClick={() => setMobileOpen(false)}
        >
          <a
            href="#terras"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("terras");
            }}
          >
            {copy.markets}
          </a>
          <a
            href="#shop"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("shop");
            }}
          >
            {t("shopNav")}
          </a>
          <a
            href="#how-it-works"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("how-it-works");
            }}
          >
            {copy.how}
          </a>
          <a
            href="#story"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
              scrollToId("story");
            }}
          >
            {copy.about}
          </a>
          <a href="#market-news" onClick={() => setMobileOpen(false)}>
            {t("marketNews")}
          </a>
        </nav>
        <div className="headeractions">
          <label className="language-picker" aria-label="Choose language">
            <span>{t("language")}</span>
            <select
              aria-label="Language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as LanguageCode)
              }
            >
              {LANGUAGES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="icon-control"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            type="button"
            className="account-button"
            onClick={() => {
              setAccountMessage("");
              setAccountOpen(true);
            }}
          >
            <UserRoundPlus size={16} />
            <span>{demoAccount?.name ?? t("createAccount")}</span>
          </button>
          <label className="searchfield">
            <Search size={17} />
            <input
              ref={searchRef}
              aria-label="Search products"
              placeholder={
                selectedTrader
                  ? `Search ${selectedTrader.name}`
                  : "Pick a shop to search"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>{isMac ? "⌘ K" : "Ctrl K"}</kbd>
          </label>
          <button
            type="button"
            className="bagbutton"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={18} />
            <span>{t("bag")}</span>
            <i>{count}</i>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="kicker">
              <span /> {t("heroKicker")}
            </div>
            <h1>{t("heroTitle")}</h1>
            <p>{t("heroBody")}</p>
            {copy.languageNote && (
              <small className="language-note" role="status">
                {copy.languageNote ||
                  (language !== "en"
                    ? "Product names and trader-provided details may stay in their original language."
                    : "")}
              </small>
            )}
            <a className="hero-cta" href="#terras">
              {language === "en" ? copy.browse : t("explore")}{" "}
              <ArrowRight size={16} />
            </a>
            <div className="hero-note">
              <div className="tinyfaces">
                <i>Sh</i>
                <i>Ki</i>
                <i>So</i>
              </div>
              <span>
                <b>{terraState === "ready" ? terras.length : 5}</b>{" "}
                {t("terrasCount")}
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-sun" />
            <div className="art-caption">
              <span>From the terras</span>
              <b>
                Market mornings,
                <br />
                made simple.
              </b>
            </div>
            <div className="basket">
              <div className="basketcloth" />
              <span className="basket-item one">🌾</span>
              <span className="basket-item two">🧵</span>
              <span className="basket-item three">⚙️</span>
              <span className="basket-item four">🌶️</span>
              <div className="basket-weave" />
            </div>
            <div className="art-stamp">
              MADE
              <br />
              IN ADDIS
              <br />
              <span>✳</span>
            </div>
            <div className="hero-image-label">
              Merkato (demo) <span>✳</span> Addis Ababa
            </div>
          </div>
        </section>

        <section className="terra-directory" id="terras">
          <div className="terra-intro">
            <div className="kicker">{t("directoryKicker")}</div>
            <h2>
              {t("directoryTitle")}
              <br />
              {t("directoryEnd")}
            </h2>
            <p>
              Similar goods are sold together, so start with the place, meet the
              traders, and find the right wholesale partner.
            </p>
            <span>Fictional marketplace · demo data</span>
          </div>

          <div className="terra-tiles">
            {terraState === "loading" &&
              Array.from({ length: 5 }, (_, i) => (
                <div
                  className="terra-tile ml-skeleton"
                  key={i}
                  aria-hidden="true"
                />
              ))}

            {terraState === "error" && (
              <div className="ml-error" role="alert">
                <b>The terra directory could not load.</b>
                <p>
                  Check that the API is running at <code>{API_BASE}</code>, then
                  try again.
                </p>
                <button
                  type="button"
                  className="ml-link-button"
                  onClick={() => loadTerras()}
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            )}

            {terraState === "ready" &&
              terras.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  aria-pressed={activeTerra?.id === t.id}
                  className={"terra-tile " + (TERRA_TONE[t.name] ?? "t-mina")}
                  onClick={() => void chooseTerra(t)}
                >
                  <span className="tile-am">{t.name_am ?? ""}</span>
                  <span className="tile-icon">{t.icon}</span>
                  <b>{t.name}</b>
                  <small>{t.description}</small>
                  <i>
                    {t.trader_count} {t.trader_count === 1 ? "shop" : "shops"}{" "}
                    <ArrowUpRight size={13} />
                  </i>
                </button>
              ))}
          </div>
        </section>

        {activeTerra && (
          <section className="shop-section" id="trader-directory">
            <div className="section-heading">
              <div>
                <div className="kicker">{activeTerra.name} terra</div>
                <h2>Shops in {activeTerra.name}</h2>
                <p>{activeTerra.description}</p>
              </div>
            </div>

            {traderState === "loading" && (
              <p className="ml-empty">Loading shops…</p>
            )}
            {traderState === "error" && (
              <div className="ml-error" role="alert">
                <b>The shops in this terra could not load.</b>
                <button
                  type="button"
                  className="ml-link-button"
                  onClick={() => void chooseTerra(activeTerra)}
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            )}
            {traderState === "ready" && traders.length === 0 && (
              <p className="ml-empty">No verified shops in this terra yet.</p>
            )}
            {traderState === "ready" && traders.length > 0 && (
              <div className="ml-trader-grid">
                {traders.map((trader) => (
                  <button
                    type="button"
                    key={trader.id}
                    className={
                      "ml-trader-card" +
                      (selectedTrader?.id === trader.id ? " is-selected" : "")
                    }
                    style={
                      trader.primary_color
                        ? { borderLeftColor: trader.primary_color }
                        : undefined
                    }
                    onClick={() => void openTrader(trader)}
                  >
                    <b>{trader.name}</b>
                    <small>
                      Shop {trader.shop_no} · {trader.landmark}
                    </small>
                    {trader.tagline && <span>{trader.tagline}</span>}
                    <span className="ml-badges">
                      {trader.verified && (
                        <em className="ml-badge">Verified</em>
                      )}
                      <em className="ml-badge">
                        {trader.vat_registered
                          ? "VAT-registered"
                          : "No VAT charged"}
                      </em>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <div className="kicker">{t("wholesaleListings")}</div>
              <h2>
                {selectedTrader
                  ? selectedTrader.name
                  : "Choose a shop to begin."}
              </h2>
              <p>
                {selectedTrader
                  ? `${selectedTrader.tagline ?? "Wholesale listings"} · Shop ${selectedTrader.shop_no}, ${selectedTrader.landmark}`
                  : t("shopsPrompt")}
              </p>
            </div>
            {selectedTrader && (
              <a href="#terras" className="viewall">
                Back to terras <ArrowUpRight size={16} />
              </a>
            )}
          </div>

          {!selectedTrader && (
            <p className="ml-empty">
              Nothing is listed yet. Choose a terra and open a shop to see its
              products.
            </p>
          )}
          {selectedTrader && catalogState === "loading" && (
            <p className="ml-empty">Loading products…</p>
          )}
          {selectedTrader && catalogState === "error" && (
            <div className="ml-error" role="alert">
              <b>This shop's catalog could not load.</b>
              <button
                type="button"
                className="ml-link-button"
                onClick={() => void openTrader(selectedTrader)}
              >
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {selectedTrader && catalogState === "ready" && (
            <>
              <div className="shop-controls">
                <div className="categories">
                  {categories.map((c) => (
                    <button
                      type="button"
                      className={
                        category === c ? "category active" : "category"
                      }
                      onClick={() => setCategory(c)}
                      key={c}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <span className="resultcount">
                  Showing {shown.length} of {shopProducts.length}
                </span>
              </div>

              {shown.length === 0 ? (
                <p className="ml-empty">
                  {shopProducts.length === 0
                    ? "This shop has no listings yet."
                    : "No products match your search. Clear the search or pick another category."}
                </p>
              ) : (
                <div className="product-grid">
                  {shown.map((p) => {
                    const qty = cart.lines[p.id]?.qty ?? 0;
                    return (
                      <article className="product" key={p.id}>
                        <div className={"product-visual " + p.bg}>
                          <span className="prod-emoji">{p.emoji}</span>
                          {p.amharic && (
                            <span className="amharic">{p.amharic}</span>
                          )}
                          {!p.inStock && (
                            <span className="product-tag">Out of stock</span>
                          )}
                          <button
                            type="button"
                            className="quick-add"
                            aria-label={`Add ${p.name} to your bag`}
                            disabled={!p.inStock}
                            onClick={() => changeQty(p, selectedTrader, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="product-meta">
                          <span>{p.category}</span>
                          <span>{p.unit}</span>
                        </div>
                        <div className="product-title">
                          <h3>{p.name}</h3>
                          <b>{birr(p.price)}</b>
                        </div>
                        <p className="product-note">{p.note}</p>
                        {qty > 0 && (
                          <div className="inline-qty">
                            <button
                              type="button"
                              aria-label={`Remove one ${p.name}`}
                              onClick={() => changeQty(p, selectedTrader, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <b>{qty} in your bag</b>
                            <button
                              type="button"
                              aria-label={`Add one more ${p.name}`}
                              onClick={() => changeQty(p, selectedTrader, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="loadmore">
                <span /> Fictional demo data <span />
              </div>
            </>
          )}
        </section>

        <section className="news-section" id="market-news">
          <div className="news-heading">
            <div>
              <div className="kicker">{t("marketNews")} · 8 NOV 2026</div>
              <h2>{t("newsTitle")}</h2>
              <p>{t("newsIntro")}</p>
            </div>
            <span className="news-mark">M·D</span>
          </div>
          <div className="news-grid">
            <article className="news-card news-featured">
              <span className="news-tag">TRADE & EXPORTS</span>
              <small>8 Nov 2026 · Addis Fortune</small>
              <h3>{t("newsCoffeeTitle")}</h3>
              <p>{t("newsCoffee")}</p>
              <a
                href="https://addisfortune.news/coffee-shipments-fall-short-of-first-quarter-target"
                target="_blank"
                rel="noreferrer"
              >
                {t("readStory")} <ArrowUpRight size={14} />
              </a>
            </article>
            <article className="news-card">
              <span className="news-tag">PRICES & COSTS</span>
              <small>5 Nov 2026 · StockMarket.et</small>
              <h3>{t("newsInflationTitle")}</h3>
              <p>{t("newsInflation")}</p>
              <a
                href="https://www.stockmarket.et/ethiopias-annual-inflation-eases-to-14-6-in-october-as-non-food-prices-rise/"
                target="_blank"
                rel="noreferrer"
              >
                {t("readStory")} <ArrowUpRight size={14} />
              </a>
            </article>
            <article className="news-card">
              <span className="news-tag">EXPORT READINESS</span>
              <small>3 Nov 2026 · Capital Newspaper</small>
              <h3>{t("newsDhlTitle")}</h3>
              <p>{t("newsDhl")}</p>
              <a
                href="https://capitalethiopia.com/2026/11/03/ethiopia-dhl-sign-deal-to-boost-coffee-export-capacity/"
                target="_blank"
                rel="noreferrer"
              >
                {t("readStory")} <ArrowUpRight size={14} />
              </a>
            </article>
          </div>
          <small className="news-disclaimer">{t("newsDisclaimer")}</small>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <div className="kicker">{t("howKicker")}</div>
            <h2>{t("howTitle")}</h2>
            <p>{t("howBody")}</p>
          </div>
          <div className="how-steps">
            <article>
              <span>01</span>
              <Store />
              <h3>{t("chooseTerra")}</h3>
              <p>{t("chooseTerraBody")}</p>
            </article>
            <article>
              <span>02</span>
              <Boxes />
              <h3>{t("findTrader")}</h3>
              <p>{t("findTraderBody")}</p>
            </article>
            <article>
              <span>03</span>
              <Wallet />
              <h3>{t("sendOrder")}</h3>
              <p>{t("sendOrderBody")}</p>
            </article>
          </div>
          <div
            className="market-flow"
            aria-label="Order journey: choose a terra, select a trader, send an order"
          >
            <div>
              <span>⌖</span>
              <b>Terra</b>
              <small>{t("flowTerra")}</small>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>▤</span>
              <b>Trader</b>
              <small>{t("flowTrader")}</small>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>▣</span>
              <b>Order</b>
              <small>{t("flowOrder")}</small>
            </div>
          </div>
          <p className="translation-footnote">{t("howMore")}</p>
          <a
            className="hero-cta"
            href="#terras"
            onClick={(event) => {
              event.preventDefault();
              scrollToId("terras");
            }}
          >
            Explore the market <ArrowRight size={16} />
          </a>
        </section>

        <section className="story" id="story">
          <div className="story-art">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/MercatoAddisAbeba08.jpg/960px-MercatoAddisAbeba08.jpg"
              alt="A fabric-traders' lane in Addis Ababa's Merkato market"
              loading="lazy"
            />
            <span className="story-image-label">{t("photoLabel")}</span>
            <div className="story-photo-credit">
              {t("photoCredit")}: JanManu ·{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:MercatoAddisAbeba08.jpg"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-SA 3.0
              </a>
            </div>
          </div>
          <div className="story-copy">
            <div className="kicker">{t("storyKicker")}</div>
            <h2>{t("storyTitle")}</h2>
            <p>{t("storyBody")}</p>
            <p>{t("storyBody2")}</p>
            <a
              href="#how-it-works"
              onClick={(event) => {
                event.preventDefault();
                scrollToId("how-it-works");
              }}
            >
              See how MerkatoLink works <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footerbrand">
          <span className="seal">M</span>
          <div>
            <b>MerkatoLink</b>
            <small>Demo marketplace</small>
          </div>
        </div>
        <span>
          Made in Addis Ababa, Ethiopia{" "}
          <span className="amharic-foot">አዲስ አበባ</span>
        </span>
        <div className="social">
          <button
            type="button"
            className="manage"
            onClick={() => setAdmin(!admin)}
          >
            {admin ? "Back to shop" : "Trader workspace (preview)"}{" "}
            <ArrowUpRight size={13} />
          </button>
        </div>
      </footer>

      {admin && (
        <div className="admin-overlay">
          <div className="admin-top">
            <button type="button" onClick={() => setAdmin(false)}>
              <ArrowLeft size={17} /> Back to storefront
            </button>
            <span>
              MerkatoLink <i /> Trader workspace preview
            </span>
          </div>
          <div className="admin-content">
            <div className="admin-welcome">
              <div className="kicker">{todayLabel}</div>
              <h1>Your shop, at a glance.</h1>
              <p>
                Local demo workspace · fictional transactions saved on this
                computer.
              </p>
            </div>

            <div className="admin-stats">
              {SAMPLE_STATS.map(([label, value, hint]) => (
                <div key={label}>
                  <small>{label}</small>
                  <b>{value}</b>
                  <span>{hint}</span>
                </div>
              ))}
            </div>

            <div className="admin-panels">
              <section>
                <div className="admin-panel-head">
                  <h2>Recent orders</h2>
                </div>
                {demoOrders.length ? (
                  demoOrders
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map((order) => (
                      <div className="orderrow" key={order.invoice_no}>
                        <b>{order.invoice_no.slice(-5)}</b>
                        <span>{order.buyer_name}</span>
                        <small>{order.items.length} lines</small>
                        <b>{birr(order.total)}</b>
                        <select
                          aria-label={`Status for ${order.invoice_no}`}
                          value={order.status}
                          onChange={(event) =>
                            void updateDemoOrder(
                              order.invoice_no,
                              event.target.value as DemoOrder["status"],
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))
                ) : (
                  <p className="ml-empty">
                    No demo orders yet. Place an order in the storefront and it
                    will appear here.
                  </p>
                )}
              </section>
              <section className="restock">
                <div className="admin-panel-head">
                  <h2>Restock soon</h2>
                </div>
                {SAMPLE_RESTOCK.map(([icon, name, left]) => (
                  <div className="restockrow" key={name}>
                    <span>{icon}</span>
                    <b>{name}</b>
                    <small>{left}</small>
                  </div>
                ))}
              </section>
            </div>

            <section className="rateshock">
              <div className="admin-panel-head">
                <div>
                  <h2>LandedBirr · Rate Shock</h2>
                  <small>
                    See what a dollar-rate change means for your margins.
                  </small>
                </div>
                <span>Illustrative demo</span>
              </div>
              <div className="ratecontrol">
                <label>
                  USD / ETB <b>{rate.toFixed(2)}</b>{" "}
                  <small>
                    ({rateChange >= 0 ? "+" : ""}
                    {rateChange.toFixed(1)}% from {BASE_RATE.toFixed(1)})
                  </small>
                  <input
                    type="range"
                    min="130"
                    max="200"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                  />
                </label>
                <div className="ratepresets">
                  {[5, 10, 20].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRate(round2(BASE_RATE * (1 + n / 100)))}
                    >
                      +{n}%
                    </button>
                  ))}
                  <button type="button" onClick={() => setRate(BASE_RATE)}>
                    Reset
                  </button>
                </div>
              </div>
              <div className="risk-table">
                <div>
                  <b>Imported product</b>
                  <b>Margin now</b>
                  <b>At {rate.toFixed(1)}</b>
                  <b>Signal</b>
                </div>
                {rateRows.map((row) => (
                  <div key={row.name}>
                    <span>{row.name}</span>
                    <span>{row.baseMargin}%</span>
                    <span>{row.margin.toFixed(1)}%</span>
                    <i className={row.below ? "risk" : "safe"}>
                      {row.below ? `Below ${row.target}% target` : "Healthy"}
                    </i>
                  </div>
                ))}
              </div>
              <small className="tax-disclaimer">
                Illustrative demo rates only. Verify the import tax bases and
                rates with the Ethiopian Customs Commission before any business
                use.
              </small>
            </section>
          </div>
        </div>
      )}

      {accountOpen && (
        <div className="account-scrim" onClick={() => setAccountOpen(false)}>
          <section
            className="account-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="account-close"
              aria-label="Close account dialog"
              onClick={() => setAccountOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="kicker">MERKATOLINK · DEMO</div>
            <h2 id="account-title">{t("accountTitle")}</h2>
            <p>{t("accountDisclosure")}</p>
            <form onSubmit={(event) => void createDemoAccount(event)}>
              <label>
                {t("accountName")}
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  autoComplete="name"
                />
              </label>
              <label>
                {t("accountPhone")}
                <input
                  required
                  type="tel"
                  placeholder="0912 345 678"
                  value={accountPhone}
                  onChange={(event) => setAccountPhone(event.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label>
                {t("accountLanguage")}
                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value as LanguageCode)
                  }
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              {accountMessage && (
                <p className="account-message" role="status">
                  {accountMessage}
                </p>
              )}
              {!demoAccount && (
                <button className="account-submit" type="submit">
                  {t("createProfile")}
                </button>
              )}
            </form>
            {demoAccount && (
              <div className="account-profile">
                <b>{demoAccount.name}</b>
                <small>{demoAccount.id} · demo profile</small>
              </div>
            )}
          </section>
        </div>
      )}

      {drawerOpen && (
        <div className="drawer-scrim" onClick={closeDrawer}>
          <aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawerhead">
              <div>
                <small>{cart.trader ? cart.trader.name : "MerkatoLink"}</small>
                <h2>
                  {t("bagTitle")} <span>({count})</span>
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close your bag"
                onClick={closeDrawer}
              >
                <X />
              </button>
            </div>

            {placed ? (
              <div className="success">
                <span>✓</span>
                <h2>
                  {placed.saved ? "Order placed." : "Demo order created."}
                </h2>
                <p>
                  {placed.saved
                    ? "The trader has your order and will confirm the delivery or pickup by phone."
                    : "This fictional demo order is saved locally for the trader workspace. It is not sent to a real shop."}
                </p>
                <b>
                  Reference {placed.reference} · {birr(placed.total)}
                </b>
                <button
                  type="button"
                  onClick={() => {
                    resetCheckout();
                    setDrawerOpen(false);
                  }}
                >
                  {t("shopNav")} <ArrowRight size={15} />
                </button>
              </div>
            ) : count === 0 ? (
              <div className="emptybag">
                <ShoppingBag size={30} />
                <h3>{t("bagEmpty")}</h3>
                <p>{t("bagEmptyHelp")}</p>
                <button type="button" onClick={closeDrawer}>
                  {t("explore")} <ArrowRight size={15} />
                </button>
              </div>
            ) : step === "checkout" ? (
              <div className="checkout">
                <button
                  type="button"
                  className="backcart"
                  onClick={() => setStep("bag")}
                >
                  <ArrowLeft size={14} /> Back to bag
                </button>
                <h3>{t("checkoutTitle")}</h3>
                <p>{t("checkoutHelp")}</p>

                <label>
                  Buyer name
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Name for the order"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <span className="ml-field-error">{errors.name}</span>
                  )}
                </label>
                <label>
                  {t("phoneLabel")}
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="0912 345 678"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span className="ml-field-error">{errors.phone}</span>
                  )}
                </label>

                <fieldset className="ml-radio-group">
                  <legend>{t("delivery")}</legend>
                  {(Object.keys(DELIVERY_LABELS) as DeliveryType[]).map(
                    (key) => (
                      <label key={key}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={delivery === key}
                          onChange={() => setDelivery(key)}
                        />
                        <span>
                          {t(key)}
                          <small>
                            {DELIVERY_FEES[key] === 0
                              ? "Free"
                              : birr(DELIVERY_FEES[key])}
                          </small>
                        </span>
                      </label>
                    ),
                  )}
                </fieldset>

                {delivery !== "pickup" && (
                  <label>
                    {t("address")}
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Terra, shop number or landmark"
                    />
                    {errors.address && (
                      <span className="ml-field-error">{errors.address}</span>
                    )}
                  </label>
                )}

                <fieldset className="ml-radio-group">
                  <legend>{t("payment")}</legend>
                  {(Object.keys(PAYMENT_LABELS) as PaymentTerms[]).map(
                    (key) => (
                      <label key={key}>
                        <input
                          type="radio"
                          name="payment"
                          checked={payment === key}
                          onChange={() => setPayment(key)}
                        />
                        <span>
                          {t(key === "mobile_money" ? "mobileMoney" : key)}
                        </span>
                      </label>
                    ),
                  )}
                </fieldset>

                <div className="carttotals">
                  <span>
                    {t("subtotal")} <b>{birr(subtotal)}</b>
                  </span>
                  <span>
                    {cart.trader?.vat_registered ? `${t("vat")} 15%` : t("vat")}{" "}
                    <b>
                      {cart.trader?.vat_registered ? birr(vat) : "Not charged"}
                    </b>
                  </span>
                  <span>
                    {t("delivery")}{" "}
                    <b>{deliveryFee === 0 ? "Free" : birr(deliveryFee)}</b>
                  </span>
                  <span className="grand">
                    {t("total")} <b>{birr(total)}</b>
                  </span>
                </div>

                {submitError && (
                  <p className="ml-field-error" role="alert">
                    {submitError}
                  </p>
                )}
                <p className="order-choice-summary">
                  {count} wholesale {count === 1 ? "unit" : "units"} ·{" "}
                  {t(delivery)} ·{" "}
                  {t(payment === "mobile_money" ? "mobileMoney" : payment)}
                </p>
                <button
                  type="button"
                  className="placeorder"
                  disabled={submitting}
                  onClick={() => void placeOrder()}
                >
                  {submitting
                    ? "Placing order…"
                    : `Place order · ${birr(total)}`}{" "}
                  <ArrowRight size={16} />
                </button>
                <small className="vatnote">
                  {cart.trader?.vat_registered
                    ? "VAT is added because this trader is VAT-registered."
                    : "This trader is not VAT-registered, so no VAT is charged."}{" "}
                  No payment is taken online.
                </small>
              </div>
            ) : (
              <>
                <div className="bagitems">
                  {cartLines.map(({ product, qty }) => (
                    <div className="bagitem" key={product.id}>
                      <span className={"bagemoji " + product.bg}>
                        {product.emoji}
                      </span>
                      <div className="bagdesc">
                        <b>{product.name}</b>
                        <small>
                          {product.unit} · {birr(product.price)}
                        </small>
                        <div className="stepper">
                          <button
                            type="button"
                            aria-label={`Remove one ${product.name}`}
                            onClick={() =>
                              cart.trader && changeQty(product, cart.trader, -1)
                            }
                          >
                            <Minus size={12} />
                          </button>
                          <span>{qty}</span>
                          <button
                            type="button"
                            aria-label={`Add one more ${product.name}`}
                            onClick={() =>
                              cart.trader && changeQty(product, cart.trader, 1)
                            }
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <b>{birr(product.price * qty)}</b>
                    </div>
                  ))}
                </div>
                <div className="deliveryhint">
                  <Truck size={16} />
                  <span>
                    <b>Pickup, porter or truck</b>
                    <small>
                      You choose how to receive the order at checkout.
                    </small>
                  </span>
                </div>
                <div className="carttotals">
                  <span>
                    Subtotal <b>{birr(subtotal)}</b>
                  </span>
                  <span>
                    {cart.trader?.vat_registered ? "VAT 15%" : "VAT"}{" "}
                    <b>
                      {cart.trader?.vat_registered ? birr(vat) : "Not charged"}
                    </b>
                  </span>
                  <span className="grand">
                    Total before delivery <b>{birr(round2(subtotal + vat))}</b>
                  </span>
                  <button type="button" onClick={() => setStep("checkout")}>
                    Continue to checkout <ArrowRight size={16} />
                  </button>
                  <small>Cash, transfer, mobile money or credit</small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {toast && <div className="toast">✳ {toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
