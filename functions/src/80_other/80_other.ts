import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { deleteNetworkV2Supporting, getInactiveNumbers, incrementReadWriteCounts, logError, nConnectionsForNumber, restrictedNumbersList } from "..";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

let usersCollectionString = 'testCollectionUsers';


export const deleteNetworkV2SupportingOuter = async (endingDigit: string, lst: string[], afterDoc: QueryDocumentSnapshot) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const startTime: number = Date.now()
    const timeLimitInSeconds: number = 300
    const timeLimitInMil: number = timeLimitInSeconds * 1000

    let forUploading: string[] = []
    let failures: string[] = []

    console.log(`started ${endingDigit}`)

    for (const n of lst) {
        if ((Date.now() - startTime) > timeLimitInMil) break

        const endingDigitOfNum: string = n.substring(n.length - 1)

        if (endingDigit == '0') {
            if (endingDigitOfNum == '0') {
                const success: boolean = await deleteNetworkV2Supporting(n)
                console.log(`success for ${n}: ${success}`)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '1') {
            if (endingDigitOfNum == '1') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '2') {
            if (endingDigitOfNum == '2') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '3') {
            if (endingDigitOfNum == '3') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '4') {
            if (endingDigitOfNum == '4') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '5') {
            if (endingDigitOfNum == '5') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '6') {
            if (endingDigitOfNum == '6') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '7') {
            if (endingDigitOfNum == '7') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '8') {
            if (endingDigitOfNum == '8') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        } else if (endingDigit == '9') {
            if (endingDigitOfNum == '9') {
                const success: boolean = await deleteNetworkV2Supporting(n)

                forUploading.push(n)
                if (!success) failures.push(n)
            }
        }
    }

    if (failures.length == 0 && forUploading.length == 0) {
        console.log(`Returning. Success ${forUploading.length}, failures ${failures.length}`)
        await incrementReadWriteCounts('deleteNetworkV2', readsCounter, writesCounter, deletesCounter)
        return
    }

    if (failures.length > 0 && forUploading.length > 0) {
        console.log(`Success ${forUploading.length}, failures ${failures.length} (01)`)
        await afterDoc.ref.update({ deleteNetworkUploader: admin.firestore.FieldValue.arrayRemove(...forUploading), failures: admin.firestore.FieldValue.arrayUnion(...failures) })
        writesCounter++
    } else if (forUploading.length > 0) {
        console.log(`Success ${forUploading.length}, failures ${failures.length} (02)`)
        await afterDoc.ref.update({ deleteNetworkUploader: admin.firestore.FieldValue.arrayRemove(...forUploading) })
        writesCounter++
    } else if (failures.length > 0) {
        console.log(`Success ${forUploading.length}, failures ${failures.length} (03)`)
        await afterDoc.ref.update({ failures: admin.firestore.FieldValue.arrayUnion(...failures) })
        writesCounter++
    } else {
        console.log(`Should not be here. Success ${forUploading.length}, failures ${failures.length} (01)`)
    }

    await incrementReadWriteCounts('deleteNetworkV2', readsCounter, writesCounter, deletesCounter)

}

export const deleteNetworkV2ending0_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        console.log(`started ending 0`)

        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return

        await deleteNetworkV2SupportingOuter('0', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }

    return
})

