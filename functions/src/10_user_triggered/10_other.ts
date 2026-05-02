import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import {
    arraysAreSame, countryCodeFromNum, findAdded, findRemoved, incrementReadWriteCounts, logError,
    // nSelf, 
    restrictedNumbersList
} from "..";
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';
let userInfoCollectionString = 'userInfo';


export const users_notify_friends_export = functions.region('asia-south1').runWith({ maxInstances: 3 }).firestore.document(`${usersCollectionString}/{trigId}`).onCreate(async (change, context) => {
    try {
        let writesCounter: number = 0;
        let readsCounter: number = 0;
        let deletesCounter: number = 0;

        if (!change.exists) { console.log(`Notifying userId ${context.params.trigId} !change.exists so returning`); return; }
        const doc = change.data()
        if (doc == null || doc == undefined) { return; }
        const ownNumber = doc.ownNumber
        if (ownNumber == null || ownNumber == undefined || ownNumber == '' || restrictedNumbersList.includes(ownNumber)) { console.log(`Notifying userId ${context.params.trigId} ownNumber NA/restricted so returning`); return; }
        const db: FirebaseFirestore.Firestore = admin.firestore()
        const userCollec = db.collection(usersCollectionString)

        const userDocs = await userCollec.where('contactsArrayFresh', 'array-contains', ownNumber).get()
        readsCounter += userDocs.docs.length
        console.log(`ownNumber ${ownNumber}: Found ${userDocs.docs.length} docs`)

        for (const userDoc of userDocs.docs) {
            const userDocData = userDoc.data()

            const friendNumber = userDocData.ownNumber
            if (friendNumber == null || friendNumber == undefined || friendNumber == '' || friendNumber == ownNumber || restrictedNumbersList.includes(friendNumber)) {
                // do nothing
            } else {
                let token = '';
                let userName = '';

                // token
                try {
                    const deviceInfo = userDocData.deviceInfo
                    if (deviceInfo != null && deviceInfo != undefined && deviceInfo.token != undefined) token = deviceInfo.token
                } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///11///${e.toString()}`) }

                // userName
                try {
                    const userContactDoc = await userDoc.ref.collection(userInfoCollectionString).doc('contacts').get()
                    readsCounter++
                    if (userContactDoc.exists) {
                        const userContactDocData = userContactDoc.data()
                        if (userContactDocData != null && userContactDocData != undefined) {
                            const conatactsMap = userContactDocData.contactsMap
                            if (conatactsMap != undefined && conatactsMap != null) {
                                const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
                                const userNameTemp = conatactsMapObject.get(ownNumber)
                                if (userNameTemp != null && userNameTemp != undefined && userNameTemp != '') {
                                    userName = userNameTemp
                                }
                            }
                        }
                    }
                } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///13///${e.toString()}`) }

                try {
                    if (userName == null || userName == undefined || userName == '') {
                        userName = doc.name
                    }
                } catch (e) { }

                if (userName == null || userName == undefined || userName == '') {
                    console.log(`ownNumber ${ownNumber}: Will try for userName NA, friendNumber: ${friendNumber}`)

                    try {
                        await db.collection('notifications').add({
                            'tokens': [],
                            'title': `*${ownNumber}* joined Khoj`,
                            'body': `*${ownNumber}* खोज में शामिल हुए हैं`,
                            'status': 'pending',
                            'createdAt': Date.now(),
                            'createdAtForIndexing': Date.now(),
                            'source': 'userCreatedWithoutName',
                            'userNumbers': [friendNumber],
                            'destinationNumber': ownNumber,

                        })
                        writesCounter++
                    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///14///${e.toString()}`); }
                } else {
                    console.log(`ownNumber ${ownNumber}: Will try for userName: ${userName}, friendNumber: ${friendNumber}`)

                    try {
                        await db.collection('notifications').add({
                            'tokens': [token],
                            'title': `*${userName}* (${ownNumber}) joined Khoj`,
                            'body': `*${userName}* (${ownNumber}) खोज में शामिल हुए हैं`,
                            'status': 'pending',
                            'createdAt': Date.now(),
                            'createdAtForIndexing': Date.now(),
                            'source': 'userCreatedWithName',
                            'userNumbers': [friendNumber],
                            'destinationNumber': ownNumber,
                        })
                        writesCounter++
                    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///15///${e.toString()}`) }
                }
            }
        }

        await incrementReadWriteCounts('users_notify_friends', readsCounter, writesCounter, deletesCounter)
    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///01///${e.toString()}`); }
    console.log(`Ending`)
    return
});

export const users_autoAddSelfToCompany_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 540 }).firestore.document(`${usersCollectionString}/{trigId}`).onCreate(async (change, context) => {
    try {
        let writesCounter: number = 0;
        let readsCounter: number = 0;
        let deletesCounter: number = 0;

        if (!change.exists) { return; }
        const doc = change.data()
        if (!doc) { return; }
        const db: FirebaseFirestore.Firestore = admin.firestore()

        const ownNumber = doc.ownNumber
        const name = doc.name
        if (ownNumber == null || ownNumber == undefined || ownNumber == '') {
            await logError(`ownNumber missing for uid: ${context.params.trigId}`)
            await db.collection('random').doc('ownNumberMissing').update({ 'ownNumberMissing': admin.firestore.FieldValue.arrayUnion(context.params.trigId) })
            writesCounter++
            await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
            return;
        }

        const ownDocInAllContactsV2 = await db.collection('allContactsV2').doc(ownNumber).get()
        if (ownDocInAllContactsV2.exists) {
            await ownDocInAllContactsV2.ref.update({ 'registeredUser': true })
            writesCounter++
        }

        try {
            const newUsersV2Doc = await db.collection('newUsersV2').doc('newUsersV2').get()
            readsCounter++
            const newUsersV2DocData = newUsersV2Doc.data()
            let lstNew: string[] = []

            if (newUsersV2DocData != undefined && newUsersV2DocData != null && newUsersV2DocData.newUsersV2 != null && newUsersV2DocData.newUsersV2 != undefined) {
                let lst: string[] = newUsersV2DocData.newUsersV2
                for (const strr of lst) {
                    if (strr.length > 5) {
                        if (!ownNumber.endsWith(strr.substring(3))) {
                            lstNew.push(strr)
                        }
                    }
                }
            }
            await newUsersV2Doc.ref.update({ 'newUsersV2': lstNew })
            writesCounter++
        } catch (e) { if (e instanceof Error) await logError(`users_autoAddSelfToCompany///01aa///${e.toString()}`); }

        try {
            const newUsersV2Doc = await db.collection('newUsersV2').get()
            readsCounter += newUsersV2Doc.docs.length
            for (const newDoc of newUsersV2Doc.docs) {
                const data = newDoc.data()
                if (data != null && data != undefined && data.notIndexed != null && data.notIndexed != undefined) {
                    const path: string = `notIndexed.${ownNumber}`
                    await newDoc.ref.update({ [path]: admin.firestore.FieldValue.delete() })
                    writesCounter++
                }
            }
        } catch (e) { if (e instanceof Error) await logError(`users_autoAddSelfToCompany///01xa///${e.toString()}`); }

        const companiesCollec = db.collection(companiesCollectionStringV2)
        let companiesQueryW

        if (name != undefined && name != null && name != '') {
            companiesQueryW = await companiesCollec.where('whatsapp', '==', ownNumber).get();
            readsCounter += companiesQueryW.docs.length
            if (companiesQueryW.docs.length > 0) {
                await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                writesCounter++
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
                return
            }

            companiesQueryW = await companiesCollec.where('phoneOne', '==', ownNumber).get();
            readsCounter = readsCounter + (companiesQueryW.docs.length)

            if (companiesQueryW.docs.length > 0) {
                await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                writesCounter++
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
                return
            }

            companiesQueryW = await companiesCollec.where('phoneTwo', '==', ownNumber).get();
            readsCounter = readsCounter + (companiesQueryW.docs.length)
            if (companiesQueryW.docs.length > 0) {
                await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                writesCounter++
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
                return
            }

            companiesQueryW = await companiesCollec.where('phoneThree', '==', ownNumber).get();
            readsCounter = readsCounter + (companiesQueryW.docs.length)
            if (companiesQueryW.docs.length > 0) {
                await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                writesCounter++
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
                return
            }
        } else {
            companiesQueryW = await companiesCollec.where('whatsapp', '==', ownNumber).get();
            readsCounter += companiesQueryW.docs.length

            if (companiesQueryW.docs.length > 0) {
                const companyDoc = companiesQueryW.docs[0].data()
                const personName = companyDoc.personName
                if (personName != null && personName != undefined && personName != '') {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id), 'name': personName })
                    writesCounter++
                } else {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                    writesCounter++
                }
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)

                return
            }

            companiesQueryW = await companiesCollec.where('phoneOne', '==', ownNumber).get();
            readsCounter += companiesQueryW.docs.length

            if (companiesQueryW.docs.length > 0) {
                const companyDoc = companiesQueryW.docs[0].data()
                const personName = companyDoc.personName
                if (personName != null && personName != undefined && personName != '') {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id), 'name': personName })
                    writesCounter++
                } else {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                    writesCounter++
                }
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)

                return
            }

            companiesQueryW = await companiesCollec.where('phoneTwo', '==', ownNumber).get();
            readsCounter = readsCounter + (companiesQueryW.docs.length)

            if (companiesQueryW.docs.length > 0) {
                const companyDoc = companiesQueryW.docs[0].data()
                const personName = companyDoc.personName
                if (personName != null && personName != undefined && personName != '') {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id), 'name': personName })
                    writesCounter++
                } else {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                    writesCounter++
                }
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)

                return
            }

            companiesQueryW = await companiesCollec.where('phoneThree', '==', ownNumber).get();
            readsCounter = readsCounter + (companiesQueryW.docs.length)

            if (companiesQueryW.docs.length > 0) {
                const companyDoc = companiesQueryW.docs[0].data()
                const personName = companyDoc.personName
                if (personName != null && personName != undefined && personName != '') {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id), 'name': personName })
                    writesCounter++
                } else {
                    await change.ref.update({ 'companyIdArray': admin.firestore.FieldValue.arrayUnion(companiesQueryW.docs[0].id) })
                    writesCounter++
                }
                await incrementReadWriteCounts('users_autoAddSelfToCompany', readsCounter, writesCounter, deletesCounter)
                return
            }
        }
    } catch (e) { if (e instanceof Error) await logError(`users_autoAddSelfToCompany///01bb///${e.toString()}`); }

    return
});

