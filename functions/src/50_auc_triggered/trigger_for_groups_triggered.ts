import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { logError } from "..";
// import { brokerOrBidderDetails, commonAucDetails, companyNameFromCompanyDoc, emailFromCompanyDoc, priceQuantityDetailsForFixed } from "../60_auctions/62_bids";
// import { getQuantitySumBetweenFromBids } from "./auc_triggered";
// import { DocumentSnapshot } from "firebase-admin/firestore";

// check triggers for groups
export const auction_triggered_check_group_trigger_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 300, memory: '1GB' }).firestore.document(`auctions/{aucId}`).onWrite(async (change, context) => {
    try {
        console.log(`01 aucId: ${context.params.aucId} new uploading obj`)
        const after = change.after
        const before = change.before

        if (before == undefined || before == null || !before.exists || before.data() == undefined || before.data() == null ||
            after == undefined || after == null || !after.exists || after.data() == undefined || after.data() == null
        ) return

        const afterData = after.data()!

        if (
            afterData.fixedPrice != true || afterData.companyId == null ||
            afterData.companyId == undefined || afterData.companyId == ''
        ) return;

        // let beforePrice: number | undefined = before.data()!.startPricePerMt
        // let afterPrice: number | undefined = afterData.startPricePerMt

        // const testCompanyIds: string[] = ['h2Lp9gOWQQsKfZJbzJen', 'psY1o2JxNta2ZdKn5XVu', 'rOm4LPLa1r7OsvXo9svd', 'vFUshf9BthJlMAjdLZ9w']
        // const isTestCompany: boolean = testCompanyIds.includes(afterData.companyId)

        console.log(`03 aucId: ${context.params.aucId}`)

        const db: FirebaseFirestore.Firestore = admin.firestore()
        const qTrigsRef = db.collection('auctionApprovals')
            .doc(afterData.companyId)
            .collection('auctionTriggers')
            .where('auctionIds', 'array-contains', after.id)
            .where('enabled', '==', true)

        console.log(`04 aucId: ${context.params.aucId}`)

        try {
            const res = await db.runTransaction(async transaction => {
                console.log(`05 aucId: ${context.params.aucId}`)

                // fetch relevant trigger group docs
                const qTrigs = await transaction.get(qTrigsRef)
                console.log(`06 aucId: ${context.params.aucId}`)

                // auctionIds from trigger group docs
                const allAuctionIds = auctionIdsFromTrigGroupQ(qTrigs)
                console.log(`07 aucId: ${context.params.aucId}`)

                // get auctionDoc and bidTotalMt for each auctionId
                // let aucIdAucDoc = new Map<string, DocumentSnapshot>()
                let aucIdBidsReceivedTotalMt = new Map<string, number>()
                let aucIdCurrentPrice = new Map<string, number>()
                let aucIdOriginalPrice = new Map<string, number>()
                for (const aucId of allAuctionIds) {
                    const aucDoc = await transaction.get(db.collection('auctions').doc(aucId))
                    const bidsTotalMt = getBidsReceivedTotalMt(aucDoc)
                    aucIdBidsReceivedTotalMt.set(aucId, bidsTotalMt)
                    try {
                        if (aucDoc.exists && aucDoc.data() != undefined && aucDoc.data() != null) {
                            if (aucDoc.data()!.startPricePerMt != null && aucDoc.data()!.startPricePerMt != undefined) {
                                aucIdCurrentPrice.set(aucId, aucDoc.data()!.startPricePerMt)
                            }
                            if (aucDoc.data()!.originalPricePerMt != null && aucDoc.data()!.originalPricePerMt != undefined) {
                                aucIdOriginalPrice.set(aucId, aucDoc.data()!.originalPricePerMt)
                            }
                        }
                    } catch (e) { console.log('Error in setting price: ', e); }
                }
                console.log(`08 aucId: ${context.params.aucId}; qAuctionTriggerQ.docs.len: ${qTrigs.docs.length}`)

                // go through each trigger group doc
                for (const trigDoc of qTrigs.docs) {
                    console.log(`08a trigDoc: ${trigDoc.id}`)

                    if (trigDoc != undefined && trigDoc.data() != undefined && trigDoc.data().auctionIds != undefined && trigDoc.data().auctionIds != null) {

                        const aucIds = trigDoc.data().auctionIds!
                        console.log(`08b trigDoc: ${trigDoc.id}; aucIds.len: ${aucIds.length}`)

                        // check total of all bids in all relevant aucs for this trigger group
                        const bidsGrandTotal = getTotalBidsOfRelevantAucs(aucIds, aucIdBidsReceivedTotalMt)
                        console.log(`08c trigDoc: ${trigDoc.id}; bidsGrandTotal: ${bidsGrandTotal}`)

                        // get unused qty based trigger objects in this trigger group doc
                        const trigObjects: Map<string, Map<string, any>> = trigObjectsForTotalQtyUnused(trigDoc)

                        // let pricesUpdated: boolean = false
                        let overallForUploading = new Map<string, any>()

                        try {
                            // to do - note: currently only for test
                            // if (isTestCompany) {
                            let aucIdCurrentPriceForThisTrigger = new Map<string, number>()
                            let aucIdOriginalPriceForThisTrigger = new Map<string, number>()
                            try {
                                for (const aucId of aucIdCurrentPrice.keys()) {
                                    if (aucIds.includes(aucId)) {
                                        aucIdCurrentPriceForThisTrigger.set(aucId, aucIdCurrentPrice.get(aucId)!)
                                    }
                                }
                            } catch (e) { console.log(`Error 88: ${e!.toString()}`) }
                            try {
                                for (const aucId of aucIdOriginalPrice.keys()) {
                                    if (aucIds.includes(aucId)) {
                                        aucIdOriginalPriceForThisTrigger.set(aucId, aucIdOriginalPrice.get(aucId)!)
                                    }
                                }
                            } catch (e) { console.log(`Error 89: ${e!.toString()}`) }
                            let aucIdCurrentPriceForThisTriggerForUploading = Array.from(aucIdCurrentPriceForThisTrigger).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                            let aucIdOriginalPriceForThisTriggerForUploading = Array.from(aucIdOriginalPriceForThisTrigger).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                            overallForUploading.set('aucIdCurrentPrices', aucIdCurrentPriceForThisTriggerForUploading)
                            overallForUploading.set('aucIdOriginalPrices', aucIdOriginalPriceForThisTriggerForUploading)
                            overallForUploading.set('bidsTotalMt', bidsGrandTotal)

                            // transaction.update(trigDoc.ref, { 'bidsTotalMt': bidsGrandTotal, 'aucIdCurrentPrices': aucIdCurrentPriceForThisTriggerForUploading, 'aucIdOriginalPrices': aucIdOriginalPriceForThisTriggerForUploading })
                            // }
                        } catch (e) { console.log(`Error 8c: ${e!.toString()}`) }


                        // execute for each trigger object
                        for (const concat of trigObjects.keys()) {
                            console.log(`08d trigDoc: ${trigDoc.id}; processing concat ${concat}`)

                            const trigObj = trigObjects.get(concat)!
                            if (bidsGrandTotal >= trigObj.get('quantityMt')) {
                                // transaction: set: trigDoc > triggersForFixedPriceAuction > concat > used = true
                                // transaction: for each aucIds: stop auctions or increase/decrease price
                                // var d = new Date();
                                // const dateStr = d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })
                                const date = new Date();

                                const options: Intl.DateTimeFormatOptions = {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, timeZone: 'Asia/Kolkata'
                                };

                                const formatter = new Intl.DateTimeFormat('en-IN', options);
                                const formattedDate = formatter.format(date);

                                const path = `triggersForFixedPriceAuction.${concat}.used`

                                overallForUploading.set(path, true)

                                // if (pricesUpdated) {
                                //     transaction.update(trigDoc.ref, { [path]: true })
                                // } else {
                                //     transaction.update(trigDoc.ref, {
                                //         [path]: true,
                                //         'bidsTotalMt': bidsGrandTotal,
                                //         'aucIdCurrentPrices': aucIdCurrentPriceForThisTriggerForUploading,
                                //         'aucIdOriginalPrices': aucIdOriginalPriceForThisTriggerForUploading
                                //     })
                                //     pricesUpdated = true
                                // }

                                if (trigObj.get('stopPurchasing') == true) {
                                    // console.log(`RESULT: Stopping purchasing for ${aucIds.length} auctions in trigDocId ${trigDoc.id} as ${bidsGrandTotal} bid MT >= ${trigObj.get('quantityMt')} trig MT at ${dateStr}`)

                                    let history = `Automatic trigger stopped auction as total quantity ${bidsGrandTotal} MT touched trigger quantity ${trigObj.get('quantityMt')} MT at ${formattedDate}; trigger ID ${trigDoc.id}`

                                    for (const aucId of aucIds) {
                                        transaction.update(db.collection('auctions').doc(aucId), {
                                            closed: true,
                                            'auctionTriggerGroupHistory': admin.firestore.FieldValue.arrayUnion(history),
                                        })
                                    }

                                } else if (trigObj.get('priceChangePerMt') != undefined && trigObj.get('priceChangePerMt') != null) {
                                    // console.log(`RESULT: Changing price by ${trigObj.get('priceChangePerMt')} for ${aucIds.length} auctions in trigDocId ${trigDoc.id} as ${bidsGrandTotal} bid MT >= ${trigObj.get('quantityMt')} trig MT`)

                                    let history = `Automatic trigger changed price by ${trigObj.get('priceChangePerMt')} as total quantity ${bidsGrandTotal} MT touched trigger quantity ${trigObj.get('quantityMt')} MT at ${formattedDate}; trigger ID ${trigDoc.id} `

                                    for (const aucId of aucIds) {
                                        transaction.update(db.collection('auctions').doc(aucId), {
                                            'startPricePerMt': admin.firestore.FieldValue.increment(trigObj.get('priceChangePerMt')),
                                            'auctionTriggerGroupHistory': admin.firestore.FieldValue.arrayUnion(history),
                                        })
                                    }
                                }
                            }
                        }

                        let objForUploading = Array.from(overallForUploading).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                        transaction.update(trigDoc.ref, objForUploading)

                        // if (!pricesUpdated)
                        //     transaction.update(trigDoc.ref, {
                        //         'bidsTotalMt': bidsGrandTotal,
                        //         'aucIdCurrentPrices': aucIdCurrentPriceForThisTriggerForUploading,
                        //         'aucIdOriginalPrices': aucIdOriginalPriceForThisTriggerForUploading
                        //     })

                    }
                }
            });
            console.log('Transaction success', res);
        } catch (e) { console.log('Transaction failure:', e); }

    } catch (e) { if (e instanceof Error) await logError(`auction_triggered_export///01///${e.toString()}`) }
    return
});