export const deleteNetworkV2ending1_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('1', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending2_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('2', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending3_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('3', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending4_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('4', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending5_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('5', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending6_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('6', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending7_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('7', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending8_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('8', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})

export const deleteNetworkV2ending9_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '4GB' }).firestore.document(`deleteNetworkUploader/deleteNetworkUploader`).onUpdate(async (change, context) => {
    try {
        const data = change.after.data()
        let lst: string[] = data.deleteNetworkUploader
        if (lst == null || lst == undefined || lst.length == 0) return
        await deleteNetworkV2SupportingOuter('9', lst, change.after);
    } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2///01///${e.toString()}`); }
    return
})



export const nConnectionsForNumberMain_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '2GB' }).firestore.document(`createConnections/{trigId}`).onCreate(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;
    const data = change.data()
    if (data == null || data.undefined) {
        console.log(`data NA so returning`)
        return
    }

    if (restrictedNumbersList.includes(context.params.trigId)) {
        await change.ref.update({ 'status': 'restricted user' })
        writesCounter++
        await incrementReadWriteCounts('nConnectionsForNumberMain', readsCounter, writesCounter, deletesCounter)

        return
    }

    await nConnectionsForNumber(context.params.trigId)

    // const numbers = data.get('numbers')
    // if (numbers == null || numbers == undefined) {
    //     console.log(`numbers NA so returning`)
    //     return
    // }

    // for (const n of numbers) {
    //     console.log(`Main - starting for ${n}`)
    //     console.log(`Main - ending for ${n}`)
    // }

    console.log(`Main - Ending`)
    await change.ref.update({ 'status': 'done' })
    writesCounter++
    await incrementReadWriteCounts('nConnectionsForNumberMain', readsCounter, writesCounter, deletesCounter)
    return
});

// MUTUALS & NOTIFICATIONS
export const mutualsUploader_export = functions.region('asia-south1').runWith({ memory: '1GB', timeoutSeconds: 300, maxInstances: 20 }).firestore.document(`mutualsUploader/{id}`).onUpdate(async (change, context) => {
    // await testingLog(`mutualsUploader 01`)

    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    if (!change.after.exists) return;

    try {
        const data = change.after.data()
        const mutualsUploaderList: Array<String> = data.mutualsUploader
        const remarks = data.remarks
        if (mutualsUploaderList == undefined || mutualsUploaderList == null || mutualsUploaderList.length == 0) return;

        let beingUploadedList: Array<String> = []
        const db: FirebaseFirestore.Firestore = admin.firestore();
        const mutualsCollec = db.collection('mutuals')

        // await testingLog(`mutualsUploader 02; mutualsUploaderList: ${mutualsUploaderList.length}`)
        if (remarks != null && remarks != undefined && remarks != '') {
            await db.collection('mutualsUploader').doc('remarksAvailable').update({ remarksAvailable: admin.firestore.FieldValue.arrayUnion(remarks) })
            writesCounter++
        }

        try {
            let counter: number = 0
            for (const n of mutualsUploaderList) {
                const checkIfDocExists = await mutualsCollec.doc(`${n}`).get()
                if (!checkIfDocExists.exists) {
                    if (remarks == null || remarks == undefined || remarks == '') {
                        await mutualsCollec.doc(`${n}`).set({ 'docCreatedAt': Date.now(), 'prepared': false, })
                        writesCounter++
                    } else {
                        await mutualsCollec.doc(`${n}`).set({ 'docCreatedAt': Date.now(), 'prepared': false, remarks: remarks })
                        writesCounter++
                    }
                }
                beingUploadedList.push(`${n}`)
                counter++;
                if (counter > 300) break;
            }
            // await testingLog(`mutualsUploader 03; counter: ${counter} beingUploadedList: ${beingUploadedList.length}`)

            try {
                if (beingUploadedList.length > 0) {
                    await change.after.ref.update({ mutualsUploader: admin.firestore.FieldValue.arrayRemove(...beingUploadedList) })
                    writesCounter++
                    // await testingLog(`mutualsUploader 04 uploaded`)
                } else {
                    // await testingLog(`mutualsUploader 04 NOT uploaded`)
                }

            } catch (e) {
                if (e instanceof Error)
                    await logError(`mutualsUploader///01///${e.toString()}`)
            }
        } catch (e) {
            if (e instanceof Error)
                await logError(`mutualsUploader///02///${e.toString()}`)
        }

    } catch (e) {
        if (e instanceof Error)
            await logError(`mutualsUploader///03///${e.toString()}`)
    }

    await incrementReadWriteCounts('mutualsUploader', readsCounter, writesCounter, deletesCounter)
    return
});

export const mutualsFinderQuery_export = functions.region('asia-south1').runWith({ memory: '1GB', timeoutSeconds: 540, maxInstances: 1 }).firestore.document(`mutuals/{id}`).onUpdate(async (change, context) => {

    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    try {
        const db: FirebaseFirestore.Firestore = admin.firestore();
        const usersCollec = db.collection(usersCollectionString)
        const mutualsCollec = db.collection('mutuals')

        const notPreparedQ = await mutualsCollec.where('prepared', "==", false).limit(100).get()
        readsCounter += notPreparedQ.docs.length

        if (notPreparedQ.docs.length == 0) return;

        for (const notPreparedDoc of notPreparedQ.docs) {
            // const data = doc.data()
            const number: string = notPreparedDoc.id
            const endingDigit: string = number.substring(number.length - 1)

            let createdAt: number = 0
            let name: string = ''
            let isUser: boolean = false
            let mutualsString: string = ''

            const qFindSelf = await usersCollec.where('ownNumber', "==", number).limit(2).get()
            readsCounter += qFindSelf.docs.length
            if (qFindSelf.docs.length > 0) {
                const userDoc = qFindSelf.docs[0]
                const userDocData = userDoc.data()
                createdAt = userDocData.createdAt ?? 0
                name = userDocData.name ?? ''
                isUser = true
            }

            try {
                const q = await usersCollec.where('contactsArrayFresh', "array-contains", number).limit(15).get()
                readsCounter += q.docs.length
                if (!q.empty) {
                    for (const mutualDocFound of q.docs) {
                        const companyDocData = mutualDocFound.data()
                        const namesString: string = companyDocData.companyNames
                        const namesArray: string[] = companyDocData.companyNamesList

                        if (namesArray != null && namesArray != undefined && namesArray.length > 0) {
                            for (const name of namesArray) {
                                if (!name.includes('test') && !name.includes('Test') && !mutualsString.includes(name))
                                    mutualsString += `> ${name}\n`
                            }
                        } else if (namesString != null && namesString != undefined && namesString.length > 4) {
                            if (!namesString.includes('test') && !namesString.includes('Test') && !mutualsString.includes(namesString))
                                mutualsString += `> ${namesString}\n`;
                        }
                    }
                }

                try {
                    if (createdAt != 0 && name != '') {
                        await notPreparedDoc.ref.update({ prepared: true, endingDigit: endingDigit, ownNumber: number, 'isUser': isUser, mutuals: mutualsString, createdAt: createdAt, name: name })
                        writesCounter++
                    } else if (name != '') {
                        await notPreparedDoc.ref.update({ prepared: true, endingDigit: endingDigit, ownNumber: number, 'isUser': isUser, mutuals: mutualsString, name: name })
                        writesCounter++
                    } else if (createdAt != 0) {
                        await notPreparedDoc.ref.update({ prepared: true, endingDigit: endingDigit, ownNumber: number, 'isUser': isUser, mutuals: mutualsString, createdAt: createdAt })
                        writesCounter++
                    } else {
                        await notPreparedDoc.ref.update({ prepared: true, endingDigit: endingDigit, ownNumber: number, 'isUser': isUser, mutuals: mutualsString })
                        writesCounter++
                    }
                } catch (e) {
                    if (e instanceof Error)
                        await logError(`mutualsFinderQuery///03///${e.toString()}`)

                }
            } catch (e) {
                if (e instanceof Error)
                    await logError(`mutualsFinderQuery///02///${e.toString()}`)
            }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`mutualsFinderQuery///01///${e.toString()}`)
    }

    await incrementReadWriteCounts('mutualsFinderQuery', readsCounter, writesCounter, deletesCounter)
    return;
});




export const send_notification_export = functions.region('asia-south1').runWith({ maxInstances: 50 }).firestore.document(`notifications/{nId}`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    // const userId = context.params.userId;
    if (!change.after.exists) return
    const doc = change.after.data()
    if (doc == undefined) return
    const status = doc.status
    if (status != 'pending') {
        return;
    }

    const tokens: Array<string> = doc.tokens || []
    const title = doc.title || ''
    const body = doc.body || ''

    if (tokens == undefined || tokens == null || tokens.length == 0) return;
    if (title == undefined || title == null || title.length == '') return;

    let titleRefined = title
    if (title.includes('*')) {
        titleRefined = title.replace('*', '')
    }

    let bodyRefined = body
    if (title.includes('*')) {
        bodyRefined = body.replace('*', '')
    }

    let countSuccess: number = 0
    let countError: number = 0
    let errorString: string = ''

    if (tokens.length > 0)
        for (const t of tokens) {
            if (t != '' && t != null && t != undefined && t.length > 1) {
                const payload = {
                    token: t,
                    notification: { title: titleRefined, body: bodyRefined },
                    data: { body: bodyRefined }
                };

                try {
                    await admin.messaging().send(payload)
                    countSuccess++

                } catch (e) {
                    if (e instanceof Error)
                        if (e.toString().includes('Requested entity was not found')) {
                            //
                        } else {
                            await logError(`send_notification///01///${e.toString()}; token: ${t}, title: ${title}, body: ${body}`);
                        }
                    // const db: FirebaseFirestore.Firestore = admin.firestore()
                    countError++
                }

                // admin.messaging().send(payload).then((response) => {
                //     countSuccess++

                //     // Response is a message ID string.
                //     // console.log('Successfully sent message: ', response);
                //     // return {success: true};
                // }).catch((e) => {
                //     errorString += `\n${e.code}`
                //     countError++

                //     // change.after.ref.update({ 'status': 'error', 'error': error.code })
                //     // console.log('3 Error: ', error.code);
                //     // return {error: error.code};
                // });
            }
        }

    change.after.ref.update({ 'status': 'completed', 'countError': countError, 'countSuccess': countSuccess, 'error': errorString })
    writesCounter++
    await incrementReadWriteCounts('send_notification', readsCounter, writesCounter, deletesCounter)
    return
})

