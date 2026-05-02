import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import {
    // getCommon, getContactsArrayFromUserId,
    // getFirstCompanyIdFromUserID, 
    logError,
    restrictedNumbersList,
    numbersToExcludeFromEmployeesCount,
    superAdmins,
    findAdded,
    // updateMutualsInAuctionApprovals
} from "..";

export const premium_actions_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`premiumActions/{docId}`).onWrite(async (change, context) => {
    try {
        const dataAfter = change.after.data()
        if (dataAfter == null ||
            dataAfter == undefined ||
            dataAfter.userNumber == null ||
            dataAfter.userNumber == undefined ||
            dataAfter.userId == undefined ||
            dataAfter.userId == null ||
            (
                (dataAfter.giveAccessList == null ||
                    dataAfter.giveAccessList == undefined ||
                    dataAfter.giveAccessList.length == 0) &&
                (dataAfter.removeAccessList == null ||
                    dataAfter.removeAccessList == undefined ||
                    dataAfter.removeAccessList.length == 0)
            ) ||
            dataAfter.mil == null ||
            dataAfter.mil == undefined ||
            dataAfter.status != 'pending'
        ) {
            return;
        }

        let historyStr: string[] = []

        try {

            const db: FirebaseFirestore.Firestore = admin.firestore()

            const userInfoDoc = await db.collection('testCollectionUsers').doc(dataAfter.userId).collection('userInfo').doc('userInfo').get()

            if (userInfoDoc == null || userInfoDoc == undefined || !userInfoDoc.exists) {
                await change.after.ref.update({
                    'status': 'done',
                    'historyList': admin.firestore.FieldValue.arrayUnion('userInfo doc does not exist'),
                    'error': true
                });
                return;
            }

            const m = {
                'callCompanyPremium': false,
                'newsPremium': false,
                'ratesPremium': false,
                'internationalPremium': true,
                'chartsPremium': false,
                'auctionsPremium': true,
                'mutualsPremium': true,
            }

            try {
                const give: string[] = dataAfter.giveAccessList ?? []
                const remove: string[] = dataAfter.removeAccessList ?? []
                const mMap: Map<string, any> = new Map(Object.entries(m));

                try {
                    for (const accessStr of mMap.keys()) {
                        const permissibleBool: boolean = mMap.get(accessStr)!

                        if (give.includes(accessStr)) {
                            try {
                                await userInfoDoc.ref.update({ [accessStr]: permissibleBool ? true : admin.firestore.FieldValue.delete() })
                                historyStr.push(`Added access for ${accessStr}`)
                            } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///08///${e.toString()}`) }
                        } else if (remove.includes(accessStr)) {
                            try {
                                await userInfoDoc.ref.update({ [accessStr]: permissibleBool == false ? false : admin.firestore.FieldValue.delete() })
                                historyStr.push(`Removed access for ${accessStr}`)
                            } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///09///${e.toString()}`) }
                        }
                    }

                    try {
                        await change.after.ref.update({
                            'status': 'done',
                            'historyList': admin.firestore.FieldValue.arrayUnion(...historyStr)
                        })

                        try {
                            if (give.length > 0 && 1 > 2) {
                                await prepareNotification(dataAfter.userId, dataAfter.userNumber)
                            }

                        } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///09///${e.toString()}`) }

                    } catch (e) {
                        if (e instanceof Error) await logError(`premium_actions_export///01///${e.toString()}`)

                        await change.after.ref.update({
                            'error': true,
                            'status': 'done',
                            'historyList': admin.firestore.FieldValue.arrayUnion(...historyStr)
                        })
                    }
                } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///06///${e.toString()}`) }
            } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///05///${e.toString()}`) }
        } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///04///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///03///${e.toString()}`) }
    return
});


export const prepareNotification = async (
    // queries: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[], 
    // myOwnNumber: string,
    userId: string,
    userNumber: string,
) => {
    try {
        if (userNumber == null || userNumber == undefined || userNumber == '' || restrictedNumbersList.includes(userNumber)) {
            return `Notifying userId ownNumber NA/restricted so returning`;
        }

        const db: FirebaseFirestore.Firestore = admin.firestore()
        const userCollec = db.collection('testCollectionUsers')

        let nameGivenByPremiumUser = ''

        const premiumUserDoc = await userCollec.doc(userId).get();
        try {
            const premUserData = premiumUserDoc.data()
            if (premUserData!.name != undefined && premUserData!.name != null && premUserData!.name.length > 3) nameGivenByPremiumUser = premUserData!.name
        } catch (e) { }

        const userDocs = await userCollec.where('contactsArrayFresh', 'array-contains', userNumber).get()

        for (const userDoc of userDocs.docs) {
            const userDocData = userDoc.data()

            const friendNumber = userDocData.ownNumber
            if (friendNumber == null || friendNumber == undefined || friendNumber == '' || friendNumber == userNumber ||
                restrictedNumbersList.includes(friendNumber) ||
                numbersToExcludeFromEmployeesCount.includes(friendNumber) ||
                superAdmins.includes(friendNumber)
            ) {
                // do nothing
            } else {
                let token = '';
                let userName = '';

                // token
                try {
                    const deviceInfo = userDocData.deviceInfo
                    if (deviceInfo != null && deviceInfo != undefined && deviceInfo.token != undefined) token = deviceInfo.token
                } catch (e) {
                    // if (e instanceof Error) await logError(`users_notify_friends///11///${e.toString()}`) 
                }

                // userName
                try {
                    const userContactDoc = await userDoc.ref.collection('userInfo').doc('contacts').get()

                    if (userContactDoc.exists) {
                        const userContactDocData = userContactDoc.data()
                        if (userContactDocData != null && userContactDocData != undefined) {
                            const conatactsMap = userContactDocData.contactsMap
                            if (conatactsMap != undefined && conatactsMap != null) {
                                const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
                                const userNameTemp = conatactsMapObject.get(userNumber)
                                if (userNameTemp != null && userNameTemp != undefined && userNameTemp != '') {
                                    userName = userNameTemp
                                }
                            }
                        }
                    }
                } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///13///${e.toString()}`) }

                if (userName == null || userName == undefined || userName == '') {
                    userName = nameGivenByPremiumUser
                }

                if (userName == null || userName == undefined || userName == '') {
                    console.log(`ownNumber ${userNumber}: Will try for userName NA, friendNumber: ${friendNumber}`)

                    try {
                        await db.collection('notifications').add({
                            'tokens': [],
                            'title': `*${userNumber}* upgraded to a premium plan on Khoj`,
                            'body': `*${userNumber}* खोज के प्रीमियम प्लान में जुड़े`,
                            'status': 'pending',
                            'createdAt': Date.now(),
                            'createdAtForIndexing': Date.now(),
                            'source': 'userCreatedWithoutName',
                            'userNumbers': [friendNumber],
                            'destinationNumber': userNumber,

                        })

                    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///14///${e.toString()}`); }
                } else {
                    console.log(`ownNumber ${userNumber}: Will try for userName: ${userName}, friendNumber: ${friendNumber}`)

                    try {
                        await db.collection('notifications').add({
                            'tokens': [token],
                            'title': `*${userName}* (${userNumber}) upgraded to a premium plan on Khoj`,
                            'body': `*${userName}* (${userNumber}) खोज के प्रीमियम प्लान में जुड़े`,
                            'status': 'pending',
                            'createdAt': Date.now(),
                            'createdAtForIndexing': Date.now(),
                            'source': 'userCreatedWithName',
                            'userNumbers': [friendNumber],
                            'destinationNumber': userNumber,
                        })

                    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///15///${e.toString()}`) }
                }
            }
        }
        return;
    } catch (e) {
        if (e instanceof Error) {
            logError(`findAdded///02///${e.toString()}`)
        }
    }
    return
}


export const premium_google_purchases_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 30, memory: '1GB' }).firestore.document(`premiumGooglePurchases/{docId}`).onWrite(async (change, context) => {
    try {
        // const d = change.data()
        const d = change.after.data()
        if (d == null ||
            d == undefined ||
            d.userNumber == null ||
            d.userNumber == undefined ||
            d.userNumber == '' ||
            d.userId == undefined ||
            d.userId == null ||
            d.userId == '' ||
            d.productId == null ||
            d.productId == undefined ||
            d.productId == '' ||
            d.status != 'purchased'
        ) {
            console.log(`Returning 01`)
            return;
        }

        let giveAccessList: string[] = []

        if (d.productId.startsWith('bronze')) {
            giveAccessList = ['ratesPremium', 'newsPremium', 'chartsPremium']
        } else if (d.productId.startsWith('silver')) {
            giveAccessList = ['ratesPremium', 'newsPremium', 'chartsPremium', 'mutualsPremium', 'callCompanyPremium']
        } else if (d.productId.startsWith('gold')) {
            giveAccessList = ['ratesPremium', 'newsPremium', 'chartsPremium', 'mutualsPremium', 'callCompanyPremium', 'internationalPremium']
        } else if (d.productId.startsWith('diamond')) {
            giveAccessList = ['ratesPremium', 'newsPremium', 'chartsPremium', 'mutualsPremium', 'callCompanyPremium', 'internationalPremium']
        }

        const db: FirebaseFirestore.Firestore = admin.firestore()
        await db.collection('premiumActions').add({
            historyList: ['Requested automatically'],
            mil: Date.now(),
            status: 'pending',
            sourceStr: 'automatic',
            userId: d.userId,
            userNumber: d.userNumber,
            giveAccessList: giveAccessList,
        })

        // if (d.productDetails != null && d.productDetails != undefined) {
        //     const pd = d.productDetails
        //     const pdm: Map<string, any> = new Map(Object.entries(pd));
        //     pdm.get('description')
        //     pdm.get('title')
        //     pdm.get('currencySymbol')
        //     pdm.get('currencyCode')
        //     pdm.get('price')
        //     pdm.get('rawPrice')
        // }
    } catch (e) { if (e instanceof Error) await logError(`premium_actions_export///03///${e.toString()}`) }
    return
});


export const interested_in_news_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`random/interestedInNews`).onWrite(async (change, context) => {
    try {
        const dataA = change.after.data()
        const dataB = change.before.data()
        if (dataA == null ||
            dataA == undefined ||
            dataB == undefined ||
            dataB == undefined) {
            return;
        }

        // interestedInUpgrades, interestedInRates, interestedInNews, interestedInMutuals, interestedInForeign, interestedInCharts, interestedInCallCompany
        const a1 = dataA.interestedInUpgrades
        const b1 = dataB.interestedInUpgrades
        const a2 = dataA.interestedInRates
        const b2 = dataB.interestedInRates
        const a3 = dataA.interestedInNews
        const b3 = dataB.interestedInNews
        const a4 = dataA.interestedInMutuals
        const b4 = dataB.interestedInMutuals
        const a5 = dataA.interestedInForeign
        const b5 = dataB.interestedInForeign
        const a6 = dataA.interestedInCharts
        const b6 = dataB.interestedInCharts
        const a7 = dataA.interestedInCallCompany
        const b7 = dataB.interestedInCallCompany

        let n1 = getAddedNums(a1, b1)
        let n2 = getAddedNums(a2, b2)
        let n3 = getAddedNums(a3, b3)
        let n4 = getAddedNums(a4, b4)
        let n5 = getAddedNums(a5, b5)
        let n6 = getAddedNums(a6, b6)
        let n7 = getAddedNums(a7, b7)

        let nAll = n1.concat(n2, n3, n4, n5, n6, n7)

        console.log(`nAll: ${nAll.length}`)

        nAll = [...new Set(nAll)]

        if (nAll.length > 10) {
            console.log('Error: found more than 10 so returning')
            return;
        }

        const db: FirebaseFirestore.Firestore = admin.firestore()

        const upgradedNumbersDoc = await db.collection('random').doc('upgradedNumbers').get()
        if (!upgradedNumbersDoc.exists) {
            console.log('Error: random collec > upgradedNumbers doc not found')
            return
        }

        const ob: Map<string, any> = new Map(Object.entries(upgradedNumbersDoc.get('upgradedNumbersMap')));
        let upgradedNums = Array.from(ob.keys())

        // const upgradedNums = upgradedNumbersDoc.data()!.upgradedNumbers
        // if (upgradedNums.length == 0) {
        //     console.log('Error: random collec > upgradedNumbers > upgradedNumbers is empty')
        //     return
        // }

        const usersCollec = db.collection('testCollectionUsers')

        for (const n of nAll) {
            const interestedUserQ = await usersCollec.where('ownNumber', '==', n).get()
            console.log(`Found ${interestedUserQ.docs.length} with ownNumber ${n}`)
            try {
                let premiumFriendsOfInterstedPerson = []
                const contactsDoc = await interestedUserQ.docs[0].ref.collection('userInfo').doc('contacts').get()
                const data = contactsDoc.data()
                const conatactsMap = data!.contactsMap

                if (conatactsMap != undefined && conatactsMap != null) {
                    const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
                    const contactsMapKeys = Array.from(conatactsMapObject.keys())
                    console.log(`Found ${contactsMapKeys.length} contacts of ${n}`)

                    for (const upgradedNum of upgradedNums) {
                        if (contactsMapKeys.includes(upgradedNum)) {
                            const name = conatactsMapObject.get(upgradedNum)
                            const s = `${name}///${upgradedNum}`
                            premiumFriendsOfInterstedPerson.push(s)
                        }
                    }
                    console.log(`Found ${premiumFriendsOfInterstedPerson.length} premium friends of ${n}`)

                }

                await db.collection('randomMutualsForInterestedIn').doc(n).set({ mutuals: premiumFriendsOfInterstedPerson })

            } catch (e) { if (e instanceof Error) await logError(`interested_in_news_export///02///${e.toString()}`) }
        }

    } catch (e) { if (e instanceof Error) await logError(`interested_in_news_export///01///${e.toString()}`) }
    return
});



