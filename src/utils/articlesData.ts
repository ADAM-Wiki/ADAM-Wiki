// articlesData.ts — centralized data source for all articles
// To add new articles: add a new object to the hadisArticles array below.
// searchUtils.ts will pick them up automatically — no other file needs to change.

export interface ArticleData {
  slug: string;
  title: string;
  summary: string;
  dateCreated: string;
  content: string[];
  category?: string;
  tags?: string[];
}


export const hadisArticles: ArticleData[] = [
  {
    slug: "vatra-koja-izlazi-iz-dubine-Adena",
    title: "Vatra koja izlazi iz dubine Adena",
    summary: "Istraživanje hadisa o vatri koja izlazi iz dna Adena i njegovo značenje u kontekstu...",
    dateCreated: "2026-08-10",
    tags: ["vulkani", "kraj-vremena", "nauka", "hadis"],
    content: [
      "[IMPORTANT]Hadis o vatri iz Adena je verodostojan i nalazi se u Sahih Muslim. Tekst objašnjava da je Aden zapravo ogromni uspavani vulkan, što je otkriveno tek modernom geologijom i satelitskim snimcima. Autor povezuje hadis sa vulkanskim erupcijama, zemljotresima i kur’anskim ajetima o kraju vremena, tvrdeći da će velika vatra iz Adena biti jedan od poslednjih znakova Sudnjeg dana i da će terati ljude ka mestu okupljanja.",
      "Hadis o vatri koja će izaći iz Adena i okupiti ljude je verodostojan. U Sahih Muslim, prenosi se od Hudhayfah ibn Asid al-Ghifari (neka je Allah zadovoljan njime), da je rekao: Poslanik (mir i blagoslov Allaha neka je na njega) nas je pogledao dok smo razgovarali i rekao: „O čemu razgovarate?“ Rekli su: „Razgovaramo o Sudnjem času.“ On reče: „On neće nastupiti dok ne vidite deset znakova pre njega.“ Zatim je spomenuo dim, Antihrista, zver, izlazak sunca sa zapada, silazak Isaa, sina Merjeminog (mir i blagoslov Allaha neka je na njega), Jedžudža i Medžudža, i tri propadanja tla: jedno na istoku, jedno na zapadu i jedno na Arapskom poluostrvu. Poslednje od toga biće vatra koja će izaći iz Jemena i terati ljude ka njihovom mestu okupljanja.",
      "[QUOTE]U predaji kod Sahih Muslim stoji: „Vatra će izaći iz dubine Adena i proterivati ljude.“",
      "[QUOTE]A prema Sunan Abu Dawood: „Poslednje od toga biće vatra koja će izaći iz Jemena, iz dubine Adena, terajući ljude ka mestu okupljanja.“",
      "Grad Aden se uglavnom nalazi na okeanu. Nastao je od veoma velikog vulkana koji je eruptirao iz morske strane i nastavio da eruptira veoma dugo. Zatim, nakon što se vulkan umirio i ohladio, formirao je udubljeni krater kao i svi vulkani, ali ovaj je veoma, veoma velik i kasnije je postao istorijski grad Aden... Ono što smo spomenuli može se jasno videti na satelitskim snimcima.",
      "Niko u prošlosti nije znao da se grad Aden nalazi na vrhu vulkana sve dok Britanci nisu došli i kolonizovali Aden. Sa početkom ere avijacije i posmatranjem gradova sa velikih visina, Aden se pojavio kao grad sa udubljenom površinom i ogromnim kraterom velikog, masivnog, uspavanog vulkana, kao što je Allahov Poslanik rekao u prethodnom hadisu. Britanci su ga nazvali grad kratera vulkana (Kraytar), i to je bio naziv koji su oni najčešće koristili, a ne ime Aden.",
      "Britanska kraljevska vulkanološka ekspedicija je 1964. godine proučavala uspavani vulkan Aden pod vođstvom profesora I. G. Gass.",
      "On je svoj naučni rad započeo rečima da su „današnji vulkani samo vatromet u poređenju sa vulkanom Aden“, kroz poređenje strukturalnog sastava tih vulkana i vulkana Aden. Takođe nalazimo u časopisu Reader's Digest iz 1979. godine naučni članak koji govori da je vulkan Krakatau u Indoneziji, koji je eruptirao 1883. godine i koji su naučnici smatrali najjačim vulkanom u zabeleženom ljudskom sećanju, izazvao smrt trideset šest hiljada ljudi. Ljudi su čuli eksploziju sa udaljenosti od pet hiljada kilometara, a pepeo i vulkanski dim blokirali su sunčevu svetlost nedelju dana. Vulkan je doveo do raspadanja i nestanka većeg dela ostrva iz kojeg je izašao, a naučnici su procenili njegovu snagu kao ekvivalent stotinu hidrogenskih bombi. Autor zaključuje da se čak i ovaj ogromni vulkan smatra poput vatrometa u poređenju sa vulkanom Aden.",
      "Inženjer Marouf Aqaba kaže u svom istraživanju „Aden, istorijska i civilizacijska dimenzija“: Vulkan Aden smatra se jednim od šest vulkanskih centara koji leže na jednoj vulkanskoj liniji koja se proteže od Bab al-Mandab na južnom ulazu u Crveno more do grada Aden. Nedavno, pre samo nekoliko dana, jedan od tih šest vulkanskih centara postao je aktivan na Jabal al-Tair kod obale Jemena u Crvenom moru. Na kraju, predstavljamo sažetak naučnog, geografskog, istorijskog i metafizičkog čuda hadisa Allahovog Poslanika o gradu Adenu:",
      "[WARNING]1 - Allahov Poslanik je rekao da je Aden udubljen grad, pa je rekao „dno Adena“. Ovo je postalo jasno tek uz pomoć snimanja iz vazduha avionima ili satelitima.",
      "2 - Allahov Poslanik je rekao da se Aden nalazi na ugašenom vulkanu, ali njegovo proširenje zapravo doseže jezgro Zemlje, za koje je poznato da je veoma velika masa rastopljenog gvožđa i nikla. Lava je izašla iz ovog vulkana u velikoj erupciji u vodama blizu obale u okolnom moru, nakon čega je ovaj vulkan formirao ogromnu planinu iznad koje se nalazio veliki krater koji je bio grad Aden. Vatra će ponovo izaći sa istog mesta, a to je uobičajena pojava kod većine vulkana u svetu, a poslednja erupcija biće u još žešćem i snažnijem obliku u kojem će ljudi biti poterani ka mestu proživljenja u zemlji Šama. Postojanje mora neće sprečiti vatru da se proširi po celoj Zemlji, jer će mora planuti vatrom na Sudnjem danu, prema jednom od tumačenja učenjaka reči Uzvišenog Boga: „I kada mora budu zapaljena.“ At-Takwir: 6.",
      "Kao što je poznato, veliki vulkani su praćeni zemljotresima zbog pucanja slojeva Zemljine kore usled toka lave koja iz unutrašnjosti Zemlje ide ka višim slojevima. To uzrokuje klizanje slojeva Zemljine kore, što dovodi do onoga što se naziva zemljotres, pre nego što lava izađe na površinu Zemlje. Zatim, nakon što se zemljotres dogodi, vulkanska lava izbacuje svoje mase rastopljenog gvožđa iznad površine Zemlje. Zbog toga nalazimo reči Uzvišenog Boga: „Kada se Zemlja zatrese svojim poslednjim zemljotresom i izbaci svoje terete“, a to znači da će kraj događaja kraja vremena i početak Sudnjeg dana biti vatra iz vulkana na kopnu i moru, a najjača od svih biće vatra vulkana Aden, koja će terati ljude ka okupljanju i obračunu, kao što se spominje u časnoj suri i časnom proročkom hadisu.",
      "Postoji bliska veza između zemljotresa i vulkana, jer oba funkcionišu po istom mehanizmu. Danas naučnici smatraju da su neki zemljotresi pokazatelj skorog nastanka vulkana u kojem Zemlja izbacuje velike količine rastopljene lave. Zbog toga kažu da takvi zemljotresi mogu biti rani znak vulkanskih erupcija, odnosno upozorenje na erupcije.",
      "Iz ovoga shvatamo da postoji veza između zemljotresa i užarenih stena koje Zemlja proizvodi u obliku vulkana. Zato božanska objava povezuje ova dva procesa, naglašavajući da prvo dolazi zemljotres, a zatim Zemlja izbacuje svoje terete (tj. užarene stene, koje su naravno teške i teže od površinskih stena jer su uglavnom od gvožđa i nikla). Poznato je da je središte Zemljine gravitacije ogromna masa, čija veličina može doseći četvrtinu planete. Uzvišeni Allah kaže: „Kada se Zemlja zatrese svojim (poslednjim) zemljotresom * i izbaci svoje terete“ (Ez-Zilzal: 1–2).",
      "U ova dva ajeta postoji jasan pokazatelj odnosa između zemljotresa i širenja Zemlje, ili drugim rečima, širenja i pomeranja tektonskih ploča, kao i izbacivanja lave unutar njih kao rezultat tog širenja.",
      "Zbog toga je Allahov Poslanik spomenuo nekoliko pomračenja zajedno sa hadisom o vulkanu Aden. Kao što je poznato, pomračenja su takođe povezana sa zemljotresima, a naučni geološki redosled događaja identičan je redosledu u hadisu Allahovog Poslanika i ajetima koje smo spomenuli, i to: zemljotresi, zatim pomračenja, zatim vulkani — od kojih je najjači i prvi vulkan Aden — a pošto je većina vulkana pod morima, onda se to odnosi na reči: „I kada mora budu zapaljena“ (Et-Tekvir: 6).",
      "Spominjemo hadis iz Sahih Muslim još jednom, brate, od Hudhayfah ibn Asid al-Ghifari (neka je Allah zadovoljan njime), koji je rekao: Poslanik, neka su Allahov mir i blagoslov na njega, pogledao nas dok smo razgovarali i rekao: „O čemu razgovarate?“ Rekli su: „Razgovaramo o Sudnjem času.“ On je rekao: „On neće doći dok ne vidite deset znakova pre njega“, pa je spomenuo dim, Antihrista, zver, izlazak sunca sa zapada, silazak Isaa, sina Merjeminog, Jedžudža i Medžudža, i tri propadanja tla: jedno na istoku, jedno na zapadu i jedno na Arapskom poluostrvu, a poslednje od toga biće vatra koja će izaći iz Jemena i terati ljude ka njihovom mestu okupljanja.",
      "Klip dr. Muhammeda Ali al-Bara o vatri koja izlazi iz dubine Adena:",
      "[LINK]https://www.youtube.com/watch?v=FTRFZX1RRYI",
      "[IMAGE]/images/hadis/1.webp|",
    ],
  },
  {
    slug: "the-gender-of-the-fetus-a-doubt-or-a-miracle",
    title: "The Gender of the Fetus: a Doubt or a Miracle",
    summary: "Proučavanje hadisa o određivanju pola fetusa i naučna perspektiva...",
    dateCreated: "2026-05-03",
    content: [
      "Ovaj tekst se bavi hadisima koji govore o određivanju pola pre rođenja, kao i različitim tumačenjima učenjaka.",
      "Razmatramo najvažnije prenose i navodimo šta je učeće islama o znanju i neizvesnosti vezanoj za pol deteta.",
      "Na kraju ukazujemo na razliku između verskog gledišta i savremenih naučnih saznanja.",
    ],
  },
  {
    slug: "frequent-lightning-strikes-near-the-end-times",
    title: "Frequent Lightning Strikes Near the End Times",
    summary: "Analiza hadisa o učestalim udarima groma pred kraj vremena...",
    dateCreated: "2026-05-01",
    content: [
      "Hadis o čestim udarima groma prikazuje prirodne pojave kao deo znakova posljednjih dana.",
      "Ovdje proučavamo značenje simbola groma i kako su učenjaci povezali ovu sliku sa upozorenjima u hadisu.",
      "Pogled na kontekst i praktične poruke odražava načine na koje vernici mogu razumeti znakove vremena.",
    ],
  },
  {
    slug: "the-miracle-of-the-unseen-in-fat-will-appear-in-them",
    title: "The Miracle of the Unseen in Fat Will Appear in Them",
    summary: "Proučavanje hadisa o nevidljivom čudu u masnoći koja će se pojaviti...",
    dateCreated: "2026-04-28",
    content: [
      "Ovaj hadis opisuje nevidljiv događaj vezan za masnoću i čudo koje će se pojaviti u bliskoj budućnosti.",
      "Istražujemo prenose i opservacije o tome kako se simbolika masnoće tumači unutar islamske tradicije.",
      "Članak nudi kontekstualnu analizu i primere iz predanja kako bi se bolje razumela poruka hadisa.",
    ],
  },
  {
    slug: "hadith-of-42-nights-embryology-sex-differentiation",
    title: "Hadith of 42 Nights: Embryology, Sex Differentiation",
    summary: "Detaljna analiza hadisa o 42 noći i embrionalnom razvoju...",
    dateCreated: "2026-04-25",
    content: [
      "Hadis o 42 noći razmatra razvoj embriona u različitim fazama, uključujući i razlikovanje pola.",
      "Prikazujemo ključne interpretacije i upoređujemo ih sa savremenim medicinskim saznanjima.",
      "Takođe analiziramo šta ovaj hadis podučava o Božijoj moći i promišljenom stvaranju života.",
    ],
  },
  {
    slug: "why-islam-prescribed-circumcision-modern-medicine-confirms",
    title: "Why Islam Prescribed Circumcision: Modern Medicine Confirms",
    summary: "Objašnjenje sunneta o obrezivanju i potvrda moderne medicine...",
    dateCreated: "2026-04-22",
    content: [
      "Savremena medicinska rasprava Profesor Brian Morris, koji je sproveo akademsku studiju, rekao je da zdravstvene koristi muškog obrezivanja nadmašuju rizike čak stostruko.",
      "Studija, koju je sproveo zajednički medicinski tim iz United States i Australia, pokazala je da polovina muškaraca koji nisu obrezani tokom života pati od lošijih zdravstvenih stanja.",
      "Procenat muške novorođenčadi koja su obrezana u United States bila je 83% tokom 1960-ih godina, ali je danas taj procenat opao na 77%.",
      "Morris, koji radi na University of Sydney u Australia, rekao je da će ovi rezultati promeniti medicinske preporuke širom sveta.",
    ],
  },
  {
    slug: "scientific-miracles-in-hadith",
    title: "Scientific Miracles in Hadith: The Gender of the Fetus",
    summary: "Exploring scientific miracles in Islamic traditions regarding fetal development...",
    dateCreated: "2026-04-28",
    content: [
      "The Gender of the Fetus: a Doubt or a Miracle - this question has fascinated scholars for centuries.",
      "Islamic traditions contain detailed descriptions of fetal development that align with modern embryology.",
      "In this article, we examine hadith that discuss the determination of fetal gender and its scientific accuracy.",
      "The miracle lies not just in the knowledge, but in the precise timing described in ancient texts.",
      "Modern science has confirmed many aspects of fetal development mentioned in Islamic sources.",
      "From the initial stages to the determination of gender, the descriptions are remarkably accurate.",
      "This represents one of the many scientific miracles found in Islamic traditions.",
    ],
  },
];