export const getTotalBidsOfRelevantAucs = (relevantAucIds: any, aucIdBidsReceivedTotalMt: any): number => {
    let results: number = 0

    for (const aucId of aucIdBidsReceivedTotalMt.keys()) {
        if (relevantAucIds.includes(aucId)) {
            const bidsTotal: number = aucIdBidsReceivedTotalMt.get(aucId)
            results += bidsTotal
        }
    }
    return results
}


export const getBidsReceivedTotalMt = (aucDoc: admin.firestore.DocumentData | undefined): number => {
    let results: number = 0

    if (
        aucDoc != undefined &&
        aucDoc.data() != undefined &&
        aucDoc.data()!.bidsInAuctionDoc != null &&
        aucDoc.data()!.bidsInAuctionDoc != undefined
    ) {
        for (const bidMap of aucDoc.data()!.bidsInAuctionDoc) {
            const bidMapObject: Map<string, any> = new Map(Object.entries(bidMap));
            if (bidMapObject.get('bidQuantityMt') != null && bidMapObject.get('bidQuantityMt') != undefined) {
                results += bidMapObject.get('bidQuantityMt')
            }

        }
    }
    return results
}


export const trigObjectsForTotalQtyUnused = (trigGroupDoc: admin.firestore.DocumentData | undefined): Map<string, Map<string, any>> => {
    let results: Map<string, Map<string, any>> = new Map<string, Map<string, any>>

    if (
        trigGroupDoc != null && trigGroupDoc != undefined &&
        trigGroupDoc!.data().triggersForFixedPriceAuction != null &&
        trigGroupDoc!.data().triggersForFixedPriceAuction != undefined
    ) {
        const trigsMainMap = trigGroupDoc!.data().triggersForFixedPriceAuction!
        const trigsMainObject: Map<string, any> = new Map(Object.entries(trigsMainMap))

        for (const concat of trigsMainObject.keys()) {
            const singleTrigMap = trigsMainObject.get(concat)
            const singleTrigObject: Map<string, any> = new Map(Object.entries(singleTrigMap))

            if (singleTrigObject != undefined &&
                singleTrigObject != null &&
                singleTrigObject.get('used') == false &&
                singleTrigObject.get('triggerFor') == 'Total quantity' &&
                singleTrigObject.get('quantityMt') != null &&
                singleTrigObject.get('quantityMt') != undefined &&
                (
                    (singleTrigObject.get('priceChangePerMt') != null && singleTrigObject.get('priceChangePerMt') != undefined) ||
                    (singleTrigObject.get('stopPurchasing') == true)
                )
            ) {
                results.set(concat, singleTrigObject)
            }
        }
        return results

    }
    return results
}


