import { PodcastTopic, RightId, CardType, StarterOption, Badge, TopicLesson } from './types';

// Helper to count words ignoring speaker labels
const countWords = (text: string) => {
  if (!text) return 0;
  // Remove "Sprecher X:" patterns
  const clean = text.replace(/Sprecher\s+[A-E]:/gi, '').trim();
  return clean ? clean.split(/\s+/).length : 0;
};

export const LEVELS = [
  { min: 0, title: "Reporter-Neuling", icon: "🎤" },
  { min: 100, title: "Wort-Entdecker", icon: "🔎" },
  { min: 300, title: "Fakten-Sammler", icon: "📚" },
  { min: 600, title: "Grundrechte-Experte", icon: "⭐" },
  { min: 1000, title: "Chefredakteur", icon: "👑" }
];

export const SCRIPT_TEMPLATE: { type: CardType; title: string; minWords: number }[] = [
  { type: 'hook', title: 'Der Hinhörer (Hook)', minWords: 10 },
  { type: 'intro', title: 'Begrüßung & Thema', minWords: 15 },
  { type: 'explanation', title: 'Erklärung: Was bedeutet das?', minWords: 25 },
  { type: 'example', title: 'Beispiel aus dem Alltag', minWords: 20 },
  { type: 'boundary', title: 'Die Grenze / Regel', minWords: 15 },
  { type: 'tip', title: 'Unser Tipp', minWords: 15 },
  { type: 'outro', title: 'Verabschiedung', minWords: 10 },
];

export const BADGES: Badge[] = [
  {
    id: 'law_expert',
    title: 'Gesetzes-Hüter',
    description: 'Du weißt, was das Grundgesetz ist!',
    icon: '📜',
    color: 'bg-orange-100 text-orange-600 border-orange-200',
    condition: (p) => p.introCompleted
  },
  {
    id: 'knowledge_starter',
    title: 'Wissens-Starter',
    description: 'Das Basis-Wissen gemeistert!',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    condition: (p) => p.lessonA_Done
  },
  {
    id: 'knowledge_pro',
    title: 'Grundrechte-Profi',
    description: 'Den Profi-Check bestanden!',
    icon: '🎓',
    color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    condition: (p) => p.lessonB_Done
  },
  {
    id: 'word_acrobat',
    title: 'Wort-Akrobat',
    description: 'Über 100 Wörter im Skript!',
    icon: '🎪',
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    condition: (p) => {
      const words = p.script.reduce((acc, c) => acc + countWords(c.text), 0);
      return words >= 100;
    }
  },
  {
    id: 'radio_star',
    title: 'Radio Star',
    description: 'Alle Teile des Skripts sind fertig!',
    icon: '🎙️',
    color: 'bg-green-100 text-green-600 border-green-200',
    condition: (p) => {
      const incomplete = p.script.some(c => {
         const w = countWords(c.text);
         return w < c.minWords;
      });
      return !incomplete && p.script.length > 0;
    }
  }
];

// --- GENERIC STARTERS ---
const COMMON_HOOKS: StarterOption[] = [
  { label: "Der Sound-Effekt", fragment: "(Geräusch: PANG! BOOM!) ", suggestions: ["Habt ihr das gehört?", "So fühlt es sich an, wenn...", "Genau so platzt ein Traum."] },
  { label: "Stell dir vor...", fragment: "Stell dir vor, ", suggestions: ["du kommst in die Schule und keiner redet mit dir.", "plötzlich gehört dir alles.", "jemand nimmt dir einfach dein Pausenbrot weg."] },
  { label: "Frage an alle", fragment: "Hand aufs Herz: ", suggestions: ["Wer von euch wurde schon mal ungerecht behandelt?", "Kennt ihr das Gefühl von Angst?"] },
  { label: "Achtung, wichtig!", fragment: "Spitzt die Ohren, denn ", suggestions: ["heute geht es um etwas, das uns alle angeht!", "wir lüften ein Geheimnis."] }
];
const COMMON_INTROS: StarterOption[] = [
  { label: "Die Profis", fragment: "Hallo, hier sind ", suggestions: ["die Grundrechte-Checker.", "eure Reporter aus der 3b.", "das Team Gerechtigkeit."] },
  { label: "Das Thema", fragment: "In unserer heutigen Sendung geht es um ", suggestions: ["ein sehr wichtiges Grundrecht.", "Fairness in der Schule.", "die Regeln unseres Zusammenlebens."] },
  { label: "Neugierig machen", fragment: "Bleibt dran, denn wir erklären euch heute, ", suggestions: ["warum dieses Recht so wichtig ist.", "was ihr tun könnt, wenn es Ärger gibt."] }
];
const COMMON_OUTROS: StarterOption[] = [
  { label: "Fazit", fragment: "Merkt euch also: ", suggestions: ["Seid nett zueinander!", "Achtet auf eure Rechte!", "Respekt ist das Wichtigste!"] },
  { label: "Tschüss!", fragment: "Danke fürs Zuhören! Das waren ", suggestions: ["eure Grundrechte-Profis.", "die Kinder aus der 3b."] },
  { label: "Aufruf", fragment: "Und jetzt seid ihr dran: ", suggestions: ["Macht die Welt ein bisschen besser!", "Passt gut aufeinander auf!"] }
];
const COMMON_TIPS: StarterOption[] = [
    { label: "Unser Rat", fragment: "Unser wichtigster Tipp für euch ist: ", suggestions: ["Sagt laut und deutlich STOPP!", "Holt euch Hilfe bei einem Erwachsenen."] },
    { label: "Das hilft", fragment: "Wenn ihr sowas seht, dann könnt ihr ", suggestions: ["hingehen und fragen 'Alles okay?'.", "die Lehrerin holen."] },
    { label: "Gemeinsam", fragment: "Wir alle können helfen, indem wir ", suggestions: ["freundlich zueinander sind.", "nicht wegsehen."] }
];

// --- CONTENT SPECIFIC STARTERS (NEW) ---
const COMMON_EXPLANATIONS: StarterOption[] = [
    { label: "Das bedeutet...", fragment: "Das bedeutet ganz einfach, dass ", suggestions: ["jeder Mensch gleich viel wert ist.", "niemand bestimmen darf, was du denkst.", "wir alle geschützt sind."] },
    { label: "Im Gesetz", fragment: "Im Grundgesetz steht dazu: ", suggestions: ["'Die Würde des Menschen ist unantastbar'.", "'Alle Menschen sind vor dem Gesetz gleich'."] },
    { label: "Einfach gesagt", fragment: "Man kann auch sagen: ", suggestions: ["Es ist wie ein Schutzschild.", "Es ist die wichtigste Spielregel in Deutschland."] }
];

const COMMON_EXAMPLES: StarterOption[] = [
    { label: "Schule", fragment: "Stellt euch vor, in der Schule ", suggestions: ["wird jemand beim Sport nie gewählt.", "nimmt dir jemand einfach dein Pausenbrot weg."] },
    { label: "Alltag", fragment: "Ein Beispiel aus dem Alltag ist: ", suggestions: ["Wenn jemand im Bus beleidigt wird.", "Wenn du entscheiden darfst, welche Musik du hörst."] },
    { label: "Erlebnis", fragment: "Vielleicht habt ihr das auch schon erlebt: ", suggestions: ["Jemand wird ausgelacht, weil er eine Brille trägt.", "Jemand traut sich nicht, seine Meinung zu sagen."] }
];

