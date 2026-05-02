import admin = require('firebase-admin');
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getDateTimeString } from '../50_auc_triggered/auc_triggered';
import { findAdded } from '..';
import { Timestamp } from 'firebase-admin/firestore';


export const auc_triggered_export = onDocumentUpdated(`auctions/{companyId}`, async (event) => {

    const STALE_READ_STALENESS = 60 * 1000 * 90; // 1 minute
    const maxDataStaleness: Date = new Date(
        new Date().getTime() - STALE_READ_STALENESS
    );
    const db: FirebaseFirestore.Firestore = admin.firestore()

    const q = await db.collection('auctions').get()

    for (const doc of q.docs) {

        const snaps = await db.runTransaction(async t => {

            const aucDoc = await t.get(doc.ref)
            const ref = await aucDoc.ref.collection('bids').get()

            let snapsIn = []

            for (const bidDoc of ref.docs) {
                snapsIn.push(await t.get(bidDoc.ref))
            }

            return snapsIn
        },
            {
                readOnly: true,
                readTime: Timestamp.fromDate(maxDataStaleness),
            }
        );

        for (const snap of snaps) {
            await db.collection('test').doc(doc.id).collection('bids').add(snap.data()!)
        }
    }

    // const aucId = 'Gyphcs7yGp24UAsArfxV'

    // const ref = db.collection('auctions').doc(aucId)

    // const snap = await db.runTransaction(
    //     async t => {
    //         return t.get(ref);
    //     },
    //     {
    //         readOnly: true,
    //         readTime: Timestamp.fromDate(maxDataStaleness),
    //     }
    // );

    // await db.collection('test').doc(aucId).collection('bids').add(snap.data()!)


    // let snap: DocumentSnapshot<FirebaseFirestore.DocumentData>;
    // if (useStaleReads) {
    //     export const STALE_READ_STALENESS = 60 * 1000; // 1 minute
    //     const maxDataStaleness: Date = new Date(
    //         new Date().getTime() - STALE_READ_STALENESS
    //     );
    //     snap = await admin.firestore.runTransaction(
    //         async t => {
    //             return t.get(ref);
    //         },
    //         {
    //             readOnly: true,
    //             readTime: Timestamp.fromDate(maxDataStaleness),
    //         }
    //     );
    // } else {
    //     snap = await ref.get();
    // }

    // logger.profile(`stale-read-${random}`, {
    //     level: 'info',
    //     message: 'Read from Firestore',
    //     meta: {
    //         useStaleReads,
    //     },
    // });
    return;
});

export const auc_privately_add_approval_triggered_export = onDocumentUpdated(`auctionApprovals/{companyId}`, async (event) => {

    console.log(`started`)
    if (event == undefined || event.data == undefined ||
        event.data.after.data() == undefined || event.data.after.data() == null ||
        event.data.before.data() == undefined || event.data.before.data() == null
    ) return

    const beforeData: FirebaseFirestore.DocumentData = event.data.before.data()!
    const afterData: FirebaseFirestore.DocumentData = event.data.after.data()!

    let pBefore: string[] = getKeysWhereValuesEmpty(beforeData.privatelyAddedByHostNumbersIds)
    let pAfter: string[] = getKeysWhereValuesEmpty(afterData.privatelyAddedByHostNumbersIds)

    const addedNumsByHost = findAdded(pBefore, pAfter)

    for (const n of addedNumsByHost) {
        const errorsIfAny = await executeAddingPrivately(event.data.after.id, n, false, '', '', event.data.after, '', 'approvalDoc');
        console.log(`Errors if any by host: ${errorsIfAny}`)
    }

    let indisMapAfter = afterData.individualsMap
    let indisMapBefore = beforeData.individualsMap

    if (indisMapAfter != null && indisMapAfter != undefined && indisMapBefore != null && indisMapBefore != undefined) {
        const indisMapsObjectAfter: Map<string, any> = new Map(Object.entries(indisMapAfter));
        const indisMapsObjectBefore: Map<string, any> = new Map(Object.entries(indisMapBefore));
        for (const tentativeBrokerId of indisMapsObjectAfter.keys()) {

            const indiMapBefore = indisMapsObjectBefore.get(tentativeBrokerId)
            const indiMapAfter = indisMapsObjectAfter.get(tentativeBrokerId)

            if (indiMapAfter != null && indiMapAfter != undefined && indiMapBefore != null && indiMapBefore != undefined) {
                const indiMapAfterObject: Map<string, any> = new Map(Object.entries(indiMapAfter));
                const pHereAfter: string[] = getKeysWhereValuesEmpty(indiMapAfterObject.get('privatelyApproved'))

                const indiMapBeforeObject: Map<string, any> = new Map(Object.entries(indiMapBefore));
                const pHereBefore: string[] = getKeysWhereValuesEmpty(indiMapBeforeObject.get('privatelyApproved'))
                const addedNumsByBrokers = findAdded(pHereBefore, pHereAfter)

                const tentativeBrokerNumber = indiMapAfterObject.get('number')

                for (const n of addedNumsByBrokers) {
                    const errIfAny = await executeAddingPrivately(event.data.after.id, n, true, tentativeBrokerId, tentativeBrokerNumber, event.data.after, '', 'approvalDoc');
                    console.log(`Errors if any by brokers: ${errIfAny}`)
                }
            }
        }
    }
    return;
});