export const testUpdateStatsForInactive_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540 }).firestore.document(`random/daysForInactiveCutOff`).onWrite(async (change, context) => {
    const inactive: string[] = await getInactiveNumbers(true)
    const active: string[] = await getInactiveNumbers(false)
    const db: FirebaseFirestore.Firestore = admin.firestore();

    await db.collection('random').doc('daysForInactiveCutOffNotes').update({ 'notes': admin.firestore.FieldValue.arrayUnion(`Active: ${active.length}, inactive: ${inactive.length}`) })
    console.log(`Inactive: ${inactive.length}; ${inactive}`)
    console.log(`Active: ${active.length}; ${active}`)
    return
})

export const all_contacts_v2_creator_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, maxInstances: 1, memory: '8GB' }).firestore.document(`allContactsV2Uploader/triggerForStepTwo`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    try {
        const now = Date.now()
        const db: FirebaseFirestore.Firestore = admin.firestore();

        const freshQ = await db.collection('allContactsV2').where('fresh', '==', true).limit(1000).get()
        readsCounter += freshQ.docs.length
        console.log(`Found ${freshQ.docs.length} docs (limit 1000)`)

        // loop through fresh numbers
        for (const doc of freshQ.docs) {
            const num = doc.id

            // check if already a user
            const ownCheckQ = await db.collection(usersCollectionString).where('ownNumber', '==', num).get()
            readsCounter++
            const registeredUser: boolean = ownCheckQ.docs.length >= 1

            // find people knowing them
            const friendsQ = await db.collection(usersCollectionString).where('contactsArrayFresh', 'array-contains', num).get()
            readsCounter += friendsQ.docs.length
            let userNamesMap: Map<string, any> = new Map();
            let mutualsString: string = ''

            try {
                // check how this number is saved
                for (const friendDoc of friendsQ.docs) {
                    const userDocData = friendDoc.data()
                    if (userDocData != null && userDocData != undefined && userDocData.ownNumber != null && userDocData.ownNumber != undefined && userDocData.ownNumber != '') {
                        const ownNumberOfFriend = userDocData.ownNumber
                        userNamesMap.set(ownNumberOfFriend, '')

                        if (userDocData.companyNamesList != null && userDocData.companyNamesList != undefined) {
                            try {
                                for (const name of userDocData.companyNamesList)
                                    mutualsString += `> ${name}\n`

                            } catch (e) { if (e instanceof Error) await logError(`cronAllContactsV2///2///${e.toString()}`); }
                        }

                        // try to get name
                        const contactsDocOfFriend = await db.collection(usersCollectionString).doc(friendDoc.id).collection('userInfo').doc('contacts').get()
                        readsCounter++
                        if (contactsDocOfFriend.exists && contactsDocOfFriend.data() != null && contactsDocOfFriend.data() != undefined && contactsDocOfFriend.data()!.contactsMap != null && contactsDocOfFriend.data()!.contactsMap != undefined) {
                            const conatactsMapObject: Map<string, any> = new Map(Object.entries(contactsDocOfFriend.data()!.contactsMap));
                            const userNameTemp = conatactsMapObject.get(num)
                            if (userNameTemp != null && userNameTemp != undefined && userNameTemp != '') {

                                userNamesMap.set(ownNumberOfFriend, userNameTemp)
                            }
                        }
                    }
                }

            } catch (e) { if (e instanceof Error) await logError(`cronAllContactsV2///2///${e.toString()}`); }

            try {
                let userNamesMapObject = Array.from(userNamesMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                await doc.ref.update({ 'notIndexed': { 'contactNames': userNamesMapObject }, 'lastUpdated': now, 'fresh': false, 'count': friendsQ.docs.length, 'registeredUser': registeredUser, 'mutualsString': mutualsString })
                writesCounter++;
            } catch (e) { if (e instanceof Error) await logError(`cronAllContactsV2///3///${e.toString()}`); }

            if (Date.now() - now > 400000) return
        }

        await incrementReadWriteCounts('all_contacts_v2_creator', readsCounter, writesCounter, deletesCounter)
    } catch (e) { if (e instanceof Error) await logError(`cronAllContactsV2///14///${e.toString()}`); }

    return
});

