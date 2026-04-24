import admin = require('firebase-admin');
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { findAdded } from '..';

export const update_numbers_names_for_keyword_wise_export = onDocumentWritten(`searchHistorySummary2KeywordWise/{id}`, async (event) => {
    console.log(`started`)
    if (event == undefined || event.data == undefined || event.data.after.data() == undefined || event.data.after.data() == null) return

    let allNumbersBefore: any[] = []
    let allNumbersAfter: any[] = []

    // gather allNumbersBefore
    if (true) {
        try {
            const beforeData = event.data!.before.data()!
            const keywordsNumbers = beforeData.keywordsNumbers
            const keywordsNumbersMap: Map<string, any> = new Map(Object.entries(keywordsNumbers));
            const keywords = Array.from(keywordsNumbersMap.keys())

            for (const keyword of keywords) {
                try {
                    const nums = keywordsNumbersMap.get(keyword)
                    allNumbersBefore = [...nums, ...allNumbersBefore]
                } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///03///${e.toString()}`); }
            }

            allNumbersBefore = [...new Set(allNumbersBefore)]
        } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///02///${e.toString()}`); }
    }

    console.log(`allNumbersBefore: ${allNumbersBefore.length}`)

    // gather allNumbersAfter
    if (true) {
        try {
            const afterData = event.data.after.data()!
            const keywordsNumbers = afterData.keywordsNumbers
            const keywordsNumbersMap: Map<string, any> = new Map(Object.entries(keywordsNumbers));
            const keywords = Array.from(keywordsNumbersMap.keys())

            for (const keyword of keywords) {
                try {
                    const nums = keywordsNumbersMap.get(keyword)
                    allNumbersAfter = [...nums, ...allNumbersAfter]
                } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///03///${e.toString()}`); }
            }

            allNumbersAfter = [...new Set(allNumbersAfter)]
        } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///05///${e.toString()}`); }
    }

    console.log(`allNumbersAfter: ${allNumbersAfter.length}`)

    const db: FirebaseFirestore.Firestore = admin.firestore()

    const addedInSummary: string[] = findAdded(allNumbersBefore, allNumbersAfter)
    if (addedInSummary.length == 0) {
        console.log(`none add in trigger doc so returning`)
        return;
    }
    console.log(`addedInSummary: ${addedInSummary.length}`)


    // fetch available names
    try {
        const numbersNamesCollecQ = await db.collection('numbersNames').limit(11).get()
        console.log(`numbersNamesCollecQ: ${numbersNamesCollecQ.docs.length}`)

        let allNumbersAlreadyInDb: any[] = []

        for (const doc of numbersNamesCollecQ.docs) {
            try {
                const numbersNames = doc.data().numbersNames
                const numbersNamesMap: Map<string, any> = new Map(Object.entries(numbersNames));

                const nums = Array.from(numbersNamesMap.keys())
                allNumbersAlreadyInDb = [...nums, ...allNumbersAlreadyInDb]

            } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///01///${e.toString()}`); }
        }

        allNumbersAlreadyInDb = [... new Set(allNumbersAlreadyInDb)]
        console.log(`allNumbersAlreadyInDb: ${allNumbersAlreadyInDb.length}`)

        // find new names in summary which are absent in numbersNames
        const missingInNumbersNames: string[] = findAdded(allNumbersAlreadyInDb, addedInSummary)

        if (missingInNumbersNames.length == 0) {
            console.log('missingInNumbersNames zero so returning')
            return;
        }
        console.log(`missingInNumbersNames: ${missingInNumbersNames.length}`)

        for (const num of missingInNumbersNames) {
            const q = await db.collection('testCollectionUsers').where('ownNumber', '==', num).get()
            if (q.docs.length == 1) {
                try {
                    const name = q.docs[0].data().name ?? ''
                    console.log(`Name: ${name} for number ${num}`)
                    const lastDigit: string = num.substring(num.length - 1);

                    const docName = `ending_${lastDigit}`
                    const pathStr = `numbersNames.${num}`
                    // const docHere = await db.collection('numbersNames').doc(docName).get()

                    // if (docHere.exists)
                    await db.collection('numbersNames').doc(docName).update({ [pathStr]: name });
                    // else
                    // await db.collection('numbersNames').doc(docName).set({ [pathStr]: name });
                } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///05///${e.toString()}`); }
            } else {
                console.log(`Did not find 1 user document for ${num}`)
            }
        }
    } catch (e) { if (e instanceof Error) console.log(`update_numbers_names_for_keyword_wise_export///05///${e.toString()}`); }
    return;
});