import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import {
    getCommon, getContactsArrayFromUserId,
    // getFirstCompanyIdFromUserID, 
    logError, updateMutualsInAuctionApprovals
} from "..";

export const notify_approval_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`auctionApprovals/{cId}`).onWrite(async (change, context) => {

    try {
        console.log('started 01')
        const dataAfter = change.after.data()
        if (dataAfter == null ||
            dataAfter == undefined ||
            dataAfter.individualsMap == null ||
            dataAfter.individualsMap == undefined ||
            dataAfter.companyName == undefined ||
            dataAfter.companyName == null ||
            dataAfter.companyName == ''
        ) return;

        const companyName = dataAfter.companyName!;
        console.log(`started 02 ${companyName}`)

        const individualsMapAfter = dataAfter.individualsMap!
        const individualsMapAfterObject: Map<string, any> = new Map(Object.entries(individualsMapAfter));
        if (individualsMapAfterObject == null || individualsMapAfterObject == undefined) return;

        const dataBefore = change.before.data()
        let individualsMapBeforeObject: Map<string, any> = new Map()
        if (dataBefore != null && dataBefore != undefined && dataBefore.individualsMap != null) {
            const individualsMapBefore = dataBefore.individualsMap;
            if (individualsMapBefore != null) {
                individualsMapBeforeObject = new Map(Object.entries(individualsMapBefore));
            }
        }

        let userIdsAfter = Array.from(individualsMapAfterObject.keys())

        let brokerIds: string[] = []
        let allApplicantNumbers: string[] = []

        console.log(`started 03 cIdsAfter length: ${userIdsAfter.length}`)

        let userIdsToNotify = []
        try {
            for (const userIdAfter of userIdsAfter) {
                const individualMapAfter = individualsMapAfterObject.get(userIdAfter)
                if (individualMapAfter != null && individualMapAfter != undefined) {
                    const innerAfter: Map<string, any> = new Map(Object.entries(individualMapAfter));
                    const applicationStatus = innerAfter.get('applicationStatus')
                    const userId = innerAfter.get('userId')
                    const applicantNumber = innerAfter.get('number')
                    const approvedBroker = innerAfter.get('approvedBroker')

                    if (applicantNumber != null && applicantNumber != undefined && applicantNumber != '')
                        allApplicantNumbers.push(applicantNumber)

                    if (applicationStatus == 'approved' && userId != null && userId != undefined && userId != '') {

                        if (approvedBroker == true) {
                            brokerIds.push(userId);
                        }

                        console.log(`started 03.1 ${userId}`)

                        if (individualsMapBeforeObject == null || individualsMapBeforeObject == undefined) {
                            console.log(`started 03.1a ADDING ${userId}`)
                            userIdsToNotify.push(userId)
                        } else {
                            console.log(`started 03.1b`)
                            const individualsMapBefore = individualsMapBeforeObject.get(userId)
                            if (individualsMapBefore == null || individualsMapBefore == undefined) {
                                console.log(`started 03.1b - 01 ADDING ${userId}`)

                                userIdsToNotify.push(userId)
                            } else {
                                console.log(`started 03.1b - 02`)

                                const innerBefore: Map<string, any> = new Map(Object.entries(individualsMapBefore));
                                if (innerBefore == null || innerBefore == undefined || innerBefore.get('applicationStatus') != 'approved') {
                                    console.log(`started 03.1b - 03 ADDING ${userId}`)

                                    userIdsToNotify.push(userId)
                                }
                            }
                        }
                    }
                }
            }

            const db: FirebaseFirestore.Firestore = admin.firestore()
            let usersCollectionString = 'testCollectionUsers';

            try {
                await change.after.ref.update({ 'brokerIds': brokerIds, 'individualNumbers': allApplicantNumbers });

                try {
                    if (brokerIds.length > 0)
                        for (const brokerId of brokerIds) {
                            const bDoc = await db.collection('auctionBrokerApprovals').doc(brokerId).get()

                            if (!bDoc.exists) {
                                const bUserDoc = await db.collection(usersCollectionString).doc(brokerId).get()
                                if (bUserDoc.exists && bUserDoc.data() != null && bUserDoc.data() != undefined) {
                                    const bUserData = bUserDoc.data()!
                                    const brokerName = bUserData.name
                                    const brokerCompanyName = bUserData.companyNameWhileSignUp
                                    const brokerCompanyRegion = bUserData.companyAddress
                                    const brokerNumber = bUserData.ownNumber

                                    await bDoc.ref.set({
                                        brokerId: brokerId,
                                        brokerName: brokerName,
                                        brokerCompanyName: brokerCompanyName,
                                        brokerCompanyRegion: brokerCompanyRegion,
                                        brokerNumber: brokerNumber,
                                    })

                                    // brokerId, brokerName, brokerNumber, brokerCompanyName, brokerCompanyRegion
                                }
                            }
                        }

                } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///91///${e.toString()}`) }

            } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///91///${e.toString()}`) }

            let userTokensToNotify = []
            let userPhonesToNotify = []
            try {
                for (const uIdToNotify of userIdsToNotify) {
                    const userInfoDoc = await db.collection(usersCollectionString).doc(uIdToNotify).collection('userInfo').doc('userInfo').get();

                    if (userInfoDoc != null && userInfoDoc != undefined && userInfoDoc.data() != null && userInfoDoc.data() != undefined) {
                        console.log(`started 04b found userInfo doc`)

                        const userInfoDocData = userInfoDoc.data()!
                        const ownNumber = userInfoDocData.ownNumber

                        if (ownNumber != undefined && ownNumber != null && ownNumber != '') {
                            console.log(`started 04c num: ${ownNumber}`)

                            userPhonesToNotify.push(ownNumber)
                        } else {
                            console.log(`started 04c num NA`)
                        }

                        if (userInfoDocData.deviceInfo != null && userInfoDocData.deviceInfo != undefined) {
                            console.log(`started 04d device info found`)

                            const deviceInfo = userInfoDocData.deviceInfo
                            if (deviceInfo != null && deviceInfo != undefined && deviceInfo.token != undefined && deviceInfo.token != null && deviceInfo.token != '') {
                                console.log(`started 04e token found ${deviceInfo.token}`)
                                userTokensToNotify.push(deviceInfo.token)
                            }
                        } else {
                            console.log(`started 04f device info NA`)
                        }
                    }
                }

                console.log(`started 05 userTokensToNotify length: ${userTokensToNotify.length}`)

                userTokensToNotify = [...new Set(userTokensToNotify)]
                userPhonesToNotify = [...new Set(userPhonesToNotify)]

                console.log(`started 06 userTokensToNotify length: ${userTokensToNotify.length}`)

                try {
                    if (userTokensToNotify.length > 0 || userPhonesToNotify.length > 0)
                        await db.collection('notifications').add({
                            'tokens': userTokensToNotify,
                            'title': `${companyName} approved you for their auctions`,
                            'body': `${companyName} ने आपको ऑक्शन के लिए स्वीकार किया है`,
                            'status': 'pending',
                            'createdAt': Date.now(),
                            'createdAtForIndexing': Date.now(),
                            'source': 'auctionApproved',
                            'userNumbers': userPhonesToNotify,
                            'destinationAuctionHostCompanyId': context.params.cId,
                        })

                    console.log(`started 07 done`)

                } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///04///${e.toString()}`) }
            } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///03///${e.toString()}`) }
        } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///02///${e.toString()}`); }
    } catch (e) { if (e instanceof Error) await logError(`notify_approval_export///01///${e.toString()}`) }

    return
});

