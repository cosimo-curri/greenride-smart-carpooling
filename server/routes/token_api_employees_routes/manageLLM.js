const express = require("express");
const router = express.Router();

const Employee = require("../../models/employees");
const Offer = require("../../models/offers");
const { tenantOffersOnly, forRanking, restoreRankedOffers } = require("../../utils/llmOffers");

const helpers = require("../../utils/helpers");
const llmExamples = require("../../utils/llmExamples");

router.post("/send", async (req, res) => {
    const { prompt } = req.body;

    const today = new Date();
    const formattedToday = today.toLocaleDateString("it-IT");
    const formattedTime = today.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const finalPrompt = `
        Sei un assistente incaricato di analizzare le trascrizioni vocali degli utenti di un sistema di carpooling aziendale. Ogni messaggio può essere:
        - una richiesta di passaggio ("request"),
        - un'offerta di passaggio ("offer"),
        - o un contenuto non pertinente/illeggibile ("error").

        Il tuo compito è restituire solo un JSON valido con:

        1. Il campo promptType: "request", "offer" o "error".

        2. Se promptType è "offer":
        - la data odierna è ${formattedToday} e l'ora attuale è ${formattedTime}, e quando l'utente fa riferimento a espressioni temporali relative come "domani", "stasera", "tra un'ora", "tra mezz'ora", etc. calcola la data e l'orario effettivi partendo da questi valori
        - se nel messaggio sono presenti sia data che ora di partenza, includi un ulteriore campo data (oggetto JSON) con: {"departureDate":"DD/MM/YYYY","departureTime":"HH:MM"}
        Se nel messaggio sono presenti altre informazioni rilevanti (es. richieste di puntualità, stile di guida, condizioni particolari), aggiungi un campo opzionale "otherInfo" all'interno di data assicurandoti di parlare in prima persona, ad esempio: {"departureDate":"26/06/2025","departureTime":"07:30","otherInfo":"Viaggio tranquillo e richiedo che la musica non sia alta"}
        - se manca solo la data di partenza, restituisci invece: {"promptType":"offer","message":"MISSING_DEPARTURE_DATE"}
        - se manca solo l'ora di partenza, restituisci invece: {"promptType":"offer","message":"MISSING_DEPARTURE_TIME"}
        - se mancano entrambe, restituisci invece: {"promptType":"offer","message":"MISSING_DEPARTURE_DATE_TIME"}
        
        3. Se promptType è "request":
        - la data odierna è ${formattedToday} e l'ora attuale è ${formattedTime}, e quando l'utente fa riferimento a espressioni temporali relative come "domani", "stasera", "tra un'ora", "tra mezz'ora", etc. calcola la data e l'orario effettivi partendo da questi valori
        - se nel messaggio è presente un'indicazione sul punto di partenza, nonché la data e l'ora in cui l'utente ha bisogno di stare in ufficio, includi un ulteriore campo data (oggetto JSON) con: {"departureType":"<personal|default>","date":"DD/MM/YYYY",time:"HH:MM"}
        - non inferire mai il valore del campo departureType: restituiscilo solo se l'utente specifica in modo chiaro da dove parte, quindi per esempio usa "personal" solo se è presente un riferimento diretto come "da casa", "da casa mia", "parto da casa", "parto dal mio indirizzo", etc. e usa "default" solo se è presente un riferimento esplicito al punto di raccolta (es. "punto di raccolta", "ritrovo", "solito posto", "zona pickup", etc.), per cui se non è chiaramente indicato, considera departureType come mancante
        - se manca almeno un'informazione tra departureType, date o time, non includere un campo data ma includi un campo messages come array di stringhe: se non riesci ad estrapolare departureType inserisci "MISSING_DEPARTURE_TYPE", se non riesci ad estrapolare date (assoluta o relativa) inserisci "MISSING_DATE" e se non riesci ad estrapolare time (assoluta o relativa) inserisci "MISSING_TIME"
        - se è presente il campo data e non il campo messages, e se ci sono delle informazioni aggiuntive, inserisci il campo opzionale otherInfo all'interno di data e scrivi le informazioni in prima persona

        4. Se promptType è "error", non includere né data né message né messages, ma ritorna esclusivamente {"promptType":"error"}.

        Assicurati di rispettare la formattazione della data e dell'ora come ti è stato richiesto.
        Nel JSON non aggiungere commenti né chiavi diverse da quelle sopra.

        Esempi generali:

        ${llmExamples}

        Adesso analizza il seguente testo trascritto e rispondi solo con il JSON descritto:

        ${prompt}
    `;

    const loggedEmployee = req.employee;

    if(!prompt) {
        return res.json({ message: "SEND_LLM_ERROR" });
    }

    try {
        const response = await helpers.sendLLM(finalPrompt, true);
        const content = JSON.parse(helpers.cleanLLMResponseSafe(response.choices[0].message.content));
        const data = content.data;

        if(
            !content ||
            typeof content !== "object" ||
            !content.promptType
        )
            return res.json({ message: "SEND_LLM_ERROR" });

        if(content.promptType === "offer") {
            if(content.message)
                return res.json({ message: content.message });

            if(data.departureDate && data.departureTime) {
                data.employee = loggedEmployee._id;
                data.departureCoordinates = loggedEmployee.pin;
                data.freeSeats = loggedEmployee.defaultFreeSeats;
                data.intermediateStops = [];
                data.pendingRequests = [];

                if(data.otherInfo) {
                    const otherInfo = data.otherInfo;
                    data.otherInfo = otherInfo.charAt(0).toUpperCase() + otherInfo.slice(1)
                }

                const newOffer = new Offer(data);
                await newOffer.save();

                await newOffer.populate({
                    path: "employee",
                    select: "_id username"
                });

                return res.json({ message: "SEND_LLM_NEW_OFFER_OK", offer: newOffer });
            }

            return res.json({ message: "SEND_LLM_ERROR" });
        }

        if(content.promptType === "request") {
            if(content.messages)
                return res.json({ messages: content.messages });

            if(data.departureType && data.date && data.time) {
                // Restrict the initial database query to the authenticated tenant.
                // `populate.match` by itself would still return offers from other tenants.
                const tenantEmployeeIds = await Employee.distinct("_id", {
                    company: loggedEmployee.company
                });
                const queriedOffers = await Offer.find({
                    employee: { $in: tenantEmployeeIds, $ne: loggedEmployee._id },
                    freeSeats: { $gt: 0 },
                    departureDate: data.date
                })
                .populate({
                    path: "employee",
                    match: { company: loggedEmployee.company },
                    select: "username company"
                })
                .lean();
                const offers = tenantOffersOnly(queriedOffers, loggedEmployee.company);

                for(const offer of offers) {
                    if(data.departureType === "default")
                        offer.userDistance = "0 km";
                    else
                        offer.userDistance = `${helpers.coordinatesDistance(offer.departureCoordinates.coordinates[1], offer.departureCoordinates.coordinates[0], loggedEmployee.pin.coordinates[1], loggedEmployee.pin.coordinates[0])} km`;
                
                    offer.userMinutesDistance = helpers.minutesDistance(offer.departureTime, data.time);
                }

                if(offers.length > 0) {
                    const offerSortingPrompt = `
                        Sei un assistente incaricato di lavorare su un JSON contenente un array di offerte di passaggi (anch'esse in JSON) per andare a lavoro il giorno ${formattedToday} mediante un sistema di carpooling.
                        Devi restituire SOLO ed ESCLUSIVAMENTE un JSON array, senza alcun testo aggiuntivo prima, dopo o all'interno del JSON. Non inserire commenti o spiegazioni.
                        
                        Il tuo compito è ordinare gli elementi per conformità alla richiesta (dalla più alla meno conforme)

                        Criteri di conformità:
                        - orario migliore: il campo userMinutesDistance tanto minore è meglio è
                        - distanza migliore: il campo userDistance tanto minore è meglio è

                        Aggiungi a ogni oggetto un campo "reason" rigorosamente in lingua inglese con spiegazione concisa (massimo 1 frase) terminando sempre con un punto e senza mai fare riferimento ai nomi dei campi del JSON (scrivili piuttosto in linguaggio naturale).
                        ${data.otherInfo ? "Voglio anche che confronti il campo otherInfo di ogni offerta (se presente) con le seguenti indicazioni dell'utente: " + data.otherInfo + " (fai inferenza e comprendi se le richieste sono conformi tra loro, e aggiungi alla fine di reason un'indicazione a riguardo breve e concisa)" : ""}
                        
                        ESEMPI GENERICO DI CONFORMITÀ DI otherInfo:
                        - se l'utente vuole l'aria condizionata ma in otherInfo dell'offerta è specificato che non si usa l'aria condizionata allora non si ha conformità
                        - se l'utente richiede flessibilità di orari ma in otherInfo dell'offerta è specificato che è richiesta massima puntualità allora non si ha conformità
                        - se l'utente ama viaggiare con la musica e in otherInfo dell'offerta è specificato che si utilizza la musica ad alto volume allora si ha conformità

                        Verifica che l'output sia un JSON array valido prima di inviarlo.

                        JSON delle offerte:

                        ${JSON.stringify(offers.map(forRanking))}
                    `;

                    const responseSorting = await helpers.sendLLM(offerSortingPrompt, false);
                    const modelRanking = JSON.parse(`[${helpers.cleanLLMResponseSafe(responseSorting.choices[0].message.content)}]`);
                    const contentSorting = restoreRankedOffers(modelRanking, offers);
                    
                    const dataJSON = {
                        departureType: data.departureType,
                        contentSorting: contentSorting
                    };

                    return res.json({ message: "SEND_LLM_OFFERS_OK", data: dataJSON });
                } else
                    return res.json({ message: "SEND_LLM_NO_OFFERS_FOUND" });
            }

            return res.json({ message: "SEND_LLM_ERROR" });
        }

        return res.json({ message: "SEND_LLM_NO_CLASSIFICATION_ERROR" });
    } catch(_) {
        return res.json({ message: "SEND_LLM_ERROR" });
    }
});

module.exports = router;