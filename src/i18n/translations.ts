export type Language = 'en' | 'ar' | 'hi';

export interface TranslationDictionary {
  // Brand & Header
  appName: string;
  tagline: string;
  daylightMode: string;
  nightSanctuary: string;
  unlockAll: string;
  sovereign: string;
  userProfile: string;
  selectLanguage: string;
  currentLangName: string;

  // 4 Content Pillars
  audiobookTitle: string;
  audiobookSubtitle: string;
  audiobookDesc: string;
  audiobookTag: string;
  ch1Free: string;

  meditationTitle: string;
  meditationSubtitle: string;
  meditationDesc: string;
  meditationTag: string;
  browseSeries: string;

  storiesTitle: string;
  storiesSubtitle: string;
  storiesDesc: string;
  storiesTag: string;
  exploreStories: string;

  musicTitle: string;
  musicSubtitle: string;
  musicDesc: string;
  musicTag: string;
  exploreMusic: string;

  // Bell & Sleep
  featuredBellBadge: string;
  featuredBellSubtitle: string;
  listenTonight: string;
  pauseBell: string;
  min: string;

  // SOS Pause
  sosTitle: string;
  sosSubtitle: string;
  emergencyReset: string;

  // Stories Section
  storiesHeroTitle: string;
  storiesHeroSubtitle: string;
  whenLifeFeelsTooMuch: string;
  whenLifeFeelsTooMuchDesc: string;
  realJourneys: string;
  realJourneysDesc: string;
  lifeStories: string;
  lifeStoriesDesc: string;
  comebackStories: string;
  comebackStoriesDesc: string;
  wisdomStories: string;
  wisdomStoriesDesc: string;
  howAreYouFeeling: string;
  howAreYouFeelingPrompt: string;
  feelings: {
    stressed: string;
    overwhelmed: string;
    lonely: string;
    angry: string;
    better: string;
    grateful: string;
  };
  recommendations: {
    forStressed: string;
    forOverwhelmed: string;
    forLonely: string;
    forAngry: string;
    forBetter: string;
    forGrateful: string;
    startNow: string;
  };

  // Music Section
  musicHeroTitle: string;
  musicHeroSubtitle: string;
  songsCollection: string;
  hindiTrack: string;
  englishTrack: string;
  nowPlaying: string;
  listenNow: string;

  // Navigation & General
  backToHome: string;
  authorProfile: string;
  vault: string;
  offlineReady: string;
  freeAudio: string;
  paidAudio: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Human 2.0 Audio Book',
    tagline: 'Awareness — Future Ready with AI',
    daylightMode: 'Daylight Mode',
    nightSanctuary: 'Night Sanctuary',
    unlockAll: 'Unlock All',
    sovereign: 'Sovereign',
    userProfile: 'User Profile',
    selectLanguage: 'Language',
    currentLangName: 'English',

    audiobookTitle: 'Audio Book',
    audiobookSubtitle: 'Dedicated Listen Section',
    audiobookDesc: 'Human 2.0 Audiobook (45 Chapters)',
    audiobookTag: '45 Ch',
    ch1Free: 'Ch 1 Free',

    meditationTitle: 'Meditation',
    meditationSubtitle: 'Restorative Series',
    meditationDesc: 'Explore All Series',
    meditationTag: 'Series',
    browseSeries: 'Browse Series',

    storiesTitle: 'Human 2.0 Stories',
    storiesSubtitle: 'Real Life · Real Shifts',
    storiesDesc: 'Real Life. Real Emotions. A New Response.',
    storiesTag: 'Stories',
    exploreStories: 'Watch Stories',

    musicTitle: 'Music',
    musicSubtitle: 'Conscious Audio',
    musicDesc: 'Songs & Mood-Based Audio',
    musicTag: 'Songs',
    exploreMusic: 'Listen Music',

    featuredBellBadge: "Tonight's Featured Bell Sound · 100% Free",
    featuredBellSubtitle: 'Tibetan singing bowl with pure organic acoustic resonance.',
    listenTonight: 'Listen Tonight · Free',
    pauseBell: 'Pause Bell Sound',
    min: 'min',

    sosTitle: 'SOS 90s Pause',
    sosSubtitle: 'Acute racing mind silencer & 30s Sovereign Pause',
    emergencyReset: 'Emergency Reset',