export const establish_auction_mutuals_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`auctionApprovals/{companyId}`).onWrite(async (change, context) => {
    try {
        // newly added hostsIds and bidderIds (in individual maps) will be used for establishing mutuals
        const dataAfter = change.after.data()
        if (dataAfter == null ||
            dataAfter == undefined ||
            dataAfter.individualsMap == null ||
            dataAfter.individualsMap == undefined ||
            dataAfter.makeMutuals != true
        ) return;

        // after
        let hostUserIdsAfter: string[] = dataAfter.hostUserIds ?? []
        hostUserIdsAfter.push('N6ubCnyMGOOqR5AsuTmkDI65fWB2')
        // hostUserIdsAfter.push('2Ht3yW6hl9MpQ9KonDTUnTfd3Sq1')
        // hostUserIdsAfter.push('DDe1ixeXspOMdPKQJEvg4fAcd7s1')
        // hostUserIdsAfter.push('dWHEFmVZZtahCOgy9BoSyXv2yK22')
        let approvedBrokerIdsAfter: string[] = dataAfter.approvedBrokerIds ?? []
        const individualsMapAfter = dataAfter.individualsMap!
        const individualsMapAfterObject: Map<string, any> = new Map(Object.entries(individualsMapAfter));
        if (individualsMapAfterObject == null || individualsMapAfterObject == undefined) return;

        let individualIdsAfter = Array.from(individualsMapAfterObject.keys())

        // before
        const dataBefore = change.before.data()
        let individualsMapBeforeObject: Map<string, any> = new Map()
        let hostUserIdsBefore: string[] = []
        let approvedBrokerIdsBefore: string[] = []

        // let approvedBrokerIdsBefore: string[] = []


        if (dataBefore != null && dataBefore != undefined) {
            hostUserIdsBefore = dataBefore.hostUserIds ?? []

            approvedBrokerIdsBefore = dataBefore.approvedBrokerIds ?? []


            const individualsMapBefore = dataBefore.individualsMap;
            if (individualsMapBefore != null && individualsMapBefore != undefined) {
                individualsMapBeforeObject = new Map(Object.entries(individualsMapBefore));
            }
        }
        let individualIdsBefore = Array.from(individualsMapBeforeObject.keys())

        let approvedBrokerIdsNewlyAdded = []
        for (const brId of approvedBrokerIdsAfter) {
            if (!approvedBrokerIdsBefore.includes(brId)) approvedBrokerIdsNewlyAdded.push(brId)
        }

        approvedBrokerIdsNewlyAdded = [... new Set(approvedBrokerIdsNewlyAdded)]

        // newly added bidders
        let newlyAddedIndividualIds: string[] = []
        // let privatelyAdddedIndividualIds: any[] = []
        for (const uIdAfter of individualIdsAfter) {
            if (!individualIdsBefore.includes(uIdAfter) && uIdAfter != null && uIdAfter != undefined && uIdAfter != '') {
                newlyAddedIndividualIds.push(uIdAfter)
            }

            try {
                const indiMap = individualsMapAfterObject.get(uIdAfter)

                if (indiMap != null && indiMap != undefined) {
                    const indiMapObject: Map<string, any> = new Map(Object.entries(indiMap));
                    const privatelyApprovedMap = indiMapObject.get('privatelyApproved')

                    if (privatelyApprovedMap != null && privatelyApprovedMap != undefined) {
                        const privatelyApprovedObject: Map<string, any> = new Map(Object.entries(privatelyApprovedMap));

                        for (const _id of privatelyApprovedObject.values()) {

                            if (_id != null && _id != '' && _id != undefined)
                                newlyAddedIndividualIds.push(_id)
                        }
                    }
                }
            } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///81///${e.toString()}`) }

            if (uIdAfter == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2') console.log(`Starting uid for 997017; newlyAddedIndividualIds.len after privately adding: ${newlyAddedIndividualIds.length}`)

        }

        newlyAddedIndividualIds = [...new Set(newlyAddedIndividualIds)]

        console.log(`Found ${newlyAddedIndividualIds.length} indi IDs (new applicants and all privately added ones): ${newlyAddedIndividualIds}`)

        // newly added hosts
        let newlyAddedHostUserIds = []
        for (const hostUserId of hostUserIdsAfter) {
            if (!hostUserIdsBefore.includes(hostUserId)) {
                newlyAddedHostUserIds.push(hostUserId)
            }
        }

        // update applicantCompanyId for newly added individuals
        // try {
        //     for (const indiId of
        //         // individualIdsAfter
        //         newlyAddedIndividualIds
        //     ) {
        //         const companyId = await getFirstCompanyIdFromUserID(indiId)
        //         if (companyId != '') {
        //             const path = `individualsMap.${indiId}.applicantCompanyId`
        //             await change.after.ref.update({ [path]: companyId })
        //         }
        //     }
        // } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///51///${e.toString()}`) }

        if (newlyAddedIndividualIds.length == 0 && newlyAddedHostUserIds.length == 0 && approvedBrokerIdsAfter.length == 0) {
            console.log('returning as no new individiualIds and no new hostIds')
            return
        }

        try {
            // for (const newlyAddedIndiId of newlyAddedIndividualIds) {
            //     const newlyAddedIndiMap =  individualsMapAfterObject.get(newlyAddedIndiId)
            //     if(newlyAddedIndiMap != null && newlyAddedIndiMap != undefined){

            //     }
            //     const db: FirebaseFirestore.Firestore = admin.firestore();

            // }

        } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///21///${e.toString()}`) }

        // update khoj team numbers to be removed
        let teamNumbersToRemove = []
        try {
            const db: FirebaseFirestore.Firestore = admin.firestore();
            const adDoc = await db.collection('ad').doc('ad').get()
            if (adDoc.exists && adDoc.data() != null && adDoc.data() != undefined) {
                const adDocData = adDoc.data()!
                const adMap = adDocData.ad
                const adMapObject: Map<string, any> = new Map(Object.entries(adMap));

                const listA = adMapObject.get('a')
                const listField = adMapObject.get('field')
                const listLeft = adMapObject.get('left')
                const listS = adMapObject.get('s')

                if (listA != null && listA != undefined) for (const str of listA) teamNumbersToRemove.push(str)
                if (listField != null && listField != undefined) for (const str of listField) teamNumbersToRemove.push(str)
                if (listLeft != null && listLeft != undefined) for (const str of listLeft) teamNumbersToRemove.push(str)
                if (listS != null && listS != undefined) for (const str of listS) teamNumbersToRemove.push(str)
            }
        } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///18///${e.toString()}`) }


        // for newly added individuals
        try {
            for (const indiId of newlyAddedIndividualIds) {
                const newlyAddedIndiContacts: string[] = await getContactsArrayFromUserId(indiId)

                for (const hostId of hostUserIdsAfter) {
                    const hostContacts: string[] = await getContactsArrayFromUserId(hostId)
                    const mutuals: string[] = getCommon(newlyAddedIndiContacts, hostContacts)
                    await updateMutualsInAuctionApprovals(context.params.companyId, indiId, hostId, mutuals, teamNumbersToRemove)
                }

                for (const hostId of approvedBrokerIdsAfter) {
                    const hostContacts: string[] = await getContactsArrayFromUserId(hostId)
                    const mutuals: string[] = getCommon(newlyAddedIndiContacts, hostContacts)
                    await updateMutualsInAuctionApprovals(context.params.companyId, indiId, hostId, mutuals, teamNumbersToRemove)
                }
            }
        } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///13///${e.toString()}`) }

        // for newly added hosts
        let hostsAndBrokers = newlyAddedHostUserIds.concat(approvedBrokerIdsNewlyAdded)
        try {
            for (const hostId of hostsAndBrokers) {
                const hostContacts: string[] = await getContactsArrayFromUserId(hostId)

                for (const indiId of individualIdsAfter) {
                    const indiContacts: string[] = await getContactsArrayFromUserId(indiId)
                    const mutuals: string[] = getCommon(indiContacts, hostContacts)

                    await updateMutualsInAuctionApprovals(context.params.companyId, indiId, hostId, mutuals, teamNumbersToRemove)
                }
            }
        } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///12///${e.toString()}`) }

        // try {
        //     for (const hostId of newlyAddedHostUserIds) {
        //         const hostContacts: string[] = await getContactsArrayFromUserId(hostId)

        //         for (const indiId of individualIdsAfter) {
        //             const indiContacts: string[] = await getContactsArrayFromUserId(indiId)
        //             const mutuals: string[] = getCommon(indiContacts, hostContacts)

        //             await updateMutualsInAuctionApprovals(context.params.companyId, indiId, hostId, mutuals, teamNumbersToRemove)
        //         }
        //     }
        // } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///12///${e.toString()}`) }

        // // for newly added hosts
        // try {
        //     for (const brokerId of approvedBrokerIdsAfter) {
        //         const hostContacts: string[] = await getContactsArrayFromUserId(brokerId)

        //         for (const indiId of individualIdsAfter) {
        //             const indiContacts: string[] = await getContactsArrayFromUserId(indiId)
        //             const mutuals: string[] = getCommon(indiContacts, hostContacts)

        //             await updateMutualsInAuctionApprovals(context.params.companyId, indiId, brokerId, mutuals, teamNumbersToRemove)
        //         }
        //     }
        // } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///12///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`establish_auction_mutuals_export///11///${e.toString()}`) }
    return
});




// export const auction_approval_triggered_export = functions.region('asia-south1').runWith({ maxInstances: 20 }).firestore.document(`auctions/{auctionId}/bids/{bidId}`).onWrite(async (change, context) => {

//     try {
//         const dataAfter = change.data()
//         if (dataAfter == null ||
//             dataAfter == undefined ||
//             dataAfter.bidderUserId == null ||
//             dataAfter.bidderUserId == undefined ||
//             dataAfter.bidderUserId == ''
//         ) return;

//         const db: FirebaseFirestore.Firestore = admin.firestore()

//         const auctionDoc = await db.collection('auctions').doc(context.params.auctionId).get();

//         if (auctionDoc == null ||
//             auctionDoc == undefined ||
//             auctionDoc.data() == null ||
//             auctionDoc.data() == undefined
//         ) return;

//         const auctionDocData = auctionDoc.data()!

//         const hostUserIds = auctionDocData.hostUserIds

//         if (hostUserIds == null || hostUserIds == undefined || hostUserIds.length == 0) return;

//         let usersCollectionString = 'testCollectionUsers';

//         const bidderContactsDoc = await db.collection(usersCollectionString).doc(dataAfter.bidderUserId).collection('userInfo').doc('contacts').get()
//         if (!bidderContactsDoc.exists || bidderContactsDoc == null || bidderContactsDoc.data() == null || bidderContactsDoc.data() == undefined) return;

//         const bidderContactsDocData = bidderContactsDoc.data()!

//         let bidderContacts: string[] = bidderContactsDocData.contactsArrayFresh ?? []

//         if (bidderContacts == null || bidderContacts == undefined) {
//             const bidderContactsMap = bidderContactsDocData.contactsMap
//             if (bidderContactsMap != null && bidderContactsMap != undefined) {
//                 bidderContacts = bidderContactsMap.keys()
//             }
//         }

//         for (const hostUserId of hostUserIds) {
//             const hostContactsDoc = await db.collection(usersCollectionString).doc(hostUserId).collection('userInfo').doc('contacts').get()
//             if (hostContactsDoc.exists && hostContactsDoc.data() != null && hostContactsDoc.data() != undefined &&
//                 hostContactsDoc.data()!.contactsArrayFresh != null && hostContactsDoc.data()!.contactsArrayFresh != undefined
//             ) {
//                 const hostContacts = hostContactsDoc.data()!.contactsArrayFresh!;

//                 let mutuals: string[] = []
//                 for (const hostContact of hostContacts) {
//                     if (bidderContacts.includes(hostContact)) {
//                         mutuals.push(hostContact)
//                     }
//                 }

//                 if(mutuals.length > 0){

//                 }
//             }
//         }

//     } catch (e) { if (e instanceof Error) await logError(`bid_created_export///01///${e.toString()}`) }

//     return
// });