export const ateizmaArticles: ArticleData[] = [
  {
    slug: "argumenti-protiv-ateizma",
    title: "Argumenti Protiv Ateizma",
    summary: "Analiza glavnih argumenta koji se koriste u raspravama protiv ateizma...",
    dateCreated: "2026-05-05",
    content: [
      "Ateizam je odricanje postojanja boga ili bogova. U ovom članku razmatramo glavne argumente koji se koriste u raspravama protiv ateističkog gledišta.",
      "Od kozmološkog argumenta do argumenta iz svrhe, svaki od ovih argumenata ima svoje snage i slabosti.",
      "Ispitujemo kako su верски učenjaci kroz istoriju odgovarali na ateističke zahteve i gde se nalazi osnova za versku diskusiju.",
    ],
  },
  {
    slug: "verovatnoća-existencije-boga",
    title: "Verovatnoća Existencije Boga",
    summary: "Matematička i filozofska analiza verovatnoće postojanja najvišeg bića...",
    dateCreated: "2026-05-02",
    content: [
      "Pascal-ova oklada predstavlja matematički pristup verskom pitanju.",
      "Analiziramo kako se verovatnoća može koristiti u teološkim raspravama i koje su preporuke filozofa iz različitih epoha.",
      "Razmatramo i empirijske pristupe kao i racionalne dokaze za ili protiv postojanja boga.",
    ],
  },
  {
    slug: "nauka-i-vera",
    title: "Nauka i Vera: Mogu li biti kompatibilni",
    summary: "Istraživanje odnosa između nauke i religije kroz istoriju...",
    dateCreated: "2026-04-28",
    content: [
      "Poznato je da su mnogi od najvećih naučnika bili religiozni.",
      "U ovom članku ispitujemo kako nauka i vera mogu biti kompatibilni i gde se često javljaju nesporazumi.",
      "Pokazujemo primere iz istorije nauke gde je religija i nauka radile zajedno.",
    ],
  },
];