    storiesHeroTitle: 'Human 2.0 Stories',
    storiesHeroSubtitle: 'Real people. Real life. Real shifts.',
    whenLifeFeelsTooMuch: 'When Life Feels Too Much',
    whenLifeFeelsTooMuchDesc: 'From pressure and disconnection to connection, purpose and joy.',
    realJourneys: 'Real Journeys',
    realJourneysDesc: 'Reader & seeker shifts before and after conscious practice',
    lifeStories: 'Life Stories',
    lifeStoriesDesc: 'Cinematic relatable stories reflecting everyday challenges',
    comebackStories: 'Comeback Stories',
    comebackStoriesDesc: 'Failure, resilience, reinvention and quiet inner strength',
    wisdomStories: 'Wisdom Stories',
    wisdomStoriesDesc: 'Short parables & metaphors with a Human 2.0 lesson',
    howAreYouFeeling: 'How are you feeling right now?',
    howAreYouFeelingPrompt: 'Select your state to receive an intelligent instant awareness recommendation:',
    feelings: {
      stressed: 'Stressed',
      overwhelmed: 'Overwhelmed',
      lonely: 'Lonely',
      angry: 'Angry',
      better: 'Better',
      grateful: 'Grateful',
    },
    recommendations: {
      forStressed: '90-Second Emergency SOS Reset',
      forOverwhelmed: 'Sleep Meditation: Somatic Body Release',
      forLonely: 'Awareness Song: Connection & Stillness',
      forAngry: '30-Second Sovereign Pause & Anger Circuit Breaker',
      forBetter: 'Chapter 19: Awareness in Action & Relationships',
      forGrateful: 'Relaxing Temple Bell Gratitude Sit',
      startNow: 'Begin Recommended Session',
    },

    musicHeroTitle: 'Human 2.0 Music',
    musicHeroSubtitle: 'Conscious songs and mood-based audio for everyday presence.',
    songsCollection: 'Curated Songs & Melodies',
    hindiTrack: 'Hindi Track',
    englishTrack: 'English Track',
    nowPlaying: 'Now Playing',
    listenNow: 'Play Track',