export const upgraded_numbers_export = functions.region('asia-south1').runWith({ maxInstances: 3, timeoutSeconds: 540, memory: '8GB' }).firestore.document(`random/upgradedNumbers`).onWrite(async (change, context) => {
    try {
        const dataA = change.after.data()
        const dataB = change.before.data()
        if (dataA == null ||
            dataA == undefined ||
            dataB == undefined ||
            dataB == undefined) {
            return;
        }

        const oa: Map<string, any> = new Map(Object.entries(dataA.upgradedNumbersMap));
        let numsAfter = Array.from(oa.keys())

        let ob: Map<string, any> = new Map(Object.entries(dataB.upgradedNumbersMap));
        let numsBefore = Array.from(ob.keys())

        const addedList = findAdded(numsBefore, numsAfter)

        if (addedList.length > 0) {
            for (const n of addedList) {
                const userDocs = await admin.firestore().collection('testCollectionUsers').where('ownNumber', '==', n).get()
                if (userDocs.docs.length > 0) {
                    const doc = userDocs.docs[0]
                    let name = ''
                    let companyName = ''
                    try {
                        name = doc.get('name') ?? '';
                    } catch (e) { }
                    try {
                        const companyIdArray = doc.get('companyIdArray');
                        const cid = companyIdArray[0]
                        const cDoc = await admin.firestore().collection('companiesV2').doc(cid).get()
                        companyName = cDoc.data()?.name ?? ''
                        try {
                            const cCity = cDoc.data()?.actualCity ?? ''
                            if (cCity != '' && cCity != null && cCity != undefined) companyName += `, ${cCity}`
                        } catch (e) { }

                    } catch (e) { }
                    const s = `${name}///${companyName}`
                    ob.set(n, s)
                }
            }

            const obForUploading = Array.from(ob).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
            await change.after.ref.update({ upgradedNumbersMap: obForUploading })
        }
    } catch (e) { if (e instanceof Error) await logError(`interested_in_news_export///01///${e.toString()}`) }
    return
});