export const hriscanstvoArticles: ArticleData[] = [
  {
       
    slug: "uticaj-hriscanstva-na-zapad",
    title: "Uticaj Hriscanstva na Zapad",
    summary: "Kako je hriscanstvo oblikovalo zapad i njegovog institucije...",
    dateCreated: "2026-05-05",
    content: [
      "Hriscanstvo je imalo dubok uticaj na razvoj Evrope i Amerike kroz više od dve hiljade godina.",
      "Od prvih hrisćana do modernog doba, verovatno, religija je utičući na zakon, obrazovanje, i društvo.",
      "Ispitujemo kako su hristijanske vrednosti oblikovale zapadnu civilizaciju i gde ostaju relevantne danas.",
    ],
  },
  {
    slug: "istorija-hriscanstva",
    title: "Istorija Hriscanstva",
    summary: "Sveobuhvatna istorija nastanka i razvoja hriscanstva kroz vekove...",
    dateCreated: "2026-05-01",
    content: [
      "Hriscanstvo je počelo sa Isusovim učenjima u 1. veku našerojnog doba.",
      "Pratimo razvoj od ranih hrišćana kroz srednjovekovno razdoblje do modernog vremena.",
      "Razmatramo razne granacije hriscanstva i kako su se one razvijale kroz istoriju.",
    ],
  },
  {
    slug: "biblijske-istine-savremenom-svetu",
    title: "Biblijske Istine u Savremenom Svetu",
    summary: "Primena biblijskih učenja na izazove savremenog društva...",
    dateCreated: "2026-04-26",
    content: [
      "Sveto pismo sadrži večite istine koje su relevantne i danas.",
      "U ovom članku razmatramo kako se biblijske principle mogu primeniti na probleme savremenog sveta.",
      "Od etike do emocionalnog blagostanja, ispitujemo kako hristijanska učenja pružaju guidance.",
    ],
  },
];