export const auc_privately_add_new_user_triggered_export = onDocumentCreated(`testUsersAutoGenerated/{userId}`, async (event) => {
    if (event == undefined || event.data == undefined) return
    const triggerData: FirebaseFirestore.DocumentData | undefined = event.data.data()
    const db: FirebaseFirestore.Firestore = admin.firestore()
    if (triggerData == null || triggerData == undefined) return;

    try {
        if (triggerData.createdAt == null || triggerData.createdAt == undefined) {
            await event.data.ref.update({ 'createdAt': Date.now() });
        }
    } catch (e) {
        console.log(`Error 1: ${e!.toString()}`)
    }

    if (triggerData.phoneNumber == null || triggerData.phoneNumber == undefined || triggerData.phoneNumber == '') {
        return
    }

    console.log(`${triggerData.phoneNumber} 01 started`)

    const aucApprovals = await db.collection('auctionApprovals').get()

    console.log(`${triggerData.phoneNumber} 02 found aucApproval docs total ${aucApprovals.docs.length}`)

    let errorsString = '';

    try {
        for (const approvalDoc of aucApprovals.docs) {
            const data = approvalDoc.data()

            const p = data.privatelyAddedByHostNumbersIds
            if (p != null && p != undefined) {
                const pObject: Map<string, any> = new Map(Object.entries(p));
                const valueHere = pObject.get(triggerData.phoneNumber)
                if (valueHere == '') {
                    let result: string = await executeAddingPrivately(approvalDoc.id, triggerData.phoneNumber, false, '', '', approvalDoc, event.data.id, 'newUser')
                    if (result != 'done') errorsString += `${result}\n`
                }
            }

            const indisMap = data.individualsMap
            if (indisMap != null && indisMap != undefined) {
                const indisMapObject: Map<string, any> = new Map(Object.entries(indisMap));
                for (const tentativelyBrokerId of indisMapObject.keys()) {
                    const indiMap = indisMapObject.get(tentativelyBrokerId)
                    if (indiMap != null && indiMap != undefined) {
                        const indiMapObject: Map<string, any> = new Map(Object.entries(indiMap));
                        const tentativelyBrokerNumber = indiMapObject.get('number')
                        const privatelyApprovedMap = indiMapObject.get('privatelyApproved')
                        if (privatelyApprovedMap != null && privatelyApprovedMap != undefined && tentativelyBrokerNumber != null && tentativelyBrokerNumber != undefined && tentativelyBrokerNumber != '') {
                            const privatelyApprovedObject: Map<string, any> = new Map(Object.entries(privatelyApprovedMap));
                            if (privatelyApprovedObject.get(triggerData.phoneNumber) == '') {
                                let result: string = await executeAddingPrivately(approvalDoc.id, triggerData.phoneNumber, true, tentativelyBrokerId, tentativelyBrokerNumber, approvalDoc, event.data.id, 'newUser')
                                if (result != 'done') errorsString += `${result}\n`
                            }
                        }

                    }
                }
            }

        }

        console.log(`Errors if any: ${errorsString}`)
    } catch (e) {
        console.log(`Error 2: ${e!.toString()}`)
    }

    return
});