export const getAddedNums = (cAfter: any, cBefore: any): string[] => {
    try {
        let kAfter: string[] = []
        let kBefore: string[] = []

        let mapAfter: Map<string, any> = new Map
        let mapBefore: Map<string, any> = new Map

        try {
            mapAfter = new Map(Object.entries(cAfter))
            kAfter = Array.from(mapAfter.keys())
        } catch (e) { }

        try {
            mapBefore = new Map(Object.entries(cBefore))
            kBefore = Array.from(mapBefore.keys())
        } catch (e) { }

        const addedList = findAdded(kBefore, kAfter)
        let numbersWithNewMil = []

        // const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
        //   const contactsMapKeys = Array.from(conatactsMapObject.keys())
        //   if (contactsMapKeys != null && contactsMapKeys != undefined && contactsMapKeys.length > 0) {
        //     // console.log(`getContactsArrayFromUserId: 04 found contactsMapKeys for userId ${userId} (len ${contactsMapKeys.length})`)
        //     return contactsMapKeys;
        //   }

        try {
            if (mapAfter != null && mapAfter != undefined && mapBefore != null && mapBefore != undefined)
                for (const numAfter of kAfter) {
                    const milsAfter = mapAfter!.get(numAfter)
                    // const milsAfterArr = Array.from(milsAfter)

                    const milsBefore = mapBefore!.get(numAfter)
                    // const milsBeforeArr = Array.from(milsAfter)

                    if (milsAfter != null && milsAfter != undefined &&
                        milsBefore != null && milsBefore != undefined &&
                        milsAfter!.length > milsBefore!.length) {
                        numbersWithNewMil.push(numAfter)
                    }
                }
        } catch (e) {
            if (e instanceof Error) console.log(`Error getAddedNums: ${e.toString()}`)
        }

        const result = addedList.concat(numbersWithNewMil)

        return result
    } catch (e) {
        if (e instanceof Error) {
            logError(`findAdded///02///${e.toString()}`)
        }
    }
    return []
}