export const hinduizamArticles: ArticleData[] = [
  {
    slug: "osnove-hinduizma",
    title: "Osnove Hinduizma",
    summary: "Uvod u osnovne principe i filozofiju hinduizma...",
    dateCreated: "2026-05-04",
    content: [
      "Hinduizam je jedan od najvećih religija sveta sa bogatom istorijom i filozofijom.",
      "Osnove hinduizma uključuju koncept karme, reinkarnacije, i različitih putanja ka oslobađanju.",
      "Razmatramo kako su Vedske tradicije oblikovale hindusku religiju i kulturu.",
    ],
  },
  {
    slug: "yoga-i-meditacija",
    title: "Yoga i Meditacija u Hinduizmu",
    summary: "Duhovne prakse koje su nastale u hinduskoj tradiciji...",
    dateCreated: "2026-04-30",
    content: [
      "Yoga je jedna od šest ortdoksnih indijskih filozofskih škola.",
      "Meditacija i fizičke vežbe su deo hinduskog puta ka duhovnom razvoju.",
      "Ispitujemo kako su ove prakse evoluirale i šta su njihove koristi u savremenom dobu.",
    ],
  },
  {
    slug: "panteon-hinduskih-bogova",
    title: "Panteon Hinduskih Bogova",
    summary: "Razumevanje složenog sistema hinduskih deities i njihove uloge...",
    dateCreated: "2026-04-27",
    content: [
      "Hinduizam ima bogat panteon bogova, od Brahmana-stva do Brahmastra-tva.",
      "Svaki bog ima svoju ulogu i simboliku u hinduskoj duhovnosti.",
      "Razmatramo kako su ovi bogovi predstavljeni u tekstovima i što znače za vernika.",
    ],
  },
];

