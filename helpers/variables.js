const ranks = {
  '000': 'نامشخص',
  100: 'محصل پيماني',
  101: 'هنراموزگروهباني‌',
  201: 'اموزشيار',
  202: 'م--رب-ي ',
  203: 'استادي-ار',
  204: 'دانش-يار',
  205: 'اس-تاد',
  210: 'سرهمافريكم ',
  211: 'سرهمافردوم ',
  212: 'سرهمافرسوم ',
  213: 'همافريكم ',
  214: 'همافردوم ',
  215: 'همافرسوم ',
  225: 'دانشجوي سال  1 پرستاري ',
  226: 'دانشجوي سال  2 پرستاري ',
  227: 'دانشجوي سال  3 پرستاري ',
  228: 'هنراموزگروهباني ',
  236: 'دانشجوي سال  1 نظامي ',
  237: 'دانشجوي سال  2 نظامي ',
  238: 'دانشجوي سال  3 نظامي ',
  239: 'دانشجوي سال  4 نظامي ',
  243: 'محصل  پيماني ',
  244: 'دانشاموزبهياري ',
  311: 'ستوانياريكم ',
  312: 'ستوانياردوم ',
  313: 'ستوانيارسوم ',
  381: 'ك  ت  ر 1',
  382: 'ك  ت  ر 2',
  383: 'ك  ت  ر 3',
  384: 'ك  ت  ر 4',
  385: 'ك  ت  ر 5',
  386: 'ك  ت  ر 6',
  387: 'ك  ت  ر 7',
  388: 'ك  ت  ر 8',
  389: 'ك  ت  ر 9',
  390: 'ك  ت  ر 10',
  391: 'ك  ت  ر 11',
  392: 'ك  ت  ر 12',
  393: 'ك  ت  ر 13',
  394: 'ك  ت  ر 14',
  395: 'ك  ت  ر 15',
  396: 'ك  ت  ر 16',
  397: 'ك  ت  ر 17',
  398: 'ك  ت  ر 18',
  399: 'ك  ت  ر 19',
  400: 'ك  ت  ر 20',
  401: 'ك  ع  ر 1',
  402: 'ك  ع  ر 2',
  403: 'ك  ع  ر 3',
  404: 'ك  ع  ر 4',
  405: 'ك  ع  ر 5',
  406: 'ك  ع  ر 6',
  407: 'ك  ع  ر 7',
  408: 'ك  ع  ر 8',
  409: 'ك  ع  ر 9',
  410: 'ك  ع  ر 10',
  411: 'ك  ع  ر 11',
  412: 'ك  ع  ر 12',
  413: 'ك  ع  ر 13',
  414: 'ك  ع  ر 14',
  415: 'ك  ع  ر 15',
  416: 'ك  ع  ر 16',
  417: 'ك  ع  ر 17',
  418: 'ك  ع  ر 18',
  419: 'ك  ع  ر 19',
  420: 'ك  ع  ر 20',
  421: 'افزارمندازمايشي ',
  424: 'افزارمندطبقه 1',
  430: 'افزارمندطبقه 2',
  436: 'افزارمندطبقه 3',
  442: 'افزارمندطبقه 4',
  448: 'افزارمندطبقه 5',
  457: 'كارمندفني ط 1پايه 1',
  458: 'كارمندفني ط 1پايه 2',
  459: 'كارمندفني ط 1پايه 3',
  460: 'كارمندفني ط 1پايه 4',
  461: 'كارمندفني ط 1پايه 5',
  462: 'كارمندفني ط 1پايه 6',
  463: 'كارمندفني ط 1پايه 7',
  464: 'كارمندفني ط 1پايه 8',
  465: 'كارمندفني ط 1پايه 9',
  466: 'كارمندفني ط 1پايه 10',
  472: 'كارمندفني ط 2پايه 1',
  473: 'كارمندفني ط 2پايه 2',
  474: 'كارمندفني ط 2پايه 3',
  475: 'كارمندفني ط 2پايه 4',
  476: 'كارمندفني ط 2پايه 5',
  477: 'كارمندفني ط 2پايه 6',
  478: 'كارمندفني ط 2پايه 7',
  479: 'كارمندفني ط 2پايه 8',
  480: 'كارمندفني ط 2پايه 9',
  481: 'كارمندفني ط 2پايه 10',
  487: 'كارمندفني ط 3پايه 1',
  488: 'كارمندفني ط 3پايه 2',
  489: 'كارمندفني ط 3پايه 3',
  490: 'كارمندفني ط 3پايه 4',
  491: 'كارمندفني ط 3پايه 5',
  492: 'كارمندفني ط 3پايه 6',
  493: 'كارمندفني ط 3پايه 7',
  494: 'كارمندفني ط 3پايه 8',
  495: 'كارمندفني ط 3پايه 9',
  496: 'كارمندفني ط 3پايه 10',
  502: 'كارمندفني ط 4پايه 1',
  503: 'كارمندفني ط 4پايه 2',
  504: 'كارمندفني ط 4پايه 3',
  505: 'كارمندفني ط 4پايه 4',
  506: 'كارمندفني ط 4پايه 5',
  507: 'كارمندفني ط 4پايه 6',
  508: 'كارمندفني ط 4پايه 7',
  509: 'كارمندفني ط 4پايه 8',
  510: 'كارمندفني ط 4پايه 9',
  511: 'كارمندفني ط 4پايه 10',
  517: 'كارمندفني ط 5پايه 1',
  518: 'كارمندفني ط 5پايه 2',
  519: 'كارمندفني ط 5پايه 3',
  520: 'كارمندفني ط 5پايه 4',
  521: 'كارمندفني ط 5پايه 5',
  522: 'كارمندفني ط 5پايه 6',
  523: 'كارمندفني ط 5پايه 7',
  524: 'كارمندفني ط 5پايه 8',
  525: 'كارمندفني ط 5پايه 9',
  526: 'كارمندفني ط 5پايه 10',
  541: 'كارمندرسمي ط 1 مرتبه 1',
  556: 'كارمندرسمي ط 1 مرتبه 2',
  571: 'كارمندرسمي ط 1 مرتبه 3',
  586: 'كارمندرسمي ط 1 مرتبه 4',
  611: 'كارمندرسمي ط 2 مرتبه  1',
  612: 'كارمندرسمي ط 2 مرتبه  2',
  613: 'كارمندرسمي ط 2 مرتبه  3',
  614: 'كارمندرسمي ط 2 مرتبه  4',
  615: 'كارمندرسمي ط 3 مرتبه  1',
  616: 'كارمندرسمي ط 3 مرتبه  2',
  617: 'كارمندرسمي ط 3 مرتبه  3',
  618: 'كارمندرسمي ط 3 مرتبه  4',
  706: 'گ 2 پيماني ',
  707: 'گ 1 پيماني ',
  708: 'استوار2 پيماني ',
  709: 'استوار1 پيماني ',
  710: 'ستوان 3 پيماني ',
  711: 'ستوان 2 پيماني ',
  712: 'ستوان 1 پيماني ',
  713: 'سروان   پيماني ',
  722: 'ك  پ  ر 2',
  723: 'ك  پ  ر 3',
  724: 'ك  پ  ر 4',
  725: 'ك  پ  ر 5',
  726: 'ك  پ  ر 6',
  727: 'ك  پ  ر 7',
  728: 'ك  پ  ر 8',
  729: 'ك  پ  ر 9',
  730: 'ك  پ  ر 10',
  731: 'ك  پ  ر 11',
  732: 'ك  پ  ر 12',
  733: 'ك  پ  ر 13',
  734: 'ك  پ  ر 14',
  791: 'ستوانيكم وظيفه ',
  792: 'ستواندوم وظيفه ',
  793: 'ستوانسوم وظيفه ',
  794: 'گروهبان  سوم وظيفه ',
  795: 'گروهبان  دوم وظيفه ',
  796: 'گروهبان  يكم وظيفه ',
  797: 'استواردوم وظيفه ',
  798: 'استواريكم وظيفه ',
  799: 'دانشجووظيفه ',
  800: 'سربازاموزشي ',
  801: 'سرباز',
  802: 'سربازدوم ',
  803: 'سربازيكم ',
  804: 'سرجوخه ',
  805: 'گروهبانسوم ',
  806: 'گروهباندوم ',
  807: 'گروهبانيكم ',
  808: 'استواردوم ',
  809: 'استواريكم ',
  810: 'ستوانسوم ',
  811: 'ستواندوم ',
  812: 'ستوانيكم ',
  813: 'سروان ',
  814: 'سرگرد',
  815: 'سرهنگ  دوم ',
  816: 'سرهنگ ',
  817: 'سرتيپ دوم ',
  818: 'سرتيپ ',
  819: 'سرلشكر',
  820: 'سپهبد',
  821: 'ارتشبد',
  822: 'گروهبان ',
  823: 'استوار',
  824: 'ستوان ',
};

