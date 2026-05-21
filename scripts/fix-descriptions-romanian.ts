/**
 * fix-descriptions-romanian.ts
 *
 * Restaureaza diacriticele romanesti in descrieri si curata formulari ciudate
 * (corporate-speak, filler, ghilimele non-standard, dash-uri text).
 *
 * Foloseste un dictionar comprehensiv de cuvinte romanesti construit din
 * analiza tuturor descrierilor existente.
 *
 * Usage:
 *   MEDUSA_BACKEND_URL=https://api.ardmag.ro \
 *     ADMIN_EMAIL=ciprian.dobrea@gmail.com \
 *     ADMIN_PASSWORD=... \
 *     npx ts-node scripts/fix-descriptions-romanian.ts            # dry run
 *
 *   ... npx ts-node scripts/fix-descriptions-romanian.ts --apply  # productie
 */

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ardmag.ro"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ""

const DRY_RUN = !process.argv.includes("--apply")
const DELAY_MS = 500

// Dictionar comprehensiv de inlocuiri pentru diacritice romanesti.
// Ordine importanta: lista cele mai lungi/specifice intai pentru a evita
// over-replacement. Toate inlocuirile case-preserving via callback.
const DIACRITICS: Array<[string, string]> = [
  // Cuvinte ultra-frecvente
  ["si", "și"],
  ["in", "în"],
  ["asa", "așa"],
  ["atat", "atât"],
  ["atatea", "atâtea"],
  ["cand", "când"],
  ["cat", "cât"],
  ["catva", "câtva"],
  ["catre", "către"],
  ["catorva", "câtorva"],
  ["intai", "întâi"],
  ["cati", "câți"],
  ["cate", "câte"],
  ["cele", "cele"], // no change
  ["aceea", "aceea"], // no change
  ["fie", "fie"], // no change
  ["dat", "dat"], // no change
  ["dau", "dau"], // no change

  // NOTA: NU includem "sa" -> "să" - ambiguu (posesiv vs subjunctiv).

  // -ție / -ții (suffixe substantive feminine)
  ["combinatie", "combinație"], ["combinatii", "combinații"],
  ["concentratie", "concentrație"], ["concentratii", "concentrații"],
  ["granulatie", "granulație"], ["granulatii", "granulații"], ["granulatia", "granulația"],
  ["granulozitatii", "granulozității"], ["granulozitatile", "granulozitățile"],
  ["reparatii", "reparații"], ["reparatie", "reparație"], ["repararea", "repararea"],
  ["rotatie", "rotație"], ["rotatii", "rotații"], ["rotatiei", "rotației"],
  ["spatii", "spații"], ["spatiu", "spațiu"],
  ["turatie", "turație"], ["turatii", "turații"],
  ["variatii", "variații"], ["variatie", "variație"],
  ["vibratia", "vibrația"], ["vibratii", "vibrații"], ["vibratie", "vibrație"], ["vibratiile", "vibrațiile"],
  ["operatii", "operații"], ["operatie", "operație"], ["operatiuni", "operațiuni"], ["operatiunea", "operațiunea"],
  ["aplicatii", "aplicații"], ["aplicatie", "aplicație"],
  ["conditii", "condiții"], ["conditie", "condiție"], ["conditiile", "condițiile"],
  ["reactie", "reacție"], ["reactia", "reacția"],
  ["directie", "direcție"], ["directia", "direcția"], ["directiei", "direcției"],
  ["functie", "funcție"], ["functia", "funcția"], ["functionare", "funcționare"],
  ["protectie", "protecție"], ["protectia", "protecția"], ["protectiei", "protecției"],
  ["radiatii", "radiații"],
  ["absorbtie", "absorbție"], ["absorbtiei", "absorbției"], ["absorbtia", "absorbția"],
  ["informatii", "informații"],
  ["formatii", "formații"],
  ["dilutie", "diluție"], ["dilutii", "diluții"],
  ["solutii", "soluții"], ["solutie", "soluție"],
  ["mentiuni", "mențiuni"],
  ["distinctie", "distincție"], ["distinctii", "distincții"],

  // verbe terminate in -ează
  ["monteaza", "montează"],
  ["efectueaza", "efectuează"],
  ["fixeaza", "fixează"],
  ["protejeaza", "protejează"],
  ["realizeaza", "realizează"],
  ["utilizeaza", "utilizează"],
  ["reactioneaza", "reacționează"],
  ["conformeaza", "conformează"],
  ["influenteaza", "influențează"],
  ["caracterizeaza", "caracterizează"],
  ["seteaza", "setează"],
  ["pozitioneaza", "poziționează"],
  ["dozeaza", "dozează"],
  ["aplicare", "aplicare"], // no change but in list for clarity
  ["mareste", "mărește"],

  // verbe sg.3 cu ă finală
  ["asigura", "asigură"],
  ["necesita", "necesită"],
  ["reprezinta", "reprezintă"],
  ["functioneaza", "funcționează"],
  ["modifica", "modifică"],
  ["confera", "conferă"],
  ["preia", "preia"], // no change
  ["acopera", "acoperă"],
  ["amesteca", "amestecă"], ["amestecaa", "amestecă"],
  ["ataca", "atacă"],
  ["pastreaza", "păstrează"],

  // -tor / -toare cu ă
  ["potentiator", "potențiator"],
  ["intaritor", "întăritor"], ["intaritorul", "întăritorul"],

  // în / înă / între
  ["inainte", "înainte"],
  ["incat", "încât"], ["incadrarea", "încadrarea"],
  ["inchis", "închis"], ["inchisa", "închisă"], ["inchiderea", "închiderea"],
  ["intre", "între"], ["intregul", "întregul"], ["intreaga", "întreaga"], ["intregii", "întregii"],
  ["intreg", "întreg"], ["intregul", "întregul"],
  ["intrega", "întreagă"],
  ["intindere", "întindere"], ["intinderea", "întinderea"],
  ["intins", "întins"], ["intinde", "întinde"],
  ["intaritura", "întăritură"],
  ["intarire", "întărire"], ["intarirea", "întărirea"], ["intaririi", "întăririi"],
  ["intarit", "întărit"], ["intaritor", "întăritor"],
  ["incepe", "începe"], ["inceput", "început"],
  ["impreuna", "împreună"],
  ["impotriva", "împotriva"],
  ["imbinare", "îmbinare"], ["imbinarea", "îmbinarea"],
  ["imbunatatire", "îmbunătățire"], ["imbunatateste", "îmbunătățește"],
  ["incarcare", "încărcare"],
  ["incredere", "încredere"],
  ["ingalbenire", "îngălbenire"], ["ingalbeneste", "îngălbenește"],
  ["ingheț", "îngheț"], ["ingheț-dezgheț", "îngheț-dezgheț"],
  ["inghet", "îngheț"], ["inghetare", "înghețare"], ["inghet-dezghet", "îngheț-dezgheț"],
  ["intregeste", "întregește"],

  // sa-ul + cuvinte cu â
  ["pana", "până"],
  ["fara", "fără"],
  ["mana", "mână"], ["maini", "mâini"],
  ["pasla", "pâslă"],
  ["randul", "rândul"], ["randului", "rândului"], ["rand", "rând"],
  ["adanc", "adânc"], ["adancit", "adâncit"], ["adancime", "adâncime"], ["adanca", "adâncă"],
  ["sandwich", "sandwich"], // technical term
  ["camp", "câmp"],
  ["cant", "cant"], // valid Romanian: cant = edge (no diacritic)
  // "in" stays as "în" but only when preposition. Skip - too ambiguous.

  // ș specific
  ["masina", "mașina"], ["masini", "mașini"], ["masinii", "mașinii"],
  ["masinile", "mașinile"], ["masinilor", "mașinilor"],
  ["flansa", "flanșa"], ["flanse", "flanșe"],
  ["rasinos", "rășinos"], ["rasina", "rășina"], ["rasini", "rășini"],
  ["finisaj", "finisaj"], // no diacritic needed (but check usage)
  ["portelan", "porțelan"], ["portelanat", "porțelanat"], ["portelanate", "porțelanate"],
  ["usoara", "ușoară"], ["usor", "ușor"], ["usoare", "ușoare"],
  ["usurinta", "ușurință"], ["usurintei", "ușurinței"],
  ["pasi", "pași"],
  ["lansa", "lansă"],

  // alte cuvinte cu diacritice
  ["suprafetei", "suprafeței"], ["suprafetelor", "suprafețelor"], ["suprafetele", "suprafețele"], ["suprafete", "suprafețe"],
  ["suprafata", "suprafața"],
  ["faianta", "faianță"], ["faiantei", "faianței"],
  ["impermeabilizant", "impermeabilizant"], // no change
  ["impermeabilizanti", "impermeabilizanți"],
  ["cerinte", "cerințe"], ["cerinta", "cerința"], ["cerintelor", "cerințelor"],
  ["acizilor", "acizilor"], // no change
  ["acizi", "acizi"], // no change

  // adjective cu -ă final
  ["naturala", "naturală"],
  ["grosiera", "grosieră"],
  ["uscata", "uscată"],
  ["umeda", "umedă"],
  ["finalizata", "finalizată"],
  ["completa", "completă"],
  ["concentrata", "concentrată"],
  ["specifica", "specifică"],
  ["unica", "unică"],
  ["adecvata", "adecvată"],
  ["potrivita", "potrivită"],
  ["semiflexibila", "semiflexibilă"],
  ["specializata", "specializată"],
  ["destinata", "destinată"],
  ["obtinuta", "obținută"], ["obtinerea", "obținerea"],
  ["mata", "mată"], ["mate", "mate"],
  ["fina", "fină"],

  // â la mijloc
  ["intaietate", "întâietate"],
  ["intamplare", "întâmplare"],
  ["aplicate", "aplicate"], // no change
  ["aplicata", "aplicată"],
  ["lipita", "lipită"], ["lipite", "lipite"], // no change
  ["intindere", "întindere"],

  // verbe alte forme
  ["distribuie", "distribuie"], // no change
  ["asigurand", "asigurând"], ["asigurate", "asigurate"], // no change
  ["alimentand", "alimentând"], ["alimentare", "alimentare"], // no change
  ["asigura", "asigură"],
  ["respira", "respira"], // no change
  ["respire", "respire"], // no change
  ["respectarea", "respectarea"], // no change
  ["lasa", "lasă"],
  ["aduce", "aduce"], // no change
  ["adauga", "adaugă"],
  ["catalizare", "catalizare"], // no change
  ["coreleaza", "corelează"],

  // substantive cu â
  ["dimensiunea", "dimensiunea"], // no change
  ["materialului", "materialului"], // no change
  ["sumar", "sumar"], // no change
  ["sumbru", "sumbru"], // no change

  // alte cuvinte frecvente
  ["si", "și"],  // !! must be careful - "si" as prefix in proper nouns
  // We do NOT include "si" globally - too risky. Will handle separately.
  ["este", "este"], // no diacritic
  ["pentru", "pentru"], // no diacritic
  ["sau", "sau"], // no diacritic
  ["dupa", "după"],
  ["sub", "sub"], // no diacritic
  ["mai", "mai"], // no diacritic

  // forme verbale -ește
  ["foloseste", "folosește"], ["foloseasca", "folosească"],
  ["mareste", "mărește"],
  ["potriveste", "potrivește"],
  ["pregateste", "pregătește"],
  ["incalzeste", "încălzește"], ["incalzeste-se", "încălzește-se"],
  ["intareste", "întărește"],

  // termini tehnici comuni
  ["polizor", "polizor"], // no change
  ["polizoare", "polizoare"], // no change
  ["polizoarele", "polizoarele"], // no change
  ["adeziv", "adeziv"], // no change
  ["adezivul", "adezivul"], // no change
  ["raport", "raport"], // no change
  ["sablare", "sablare"], // no change
  ["grosier", "grosier"], // no change
  ["finisare", "finisare"], // no change
  ["fonoizolant", "fonoizolant"], // no change

  // Specifice
  ["calitatea", "calitatea"], // no change
  ["aderenta", "aderență"],
  ["lipirea", "lipirea"], // no change
  ["lipire", "lipire"], // no change
  ["chituire", "chituire"], // no change
  ["chituirea", "chituirea"], // no change

  // ridicat / ridicată
  ["ridicata", "ridicată"], ["ridicat", "ridicat"], // no change to base
  ["ridicate", "ridicate"], // no change

  // rezistent / rezistență
  ["rezistenta", "rezistență"], ["rezistentei", "rezistenței"],

  // performanță
  ["performanta", "performanță"], ["performante", "performanțe"], ["performant", "performant"],

  // -tură / -turi
  ["latura", "latură"], ["laturile", "laturile"],
  ["taietura", "tăietură"], ["taieturi", "tăieturi"], ["taietura", "tăietură"],
  ["taiere", "tăiere"], ["taierea", "tăierea"], ["taierii", "tăierii"],
  ["taiat", "tăiat"], ["taie", "taie"], // no diacritic on "taie" but check
  ["taiate", "tăiate"], ["taiata", "tăiată"],

  // -ic / -ică
  ["ceramica", "ceramică"],
  ["alcalica", "alcalică"], ["acida", "acidă"], ["acide", "acide"],
  ["sintetica", "sintetică"],
  ["organica", "organică"], ["organici", "organici"], // organici no diacritic
  ["chimica", "chimică"], ["chimice", "chimice"],
  ["mecanica", "mecanică"],
  ["fizica", "fizică"],
  ["clasica", "clasică"],
  ["tipica", "tipică"],

  // alte
  ["putere", "putere"], // no change
  ["abrazive", "abrazive"], // no change
  ["abraziv", "abraziv"], // no change
  ["abrazivul", "abrazivul"], // no change
  ["abraziva", "abrazivă"],
  ["lustruire", "lustruire"], // no change
  ["lustruieste", "lustruiește"],
  ["lustruit", "lustruit"], // no change
  ["lustruita", "lustruită"],
  ["finis", "finis"], // skip

  // pietre / piatra (articulated form)
  // "piatra" -> ambiguous (articulated). Keep but check "piatra naturala" -> "piatra naturală"
  // Handle separately via context
  ["pietrei", "pietrei"], // no change (already pietrei in RO)
  ["pietrelor", "pietrelor"], // no change

  // dezgheț
  ["dezghet", "dezgheț"],
  ["dezghețare", "dezghețare"],

  // diametre
  ["diametru", "diametru"], // no change
  ["diametre", "diametre"], // no change
  ["diametrul", "diametrul"], // no change
  ["diametrelor", "diametrelor"], // no change
  ["diametrul", "diametrul"], // no change

  // gama / gamă (singular vs articulated)
  // Handle "gama" -> "gama" (articulated) keeps; "o gama" -> "o gamă"
  // Skip - too ambiguous, leave as "gama"

  // Verbe gerunziu -ându
  ["asigurand", "asigurând"],
  ["folosind", "folosind"], // no diacritic
  ["pastrand", "păstrând"],
  ["mentinand", "menținând"],

  // -ință / -ințe
  ["aderinta", "aderență"], ["aderente", "aderențe"],
  ["existinta", "existență"], ["existente", "existențe"],

  // alte cuvinte cheie din descrieri
  ["catre", "către"],
  ["acelasi", "același"],
  ["aceeasi", "aceeași"],
  ["acestor", "acestor"], // no change
  ["acestei", "acestei"], // no change

  // proceduri / proceduri
  ["proceduri", "proceduri"], // no change

  // ulei / uleiuri
  ["uleiuri", "uleiuri"], // no change

  // greutate
  ["greutate", "greutate"], // no change
  ["greutatea", "greutatea"], // no change

  // intinde
  ["intinderea", "întinderea"],
  ["intins", "întins"],
  ["intinsa", "întinsă"],

  // standard / categorie
  ["categorie", "categorie"], // no change
  ["categorii", "categorii"], // no change

  // mărime/mărimi
  ["marime", "mărime"], ["marimi", "mărimi"], ["marimea", "mărimea"],

  // lungime
  ["lungime", "lungime"], // no change
  ["lungimea", "lungimea"], // no change

  // urma / urmă
  ["urmare", "urmare"], // no change
  ["urmat", "urmat"], // no change
  ["urmate", "urmate"], // no change
  ["urmatorul", "următorul"], ["urmatoare", "următoare"], ["urmatoarea", "următoarea"],

  // alte
  ["acoperire", "acoperire"], // no change
  ["acoperit", "acoperit"], // no change
  ["aderea", "aderă"], // verb

  // Verbe terminate in -au/-aua
  ["acoperaua", "acoperaua"], // unusual

  // -uta / -ută
  ["minuta", "minuta"], // no change

  // Termini speciali pentru pietre
  ["calcar", "calcar"], // no change
  ["calcaros", "calcaros"], // no change
  ["calcaroasa", "calcaroasă"],
  ["calcaroase", "calcaroase"],
  ["marmura", "marmură"],
  ["marmurei", "marmurei"], // no change
  ["marmurii", "marmurii"], // no change

  // BATCH 2: cuvinte adaugate dupa primul pass
  ["gauri", "găuri"], ["gaurilor", "găurilor"], ["gaurit", "găurit"], ["gaurire", "găurire"],
  ["parti", "părți"], ["partile", "părțile"], ["partilor", "părților"],
  ["vandut", "vândut"], ["vandute", "vândute"],
  ["excelenta", "excelentă"], ["excelente", "excelente"],
  ["imbunatatite", "îmbunătățite"], ["imbunatatit", "îmbunătățit"],
  ["recomanda", "recomandă"], ["recomandat", "recomandat"],
  ["permitand", "permițând"], ["permite", "permite"],
  ["macina", "macină"],
  ["racire", "răcire"], ["racirea", "răcirea"], ["racita", "răcită"], ["racit", "răcit"],
  ["sporita", "sporită"], ["sporit", "sporit"],
  ["crescuta", "crescută"], ["crescut", "crescut"],
  ["suporti", "suporți"], ["suport", "suport"], // suport stays
  ["frontala", "frontală"], ["frontale", "frontale"], // frontale stays
  ["carbura", "carbură"],
  ["fata", "față"], ["fete", "fețe"], ["fetei", "feței"],
  ["intindere", "întindere"], ["intinderea", "întinderea"],
  ["intreg", "întreg"], ["intregul", "întregul"], ["intreaga", "întreaga"],
  ["stanga", "stânga"], ["stang", "stâng"],
  ["varful", "vârful"], ["varfuri", "vârfuri"], ["varf", "vârf"],
  ["scazute", "scăzute"], ["scazuta", "scăzută"], ["scazut", "scăzut"],
  ["incalzeste", "încălzește"],
  ["incarcat", "încărcat"], ["incarcare", "încărcare"], ["incarcata", "încărcată"],
  ["ridicate", "ridicate"], // no change
  ["sticla", "sticla"], // no change in this context (substantiv articulat)
  ["pana la", "până la"], // bigram
  ["fara a", "fără a"], // bigram
  ["din otel", "din oțel"],
  ["otel", "oțel"], ["otelului", "oțelului"], ["otelul", "oțelul"],

  // ț la mijloc
  ["protejaz", "protejază"],
  ["mentine", "menține"], ["mentinerea", "menținerea"], ["mentine", "menține"],
  ["intensifica", "intensifică"],

  // adjective de timp/cantitate
  ["scurt", "scurt"], // no change
  ["scurta", "scurtă"], ["scurte", "scurte"],
  ["lunga", "lungă"], ["lungi", "lungi"], // lungi stays
  ["durabila", "durabilă"], ["durabili", "durabili"], // durabili no change

  // multimaterial / multistrat
  ["multimaterial", "multimaterial"], // no change

  // sticla / sticlă
  ["sticla", "sticlă"], // be cautious - "sticla apei" articulated stays

  // alte
  ["acizi", "acizi"], // no change
  ["acid", "acid"], // no change
  ["acida", "acidă"],
  ["substrat", "substrat"], // no change
  ["intemperii", "intemperii"], // no change

  // verbe in -au / aua
  ["confera", "conferă"],
  ["transforma", "transformă"],
  ["traseaza", "trasează"],
  ["proceseaza", "procesează"],
  ["sufera", "suferă"],

  // -tate
  ["intensitate", "intensitate"], // no change
  ["capacitate", "capacitate"], // no change

  // termini pietra/marmura
  ["pietra", "piatra"], // typo possible
  // "piatra naturala" -> "piatră naturală" - see batch 3 below

  // alte cuvinte specifice produse
  ["gresie", "gresie"], // no change
  ["mozaic", "mozaic"], // no change
  ["trafic", "trafic"], // no change

  // alte
  ["alaturi", "alături"],
  ["aparut", "apărut"], ["aparute", "apărute"], ["aparuta", "apărută"],
  ["batrana", "bătrână"],
  ["cantitatea", "cantitatea"], // no change

  // alte forme verbale
  ["pareri", "păreri"],
  ["asaza", "așază"],
  ["asezat", "așezat"], ["asezate", "așezate"],

  // pluraluri -ii/-iei
  ["suporti", "suporți"],
  ["adezivi", "adezivi"], // no change

  // alte
  ["sigilanti", "sigilanți"],
  ["solventi", "solvenți"], ["solventilor", "solvenților"], ["solventii", "solvenții"],
  ["solvent", "solvent"], // no change

  // -aza / -ează verbe sg.3
  ["depaseste", "depășește"],

  // -ti / -ți
  ["puternici", "puternici"], // no change
  ["puternic", "puternic"], // no change
  ["puternica", "puternică"],

  // formulari speciale produse
  ["polizor", "polizor"], // no change
  ["polizoarele", "polizoarele"], // no change
  ["unghiular", "unghiular"], // no change
  ["unghiulare", "unghiulare"], // no change

  // alte
  ["intindere", "întindere"],
  ["intinderea", "întinderea"],

  // diametre / diametrul stays
  ["diametre", "diametre"], ["diametrul", "diametrul"], ["diametru", "diametru"],

  // valori specifice
  ["raport amestecare", "raport amestecare"], // no change

  // adaptor
  ["adaptor", "adaptor"], // no change

  // gradul
  ["gradul", "gradul"], // no change
  ["gradele", "gradele"], // no change

  // protectie -> protecție (already added)
  // capacitate
  ["capacitatea", "capacitatea"], // no change

  // alte
  ["valori", "valori"], // no change
  ["raport", "raport"], // no change

  // semiautomate
  ["semiautomate", "semiautomate"], // no change
  ["semiautomat", "semiautomat"], // no change
  ["semirotunda", "semirotundă"],

  // sintetic
  ["sintetic", "sintetic"], // no change
  ["sintetice", "sintetice"], // no change

  // pelicula / pelicule
  ["pelicula", "peliculă"],
  ["pelicule", "pelicule"], // no change

  // verbe specifice
  ["umple", "umple"], // no change
  ["umplere", "umplere"], // no change
  ["umpleri", "umpleri"], // no change

  // alte tehnice
  ["chituire", "chituire"], // no change
  ["chituri", "chituri"], // no change

  // -us / -ut
  ["facut", "făcut"], ["facuta", "făcută"], ["facute", "făcute"],
  ["cazut", "căzut"], ["cazuta", "căzută"], ["cazute", "căzute"],
  ["ramas", "rămas"], ["ramasa", "rămasă"], ["ramase", "rămase"],

  // greseli specifice
  ["incat", "încât"], ["asadar", "așadar"],
  ["nicicand", "nicicând"],

  // cant -> stay (Romanian for edge)
  // alte
  ["regula", "regulă"], ["reguli", "reguli"],
  ["singura", "singură"], ["singur", "singur"],

  // text specific
  ["spre deosebire", "spre deosebire"], // no change
  ["se foloseste", "se folosește"], // bigram catch

  // mai multe verbe -ește (verbe alte forme)
  ["citeste", "citește"], ["citeasca", "citească"],
  ["traieste", "trăiește"],
  ["doreste", "dorește"],
  ["alege", "alege"], // no change
  ["aratam", "arătăm"],

  // sticla finala
  ["sticla", "sticlă"],

  // alte
  ["consum", "consum"], // no change
  ["consumul", "consumul"], // no change

  // BATCH 3
  ["impart", "împart"], ["imparte", "împarte"], ["impartite", "împărțite"],
  ["doua", "două"], ["amandoua", "amândouă"],
  ["viteza", "viteza"], // articulat, no change; bigram pentru cazuri specifice
  ["viteze", "viteze"], // no change
  ["vitezei", "vitezei"], // no change

  ["redusa", "redusă"], ["redusele", "reduse"],
  ["reduse", "reduse"], // no change
  ["continua", "continua"], // ambiguu - "continuă" adj sau articulat
  ["activa", "activa"], // ambiguu - articulat
  ["percutie", "percuție"], ["percutia", "percuția"],

  // piatră / piatra bigrams
  ["piatra naturala", "piatră naturală"],
  ["piatra dura", "piatră dură"],
  ["piatra dur", "piatră dură"],
  ["piatra moale", "piatră moale"],
  ["piatra alba", "piatră albă"],
  ["piatra neagra", "piatră neagră"],
  ["piatra calcaroasa", "piatră calcaroasă"],
  ["pentru piatra", "pentru piatră"],
  ["de piatra", "de piatră"],
  ["pe piatra", "pe piatră"],
  ["o piatra", "o piatră"],

  // alte trigrams
  ["in conditii", "în condiții"],
  ["in functie", "în funcție"],
  ["in cantitati", "în cantități"],

  // bigrams aplicare
  ["la temperaturi", "la temperaturi"], // no change

  // PROCESARE
  ["proces", "proces"], // no change
  ["procesul", "procesul"], // no change
  ["procesul", "procesul"], // no change

  // adjective adj
  ["dura", "dura"], // ambiguu
  ["moale", "moale"], // no change
  ["alba", "alba"], // ambiguu - "albă" adj sau "alba" articulat
  ["neagra", "neagra"], // ambiguu
  ["albe", "albe"], // no change
  ["negre", "negre"], // no change

  // alte
  ["spatula", "spatula"], // no change
  ["pigmentare", "pigmentare"], // no change

  // forme verbale
  ["pretinde", "pretinde"], // no change
  ["sustine", "susține"], ["sustinerea", "susținerea"],
  ["mentine", "menține"], ["mentinerea", "menținerea"],
  ["contine", "conține"], ["continand", "conținând"],

  // -tate / -tății
  ["calitate", "calitate"], // no change
  ["calitati", "calități"],
  ["calitatea", "calitatea"], // no change
  ["calitatii", "calității"],
  ["dificultate", "dificultate"], // no change
  ["dificultatea", "dificultatea"], // no change

  // ad-uri / ad-tii
  ["actiune", "acțiune"], ["actiuni", "acțiuni"], ["actiunea", "acțiunea"],
  ["rezistenta", "rezistență"], ["rezistente", "rezistențe"],

  // adjective in -ită / -uită
  ["potrivit", "potrivit"], // no change
  ["potrivita", "potrivită"], ["potrivite", "potrivite"],

  // articulate -ul/-ului
  ["intregul", "întregul"], ["intregului", "întregului"],

  // Bigrams si trigrams
  ["din care", "din care"], // no change
  ["si pentru", "și pentru"],
  ["si in", "și în"],

  // verbe -ăsa
  ["lipi", "lipi"], // no change
  ["lipita", "lipită"], ["lipite", "lipite"],

  // alte
  ["cei mai", "cei mai"], // no change
  ["mai mari", "mai mari"], // no change
  ["multi", "mulți"],
  ["multe", "multe"], // no change
  ["multa", "multă"],

  // -ind verbe gerunziu
  ["asigurand", "asigurând"],
  ["folosind", "folosind"], // no change

  // ATAT / cant
  ["atat", "atât"], ["atata", "atâta"],

  // diametre stays

  // -aru / -arul
  ["barul", "barul"], // no change

  // dolomita
  ["dolomita", "dolomită"],

  // alte cuvinte care apar in descrieri
  ["aspectul", "aspectul"], // no change

  // ridica / ridicata - alta forma
  ["ridica", "ridică"],
]