export const seriatArticles: ArticleData[] = [
  {
    slug: "osnove-serijata",
    title: "Osnove Šerijata",
    summary: "Pregled islamskog zakona i njegova primena u društvu...",
    dateCreated: "2026-05-05",
    content: [
      "Šerijat je islamski pravni sistem zasnovan na Kur'anu i Sunnahu.",
      "Obuhvata sve aspekte ljudskog života od pravnog do moralnog.",
      "Razmatramo kako je šerijat primenjivan kroz istoriju i kakva je njegova uloga u savremenom islamu.",
    ],
  },
  {
    slug: "porodica-i-brak-u-serijatu",
    title: "Porodica i Brak u Šerijatu",
    summary: "Islamske odredbe o porodici i brakovanju u svjetlosti šerijata...",
    dateCreated: "2026-05-01",
    content: [
      "Šerijat ima jasne odredbe o brakovanju, pravima žena i obavezama porodice.",
      "Ova učenja su bila revolucionarna u vremenu njihovog datuma.",
      "Ispitujemo kako se ove preskriptivne odredbe primenjuju u različitim dijelovima islamskog света.",
    ],
  },
  {
    slug: "kazne-i-pravda-u-serijatu",
    title: "Kazne i Pravda u Šerijatu",
    summary: "Analiza islamskog sistema kaznenog prava i principa pravde...",
    dateCreated: "2026-04-28",
    content: [
      "Islamski penal sistem je baziran na principima pravde i rehabilitacije.",
      "Od krađe do težih zločina, svaki prestup ima odredjenu казну prema šerijatu.",
      "Razmatramo kako je ovaj sistem evoluirao i kakve su principi koji ga vode.",
    ],
  },
];

