// Lightweight UI-string translation for the portal chrome (not article
// content, which is already filed in its own language). Hindi + Bengali +
// English cover the launch districts.

export type Lang = "en" | "hi" | "bn";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "bn", label: "বাং" },
];

const DICT = {
  en: {
    home: "HOME",
    reels: "Reels",
    install: "Install App",
    advertise: "Advertise with us",
    reporterLogin: "Reporter login",
    searchPh: "Search news, districts, tags…",
    useLoc: "Use my location",
    topStories: "Top stories",
    viewMore: "View More",
    live: "LIVE",
    liveNow: "Live now",
    breaking: "BREAKING",
    sponsored: "SPONSORED",
    nearYou: "News near you",
    noVideos: "No videos yet in",
    beFirst: "Be the first to report — sign in and post a video.",
    notifications: "Notifications",
    detecting: "Detecting your location…",
    change: "Change",
    results: "Results for",
  },
  hi: {
    home: "होम",
    reels: "रील्स",
    install: "ऐप इंस्टॉल करें",
    advertise: "विज्ञापन दें",
    reporterLogin: "रिपोर्टर लॉगिन",
    searchPh: "खबर, ज़िला, टैग खोजें…",
    useLoc: "मेरी लोकेशन",
    topStories: "मुख्य खबरें",
    viewMore: "और देखें",
    live: "लाइव",
    liveNow: "अभी लाइव",
    breaking: "ब्रेकिंग",
    sponsored: "प्रायोजित",
    nearYou: "आपके पास की खबरें",
    noVideos: "अभी कोई वीडियो नहीं",
    beFirst: "सबसे पहले रिपोर्ट करें — साइन इन करके वीडियो पोस्ट करें।",
    notifications: "सूचनाएं",
    detecting: "आपकी लोकेशन ढूंढ रहे हैं…",
    change: "बदलें",
    results: "परिणाम",
  },
  bn: {
    home: "হোম",
    reels: "রিলস",
    install: "অ্যাপ ইনস্টল করুন",
    advertise: "বিজ্ঞাপন দিন",
    reporterLogin: "রিপোর্টার লগইন",
    searchPh: "খবর, জেলা, ট্যাগ খুঁজুন…",
    useLoc: "আমার লোকেশন",
    topStories: "প্রধান খবর",
    viewMore: "আরও দেখুন",
    live: "লাইভ",
    liveNow: "এখন লাইভ",
    breaking: "ব্রেকিং",
    sponsored: "স্পনসর্ড",
    nearYou: "আপনার কাছের খবর",
    noVideos: "এখনও কোনো ভিডিও নেই",
    beFirst: "প্রথম রিপোর্ট করুন — সাইন ইন করে ভিডিও পোস্ট করুন।",
    notifications: "বিজ্ঞপ্তি",
    detecting: "আপনার লোকেশন খুঁজছি…",
    change: "পরিবর্তন",
    results: "ফলাফল",
  },
};

export type TKey = keyof typeof DICT.en;

export function makeT(lang: Lang) {
  return (key: TKey): string => DICT[lang][key] ?? DICT.en[key];
}
