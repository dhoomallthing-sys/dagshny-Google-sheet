import { Question, Points } from "../types";
import { getUsedQuestionIds } from "./storageService";

// Helper to convert Drive View Links to Direct Image Links using Thumbnail API (More reliable for embedding)
const drive = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;

// قاعدة بيانات الأسئلة المحلية
// Note: IDs will be generated based on category and index to be deterministic for storage tracking
const STATIC_DB: Record<string, { q: string; a: string; p: Points; term?: string; customImg?: string; qImg?: string; aImg?: string; hint?: string }[]> = {
  "أعلام": [
    // Easy 200
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "السعودية", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396007/photo_1_2026-01-03_02-17-39_uaknpt.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396007/photo_1_2026-01-03_02-17-39_uaknpt.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "فرنسا", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396008/photo_2_2026-01-03_02-17-39_bsxhmh.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396008/photo_2_2026-01-03_02-17-39_bsxhmh.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "المانيا", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396009/photo_3_2026-01-03_02-17-39_g2glt5.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396009/photo_3_2026-01-03_02-17-39_g2glt5.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "النمسا", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396010/photo_4_2026-01-03_02-17-39_eqt5qv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396010/photo_4_2026-01-03_02-17-39_eqt5qv.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "تركيا", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767397427/photo_2026-01-03_02-43-10_qlioj9.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767397427/photo_2026-01-03_02-43-10_qlioj9.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "الجزائر", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396012/photo_6_2026-01-03_02-17-39_fua96f.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396012/photo_6_2026-01-03_02-17-39_fua96f.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "لبنان", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396013/photo_7_2026-01-03_02-17-39_en9u7w.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396013/photo_7_2026-01-03_02-17-39_en9u7w.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "تونس", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396015/photo_8_2026-01-03_02-17-39_kkkm7z.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396015/photo_8_2026-01-03_02-17-39_kkkm7z.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "اليمن", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396016/photo_9_2026-01-03_02-17-39_jgw4xv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396016/photo_9_2026-01-03_02-17-39_jgw4xv.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "العراق", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396018/photo_10_2026-01-03_02-17-39_cu8hsg.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396018/photo_10_2026-01-03_02-17-39_cu8hsg.jpg"
    },

    // Medium 400
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "موناكو", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396018/photo_11_2026-01-03_02-17-39_ivl8pb.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396018/photo_11_2026-01-03_02-17-39_ivl8pb.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "سلوفينيا", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396019/photo_12_2026-01-03_02-17-39_z7xvi3.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396019/photo_12_2026-01-03_02-17-39_z7xvi3.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "البوسنة", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396021/photo_13_2026-01-03_02-17-39_zogn2k.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396021/photo_13_2026-01-03_02-17-39_zogn2k.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "اوكرانيا", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396022/photo_14_2026-01-03_02-17-39_dkepy8.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396022/photo_14_2026-01-03_02-17-39_dkepy8.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "جزر القمر", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396024/photo_15_2026-01-03_02-17-39_rndymd.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396024/photo_15_2026-01-03_02-17-39_rndymd.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "الصومال", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396025/photo_16_2026-01-03_02-17-39_nickzl.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396025/photo_16_2026-01-03_02-17-39_nickzl.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "الفلبين", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396026/photo_17_2026-01-03_02-17-39_hbcow4.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396026/photo_17_2026-01-03_02-17-39_hbcow4.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "تايوان", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396028/photo_18_2026-01-03_02-17-39_fpaowg.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396028/photo_18_2026-01-03_02-17-39_fpaowg.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "طاجاكستان", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396029/photo_19_2026-01-03_02-17-39_rpa81a.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396029/photo_19_2026-01-03_02-17-39_rpa81a.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "سنغافورة", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396030/photo_20_2026-01-03_02-17-39_ad2crm.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396030/photo_20_2026-01-03_02-17-39_ad2crm.jpg"
    },

    // Hard 600
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "تايلاند", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396033/photo_22_2026-01-03_02-17-39_mbtn4m.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396033/photo_22_2026-01-03_22-06-56_mbtn4m.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "كوبا", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396035/photo_23_2026-01-03_02-17-39_lznpxn.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396035/photo_23_2026-01-03_02-17-39_lznpxn.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "البانيا", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396000/photo_24_2026-01-03_02-17-39_amjfxv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396000/photo_24_2026-01-03_02-17-39_amjfxv.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "جيبوتي", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396001/photo_25_2026-01-03_02-17-39_gtjoyx.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396001/photo_25_2026-01-03_02-17-39_gtjoyx.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "ماليزيا", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396001/photo_26_2026-01-03_02-17-39_hkkmkt.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396001/photo_26_2026-01-03_02-17-39_hkkmkt.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "فيتنام", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396002/photo_27_2026-01-03_02-17-39_zjpvep.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396002/photo_27_2026-01-03_02-17-39_zjpvep.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "الإكوادور", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396003/photo_28_2026-01-03_02-17-39_bil20l.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396003/photo_28_2026-01-03_02-17-39_bil20l.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "المجر", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396005/photo_29_2026-01-03_02-17-39_zlu2ot.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396005/photo_29_2026-01-03_02-17-39_zlu2ot.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "المالديف", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396005/photo_29_2026-01-03_02-17-39_zlu2ot.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767396005/photo_29_2026-01-03_02-17-39_zlu2ot.jpg"
    },
    { 
      q: "لأي دولة ينتمي هذا العلم؟", 
      a: "اذربيجان", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767397426/photo_2026-01-03_02-43-20_oewvve.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767397426/photo_2026-01-03_02-43-20_oewvve.jpg"
    }
  ],
  "للبنات": [
    // Easy 200
    { 
      q: "ما وظيفة هذه الاداة ؟", 
      a: "لفافات تجعل الشعر كيرلي", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356632/%D8%B3%D8%A4%D8%A7%D9%84_%D9%88%D8%A7%D8%AD%D8%AF_1_dvynzj.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356632/%D8%B3%D8%A4%D8%A7%D9%84_%D9%88%D8%A7%D8%AD%D8%AF_1_dvynzj.jpg"
    },
    { 
      q: "ما اسم شركة هذة الفرشة ؟", 
      a: "كلارا", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356634/%D8%B3%D8%A4%D8%A7%D9%84_%D8%A7%D8%AB%D9%86%D9%8A%D9%86_%D8%B3%D8%A4%D8%A7%D9%84_1_cgk0tu.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356634/%D8%B3%D8%A4%D8%A7%D9%84_%D8%A7%D8%AB%D9%86%D9%8A%D9%86_%D8%AC%D9%88%D8%A7%D8%A8_1_p7eylk.jpg"
    },
    { 
      q: "براند تشتهر شنطه بحرف الـ H؟", 
      a: "هيرميس ( Hermès )", 
      p: 200, 
      term: "hermes bag logo"
    },
    { 
      q: "ما وظيفة هذا المنتج ؟", 
      a: "جل تصفيف الشعر", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356630/%D8%B3%D8%A4%D8%A7%D9%84_%D8%A7%D8%B1%D8%A8%D8%B9%D8%A9_%D8%B3%D8%A4%D8%A7%D9%84_1_rdt5iv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356635/%D8%B3%D8%A4%D8%A7%D9%84_%D8%A7%D8%B1%D8%A8%D8%B9%D8%A9_%D8%AC%D9%88%D8%A7%D8%A8_1_fmffam.jpg"
    },

    // Medium 400
    { 
      q: "ما أسم هذه الحقيبة من ديور ؟", 
      a: "Lady", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356632/%D8%B3%D8%A4%D8%A7%D9%84_6_1_vq8b8g.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356632/%D8%B3%D8%A4%D8%A7%D9%84_6_1_vq8b8g.jpg"
    },
    { 
      q: "براند بدأ كدار أزياء ثم اشتهر بالعطور ؟", 
      a: "شانيل ( chanel )", 
      p: 400, 
      term: "chanel perfume"
    },
    { 
      q: "ما اسم براند هذا البلاشر ؟", 
      a: "سان لوران", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356630/%D8%B3%D8%A4%D8%A7%D9%84_%D8%AB%D9%85%D8%A7%D9%86%D9%8A%D8%A9_%D8%B3%D8%A4%D8%A7%D9%84_1_xooqbh.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356630/%D8%B3%D8%A4%D8%A7%D9%84_%D8%AB%D9%85%D8%A7%D9%86%D9%8A%D8%A9_%D8%AC%D9%88%D8%A7%D8%A8_1_uscsow.jpg"
    },
    { 
      q: "ما اول براند ميكب انشهر عالمياً ؟", 
      a: "ماكس فاكتور", 
      p: 400, 
      term: "max factor vintage"
    },

    // Hard 600
    { 
      q: "من صاحبة براند Refy ؟", 
      a: "جيسيكا الملقبه بـ Gess", 
      p: 600, 
      term: "jess hunt refy"
    },
    { 
      q: "في أي مدينة افتتح فيها براند سان لوران ؟", 
      a: "باريس", 
      p: 600, 
      term: "ysl paris store"
    },
    { 
      q: "ما هو اول براند سعودي وصل للعالمية وافتتح خارج السعودية ومن صاحبته ؟", 
      a: "براند ( Moonglaze ) على يد يارا النملة", 
      p: 600, 
      term: "yara alnamlah moonglaze"
    },
    { 
      q: "في ماذا تستعمل هذه الاداة ؟", 
      a: "توسيع الخواتم", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356634/%D8%B3%D8%A4%D8%A7%D9%84_15_1_wxheny.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767356634/%D8%B3%D8%A4%D8%A7%D9%84_15_1_wxheny.jpg"
    }
  ],
  "حروف": [
    // Easy 200
    { 
      q: "نبي سميت سورة من القران بأسمه ؟", 
      a: "ابراهيم عليه السلام", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "اخر الكتب السماوية ؟", 
      a: "القران", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg"
    },
    { 
      q: "من العشرة المبشرين بالجنة امه صفية بنت عبدالمطلب ؟", 
      a: "الزبير بن العوام", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468823/photo_21_2026-01-03_22-06-56_dmji64.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468823/photo_21_2026-01-03_22-06-56_dmji64.jpg"
    },
    { 
      q: "ماهو الحيوان الذي له ١٥٠٠ اسم في اللغة العربية ؟", 
      a: "اسد", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "سورة تنتهي جميع اياتها بحرف السين ؟", 
      a: "الناس", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468814/photo_15_2026-01-03_22-06-56_azeecw.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468814/photo_15_2026-01-03_22-06-56_azeecw.jpg"
    },
    { 
      q: "اين ولد سيدنا ابراهيم عليه السلام ؟", 
      a: "العراق", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468805/photo_8_2026-01-03_22-06-56_aea8ga.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468805/photo_8_2026-01-03_22-06-56_aea8ga.jpg"
    },
    { 
      q: "سورة في القران الكريم ابتدأت باسم ثمرتين ؟", 
      a: "التين", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468794/photo_27_2026-01-03_22-06-56_fyquun.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468794/photo_27_2026-01-03_22-06-56_fyquun.jpg"
    },
    { 
      q: "من اقدم الخطوط في اللغة العربية ؟", 
      a: "الكوفي", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468804/photo_7_2026-01-03_22-06-55_htxafn.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468804/photo_7_2026-01-03_22-06-55_htxafn.jpg"
    },
    { 
      q: "من اخترع المصباح الكهربائي؟", 
      a: "أديسون", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "ما اسم الاصبع الذي يلي الاصغر في اليد ؟", 
      a: "بنصر", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "حيوان يطلق عليه اسم أسامه", 
      a: "الأسد", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "اول من سمى القران مصحف ؟", 
      a: "أبو بكر الصديق رضي الله عنه", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },

    // Medium 400
    { 
      q: "مامعنى اسم اديس بابا ؟", 
      a: "الزهرة الجميلة", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468823/photo_21_2026-01-03_22-06-56_dmji64.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468823/photo_21_2026-01-03_22-06-56_dmji64.jpg"
    },
    { 
      q: "من معاني اسم هشام؟", 
      a: "الجود", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg"
    },
    { 
      q: "ما هو الاسم الذي يطلق على صفار البيض ؟", 
      a: "المح", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468798/photo_2_2026-01-03_22-06-55_qmuibv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468798/photo_2_2026-01-03_22-06-55_qmuibv.jpg"
    },
    { 
      q: "ماهو الشي الذي يلازمك طول عمرك ؟", 
      a: "اسمك", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "ماهو المكون الرئيسي لاعواد الكبريت؟", 
      a: "الفوسفور", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468807/photo_10_2026-01-03_22-06-56_upnwin.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468807/photo_10_2026-01-03_22-06-56_upnwin.jpg"
    },
    { 
      q: "ما الشيء الذي له ٤ ارجل ولايستطيع السير ؟", 
      a: "الكرسي", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468804/photo_7_2026-01-03_22-06-55_htxafn.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468804/photo_7_2026-01-03_22-06-55_htxafn.jpg"
    },
    { 
      q: "رجل عادي ولكن الجميع يرفعون قباعاتهم له فمن هو؟", 
      a: "الحلاق", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468793/photo_26_2026-01-03_22-06-56_timemj.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468793/photo_26_2026-01-03_22-06-56_timemj.jpg"
    },
    { 
      q: "من هو امين الرسول عليه الصلاة والسلام على نفقاته ؟", 
      a: "بلال ابن رباح رضي الله عنه", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "كلمة تعني الحزن ؟", 
      a: "ترح", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468794/photo_27_2026-01-03_22-06-56_fyquun.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468794/photo_27_2026-01-03_22-06-56_fyquun.jpg"
    },
    { 
      q: "من فقدت ولدها تسمى ؟", 
      a: "ثكلى", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468815/photo_16_2026-01-03_22-06-56_iqa6w0.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468815/photo_16_2026-01-03_22-06-56_iqa6w0.jpg"
    },
    { 
      q: "من بحور الشعر العربي ؟", 
      a: "البسيط", 
      p: 400, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "من هو اول صحابي قرأ القران جهراً", 
      a: "عبدالله بن مسعود رضي الله عنه", 
      p: 400,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468805/photo_8_2026-01-03_22-06-56_aea8ga.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468805/photo_8_2026-01-03_22-06-56_aea8ga.jpg"
    },

    // Hard 600
    { 
      q: "ما اسم ناقة النبي عليه الصلاة والسلام ؟", 
      a: "القصواء", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg"
    },
    { 
      q: "ستة يمشون على درب الهوى خمسة مالهم اثر و والسادس له اثر فمن هو السادس ؟", 
      a: "القلم", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468809/photo_11_2026-01-03_22-06-56_ov9ozu.jpg"
    },
    { 
      q: "عالم عربي اول من صنع الساعات ووضعها على مدخل الجامع الأموي في دمشق ؟", 
      a: "رضوان بن محمد الساعاتي", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468811/photo_13_2026-01-03_22-06-56_rcokvy.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468811/photo_13_2026-01-03_22-06-56_rcokvy.jpg"
    },
    { 
      q: "ما السورة التي تسمى بني النضير ؟", 
      a: "الحشر", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468793/photo_26_2026-01-03_22-06-56_timemj.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468793/photo_26_2026-01-03_22-06-56_timemj.jpg"
    },
    { 
      q: "ما يتبقى في قاع الكأس أو الإناء من السائل بعد الشرب؟", 
      a: "الثمالة", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468815/photo_16_2026-01-03_22-06-56_iqa6w0.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468815/photo_16_2026-01-03_22-06-56_iqa6w0.jpg"
    },
    { 
      q: "اول عملية زرع قلب ناجحة في العالم أجريت في؟", 
      a: "جنوب افريقيا", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg"
    },
    { 
      q: "ماذا يسمى يوم الثلاثاء في الجاهلية ؟", 
      a: "جُبار", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468796/photo_1_2026-01-03_22-06-55_ftryqc.jpg"
    },
    { 
      q: "إسم يطلق على نوع من الصقور ؟", 
      a: "الباز", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "عاصمة قديمة للشام أيام البيزنطيين ؟", 
      a: "انطاكية", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468817/photo_17_2026-01-03_22-06-56_de2ujv.jpg"
    },
    { 
      q: "عالم مسلم هو اول من اكتشف ان سرعة الضوء أكبر من سرعة الصوت ؟", 
      a: "البيروني", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "الاسم القديم الذي كان يطلق على بائع الأقمشة والحرير؟", 
      a: "بزاز", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468824/photo_22_2026-01-03_22-06-56_wip5l7.jpg"
    },
    { 
      q: "ما اسم الدولة الأكبر استهلاكاً للقهوة في العالم؟", 
      a: "فنلندا", 
      p: 600, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468807/photo_10_2026-01-03_22-06-56_upnwin.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767468807/photo_10_2026-01-03_22-06-56_upnwin.jpg"
    }
  ],
  "يوتيوب سعودي": [
    { q: "من هو صاحب قناة 'مجرم قيمز'؟", a: "عبد الرحمن الدحيلان", p: 200, term: "mjrm games" },
    { q: "برنامج كرتوني سعودي شهير من إنتاج ميركوت؟", a: "مسامير", p: 200, term: "masameer show" },
    { q: "من هو اليوتيوبر المعروف بلقب 'سحس' واشتهر بتحديات الأكل؟", a: "حسين سلام", p: 200, term: "s7s eating" },
    { q: "قناة سعودية كوميدية اشتهرت ببرنامج 'خمبلة'؟", a: "تلفاز 11", p: 400, term: "telfaz11 logo" },
    { q: "من هو مقدم برنامج 'إيش اللي'؟", a: "بدر صالح", p: 400, term: "bader saleh" },
    { q: "يوتيوبر سعودي اشتهر بالسفر والمغامرات (جو حطاب)؟", a: "جو حطاب", p: 400, term: "joe hattab" },
    { q: "قناة تقنية سعودية شهيرة يقدمها فيصل السيف؟", a: "Uptodate (تيك بيلز حالياً)", p: 400, term: "faisal alsaif" },
    { q: "شخصية كرتونية سعودية مشهورة في اليوتيوب لونها أصفر؟", a: "سلتوح", p: 600, term: "masameer saltooh" },
    { q: "برنامج يقدمه مؤيد الثقفي وفهد البتيري قديماً؟", a: "على الطاير", p: 600, term: "fahad albutairi" },
    { q: "من هو اليوتيوبر السعودي الذي وصل للعالمية بمحتوى القيمنق (بندريتا)؟", a: "بندر مدخلي", p: 600, term: "banderitax" }
  ],
  "تموينات": [
    { q: "مطعم وجبات سريعة سعودي اشتهر بالبروست وشعاره الكتكوت؟", a: "البيك", p: 200, term: "albaik chicken" },
    { q: "شركة ألبان سعودية تعتبر من الأكبر في العالم؟", a: "المراعي", p: 200, term: "almarai logo" },
    { q: "شركة مياه غازية سعودية قديمة اشتهرت بمشروب 'حمضيات'؟", a: "حمضيات (انتاج شركة المشروبات الغازية)", p: 200, term: "mirinda citrus" },
    { q: "سلسلة صيدليات سعودية شهيرة؟", a: "النهدي", p: 400, term: "nahdi pharmacy" },
    { q: "شركة شوكولاتة سعودية شهيرة تنتج 'سفاري' و'توفي لك'؟", a: "غندور", p: 400, term: "ghandour safari" },
    { q: "علامة تجارية سعودية للشاي شعارها ورقة حمراء؟", a: "ربيع", p: 400, term: "rabea tea" },
    { q: "شركة سعودية رائدة في مجال الاتصالات؟", a: "STC", p: 400, term: "stc saudi" },
    { q: "ماركة عطور سعودية فاخرة (عبدالصمد ...)؟", a: "عبدالصمد القرشي", p: 600, term: "asq perfumes" },
    { q: "شركة دواجن سعودية شهيرة؟", a: "الوطنية أو فقيه", p: 600, term: "watania poultry" },
    { q: "سلسلة مكتبات سعودية شهيرة؟", a: "جرير", p: 600, term: "jarir bookstore" }
  ],
  "حنكة": [
    { q: "ما هو الشيء الذي كلما أخذت منه كبر؟", a: "الحفرة", p: 200, term: "hole in ground" },
    { q: "شيء له أسنان ولا يعض؟", a: "المشط", p: 200, term: "comb" },
    { q: "أخت خالك وليست خالتك، من تكون؟", a: "أمك", p: 200, term: "mother thinking" },
    { q: "ما هو الشيء الذي يكتب ولا يقرأ؟", a: "القلم", p: 400, term: "pen writing" },
    { q: "شيء كلما زاد نقص؟", a: "العمر", p: 400, term: "old clock" },
    { q: "له مدن وليس له منازل، وله جبال وليس له أشجار، وله مياه وليس له أسماك؟", a: "الخريطة", p: 400, term: "world map" },
    { q: "ما هو الشيء الذي يحملك وتحمله في نفس الوقت؟", a: "الحذاء", p: 400, term: "shoes" },
    { q: "ابن أمك وأبيك، وليس أختك ولا أخاك.. فمن يكون؟", a: "أنت", p: 600, term: "mirror reflection" },
    { q: "شيء تذبحه وتبكي عليه؟", a: "البصل", p: 600, term: "onion cutting" },
    { q: "بيت ليس فيه أبواب ولا نوافذ؟", a: "بيت الشعر", p: 600, term: "arabic tent poem" }
  ],
  "سيارات": [
    // This category is now primarily populated via the API, 
    // but we keep static entries for fallback or game count calculation purposes.
    // Easy 200
    { 
      q: "ما أسم السياره ؟", 
      a: "هونداي اكسنت", 
      p: 200, 
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767288169/%D8%B3%D9%87%D9%84%D8%A9_%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9_%D9%88%D8%A7%D8%AD%D8%AF_opei61.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767288169/%D8%B3%D9%87%D9%84%D8%A9_%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9_%D9%88%D8%A7%D8%AD%D8%AF_opei61.jpg"
    },
    // ... (rest of the static car questions remain as fallback)
  ],
  "أنمي": [
    // Game 1
    // Easy 200
    { 
      q: "ما قدرة البطل؟", 
      a: "العودة للحياة", 
      p: 200, 
      term: "Re Zero Subaru",
      customImg: "https://tse1.mm.bing.net/th?q=Subaru+Natsuki+Re+Zero+Anime+Face&w=400&h=400&c=7"
    },
    { 
      q: "ما صلة الشخصية بالبطل؟", 
      a: "اخوه", 
      p: 200, 
      term: "Sho Kusakabe",
      customImg: "https://tse1.mm.bing.net/th?q=Sho+Kusakabe+Fire+Force+Anime&w=400&h=400&c=7"
    },
    // Medium 400
    { 
      q: "مع من تدرب ناروتو استعدادًا لهجوم باين؟", 
      a: "مع الضفادع في جبل ميوبوكو", 
      p: 400, 
      term: "Naruto Sage Mode",
      customImg: "https://tse1.mm.bing.net/th?q=Naruto+Sage+Mode+Pain+Arc&w=400&h=400&c=7"
    },
    { 
      q: "من هو أول هوكاغي لقرية الورق المخفية ومؤسسها إلى جانب 'مادارا أوتشيها'؟", 
      a: "هاشيراما", 
      p: 400, 
      term: "Hashirama Senju",
      customImg: "https://tse1.mm.bing.net/th?q=Hashirama+Senju+Naruto+Anime&w=400&h=400&c=7" 
    },
    // Hard 600
    { 
      q: "في انمي ون بيس ما هي الأسماء الكاملة للأسلحة الأسطورية القديمة الثلاثة؟", 
      a: "بلوتون، بوسيدون وأورانوس", 
      p: 600, 
      term: "One Piece Logo",
      customImg: "https://tse1.mm.bing.net/th?q=One+Piece+Anime+Logo+Title&w=400&h=400&c=7"
    },
    { 
      q: "ما هو الاسم الذي يُطلق على السيوف الملونة الخاصة بقاتلي الشياطين والتي تُستخدم لقتل الشياطين؟", 
      a: "سيوف النيتشيرين", 
      p: 600, 
      term: "Demon Slayer Anime",
      customImg: "https://tse1.mm.bing.net/th?q=Demon+Slayer+Kimetsu+no+Yaiba+Poster&w=400&h=400&c=7"
    },
    // Game 2
    // Easy 200
    { 
      q: "في أي فئة وزن ينافس إيبو ماكونوتشي بشكل أساسي في مسيرته الاحترافية؟",
      a: "وزن الريشة",
      p: 200,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360062/photo_5_2026-01-02_16-15-27_ss830e.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360062/photo_5_2026-01-02_16-15-27_ss830e.jpg"
    },
    { 
      q: "ما هو اسم أول جندي ظل يمتلك القدرة على الكلام (ملك النمل سابقاً)؟",
      a: "بيرو",
      p: 200,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360063/photo_6_2026-01-02_16-15-27_nt0l5b.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360063/photo_6_2026-01-02_16-15-27_nt0l5b.jpg"
    },
    // Medium 400
    { 
      q: "في انمي ون بيس ما هو اسم السلاح المميز لنامي؟",
      a: "عصا المناخ",
      p: 400,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360054/photo_18_2026-01-02_16-15-27_mhrgku.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360054/photo_18_2026-01-02_16-15-27_mhrgku.jpg"
    },
    { 
      q: "في انمي هجوم العمالقة ما هو اسم الجدار الخارجي الأول الذي تم اختراقه في بداية القصة؟",
      a: "جدار ماريا",
      p: 400,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360055/photo_19_2026-01-02_16-15-27_uqzveg.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360055/photo_19_2026-01-02_16-15-27_uqzveg.jpg"
    },
    // Hard 600
    { 
      q: 'ما هي التقنية الملعونة التي يستخدمها "ميغومي فوشيغورو" والتي تسمح له باستدعاء الشيكيغامي (حيوانات الظل)؟',
      a: "تقنية الظلال العشرة",
      p: 600,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360052/photo_16_2026-01-02_16-15-27_o7bljl.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767360052/photo_16_2026-01-02_16-15-27_o7bljl.jpg"
    },
    { 
      q: "ما هو اسم اللعبة/العالم الافتراضي الذي دخله غون وكيلوا لزيادة تدريبهم على النين؟",
      a: "قراند آيسلند (جزيرة الطمع)",
      p: 600,
      qImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767363226/hunter-x-hunter_dwr2xg.jpg",
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767363226/hunter-x-hunter_dwr2xg.jpg"
    }
  ],
  "كرة قدم سعودية": [
    // ... (unchanged) ...
    {
      q: "من هو اللاعب الذي سجل هدف الفوز التاريخي للسعودية ضد الأرجنتين في كأس العالم 2022؟",
      a: "سالم الدوسري",
      p: 200,
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767467098/photo_13_2026-01-03_22-02-20_xrpm3a.jpg"
    },
    // ... (rest of questions)
  ],
  "تاريخ": [
    // ... (unchanged)
    { q: "من هو أول رئيس للولايات المتحدة الأمريكية؟", a: "جورج واشنطن", p: 200, term: "george washington" },
    // ...
  ],
  "قصص الأنبياء": [
    // ... (unchanged)
    { q: "من هو النبي الذي لُقّب بـ \"خليل الله\"؟", a: "ابراهيم عليه السلام", p: 200, term: "Prophet Abraham" },
    // ...
  ],
  "علوم": [
    // ... (unchanged)
    { q: "ما هي أصغر وحدة بنائية في المادة؟", a: "الذرة", p: 200, term: "atom model" },
    // ...
  ],
  "معلومات عامة": [
    // ... (unchanged)
    { 
      q: "ما هي الدولة التي اشتهرت بأطباق البوريتو، والكاساديا، والتاكو؟", 
      a: "المكسيك", 
      p: 200, 
      term: "mexican food tacos" 
    },
    // ...
  ],
  "اسلاميات": [
    // ... (unchanged)
    { q: "إلى أين هاجر الصَّحابة أوَّل هجرةٍ في الإسلام؟", a: "إلى الحبشة", p: 200, term: "ethiopia landscape" },
    // ...
  ],
  "فيديو قيمز": [
    // ... (unchanged)
    { 
      q: "ما هي اللعبة الشهيرة التي يعتمد عالمها بالكامل على البناء والهدم باستخدام \"المكعبات\"؟", 
      a: "ماينكرافت", 
      p: 200, 
      aImg: "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767392090/photo_1_2026-01-03_01-08-49_ajbtej.jpg",
      term: "minecraft gameplay" 
    },
    // ...
  ]
};