const COMMON_BOUNDARIES: StarterOption[] = [
    { label: "Das Aber", fragment: "Aber Achtung: ", suggestions: ["Das gilt nicht immer!", "Es gibt eine wichtige Grenze."] },
    { label: "Die Regel", fragment: "Die Freiheit hört da auf, wo ", suggestions: ["man anderen wehtut.", "man jemanden beleidigt.", "es gefährlich wird."] },
    { label: "Verboten", fragment: "Nicht erlaubt ist zum Beispiel, ", suggestions: ["Lügen zu verbreiten.", "zu schlagen oder zu treten."] }
];


// --- MISSION 0: GENERAL INTRO ---

export const GENERAL_INTRO: TopicLesson = {
  introStory: "Stell dir vor, ihr spielt Fußball, aber es gibt keine Regeln. Einer nimmt den Ball in die Hand, ein anderer stellt ein drittes Tor auf, und der Schiedsrichter pfeift nie. Chaos, oder? Genau deshalb braucht ein Land Regeln. In Deutschland heißt das wichtigste Regelbuch 'Grundgesetz'. Es ist der 'Chef' von allen Gesetzen. Es wurde nach einem schlimmen Krieg geschrieben, damit nie wieder ein Staat seine Bürger schlecht behandelt. Das Grundgesetz ist wie ein unsichtbares Schutzschild für jeden von uns - egal ob Kind oder Erwachsener.",
  quizzes: [
    { id: 'g1', question: "Was ist das Grundgesetz?", options: ["Ein Kochbuch", "Die Spielregeln für Deutschland", "Ein Comic"], correctIndex: 1, explanation: "Es ist das wichtigste Gesetzbuch. Alle müssen sich daran halten, auch die Politiker." },
    { id: 'g2', question: "Wer ist der 'Chef'?", options: ["Das Grundgesetz steht über allem", "Der Hausmeister", "Die Polizei kann machen was sie will"], correctIndex: 0, explanation: "Niemand steht über dem Grundgesetz. Kein Gesetz darf dem Grundgesetz widersprechen." },
    { id: 'g3', question: "Wen schützt das Grundgesetz?", options: ["Nur Erwachsene", "Nur reiche Leute", "Alle Menschen in Deutschland"], correctIndex: 2, explanation: "Es gilt für alle Menschen, die hier sind. Egal ob Groß, Klein, Alt oder Jung." },
    { id: 'g4', question: "Wann wurde es geschrieben?", options: ["Letzte Woche", "Nach dem zweiten Weltkrieg (1949)", "Vor 1000 Jahren"], correctIndex: 1, explanation: "Die Menschen wollten sicherstellen, dass nie wieder so schreckliche Dinge passieren wie im Krieg." },
    { id: 'g5', question: "Können wir das Grundgesetz sehen?", options: ["Nein, es ist unsichtbar", "Ja, es steht in einem Buch", "Nur im Fernsehen"], correctIndex: 1, explanation: "Es ist ein Text, der in einem Buch steht. Aber die Rechte sind wie ein unsichtbarer Schutz um dich herum." }
  ],
  cases: [
    { id: 'gc1', title: 'Das neue Gesetz', scenario: 'Ein Politiker sagt: "Ab heute müssen alle Menschen blaue Hüte tragen, sonst kommen sie ins Gefängnis!"', question: "Geht das?", options: ["Klar, er ist Politiker.", "Nein, das verstößt gegen die Freiheit im Grundgesetz."], correctIndex: 1, explanation: "Politiker dürfen keine Quatsch-Gesetze machen, die unsere Freiheit grundlos einschränken." },
    { id: 'gc2', title: 'Der Brief', scenario: 'Die Polizei will einfach so deine Post öffnen und lesen, weil sie neugierig sind.', question: "Dürfen die das?", options: ["Nein, das Postgeheimnis steht im Grundgesetz.", "Ja, die dürfen alles."], correctIndex: 0, explanation: "Das Grundgesetz schützt deine Privatsphäre (Briefgeheimnis). Nur mit richterlichem Beschluss darf man das." },
    { id: 'gc3', title: 'Die Strafe', scenario: 'Ein Lehrer möchte einführen, dass Schüler, die zu spät kommen, den ganzen Tag in der Ecke stehen müssen ohne Pause.', question: "Ist das erlaubt?", options: ["Ja, Strafe muss sein.", "Nein, das verletzt die Würde des Kindes."], correctIndex: 1, explanation: "Grausame oder erniedrigende Strafen sind durch das Grundgesetz verboten." }
  ],
  checks: [
    { id: 'gch1', statement: "Darf man das Grundgesetz ändern?", answer: "depends", explanation: "Manches ja, aber die wichtigsten Regeln (wie Art. 1, die Menschenwürde) dürfen NIEMALS abgeschafft werden." },
    { id: 'gch2', statement: "Gilt das Grundgesetz auch für Kinder?", answer: "yes", explanation: "Ja! Kinder haben genau die gleichen Grundrechte wie Erwachsene, und sogar noch besondere Kinderrechte dazu." }
  ]
};

// --- TOPICS WITH LESSON CONTENT ---

