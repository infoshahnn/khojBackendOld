import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { logError } from "..";
import { brokerOrBidderDetails, commonAucDetails, companyNameFromCompanyDoc, emailFromCompanyDoc, priceQuantityDetailsForFixed } from "../60_auctions/62_bids";

export const auction_triggered_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 300, memory: '1GB' }).firestore.document(`auctions/{aucId}`).onWrite(async (change, context) => {
    try {

        const after = change.after
        const before = change.before

        await checkTriggers(before, after)

        try {
            await emailForApprovedBids(before, after)
        } catch (e) { if (e instanceof Error) await logError(`auction_triggered_export///02///${e.toString()}`) }

        console.log('auction_triggered_export ended')
    } catch (e) { if (e instanceof Error) await logError(`auction_triggered_export///01///${e.toString()}`) }
    return
});


export const emailForApprovedBids = async (before: functions.firestore.DocumentSnapshot | undefined, after: functions.firestore.DocumentSnapshot | undefined) => {
    if (after == undefined || after == null) return;
    if (!after.exists) return;
    const auctionData = after.data()
    if (auctionData == undefined || auctionData == null) return;
    if (auctionData.fixedPrice != true) return;


    console.log(`emailForApprovedBids 01`)

    const bidsAfter = auctionData.bidsInAuctionDoc
    if (bidsAfter == undefined || bidsAfter == null) return;

    const companyId = auctionData.companyId
    if (companyId == null || companyId == undefined) return

    let approvedInAfter: number[] = []
    let approvedInBefore: number[] = []

    var j: number = 0;
    for (j; j < bidsAfter.length; j++) {
        const bObject: Map<string, any> = new Map(Object.entries(bidsAfter[j]))
        const replyStatus = bObject.get('replyStatus')
        if (replyStatus == 'approved') approvedInAfter.push(j)
    }

    if (before != null && before != undefined) {
        const beforeDataWidget = before.data()
        if (beforeDataWidget != null && beforeDataWidget != undefined) {
            const bidsBefore = beforeDataWidget.bidsInAuctionDoc
            if (bidsBefore != undefined && bidsBefore != null) {
                var i: number = 0;
                for (i; i < bidsBefore.length; i++) {
                    const bObject: Map<string, any> = new Map(Object.entries(bidsBefore[i]))
                    const replyStatus = bObject.get('replyStatus')
                    if (replyStatus == 'approved') approvedInBefore.push(i)
                }
            }
        }
    }

    console.log(`emailForApprovedBids 02`)

    let newlyApproved: number[] = []
    approvedInAfter.forEach((valueFromNew: number) => {
        if (!approvedInBefore.includes(valueFromNew)) {
            newlyApproved.push(valueFromNew)
        }
    })

    console.log(`emailForApprovedBids 03`)

    if (newlyApproved.length != 1) return;

    console.log(`emailForApprovedBids 04`)

    const bidMap = bidsAfter[newlyApproved[0]]
    const bidMapObject: Map<string, any> = new Map(Object.entries(bidMap));
    const bidderUserId = bidMapObject.get('bidderUserId')
    const bidPricePerMt: number = bidMapObject.get('bidPricePerMt')
    const bidQuantityPerMt: number = bidMapObject.get('bidQuantityMt')
    const bidderRemarks: string = bidMapObject.get('bidderRemarks')

    if (bidderUserId == null || bidderUserId == undefined || bidderUserId == '' ||
        bidPricePerMt == null || bidPricePerMt == undefined || bidPricePerMt == 0 ||
        bidQuantityPerMt == null || bidQuantityPerMt == undefined || bidQuantityPerMt == 0
    ) {
        console.log(`returning 02`)
        return
    }

    console.log(`emailForApprovedBids 05`)

    const db: FirebaseFirestore.Firestore = admin.firestore()

    // VARIABLES
    // host related:
    let hostEmailAddress = []
    let hostCompanyName = ''
    // let hostCompanyRegion = ''

    // bidder related:
    let bidderEmails: string[] = []
    let bidderName: string = ''
    let bidderNumber: string = ''
    let bidderCompany: string = ''
    let bidderCompanyRegion: string = ''


    // broker related:
    let thruBroker: boolean = false
    // let brokerEmails: string[] = []
    let brokerName: string = ''
    let brokerNumber: string = ''
    let brokerCompany: string = ''
    let brokerCompanyRegion: string = ''

    console.log(`emailForApprovedBids 06`)

    // host > company
    const cDoc = await db.collection('companiesV2').doc(companyId).get()
    if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data() == null || cDoc.data()!.name == null || cDoc.data()!.name == undefined || cDoc.data()!.name == '') return
    const cData = cDoc.data()!;
    hostCompanyName = cData.name
    const cEmail = emailFromCompanyDoc(cDoc)
    if (cEmail != '') hostEmailAddress.push(cEmail)
    hostCompanyName = companyNameFromCompanyDoc(cDoc)
    // hostCompanyRegion = companyActualCityFromCompanyDoc(cDoc)

    console.log(`emailForApprovedBids 07`)

    // host > auction hosts
    if (auctionData.hostUserIds != null && auctionData.hostUserIds != undefined) {
        const ids = auctionData.hostUserIds
        for (const id of ids) {
            const uDoc = await db.collection('testCollectionUsers').doc(id).get()
            if (uDoc.exists && uDoc != undefined && uDoc.data() != undefined && uDoc.data() != null) {
                const uData = uDoc.data()!
                if (uData.email != null && uData.email != undefined && uData.email != '') hostEmailAddress.push(uData.email)
            }
        }
    }

    console.log(`emailForApprovedBids 08 hostEmailAddress: ${hostEmailAddress}`)

    // buyer related
    // const bidderUserId = afterData.bidderUserId!
    const bidderDoc = await db.collection('testCollectionUsers').doc(bidderUserId).get()
    if (!bidderDoc.exists || bidderDoc.data() == undefined || bidderDoc.data() == null) return
    const bidderData = bidderDoc.data()!
    if (bidderData.ownNumber != null && bidderData.ownNumber != undefined && bidderData.ownNumber != '') bidderNumber = bidderData.ownNumber
    if (bidderData.email != '' && bidderData.email != null && bidderData.email != undefined) bidderEmails.push(bidderData.email)
    if (bidderData.name != '' && bidderData.name != null && bidderData.name != undefined) bidderName = bidderData.name
    if (bidderData.companyNameWhileSignUp != '' && bidderData.companyNameWhileSignUp != null && bidderData.companyNameWhileSignUp != undefined) bidderCompany = bidderData.companyNameWhileSignUp
    if (bidderData.companyAddress != '' && bidderData.companyAddress != null && bidderData.companyAddress != undefined) bidderCompanyRegion = bidderData.companyAddress

    if (bidderData.companyIdArray != null && bidderData.companyIdArray != undefined && bidderData.companyIdArray!.length > 0) {
        const cid = bidderData.companyIdArray![0]
        if (cid != null && cid != '' && cid != undefined) {
            const cDoc = await db.collection('companiesV2').doc(cid).get()
            if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data() == null || cDoc.data()!.email == null || cDoc.data()!.email == undefined || cDoc.data()!.email == '') {
                // nothing
            } else {
                bidderEmails.push(cDoc.data()!.email)
            }
        }
    }

    console.log(`emailForApprovedBids 09 bidderEmails: ${bidderEmails}`)

    let keywordDisplayEnglish = ''
    let itemEnglish = auctionData.itemEnglish
    const currency = auctionData.currency
    const quantityUnitEnglish = auctionData.quantityUnitEnglish


    if (currency == null || currency == undefined || currency == '' ||
        quantityUnitEnglish == null || quantityUnitEnglish == undefined || quantityUnitEnglish == '' ||
        itemEnglish == null || itemEnglish == undefined || itemEnglish == ''
    ) {
        console.log('currency/quantityUnitEnglish NA. Returning.')
        return
    }

    try {
        if (auctionData.keywordDisplayEnglish != null && auctionData.keywordDisplayEnglish != undefined && auctionData.keywordDisplayEnglish != '') {
            keywordDisplayEnglish = auctionData.keywordDisplayEnglish
        }
    } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 74 ${e.toString()}`) }


    console.log(`emailForApprovedBids 10`)

    // FOR HOST
    try {
        let hostHtml = ''
        if (thruBroker)
            hostHtml += brokerOrBidderDetails('Broker/bidder', brokerName, brokerNumber, brokerCompany, brokerCompanyRegion)
        else
            hostHtml += brokerOrBidderDetails('Broker/bidder', bidderName, bidderNumber, bidderCompany, bidderCompanyRegion)
        hostHtml += '<br><br>'

        hostHtml += priceQuantityDetailsForFixed(currency, quantityUnitEnglish, bidPricePerMt, bidQuantityPerMt)
        hostHtml += '<br><br>'

        if (bidderRemarks != undefined && bidderRemarks != null && bidderRemarks != '')
            hostHtml += `Bidder remarks: ${bidderRemarks}<br><br>`

        hostHtml += commonAucDetails(after)
        hostHtml += '<br><br>'
        hostHtml = hostHtml.replace('\n', '<br>')
        // hostStr = `<font size="8">${hostStr}</font>`

        console.log(`display keyword: ${keywordDisplayEnglish}, itemEnglish: ${itemEnglish}`)
        let hostSubject = `Trade confirmed | `
        hostSubject += `${keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? itemEnglish : keywordDisplayEnglish} | `
        console.log(`email subject so far: ${hostSubject}`)
        hostSubject += priceQuantityDetailsForFixed(currency, quantityUnitEnglish, bidPricePerMt, bidQuantityPerMt)
        hostSubject += ' | '
        console.log(`email subject so far: ${hostSubject}`)
        if (thruBroker)
            hostSubject += brokerCompany == '' ? brokerName : brokerCompany
        else
            hostSubject += bidderCompany == '' ? bidderName : bidderCompany
        hostSubject = hostSubject.replace('\n', '<br>')

        hostEmailAddress = [...new Set(hostEmailAddress)]

        console.log(`emailForApprovedBids 11`)

        // await db.collection('test').doc('emailTest').update({
        //     'message': {
        //         html: hostHtml,
        //         subject: hostSubject,
        //     },
        // })
        await db.collection('mail').add({
            'message': {
                html: hostHtml,
                subject: hostSubject,
            },
            'to': hostEmailAddress
        })
    } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 03 ${e.toString()}`) }

    console.log(`emailForApprovedBids 12`)

    // FOR BIDDER
    try {
        let bidderHtml = ''
        let bidderSubject = ''
        if (thruBroker) {
            bidderHtml += brokerOrBidderDetails('Broker', brokerName, brokerNumber, brokerCompany, brokerCompanyRegion)
            bidderHtml += '<br><br>'
        } else {
            bidderHtml += brokerOrBidderDetails('Bidder', bidderName, bidderNumber, bidderCompany, bidderCompanyRegion)
            bidderHtml += '<br><br>'
        }

        bidderHtml += priceQuantityDetailsForFixed(currency, quantityUnitEnglish, bidPricePerMt, bidQuantityPerMt)
        bidderHtml += '<br><br>'

        if (bidderRemarks != undefined && bidderRemarks != null && bidderRemarks != '')
            bidderHtml += `Bidder remarks: ${bidderRemarks}<br><br>`

        bidderHtml += commonAucDetails(after)
        bidderHtml += '<br><br>'
        bidderHtml = bidderHtml.replace('\n', '<br>')

        bidderSubject = `Trade confirmed | `
        bidderSubject += `${keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? itemEnglish : keywordDisplayEnglish} | `
        console.log(`email subject so far: ${bidderSubject}`)
        bidderSubject += priceQuantityDetailsForFixed(currency, quantityUnitEnglish, bidPricePerMt, bidQuantityPerMt)
        bidderSubject += ` | ${hostCompanyName} | ${brokerCompany == '' ? brokerName : brokerCompany}`
        bidderSubject = bidderSubject.replace('\n', '<br>')

        bidderEmails = [...new Set(bidderEmails)]

        console.log(`emailForApprovedBids 14`)

        // await db.collection('test').doc('emailTest').update({
        //     'message': {
        //         html: bidderHtml,
        //         subject: bidderSubject,
        //     },
        // })
        await db.collection('mail').add({
            'message': {
                html: bidderHtml,
                subject: bidderSubject,
            },
            'to': bidderEmails
        })

    } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 01 ${e.toString()}`) }

    console.log(`emailForApprovedBids 15`)

    return;
}


export const checkTriggers = async (before: functions.firestore.DocumentSnapshot | undefined, after: functions.firestore.DocumentSnapshot | undefined) => {
    console.log('checkTriggers 01')
    if (after == undefined || after == null) return;
    if (!after.exists) return;
    const afterDataWidget = after.data()
    if (afterDataWidget == undefined || afterDataWidget == null) return;

    if (afterDataWidget.fixedPrice != true) return;

    const triggersForFixedPriceAuctionWidget = afterDataWidget.triggersForFixedPriceAuction
    if (triggersForFixedPriceAuctionWidget == null || triggersForFixedPriceAuctionWidget == undefined || triggersForFixedPriceAuctionWidget.length == 0) {
        console.log('triggers undefined so returning')
        return;
    }

    if (afterDataWidget.closed == true) {
        console.log('closed so returning')
        return;
    }

    const db: FirebaseFirestore.Firestore = admin.firestore()

    const linkedFixedPriceAuctionIds = afterDataWidget.linkedFixedPriceAuctionIds ?? []
    const linkedAuctionDocs: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>[] = []
    try {
        const now = Date.now()
        for (const linkedId of linkedFixedPriceAuctionIds) {
            try {
                const _linkedDoc = await db.collection('auctions').doc(linkedId).get()

                if (_linkedDoc.exists && _linkedDoc.data() != null && _linkedDoc.data() != undefined) {
                    const _d = _linkedDoc.data()!
                    const endMilOriginal = _d.endMilOriginal ?? 0
                    const endMilAfterExtension = _d.endMilAfterExtension ?? 0

                    if (
                        _d.startMil != null && _d.startMil != undefined && _d.startMil <= now &&
                        (endMilOriginal >= now || endMilAfterExtension >= now) &&
                        _d.closed != true &&
                        _d.fixedPrice == true &&
                        _d.companyId == afterDataWidget.companyId
                    ) {
                        linkedAuctionDocs.push(_linkedDoc)
                    } else {
                        try {
                            console.log(`For linked: error with linked doc; startMil: ${_d.startMil}, _d.startMil >= now: ${_d.startMil >= now}, _d.closed: ${_d.closed}, _d.fixedPrice: ${_d.fixedPrice}, _d.companyId: ${_d.companyId}`)
                        } catch (e) { if (e instanceof Error) await logError(`checkTriggers///56///${e.toString()}`) }
                    }
                }
            } catch (e) { if (e instanceof Error) await logError(`checkTriggers///51///${e.toString()}`) }
        }
        console.log(`linkedAuctionDocs ${linkedAuctionDocs.length} = ${linkedFixedPriceAuctionIds.length}: ${linkedFixedPriceAuctionIds}`)
    } catch (e) { if (e instanceof Error) await logError(`checkTriggers///52///${e.toString()}`) }



    const aucDocRef = db.collection('auctions').doc(`${after.ref.id}`);

    try {
        console.log('checkTriggers 02 starting transaction...')

        await db.runTransaction(async (t) => {
            console.log('checkTriggers 03 TRANSACTION started')

            const aucDoc = await t.get(aucDocRef)
            let needToStopPurchasing: boolean = false
            let changePriceByNet: number = 0
            let auctionTriggerHistory: string[] = []
            let concatsOfTrigsUsed: string[] = []

            let auctionTriggerHistoryForLinked: string[] = []


            if (aucDoc.exists && aucDoc.data() != undefined && aucDoc.data() != undefined &&
                aucDoc.data()!.triggersForFixedPriceAuction != null && aucDoc.data()!.triggersForFixedPriceAuction != undefined &&
                aucDoc.data()!.startPricePerMt != null && aucDoc.data()!.startPricePerMt != undefined && aucDoc.data()!.startPricePerMt != 0) {
                // const startPricePerMt = aucDoc.data()!.startPricePerMt!
                console.log('checkTriggers 04 TRANSACTION started')

                const trigObjectsMap = trigObjects(aucDoc.data())

                for (const concat of trigObjectsMap.keys()) {
                    console.log(`checkTriggers 04 TRANSACTION reading concat ${concat}`)
                    const trigObject: Map<string, any> | undefined = trigObjectsMap.get(concat)

                    if (trigObjectErrorString(trigObject) != '') {
                        logError(`checkTriggers///02///${trigObjectErrorString(trigObject)}`)
                    } else {
                        if (trigObject!.get('used') == false) {

                            console.log(`checkTriggers 04 TRANSACTION reading concat ${concat} - no error`)
                            const priceChangePerMt = trigObject!.get('priceChangePerMt')
                            const stopPurchasing = trigObject!.get('stopPurchasing')
                            const lastDurationMil = trigObject!.get('lastDurationMil')
                            const quantityMt = trigObject!.get('quantityMt')
                            const fromMil = trigObject!.get('fromMil')
                            const toMil = trigObject!.get('toMil')
                            const triggerFor = trigObject!.get('triggerFor')
                            let relevantQty: number | undefined = 0
                            const nowMil = Date.now()
                            let historyString = `${nowMil}>>${quantityMt}>>` // (1)
                            // format:  
                            // (1) historyCreatedAt, quantityInTrigger, 
                            // (2) type, quantityRelevant, priceBefore, lastDurationMil, fromMil, toMil,
                            // (3) priceChangeBy, stoppedPurchasing (true or false)
                            // (4) linkedAuctionId (of the source auction)

                            if (triggerFor == 'Total quantity') {
                                relevantQty = getQuantitySumBetweenFromBids(aucDoc.data()!, true, undefined, undefined)
                                historyString += `Total quantity>>${relevantQty}>>${aucDoc.data()!.startPricePerMt}>>>>>>>>` // (2)

                            } else if (triggerFor == 'Duration') {
                                relevantQty = getQuantitySumBetweenFromBids(aucDoc.data()!, false, nowMil - lastDurationMil, nowMil)
                                historyString += `Duration>>${relevantQty}>>${aucDoc.data()!.startPricePerMt}>>${lastDurationMil}>>>>>>` // (2)

                            } else if (triggerFor == 'Time range') {
                                relevantQty = getQuantitySumBetweenFromBids(aucDoc.data()!, false, fromMil, toMil)
                                historyString += `Time range>>${relevantQty}>>${aucDoc.data()!.startPricePerMt}>>>>${fromMil}>>${toMil}>>` // (2)

                            } else {
                                historyString += `>>>>>>>>>>>>` // (2)

                            }

                            if (stopPurchasing == true) {
                                historyString += `0>>true>>` // (3)
                            } else {
                                if (priceChangePerMt > 0) {
                                    // historyString += `Increasing price by ${priceChangePerMt}/MT>>`
                                    historyString += `${priceChangePerMt}>>false>>` // (3)
                                } else if (priceChangePerMt < 0) {
                                    // historyString += `Reducing price by ${priceChangePerMt}/MT>>`
                                    historyString += `${priceChangePerMt}>>false>>` // (3)
                                } else {
                                    // historyString += `No change>>`
                                    historyString += `0>>false>>` // (3)
                                }
                            }

                            if (relevantQty != undefined && relevantQty >= quantityMt) {
                                console.log(`TRIGGERED: ${historyString}`)

                                if (stopPurchasing == true) {
                                    needToStopPurchasing = true
                                } else {
                                    changePriceByNet += priceChangePerMt
                                }

                                auctionTriggerHistory.push(historyString)
                                auctionTriggerHistoryForLinked.push(`${historyString}>>${after.id}`)

                                concatsOfTrigsUsed.push(concat)
                            } else {
                                console.log(`NOT TRIGGERED: ${historyString}`)
                            }

                        }
                    }

                }

                console.log(`checkTriggers 05 TRANSACTION relevant concats: concatsOfTrigsUsed: ${concatsOfTrigsUsed.length}`)

                // write (execute)
                if (concatsOfTrigsUsed.length > 0) {
                    console.log(`checkTriggers 06.a`)

                    for (const concat of concatsOfTrigsUsed) {
                        const path = `triggersForFixedPriceAuction.${concat}.used`
                        t.update(aucDocRef, { [path]: true })
                    }
                    console.log(`checkTriggers 06.b`)

                    if (needToStopPurchasing) {
                        t.update(aucDocRef, { 'closed': true })

                        console.log(`for linked: stopping purchasing`)
                        for (const linkedDoc of linkedAuctionDocs) {
                            try {
                                console.log(`for linked: stopping purchasing for ${linkedDoc.id}`)
                                await linkedDoc.ref.update({ 'closed': true, 'auctionTriggerHistory': admin.firestore.FieldValue.arrayUnion(...auctionTriggerHistoryForLinked) });
                                console.log(`for linked: stopped purchasing for ${linkedDoc.id}`)
                            } catch (e) { if (e instanceof Error) await logError(`checkTriggers///53///${e.toString()}`) }
                        }
                    } else if (changePriceByNet != 0) {
                        t.update(aucDocRef, { 'startPricePerMt': admin.firestore.FieldValue.increment(changePriceByNet) })

                        console.log(`for linked: changing price by ${changePriceByNet}`)
                        for (const linkedDoc of linkedAuctionDocs) {
                            try {
                                console.log(`for linked: changing price by ${changePriceByNet} for ${linkedDoc.id}`)
                                await linkedDoc.ref.update({
                                    'startPricePerMt': admin.firestore.FieldValue.increment(changePriceByNet),
                                    'auctionTriggerHistory': admin.firestore.FieldValue.arrayUnion(...auctionTriggerHistoryForLinked)
                                });
                                console.log(`for linked: changed price by ${changePriceByNet} for ${linkedDoc.id}`)
                            } catch (e) { if (e instanceof Error) await logError(`checkTriggers///54///${e.toString()}`) }
                        }

                    }
                    console.log(`checkTriggers 06.c`)

                    t.update(aucDocRef, { 'auctionTriggerHistory': admin.firestore.FieldValue.arrayUnion(...auctionTriggerHistory) })
                    console.log(`checkTriggers 06.d`)
                }

                console.log(`checkTriggers 07 TRANSACTION over`)
            }
        });

        console.log('Transaction success!');
    } catch (e) { if (e instanceof Error) await logError(`checkTriggers///01///${e.toString()}`) }
    return;


    // for (const trigMap of triggersForFixedPriceAuction) {
    //     if (trigMap != null && trigMap != undefined) {
    //         const trigMapObject: Map<string, any> = new Map(Object.entries(trigMap));
    //         const triggerFor = trigMapObject.get('triggerFor')
    //         const quantityMt = trigMapObject.get('quantityMt')
    //         const fromMil = trigMapObject.get('fromMil')
    //         const toMil = trigMapObject.get('toMil')
    //         const lastDurationMil = trigMapObject.get('lastDurationMil')
    //         const stopPurchasing = trigMapObject.get('stopPurchasing')
    //         const priceChangePerMt = trigMapObject.get('priceChangePerMt')
    //         const used = trigMapObject.get('used')

    //         if (used == false) {
    //             if (triggerFor == 'Total quantity' && quantityMt != null && quantityMt != undefined) {
    //                 if (totalBidsQuantity > quantityMt) {
    //                     if (stopPurchasing == true) {
    //                         needToStopPurchasing = true;
    //                         stringsForHistory.push(`Total quantity trigger: total quantity exceeded ${quantityMt} MT so stopping buying`)

    //                     }
    //                 }
    //             } else if (triggerFor == 'Duration') {
    //                 //
    //             } else if (triggerFor == 'Time range') {
    //                 //
    //             } else {
    //                 //
    //             }
    //         }
    //     }
    // }


    // DO IT ATOMICALLY
    // get all triggers which are unused and startPrice
    // if multiple triggers, then see if any of them stop sales. if not, then find net of price difference
    // triggerFor: Total quantity, Duration, Time range

    /*
    String? triggerFor;
    int? quantityMt;
    num? fromMil;
    num? toMil;
    bool? ignoreTimes;
    int? lastDurationMil;
    bool? stopPurchasing;
    int? priceChangePerMt;
    bool? used;
    */
}