export const executeAddingPrivately = async (
    cId: string,
    applicantNumber: string, //applicantId: string, applicantName: string,
    throughBroker: boolean, brokerId: string, brokerNumber: string,// brokerName: string,
    approvalDocFromParent: FirebaseFirestore.DocumentData | undefined,
    applicantIdFromParent: string,
    triggerNewUserOrApprovalDoc: string,
): Promise<string> => {
    try {
        if (cId == '' || cId == undefined || cId == null) return 'Error: cId missing';
        if (applicantNumber == '' || applicantNumber == undefined || applicantNumber == null) return 'Error: applicantNumber missing';
        if (throughBroker) {
            if (brokerId == '' || brokerId == null || brokerId == undefined) return 'Error: brokerId missing'
            if (brokerNumber == '' || brokerNumber == null || brokerNumber == undefined) return 'Error: brokerId missing'
        }

        const db: FirebaseFirestore.Firestore = admin.firestore();

        let applicantId: string = ''
        if (applicantIdFromParent == undefined || applicantIdFromParent == null || applicantIdFromParent == '') {
            applicantId = await getUserIdFromNumber(applicantNumber)
        } else {
            applicantId = applicantIdFromParent
        }

        if (applicantId == '' || applicantId == null || applicantId == undefined) {
            console.log('NOT ERROR: user not found from auto generated collec (must be a privately added number yet to join)')
            return 'NOT ERROR: user not found from auto generated collec (must be a privately added number yet to join)'
        }

        let approvalDoc

        if (approvalDocFromParent != undefined && approvalDocFromParent != null) {
            approvalDoc = approvalDocFromParent
        } else {
            approvalDoc = await db.collection('auctionApprovals').doc(cId).get();
        }

        const approvalData = approvalDoc.data()

        if (!approvalDoc.exists || approvalData == null || approvalData == undefined) return 'Error: approval doc does not exist'

        // if (individualsMap == null || individualsMap == undefined) return 'Error: individuals map does not exist'
        let indisMapsObject: Map<string, any> = new Map();

        const individualsMap = approvalData.individualsMap
        if (individualsMap != null && individualsMap != undefined) {
            indisMapsObject = new Map(Object.entries(individualsMap));
        }

        if (throughBroker) {
            // check for errors:

            const brokerMap = indisMapsObject.get(brokerId)
            if (brokerMap == null || brokerMap == undefined) return `Error: through broker but broker is absent in individualsMap (companyId: ${cId}, brokerId: ${brokerId}, applicantId: ${applicantId})`

            const brokerMapObject: Map<string, any> = new Map(Object.entries(brokerMap));
            if (brokerMapObject.get('applicationStatus') != 'approved' || brokerMapObject.get('approvedBroker') != true)
                return `Error: through broker but broker is either not approved or 'approvedBroker' is not true (companyId: ${cId}, brokerId: ${brokerId}, applicantId: ${applicantId})`

            const privatelyApprovedMap = brokerMapObject.get('privatelyApproved')
            if (privatelyApprovedMap == null || privatelyApprovedMap == undefined)
                return `Error: through broker but privatelyApproved map of this broker in auc is absent (companyId: ${cId}, brokerId: ${brokerId}, applicantId: ${applicantId})`
            const privatelyApprovedObject: Map<string, any> = new Map(Object.entries(privatelyApprovedMap));

            if (privatelyApprovedObject.get(applicantNumber) == null || privatelyApprovedObject.get(applicantNumber) == undefined)
                return `Error: through broker but applicantId is not present in privatelyApproved of broker object (companyId: ${cId}, brokerId: ${brokerId}, applicantId: ${applicantId})`
            // error checking done

            const brResDoc = await approvalDoc.ref.collection('brokerResponses').doc(applicantId).get()
            let historyStr = ''
            if (triggerNewUserOrApprovalDoc == 'newUser') {
                historyStr = `Added on ${getDateTimeString(Date.now())} (IST) when the bidder joined Khoj as they were pre-approved (privately) by broker (broker number ${brokerNumber})`
            } else if (triggerNewUserOrApprovalDoc == 'approvalDoc') {
                historyStr = `Added on ${getDateTimeString(Date.now())} (IST) by broker (broker number ${brokerNumber})`
            }

            if (!brResDoc.exists) {
                // networkMap = new Map(Object.entries(networkLConst))
                // let networkMapForUploading = Array.from(networkMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                // if (networkMapForUploading != null && networkMapForUploading != undefined) {
                //      companyDocDataMap.set('networkLinks', networkMapForUploading)
                // }
                try {


                    let bMap: Map<string, any> = new Map()
                    bMap.set('status', 'approved')
                    bMap.set('brokerNumber', brokerNumber)
                    bMap.set('history', [historyStr])
                    bMap.set('respondedAt', Date.now())

                    const bMapForUploading = Array.from(bMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                    let bMapOuter: Map<string, any> = new Map()
                    bMapOuter.set(brokerId, bMapForUploading)
                    const bMapOuterForUploading = Array.from(bMapOuter).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});



                    await brResDoc.ref.set({
                        'applicantNumber': applicantNumber,
                        'brokerIds': [brokerId],
                        'brokers': bMapOuterForUploading,
                        // {
                        //     [brokerId]: {
                        //         // 'brokerName': brokerName,
                        //         'brokerNumber': brokerNumber,
                        //         'status': 'approved',
                        //         'history': [`Auto-approved on ${getDateTimeString(Date.now())} when the bidder joined Khoj as they were earlier privately added by broker`]
                        //     }
                        // }
                    })
                } catch (e) {
                    console.log(`Error execute1: ${e!.toString()}`)
                    return `Error execute1: ${e!.toString()}`
                }
            } else {
                let needToUpdateRespondedAt: boolean = false
                try {
                    const brResDocData = brResDoc.data()
                    const brokers = brResDocData.brokers
                    if (brokers != null && brokers != undefined) {
                        const brokersMapObject: Map<string, any> = new Map(Object.entries(brokers));
                        needToUpdateRespondedAt = brokersMapObject.get(brokerId) == null || brokersMapObject.get(brokerId) == undefined
                    }
                } catch (e) {
                    console.log(`Error execute6: ${e!.toString()}`)
                    return `Error execute6: ${e!.toString()}`
                }
                try {
                    const p = `brokers.${brokerId}`
                    const pHistory = `${p}.history`
                    const pBrokerNumber = `${p}.brokerNumber`
                    const pStatus = `${p}.status`
                    const pRespondedAt = `${p}.respondedAt`

                    if (needToUpdateRespondedAt) {
                        await brResDoc.ref.update({
                            'applicantNumber': applicantNumber,
                            'brokerIds': admin.firestore.FieldValue.arrayUnion(brokerId),
                            [pStatus]: 'approved',
                            [pBrokerNumber]: brokerNumber,
                            [pHistory]: admin.firestore.FieldValue.arrayUnion(historyStr),
                            [pRespondedAt]: Date.now(),
                        })
                    } else {
                        await brResDoc.ref.update({
                            'applicantNumber': applicantNumber,
                            'brokerIds': admin.firestore.FieldValue.arrayUnion(brokerId),
                            [pStatus]: 'approved',
                            [pBrokerNumber]: brokerNumber,
                            [pHistory]: admin.firestore.FieldValue.arrayUnion(historyStr),
                        })
                    }
                } catch (e) {
                    console.log(`Error execute2: ${e!.toString()}`)
                    return `Error execute2: ${e!.toString()}`
                }
            }

            try {
                const path = `individualsMap.${brokerId}.privatelyApproved.${applicantNumber}`
                await approvalDoc.ref.update({ [path]: applicantId })
            } catch (e) {
                console.log(`Error execute3: ${e!.toString()}`)
                return `Error execute3: ${e!.toString()}`
            }
        } else {
            const applicantMap = indisMapsObject.get(applicantId)
            if (applicantMap != null && applicantMap != undefined) return `Error: host added privately; applicantId map already present so cannot add privately now (companyId: ${cId}, applicantId: ${applicantId})`

            const privatelyAddedByHostNumbersIdsMap = approvalData.privatelyAddedByHostNumbersIds

            if (privatelyAddedByHostNumbersIdsMap == null || privatelyAddedByHostNumbersIdsMap == undefined) return `Error: host added privately; privatelyAddedByHostNumbersIdsMap is absent (companyId: ${cId}, applicantId: ${applicantId})`

            const privatelyAddedByHostNumbersIdsObject: Map<string, any> = new Map(Object.entries(privatelyAddedByHostNumbersIdsMap));
            const applicantIdInMap = privatelyAddedByHostNumbersIdsObject.get(applicantNumber)

            if (applicantIdInMap == null || applicantIdInMap == undefined) return `Error: host added privately; value for applicantId inprivatelyAddedByHostNumbersIdsMap is null/undefined but it should be a blank string (companyId: ${cId}, applicantId: ${applicantId})`
            if (applicantIdInMap != '') return `Error: host added privately; value for applicantId inprivatelyAddedByHostNumbersIdsMap is null/undefined but it should be a blank string (companyId: ${cId}, applicantId: ${applicantId})`

            let historyStr = ''
            if (triggerNewUserOrApprovalDoc == 'newUser') {
                historyStr = `Added on ${getDateTimeString(Date.now())} (IST) when the bidder joined Khoj as they were pre-approved (privately) by the host`
            } else if (triggerNewUserOrApprovalDoc == 'approvalDoc') {
                historyStr = `Added on ${getDateTimeString(Date.now())} (IST) by host`
            }

            // const pathName = `individualsMap.${applicantId}.name`
            const p = `individualsMap.${applicantId}`

            const pathAppStatus = `${p}.applicationStatus`
            const pathNumber = `${p}.number`
            const pathPrivatelyAddedByHost = `${p}.privatelyAddedByHost`
            const pathUserId = `${p}.userId`
            const pathAppliedAt = `${p}.appliedAt`
            const pathHistory = `${p}.companyHistory`
            const pathToCloseExecute = `privatelyAddedByHostNumbersIds.${applicantNumber}`

            try {
                console.log(`applicantNumber: ${applicantNumber}, applicantId: ${applicantId}, historyStr: ${historyStr}`)

                await approvalDoc.ref.update({
                    [pathAppStatus]: 'approved',
                    [pathAppliedAt]: Date.now(),
                    [pathNumber]: applicantNumber,
                    [pathPrivatelyAddedByHost]: true,
                    [pathUserId]: applicantId,
                    [pathToCloseExecute]: applicantId,
                    [pathHistory]: admin.firestore.FieldValue.arrayUnion(historyStr)
                })
            } catch (e) {
                console.log(`Error execute4: ${e!.toString()}`)
                return `Error execute4: ${e!.toString()}`
            }
        }

        return 'done'

    } catch (e) {
        console.log(`Error execute5: ${e!.toString()}`)
        return `Error execute5: ${e!.toString()}`
    }
}