export const all_contacts_v2_uploader_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, maxInstances: 1 }).firestore.document(`allContactsV2Uploader/allContactsV2Uploader`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const now = Date.now()
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const docData = change.after.data()
    const beforedocData = change.before.data()
    if (beforedocData == null || beforedocData == undefined || beforedocData.trigger == null || beforedocData.trigger == undefined) return
    if (docData == null || docData == undefined || docData.allContactsV2Uploader == null || docData.allContactsV2Uploader == undefined || docData.trigger == null || docData.trigger == undefined) return
    if (beforedocData.trigger == docData.trigger) return

    const forUploading = docData.allContactsV2Uploader!

    let lenToUpload: number = 0
    if (forUploading.length > 5000) {
        lenToUpload = 5000
    } else {
        lenToUpload = forUploading.length
    }

    let uploaded: Array<String> = []

    for (let i = 0; i < lenToUpload; i++) {
        const _d = await db.collection('allContactsV2').doc(`${forUploading[i]}`).get()
        readsCounter++
        // seems like it re-creates the document ??
        if (!_d.exists && _d.data() == undefined) {
            await _d.ref.set({ 'fresh': true, 'notIndexed': { 'createdAt': now } })
            writesCounter++
        }
        uploaded.push(`${forUploading[i]}`)
    }

    await change.after.ref.update({ 'allContactsV2Uploader': admin.firestore.FieldValue.arrayRemove(...uploaded) })
    writesCounter++;

    await incrementReadWriteCounts(`all_contacts_v2_uploader`, readsCounter, writesCounter, deletesCounter)

    return
})