export const TOPICS: Record<RightId, PodcastTopic> = {
  art1: {
    id: "art1",
    title: "Art. 1 GG",
    simpleTitle: "Menschenwürde",
    articleRef: "Art. 1",
    icon: "👑",
    description: "Jeder Mensch ist wertvoll.",
    lesson: {
        introStory: "Stell dir vor, du bist auf dem Schulhof. Eine Gruppe älterer Schüler steht im Kreis um Tom. Tom ist in eine Pfütze gefallen und seine Hose ist nass. Anstatt ihm zu helfen, lachen die anderen, machen Fotos und rufen 'Pfützen-Tom'. Tom schämt sich furchtbar. Er fühlt sich ganz klein, fast wie ein Ding, nicht mehr wie ein Mensch. Hier sagt das Grundgesetz ganz laut: STOPP! Das verletzt Toms Würde. Würde heißt: Jeder Mensch ist wertvoll, nur weil er ein Mensch ist. Niemand darf wie Müll behandelt, gedemütigt oder bloßgestellt werden. Das gilt für den Bundeskanzler genauso wie für Tom.",
        quizzes: [
            { id: 'q1', question: "Was bedeutet 'Menschenwürde'?", options: ["Dass nur Reiche wichtig sind", "Dass jeder Mensch wertvoll ist", "Dass der Stärkste bestimmt"], correctIndex: 1, explanation: "Genau! Egal ob arm, reich, groß oder klein – jeder Mensch ist wertvoll." },
            { id: 'q2', question: "Was darf man NIEMALS tun?", options: ["Jemanden auslachen und bloßstellen", "Jemanden kritisieren", "Beim Spielen gewinnen"], correctIndex: 0, explanation: "Richtig. Jemanden fertig zu machen oder zu erniedrigen verletzt seine Würde." },
            { id: 'q3', question: "Gilt die Menschenwürde auch für Verbrecher?", options: ["Nein, die sind böse", "Ja, für jeden Menschen", "Nur wenn sie nett sind"], correctIndex: 1, explanation: "Das ist schwer, aber ja: Auch wer etwas Schlimmes getan hat, bleibt ein Mensch und darf z.B. nicht gefoltert werden." },
            { id: 'q4', question: "Wer muss die Würde schützen?", options: ["Nur die Polizei", "Der Staat und wir alle", "Niemand"], correctIndex: 1, explanation: "Das Grundgesetz sagt: Alle staatliche Gewalt muss die Würde achten und schützen." },
            { id: 'q5', question: "Darf ich ein peinliches Foto posten?", options: ["Ja, wenn es viele Likes kriegt", "Nein, das verletzt die Würde", "Nur am Wochenende"], correctIndex: 1, explanation: "Jemanden im Internet bloßzustellen ist genauso schlimm wie auf dem Schulhof. Es bleibt oft für immer." },
            { id: 'q6', question: "Verliert man seine Würde, wenn man alt und krank ist?", options: ["Ja, dann ist man schwach", "Nein, niemals", "Vielleicht"], correctIndex: 1, explanation: "Die Würde behält man sein ganzes Leben lang, bis zum Schluss. Auch alte Menschen müssen mit Respekt behandelt werden." }
        ],
        cases: [
            { id: 'c1', title: 'Der Spitzname', scenario: 'Jonas hat Segelohren. Max nennt ihn nur noch "Dumbo". Alle lachen, aber Jonas wird ganz still und guckt auf den Boden.', question: "Ist das nur Spaß?", options: ["Ja, Jonas soll sich nicht so anstellen.", "Nein, das ist beleidigend und verletzt die Würde."], correctIndex: 1, explanation: "Wenn einer leidet, ist es kein Spaß mehr. Jonas wird auf sein Aussehen reduziert." },
            { id: 'c2', title: 'Das Foto', scenario: 'Lisa hat beim Sport eine peinliche Pose gemacht. Mia hat ein Foto davon und will es in die Klassengruppe schicken.', question: "Was soll Mia tun?", options: ["Das Foto löschen.", "Es verschicken, ist doch lustig."], correctIndex: 0, explanation: "Das Foto könnte Lisa bloßstellen. Das verletzt ihre Würde und ihr Recht am eigenen Bild." },
            { id: 'c3', title: 'Die Mutprobe', scenario: 'Die coole Gang sagt zu Paul: "Du darfst nur mitspielen, wenn du aus dem Mülleimer isst." Paul ekelt sich.', question: "Ist das okay?", options: ["Nein, das erniedrigt Paul.", "Klar, ist halt eine Mutprobe."], correctIndex: 0, explanation: "Niemand darf gezwungen werden, sich selbst zu erniedrigen (sich klein zu machen), um dazuzugehören." },
            { id: 'c4', title: 'Der Obdachlose', scenario: 'Auf dem Weg zur Schule sitzt ein Mann auf der Straße, der alt ist und schlecht riecht. Ein Kind spuckt vor ihm aus.', question: "Was sagst du dazu?", options: ["Egal, der merkt das nicht.", "Das geht gar nicht! Auch er hat Würde."], correctIndex: 1, explanation: "Jeder Mensch verdient Respekt, egal wie er lebt oder aussieht." },
            { id: 'c5', title: 'Das Pausenbrot', scenario: 'Svenja hat ein Brot dabei, das anders riecht als das der anderen. Kevin hält sich demonstrativ die Nase zu und ruft "Pfui!".', question: "Ist das Würde-Verletzung?", options: ["Ja, Svenja wird gedemütigt.", "Nein, es stinkt ja wirklich."], correctIndex: 0, explanation: "Es beschämt Svenja vor allen anderen. Man kann höflich weggehen, aber 'Pfui' rufen verletzt." }
        ],
        checks: [
            { id: 'ch1', statement: "Darf ich lachen, wenn jemand hinfällt?", answer: "depends", explanation: "Wenn dem Kind nichts passiert ist und es selbst lacht: Okay. Wenn es weint oder sich schämt: Nein!" },
            { id: 'ch2', statement: "Darf ich jemanden 'Lauch' nennen?", answer: "no", explanation: "Das ist eine Beleidigung und reduziert den anderen auf seinen Körper." },
            { id: 'ch3', statement: "Darf ich bestimmen, wer neben mir sitzt?", answer: "yes", explanation: "Das ist deine Freiheit, solange du den anderen nicht beleidigst ('Du stinkst, geh weg')." },
            { id: 'ch4', statement: "Darf ein Lehrer einen Schüler schlagen?", answer: "no", explanation: "Niemals! Das ist verboten und verletzt die Würde und den Körper." }
        ]
    },
    miniExplain: ["Würde bedeutet: Jeder Mensch ist wertvoll.", "Niemand darf wie ein Gegenstand behandelt werden.", "Keiner darf gedemütigt oder bloßgestellt werden."],
    keySentence: "Würde heißt: Jeder Mensch ist wertvoll.",
    exampleIdeas: ["Jemand wird ausgelacht wegen Kleidung.", "Jemand wird ausgeschlossen.", "Ein peinliches Foto wird herumgezeigt."],
    boundaryIdeas: ["‘Nur Spaß’ gilt nicht, wenn jemand verletzt ist.", "Bloßstellen ist verboten.", "Jemanden 'Opfer' nennen verletzt die Würde."],
    schoolTips: ["Wir sagen laut Stopp!", "Wir lachen niemanden aus.", "Wir holen Hilfe."],
    sentenceStarters: { hook: COMMON_HOOKS, intro: COMMON_INTROS, outro: COMMON_OUTROS, tip: COMMON_TIPS, explanation: COMMON_EXPLANATIONS, example: COMMON_EXAMPLES, boundary: COMMON_BOUNDARIES },
    wordBank: [
      { word: "Respekt", definition: "Andere freundlich und höflich behandeln." },
      { word: "wertvoll", definition: "Jeder Mensch ist wie ein Schatz, der geschützt werden muss." },
      { word: "Stopp", definition: "Das Signal, dass eine Grenze erreicht ist." },
      { word: "bloßstellen", definition: "Jemanden vor anderen lächerlich machen." },
      { word: "auslachen", definition: "Über jemanden lachen, um ihm weh zu tun." },
      { word: "fair", definition: "Gerecht spielen und niemanden benachteiligen." },
      { word: "einzigartig", definition: "Jeder Mensch ist besonders und gibt es nur einmal." },
      { word: "Mensch", definition: "Egal ob Kind oder Erwachsener, alle haben Rechte." },
      { word: "Zivilcourage", definition: "Mutig sein und helfen, wenn andere ungerecht behandelt werden." },
      { word: "Privatsphäre", definition: "Dein persönlicher Bereich, den niemand stören darf (z.B. dein Tagebuch)." },
      { word: "Achtung", definition: "Aufpassen, dass es dem anderen gut geht." },
      { word: "Gefühle", definition: "Ob jemand traurig, froh oder wütend ist - das ist wichtig." },
      { word: "Ehre", definition: "Dein guter Ruf. Niemand darf Lügen über dich erzählen." },
      { word: "Gemeinschaft", definition: "Wir halten zusammen und lassen niemanden allein." },
      { word: "Toleranz", definition: "Andere so akzeptieren, wie sie sind." },
      { word: "Mitgefühl", definition: "Merken, wenn jemand traurig ist." },
      { word: "Geheimnis", definition: "Etwas, das dir gehört und niemand wissen muss." },
      { word: "Gewaltlos", definition: "Streit ohne Schlagen lösen." },
      { word: "Gerechtigkeit", definition: "Wenn alle fair behandelt werden." },
      { word: "Vorurteil", definition: "Schlecht über jemanden denken, ohne ihn zu kennen." },
      { word: "Mobbing", definition: "Jemanden immer wieder gemein behandeln oder ausschließen." },
      { word: "Identität", definition: "Das, was dich besonders macht (wer du bist)." },
      { word: "Vertrauen", definition: "Sich auf jemanden verlassen können." },
      { word: "Scham", definition: "Das unangenehme Gefühl, wenn man ausgelacht wird." },
      { word: "Hilfsbereitschaft", definition: "Bereit sein, anderen zu helfen." }
    ]
  },
  art2: {
    id: "art2",
    title: "Art. 2 GG",
    simpleTitle: "Freiheit & Körper",
    articleRef: "Art. 2",
    icon: "🕊️",
    description: "Dein Körper gehört dir.",
    lesson: {
        introStory: "Paul mag es nicht, wenn seine Tante ihn immer fest drückt und abknutscht. Er traut sich nicht, 'Nein' zu sagen, weil sie ja eine Erwachsene ist und es gut meint. Aber Art. 2 im Grundgesetz ist eindeutig: Dein Körper gehört dir! Das nennt man 'Körperliche Unversehrtheit'. Keiner darf dich anfassen oder verletzen, wenn du das nicht willst. Außerdem darf jeder seine Persönlichkeit entfalten – also so sein, wie er will, Hobbys haben die er mag, und Kleidung tragen die ihm gefällt – solange er anderen damit nicht schadet.",
        quizzes: [
            { id: 'q1', question: "Wem gehört dein Körper?", options: ["Meinen Eltern", "Mir allein", "Der Schule"], correctIndex: 1, explanation: "Korrekt! Du bist der Bestimmer über deinen Körper." },
            { id: 'q2', question: "Was gilt bei 'Stopp'?", options: ["Weitermachen", "Sofort aufhören", "Lachen"], correctIndex: 1, explanation: "Stopp heißt Stopp. Sofort. Egal ob im Spiel oder im Ernst." },
            { id: 'q3', question: "Darf ich laut Musik hören?", options: ["Immer und überall", "Ja, aber nicht wenn Nachbarn schlafen wollen", "Nein, nie"], correctIndex: 1, explanation: "Das ist das Wichtigste: Deine Freiheit endet dort, wo die Freiheit der anderen beginnt." },
            { id: 'q4', question: "Darf man jemanden einsperren?", options: ["Ja, aus Spaß", "Nein, Freiheit ist ein hohes Gut", "Nur Lehrer dürfen das"], correctIndex: 1, explanation: "Niemand darf einfach so eingesperrt werden (außer Polizei/Gefängnis mit richterlichem Grund)." },
            { id: 'q5', question: "Gehören deine Geheimnisse dir?", options: ["Ja, das ist Privatsphäre", "Nein, Eltern müssen alles wissen", "Nur am Geburtstag"], correctIndex: 0, explanation: "Du hast ein Recht auf Privatsphäre. Tagebücher oder Chatnachrichten gehen andere nichts an." },
            { id: 'q6', question: "Darf ich anziehen was ich will?", options: ["Ja, das ist freie Entfaltung", "Nein, alle müssen gleich aussehen", "Nur grüne Sachen"], correctIndex: 0, explanation: "Im Prinzip ja! Manchmal gibt es aber Regeln (z.B. keine Badesachen im Unterricht)." }
        ],
        cases: [
            { id: 'c1', title: 'Der Haarschnitt', scenario: 'Lena möchte sich die Haare kurz schneiden lassen. Ihre Freundin sagt: "Das sieht bestimmt doof aus, mach das nicht!"', question: "Wer entscheidet?", options: ["Die Freundin", "Lena"], correctIndex: 1, explanation: "Es ist Lenas Kopf und ihre Entscheidung (Freie Entfaltung der Persönlichkeit)." },
            { id: 'c2', title: 'Die Rauferei', scenario: 'Ben und Ali raufen aus Spaß. Plötzlich ruft Ali "Aua, Stopp!". Ben macht weiter, weil er gerade gewinnt.', question: "Ist das okay?", options: ["Nein, er muss aufhören.", "Ja, er gewinnt ja gerade."], correctIndex: 0, explanation: "Sobald einer Stopp sagt oder Schmerzen hat, ist die Grenze überschritten. Weitermachen ist Körperverletzung." },
            { id: 'c3', title: 'Das Tagebuch', scenario: 'Die Mutter liest heimlich das Tagebuch ihrer Tochter, weil sie neugierig ist, in wen sie verliebt ist.', question: "Darf sie das?", options: ["Ja, sie ist die Mutter.", "Nein, das gehört zur Persönlichkeit."], correctIndex: 1, explanation: "Auch Kinder haben ein Recht auf Geheimnisse und Privatsphäre, besonders bei Gefühlen." },
            { id: 'c4', title: 'Der Zettel', scenario: 'Der Lehrer findet einen Zettel, den Sarah geschrieben hat. Er will ihn laut vor der Klasse vorlesen.', question: "Darf er das?", options: ["Nein, das ist Sarahs privates Eigentum.", "Ja, in der Schule gibt es keine Geheimnisse."], correctIndex: 0, explanation: "Der Lehrer darf den Zettel wegnehmen, wenn er stört, aber er darf ihn nicht laut vorlesen und Sarah bloßstellen." },
            { id: 'c5', title: 'Die Mutprobe II', scenario: 'Die anderen sagen: "Spring von der Mauer, sonst bist du ein Feigling!" Die Mauer ist sehr hoch.', question: "Was ist Freiheit?", options: ["Springen, um cool zu sein.", "Nein sagen und auf seinen Körper achten."], correctIndex: 1, explanation: "Freiheit heißt auch, 'Nein' zu sagen, wenn etwas gefährlich für deinen Körper ist." }
        ],
        checks: [
            { id: 'ch1', statement: "Darf ich meine Haare grün färben?", answer: "yes", explanation: "Das ist deine persönliche Freiheit (wenn deine Eltern zustimmen)." },
            { id: 'ch2', statement: "Darf ich jemanden schubsen, der mich nervt?", answer: "no", explanation: "Damit verletzt du seine körperliche Unversehrtheit. Hände weg!" },
            { id: 'ch3', statement: "Darf ich 'Nein' sagen, wenn Oma mich küssen will?", answer: "yes", explanation: "Dein Körper, deine Regeln. Ein Handschlag oder Winken reicht auch." },
            { id: 'ch4', statement: "Darf ich in der Bibliothek schreien?", answer: "no", explanation: "Hier stört deine Freiheit die anderen beim Lesen." }
        ]
    },
    miniExplain: ["Du darfst vieles selbst entscheiden.", "Dein Körper gehört dir allein.", "Niemand darf dir wehtun."],
    keySentence: "Mein Körper gehört mir – Stopp heißt Stopp.",
    exampleIdeas: ["Jemand schubst oder kneift.", "Ungewollte Umarmung.", "Mütze wegnehmen."],
    boundaryIdeas: ["Deine Freiheit endet dort, wo sie anderen wehtut.", "Regeln schützen uns.", "Stopp akzeptieren."],
    schoolTips: ["Wir akzeptieren ein 'Nein' sofort.", "Wir fragen vor dem Umarmen.", "Wir klären Streit mit Worten."],
    sentenceStarters: { hook: COMMON_HOOKS, intro: COMMON_INTROS, outro: COMMON_OUTROS, tip: COMMON_TIPS, explanation: COMMON_EXPLANATIONS, example: COMMON_EXAMPLES, boundary: COMMON_BOUNDARIES },
    wordBank: [
        { word: "Freiheit", definition: "Tun können, was man möchte (solange man niemanden stört)." },
        { word: "entscheiden", definition: "Selbst eine Wahl treffen." },
        { word: "Nein", definition: "Ein wichtiges Wort, um Grenzen zu setzen." },
        { word: "Stopp", definition: "Sofort aufhören." },
        { word: "sicher", definition: "Keine Angst haben müssen." },
        { word: "Grenze", definition: "Bis hierhin und nicht weiter." },
        { word: "Körper", definition: "Er gehört nur dir allein." },
        { word: "Privatsphäre", definition: "Dein persönlicher Bereich (z.B. im Bad oder Tagebuch)." },
        { word: "Unversehrtheit", definition: "Dass der Körper nicht verletzt werden darf." },
        { word: "Entfaltung", definition: "Sich so entwickeln, wie man möchte (Hobbys, Kleidung)." },
        { word: "Zwang", definition: "Wenn dich jemand zwingt, etwas zu tun, was du nicht willst." },
        { word: "Rücksicht", definition: "Aufpassen, dass man andere nicht stört." },
        { word: "Schmerz", definition: "Das Signal des Körpers, dass etwas nicht stimmt." },
        { word: "Einwilligung", definition: "Ja sagen, bevor jemand dich anfasst." }
    ]
  },
  art3: {
    id: "art3",
    title: "Art. 3 GG",
    simpleTitle: "Gleichheit",
    articleRef: "Art. 3",
    icon: "⚖️",
    description: "Alle gehören dazu.",
    lesson: {
        introStory: "Beim Fußball wählen die Kapitäne Teams. 'Mädchen können kein Fußball', sagt einer und lässt Lena stehen, obwohl sie im Verein spielt. Ein anderer Junge wird nicht gewählt, weil er eine Brille trägt. Ein dritter, weil er nicht so gut Deutsch spricht. Das ist ungerecht! Art. 3 sagt: Alle Menschen sind vor dem Gesetz gleich. Niemand darf benachteiligt werden, nur weil er ein Junge oder Mädchen ist, woanders herkommt, anders aussieht oder an einen anderen Gott glaubt.",
        quizzes: [
            { id: 'q1', question: "Was bedeutet Gleichberechtigung?", options: ["Alle sehen gleich aus", "Alle haben die gleichen Rechte", "Alle essen das Gleiche"], correctIndex: 1, explanation: "Egal ob Junge oder Mädchen, jeder hat die gleichen Rechte." },
            { id: 'q2', question: "Was ist Diskriminierung?", options: ["Jemanden einladen", "Jemanden wegen seines Aussehens ausschließen", "Jemanden grüßen"], correctIndex: 1, explanation: "Jemanden unfair zu behandeln, weil er 'anders' ist, ist verboten." },
            { id: 'q3', question: "Dürfen Jungs weinen?", options: ["Nein, Indianer weinen nicht", "Klar, Gefühle sind für alle da", "Nur wenn niemand guckt"], correctIndex: 1, explanation: "Vorurteile wie 'Jungs weinen nicht' sind Quatsch. Alle Menschen haben Gefühle." },
            { id: 'q4', question: "Müssen alle genau das Gleiche bekommen?", options: ["Ja, immer", "Nein, gerecht heißt: Jeder kriegt was er braucht", "Nur die Schnellen"], correctIndex: 1, explanation: "Beispiel: Ein Kind im Rollstuhl braucht eine Rampe, ein Läufer nicht. Gerechtigkeit heißt, Nachteile auszugleichen." },
            { id: 'q5', question: "Sind reiche Menschen wichtiger?", options: ["Ja, sie haben mehr Geld", "Nein, vor dem Gesetz sind alle gleich", "Vielleicht"], correctIndex: 1, explanation: "Geld darf keinen Unterschied bei den Rechten machen." },
            { id: 'q6', question: "Ist es okay, jemanden wegen seiner Sprache auszulachen?", options: ["Nein, niemals", "Ja, wenn es lustig klingt", "Nur im Urlaub"], correctIndex: 0, explanation: "Sprache oder Herkunft dürfen kein Grund für Ausgrenzung sein." }
        ],
        cases: [
            { id: 'c1', title: 'Die Einladung', scenario: 'Tim feiert Geburtstag. Er lädt alle Jungs ein, aber Kevin nicht, weil Kevins Eltern wenig Geld haben und Kevin keine coolen Marken-Klamotten trägt.', question: "Ist das fair?", options: ["Ja, ist Tims Party.", "Nein, das ist Ausgrenzung."], correctIndex: 1, explanation: "Kevin wird wegen 'Armut' benachteiligt. Das verletzt den Gedanken von Art. 3." },
            { id: 'c2', title: 'Der Ausflug', scenario: 'Die Klasse plant einen Wandertag. Es gibt einen steilen Weg. Ein Kind im Rollstuhl kann da nicht mit.', question: "Was tun?", options: ["Das Kind bleibt daheim.", "Wir suchen einen Weg für alle."], correctIndex: 1, explanation: "Gleichberechtigung heißt: Wir lassen niemanden zurück. Wir müssen eine Lösung für alle finden." },
            { id: 'c3', title: 'Die Mathe-AG', scenario: 'Der Lehrer sagt: "In die Mathe-AG dürfen nur Jungs, Mädchen können eh nicht rechnen."', question: "Stimmt das?", options: ["Das ist ein verbotenes Vorurteil.", "Ja, Jungs sind schlauer."], correctIndex: 0, explanation: "Das ist Diskriminierung wegen dem Geschlecht. Mädchen können genauso gut Mathe." },
            { id: 'c4', title: 'Das Casting', scenario: 'Für das Theaterstück werden Feen gesucht. Die Lehrerin sagt: "Nur Kinder mit blonden Haaren dürfen Feen sein."', question: "Ist das okay?", options: ["Ja, Feen sind immer blond.", "Nein, Haarfarbe ist egal."], correctIndex: 1, explanation: "Jeder sollte die Chance haben, die Rolle zu spielen, egal wie er aussieht." },
            { id: 'c5', title: 'Das Tanzen', scenario: 'Mehmet möchte in die Tanz-AG. Die anderen Jungs lachen: "Tanzen ist doch nur für Mädchen!"', question: "Haben sie Recht?", options: ["Nein, Hobbys sind für alle da.", "Ja, Jungs spielen Fußball."], correctIndex: 0, explanation: "Das ist ein Klischee (Vorurteil). Jungs dürfen tanzen, Mädchen dürfen Fußball spielen." }
        ],
        checks: [
            { id: 'ch1', statement: "Darf ich sagen: Jungs sind stärker als Mädchen?", answer: "no", explanation: "Das ist ein Vorurteil und stimmt so nicht pauschal. Es gibt sehr starke Mädchen!" },
            { id: 'ch2', statement: "Darf ich nur Kinder mit teuren Schuhen einladen?", answer: "no", explanation: "Das wäre unfair. Geld macht niemanden zu einem besseren Freund." },
            { id: 'ch3', statement: "Darf ich mit jedem spielen, den ich mag?", answer: "yes", explanation: "Ja, aber du solltest niemanden gemein ausschließen." },
            { id: 'ch4', statement: "Darf ein blinder Mensch Lehrer werden?", answer: "yes", explanation: "Na klar! Mit den richtigen Hilfsmitteln geht das." }
        ]
    },
    miniExplain: ["Alle sind vor dem Gesetz gleich.", "Niemand darf benachteiligt werden.", "Gleiche Chancen für alle."],
    keySentence: "Fair heißt: Alle gehören dazu.",
    exampleIdeas: ["Mädchen dürfen nicht mitspielen.", "Rollstuhlfahrer kommt nicht rein.", "Ausgrenzung wegen Sprache."],
    boundaryIdeas: ["Ausgrenzen ist nie okay.", "Gerecht heißt manchmal auch: helfen.", "Niemand ist 'besser'."],
    schoolTips: ["Wir lassen alle mitspielen.", "Wir wählen Teams fair.", "Wir helfen einander."],
    sentenceStarters: { hook: COMMON_HOOKS, intro: COMMON_INTROS, outro: COMMON_OUTROS, tip: COMMON_TIPS, explanation: COMMON_EXPLANATIONS, example: COMMON_EXAMPLES, boundary: COMMON_BOUNDARIES },
    wordBank: [
        { word: "fair", definition: "Gerecht spielen." },
        { word: "gleich", definition: "Alle haben den gleichen Wert." },
        { word: "gerecht", definition: "Niemanden benachteiligen." },
        { word: "Chance", definition: "Jeder soll es versuchen dürfen." },
        { word: "ausgrenzen", definition: "Jemanden nicht mitspielen lassen." },
        { word: "Respekt", definition: "Nett und höflich zu anderen sein." },
        { word: "Vielfalt", definition: "Es ist toll, dass alle unterschiedlich sind." },
        { word: "Diskriminierung", definition: "Jemanden schlecht behandeln, weil er 'anders' ist." },
        { word: "Behinderung", definition: "Wenn jemand körperliche oder geistige Einschränkungen hat." },
        { word: "Vorurteil", definition: "Eine Meinung über jemanden haben, bevor man ihn kennt." },
        { word: "Herkunft", definition: "Woher jemand (oder seine Familie) kommt." },
        { word: "Religion", definition: "Woran jemand glaubt (z.B. Kirche, Moschee)." },
        { word: "Armut", definition: "Wenn man wenig Geld hat. Das darf kein Nachteil sein." },
        { word: "Barrierefrei", definition: "So gebaut, dass auch Rollstuhlfahrer überall hinkommen." }
    ]
  },
  art5: {
    id: "art5",
    title: "Art. 5 GG",
    simpleTitle: "Meinung",
    articleRef: "Art. 5",
    icon: "📢",
    description: "Du darfst deine Meinung sagen.",
    lesson: {
        introStory: "Tim sagt im Unterricht: 'Ich finde das Projekt langweilig.' Der Lehrer schimpft: 'Sei still! Deine Meinung interessiert nicht.' Darf der Lehrer das? Nein! Art. 5 schützt unsere Meinung. In Deutschland darf jeder sagen, schreiben oder malen, was er denkt. Es gibt keine Zensur (das heißt, der Staat darf Zeitungen nicht verbieten). Aber Vorsicht: Es gibt einen Unterschied zwischen einer Meinung und einer Beleidigung! Und man darf keine Lügen verbreiten.",
        quizzes: [
            { id: 'q1', question: "Darfst du deine Meinung sagen?", options: ["Nein, Kinder nicht", "Ja, das ist mein Recht", "Nur zu Hause"], correctIndex: 1, explanation: "Jeder darf seine Meinung sagen, auch Kinder." },
            { id: 'q2', question: "Was ist verboten?", options: ["Kritik üben", "Beleidigung und Lügen", "Lob aussprechen"], correctIndex: 1, explanation: "Beleidigungen ('Du Idiot') sind keine Meinung, sondern verletzend. Lügen sind auch keine Meinung." },
            { id: 'q3', question: "Wo darf man seine Meinung sagen?", options: ["Überall (Schule, Internet, Straße)", "Nur im Keller", "Nur wenn man leise flüstert"], correctIndex: 0, explanation: "Meinungsfreiheit gilt überall, auch bei Demos auf der Straße oder im Internet." },
            { id: 'q4', question: "Darf man Zeitungen verbieten?", options: ["Ja, wenn sie den Politiker nerven", "Nein, es gibt Pressefreiheit", "Ja, am Wochenende"], correctIndex: 1, explanation: "Journalisten dürfen schreiben, was passiert, auch wenn es Politikern nicht gefällt." },
            { id: 'q5', question: "Darf ich im Internet alles schreiben?", options: ["Ja, ist ja anonym", "Nein, auch da gelten Regeln", "Nur in Großbuchstaben"], correctIndex: 1, explanation: "Auch im Internet darf man nicht beleidigen oder hetzen (Hass-Kommentare)." },
            { id: 'q6', question: "Was sind 'Fake News'?", options: ["Langweilige Nachrichten", "Absichtliche Lügen", "Wetterbericht"], correctIndex: 1, explanation: "Lügen, die so aussehen sollen wie echte Nachrichten, um Leute zu täuschen. Das ist gefährlich." }
        ],
        cases: [
            { id: 'c1', title: 'Das Bild', scenario: 'Mia hat ein Bild gemalt. Leo findet es hässlich. Er sagt: "Das ist das hässlichste Gekritzel der Welt, du kannst gar nix!"', question: "Ist das eine Meinung?", options: ["Ja, er ist ehrlich.", "Nein, das ist beleidigend."], correctIndex: 1, explanation: "Er hätte sagen können: 'Mir gefällt es nicht so gut.' Das wäre eine Meinung. 'Du kannst gar nix' ist verletzend." },
            { id: 'c2', title: 'Die Lüge', scenario: 'Jemand erzählt in der Pause: "Die neue Lehrerin isst Regenwürmer!" Alle lachen.', question: "Ist das Meinungsfreiheit?", options: ["Nein, das ist eine Lüge.", "Ja, kann man doch sagen."], correctIndex: 0, explanation: "Lügen verbreiten (Fake News), um jemanden schlecht zu machen, ist nicht von der Meinungsfreiheit geschützt." },
            { id: 'c3', title: 'Die Demo', scenario: 'Schüler malen Plakate: "Wir wollen besseres Essen in der Mensa!" und stellen sich auf den Schulhof.', question: "Dürfen die das?", options: ["Nein, Kinder müssen still sein.", "Ja, das ist eine Demonstration."], correctIndex: 1, explanation: "Seine Meinung gemeinsam zu zeigen (versammeln) ist ein Grundrecht. Kritik bringt oft Verbesserungen." },
            { id: 'c4', title: 'Das T-Shirt', scenario: 'Max trägt ein T-Shirt mit dem Spruch: "Hausaufgaben sind doof". Der Lehrer will, dass er es auszieht.', question: "Darf Max es tragen?", options: ["Ja, das ist seine Meinung.", "Nein, der Lehrer ist Chef."], correctIndex: 0, explanation: "Solange der Spruch niemanden beleidigt, darf er seine Meinung auch auf dem T-Shirt zeigen." },
            { id: 'c5', title: 'Der Gruppenchat', scenario: 'In der WhatsApp-Gruppe schreiben alle: "Lara ist doof." Du findest Lara eigentlich nett.', question: "Was tust du?", options: ["Ich schreibe nichts.", "Ich schreibe meine Meinung: 'Ich finde Lara okay'."], correctIndex: 1, explanation: "Es ist mutig, seine Meinung zu sagen, auch wenn alle anderen etwas anderes sagen." }
        ],
        checks: [
            { id: 'ch1', statement: "Darf ich sagen, dass ich Mathe hasse?", answer: "yes", explanation: "Das ist deine persönliche Meinung und dein Gefühl. Niemand kann dir das verbieten." },
            { id: 'ch2', statement: "Darf ich zum Lehrer 'Dummkopf' sagen?", answer: "no", explanation: "Das ist eine Beleidigung und respektlos. Meinung geht auch höflich." },
            { id: 'ch3', statement: "Darf ich sagen: 'Ich finde deine Schuhe nicht schön'?", answer: "yes", explanation: "Das ist eine Meinung. Aber überleg dir, ob du den anderen damit traurig machst." },
            { id: 'ch4', statement: "Darf ich Lügen über andere erzählen?", answer: "no", explanation: "Lügen verletzen oft andere und sind keine Meinung." }
        ]
    },
    miniExplain: ["Jeder darf sagen, was er denkt.", "Sich informieren ist erlaubt.", "Beleidigungen sind verboten."],
    keySentence: "Meinung ja – Beleidigung nein.",
    exampleIdeas: ["Kritik äußern.", "Beleidigung vs Meinung.", "Sich nicht trauen was zu sagen."],
    boundaryIdeas: ["Lügen sind verboten.", "Beleidigung verletzt die Ehre.", "Hass ist keine Meinung."],
    schoolTips: ["Wir sagen 'Ich finde...' statt 'Du bist...'", "Wir lassen ausreden.", "Wir prüfen Wahrheiten."],
    sentenceStarters: { hook: COMMON_HOOKS, intro: COMMON_INTROS, outro: COMMON_OUTROS, tip: COMMON_TIPS, explanation: COMMON_EXPLANATIONS, example: COMMON_EXAMPLES, boundary: COMMON_BOUNDARIES },
    wordBank: [
        { word: "Meinung", definition: "Das, was du denkst." },
        { word: "Kritik", definition: "Sagen, was man nicht gut findet (ohne gemein zu sein)." },
        { word: "sachlich", definition: "Ruhig bleiben und beim Thema bleiben." },
        { word: "Beleidigung", definition: "Schimpfwörter, die anderen wehtun." },
        { word: "Wahrheit", definition: "Das, was wirklich passiert ist." },
        { word: "Fake News", definition: "Lügen, die als Nachrichten verkleidet sind." },
        { word: "Diskussion", definition: "Friedlich streiten und Argumente austauschen." },
        { word: "Zuhören", definition: "Den anderen ausreden lassen, auch wenn man anders denkt." },
        { word: "Information", definition: "Wissen, das man sammelt (z.B. aus Büchern)." },
        { word: "Presse", definition: "Zeitungen und Nachrichten, die uns informieren." },
        { word: "Mut", definition: "Sich trauen, seine Meinung laut zu sagen." },
        { word: "Leserbrief", definition: "Seine Meinung an eine Zeitung schreiben." },
        { word: "Zensur", definition: "Wenn der Staat verbietet, bestimmte Dinge zu sagen (bei uns verboten!)." },
        { word: "Argument", definition: "Ein guter Grund für deine Meinung." },
        { word: "Widerspruch", definition: "Sagen, dass man etwas anders sieht." },
        { word: "Nachrichten", definition: "Wissen, was in der Welt passiert." },
        { word: "Interview", definition: "Jemanden befragen, um Infos zu bekommen." },
        { word: "Plakat", definition: "Ein Schild mit deiner Meinung (z.B. auf einer Demo)." },
        { word: "Kommentar", definition: "Seine Meinung zu einem Thema aufschreiben oder sagen." },
        { word: "Recherche", definition: "Nachforschen, ob eine Information wirklich stimmt." },
        { word: "Beweis", definition: "Ein Beleg dafür, dass etwas wahr ist (z.B. ein Foto)." },
        { word: "Netiquette", definition: "Regeln für höfliches Benehmen im Internet." },
        { word: "Standpunkt", definition: "Deine persönliche Sicht auf ein Thema." },
        { word: "Austausch", definition: "Miteinander reden und Meinungen teilen." }
    ]
  },
  art16a: {
    id: "art16a",
    title: "Art. 16a GG",
    simpleTitle: "Asyl (Schutz)",
    articleRef: "Art. 16a",
    icon: "🏠",
    description: "Schutz suchen, wenn man nicht sicher ist.",
    lesson: {
        introStory: "In Alis Heimatland ist Krieg. Bomben fallen auf Häuser. Seine Familie musste fliehen. Sie haben alles zurückgelassen: Spielzeug, Freunde, Oma und Opa. Jetzt sind sie in Deutschland. Art. 16a sagt: Politisch Verfolgte genießen Asyl. Das ist ein schweres Wort. Es bedeutet: Menschen, die in ihrer Heimat in Lebensgefahr sind (z.B. wegen ihrer Meinung, Religion oder weil Krieg ist), dürfen hier Schutz suchen. Deutschland hilft ihnen, bis es wieder sicher ist.",
        quizzes: [
            { id: 'q1', question: "Warum fliehen Menschen?", options: ["Urlaub", "Gefahr (Krieg, Verfolgung)", "Langeweile"], correctIndex: 1, explanation: "Sie haben Angst um ihr Leben oder ihre Freiheit." },
            { id: 'q2', question: "Was brauchen Flüchtlinge?", options: ["Sicherheit und Frieden", "Süßigkeiten", "Ein schnelles Auto"], correctIndex: 0, explanation: "Sicherheit ist das Wichtigste. Sie wollen keine Angst mehr haben." },
            { id: 'q3', question: "Was bedeutet Asyl?", options: ["Urlaub im Hotel", "Schutz vor Gefahr", "Hausaufgabenfrei"], correctIndex: 1, explanation: "Es ist ein sicherer Ort für Menschen in Not." },
            { id: 'q4', question: "Ist es leicht, die Heimat zu verlassen?", options: ["Ja, macht Spaß", "Nein, man vermisst alles", "Egal"], correctIndex: 1, explanation: "Die meisten Menschen wären lieber zu Hause, wenn es dort sicher wäre. Man verliert Freunde und Heimat." },
            { id: 'q5', question: "Dürfen Kinder auch Asyl bekommen?", options: ["Nein, nur Erwachsene", "Ja, natürlich", "Nur wenn sie brav sind"], correctIndex: 1, explanation: "Kinder brauchen besonders viel Schutz, besonders im Krieg." },
            { id: 'q6', question: "Was ist das Wichtigste für neue Kinder?", options: ["Dass sie coole Kleidung haben", "Dass sie Freunde finden", "Dass sie gut Fußball spielen"], correctIndex: 1, explanation: "Freunde helfen beim Ankommen und beim Deutsch lernen." }
        ],
        cases: [
            { id: 'c1', title: 'Die Sprache', scenario: 'Ein neues Kind spricht kein Deutsch. Manche Kinder verdrehen die Augen, weil das Spielen so kompliziert ist.', question: "Wie reagierst du?", options: ["Ich spiele nicht mit ihm.", "Ich zeige mit Händen, wie es geht."], correctIndex: 1, explanation: "Man kann auch ohne Worte spielen. Das Kind freut sich riesig über Anschluss und lernt so schneller." },
            { id: 'c2', title: 'Vorurteile', scenario: 'Jemand sagt: "Die Flüchtlinge nehmen uns alles weg!"', question: "Stimmt das?", options: ["Ja, habe ich gehört.", "Nein, das ist ein Vorurteil."], correctIndex: 1, explanation: "Menschen suchen Schutz vor dem Tod. Wir haben genug, um zu teilen. Solche Sätze machen Angst." },
            { id: 'c3', title: 'Das Trauma', scenario: 'Ali erschrickt sehr laut und zittert, als eine Tür zuknallt.', question: "Warum?", options: ["Er ist ein Angsthase.", "Das Geräusch erinnert ihn an den Krieg."], correctIndex: 1, explanation: "Viele Flüchtlinge haben schlimme Dinge (Bomben) erlebt und sind deshalb schreckhaft (Trauma). Wir müssen geduldig sein." },
            { id: 'c4', title: 'Das Essen', scenario: 'Fatima isst in der Pause etwas, das du nicht kennst und das anders riecht. Ein Kind sagt "Igitt".', question: "Wie reagierst du?", options: ["Ich sage 'Probier doch mal oder sei still'.", "Ich lache mit."], correctIndex: 0, explanation: "Andere Länder, anderes Essen. Man muss nicht alles mögen, aber man darf es nicht beleidigen." },
            { id: 'c5', title: 'Heimweh', scenario: 'Das neue Kind weint in der Ecke und zeigt auf ein Foto von einem Haus.', question: "Was ist los?", options: ["Es hat Bauchweh.", "Es vermisst sein altes Zuhause."], correctIndex: 1, explanation: "Es ist sehr schwer, alles zurückzulassen. Ein bisschen Trost hilft." }
        ],
        checks: [
            { id: 'ch1', statement: "Darf ich fragen, warum jemand geflohen ist?", answer: "depends", explanation: "Ja, aber sei vorsichtig. Manche Erinnerungen sind sehr traurig. Wenn das Kind nicht reden will, ist das okay." },
            { id: 'ch2', statement: "Darf ich sagen: 'Geh zurück in dein Land'?", answer: "no", explanation: "Das ist sehr verletzend und gemein. Jeder Mensch hat das Recht auf Sicherheit." },
            { id: 'ch3', statement: "Darf ich mein Pausenbrot teilen?", answer: "yes", explanation: "Das ist eine super nette Geste und hilft beim Freunde finden!" },
            { id: 'ch4', statement: "Müssen Flüchtlinge für immer bleiben?", answer: "depends", explanation: "Viele wollen zurück, wenn der Krieg vorbei ist. Manche bleiben auch hier und werden neue Nachbarn." }
        ]
    },
    miniExplain: ["Schutz bei Verfolgung.", "Krieg ist ein Fluchtgrund.", "Sicherheit ist ein Recht."],
    keySentence: "Asyl heißt: Schutz finden.",
    exampleIdeas: ["Neues Kind in der Klasse.", "Familie auf der Flucht.", "Angst vor Polizei."],
    boundaryIdeas: ["Keine Vorurteile.", "Herkunft ist egal.", "Nicht ständig nach schlimmen Dingen fragen."],
    schoolTips: ["Wir sind Paten.", "Wir erklären mit Händen und Füßen.", "Wir sind freundlich."],
    sentenceStarters: { hook: COMMON_HOOKS, intro: COMMON_INTROS, outro: COMMON_OUTROS, tip: COMMON_TIPS, explanation: COMMON_EXPLANATIONS, example: COMMON_EXAMPLES, boundary: COMMON_BOUNDARIES },
    wordBank: [
        { word: "Schutz", definition: "In Sicherheit sein." },
        { word: "sicher", definition: "Keine Gefahr." },
        { word: "Flucht", definition: "Weglaufen, weil es gefährlich ist." },
        { word: "Krieg", definition: "Wenn Länder gegeneinander kämpfen." },
        { word: "Willkommen", definition: "Sagen: Schön, dass du da bist!" },
        { word: "Hilfe", definition: "Jemandem Unterstützung geben." },
        { word: "Zuhause", definition: "Der Ort, wo man sich wohl fühlt." },
        { word: "Verfolgung", definition: "Wenn jemand gejagt oder eingesperrt wird, weil er eine andere Meinung hat." },
        { word: "Heimat", definition: "Das Land oder die Stadt, wo man herkommt." },
        { word: "Sicherheit", definition: "Keine Angst haben müssen." },
        { word: "Integration", definition: "Sich in einem neuen Land einleben und Teil davon werden." },
        { word: "Sprache", definition: "Wichtig, um sich zu verstehen und Freunde zu finden." },
        { word: "Heimweh", definition: "Traurig sein, weil man sein altes Zuhause vermisst." },
        { word: "Trauma", definition: "Eine seelische Verletzung durch schlimme Erlebnisse." }
    ]
  }
};