export const getUserIdFromNumber = async (num: string): Promise<string> => {
    if (num == '') return ''

    const db: FirebaseFirestore.Firestore = admin.firestore();
    const q = await db.collection('testUsersAutoGenerated').where('phoneNumber', '==', num).get()
    if (q.docs.length == 1) return q.docs[0].id

    return ''
}

export const getKeysWhereValuesEmpty = (m: any): string[] => {
    let result: string[] = []

    if (m != null && m != undefined) {
        const mObj: Map<string, any> = new Map(Object.entries(m));

        for (const num of mObj.keys()) {
            const _id = mObj.get(num)
            if (_id == '') result.push(num)
        }
    }

    return result
}


/*
approvalDocument on changed:
- check all privatelyAddedByHostNumbersIds where value (userId) is ''
- check all individualsMap > mapOfApplicant > privatelyApproved where value (userId) is ''

userAuto on created:
- for all approvalDocs, check only for the same things but only for this number
*/


/*

possibilities:
- new user created whose number already exists in approvalDoc > privatelyAddedByHostNumbersIds
- new user created whose number already exists in approvalDoc > mapOfApplicant > privatelyApproved

- new number added in approvalDoc > privatelyAddedByHostNumbersIds (do something only if the user exists)
- new number added in approvalDoc > mapOfApplicant > privatelyApproved (do something only if the user exists)

variables needed:
- for privatelyAddedByHostNumbersIds: cid, applicantId, applicantNumber, applicantName,
- for privatelyApproved (added by broker): cid, applicantId, applicantNumber, applicantName, brokerId, brokerNumber

*/