export const count_users_increment_export = functions.region('asia-south1').runWith({ maxInstances: 2 }).firestore.document(`${usersCollectionString}/{trigId}`).onCreate(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    try {

        const db: FirebaseFirestore.Firestore = admin.firestore()
        const userInfoDoc = await db.collection(usersCollectionString).doc(context.params.trigId).collection('userInfo').doc('contacts').get();
        readsCounter++

        if (!userInfoDoc.exists) {
            await userInfoDoc.ref.set({ 'test': 1 })
            writesCounter++
        }

        const countsCollec = db.collection('counts')
        await countsCollec.doc('countsFromCloudFunction').update({ numberOfUsers: admin.firestore.FieldValue.increment(1) });
        writesCounter++

        const data = change.data();
        const ownNumber: string = data.ownNumber

        if (ownNumber == null || ownNumber == undefined || ownNumber == '') return;

        const mutualDoc = await db.collection('mutuals').doc(ownNumber).get();
        readsCounter++

        if (mutualDoc.exists) {
            await mutualDoc.ref.update({ isUser: true, createdAt: Date.now() })
            writesCounter++
        }

        try {
            const friendsQ = await db.collection(usersCollectionString).where('contactsArrayFresh', 'array-contains', ownNumber).get()
            readsCounter += friendsQ.docs.length
            await change.ref.update({ 'friendsCount': friendsQ.docs.length })
            writesCounter++
        } catch (e) { if (e instanceof Error) await logError(`count_users_increment///003///${e.toString()}`) }

        try {
            const lastDigit: string = ownNumber.substring(ownNumber.length - 1);
            const path: string = `notIndexed.${ownNumber}`
            await db.collection('allUsers').doc(lastDigit).update({ [path]: Date.now() })
            writesCounter++
        } catch (e) { if (e instanceof Error) await logError(`count_users_increment///008///${e.toString()}`) }

    } catch (e) { if (e instanceof Error) await logError(`count_users_increment///001///${e.toString()}`) }
    await incrementReadWriteCounts('count_users_increment', readsCounter, writesCounter, deletesCounter)

    return
});

