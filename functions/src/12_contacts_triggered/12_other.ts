import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import {
    arraysAreSame,
    findAdded,
    findRemoved,
    incrementReadWriteCounts, incrementReadWriteNSelfV2, logError,
    log_u3, removeFromArray, removeRandomCharactersFromNumber,
    u2_internal_v2,
} from "..";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';

// export const user_info_brokers_export = functions.region('asia-south1').runWith({ maxInstances: 2, timeoutSeconds: 540 }).firestore.document(`${usersCollectionString}/{uId}/userInfo/contacts`).onUpdate(async (change, context) => {
    // try {
    //     let writesCounter: number = 0;
    //     let readsCounter: number = 0;
    //     let deletesCounter: number = 0;

    //     // console.log(`started for ${context.params.uId}`)
    //     if (!change.after.exists) return
    //     const doc = change.after.data()
    //     if (doc == undefined) return

    //     const networkDeletedAt = doc.networkDeletedAt
    //     if (networkDeletedAt != null && networkDeletedAt != undefined && (Date.now() - networkDeletedAt) < 2 * 3600 * 1000) {
    //         // do nothing
    //         return;
    //     }

    //     const contactsMap = doc.contactsMap
    //     if (contactsMap == null || contactsMap == undefined) return
    //     const contactsMapObject: Map<string, any> = new Map(Object.entries(contactsMap));
    //     let contactsArrayFresh = Array.from(contactsMapObject.keys())
    //     contactsArrayFresh = [...new Set(contactsArrayFresh)]

    //     let beforeContactsArrayFresh: string[] = []

    //     const beforeDoc = change.before.data()
    //     if (beforeDoc != null && beforeDoc != undefined) {
    //         const beforeContactsMap = beforeDoc.contactsMap
    //         if (beforeContactsMap != null && beforeContactsMap != undefined) {
    //             const beforeContactsMapObject: Map<string, any> = new Map(Object.entries(beforeContactsMap));
    //             let beforeContactsArrayFresh = Array.from(beforeContactsMapObject.keys())
    //             beforeContactsArrayFresh = [...new Set(beforeContactsArrayFresh)]
    //         }
    //     }

    //     if (arraysAreSame(contactsArrayFresh, beforeContactsArrayFresh) || (contactsArrayFresh.length - beforeContactsArrayFresh.length) < 200) {
    //         await incrementReadWriteCounts('user_info_brokers', readsCounter, writesCounter, deletesCounter)
    //         return;
    //     }

    //     const db: FirebaseFirestore.Firestore = admin.firestore()

    //     const brokersQ = await db.collection('brokers').get()
    //     readsCounter += brokersQ.docs.length
    //     let brokersFromDb: string[] = []
    //     try {
    //         for (const brokerDoc of brokersQ.docs) {
    //             if (brokerDoc.data() != undefined && brokerDoc.data().brokers != null && brokerDoc.data().brokers != undefined && brokerDoc.data().brokers.length > 0)
    //                 for (const br of brokerDoc.data().brokers)
    //                     brokersFromDb.push(br)
    //         }
    //     } catch (e) { if (e instanceof Error) await logError(`user_info_brokers///02///${e.toString()}`); }

    //     let brokersInContacts: string[] = []

    //     let countNewBrokersFound: number = 0
    //     try {
    //         for (const c of contactsArrayFresh) {
    //             if (c != null && c != undefined && c.length > 8 && !brokersFromDb.includes(c)) {
    //                 const name = contactsMapObject.get(c)
    //                 if (name != null && name != undefined && (name.toLowerCase().includes('broker') || name.includes('ब्रोकर') || name.toLowerCase().includes('dalal') || name.includes('दलाल'))) {
    //                     const lastTwoDigits = c.substring(c.length - 2)
    //                     await db.collection('brokers').doc(lastTwoDigits).update({ 'brokers': admin.firestore.FieldValue.arrayUnion(c) })
    //                     writesCounter++
    //                     countNewBrokersFound++
    //                     brokersInContacts.push(c)
    //                 }
    //             }
    //         }
    //     } catch (e) {
    //         if (e instanceof Error)
    //             if (!e.toString().includes('No document to update')) await logError(`user_info_brokers///04///${e.toString()}`);
    //     }

    //     try {
    //         for (const c of contactsArrayFresh)
    //             if (brokersFromDb.includes(c)) brokersInContacts.push(c)
    //     } catch (e) { if (e instanceof Error) await logError(`user_info_brokers///03///${e.toString()}`); }

    //     try {
    //         brokersInContacts = [...new Set(brokersInContacts)]
    //         const path = `notIndexedUserInfo.brokers`
    //         try {
    //             await db.collection(usersCollectionString).doc(context.params.uId).collection('userInfo').doc('userInfo').update({ [path]: brokersInContacts })
    //             writesCounter++
    //         } catch (e) {
    //             if (e instanceof Error)
    //                 if (e.toString().includes('No document to update')) {
    //                     await db.collection(usersCollectionString).doc(context.params.uId).collection('userInfo').doc('userInfo').set({ [path]: brokersInContacts })
    //                     writesCounter++
    //                 }
    //                 else {
    //                     await logError(`user_info_brokers///08b///${e.toString()}`);
    //                 }
    //         }
    //     } catch (e) { if (e instanceof Error) await logError(`user_info_brokers///08///${e.toString()}`); }

    //     console.log(`ending for ${context.params.uId}; brokersQ: ${brokersQ.docs.length} docs, brokersArray: ${brokersFromDb.length}, brokersInContacts: ${brokersInContacts.length}, countNewBrokersFound: ${countNewBrokersFound}`)
    //     await incrementReadWriteCounts('user_info_brokers', readsCounter, writesCounter, deletesCounter)
    // } catch (e) { if (e instanceof Error) await logError(`user_info_brokers///01///${e.toString()}`); }

    // return