// new user triggered
// get all approval docs. for each: 
//   check if privatelyAddedByHost contains that applicantNumber (and execute)
//   check indisMap to see if any broker privately invited that applicantNumber (and execute)

// approval doc update triggered
//   check privatelyAddedByHost all applicantNumbers where value is missing (and execute)
//   check indisMap all to see if any broker privately invited that applicantNumber where value is missing (and execute)


// if (data != null && data != undefined && data.individualsMap != null && data.individualsMap != undefined) {
//     const individualsMap = data.individualsMap!
//     const individualsMapObject: Map<string, any> = new Map(Object.entries(individualsMap));
//     const applicantKeys = Array.from(individualsMapObject.keys())

//     try {
//         console.log(`${triggerData.phoneNumber} 03 for cId ${approvalDoc.id}`)

//         for (const tentativelyBrokerKey of applicantKeys) {
//             const indiMap = individualsMapObject.get(tentativelyBrokerKey)
//             // console.log(`${triggerData.phoneNumber} 04 for cId ${doc.id} > brokerKey ${tentativelyBrokerKey}`)

//             if (indiMap != null && indiMap != undefined && indiMap.applicationStatus == 'approved' && indiMap.approvedBroker == true) {
//                 console.log(`${triggerData.phoneNumber} 04 for cId ${approvalDoc.id} > brokerKey ${tentativelyBrokerKey} is an approved broker`)