// Function to calculate how many full games are available for a category
export const getCategoryGameCount = (categoryName: string): number => {
  const questions = STATIC_DB[categoryName];
  if (!questions) return 0;
  
  const usedIds = getUsedQuestionIds();

  // Helper to check if a specific question index is used
  const isUsed = (idx: number) => usedIds.includes(`${categoryName}-${idx}`);

  // Count *unused* questions in each difficulty
  const easyCount = questions.filter((q, i) => q.p === 200 && !isUsed(i)).length;
  const mediumCount = questions.filter((q, i) => q.p === 400 && !isUsed(i)).length;
  const hardCount = questions.filter((q, i) => q.p === 600 && !isUsed(i)).length;
  
  // A game needs 2 easy, 2 medium, 2 hard.
  // The number of games is determined by the limiting factor (divided by 2).
  const minCount = Math.min(easyCount, mediumCount, hardCount);
  return Math.floor(minCount / 2);
};

export const preloadCarsData = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://api.sheety.co/e1d05c2504d597feb758d2d88e581b32/dagshny/sheet1');
    const json = await response.json();
    const sheetData = json.sheet1 || [];
    
    const mappedQuestions = sheetData
      .filter((item: any) => item.category === 'السيارات')
      .map((item: any) => {
        let points: Points = 200;
        const diff = String(item.difficulty).toLowerCase();
        if (diff.includes('400') || diff.includes('متوسط') || diff.includes('medium')) points = 400;
        if (diff.includes('600') || diff.includes('صعب') || diff.includes('hard')) points = 600;

        return {
          q: item.question,
          a: item.answer,
          p: points,
          qImg: item.theImageOnQuestionScreen,
          aImg: item.theImageOnAnswerScreen
        };
      });
      
    if (mappedQuestions.length > 0) {
      STATIC_DB['سيارات'] = mappedQuestions;
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error fetching cars questions:", error);
    return false;
  }
};