export const count_users_decrement_export = functions.region('asia-south1').runWith({ maxInstances: 2 }).firestore.document(`${usersCollectionString}/{trigId}`).onDelete(async (change, context) => {
    const db: FirebaseFirestore.Firestore = admin.firestore()
    const countsCollec = db.collection('counts')
    await countsCollec.doc('countsFromCloudFunction').update({ numberOfUsers: admin.firestore.FieldValue.increment(-1) });
    await incrementReadWriteCounts('count_users_decrement', 0, 1, 0)
    return
});

export const u1_selfBasicsAndMeInCompanyEmployees_export = functions.region('asia-south1').runWith({ maxInstances: 20 }).firestore.document(`${usersCollectionString}/{trigId}`).onWrite(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const db: FirebaseFirestore.Firestore = admin.firestore();

    // IF USER CREATED, UPDATE createdAt 
    try {
        if (!change.before.exists) {
            await change.after.ref.update({ createdAt: Date.now() });
            writesCounter++
            await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
            return;
        }
    } catch (e) {
        if (e instanceof Error) await logError(`u1///002///${e.toString()}`);
        return;
    }

    let myOwnNumber: string

    const beforeDoc = change.before.data()
    const afterDoc = change.after.data()

    // get myOwnNumber
    if (afterDoc) {
        myOwnNumber = afterDoc.ownNumber
    } else if (beforeDoc) {
        myOwnNumber = beforeDoc.ownNumber
    } else {
        await logError(`u1///01///END 001`); return;
    }


    if (afterDoc == undefined || afterDoc == null) {
        await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('userInfo').delete()
        writesCounter++
        // await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('contacts').delete()
        // writesCounter++
        await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('connections').delete()
        writesCounter++
        await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
        return;
    }

    // TASK 1 - trigger contacts doc if user becomes inactive to active
    try {
        if (
            afterDoc.networkDeletedAt != null &&
            afterDoc.networkDeletedAt != undefined &&
            ((Date.now() - afterDoc.networkDeletedAt) > .5 * 3600 * 1000) &&
            afterDoc != undefined &&
            afterDoc != null &&
            afterDoc.contactsArrayOld != null &&
            afterDoc.contactsArrayOld != undefined &&
            afterDoc.contactsArrayOld.length == 0 &&
            afterDoc.lastHomeLoad != null &&
            afterDoc.lastHomeLoad != undefined &&
            ((Date.now() - afterDoc.lastHomeLoad) < 1 * 3600 * 1000)
        ) {
            try {
                const contactsDoc = await change.after.ref.collection('userInfo').doc('contacts').get()
                if (contactsDoc != null &&
                    contactsDoc != undefined &&
                    contactsDoc.data() != undefined &&
                    contactsDoc.data() != null &&
                    contactsDoc.data()!.trigger != null &&
                    contactsDoc.data()!.trigger != undefined &&
                    (Date.now() - contactsDoc.data()!.trigger) < 1 * 3600 * 1000) {
                    console.log('Not triggering as trigger already done within the last hour')
                } else {
                    await change.after.ref.collection('userInfo').doc('contacts').update({ 'trigger': Date.now() })

                }
            } catch (e) { if (e instanceof Error) await logError(`u1///81///ERROR: ${e.toString()}`); }
        } else if (
            beforeDoc != null &&
            beforeDoc != undefined &&
            afterDoc != null &&
            afterDoc != undefined &&
            afterDoc.networkDeletedAt != null &&
            afterDoc.networkDeletedAt != undefined &&
            afterDoc.networkDeletedAt != beforeDoc.networkDeletedAt
        ) {
            await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
            return;
        }
    } catch (e) { if (e instanceof Error) await logError(`u1///53///ERROR: ${e.toString()}`); }

    let companyIdArrayBefore: string[] = []
    let networkDeletedAtBefore = 0

    // get companyIdArrayBefore
    if (beforeDoc != undefined) {
        companyIdArrayBefore = beforeDoc.companyIdArray || []
        networkDeletedAtBefore = beforeDoc.networkDeletedAt
    }

    // get companyIdArrayAfter
    const companyIdArrayAfter: string[] = afterDoc.companyIdArray || []
    const networkDeletedAtAfter = afterDoc.networkDeletedAt

    try {
        // TASK 2 - set userInfo doc
        let userDocDataMap: Map<string, any> = new Map(Object.entries(afterDoc))

        userDocDataMap.delete('companiesMap'); userDocDataMap.delete('contactsArrayFresh'); userDocDataMap.delete('contactsArrayOld'); userDocDataMap.delete('searchHistory'); userDocDataMap.delete('triggers'); userDocDataMap.delete('lastHomeLoad'); userDocDataMap.delete('countHomeLoad');

        let obj = Array.from(userDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
        try {
            await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('userInfo').update(obj)
            writesCounter++
        } catch (e) {
            if (e instanceof Error)
                if (e.toString().includes('No document to update')) {
                    await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('userInfo').set(obj)
                    writesCounter++
                } else {
                    await logError(`u1///96b///${e.toString()}`)
                    writesCounter++
                }
        }

        // TASK 3 - in contacts doc, set token and networkDeletedAt (not sure why)
        try {
            let tokenAfter: string = '';
            let tokenBefore: string = '';

            if (afterDoc.deviceInfo != null && afterDoc.deviceInfo != undefined && afterDoc.deviceInfo.token != null && afterDoc.deviceInfo.token != undefined)
                tokenAfter = afterDoc.deviceInfo.token

            if (beforeDoc != undefined && beforeDoc.deviceInfo != null && beforeDoc.deviceInfo != undefined && beforeDoc.deviceInfo.token != null && beforeDoc.deviceInfo.token != undefined)
                tokenBefore = beforeDoc.deviceInfo.token

            const cIdSame: boolean = arraysAreSame(companyIdArrayAfter, companyIdArrayBefore)

            if (tokenAfter != tokenBefore || !cIdSame || beforeDoc == undefined || networkDeletedAtBefore != networkDeletedAtAfter)
                try {
                    if (networkDeletedAtAfter == undefined) {
                        await db.collection(usersCollectionString)
                            .doc(change.before.id)
                            .collection(userInfoCollectionString)
                            .doc('contacts')
                            .update({
                                'token': tokenAfter,
                                'companyIdArray': companyIdArrayAfter,
                                networkDeletedAt: admin.firestore.FieldValue.delete()
                            })
                        writesCounter++
                    } else {
                        await db.collection(usersCollectionString)
                            .doc(change.before.id)
                            .collection(userInfoCollectionString)
                            .doc('contacts')
                            .update({
                                'token': tokenAfter,
                                'companyIdArray': companyIdArrayAfter,
                                networkDeletedAt: networkDeletedAtAfter
                            })
                        writesCounter++
                    }
                } catch (e) {
                    if (e instanceof Error)
                        if (e.toString().includes('No document to update')) {
                            if (networkDeletedAtAfter == undefined || networkDeletedAtAfter == null) {
                                await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('contacts').set({ 'token': tokenAfter, 'companyIdArray': companyIdArrayAfter })
                                writesCounter++
                            } else {
                                await db.collection(usersCollectionString).doc(change.before.id).collection(userInfoCollectionString).doc('contacts').set({ 'token': tokenAfter, 'companyIdArray': companyIdArrayAfter, networkDeletedAt: networkDeletedAtAfter })
                                writesCounter++
                            }
                        }
                        else { await logError(`u1///99d///${e.toString()}`) }
                }
        } catch (e) { if (e instanceof Error) await logError(`u1///98d///${e.toString()}`) }

    } catch (e) { if (e instanceof Error) await logError(`u1///95///${e.toString()}`) }

    if (myOwnNumber != null && myOwnNumber != undefined && restrictedNumbersList.includes(myOwnNumber)) {
        await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
        return;
    }

    if (myOwnNumber == null || myOwnNumber == undefined || myOwnNumber == '') {
        await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
        return;
    }


    // TASK 4 - in self, update country code and employed
    try {
        if (afterDoc != undefined && afterDoc != null) {
            const codeInDb = afterDoc.countryCode
            // const employedBefore: boolean = companyIdArrayBefore.length > 0
            const employedAfter: boolean = companyIdArrayAfter.length > 0
            if (codeInDb == null || codeInDb == undefined || codeInDb == '' || (!arraysAreSame(companyIdArrayBefore, companyIdArrayAfter))) {
                const codeShouldBe = await countryCodeFromNum(myOwnNumber)
                if (codeShouldBe != '') {
                    writesCounter++
                    await change.after.ref.update({ 'countryCode': codeShouldBe, employed: employedAfter })
                }
            }
        }
    } catch (e) { if (e instanceof Error) await logError(`u1///09///ERROR: ${e.toString()}`); }

    // TASK 5 - apply for creating connections
    if (beforeDoc != undefined && beforeDoc != null) {
        // const triedCreatingConnections: boolean = afterDoc.triedCreatingConnections
        const oldAfter = afterDoc.contactsArrayOld
        const oldBefore = beforeDoc.contactsArrayOld
        const freshAfter = afterDoc.contactsArrayFresh

        if (oldAfter != null && oldAfter != undefined &&
            oldBefore != null && oldBefore != undefined &&
            freshAfter != null && freshAfter != undefined &&
            oldAfter.length - oldBefore.length > 3 &&
            freshAfter.length == oldAfter.length) {

            try {
                await db.collection('createConnections').doc(myOwnNumber).delete()
                deletesCounter++
            } catch (e) { }

            try {
                await db.collection('createConnections').doc(myOwnNumber).set({
                    'userId': context.params.trigId,
                    'ownNumber': myOwnNumber,
                    'remarks': admin.firestore.FieldValue.arrayUnion(`tried first at ${Date.now()}`),
                    'status': 'pending',
                    'milSinceEpoch': Date.now()
                })
                writesCounter++
            } catch (e2) {
                if (e2 instanceof Error) await logError(`u3///71c///e: ${e2.toString()}`)
            }
        }
    }

    // TASK 6 - add/remove me in my company's employees numbers, and update company nameAndCity in self

    const same: boolean = arraysAreSame(companyIdArrayBefore, companyIdArrayAfter)
    if (same) {
        await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
        return;
    }

    // add employee's number to employees array in company
    try {
        const companiesCollec = db.collection(companiesCollectionStringV2)

        const newlyAddedCompanies = findAdded(companyIdArrayBefore, companyIdArrayAfter)
        for (const cId of newlyAddedCompanies) {
            try {
                await companiesCollec.doc(cId).update({ employees: admin.firestore.FieldValue.arrayUnion(myOwnNumber) })
                writesCounter++
                const companyDoc = await companiesCollec.doc(cId).get();
                readsCounter++
                if (companyDoc != null && companyDoc != undefined) {
                    const docData = companyDoc.data()
                    if (docData != undefined && docData != null) {
                        const cName: string = docData.name
                        const cCity: string = docData.actualCity
                        let nameAndCity: string = '';
                        if (!cName.includes('Test') && !cName.includes('test') && !cName.includes('TEST')) {
                            if (cName != null && cName != undefined) nameAndCity += cName
                            if (cCity != null && cCity != undefined) nameAndCity += `, ${cCity}`
                            if (nameAndCity != '') {
                                await change.after.ref.update({ companyNamesList: admin.firestore.FieldValue.arrayUnion(nameAndCity) })
                                writesCounter++
                            }
                        }
                    }
                }
            } catch (e) { if (e instanceof Error) await logError(`u1///004///${e.toString()}`) }
        }

        const newlyRemovedCompanies = findRemoved(companyIdArrayBefore, companyIdArrayAfter)
        for (const cId of newlyRemovedCompanies) {
            try {
                await companiesCollec.doc(cId).update({ employees: admin.firestore.FieldValue.arrayRemove(myOwnNumber) })
                writesCounter++
                const companyDoc = await companiesCollec.doc(cId).get();
                readsCounter++

                if (companyDoc != null && companyDoc != undefined) {
                    const docData = companyDoc.data()
                    if (docData != undefined && docData != null) {
                        const cName: string = docData.name
                        const cCity: string = docData.actualCity
                        let nameAndCity: string = '';
                        if (cName != null && cName != undefined) nameAndCity += cName
                        if (cCity != null && cCity != undefined) nameAndCity += `, ${cCity}`
                        if (nameAndCity != '') {
                            await change.after.ref.update({ companyNamesList: admin.firestore.FieldValue.arrayRemove(nameAndCity) })
                            writesCounter++
                        }
                    }
                }
            } catch (e) { if (e instanceof Error) await logError(`u1///005///${e.toString()}`) }
        }
    } catch (e) { if (e instanceof Error) await logError(`u1///006///${e.toString()}`) }
    await incrementReadWriteCounts('u1_selfBasicsAndMeInCompanyEmployees', readsCounter, writesCounter, deletesCounter)
    return
});


// IMPORTANT FUNCTIONS
/*
// IMPORTANT FUNCTIONS
export const u4_networkDocs_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '2GB' }).firestore.document(`${usersCollectionString}/{trigId}`).onWrite(async (change, context) => {
  await nSelf(false);
  return
});

// export const u4_networkDocsDesc_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '2GB' }).firestore.document(`${usersCollectionString}/{trigId}`).onWrite(async (change, context) => {
//     await nSelf(true);
//     return
// });*/