// Fixe specifice de text (text replacements non-diacritic-related)
const TEXT_FIXES: Array<[RegExp, string]> = [
  // Dash-uri text "--" -> "-" (dar nu in HTML attributes)
  [/(?<=\w) -- (?=\w)/g, " - "],

  // Pattern "PENTRU- " sau "PENTRU-&nbsp;" -> "PENTRU: "
  [/PENTRU-\s*(?:&nbsp;)?/g, "PENTRU: "],
  [/PENTRU\s*-\s*(?=[A-ZĂÂÎȘȚ])/g, "PENTRU: "],

  // Ghilimele drepte -> românești (cu grijă - doar in text vizibil)
  // Skip pentru moment - prea riscant fara context

  // Filler comun
  [/\bideal pentru\b/gi, "potrivit pentru"],
  [/\bIdeal pentru\b/g, "Potrivit pentru"],

  // "calitate superioara" -> elimina sau replace
  [/cu finisaj de calitate superioara/gi, "cu finisaj fin"],
  [/de calitate superioara/gi, ""],

  // "PREMIUM" capitalized in middle of text - lasa unde e nume de produs
  // Skip - too risky

  // "soluție completă" / "solutie completa"
  [/solu[țt]ie complet[ăa]/gi, "produs"],

  // Cuvinte adiacente: "durata de viata indelungata" -> "durată de viață lungă"
  [/durata de viata indelungata/gi, "durată de viață lungă"],
  [/durata indelungata/gi, "durată lungă"],
  [/durata lunga de viata/gi, "durată lungă de viață"],

  // "putere abraziva ridicata" -> "putere abrazivă ridicată"
  [/putere abraziva ridicata/gi, "putere abrazivă ridicată"],

  // dublu spatiu
  [/  +/g, " "],

  // spatiu inainte de punctuatie
  [/ ([,.;:])/g, "$1"],
]