export const generateQuestionsForCategory = async (categoryName: string): Promise<Question[]> => {
  // Simulate network delay for effect
  await new Promise(resolve => setTimeout(resolve, 800));

  let allQuestions = STATIC_DB[categoryName] || [];
  
  // If category not found, return empty array
  if (allQuestions.length === 0) return [];

  const usedIds = getUsedQuestionIds();

  // Helper to get random unique items that are NOT used
  const getRandom = (arr: { item: any, originalIndex: number }[], n: number) => {
    // Filter out used questions
    const available = arr.filter(entry => !usedIds.includes(`${categoryName}-${entry.originalIndex}`));
    
    // Shuffle available questions
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  // Prepare questions with their original indices to maintain ID consistency
  const indexedQuestions = allQuestions.map((q, i) => ({ item: q, originalIndex: i }));

  // Select 2 from each difficulty
  const easy = getRandom(indexedQuestions.filter(entry => entry.item.p === 200), 2);
  const medium = getRandom(indexedQuestions.filter(entry => entry.item.p === 400), 2);
  const hard = getRandom(indexedQuestions.filter(entry => entry.item.p === 600), 2);

  const selectedEntries = [...easy, ...medium, ...hard];

  // Science Images Pool
  const SCIENCE_IMAGES = [
    "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292525/%D8%B5%D9%88%D8%B1_%D8%B9%D9%84%D9%88%D9%85_zlcy3p.jpg",
    "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292527/%D8%B5%D9%88%D8%B1_%D8%B9%D9%84%D9%88%D9%85_2_fdbg2k.jpg",
    "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292524/%D8%B5%D9%88%D8%B1_%D8%B9%D9%84%D9%88%D9%85_3_pfxh1o.jpg",
    "https://res.cloudinary.com/dz3uyz8ko/image/upload/v1767292525/%D8%B5%D9%88%D8%B1_%D8%B9%D9%84%D9%88%D9%85_4_qznlct.jpg"
  ];

  return selectedEntries.map((entry) => {
    const q = entry.item;
    const index = entry.originalIndex;

    // Default image logic fallback
    let defaultImg = q.customImg;

    // Special handling for Science category to ensure images
    if (categoryName === "علوم" && !defaultImg) {
       defaultImg = SCIENCE_IMAGES[Math.floor(Math.random() * SCIENCE_IMAGES.length)];
    } 
    
    // Fallback for others using Unsplash
    if (!defaultImg && q.term) {
       defaultImg = `https://source.unsplash.com/featured/?${encodeURIComponent(q.term)}`;
    }
    
    // Explicitly check for specific question/answer images, otherwise fall back to default
    const questionImg = q.qImg || defaultImg;
    const answerImg = q.aImg || defaultImg;

    return {
      // Deterministic ID for storage tracking: category-index
      id: `${categoryName}-${index}`, 
      category: categoryName,
      question: q.q,
      answer: q.a,
      points: q.p,
      // Used only for legacy compatibility or if single image needed
      imageUrl: defaultImg, 
      questionImg: questionImg,
      answerImg: answerImg,
      isUsed: false,
      hint: q.hint // Pass the hint property
    };
  });
};