//                 const indiMapObject: Map<string, any> = new Map(Object.entries(indiMap));
//                 // const indiParameterKeys = Array.from(indiMapObject.keys())
//                 const tentativelyBrokerName = indiMapObject.get('name') ?? '';
//                 const tentativelyBrokerNumber = indiMapObject.get('number') ?? '';
//                 try {
//                     if (indiMapObject.get('privatelyApproved') != null && indiMapObject.get('privatelyApproved') != undefined) {
//                         const privatelyApprovedObject: Map<string, any> = new Map(Object.entries(indiMapObject.get('privatelyApproved')))!;
//                         const privatelyApprovedKeys = Array.from(privatelyApprovedObject.keys())

//                         for (const num of privatelyApprovedKeys) {
//                             try {
//                                 if (num == triggerData.phoneNumber && privatelyApprovedObject.get(num) == '') {
//                                     // newly joined user whose broker approval docs need to be created

//                                     const newUserId = event.data.id
//                                     const brResDoc = await approvalDoc.ref.collection('brokerResponses').doc(newUserId).get()
//                                     if (!brResDoc.exists) {
//                                         // const companyDocDataMap: Map<string, any> = new Map(Object.entries(companyDocData))
//                                         // let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
//                                         try {
//                                             await brResDoc.ref.set(
//                                                 {
//                                                     'applicantNumber': triggerData.phoneNumber,
//                                                     'brokerIds': [tentativelyBrokerKey],
//                                                     'brokers': {
//                                                         [tentativelyBrokerKey]: {
//                                                             'brokerName': tentativelyBrokerName,
//                                                             'brokerNumber': tentativelyBrokerNumber,
//                                                             'status': 'approved',
//                                                             'history': ['Auto-approved when the bidder joined Khoj as they were privately added by broker']
//                                                         }
//                                                     }
//                                                 }
//                                             )
//                                         } catch (e) {
//                                             console.log(`Error 6: ${e!.toString()}`)
//                                         }
//                                     } else {
//                                         try {
//                                             const path = `brokers.${tentativelyBrokerKey}`
//                                             const pathForHistory = `${path}.history`
//                                             await brResDoc.ref.update({
//                                                 'applicantNumber': triggerData.phoneNumber,
//                                                 'brokerIds': admin.firestore.FieldValue.arrayUnion([tentativelyBrokerKey]),
//                                                 [path]: {
//                                                     'brokerName': tentativelyBrokerName,
//                                                     'brokerNumber': tentativelyBrokerNumber,
//                                                     'status': 'approved',
//                                                 },
//                                                 [pathForHistory]: admin.firestore.FieldValue.arrayUnion(
//                                                     `Auto-approved on ${getDateTimeString(Date.now())} when the bidder joined Khoj as earlier they were privately added by the broker ${tentativelyBrokerNumber}`
//                                                 ),
//                                             })
//                                         } catch (e) {
//                                             console.log(`Error 7: ${e!.toString()}`)
//                                         }
//                                     }

//                                     try {
//                                         const path = `individualsMap.${tentativelyBrokerKey}.privatelyApproved.${triggerData.phoneNumber}`
//                                         await approvalDoc.ref.update({ [path]: event.data.id })
//                                     } catch (e) {
//                                         console.log(`Error 9: ${e!.toString()}`)
//                                     }
//                                 }
//                             } catch (e) {
//                                 console.log(`Error 5: ${e!.toString()}`)
//                             }
//                         }
//                     }
//                 } catch (e) {
//                     console.log(`Error 4: ${e!.toString()}`)
//                 }
//             }
//         }
//     } catch (e) {
//         console.log(`Error 3: ${e!.toString()}`)
//     }
// }