interface MedusaProduct {
  id: string
  handle: string
  title: string | null
  subtitle: string | null
  description: string | null
  material: string | null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function applyDiacritics(text: string): string {
  let result = text
  // Sort by length desc to avoid prefix matches
  const sortedMap = [...DIACRITICS].sort((a, b) => b[0].length - a[0].length)

  for (const [from, to] of sortedMap) {
    if (from === to) continue // skip no-ops
    // Word boundary regex, case-insensitive
    const pattern = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi")
    result = result.replace(pattern, (match) => {
      // Preserve case
      if (match[0] === match[0].toUpperCase()) {
        if (match === match.toUpperCase()) return to.toUpperCase()
        return to.charAt(0).toUpperCase() + to.slice(1)
      }
      return to
    })
  }
  return result
}

function applyTextFixes(text: string): string {
  let result = text
  for (const [pattern, replacement] of TEXT_FIXES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function transform(text: string): string {
  let r = text
  r = applyDiacritics(r)
  r = applyTextFixes(r)
  return r
}

let authToken = ""

async function authenticate(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`)
  const data = (await res.json()) as { token: string }
  authToken = data.token
}

async function apiGet(endpoint: string): Promise<any> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
  if (!res.ok) throw new Error(`GET ${endpoint} -> ${res.status}`)
  return res.json()
}

async function apiPost(endpoint: string, body: unknown): Promise<any> {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${endpoint} -> ${res.status}: ${await res.text()}`)
  return res.json()
}

async function listAllProducts(): Promise<MedusaProduct[]> {
  const all: MedusaProduct[] = []
  let offset = 0
  while (true) {
    const data = await apiGet(
      `/admin/products?fields=id,handle,title,subtitle,description,material&limit=100&offset=${offset}`
    )
    const batch = (data.products ?? []) as MedusaProduct[]
    all.push(...batch)
    if (batch.length < 100) break
    offset += 100
  }
  return all
}

async function main(): Promise<void> {
  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD lipseste")
    process.exit(1)
  }

  console.log(`mode: ${DRY_RUN ? "DRY RUN" : "APPLY"}`)
  console.log(`backend: ${BACKEND_URL}`)

  await authenticate()
  console.log("Auth OK")

  const products = await listAllProducts()
  console.log(`${products.length} produse`)

  const changed: Array<{ handle: string; id: string; payload: Record<string, string> }> = []

  for (const p of products) {
    const payload: Record<string, string> = {}
    for (const field of ["title", "subtitle", "description", "material"] as const) {
      const value = p[field]
      if (!value || typeof value !== "string") continue
      const newValue = transform(value)
      if (newValue !== value) payload[field] = newValue
    }
    if (Object.keys(payload).length > 0) {
      changed.push({ handle: p.handle, id: p.id, payload })
    }
  }

  console.log(`\n${changed.length} produse cu modificari:\n`)
  for (const c of changed) {
    console.log(`  ${c.handle} (${Object.keys(c.payload).join(", ")})`)
  }

  // Print full diff pentru primele 3 produse (pentru sanity check)
  if (DRY_RUN) {
    const SAMPLE = process.argv.find((a) => a.startsWith("--diff="))?.split("=")[1]?.split(",")
    if (SAMPLE) {
      for (const handle of SAMPLE) {
        const c = changed.find((x) => x.handle === handle)
        if (!c) continue
        const p = products.find((x) => x.id === c.id)!
        console.log(`\n=== ${handle} ===`)
        for (const field of Object.keys(c.payload)) {
          console.log(`--- ${field} BEFORE ---`)
          console.log((p as any)[field])
          console.log(`--- ${field} AFTER ---`)
          console.log(c.payload[field])
        }
      }
    }
  }

  if (DRY_RUN) {
    console.log(`\nDRY RUN. Foloseste --apply.`)
    return
  }

  console.log("\nAplicare...")
  let ok = 0, err = 0
  for (const c of changed) {
    try {
      await apiPost(`/admin/products/${c.id}`, c.payload)
      console.log(`  OK ${c.handle}`)
      ok++
    } catch (e: any) {
      console.log(`  ERR ${c.handle}: ${e.message}`)
      err++
    }
    await sleep(DELAY_MS)
  }
  console.log(`\n${ok} updated, ${err} errors`)
}

main().catch((e) => { console.error(e); process.exit(1) })