// const rolesInHR = {

// }

const maddeHaNumbers = {
  Tashvighat: { name: 'تشویقات', number: 1, table: 'Tashvighat' },
  Tarfiat: { name: 'ترفیعات', number: 2, table: 'Tarfiat' },
  Entesabat: { name: 'انتصابات', number: 3, table: 'Entesabat' },
  Enteghalat: { name: 'انتقالات', number: 4, table: 'Enteghalat' },
  Amoozesh: { name: 'آموزش', number: 6, table: 'Amoozesh' },
  VaziatKhedmat: { name: 'وضعیت خدمتی', number: 7, table: 'VaziatKhedmat' },
  Khadamat: { name: 'مسکن', number: 9, table: 'Khadamat' },
  Estekhdam: { name: 'استخدام', number: 10, table: 'Estekhdam' },
  DastoorAele: { name: 'عائله', number: 11, table: 'DastoorAele' },
  Tanbihat: { name: 'تنبیهات', number: 12, table: 'Tanbihat' },
  Motefareghe: { name: 'امور متفرقه', number: 15, table: 'Motefareghe' },
};

const maddeHaCols = {
  1: {
    // "Dastoor",
    // "Madde",
    زیرماده: 'Zirmadde',
    // "ZirZirmadde",
    // Eghdamgar: '"اقدامگر'",
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    'شماره پرسنلی': 'PerNo',
    // "TarikhSabt": '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    تاریخ: 'Tarikh',
    'علت تشویق': 'EllateTashvigh',
    'استناد تشویق': 'EstenadTashvigh',
    'کد تشویق': 'CodeTashvigh',
    'نحوه تشویق': 'NahveTashvigh',
    'مدرک تحصیلی': 'MadrakTahsil',
    'استناد ارشدیت': 'EstenadArshadiat',
    'سنوات ارشدیت': 'SanavatArshadiat',
    'تاریخ ارشدیت': 'TarikhArshadiat',
    // Date: '"تاریخ'",
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // "TaidEghdamgar": '"",' 1
    // "TaidRaisShobe": '"",' 0
    // "TaidJaneshin": '"",' 0
    // "TaidRais": '"",' 0
    // "TaidRaisDastoor": '"",' 0
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    // TarikhOdat: '"تاریخ' عودت",
    // EllateOdat: '"",'
    // OdatDahande: '"",'
    // DastoorTashvigh: '"دستور' تشویق",
    ضمایم: 'Zamaem',
    // شعبه: 'Shobe',
    'رفع تنبیهات۱': 'RafeTanbihat1',
    'رفع تنبیهات۲': 'RafeTanbihat2',
    'رفع تنبیهات۳': 'RafeTanbihat3',
    مدت: 'Modat',
  },
  2: {
    // "Dastoor",
    // "Madde",
    زیرماده: 'Zirmadde',
    // "ZirZirmadde",
    // "Eghdamgar",
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"",'
    // TaidEghdamgar: '"",' 1
    // TaidRaisShobe: '"",' 0
    // TaidJaneshin: '"",' 0
    // TaidRais: '"",' 0
    // TaidRaisDastoor: '"",' 0
    'علت (اصلاح)': 'EslahElat',
    'تاریخ (اصلاح)': 'EslahTarikh',
    'تاریخ ارتقا': 'ErteghaTarikh',
    'ماده ارتقا': 'ErteghaMadde',
    'تعداد سیر': 'SeyrTedad',
    // GirandeLafz: '"",'
    // TarikhTaidRiasat: '"",'
    // TarikhTaidDastoor: '"",'
    // TarikhTaidRaisShobe: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    'تخصص فعلی': 'TakhasosFeli',
    'تخصص جدید': 'TakhasosJadid',
    ' گروه وضعیت فعلی': 'VaziatFeliGorooh',
    'رده وضعیت فعلی': 'VaziatFeliRade',
    'گروه وضعیت پیشنهادی': 'VaziatPishnahadiGorooh',
    'رده وضعیت پیشنهادی': 'VaziatPishnahadiRade',
    // Shobe: '"",'
  },
  3: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"",'
    'تاریخ انتساب': 'TarikhEntesab',
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // GirandeLafz: '"",'
    // TarikhTaidRiasat: '"",'
    // TarikhTaidDastoor: '"",'
    // TarikhTaidRaisShobe: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    سمت: 'Semat',
    'محل سازمانی': 'MahalSazmani',
    'شماره تخصص': 'TakhasosNo',
    'توضیحات انتصابات': 'EntesabatTozihat',
    سریال: 'Serial',
    بند: 'Baand',
    سطر: 'Satr',
    'کد ماده': 'CodeMadde',
    // m1: '"",'
    // m2: '"",'
    // m3: '"",'
    // m4: '"",'
    // m5: '"",'
    'سختی کار': 'SakhtiKar',
    'کد مقامات': 'CodeMaghamat',
    'کد راهبردی': 'CodeRahbordi',
    'کارشناسی فوق العاده': 'FogholadeKarshenasi',
    'یگان حقوقی': 'YeganHoghooghi',
    'سریال آجا': 'SerialAja',
    'نام قبلی': 'NamGhabli',
    'نشان قبلی': 'NeshanGhabli',
    'درجه قبلی': 'DarajeGhabli',
    'شماره درسنلی قبلی': 'PerNoGhabli',
    'علت قبلی': 'EllatGhabli',
    'توضیحات قبلی': 'TozihatGhabli',
    // Shobe: '"",'
  },
  4: {
    // "Dastoor",
    // "Madde",
    زیرماده: 'Zirmadde',
    // "ZirZirmadde": '"",'
    // "Eghdamgar": '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"تاریخ'",
    // TaidEghdamgar: '"",' 1
    // TaidRaisShobe: '"",' 0
    // TaidJaneshin: '"",' 0
    // TaidRais: '"",' 0
    // TaidRaisDastoor: '"",' 0
    // NamPedar: '"",'
    'تاریخ انتقال': 'EnteghalTarikhEnteghal',
    'مبدا انتقال': 'EnteghalMabda',
    'مقصد انتقال': 'EnteghalMaghsad',
    // EnteghalBedunHazineCheck: '"",'
    // EnteghalMoteahelCheck: '"",'
    // EnteghalHamsarCheck: '"",'
    // EnteghalFarzandCheck: '"",'
    'تعداد فرزند برای انتقال': 'EnteghalTedadFarzand',
    // EnteghalPedarCheck: '"",'
    // EnteghalMadarCheck: '"",'
    'تاریخ انتصاب': 'EntesabTarikhEntesab',
    'استنادیه انتصاب': 'EntesabEstenadie',
    'دوره انتصاب': 'EntesabDore',
    'منتصب به': 'EntesabMontasabBe',
    'تاریخ خروج انتصاب': 'KhorujTarikhEntesab',
    'استنادیه خروج': 'KhorujEstenadie',
    'دوره خروج': 'KhorujDore',
    'منتصب به (خروج)': 'KhorujMontasabBe',
    'تاریخ خروج': 'KhorujTarikhKhoruj',
    'تاریخ تغییر': 'TaghirTarikhTaghir',
    'کد قدیم (تغییر)': 'TaghirCodeGhadim',
    'کد جدید (تغییر)': 'TaghirCodeJadid',
    'تاریخ انتقال (کن لم)': 'KanLamTarikhEnteghal',
    'پایگاه (کن لم)': 'KanLamPaygah',
    // GirandeLafz: '"",'
    // TarikhTaidRiasat: '"",'
    // TarikhTaidDastoor: '"",'
    // TarikhTaidRaisShobe: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    // TarikhOdat: '"",'
    // EllateOdat: '"",'
    // OdatDahande: '"",'
    // Zamaem: '"",'
    // Shobe: '"",'
    'درجه فارغ التحصیلی': 'FareghOTahsiliDaraje',
    'نوع استخدام (فارغ التحصیلی)': 'FareghOTahsiliNoeEstekhdam',
    'عنوان تخصص (فارغ التحصیلی)': 'FareghOTahsiliOnvaneTakhasos',
    'شماره تخصص جدید (فارغ التحصیلی)': 'FareghOTahsiliShomareTakhasosJadid',
    'شماره تخصص قدیم (فارغ التحصیلی)': 'FareghOTahsiliShomareTakhasosGhadim',
    'تاریخ ترفیع (فارغ التحصیلی)': 'FareghOTahsiliTarfiTarikh',
    'تاریخ (فارغ التحصیلی)': 'FareghOTahsiliTarikh',
    'عقب افتادگی (فارغ التحصیلی)': 'FareghOTahsiliAghabOftadegi',
    'مدرک (فارغ التحصیلی)': 'FareghOTahsiliMadrak',
    'وضعیت تاهل (فارغ التحصیلی)': 'FareghOTahsiliVaziatTaahol',
    'یگان منتقله (فارغ التحصیلی)': 'FareghOTahsiliYeganMontaghele',
  },
  6: {
    // "Dastoor",
    // "Madde",
    زیرماده: 'Zirmadde',
    // "ZirZirmadde",
    // "Eghdamgar",
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    'علت اصلاح': 'EslahElat',
    'تاریخ اصلاح': 'EslahTarikh',
    'تاریخ ارتقا': 'ErteghaTarikh',
    'ماده ارتقا': 'ErteghaMadde',
    'تعداد سیر': 'SeyrTedad',
    // GirandeLafz: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    // TarikhOdat: '"",'
    // EllateOdat: '"",'
    // OdatDahande: '"",'
    ضمایم: 'Zamaem',
    'پایان آموزش عالی': 'AmoozeshAwliPayan',
    // Shobe: '"",'
  },
  7: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    'تاریخ نهست': 'TarikhNahast',
    'تاریخ فرار': 'TarikhFarar',
    'تاریخ مراجعت': 'TarikhMorajeat',
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    'نهست (مراجعت)': 'MorajeatNahast',
    'فرار (مراجعت)': 'MorajeatFarar',
    // Date: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // TarikhTaidRiasat: '"",'
    // TarikhTaidDastoor: '"",'
    // TarikhTaidRaisShobe: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // TaidJRaisShobe: '"",'
    // JRaisShobe: '"",'
    // TarikhTaidJRaisShobe: '"",'
    // EmzaJRaisShobe: '"",'
    // Shobe: '"شعبه'",
  },
  9: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    'استناد تخلیه': 'TakhlieEstenad',
    'تاریخ تخلیه': 'TakhlieTarikh',
    'محل تخلیه': 'TakhlieMahal',
    'تاریخ واگذاری': 'VagozariTarikh',
    'عنوان واگذاری۱': 'VagozariOnvan1',
    'عنوان واگذاری۲': 'VagozariOnvan2',
    'عنوان واگذاری۳': 'VagozariOnvan3',
    'عنوان واگذاری۴': 'VagozariOnvan4',
    'عنوان واگذاری۵': 'VagozariOnvan5',
    'هزینه واگذاری۱': 'VagozariHazine1',
    'هزینه واگذاری۲': 'VagozariHazine2',
    'هزینه واگذاری۳': 'VagozariHazine3',
    'هزینه واگذاری۴': 'VagozariHazine4',
    'هزینه واگذاری۵': 'VagozariHazine5',
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // Shobe: '"",'
  },
  10: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    'تاریخ ارتقا': 'TarikhErtegha',
    'دلیل ارتقا': 'DalileErtegha',
    'نوع ارتقا': 'NoeErtegha',
    'نوع پذیرش': 'NoePaziresh',
    'مقطع پذیرش': 'PazireshMaghta',
    'رشته پذیرش شده': 'PazireshReshte',
    'تاریخ فارغ التحصیلی': 'PazireshTarikhFaregh',
    'محل تحصیل پذیرش شده': 'PazireshMahalTahsil',
    'تاریخ پذیرش': 'PazireshTarikhPaziresh',
    'تخصص فعلی': 'PazireshTakhasosFeli',
    'تخصص (ارتقا)': 'ErteghaTakhasos',
    'مدت سنوات': 'ModatSanavat',
    'نوع خدمت': 'NoeKhedmat',
    'تاریخ شروع': 'TarikhShoru',
    'تاریخ پایان': 'TarikhPayan',
    'تایید یگان': 'YeganTaeed',
    'استنادیه سنوات': 'EstenadieSanavat',
    'تخصص قبلی': 'TakhasosGhabli',
    'تخصص جدید': 'TakhasosJadid',
    'تاریخ تغییر تخصص': 'TarikhTaghirTakhasos',
    'استنادیه تخصص': 'TakhasosEstenadie',
    'گروه قدیم': 'GoruhGhadim',
    'گروه جدید': 'GoruhJadid',
    'رده قدیم': 'RadeGhadim',
    'رده جدید': 'RadeJadid',
    // Date: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // TaidJRaisShobe: '"",'
    // JRaisShobe: '"",'
    // TarikhTaidJRaisShobe: '"",'
    // EmzaJRaisShobe: '"",'
    'مدرک ارشدیت': 'ArshadiatMadrak',
    'مدت ارشدیت': 'ArshadiatModat',
    'جمع کل ارشدیت': 'ArshadiatJamKol',
    'تاریخ ارشدیت': 'ArshadiatTarikh',
    'تاریخ برقراری': 'TarikhBargharari',
    // Shobe: '"",'
  },
  11: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    نسبت: 'Nesbat',
    // NamoNesh: '"",'
    'کد ملی': 'CodeMelli',
    'شماره شناسنامه': 'ShomareShenasname',
    'سریال شناسنامه': 'SerialShenasname',
    'تاریخ تولد': 'TarikhTavalod',
    'محل تولد': 'MahalTavalod',
    // NamPedar: '"نام' پدر",
    شغل: 'Shoghl',
    'شماره بیمه': 'ShomareBimeh',
    'مشخصات تغییری': 'MoshakhasatTaghiri',
    'مشخصات قدیمی': 'MoshakhasatGhadimi',
    'مشخصات جدید': 'MoshakhasatJadid',
    'مقطع تحصیلی': 'MaghtaTahsili',
    رشته: 'Reshte',
    دانشگاه: 'Daneshgah',
    'مهلت استفاده': 'MohlatEstefade',
    'تاریخ ازدواج': 'TarikhEzdevaj',
    // CheckEzdevajDovom: '"",'
    'شماره فرزند': 'ShomarFarzand',
    'شماره جنسیت': 'ShomarJensiat',
    'تاریخ خروج از عائله': 'TarikhKhorujAzAele',
    'تاریخ فوت': 'TarikhVafat',
    'تاریخ ازدواج فرزند': 'TarikhEzdevajFarzand',
    // Date: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // TaidJRaisShobe: '"",'
    // JRaisShobe: '"",'
    // TarikhTaidJRaisShobe: '"",'
    // EmzaJRaisShobe: '"",'
    // Shobe: '"",'
  },
  12: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    // Date: '"",'
    'تاریخ نهست': 'TarikhNahast',
    'مدت نهست': 'ModatNahast',
    استنادیه: 'Estenadie',
    'نوع تنبیه': 'NoeTanbih',
    'علت تنبیه': 'ElateTanbih',
    'کد تنبیهات': 'CodeTanbihat',
    'استنادیه تنبیه': 'EstenadieTanbih',
    // NoeTanbihTanbih: '"",'
    'تاریخ تنبیه': 'TarikhTanbih',
    'تاریخ فرار': 'TarikhFarar',
    مراجعت: 'Morajeat',
    جریمه: 'Jarime',
    جزا: 'Jaza',
    'تخفیف جزا': 'TakhfifJaza',
    'نوع تنبیه کن لم': 'NoeTanbihKan',
    'علت تنبیه کن لم': 'EllateTanbihatKan',
    'تاریخ تنبیه کن لم': 'TarikhTanbihKan',
    'علت تنزیل': 'TanzilEllat',
    'تاریخ تنزیل': 'TanzilTarikh',
    'نوع تنبیه تنزیل': 'TanzilNoeTanbih',
    // KhorujBedunTarikhSH: '"",'
    // KhorujBedunTarikhPa: '"",'
    'علت (بدون کار)': 'BedunKarEllat',
    'نوع (بدون کار)': 'BedunKarNoe',
    'تاریخ شروع (بدون کار)': 'BednKarTarikhSh',
    'تاریخ پایان (بدون کار)': 'BedunKarTarikhPa',
    'تاریخ محکومیت': 'TarikhMahkum',
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // TanbihNahast: '"",'
    'مدت تنبیه نهست': 'ModatTanbihNahast',
    // TaTarikhNahast: '"",'
    // TaidJRaisShobe: '"",'
    // JRaisShobe: '"",'
    // TarikhTaidJRaisShobe: '"",'
    // EmzaJRaisShobe: '"",'
    'نوع بیکاری': 'noeeBkari',
    'علت بیکاری': 'elatBkari',
    // Shobe: '"",'
  },
  15: {
    // Dastoor: '"",'
    // Madde: '"",'
    زیرماده: 'Zirmadde',
    // ZirZirmadde: '"",'
    // Eghdamgar: '"",'
    گیرنده۱: 'Girande1',
    گیرنده۲: 'Girande2',
    گیرنده۳: 'Girande3',
    گیرنده۴: 'Girande4',
    گیرنده۵: 'Girande5',
    گیرنده۶: 'Girande6',
    گیرنده۷: 'Girande7',
    گیرنده۸: 'Girande8',
    'شماره پرسنلی': 'PerNo',
    // Tarikh: '"",'
    // TarikhSabt: '"",'
    مدرک: 'Madrak',
    // GirandeCheck: '"",'
    // Girande2Check: '"",'
    // Girande3Check: '"",'
    // Girande4Check: '"",'
    'متن نامه': 'ToReport',
    // TabagheBimari1: '"",'
    // TabagheTarikh: '"",'
    // TabagheShenase1: '"",'
    // Tabaghe1: '"",'
    // TabagheModat1: '"",'
    // TabagheDovomCheck: '"",'
    // TabagheBimari2: '"",'
    // TabagheShenase2: '"",'
    // Tabaghe2: '"",'
    // tabagheModat2: '"",'
    'تاریخ استراحت': 'EsterahatTarikh',
    'مدت استراحت': 'EsterahatModat',
    // SabSurat: '"",'
    // SabBimari: '"",'
    // SabTarikh: '"",'
    // JanSurat: '"",'
    // JanDarsad: '"",'
    // JanModat: '"",'
    'تخصص (اشعه)': 'AshaeTakhasos',
    'سمت اشعه': 'AshaeSemat',
    'تاریخ اشعه': 'AshaeTarikh',
    'استنادیه اشعه': 'AshaeEstenadie',
    'اساس اشعه': 'AshaeAsas',
    // AshaeGoruhParto: '"",'
    'مدت اشعه': 'AshaeModat',
    'سمت (عامل)': 'AmelSemat',
    'یگان (عامل)': 'AmelYegan',
    'دوره (عامل)': 'AmelDore',
    // Date: '"",'
    // Girande5Check: '"",'
    // Girande6Check: '"",'
    // Girande7Check: '"",'
    // Girande8Check: '"",'
    // TaidEghdamgar: '"",'
    // TaidRaisShobe: '"",'
    // TaidJaneshin: '"",'
    // TaidRais: '"",'
    // TaidRaisDastoor: '"",'
    // RaisShobe: '"",'
    // Janeshin: '"",'
    // Rais: '"",'
    // RaisDastoor: '"",'
    // OnvanShobe: '"",'
    // EmzaEghdamgar: '"",'
    // EmzaRaisShobe: '"",'
    // EmzaJaneshin: '"",'
    // EmzaRais: '"",'
    // EmzaRaisDastoor: '"",'
    'از طرف': 'AzTaraf',
    // NamoNeshan: '"",'
    ضمایم: 'Zamaem',
    // TaidJRaisShobe: '"",'
    // JRaisShobe: '"",'
    // TarikhTaidJRaisShobe: '"",'
    // EmzaJRaisShobe: '"",'
    'توضیحات طبقه۱': 'tozihattabaghe1',
    'توضیحات طبقه۲': 'tozihattabaghe2',
    // Shobe: '"",'
  },
};

module.exports = {
  ranks,
  maddeHaCols,
  maddeHaNumbers,
};