    backToHome: 'Back to Home',
    authorProfile: 'Author Profile',
    vault: 'Personal Awareness Vault',
    offlineReady: '100% Offline Ready',
    freeAudio: 'FREE AUDIO',
    paidAudio: 'PAID',
  },

  ar: {
    appName: 'كتاب هيومان 2.0 الصوتي',
    tagline: 'الوعي — جاهزون للمستقبل مع الذكاء الاصطناعي',
    daylightMode: 'وضع النهار',
    nightSanctuary: 'الملاذ الليلي',
    unlockAll: 'فتح الكل',
    sovereign: 'العضوية السيادية',
    userProfile: 'الملف الشخصي',
    selectLanguage: 'اللغة',
    currentLangName: 'العربية',

    audiobookTitle: 'الكتاب الصوتي',
    audiobookSubtitle: 'قسم الاستماع المخصص',
    audiobookDesc: 'كتاب هيومان 2.0 الصوتي (45 فصلاً)',
    audiobookTag: '45 فصلاً',
    ch1Free: 'الفصل 1 مجاناً',

    meditationTitle: 'التأملات',
    meditationSubtitle: 'سلسلة استعادة الهدوء',
    meditationDesc: 'استكشف كافة السلاسل',
    meditationTag: 'سلاسل',
    browseSeries: 'تصفح السلاسل',

    storiesTitle: 'قصص هيومان 2.0',
    storiesSubtitle: 'حياة حقيقية · تحولات حقيقية',
    storiesDesc: 'مشاعر واقعية. استجابة جديدة.',
    storiesTag: 'قصص',
    exploreStories: 'شاهد القصص',

    musicTitle: 'الموسيقى',
    musicSubtitle: 'صوتيات الوعي',
    musicDesc: 'أغانٍ ومقطوعات تناسب حالتك المزاجية',
    musicTag: 'أغاني',
    exploreMusic: 'استمع للموسيقى',

    featuredBellBadge: 'جرس الاسترخاء المميز الليلة · مجاني 100%',
    featuredBellSubtitle: 'وعاء تبتي برنين صوتي طبيعي هادئ.',
    listenTonight: 'استمع الليلة · مجاناً',
    pauseBell: 'إيقاف صوت الجرس',
    min: 'دقيقة',

    sosTitle: 'استراحة الطوارئ 90 ثانية',
    sosSubtitle: 'إسكات العقل المتسارع وتوقف سيادي لمدة 30 ثانية',
    emergencyReset: 'إعادة ضبط الطوارئ',

    storiesHeroTitle: 'قصص هيومان 2.0',
    storiesHeroSubtitle: 'أشخاص حقيقيون. حياة حقيقية. تحولات حقيقية.',
    whenLifeFeelsTooMuch: 'عندما تبدو الحياة أثقل من أن تُحتمل',
    whenLifeFeelsTooMuchDesc: 'من الضغط والعزلة إلى التواصل والهدف والبهجة.',
    realJourneys: 'تجارب حقيقية',
    realJourneysDesc: 'تحولات القراء والباحثين قبل وبعد الممارسة الواعية',
    lifeStories: 'قصص من الحياة',
    lifeStoriesDesc: 'قصص سينمائية واقعية تعكس تحديات الحياة اليومية',
    comebackStories: 'قصص العودة والصمود',
    comebackStoriesDesc: 'الفشل والمرونة وإعادة الابتكار وقوة الحضور الداخلي',
    wisdomStories: 'قصص الحكمة',
    wisdomStoriesDesc: 'أمثال وقصص قصيرة تحمل دروس هيومان 2.0',
    howAreYouFeeling: 'كيف تشعر في هذه اللحظة؟',
    howAreYouFeelingPrompt: 'اختر حالتك الحالية لتلقي توصية واعية فورية:',
    feelings: {
      stressed: 'متوتر',
      overwhelmed: 'مرهق جداً',
      lonely: 'وحيد',
      angry: 'غاضب',
      better: 'أفضل حالاً',
      grateful: 'ممتن',
    },
    recommendations: {
      forStressed: 'إعادة ضبط الطوارئ SOS لمدة 90 ثانية',
      forOverwhelmed: 'تأمل النوم: التحرر الجسدي السوماتي',
      forLonely: 'أغنية الوعي: التواصل والسكينة',
      forAngry: 'التوقف السيادي لكسر دائرة الغضب (30 ثانية)',
      forBetter: 'الفصل 19: الوعي في العمل والعلاقات',
      forGrateful: 'جلسة امتنان مع جرس المعبد الهادئ',
      startNow: 'بدء الجلسة الموصى بها',
    },

    musicHeroTitle: 'موسيقى هيومان 2.0',
    musicHeroSubtitle: 'أغانٍ واعية وصوتيات روحية للحضور الذهني اليومي.',
    songsCollection: 'المقطوعات المختارة',
    hindiTrack: 'مسار هندي',
    englishTrack: 'مسار إنجليزي',
    nowPlaying: 'قيد التشغيل الآن',
    listenNow: 'تشغيل المقطع',

    backToHome: 'العودة للرئيسية',
    authorProfile: 'ملف المؤلف',
    vault: 'خزينة الوعي الشخصية',
    offlineReady: 'يعمل دون إنترنت 100%',
    freeAudio: 'تسجيل مجاني',
    paidAudio: 'مدفوع',
  },

  hi: {
    appName: 'ह्यूमन 2.0 ऑडियो बुक',
    tagline: 'जागरूकता — AI के युग में भविष्य के लिए तैयार',
    daylightMode: 'दिन का मोड',
    nightSanctuary: 'रात्रि अभयारण्य',
    unlockAll: 'सब अनलॉक करें',
    sovereign: 'सॉवरेन मेंबरशिप',
    userProfile: 'यूज़र प्रोफ़ाइल',
    selectLanguage: 'भाषा',
    currentLangName: 'हिन्दी',

    audiobookTitle: 'ऑडियो बुक',
    audiobookSubtitle: 'समर्पित श्रवण खंड',
    audiobookDesc: 'ह्यूमन 2.0 ऑडियो बुक (45 अध्याय)',
    audiobookTag: '45 अध्याय',
    ch1Free: 'अध्याय 1 मुफ़्त',

    meditationTitle: 'ध्यान (मेडिटेशन)',
    meditationSubtitle: 'पुनर्स्थापना श्रृंखला',
    meditationDesc: 'सभी श्रृंखलाएं देखें',
    meditationTag: 'श्रृंखलाएं',
    browseSeries: 'सीरीज़ ब्राउज़ करें',

    storiesTitle: 'ह्यूमन 2.0 कहानियां',
    storiesSubtitle: 'सच्चा जीवन · वास्तविक बदलाव',
    storiesDesc: 'सच्चा जीवन। वास्तविक भावनाएं। एक नया प्रत्युत्तर।',
    storiesTag: 'कहानियां',
    exploreStories: 'कहानियां देखें',

    musicTitle: 'संगीत',
    musicSubtitle: 'जागरूकता की धुनें',
    musicDesc: 'मनोदशा आधारित गाने और संगीत',
    musicTag: 'गीत',
    exploreMusic: 'संगीत सुनें',

    featuredBellBadge: 'आज रात की विशेष सुकूनदायक घंटी · 100% मुफ़्त',
    featuredBellSubtitle: 'प्राकृतिक ध्वनि के साथ तिब्बती सिंगिंग बाउल।',
    listenTonight: 'आज रात सुनें · मुफ़्त',
    pauseBell: 'घंटी की ध्वनि रोकें',
    min: 'मिनट',

    sosTitle: 'SOS 90 सेकंड विश्राम',
    sosSubtitle: 'अशांत मन को शांत करने वाला 30-सेकंड का सॉवरेन पॉज़',
    emergencyReset: 'आपातकालीन रीसेट',

    storiesHeroTitle: 'ह्यूमन 2.0 कहानियां',
    storiesHeroSubtitle: 'सच्चे लोग। सच्चा जीवन। वास्तविक बदलाव।',
    whenLifeFeelsTooMuch: 'जब जीवन बहुत भारी लगने लगे',
    whenLifeFeelsTooMuchDesc: 'तनाव और अकेलेपन से जुड़ाव, उद्देश्य और आनंद की ओर।',
    realJourneys: 'वास्तविक यात्राएं',
    realJourneysDesc: 'जागरूक अभ्यास से पहले और बाद में पाठकों के अनुभव',
    lifeStories: 'जीवन की कहानियां',
    lifeStoriesDesc: 'रोज़मर्रा की चुनौतियों को दर्शाती सिनेमाई कहानियां',
    comebackStories: 'सफलता और वापसी की कहानियां',
    comebackStoriesDesc: 'विफलता, लचीलापन और आंतरिक शक्ति की दास्तान',
    wisdomStories: 'ज्ञान और सीख की कहानियां',
    wisdomStoriesDesc: 'ह्यूमन 2.0 के सिद्धांतों पर आधारित लघु दृष्टांत',
    howAreYouFeeling: 'आप अभी कैसा महसूस कर रहे हैं?',
    howAreYouFeelingPrompt: 'अपनी मनःस्थिति चुनें और सही सत्र का मार्गदर्शन पाएं:',
    feelings: {
      stressed: 'तनावग्रस्त (Stressed)',
      overwhelmed: 'अत्यधिक परेशान (Overwhelmed)',
      lonely: 'अकेलापन (Lonely)',
      angry: 'क्रोधित (Angry)',
      better: 'बेहतर (Better)',
      grateful: 'कृतज्ञ (Grateful)',
    },
    recommendations: {
      forStressed: '90-सेकंड का आपातकालीन SOS रीसेट',
      forOverwhelmed: 'निद्रा ध्यान: सोमैटिक बॉडी रिलैक्स',
      forLonely: 'जागरूकता गीत: जुड़ाव और आंतरिक शांति',
      forAngry: '30-सेकंड सॉवरेन पॉज़ (क्रोध शांति)',
      forBetter: 'अध्याय 19: कार्य और रिश्तों में जागरूकता',
      forGrateful: 'सुकूनदायक मंदिर घंटी के साथ कृतज्ञता ध्यान',
      startNow: 'अनुशंसित सत्र शुरू करें',
    },

    musicHeroTitle: 'ह्यूमन 2.0 संगीत',
    musicHeroSubtitle: 'दैनिक उपस्थिति और शांति के लिए रचित प्रेरक गीत और धुनें।',
    songsCollection: 'विशेष संगीत संग्रह',
    hindiTrack: 'हिन्दी गीत',
    englishTrack: 'अंग्रेज़ी गीत',
    nowPlaying: 'अभी बज रहा है',
    listenNow: 'गीत चलाएं',

    backToHome: 'होम पर वापस जाएं',
    authorProfile: 'लेखक प्रोफ़ाइल',
    vault: 'निजी जागरूकता वॉल्ट',
    offlineReady: '100% ऑफ़लाइन उपलब्ध',
    freeAudio: 'मुफ़्त ऑडियो',
    paidAudio: 'सशुल्क',
  },
};