export const kuranArticles: ArticleData[] = [
  {
    slug: "struktura-kurana",
    title: "Struktura Kur'ana",
    summary: "Razumevanje organizacije i strukturnog redosleda Kur'ana...",
    dateCreated: "2026-05-05",
    content: [
      "Kur'an se sastoji od 114 sura (poglavlja) sa različitim dužinama i temama.",
      "Sveukupno ima 6236 ajeta (stihova) koji su raspoređeni na specifičan način.",
      "Razmatramo kako je Kur'an organizovan, zašto je tako raspoređen, i kakav je značaj te organizacije.",
    ],
  },
  {
    slug: "tajfseeri-kuurana",
    title: "Tafseer (Interpretacija) Kur'ana",
    summary: "Razne metode tumačenja Kur'ana kroz islamsku tradiciju...",
    dateCreated: "2026-05-02",
    content: [
      "Tafseer je nauka o tumačenju Kur'ana sa specifičnim pravilima i metodama.",
      "Postoji nekoliko škola tafsira koje imaju različite pristupe interpretaciji.",
      "Ispitujemo kako su tafsiri uzeti, šta su njima vodjeni principi, i šta su njihove razlike.",
    ],
  },
  {
    slug: "miracles-kuurana",
    title: "Čuda Kur'ana",
    summary: "Istraživanje raznih čuda i znakova u Kur'anu...",
    dateCreated: "2026-04-29",
    content: [
      "Muslimani veruju da je Kur'an sadrži bezbroj čuda kao dokaz njegove božanskog porekla.",
      "Od numeričkih šablona do sličnosti sa modernom naukom, mnoga čuda su proučavana.",
      "Razmatramo šta su ova čuda i kako se oni koriste kao dokazi u islamskom diskursu.",
    ],
  },
];