export const updateAllContactsLastActive_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`searchHistorySummary/{trigId}`).onUpdate(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const db: FirebaseFirestore.Firestore = admin.firestore();
    const data = change.after.data()
    if (data == undefined || data == null) return
    // const millisecondsInOneDay: number = 86400000
    // const now = Date.now()

    const eodMil: number = data.eodMil
    // if (eodMil == null || eodMil == undefined || eodMil < (now - millisecondsInOneDay * 2)) {
    //     return
    // }

    const activeNumbers: string[] = data.numbers
    if (activeNumbers == null || activeNumbers == undefined || activeNumbers.length == 0) {
        return
    }

    for (let i = 0; i < 10; i++) {
        const lastDigit: string = `${i}`

        const allUsersDoc = await db.collection('allUsers').doc(`${i}`).get()
        readsCounter++
        if (allUsersDoc != null && allUsersDoc != undefined && allUsersDoc.exists && allUsersDoc.data() != null && allUsersDoc.data() != null) {
            const allUsersData = allUsersDoc.data()!
            let notIndexed = allUsersData.notIndexed

            if (notIndexed != null && notIndexed != undefined) {
                let notIndexedMap: Map<string, any> = new Map(Object.entries(notIndexed))

                for (const activeNum of activeNumbers) {
                    if (activeNum.substring(activeNum.length - 1) == lastDigit) {
                        let existingMil: number = 0
                        try {
                            const valueFromDb: number = notIndexedMap.get(activeNum)
                            if (valueFromDb != null && valueFromDb != undefined) existingMil = valueFromDb
                        } catch (e) { }

                        if (existingMil < eodMil)
                            notIndexedMap.set(activeNum, eodMil)
                    }
                }

                let notIndexedMapUpdated = Array.from(notIndexedMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                await allUsersDoc.ref.update({ notIndexed: notIndexedMapUpdated })
                writesCounter++
            }
        }
    }
    // const companyDocDataMap: Map<string, any> = new Map(Object.entries(afterData))
    // companyDocDataMap.delete('directLinks')
    // let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
    // await docInNetwork.ref.update(companyDocDataMapObject)

    await incrementReadWriteCounts('updateAllContactsLastActive', readsCounter, writesCounter, deletesCounter)
    return
})