export const trigObjects = (afterData: admin.firestore.DocumentData | undefined): Map<string, Map<string, any>> => {
    let results: Map<string, Map<string, any>> = new Map<string, Map<string, any>>

    if (
        afterData != null && afterData != undefined &&
        afterData!.triggersForFixedPriceAuction != null &&
        afterData!.triggersForFixedPriceAuction != undefined
    ) {
        const trigsMainMap = afterData!.triggersForFixedPriceAuction!
        const trigsMainObject: Map<string, any> = new Map(Object.entries(trigsMainMap))

        for (const concat of trigsMainObject.keys()) {
            const singleTrigMap = trigsMainObject.get(concat)
            const singleTrigObject: Map<string, any> = new Map(Object.entries(singleTrigMap))

            if (singleTrigObject != undefined && singleTrigObject != null)
                results.set(concat, singleTrigObject)
        }
        return results

    }
    return results
}



export const trigObjectErrorString = (trigObject: Map<string, any> | undefined): string => {

    if (trigObject == undefined || trigObject == null) return 'Trig object null'

    const triggerFor = trigObject.get('triggerFor')

    if (trigObject.get('stopPurchasing') != true &&
        (
            trigObject.get('priceChangePerMt') == null ||
            trigObject.get('priceChangePerMt') == undefined ||
            trigObject.get('priceChangePerMt') == 0
        )
    ) {
        return 'No action listed';
    }

    if (triggerFor == 'Total quantity') {
        // nothing needed

    } else if (triggerFor == 'Duration') {
        const lastDurationMil = trigObject.get('lastDurationMil')

        if (lastDurationMil == null || lastDurationMil == undefined) {
            return 'lastDurationMil missing for Duration type'
        }
    } else if (triggerFor == 'Time range') {
        const fromMil = trigObject.get('fromMil')
        const toMil = trigObject.get('toMil')

        if (fromMil == null || fromMil == undefined || toMil == null || toMil == undefined) {
            return 'fromMil or toMil missing for Time range type';
        }
    } else {
        return 'Type NA'
    }

    return ''
}