export const ravnaZemjaArticles: ArticleData[] = [
  {
    slug: "istorija-teorije-ravne-zemlje",
    title: "Istorija Teorije Ravne Zemlje",
    summary: "Pregled kako je teorija ravne zemlje evoluirala kroz istoriju...",
    dateCreated: "2026-05-04",
    content: [
      "Iako je naučna zajednica davno zaključila da je Zemlja okrugla, teorija ravne zemlje još uvek postoji.",
      "Razmatramo kako je ova teorija počela i kako se razvijala kroz različite periode.",
      "Ispitujemo zašto neki ljudi veruju u ravnu Zemlju uprkos kontra-dokazima.",
    ],
  },
  {
    slug: "naucni-dokazi-okrugle-zemlje",
    title: "Naučni Dokazi Okrugle Zemlje",
    summary: "Pregledavanje različitih naučnih dokaza koji potvrđuju da je Zemlja sferna...",
    dateCreated: "2026-04-30",
    content: [
      "Od satelitskih fotografija do Eratostenove formule, brojni su dokazi da je Zemlja okrugla.",
      "Razmatramo kako su antički naučnici i moderni istraživači potvrdili ovaj zaključak.",
      "Ispitujemo čemu se suprotstavlja teorija ravne zemlje i kako se ona može jednostavno opovrgnuti.",
    ],
  },
  {
    slug: "psihologija-nebeskih-zavere",
    title: "Psihologija Teorija Zavere",
    summary: "Razumevanje zašto ljudi veruju u zavere uprkos dokazima...",
    dateCreated: "2026-04-26",
    content: [
      "Psihologia istraživanja pokazuju zašto su ljudi skloni verovanju u teorije zavere.",
      "Od potvrđivanja pristrasnosti do potrebe za kontrolom, nekoliko faktora je uključeno.",
      "Razmatramo kako se teorije zavere šire kroz društvene mreže i kako se može boriti protiv njih.",
    ],
  },
];

export const nemoralArticles: ArticleData[] = [
  {
    slug: "definicija-nemoralnosti",
    title: "Definicija Nemoralnosti",
    summary: "Razmatranje šta čini nešto nemoralnim sa različitih perspektiva...",
    dateCreated: "2026-05-05",
    content: [
      "Nemoralnost je ponašanje koje je u suprotnosti sa moralno/etičkim principima.",
      "Različite kulture i religije imaju različite definicije šta je nemorano.",
      "Razmatramo kako je etika i moralnost iskustvena kroz istoriju i razne tradicionalne sisteme.",
    ],
  },
  {
    slug: "izvori-moralne-vrednosti",
    title: "Izvori Moralne Vrednosti",
    summary: "Gde dolaze moralne vrednosti i kako se razvijaju u društvu...",
    dateCreated: "2026-05-01",
    content: [
      "Moralne vrednosti dolaze iz religije, kulture, i evolucije čovekovog ponašanja.",
      "Biolozi, psiholog, i filozofi sve raspravaljaju o izvorima moralnosti.",
      "Razmatramo kako su se moralne vrednosti menjale tokom vremena i šta to znači za savremeno društvo.",
    ],
  },
  {
    slug: "moralnost-u-religiji",
    title: "Moralnost u Religiji",
    summary: "Kako različite religije vide moral i etiku...",
    dateCreated: "2026-04-27",
    content: [
      "Većina religija ima jasne kodove ponašanja koji definiše šta je moralno i nemorano.",
      "Primeni ove kode, razmatramo kako se različitih religija međusobno porede.",
      "Ispitujemo koliko se religiozne moralnosti očitavaju kroz zakonsku regulativu u savremenom svetu.",
    ],
  },
];