export const auctionIdsFromTrigGroupQ = (q: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>): string[] => {
    let results: string[] = []

    for (const trigGroupDoc of q.docs) {
        if (
            trigGroupDoc != null && trigGroupDoc != undefined &&
            trigGroupDoc.data() != undefined &&
            trigGroupDoc.data()!.auctionIds != null &&
            trigGroupDoc.data()!.auctionIds != undefined
        ) {
            for (const aucId of trigGroupDoc.data()!.auctionIds) {
                results.push(aucId)
            }

        }
    }

    results = [...new Set(results)]


    return results
}


// export const quantityTotalOfGroupAuctions = async (trigGroupDoc: admin.firestore.DocumentData | undefined): Promise<number> => {
//     let result: number = 0

//     if (
//         trigGroupDoc != null && trigGroupDoc != undefined &&
//         trigGroupDoc!.auctionIds != null &&
//         trigGroupDoc!.auctionIds != undefined
//     ) {
//         const db: FirebaseFirestore.Firestore = admin.firestore()

//         for (const aucId of trigGroupDoc!.auctionIds) {
//             const aucDoc = await db.collection('auctions').doc(aucId).get()
//             if (aucDoc.exists && aucDoc.data() != undefined) {
//                 const bidsTotal: number | undefined = getQuantitySumBetweenFromBids(aucDoc.data()!, true, undefined, undefined)
//                 if (bidsTotal != undefined) result += bidsTotal
//             }
//         }
//     }
//     return result
// }