export const getQuantitySumBetweenFromBids = (aucAfterData: admin.firestore.DocumentData, getGrandTotal: boolean, fromMil: number | undefined, toMil: number | undefined): number | undefined => {
    if (getGrandTotal != true && (fromMil == undefined || fromMil == null || toMil == undefined || toMil == undefined)) {
        console.log(`getQuantitySumBetweenFromBids - returning 1`)
        return undefined
    }

    const aucData = aucAfterData
    if (aucData != undefined && aucData != null) {
        const bidsInAuctionDoc = aucData.bidsInAuctionDoc
        if (bidsInAuctionDoc == null || bidsInAuctionDoc == undefined || bidsInAuctionDoc.length == 0) {
            console.log(`getQuantitySumBetweenFromBids - returning 2 - no bids`)
            return 0
        }

        let bidsTotalQtyRelevant: number = 0

        for (const b of bidsInAuctionDoc) {
            const bObject: Map<string, any> = new Map(Object.entries(b));
            if (bObject != null && bObject != undefined) {

                if (bObject.get('bidQuantityMt') != null && bObject.get('bidQuantityMt') != undefined) {
                    if (getGrandTotal == true) {
                        bidsTotalQtyRelevant += bObject.get('bidQuantityMt')
                    } else {
                        const bidCreatedAt = bObject.get('bidCreatedAt')
                        if (bidCreatedAt != null && bidCreatedAt != undefined && bidCreatedAt <= toMil! && bidCreatedAt >= fromMil!) {
                            bidsTotalQtyRelevant += bObject.get('bidQuantityMt')
                        }
                    }
                } else {
                    console.log(`getQuantitySumBetweenFromBids - bid quantity NA`)
                }
            }
        }

        console.log(`getQuantitySumBetweenFromBids - bidsTotalQtyRelevant: ${bidsTotalQtyRelevant}`)


        return bidsTotalQtyRelevant
    } else {
        console.log(`getQuantitySumBetweenFromBids - error 1`)

    }

    return undefined
}


export const getDateTimeString = (mil: number): string => {
    const d = new Date(mil);

    // Format the date part
    const formattedDate = d.toLocaleDateString('en-US', {
        month: 'short', // Use 'short' for abbreviated month names
        day: 'numeric', // Use 'numeric' for the numeric day of the month
        year: 'numeric' // Use 'numeric' for the full year
    });

    // Format the time part with AM/PM
    const formattedTime = d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric', // Use 'numeric' for the hour in 12-hour format
        minute: 'numeric', // Use 'numeric' for the minute
        hour12: true // Add AM/PM indicator
    });

    const finalStr = `${formattedDate}, ${formattedTime}`
    return finalStr
}