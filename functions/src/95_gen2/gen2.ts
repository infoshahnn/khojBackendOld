import admin = require('firebase-admin');
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';

import {
    Change,
    FirestoreEvent,
    // onDocumentCreated, 
    onDocumentWritten,
    // https://firebase.google.com/docs/firestore/extend-with-functions-2nd-gen
} from "firebase-functions/v2/firestore";
import { findAdded, getCommon, getCommonBinary, logError, logThis, pointsForEachMutual } from '..';
import { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';

// Jio: e0ff5ShLR0SGiPM3k2KF9AlB4bQ2
// Airtel: N6ubCnyMGOOqR5AsuTmkDI65fWB2
// +33617330379

//exports.uppercase_export = 
export const uppercase_export = onDocumentWritten(`${usersCollectionString}/e0ff5ShLR0SGiPM3k2KF9AlB4bQ2/userInfo/contacts`, async (event) => {
    const start: number = Date.now()
    if (1 == 1) return

    try {
        const changesMade: string = getChangesMade(event)
        await logToRandomCollecTestDocument(`${start} Started; ${changesMade}`)

        if (event.data == undefined || event.data == null) return;

        const docAfter = event.data.after
        if (docAfter == null || docAfter == undefined || !docAfter.exists) {
            await logToRandomCollecTestDocument(`${start} started & returning as docAfter NA`)
            return;
        }
        const contactsDocAfter = docAfter.data()

        if (contactsDocAfter == undefined || contactsDocAfter == null) {
            await logToRandomCollecTestDocument(`${start} contactsDocData NA so returning`)
            return;
        }

        if (contactsDocAfter.networkDeletedAt != null && contactsDocAfter.networkDeletedAt != undefined && (Date.now() - contactsDocAfter.networkDeletedAt) < 2 * 3600 * 1000) {
            await logToRandomCollecTestDocument(`${start} networkDeletedAt diff: ${(Date.now() - contactsDocAfter.networkDeletedAt) / 1000}s; returning`)
            return
        }

        let freshAfter: string[] | undefined = freshFromContactsDoc(event.data.after)
        if (freshAfter == undefined || freshAfter.length == 0) return;

        let freshBefore: string[] | undefined = freshFromContactsDoc(event.data.before)
        if (freshBefore == undefined || freshBefore == null) freshBefore = [];

        const addedArray: string[] = findAdded(freshBefore, freshAfter)
        if (addedArray.length == 0) return

        const userDoc = await event.data.after.ref.parent.parent?.get();
        if (userDoc == null || userDoc == undefined || userDoc.data() == null || userDoc.data() == undefined || userDoc.data()!.ownNumber == null || userDoc.data()!.ownNumber == undefined || userDoc.data()!.ownNumber == '') {
            await logToRandomCollecTestDocument(`${start} networkDeletedAt diff: ${(Date.now() - contactsDocAfter.networkDeletedAt) / 1000}s; returning`)
            console.log(`Error: userDoc NA`)
            await logError(`uppercase_export: 01 - parent userDoc NA for ${event.data.after.ref.path}`)
            return;
        }

        const ownNumber = userDoc.data()!.ownNumber!
        const buildMap = await makeBuildMap(addedArray, freshAfter, ownNumber)

        await logBuildMap(buildMap, start)
        await executeFromBuildMap(buildMap, ownNumber)

        await logToRandomCollecTestDocument(`${start} ending; duration: ${Date.now() - start}`)

    } catch (e) {
        if (e instanceof Error) await logToRandomCollecTestDocument(`ERROR ${start} ${e.toString()}`)
        if (e instanceof Error) await logError(`ERROR ${start} ${e.toString()}`)
    }

    return
});






// SUPPORTING
export const getChangesMade = (event: FirestoreEvent<Change<DocumentSnapshot> | undefined>): string => {
    if (event == undefined || event.data == undefined) return 'trigger: Event undefined'
    if (event.data.before == undefined) return 'trigger: Before NA (1)'
    if (event.data.after == undefined) return 'trigger: After NA (1)'

    const docAfter = event.data.after!
    const afterData = docAfter.data()
    if (afterData == undefined) return 'trigger: After NA (2)'

    const docBefore = event.data.before!
    const beforeData = docBefore.data()
    if (beforeData == undefined) return 'trigger: Before NA (2)'

    let changes: string = 'triggers: '

    if (beforeData.test != afterData.test) changes += 'trigger: test, '
    if (beforeData.token != afterData.token) changes += 'trigger: token, '

    let cIdArrayBeforeLength: number = 0
    if (beforeData.companyIdArray != null && beforeData.companyIdArray != undefined) cIdArrayBeforeLength = beforeData.companyIdArray.length

    let cIdArrayAfterLength: number = 0
    if (afterData.companyIdArray != null && afterData.companyIdArray != undefined) cIdArrayAfterLength = afterData.companyIdArray.length

    if (cIdArrayBeforeLength != cIdArrayAfterLength) changes += `trigger: companyIdArray; before ${cIdArrayBeforeLength}, after ${cIdArrayAfterLength}, `

    let contactsMapBeforeLength: number = 0
    if (beforeData.contactsMap != null && beforeData.contactsMap != undefined) {
        let m: Map<string, any> = new Map(Object.entries(beforeData.contactsMap))
        contactsMapBeforeLength = Array.from(m.keys()).length
    }

    let contactsMapAfterLength: number = 0
    if (afterData.contactsMap != null && afterData.contactsMap != undefined) {
        let m: Map<string, any> = new Map(Object.entries(afterData.contactsMap))
        contactsMapAfterLength = Array.from(m.keys()).length
    }
    if (contactsMapBeforeLength != contactsMapAfterLength) changes += `trigger: contactsMap; before ${contactsMapBeforeLength}, after ${contactsMapAfterLength}, `

    let contactsFreshBeforeLength: number = 0
    if (beforeData.contactsArrayFresh != null && beforeData.contactsArrayFresh != undefined) {
        contactsFreshBeforeLength = beforeData.contactsArrayFresh.length
    }

    let contactsFreshAfterLength: number = 0
    if (afterData.contactsArrayFresh != null && afterData.contactsArrayFresh != undefined) {
        contactsFreshAfterLength = afterData.contactsArrayFresh.length
    }
    if (contactsFreshBeforeLength != contactsFreshAfterLength) changes += `trigger: contactsArrayFresh; before ${contactsFreshBeforeLength}, after ${contactsFreshAfterLength}, `

    return changes
}

export const executeFromBuildMap = async (buildMap: Map<string, Map<string, string[]>>, ownNumber: string) => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    for (const cId of buildMap.keys()) {
        let empsUnique: string[] = []
        let mutualEmpsArrayMap: Map<string, string[]> = buildMap.get(cId)!
        for (const mutual of mutualEmpsArrayMap.keys()) {
            let empsArray: string[] = mutualEmpsArrayMap.get(mutual) || []
            empsUnique = empsUnique.concat(empsArray)
        }
        empsUnique = [...new Set(empsUnique)]

        // networkKeys are mutuals = arrayUnion mutualEmpsArrayMap.keys()
        // networkValues are employees = arrayUnion empsUnique

        const networkDoc = await db.collection(companiesCollectionStringV2).doc(cId).collection('network').doc(ownNumber).get()
        if (networkDoc.data() == undefined) {
            // await logToRandomCollecTestDocument(`executeFromBuildMap; networkDoc NA so will create`)

            let companyData = await getCompanyDataFromCId(cId)
            if (companyData != undefined) {
                companyData.set('ownNumber', ownNumber)

                let networkLinksObject = Array.from(mutualEmpsArrayMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                companyData.set('networkLinks', networkLinksObject)
                companyData.set('networkKeys', Array.from(mutualEmpsArrayMap.keys()))
                companyData.set('networkValues', empsUnique)
                companyData.set('remarks', 'gen2')
                companyData.set('points', getPoints(companyData))
                let companyDataForUploading = Array.from(companyData).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                await networkDoc.ref.set(companyDataForUploading)
            }
        } else {
            // await logToRandomCollecTestDocument(`executeFromBuildMap; networkDoc found`)

            let networkDocMap: Map<string, any> = new Map(Object.entries(networkDoc.data()!))
            networkDocMap.set('ownNumber', ownNumber)

            // set networkLinks
            let networkLinks = networkDocMap.get('networkLinks')
            let networkLinksMap: Map<string, any> = new Map(Object.entries(networkLinks!))
            for (const mutual of mutualEmpsArrayMap.keys()) {
                let empsArray: string[] = networkLinksMap.get(mutual) || []
                // await logToRandomCollecTestDocument(`Building 01; mutual ${mutual} -> found ${empsArray}`)

                empsArray = empsArray.concat(mutualEmpsArrayMap.get(mutual) || [])
                empsArray = [...new Set(empsArray)]
                networkLinksMap.set(mutual, empsArray)
                // await logToRandomCollecTestDocument(`Building 02; mutual ${mutual} -> setting ${empsArray}`)
            }
            let networkLinksMapForUpload = Array.from(networkLinksMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

            // set networkKeys
            let networkKeys = networkDocMap.get('networkKeys') || []
            networkKeys = networkKeys.concat(Array.from(mutualEmpsArrayMap.keys()))
            networkKeys = [... new Set(networkKeys)]

            // set networkValues
            let networkValues = networkDocMap.get('networkValues') || []
            networkValues = networkValues.concat(empsUnique)
            networkValues = [... new Set(networkValues)]

            networkDocMap.set('networkLinks', networkLinksMapForUpload)
            networkDocMap.set('networkKeys', networkKeys)
            networkDocMap.set('networkValues', networkValues)
            networkDocMap.set('remarks', 'gen2')
            networkDocMap.set('points', getPoints(networkDocMap))

            let networkLMapForUpload = Array.from(networkDocMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

            await networkDoc.ref.update(networkLMapForUpload)
        }
    }
    return
}

export const executeFromBuildMapV2 = async (buildMap: Map<string, Map<string, string[]>>, ownNumber: string, ignoreExistingNetworkDocs: boolean) => {
    const now = Date.now()
    const db: FirebaseFirestore.Firestore = admin.firestore();
    let cIdsList: string[] = Array.from(buildMap.keys());
    await logThis(`07a/-----/${ownNumber}: ${cIdsList.length} companies`, ownNumber)

    // console.log(`06 > w: (${Date.now() - now})`)
    let cIdCompanyDocsMap = await getCompanyDocsMap(cIdsList)
    // console.log(`06 > x: (${Date.now() - now})`)
    let cIdNDocsMap = await getNetworkDocsMap(cIdsList, ownNumber, ignoreExistingNetworkDocs)
    // console.log(`06 > y: (${Date.now() - now})`)

    // let cIdCompanyDocsMap: Map<string, DocumentSnapshot> = new Map<string, DocumentSnapshot<DocumentData>>
    // let cIdNDocsMap: Map<string, DocumentSnapshot> = new Map<string, DocumentSnapshot<DocumentData>>
    // let futureQueriesCompanies = []
    // let futureQueriesNetworks = []
    // console.log(`06 > b: (${Date.now() - now})`)
    // for (const cId of cIdsList) {
    // const cDocFuture = db.collection(companiesCollectionStringV2).doc(cId).get()
    // futureQueriesCompanies.push(cDocFuture)
    // const nDocFuture = db.collection(companiesCollectionStringV2).doc(cId).collection('network').doc(ownNumber).get()
    // futureQueriesNetworks.push(nDocFuture)
    // }
    // console.log(`06 > c: (${Date.now() - now})`)
    // const cQueries = await Promise.all(futureQueriesCompanies)
    // console.log(`06 > d: (${Date.now() - now})`)
    // const nQueries = await Promise.all(futureQueriesNetworks)
    // console.log(`06 > e: (${Date.now() - now})`)
    // for (const cDoc of cQueries) {
    //     cIdCompanyDocsMap.set(cDoc.id, cDoc)
    // }
    // for (const nDoc of nQueries) {
    //     cIdNDocsMap.set(nDoc.ref.parent.parent!.id, nDoc)
    // }
    // console.log(`06 > f: (${Date.now() - now})`)

    let setTime = 0
    let updateTime = 0
    let setCounter = 0
    let updateCounter = 0
    let totalCounter = 0
    let promisesList = []

    for (const cId of buildMap.keys()) {
        totalCounter++
        let empsUnique: string[] = []
        let mutualEmpsArrayMap: Map<string, string[]> = buildMap.get(cId)!
        for (const mutual of mutualEmpsArrayMap.keys()) {
            let empsArray: string[] = mutualEmpsArrayMap.get(mutual) || []
            empsUnique = empsUnique.concat(empsArray)
        }
        empsUnique = [...new Set(empsUnique)]

        const networkDoc = cIdNDocsMap.get(cId)
        if (networkDoc == null || networkDoc == undefined || networkDoc.data() == undefined) {

            let companyDoc = cIdCompanyDocsMap.get(cId)
            let companyData = getCompanyDataFromDocument(companyDoc)
            if (companyData != undefined) {
                companyData.set('ownNumber', ownNumber)

                let networkLinksObject = Array.from(mutualEmpsArrayMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {})

                companyData.set('networkLinks', networkLinksObject)
                companyData.set('networkKeys', Array.from(mutualEmpsArrayMap.keys()))
                companyData.set('networkValues', empsUnique)
                companyData.set('remarks', 'gen2')
                companyData.set('points', getPoints(companyData))
                let companyDataForUploading = Array.from(companyData).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                const startAwait = Date.now()
                promisesList.push(db.collection(companiesCollectionStringV2).doc(cId).collection('network').doc(ownNumber).set(companyDataForUploading))
                setTime += Date.now() - startAwait
                setCounter++
            }
        } else {
            let networkDocMap: Map<string, any> = new Map(Object.entries(networkDoc.data()!))
            networkDocMap.set('ownNumber', ownNumber)

            // set networkLinks
            let networkLinks = networkDocMap.get('networkLinks')
            let networkLinksMap: Map<string, any> = new Map(Object.entries(networkLinks!))
            for (const mutual of mutualEmpsArrayMap.keys()) {
                let empsArray: string[] = networkLinksMap.get(mutual) || []
                // await logToRandomCollecTestDocument(`Building 01; mutual ${mutual} -> found ${empsArray}`)

                empsArray = empsArray.concat(mutualEmpsArrayMap.get(mutual) || [])
                empsArray = [...new Set(empsArray)]
                networkLinksMap.set(mutual, empsArray)
                // await logToRandomCollecTestDocument(`Building 02; mutual ${mutual} -> setting ${empsArray}`)
            }
            let networkLinksMapForUpload = Array.from(networkLinksMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

            // set networkKeys
            let networkKeys = networkDocMap.get('networkKeys') || []
            networkKeys = networkKeys.concat(Array.from(mutualEmpsArrayMap.keys()))
            networkKeys = [... new Set(networkKeys)]

            // set networkValues
            let networkValues = networkDocMap.get('networkValues') || []
            networkValues = networkValues.concat(empsUnique)
            networkValues = [... new Set(networkValues)]

            networkDocMap.set('networkLinks', networkLinksMapForUpload)
            networkDocMap.set('networkKeys', networkKeys)
            networkDocMap.set('networkValues', networkValues)
            networkDocMap.set('remarks', 'gen2')
            networkDocMap.set('points', getPoints(networkDocMap))

            let networkLMapForUpload = Array.from(networkDocMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

            const startAwait = Date.now()
            promisesList.push(networkDoc.ref.update(networkLMapForUpload))
            updateTime += Date.now() - startAwait
            updateCounter++
        }
    }
    console.log(`06 > g: (${Date.now() - now}) [setTime: ${setTime}, updateTime: ${updateTime}, sets: ${setCounter}, updates: ${updateCounter}, total: ${totalCounter}]`)
    await Promise.all(promisesList)
    console.log(`07 > g: (${Date.now() - now})`)

    return
}

export const getCompanyDocsMap = async (cIdsList: string[]): Promise<Map<string, DocumentSnapshot>> => {
    let futureQueriesCompanies = []
    const db: FirebaseFirestore.Firestore = admin.firestore();

    for (const cId of cIdsList) {
        const cDocFuture = db.collection(companiesCollectionStringV2).doc(cId).get()
        futureQueriesCompanies.push(cDocFuture)
    }

    const cQueries = await Promise.all(futureQueriesCompanies)

    let cIdCompanyDocsMap: Map<string, DocumentSnapshot> = new Map<string, DocumentSnapshot<DocumentData>>
    for (const cDoc of cQueries) cIdCompanyDocsMap.set(cDoc.id, cDoc)

    return cIdCompanyDocsMap
}

export const getNetworkDocsMap = async (cIdsList: string[], ownNumber: string, ignoreExistingNetworkDocs: boolean): Promise<Map<string, DocumentSnapshot>> => {
    let cIdNDocsMap: Map<string, DocumentSnapshot> = new Map<string, DocumentSnapshot<DocumentData>>
    if(ignoreExistingNetworkDocs) return cIdNDocsMap

    let futureQueriesNetworks = []
    const db: FirebaseFirestore.Firestore = admin.firestore();

    for (const cId of cIdsList) {
        const nDocFuture = db.collection(companiesCollectionStringV2).doc(cId).collection('network').doc(ownNumber).get()
        futureQueriesNetworks.push(nDocFuture)
    }

    const nQueries = await Promise.all(futureQueriesNetworks)

    for (const nDoc of nQueries) cIdNDocsMap.set(nDoc.ref.parent.parent!.id, nDoc)

    return cIdNDocsMap
}

export const getPoints = (docDataMap: Map<string, any>): number => {
    let points: number = 0
    const category = docDataMap.get('category')
    if (category == 'warehouse') points = -5000000
    if (category == 'transporter') points = -10000000
    if (category == 'bag') points = -20000000
    if (category == 'farmer') points = -30000000
    if (category == 'machine') points = -40000000
    if (category == 'surveyor') points = -50000000
    if (category == 'software') points = -60000000
    if (category == 'cha') points = -70000000
    if (category == 'forwarder') points = -80000000

    const networkLinks = docDataMap.get('networkLinks')
    if (networkLinks != undefined && networkLinks != null) {
        let networkLinksMap: Map<string, any> = new Map(Object.entries(networkLinks!))
        if (networkLinksMap != null && networkLinksMap != undefined)
            points += Array.from(networkLinksMap.keys()).length * pointsForEachMutual
    }

    return points
}


export const getCompanyDataFromCId = async (cId: string): Promise<Map<string, any> | undefined> => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    const companyDoc = await db.collection(companiesCollectionStringV2).doc(cId).get()// networkDoc.ref.parent.parent!.get()
    return getCompanyDataFromDocument(companyDoc)
    // const companyDocData = companyDoc.data()
    // if (companyDocData == undefined || companyDocData == null) return undefined

    // const companyDocDataMap: Map<string, any> = new Map(Object.entries(companyDocData))
    // companyDocDataMap.delete('testTrigger')
    // companyDocDataMap.delete('networkLinks')
    // companyDocDataMap.delete('directLinks')
    // companyDocDataMap.delete('points')
    // companyDocDataMap.delete('companyPoints')
    // // companyDocDataMap.delete('transporterPoints')
    // // companyDocDataMap.delete('transporterCompanyPoints')
    // companyDocDataMap.delete('selfUpdatesPending')
    // companyDocDataMap.delete('selfUpdatesFromUser')
    // companyDocDataMap.delete('selfUpdatesFromCompany')
    // companyDocDataMap.delete('productsV2')
    // companyDocDataMap.delete('countOfEmployeesWithoutField')
    // companyDocDataMap.delete('adminPhones')
    // companyDocDataMap.delete('employees')

    // return companyDocDataMap
}

export const getCompanyDataFromDocument = (companyDoc: DocumentSnapshot | undefined): Map<string, any> | undefined => {
    if (companyDoc == undefined) return undefined
    const companyDocData = companyDoc.data()
    if (companyDocData == undefined || companyDocData == null) return undefined

    const companyDocDataMap: Map<string, any> = new Map(Object.entries(companyDocData))
    companyDocDataMap.delete('testTrigger')
    companyDocDataMap.delete('networkLinks')
    companyDocDataMap.delete('directLinks')
    companyDocDataMap.delete('points')
    companyDocDataMap.delete('companyPoints')
    // companyDocDataMap.delete('transporterPoints')
    // companyDocDataMap.delete('transporterCompanyPoints')
    companyDocDataMap.delete('selfUpdatesPending')
    companyDocDataMap.delete('selfUpdatesFromUser')
    companyDocDataMap.delete('selfUpdatesFromCompany')
    companyDocDataMap.delete('productsV2')
    companyDocDataMap.delete('countOfEmployeesWithoutField')
    companyDocDataMap.delete('adminPhones')
    companyDocDataMap.delete('employees')

    return companyDocDataMap
}

export const makeBuildMap = async (addedArray: string[], freshAfter: string[], ownNumber: string): Promise<Map<string, Map<string, string[]>>> => {
    let buildMap = new Map<string, Map<string, string[]>>([]);

    const counter: number = Math.ceil(addedArray.length / 10)
    const db: FirebaseFirestore.Firestore = admin.firestore();

    for (let i = 0; i < counter; i++) {
        const lst: string[] = getTenAtATime(addedArray, i)
        const qUsersKnowingThese = await db.collection(usersCollectionString)
            .where('employed', '==', true)
            .where('contactsArrayFresh', 'array-contains-any', lst)
            .get();

        await logToRandomCollecTestDocument(`makeBuildMap ${i}: ${qUsersKnowingThese.docs.length} found`)

        for (const empDoc of qUsersKnowingThese.docs)
            if (empDoc.get('ownNumber') != ownNumber) buildMap = makeBuildMapSupporting(freshAfter, buildMap, empDoc)
    }
    return buildMap
}

export const freshFromContactsDoc = (contactsDocumentAfter: DocumentSnapshot | undefined): string[] | undefined => {
    if (
        contactsDocumentAfter == undefined || contactsDocumentAfter == null ||
        contactsDocumentAfter.data() == undefined || contactsDocumentAfter.data() == null ||
        contactsDocumentAfter.data()!.contactsMap == undefined || contactsDocumentAfter.data()!.contactsMap == null
    ) return undefined

    const m = contactsDocumentAfter.data()!.contactsMap!
    const mObject: Map<string, any> = new Map(Object.entries(m));
    let lst: string[] = Array.from(mObject.keys())
    return [...new Set(lst)]
}


export const logBuildMap = async (buildMap: Map<string, Map<string, string[]>>, start: number) => {
    // let str = ''
    // if (input == null || input == undefined) return ''

    // for (const cId of input.keys()) {
    //     str += `\n\n-----\n\n${cId}: \n`;

    //     const mutualEmpsArrayMap = input.get(cId)
    //     if (mutualEmpsArrayMap == null || mutualEmpsArrayMap == undefined) {
    //         str += ` > null/undefined \n`;
    //     } else {
    //         for (const mutualNumber of mutualEmpsArrayMap.keys())
    //             str += ` > ${mutualNumber}: ${mutualEmpsArrayMap.get(mutualNumber)?.toString()}\n`;
    //     }
    // }
    // return str


    let toCopy: string = ''

    for (const cId of buildMap.keys()) {
        let mutualEmpsArrayMap: Map<string, string[]> = buildMap.get(cId)!

        for (const mutual of mutualEmpsArrayMap.keys()) {
            let arr: string[] = mutualEmpsArrayMap.get(mutual) || []
            toCopy += `${cId} > ${mutual} > ${arr}---`
        }
    }
    await logToRandomCollecTestDocument(`${start} ${toCopy}`)
    return
}

export const makeBuildMapSupportingV2 = (fresh: string[], empDocs: admin.firestore.DocumentData[]): Map<string, Map<string, string[]>> => {
    let mapsOfCIds: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>
    try {

        // let counter: number = 1
        for (const empDoc of empDocs) {
            if (
                empDoc.data() == null || empDoc.data() == undefined ||
                empDoc.data().ownNumber == null || empDoc.data().ownNumber == undefined || empDoc.data().ownNumber == '' ||
                empDoc.data().contactsArrayFresh == null || empDoc.data().contactsArrayFresh == undefined ||
                empDoc.data().companyIdArray == null || empDoc.data().companyIdArray == undefined || empDoc.data().companyIdArray.length == 0
            ) {
                // do nothing
            } else {

                const mutuals = getCommonBinary(fresh, empDoc.data().contactsArrayFresh)

                if (mutuals.length > 0) {

                    const companyIdArray = empDoc.data().companyIdArray!
                    const empNumber = empDoc.data().ownNumber

                    for (const cId of companyIdArray) {
                        let mapOfOneCId: Map<string, string[]> = mapsOfCIds.get(cId) || new Map<string, string[]>([])

                        for (const mutual of mutuals) {
                            let emps: string[] = mapOfOneCId.get(mutual) || []
                            emps.push(empNumber)
                            emps = [...new Set(emps)]
                            mapOfOneCId.set(mutual, emps)
                        }

                        mapsOfCIds.set(cId, mapOfOneCId)
                    }
                }
            }
        }
    } catch (e) {
        if (e instanceof Error) {
            logError(`findAdded///02///${e.toString()}`)
        }
    }
    return mapsOfCIds
}

export const makeBuildMapSupporting = (fresh: string[], input: Map<string, Map<string, string[]>>, empDoc: admin.firestore.DocumentData): Map<string, Map<string, string[]>> => {
    // let buildMap = new Map<string, Map<string, string[]>>([
    // correct format:
    //     ['cid1', new Map([
    //         ['mutual1', ['emp1', 'emp2']],
    //         ['mutual2', ['emp1']],
    //     ])],
    //     ['cid2', new Map([
    //         ['mutual6', ['emp4', 'emp3']],
    //         ['mutual7', ['emp3']],
    //         ['mutual8', ['emp3']],
    //     ])],
    // ]);


    if (
        empDoc.data() == null || empDoc.data() == undefined ||
        empDoc.data().ownNumber == null || empDoc.data().ownNumber == undefined || empDoc.data().ownNumber == '' ||
        empDoc.data().contactsArrayFresh == null || empDoc.data().contactsArrayFresh == undefined ||
        empDoc.data().companyIdArray == null || empDoc.data().companyIdArray == undefined || empDoc.data().companyIdArray.length == 0
    ) return input

    const companyIdArray = empDoc.data().companyIdArray!
    const empNumber = empDoc.data().ownNumber
    const mutuals = getCommon(fresh, empDoc.data().contactsArrayFresh)
    if (mutuals.length == 0) return input

    for (const cId of companyIdArray) {
        let mutualEmpsArrayMap: Map<string, string[]> = input.get(cId) || new Map<string, string[]>([])
        for (const mutual of mutuals) {
            let arr: string[] = mutualEmpsArrayMap.get(mutual) || []
            arr.push(empNumber)
            arr = [...new Set(arr)]
            mutualEmpsArrayMap.set(mutual, arr)
        }

        input.set(cId, mutualEmpsArrayMap)
    }

    return input
}

export const logToRandomCollecTestDocument = async (msg: string) => {
    const db: FirebaseFirestore.Firestore = admin.firestore();

    var d = new Date();

    try {
        await db.collection('test').doc('uppercase_gen2')
            .update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}///${msg.toString()}`) });
    } catch (e) {
        if (e instanceof Error)
            console.log(`ERROR in logToRandomCollecTestDocument: ${e.toString()}`)
    }
}

export const getTenAtATime = (lst: string[], zeroBasedCounter: number): string[] => {
    const startIndex: number = zeroBasedCounter * 10
    if (lst.length < startIndex) return [];

    let endIndex: number = startIndex + 10
    if (endIndex > lst.length) endIndex = lst.length
    let results: string[] = []

    for (let i = startIndex; i < endIndex; i++) results.push(lst[i])

    return results
}






// // this is working
// import {
//     onRequest,
//     onDocumentWritten,
//     onDocumentCreated,
//     onDocumentUpdated,
//     onDocumentDeleted,
//     Change,
//     FirestoreEvent,

// } from "firebase-functions/v2/https";


// export const helloWorld2 = onRequest(async (params, response) => {
//     response.send("DOne");
// });


// // THIS IS GIVING ERROR:
// exports.myfunction = onDocumentWritten("my-collection/{docId}", (event) => {
//     /* ... */
// });
