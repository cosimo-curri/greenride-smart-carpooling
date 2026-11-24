module.exports = `
Utente: "Ho bisogno di arrivare in sede il 29/06/2025 alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Tra venti minuti dovrei essere in ufficio, vado da casa."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_ODIERNA in DD/MM/YYYY>","time":"<ORARIO_ATTUALE + 20 min>"}}

Utente: "Domani passo io, ma non so ancora l’orario preciso."
{"promptType":"offer","message":"MISSING_DEPARTURE_TIME"}

Utente: "Passaggio disponibile, ma non so giorno né orario."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Mi servirebbe un passaggio tra tre giorni alle 08:00 precise"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 alle otto sarò in sede, come al solito vengo al punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo entrare in sede domenica alle 08:00, vengo al punto di ritrovo"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Domani mattina serve passaggio per sede, arrivo previsto 08:15, punto standard."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:15"}}

Utente: "Domani alle otto in sede, da casa mia."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Mi sentite? Prova, prova. Funziona?"
{"promptType":"error"}

Utente: "C’è posto in auto, vado domani."
{"promptType":"offer","message":"MISSING_DEPARTURE_TIME"}

Utente: "Parto da casa, mi serve un passaggio per martedì prossimo alle 09:00."
{"promptType":"request","data":{"departureType":"personal","date":"01/07/2025","time":"09:00"}}

Utente: "Alle 07:10 parto ma non ricordo se era per domani o un altro giorno."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE"}

Utente: "Il 29 giugno alle 8 devo essere in ufficio, mi muovo da casa mia"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Mi serve un passaggio, devo essere in sede domani alle 08:30, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:30"}}

Utente: "Alle 07:00 vado, chi vuole un passaggio?"
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE"}

Utente: "Tra 3 giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Ciao! Vado da casa e dovrei essere in ufficio tra un'ora."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_ODIERNA in DD/MM/YYYY>","time":"08:00"}}

Utente: "Il 29 mattina alle 08:00 ho bisogno di un passaggio da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Vado via alle 06:40, oggi."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"06:40"}}

Utente: "Devo essere per le nove, ma non ho detto da dove parto."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Serve un passaggio per le 8 di domenica"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi sposto da casa domenica mattina, devo essere in sede alle 8"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domenica mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Oh, stasera verso le sei me ne vado, chi vuole un passaggio lo dica."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"18:00"}}

Utente: "Chi parte domenica alle 08:00?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Passaggio per domani, arrivo sede ore 08:00, punto raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Quanto dura il tragitto da casa mia alla sede?"
{"promptType":"error"}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domenica devo entrare in ufficio alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Non mi ricordo se oggi avevo palestra o riunione…"
{"promptType":"error"}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Domenica alle otto ho bisogno di essere in azienda"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 giugno alle 08:00 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Tra tre giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domattina parto alle 07:20, zona Scandicci, macchina comoda."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:20","otherInfo":"Macchina comoda"}}

Utente: "Come sempre parto dal pickup, devo essere in ufficio il 29 alle 8"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 alle 08:00 arrivo in ufficio, partenza da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Ho parcheggiato in via Verdi, poi salgo."
{"promptType":"error"}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Serve un passaggio domani, arrivo per le 09:15, vado da casa e se possibile preferisco che l’auto sia non troppo affollata."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"09:15","otherInfo":"Preferisco che l’auto non sia troppo affollata"}}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio, devo essere in sede alle 08:00 ma non so se parto da casa o da raccolta."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Va bene, offro un passaggio ma non ho idea dell’orario né del giorno esatto ancora."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Chi ha il badge che funziona oggi?"
{"promptType":"error"}

Utente: "Mi serve un passaggio tra tre giorni alle otto"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Scusate ma ieri sera ho dimenticato di spegnere il microfono…"
{"promptType":"error"}

Utente: "Domani alle 8 devo essere in sede, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Tra mezz'ora parto, guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"09:30","otherInfo":"Guida tranquilla"}}

Utente: "Chi ha le chiavi della sala riunioni?"
{"promptType":"error"}

Utente: "C'è qualcuno che mi può portare in ufficio domenica alle 8?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Mi sa che ho lasciato il portafoglio in macchina ieri sera."
{"promptType":"error"}

Utente: "Devo essere in sede domenica mattina, vado dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Ciao! Vado da casa e dovrei essere in ufficio tra un'ora."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_ODIERNA in DD/MM/YYYY>","time":"08:00"}}

Utente: "Passaggio disponibile, ma non so giorno né orario."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Il 29 giugno alle 8 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Vado via alle 06:40, oggi."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"06:40"}}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle otto in sede, da casa mia."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Domani mattina serve passaggio per sede, arrivo previsto 08:15, punto standard."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:15"}}

Utente: "Il 29 alle otto sarò in sede, come al solito vengo al punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29/06/2025 alle 08:00 in sede, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Mi serve un passaggio, devo essere in sede domani alle 08:30, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:30"}}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Tra 3 giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Parto da casa, mi serve un passaggio per martedì prossimo alle 09:00."
{"promptType":"request","data":{"departureType":"personal","date":"01/07/2025","time":"09:00"}}

Utente: "Il 29 giugno alle 08:00 devo essere in ufficio, mi muovo da casa mia"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle 07:00 parto da casa."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:00"}}

Utente: "Devo essere per le nove, ma non ho detto da dove parto."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Serve un passaggio per le 8 di domenica"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi sposto da casa domenica mattina, devo essere in sede alle 8"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domenica mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Oh, stasera verso le sei me ne vado, chi vuole un passaggio lo dica."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"18:00"}}

Utente: "Chi parte domenica alle 08:00?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Passaggio per domani, arrivo sede ore 08:00, punto raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Quanto dura il tragitto da casa mia alla sede?"
{"promptType":"error"}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domenica devo entrare in ufficio alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Non mi ricordo se oggi avevo palestra o riunione…"
{"promptType":"error"}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Domenica alle otto ho bisogno di essere in azienda"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 giugno alle 08:00 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Tra tre giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domattina parto alle 07:20, zona Scandicci, macchina comoda."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:20","otherInfo":"Macchina comoda"}}

Utente: "Come sempre parto dal pickup, devo essere in ufficio il 29 alle 8"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 alle 08:00 arrivo in ufficio, partenza da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Ho parcheggiato in via Verdi, poi salgo."
{"promptType":"error"}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Serve un passaggio domani, arrivo per le 09:15, vado da casa e se possibile preferisco che l’auto sia non troppo affollata."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"09:15","otherInfo":"Preferisco che l’auto non sia troppo affollata"}}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio, devo essere in sede alle 08:00 ma non so se parto da casa o da raccolta."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Va bene, offro un passaggio ma non ho idea dell’orario né del giorno esatto ancora."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Chi ha il badge che funziona oggi?"
{"promptType":"error"}

Utente: "Mi serve un passaggio tra tre giorni alle otto"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Scusate ma ieri sera ho dimenticato di spegnere il microfono…"
{"promptType":"error"}

Utente: "Domani alle 8 devo essere in sede, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Tra mezz'ora parto, guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"09:30","otherInfo":"Guida tranquilla"}}

Utente: "Chi ha le chiavi della sala riunioni?"
{"promptType":"error"}

Utente: "C'è qualcuno che mi può portare in ufficio domenica alle 8?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Mi sa che ho lasciato il portafoglio in macchina ieri sera."
{"promptType":"error"}

Utente: "Devo essere in sede domenica mattina, vado dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Ciao! Vado da casa e dovrei essere in ufficio tra un'ora."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_ODIERNA in DD/MM/YYYY>","time":"08:00"}}

Utente: "Passaggio disponibile, ma non so giorno né orario."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Il 29 giugno alle 8 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Vado via alle 06:40, oggi."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"06:40"}}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle otto in sede, da casa mia."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Domani mattina serve passaggio per sede, arrivo previsto 08:15, punto standard."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:15"}}

Utente: "Il 29 alle otto sarò in sede, come al solito vengo al punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29/06/2025 alle 08:00 in sede, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Mi serve un passaggio, devo essere in sede domani alle 08:30, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:30"}}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Tra 3 giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Parto da casa, mi serve un passaggio per martedì prossimo alle 09:00."
{"promptType":"request","data":{"departureType":"personal","date":"01/07/2025","time":"09:00"}}

Utente: "Il 29 giugno alle 08:00 devo essere in ufficio, mi muovo da casa mia"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle 07:00 parto da casa."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:00"}}

Utente: "Devo essere per le nove, ma non ho detto da dove parto."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Serve un passaggio per le 8 di domenica"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi sposto da casa domenica mattina, devo essere in sede alle 8"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domenica mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Oh, stasera verso le sei me ne vado, chi vuole un passaggio lo dica."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"18:00"}}

Utente: "Chi parte domenica alle 08:00?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Passaggio per domani, arrivo sede ore 08:00, punto raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Quanto dura il tragitto da casa mia alla sede?"
{"promptType":"error"}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domenica devo entrare in ufficio alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Non mi ricordo se oggi avevo palestra o riunione…"
{"promptType":"error"}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Domenica alle otto ho bisogno di essere in azienda"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 giugno alle 08:00 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Tra tre giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Domattina parto alle 07:20, zona Scandicci, macchina comoda."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:20","otherInfo":"Macchina comoda"}}

Utente: "Come sempre parto dal pickup, devo essere in ufficio il 29 alle 8"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 alle 08:00 arrivo in ufficio, partenza da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Ho parcheggiato in via Verdi, poi salgo."
{"promptType":"error"}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Serve un passaggio domani, arrivo per le 09:15, vado da casa e se possibile preferisco che l’auto sia non troppo affollata."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"09:15","otherInfo":"Preferisco che l’auto non sia troppo affollata"}}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi serve un passaggio, devo essere in sede alle 08:00 ma non so se parto da casa o da raccolta."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Va bene, offro un passaggio ma non ho idea dell’orario né del giorno esatto ancora."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Chi ha il badge che funziona oggi?"
{"promptType":"error"}

Utente: "Mi serve un passaggio tra tre giorni alle otto"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Scusate ma ieri sera ho dimenticato di spegnere il microfono…"
{"promptType":"error"}

Utente: "Domani alle 8 devo essere in sede, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Tra mezz'ora parto, guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"09:30","otherInfo":"Guida tranquilla"}}

Utente: "Chi ha le chiavi della sala riunioni?"
{"promptType":"error"}

Utente: "C'è qualcuno che mi può portare in ufficio domenica alle 8?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Devo essere in sede il 29/06/2025 alle 08:00, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Mi sa che ho lasciato il portafoglio in macchina ieri sera."
{"promptType":"error"}

Utente: "Devo essere in sede domenica mattina, vado dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Parto domani alle 08:00, preferisco guida tranquilla."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00","otherInfo":"Preferisco guida tranquilla"}}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Ho bisogno di un passaggio domani e alle 08:00"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Ciao! Vado da casa e dovrei essere in ufficio tra un'ora."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_ODIERNA in DD/MM/YYYY>","time":"08:00"}}

Utente: "Passaggio disponibile, ma non so giorno né orario."
{"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}

Utente: "Il 29 giugno alle 8 devo essere in azienda, partirò dal punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "C'è un posto se qualcuno vuole venire, io parto alle 08 da Rifredi domani."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"08:00"}}

Utente: "Vado via alle 06:40, oggi."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"06:40"}}

Utente: "Mi serve un passaggio martedì, punto di raccolta."
{"promptType":"request","messages":["MISSING_TIME"]}

Utente: "Alle 8 del 29 giugno devo essere in sede"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Come ogni lunedì mi faccio trovare al punto di ritrovo alle 08:00"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Devo andare in sede domenica, parto dal mio solito indirizzo, per le 08:00"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle otto in sede, da casa mia."
{"promptType":"request","data":{"departureType":"personal","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:00"}}

Utente: "Domani mattina serve passaggio per sede, arrivo previsto 08:15, punto standard."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:15"}}

Utente: "Il 29 alle otto sarò in sede, come al solito vengo al punto di raccolta"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Il 29 devo essere in ufficio alle otto, c'è qualcuno che passa?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Il 29/06/2025 alle 08:00 in sede, parto da casa"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Mi serve un passaggio, devo essere in sede domani alle 08:30, parto dal punto di raccolta."
{"promptType":"request","data":{"departureType":"default","date":"<DATA_DOMANI in DD/MM/YYYY>","time":"08:30"}}

Utente: "Domani mi potete passare a prendere? Arrivo in sede 09:00."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Tra 3 giorni alle 8 vado in sede, chi mi porta?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Parto da casa, mi serve un passaggio per martedì prossimo alle 09:00."
{"promptType":"request","data":{"departureType":"personal","date":"01/07/2025","time":"09:00"}}

Utente: "Il 29 giugno alle 08:00 devo essere in ufficio, mi muovo da casa mia"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domani alle 07:00 parto da casa."
{"promptType":"offer","data":{"departureDate":"<DATA_DOMANI in DD/MM/YYYY>","departureTime":"07:00"}}

Utente: "Devo essere per le nove, ma non ho detto da dove parto."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}

Utente: "Serve un passaggio per le 8 di domenica"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi sposto da casa domenica mattina, devo essere in sede alle 8"
{"promptType":"request","data":{"departureType":"personal","date":"29/06/2025","time":"08:00"}}

Utente: "Domenica mattina sarò al punto di raccolta alle otto per il passaggio in sede"
{"promptType":"request","data":{"departureType":"default","date":"29/06/2025","time":"08:00"}}

Utente: "Oh, stasera verso le sei me ne vado, chi vuole un passaggio lo dica."
{"promptType":"offer","data":{"departureDate":"<DATA_ODIERNA in DD/MM/YYYY>","departureTime":"18:00"}}

Utente: "Chi parte domenica alle 08:00?"
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE"]}

Utente: "Mi accompagna qualcuno? Vorrei arrivare per le 9 ma non ho ancora deciso se parto da casa."
{"promptType":"request","messages":["MISSING_DEPARTURE_TYPE","MISSING_DATE"]}
`;