// });

export const user_info_contacts_export = functions.region('asia-south1').runWith({ maxInstances: 40, timeoutSeconds: 540 }).firestore.document(`${usersCollectionString}/{uId}/userInfo/contacts`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    if (!change.after.exists) return
    const doc = change.after.data()
    if (doc == undefined) return
    const contactsMap = doc.contactsMap
    if (contactsMap == null || contactsMap == undefined) { console.log('contactsMap null/undefined'); return; }

    try {
        const db: FirebaseFirestore.Firestore = admin.firestore()
        const usersCollec = db.collection(usersCollectionString)
        const contactsMapObject: Map<string, any> = new Map(Object.entries(contactsMap));
        let contactsArrayFresh = Array.from(contactsMapObject.keys())
        contactsArrayFresh = [...new Set(contactsArrayFresh)]

        try {
            if (contactsArrayFresh.length > 5) {
                await usersCollec.doc(context.params.uId).update({ 'contactsArrayFresh': contactsArrayFresh })
                writesCounter++
            }
            await change.after.ref.update({ 'contactsArrayFresh': contactsArrayFresh })
            writesCounter++
        } catch (e) {
            if (e instanceof Error)
                if (e.toString().includes('too many index entries for entity')) {
                    if (contactsArrayFresh.length > 8000) {
                        let contactsLimited = []
                        for (let i = 0; i < 7999; i++) contactsLimited.push(contactsArrayFresh[i])

                        await usersCollec.doc(context.params.uId).update({ 'contactsArrayFresh': contactsLimited })
                        writesCounter++
                        await change.after.ref.update({ 'contactsArrayFresh': contactsLimited })
                        writesCounter++
                    }
                } else {
                    await logError(`user_info_contacts_to_user///01///userId: contacts len: ${contactsArrayFresh.length} ${context.params.uId} - ${e.toString()}`);
                }
        }

        try {
            // let contactsBefore: string[] = []
            // const beforeDoc = change.before.data()
            // if (beforeDoc != undefined) {
            //     const contactsMapOld = beforeDoc.contactsMap
            //     if (contactsMapOld != null && contactsMapOld != undefined) {
            //         const contactsMapOldObject: Map<string, any> = new Map(Object.entries(contactsMapOld));
            //         let contactsBefore = Array.from(contactsMapOldObject.keys())
            //         contactsBefore = [...new Set(contactsBefore)]
            //     }
            // }

            // const newlyAddedContacts = findAdded(contactsBefore, contactsArrayFresh)

            // if (newlyAddedContacts.length == 0) return;

            // let ownNumber = doc.ownNumber
            // if (ownNumber == undefined || ownNumber == '') {
            //     const uMainDoc = await db.collection(usersCollectionString).doc(context.params.uId).get()
            //     readsCounter++
            //     if (uMainDoc != undefined && uMainDoc != null && uMainDoc.data() != undefined && uMainDoc.data()!.ownNumber != undefined && uMainDoc.data()!.ownNumber != null) {
            //         ownNumber = uMainDoc.data()!.ownNumber
            //     }
            // }

            // if (ownNumber == undefined || ownNumber == '' || ownNumber == null) return;

            // const now = Date.now()

            // for (const n of newlyAddedContacts) {
            //     try {
            //         const name = contactsMapObject.get(n)

            //         const docInAllContactsV2 = await db.collection('allContactsV2').doc(n).get()
            //         readsCounter++

            //         if (!docInAllContactsV2.exists && docInAllContactsV2.data() == undefined) {
            //             // await db.collection('allContactsV2').doc(n).set({
            //             //     notIndexed: {
            //             //         contactNames: { [ownNumber]: name },
            //             //         createdAt: now,
            //             //     },
            //             //     fresh: true,
            //             //     count: 1,
            //             //     lastUpdated: now,
            //             // })
            //         } else {
            //             const dataV2 = docInAllContactsV2.data()!
            //             let alreadyExists: boolean = false
            //             if (dataV2.notIndexed != null && dataV2.notIndexed != undefined) {
            //                 const notIndexedObj = new Map(Object.entries(dataV2.notIndexed!));
            //                 const contactNamesMap = notIndexedObj.get('contactNames')

            //                 try {
            //                     if (contactNamesMap != null && contactNamesMap != undefined) {
            //                         const cMapAsString = (contactNamesMap instanceof Map).toString()

            //                         alreadyExists = cMapAsString != null && cMapAsString != undefined && cMapAsString.includes(n)

            //                         // let contactsMap: Map<string, any> = new Map();
            //                         // let contactNamesMapObj: Map<string, string> = new Map();
            //                         // contactNamesMapObj = new Map(Object.entries(contactNamesMap!));

            //                         // alreadyExists = contactNamesMapObj.get(n) != null && contactNamesMapObj.get(n) != undefined

            //                         // const nameIfExists = (new Map(contactNamesMap as any)).get(n)
            //                         // if (nameIfExists != null && nameIfExists != undefined) alreadyExists = true

            //                         // const contactNamesMapObj = new Map(Object.entries(contactNamesMap!));
            //                         // if (contactNamesMapObj != null && contactNamesMapObj != undefined) {
            //                         //     alreadyExists = contactNamesMapObj.get(n) != null && contactNamesMapObj.get(n) != undefined
            //                         // }
            //                     }
            //                 } catch (e) {
            //                     await logError(`user_info_contacts_to_user///15b///${e.toString()}`);
            //                     alreadyExists = true
            //                 }

            //             }

            //             if (!alreadyExists) {
            //                 const pathForName = `notIndexed.contactNames.${ownNumber}`
            //                 let pathForLastUpdated = `notIndexed.lastUpdated`

            //                 if (pathForName != 'x' || pathForLastUpdated != 'x') { }

            //                 await db.collection('allContactsV2').doc(n).update({
            //                     [pathForName]: name,
            //                     // [pathForLastUpdated]: now,
            //                     // count: admin.firestore.FieldValue.increment(1),
            //                     lastUpdated: now,
            //                 })
            //                 writesCounter++
            //             }
            //         }
            //     } catch (e) { await logError(`user_info_contacts_to_user///55///${e.toString()}`); }
            // }
        } catch (e) { if (e instanceof Error) await logError(`user_info_contacts_to_user///08///${e.toString()}`); }

        try {
            await incrementReadWriteCounts('user_info_contacts', readsCounter, writesCounter, deletesCounter)
        } catch (e) { if (e instanceof Error) await logError(`user_info_contacts_to_user///02a///${e.toString()}`); }

    } catch (e) { if (e instanceof Error) await logError(`user_info_contacts_to_user///02b//Path: ${change.after.ref.path} - Error: ${e.toString()}`); }
    return
})









export const u2_mutuals_establish_for_0_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('0', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_1_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('1', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_2_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('2', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_3_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('3', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_4_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('4', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_5_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('5', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_6_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('6', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_7_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('7', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_8_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('8', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_9_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('9', event.data?.before.data(), event.data?.after.data()); return; });
export const u2_mutuals_establish_for_other_gen2_export = onDocumentWritten(`mutualsEstablishFor/{userNumber}`, async (event) => { await u2_mutuals_establish_supporting('', event.data?.before.data(), event.data?.after.data()); return; });


export const u2_mutuals_establish_supporting = async (
    endingDigit: string,
    muDocDataBefore: FirebaseFirestore.DocumentData | undefined,
    muDocData: FirebaseFirestore.DocumentData | undefined,
) => {
    console.log('01')

    if(muDocDataBefore != undefined && muDocDataBefore.status == 'to make') return

    if (muDocData == null || muDocData == undefined || muDocData.status != 'to make') return

    console.log('02')

    const ownNumber = muDocData.ownNumber
    if (ownNumber == null || ownNumber == undefined) return

    console.log('03')

    const q = await admin.firestore().collection(usersCollectionString).where('ownNumber', '==', ownNumber).get()
    if (q.docs.length != 1) return

    console.log('04')

    const parentId = q.docs[0].id

    console.log(`05 ${parentId}`)

    const contactsDoc = await q.docs[0].ref.collection('userInfo').doc('contacts').get()
    if (contactsDoc == null || contactsDoc == undefined) return

    console.log(`06`)

    await u2_internal_v2(endingDigit, undefined, contactsDoc.data(), parentId)
    return
}








export const u2_0_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('0', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_1_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('1', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_2_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('2', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_3_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('3', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_4_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('4', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_5_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('5', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_6_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('6', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_7_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('7', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_8_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('8', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_9_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('9', event.data.before.data(), event.data.after.data(), parentId)
    return
});

export const u2_other_gen2_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('', event.data.before.data(), event.data.after.data(), parentId,// event.id,
    )
    return
});






// FOR SMALLER RELEVANT CONTACTS ARRAY:
/*
export const u2_0_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('0', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_1_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('1', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_2_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('2', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_3_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('3', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_4_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('4', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_5_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('5', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_6_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('6', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_7_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('7', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_8_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('8', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_9_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('9', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});

export const u2_other_gen2_small_export = onDocumentWritten(`${usersCollectionString}/{uId}/userInfo/contacts`, async (event) => {
    if (event == undefined || event.data == undefined || !event!.data.after.exists) return
    const parentId = event.data.after.ref.parent.parent?.id
    await u2_internal_v2('', event.data.before.data(), event.data.after.data(), parentId, event.id, false)
    return
});*/

// export const u2_myDocsThenOldContactsV3_ending0_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
//     if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
//     const parentId = change.after.ref.parent.parent?.id

//     if (parentId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2' || context.params.trigId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2') {
//         const afterData = change.after.data()
//         const beforeData = change.before.data()

//         if (beforeData == null || beforeData == undefined) {
//             await logToU2_internal(`${context.eventId} - before doc NA`)
//         } else if (afterData != undefined && afterData != null) {
//             if (afterData.trigger != beforeData.trigger) {
//                 await logToU2_internal(`${context.eventId} - trigger field different ${beforeData.trigger}, ${afterData.trigger}`)
//             } else if (afterData.token != beforeData.token) {
//                 await logToU2_internal(`${context.eventId} - token field different ${beforeData.token}, ${afterData.token}`)
//             } else if (afterData.test != beforeData.test) {
//                 await logToU2_internal(`${context.eventId} - test field different ${beforeData.test}, ${afterData.test}`)
//             } else if (afterData.networkDeletedAt != beforeData.networkDeletedAt) {
//                 await logToU2_internal(`${context.eventId} - networkDeletedAt field different ${beforeData.networkDeletedAt}, ${afterData.networkDeletedAt}`)
//             } else {
//                 let freshBeforeFromMap: string[] = []
//                 let freshAfterFromMap: string[] = []

//                 if (beforeData.contactsMap != null && beforeData.contactsMap != undefined) {
//                     const contactsMapObject: Map<string, any> = new Map(Object.entries(beforeData.contactsMap));
//                     freshBeforeFromMap = Array.from(contactsMapObject.keys())
//                     freshBeforeFromMap = [...new Set(freshBeforeFromMap)]
//                 }

//                 if (afterData.contactsMap != null && afterData.contactsMap != undefined) {
//                     const contactsMapObject: Map<string, any> = new Map(Object.entries(afterData.contactsMap));
//                     freshAfterFromMap = Array.from(contactsMapObject.keys())
//                     freshAfterFromMap = [...new Set(freshAfterFromMap)]
//                 }

//                 if (!arraysAreSame(freshBeforeFromMap, freshAfterFromMap)) {
//                     await logToU2_internal(`${context.eventId} - contacts map field different ${freshBeforeFromMap.length}, ${freshAfterFromMap.length}`)
//                 } else {
//                     let freshBeforeFromArr: string[] = []
//                     let freshAfterFromArr: string[] = []

//                     if (beforeData.contactsArrayFresh != null && beforeData.contactsArrayFresh != undefined) {
//                         freshBeforeFromArr = beforeData.contactsArrayFresh
//                     }

//                     if (afterData.contactsArrayFresh != null && afterData.contactsArrayFresh != undefined) {
//                         freshAfterFromArr = afterData.contactsArrayFresh
//                     }

//                     if (!arraysAreSame(freshBeforeFromArr, freshAfterFromArr)) {
//                         await logToU2_internal(`${context.eventId} - contacts array field different ${freshBeforeFromArr.length}, ${freshAfterFromArr.length}`)
//                     } else {
//                         let companyIdArrayBefore: string[] = []
//                         let companyIdArrayAfter: string[] = []

//                         if (beforeData.companyIdArray != null && beforeData.companyIdArray != undefined) {
//                             companyIdArrayBefore = beforeData.companyIdArray
//                         }

//                         if (afterData.companyIdArray != null && afterData.companyIdArray != undefined) {
//                             companyIdArrayAfter = afterData.companyIdArray
//                         }

//                         if (!arraysAreSame(companyIdArrayBefore, companyIdArrayAfter)) {
//                             await logToU2_internal(`${context.eventId} - companyIdArray field different ${companyIdArrayBefore.length}, ${companyIdArrayAfter.length}`)
//                         } else {
//                             await logToU2_internal(`${context.eventId} - no idea what is different`)
//                         }
//                     }
//                 }
//             }
//         }
//     } else {
//         // await logToU2_internal(`Not for 997017`)
//     }

//     await u2_internal('0', change.before.data(), change.after.data(), parentId, context.eventId)
//     return
// });

/*
export const u2_myDocsThenOldContactsV3_ending1_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('1', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending2_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('2', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending3_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    if (parentId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2' || context.params.trigId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2') {
        await logToU2_internal(`Ending3 started for 997017 - eventId: ${context.eventId}`)
    }
    await u2_internal('3', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending4_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('4', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending5_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('5', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending6_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('6', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending7_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    if (parentId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2' || context.params.trigId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2') {
        await logToU2_internal(`Ending7 started for 997017 - eventId: ${context.eventId}`)
    }
    await u2_internal('7', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending8_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('8', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_ending9_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('9', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});

export const u2_myDocsThenOldContactsV3_endingOther_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    if (!change.after.exists) { console.log(`after does not exist so returning`); return; }
    // const userDoc = await change.after.ref.parent.parent?.get();
    const parentId = change.after.ref.parent.parent?.id
    await u2_internal('', change.before.data(), change.after.data(), parentId, context.eventId)
    return
});
*/


export const u3_otherDocsV2_export = functions.region('asia-south1').runWith({
    maxInstances: 30,  // uncomment this
    // maxInstances: 2,
    timeoutSeconds: 540,
    memory: '8GB'
}).firestore.document(`${usersCollectionString}/{trigId}/userInfo/contacts`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    if (!change.after.exists) { console.log(`01 returning`); return; }
    const cAfter = change.after.data();
    if (cAfter == undefined || cAfter == null) { return; }
    const uDoc = await change.after.ref.parent.parent?.get()
    readsCounter++



    if (uDoc == undefined) { console.log(`03 returning`); await logError(`u3_otherDocsV2///01///parent data NA for ${change.after.ref.id}`); return; }
    const u = uDoc.data(); if (u == undefined) { console.log(`04 returning`); return; }

    let uCreatedAtStr: string = ''
    if (true) {
        if (u.createdAt != null && u.createdAt != undefined) {
            var d = new Date();
            uCreatedAtStr = `${d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}`
        }
    }

    const myOwnNumber = u.ownNumber; if (myOwnNumber == undefined || myOwnNumber == '' || myOwnNumber == null) { console.log(`05 returning`); return; }
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const usersCollec = db.collection(usersCollectionString)
    const companiesCollec = db.collection(companiesCollectionStringV2)  // uncomment this

    if (u.networkDeletedAt != null &&
        u.networkDeletedAt != undefined &&
        u.contactsArrayOld != null &&
        u.contactsArrayOld != undefined &&
        u.contactsArrayOld.length == 0 &&
        u.lastHomeLoad != null &&
        u.lastHomeLoad != undefined &&
        (Date.now() - u.lastHomeLoad) > 5 * 24 * 3600 * 1000
    ) {
        await db.collection('zLogs').doc('testing').update({ 'usage_nSelfV2 - a3': admin.firestore.FieldValue.arrayUnion(`MyOwnN: ${myOwnNumber}; ENDING, myNetworkDeletedAt: ${u.networkDeletedAt}`) })
        // do nothing
        return;
    } else {
        await db.collection('zLogs').doc('testing').update({ 'usage_nSelfV2 - a3': admin.firestore.FieldValue.arrayUnion(`Continuing`) })
    }

    if (Date.now() < 1690216171717) {
        const afterData = change.after.data()
        const beforeData = change.before.data()

        if (beforeData == null || beforeData == undefined) {
            await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - before doc NA (${myOwnNumber})`)
        } else if (afterData != undefined && afterData != null) {
            if (afterData.trigger != beforeData.trigger) {
                await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - trigger field different ${beforeData.trigger}, ${afterData.trigger} (${myOwnNumber})`)
            } else if (afterData.token != beforeData.token) {
                await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - token field different ${beforeData.token}, ${afterData.token} (${myOwnNumber})`)
            } else if (afterData.test != beforeData.test) {
                await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - test field different ${beforeData.test}, ${afterData.test} (${myOwnNumber})`)
            } else if (afterData.networkDeletedAt != beforeData.networkDeletedAt) {
                await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - networkDeletedAt field different ${beforeData.networkDeletedAt}, ${afterData.networkDeletedAt} (${myOwnNumber})`)
            } else {
                let freshBeforeFromMap: string[] = []
                let freshAfterFromMap: string[] = []

                if (beforeData.contactsMap != null && beforeData.contactsMap != undefined) {
                    const contactsMapObject: Map<string, any> = new Map(Object.entries(beforeData.contactsMap));
                    freshBeforeFromMap = Array.from(contactsMapObject.keys())
                    freshBeforeFromMap = [...new Set(freshBeforeFromMap)]
                }

                if (afterData.contactsMap != null && afterData.contactsMap != undefined) {
                    const contactsMapObject: Map<string, any> = new Map(Object.entries(afterData.contactsMap));
                    freshAfterFromMap = Array.from(contactsMapObject.keys())
                    freshAfterFromMap = [...new Set(freshAfterFromMap)]
                }

                if (!arraysAreSame(freshBeforeFromMap, freshAfterFromMap)) {
                    await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - contacts map field different ${freshBeforeFromMap.length}, ${freshAfterFromMap.length}, created ${uCreatedAtStr} (${myOwnNumber})`)
                    await incrementReadWriteNSelfV2(`a2-newly added contacts`, freshAfterFromMap.length - freshBeforeFromMap.length, undefined)

                } else {

                    let companyIdArrayBefore: string[] = []
                    let companyIdArrayAfter: string[] = []

                    if (beforeData.companyIdArray != null && beforeData.companyIdArray != undefined) {
                        companyIdArrayBefore = beforeData.companyIdArray
                    }

                    if (afterData.companyIdArray != null && afterData.companyIdArray != undefined) {
                        companyIdArrayAfter = afterData.companyIdArray
                    }

                    if (!arraysAreSame(companyIdArrayBefore, companyIdArrayAfter)) {
                        await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - companyIdArray field different ${companyIdArrayBefore.length}, ${companyIdArrayAfter.length} (${myOwnNumber})`)
                    } else {

                        let freshBeforeFromArr: string[] = []
                        let freshAfterFromArr: string[] = []

                        if (beforeData.contactsArrayFresh != null && beforeData.contactsArrayFresh != undefined) {
                            freshBeforeFromArr = beforeData.contactsArrayFresh
                        }

                        if (afterData.contactsArrayFresh != null && afterData.contactsArrayFresh != undefined) {
                            freshAfterFromArr = afterData.contactsArrayFresh
                        }

                        if (!arraysAreSame(freshBeforeFromArr, freshAfterFromArr)) {
                            await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - contacts array field different ${freshBeforeFromArr.length}, ${freshAfterFromArr.length} (${myOwnNumber}) so RETURNING`)
                            return;
                        } else {
                            await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - UNKNOWN TRIGGER`)
                        }
                    }
                }
            }
        }
    }


    let companiesMapFieldMap: Map<string, any> = new Map();
    let contactsMap: Map<string, any> = new Map();
    let companyIdArray: string[] = []
    let fresh: string[] = []
    let popularArray: string[] = [] // uncomment this

    if (u.companiesMap != null && u.companiesMap != undefined)
        companiesMapFieldMap = new Map(Object.entries(u.companiesMap));

    if (u.companyIdArray != null && u.companyIdArray != undefined)
        companyIdArray = u.companyIdArray

    try {
        const cMapTemp = cAfter.contactsMap
        if (cMapTemp != null && cMapTemp != undefined) {
            contactsMap = new Map(Object.entries(cMapTemp));
            if (contactsMap != null && contactsMap != undefined)
                fresh = Array.from(contactsMap.keys())
        }
    } catch (e) { if (e instanceof Error) await logError(`u3///51///${e.toString()}`) }

    const newAddedCIds = findAdded(Array.from(companiesMapFieldMap.keys()) || [], companyIdArray)
    console.log(`New CIds: ${newAddedCIds.toString()}`)

    // await incrementReadWriteNSelfV2('a2', undefined, undefined) // herenow

    // Create network docs for people directly knowing me
    for (const newlyAddedCid of newAddedCIds) {
        const usersKnowingMe = await usersCollec.where('contactsArrayFresh', 'array-contains', myOwnNumber).get()
        readsCounter = readsCounter + usersKnowingMe.docs.length
        // console.log(`usersKnowingMe directly for cId ${newlyAddedCid}: ${usersKnowingMe.docs.length}`)

        await incrementReadWriteNSelfV2('a2', usersKnowingMe.docs.length, undefined)
        for (const _u of usersKnowingMe.docs) {
            const userOwnNumber = _u.get('ownNumber')
            const networkDeletedAt = _u.get('networkDeletedAt')
            const contactsArrayOldOfUser = _u.get('contactsArrayOldOfUser')
            const lastHomeLoad = _u.get('lastHomeLoad')

            if (networkDeletedAt != null &&
                networkDeletedAt != undefined &&
                contactsArrayOldOfUser != null &&
                contactsArrayOldOfUser != undefined &&
                contactsArrayOldOfUser.length == 0 &&
                lastHomeLoad != null &&
                lastHomeLoad != undefined &&
                (Date.now() - lastHomeLoad) > 5 * 24 * 3600 * 1000
            ) {
                // do nothing
            } else if (userOwnNumber != null && userOwnNumber != undefined && userOwnNumber != myOwnNumber) {
                try {
                    await companiesCollec.doc(newlyAddedCid).collection('network').doc(userOwnNumber).update({
                        directLinks: admin.firestore.FieldValue.arrayUnion(myOwnNumber),
                        selfUpdatesPending: true,
                        selfUpdatesFromUser: true
                    })
                    writesCounter++
                } catch (e) {
                    if (e instanceof Error)
                        if (e.toString().includes('No document to update')) {
                            await companiesCollec.doc(newlyAddedCid).collection('network').doc(userOwnNumber).set({
                                directLinks: [myOwnNumber],
                                selfUpdatesPending: true,
                                selfUpdatesFromUser: true
                            })
                            writesCounter++
                        } else {
                            await logError(`u3///06///${e.toString()}`)
                        }
                }
            }
        }
    }

    // A2 - ADD in network docs > network field and then add those contacts in companiesMap[cId] 
    // to do - decide what docs to make and make at once
    let counterForA3: number = 0
    try {
        let selfUpdatesForSingleCompanyArray: string[] = []

        for (const cId of companyIdArray) {
            let toUploadAdd: string[] = [] // uncomment this
            const addedContactsForThisCompanyId = findAdded(companiesMapFieldMap.get(cId) || [], fresh) // to do - test if this map.get(cId) works because initialisation has changed
            console.log(`mutual yet to be created for ${addedContactsForThisCompanyId.length} of my contacts for ${cId}`)

            if (addedContactsForThisCompanyId.length > 0) selfUpdatesForSingleCompanyArray.push(cId)

            for (const addedNumX of addedContactsForThisCompanyId) {

                const usersKnowingAddedNumQ = await usersCollec.where('contactsArrayFresh', 'array-contains', addedNumX).get()
                // if (usersKnowingAddedNumQ.docs.length > 5) {
                //     await db.collection('zLogs').doc('testing').update({ 'usage_nSelfV2 - a3': admin.firestore.FieldValue.arrayUnion(`MyOwnN: ${myOwnNumber}, my companyId ${cId} > ${addedContactsForThisCompanyId.length} contacts added in map > ${usersKnowingAddedNumQ.docs.length} users know this added ${addedNumX}`) })
                // }

                await incrementReadWriteNSelfV2('a3b', usersKnowingAddedNumQ.docs.length, undefined)
                // await incrementReadWriteNSelfV2(`a3b run counts.${context.eventId}`, 1, undefined)

                // if (Date.now() < 1690439400000) {
                // await incrementReadWriteNSelfV2(`a3b details`, undefined, `${context.params.trigId}, ${addedNumX}, (${myOwnNumber}), ${companyIdArray.length}, ${addedContactsForThisCompanyId.length}, ${usersKnowingAddedNumQ.docs.length}, ${Date.now()}`)
                // }

                // if (usersKnowingAddedNumQ.docs.length > 100) {
                // } else {
                // await incrementReadWriteNSelfV2(`a3bc.${context.params.trigId} ${addedNumX} (${myOwnNumber})`, usersKnowingAddedNumQ.docs.length, undefined)
                // }
                // await incrementReadWriteNSelfV2('a2', undefined, `${context.eventId} - a3b: ${usersKnowingAddedNumQ.docs.length} (${myOwnNumber})`)
                counterForA3 = counterForA3 + usersKnowingAddedNumQ.docs.length
                readsCounter += usersKnowingAddedNumQ.docs.length
                // add in popularContacts
                try {
                    if (usersKnowingAddedNumQ.docs.length > 200) {
                        if (popularArray.length == 0) {
                            const popularDoc = await db.collection('random').doc('popular').get()
                            readsCounter++
                            if (popularDoc != undefined && popularDoc.data() != undefined && popularDoc.data() != null && popularDoc.data()!.popular != undefined && popularDoc.data()!.popular != null) {
                                let popularMap: Map<string, any> = new Map(Object.entries(popularDoc.data()!.popular));
                                popularArray = Array.from(popularMap.keys())
                            }
                        }

                        if (popularArray.includes(removeRandomCharactersFromNumber(addedNumX))) {
                            // do nothing
                        } else {
                            const nameTemp = contactsMap.get(addedNumX)
                            const pathStr: string = `popular.${removeRandomCharactersFromNumber(addedNumX)}`
                            const v: string = `${usersKnowingAddedNumQ.docs.length}_${nameTemp}`
                            await db.collection('random').doc('popular').update({ [pathStr]: [v] })
                            writesCounter++
                        }
                    }
                } catch (e) { if (e instanceof Error) await logError(`u3///52///${e.toString()}`) }

                for (const _u of usersKnowingAddedNumQ.docs) {
                    if (_u.get('ownNumber') != null && _u.get('ownNumber') != undefined && _u.get('ownNumber') != myOwnNumber && _u.get('ownNumber') != '') {
                        const networkDeletedAt = _u.get('networkDeletedAt')
                        const contactsArrayOldOfUser = _u.get('contactsArrayOldOfUser')
                        const lastHomeLoad = _u.get('lastHomeLoad')

                        if (networkDeletedAt != null &&
                            networkDeletedAt != undefined &&
                            contactsArrayOldOfUser != null &&
                            contactsArrayOldOfUser != undefined &&
                            contactsArrayOldOfUser.length == 0 &&
                            lastHomeLoad != null &&
                            lastHomeLoad != undefined &&
                            (Date.now() - lastHomeLoad) > 5 * 24 * 3600 * 1000
                        ) {
                            // do nothing
                        } else {
                            try {
                                try {
                                    let tempAdded: string = removeRandomCharactersFromNumber(addedNumX)
                                    const path = `networkLinks.${tempAdded}`
                                    await companiesCollec.doc(cId).collection('network').doc(_u.get('ownNumber')).update({
                                        [path]: admin.firestore.FieldValue.arrayUnion(myOwnNumber),
                                        // selfUpdatesForSingleCompany: true,
                                        selfUpdatesPending: true,
                                        // selfUpdatesFromUser: true,
                                    })
                                    writesCounter++
                                } catch (e) {
                                    if (e instanceof Error)
                                        if (e.toString().includes('No document to update')) {
                                            await companiesCollec.doc(cId).collection('network').doc(_u.get('ownNumber')).set({
                                                networkLinks: { [addedNumX]: [myOwnNumber] },
                                                // selfUpdatesForSingleCompany: true,
                                                selfUpdatesPending: true,
                                                // selfUpdatesFromUser: true,
                                            })
                                            writesCounter++
                                        } else {
                                            await logError(`u3///12d///${e.toString()}`)
                                        }
                                }
                            } catch (e2) { if (e2 instanceof Error) await logError(`u3///12g///${e2.toString()}`) }
                        }
                    }
                }
                toUploadAdd.push(addedNumX)
                // uncomment this
            }

            if (toUploadAdd.length > 0) {
                try {
                    console.log(`uploadingv2 ${toUploadAdd.length} contacts for ${cId} to companies map`)
                    const str: string = `companiesMap.${cId}`
                    await uDoc.ref.update({ [str]: admin.firestore.FieldValue.arrayUnion(...toUploadAdd) })
                    writesCounter++
                } catch (error) { if (error instanceof Error) await logError(`u3///13///${error.toString()}`) }
            } // uncomment this
        }

        try {
            if (selfUpdatesForSingleCompanyArray != null && selfUpdatesForSingleCompanyArray != undefined && selfUpdatesForSingleCompanyArray.length > 0)
                await db.collection('random').doc('selfUpdatesForSingleCompany').update({ 'companyIds': admin.firestore.FieldValue.arrayUnion(...selfUpdatesForSingleCompanyArray) })
        } catch (error) { if (error instanceof Error) await logError(`u3///85b///${error.toString()}`) }
        // uncomment this
    } catch (error) { if (error instanceof Error) await logError(`u3///14b///${error.toString()}`) }

    // if (counterForA3 > 100)
    //     await incrementReadWriteNSelfV2(`a2c.${context.eventId}`, undefined, `${counterForA3} (${myOwnNumber})`)











































    // R1 - REMOVE me from network docs of others in my companies
    try {
        for (const cId of companiesMapFieldMap.keys()) {
            let toUploadRemove: string[] = []
            let removedContactsForThisCompanyId: string[] = []
            if (companyIdArray.includes(cId)) {
                removedContactsForThisCompanyId = findRemoved(companiesMapFieldMap.get(cId) || [], fresh)
                console.log(`REMOVAL 1; cId: ${cId}, removed length ${removedContactsForThisCompanyId.length}`)
                for (const removedNum of removedContactsForThisCompanyId) {
                    const networkDocsFromWhichToRemoveRemovedNum = await companiesCollec.doc(cId).collection('network').where('networkKeys', 'array-contains', removedNum).get()

                    await incrementReadWriteNSelfV2('a4', networkDocsFromWhichToRemoveRemovedNum.docs.length, undefined)

                    readsCounter += networkDocsFromWhichToRemoveRemovedNum.docs.length
                    for (const networkDoc of networkDocsFromWhichToRemoveRemovedNum.docs) {
                        try {
                            let removedNumFixed = removeRandomCharactersFromNumber(removedNum)
                            let str = `networkLinks.${removedNumFixed}`
                            await networkDoc.ref.update({
                                [str]: admin.firestore.FieldValue.arrayRemove(myOwnNumber),
                                selfUpdatesPending: true,
                                selfUpdatesFromUser: true
                            })
                            writesCounter++
                        } catch (error) {
                            if (error instanceof Error)
                                if (!error.toString().startsWith('Error: 5 NOT_FOUND:')) {
                                    await logError(`u3///16///${error.toString()}`)
                                }
                        }
                    }
                    toUploadRemove.push(removedNum)
                }
            } else {
                console.log(`REMOVAL 2; cId: ${cId}, removed length ${removedContactsForThisCompanyId.length}`)

                try {
                    removedContactsForThisCompanyId = companiesMapFieldMap.get(cId)
                    const networkDocsFromWhichToRemoveRemovedNum = await companiesCollec.doc(cId).collection('network').where('networkValues', 'array-contains', myOwnNumber).get()
                    readsCounter += networkDocsFromWhichToRemoveRemovedNum.docs.length
                    await incrementReadWriteNSelfV2('a5', networkDocsFromWhichToRemoveRemovedNum.docs.length, undefined)

                    for (const networkDoc of networkDocsFromWhichToRemoveRemovedNum.docs) {
                        const networkValues: string[] = networkDoc.get('networkValues')
                        const direct = networkDoc.get('directLinks')
                        try {
                            if (networkValues.length == 1 && (direct == undefined || direct == null)) {
                                await networkDoc.ref.delete()
                                deletesCounter++
                            } else {
                                const networkLConst = networkDoc.get('networkLinks')
                                if (networkLConst) {
                                    let networkLMap: Map<string, string[]> = new Map(Object.entries(networkLConst))

                                    // non fieldvalue update
                                    networkLMap.forEach((value: string[], key: string) => {
                                        if (networkLMap.get(key) != null && networkLMap.get(key) != undefined) {
                                            let valuesAfterRemoving: string[] = networkLMap.get(key)!;
                                            valuesAfterRemoving = removeFromArray(valuesAfterRemoving, myOwnNumber)
                                            networkLMap.set(key, valuesAfterRemoving)
                                        }
                                    });
                                    let networkLMapForUpload = Array.from(networkLMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                                    await networkDoc.ref.update({
                                        networkLinks: networkLMapForUpload,
                                        selfUpdatesPending: true,
                                        selfUpdatesFromUser: true
                                    })
                                    writesCounter++
                                }
                            }
                        } catch (e) {
                            if (e instanceof Error) {
                                if (!e.toString().includes('No document to update'))
                                    await logError(`u3///17d2///${e.toString()}`)
                            }
                        }
                    }
                    toUploadRemove = removedContactsForThisCompanyId
                } catch (e) { if (e instanceof Error) await logError(`u3///17e///${e.toString()}`) }
            }

            if (toUploadRemove.length > 0) {
                try {
                    console.log(`REMOVAL; cId: ${cId}, remove upload length ${toUploadRemove.length}`)
                    const str: string = `companiesMap.${cId}`
                    await uDoc.ref.update({ [str]: admin.firestore.FieldValue.arrayRemove(...toUploadRemove) })
                    writesCounter++
                } catch (error) { if (error instanceof Error) await logError(`u3///18///${error.toString()}`) }
            }
        }
    } catch (error) { if (error instanceof Error) await logError(`u3///19///${error.toString()}`) }

    // R2 - REMOVE me from directContacts in network docs for removed companies
    try {
        for (const cId of companiesMapFieldMap.keys()) {
            console.log(`Removing directs for ${cId}`)
            if (!companyIdArray.includes(cId)) {
                const networkDocsOfOthersHavingMeInDirect = await companiesCollec.doc(cId).collection('network').where('directLinks', 'array-contains', myOwnNumber).get()
                await incrementReadWriteNSelfV2('a6', networkDocsOfOthersHavingMeInDirect.docs.length, undefined)

                for (const networkDoc of networkDocsOfOthersHavingMeInDirect.docs) {
                    try {
                        await networkDoc.ref.update({
                            directLinks: admin.firestore.FieldValue.arrayRemove(myOwnNumber),
                            selfUpdatesPending: true,
                            selfUpdatesFromUser: true,
                        })
                        writesCounter++
                    } catch (error) {
                        if (error instanceof Error) await logError(`u3///22///${error.toString()}`);
                        if (error instanceof Error) await log_u3(`ERR JFOD 21: ${error.toString()}`);
                    }
                }
                try {
                    companiesMapFieldMap.delete(cId)
                    await uDoc.ref.update({ [`companiesMap.${cId}`]: admin.firestore.FieldValue.delete() })
                    writesCounter++
                } catch (error) { if (error instanceof Error) await logError(`u3///23///${error.toString()}`) }
            }
        }
    } catch (error) { if (error instanceof Error) await logError(`u3///24///${error.toString()}`) }


    await incrementReadWriteCounts('u3_otherDocsV2', readsCounter, writesCounter, deletesCounter)
    return
})