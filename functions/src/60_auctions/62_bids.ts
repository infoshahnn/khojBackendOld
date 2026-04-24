import admin = require('firebase-admin');
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getDateTimeString } from '../50_auc_triggered/auc_triggered';
import { logError } from '..';

export const bid_triggered_export = onDocumentUpdated(`auctions/{auctionId}/bids/{bidId}`, async (event) => {

    try {
        // basic stuff
        console.log(`started`)
        if (event == undefined || event.data == undefined ||
            event.data.after.data() == undefined || event.data.after.data() == null ||
            event.data.before.data() == undefined || event.data.before.data() == null
        ) return

        const beforeData: FirebaseFirestore.DocumentData = event.data.before.data()!
        const afterData: FirebaseFirestore.DocumentData = event.data.after.data()!

        const replyBefore = beforeData.replyStatus
        const replyAfter = afterData.replyStatus

        if (replyAfter != 'approved') return
        if (replyBefore != '' && replyBefore != 'pending') return

        const auctionDoc = await event.data.after.ref.parent.parent?.get()
        if (auctionDoc == null || auctionDoc == undefined) return
        const auctionData = auctionDoc.data()
        if (auctionData == null || auctionData == undefined) return
        const cid = auctionData.companyId
        if (cid == null || cid == '' || cid == undefined) return
        const db: FirebaseFirestore.Firestore = admin.firestore()

        const currency = auctionData.currency
        const quantityUnitEnglish = auctionData.quantityUnitEnglish
        const itemEnglish = auctionData.itemEnglish
        const keywordDisplayEnglish = auctionData.keywordDisplayEnglish
        if (currency == null || currency == undefined || currency == '' ||
            quantityUnitEnglish == null || quantityUnitEnglish == undefined || quantityUnitEnglish == '' ||
            itemEnglish == null || itemEnglish == undefined || itemEnglish == ''
        ) {
            console.log('currency/quantityUnitEnglish NA. Returning.')
            return
        }

        if (afterData.bidderUserId == null || afterData.bidderUserId == '' || afterData.bidderUserId == undefined) return

        try {
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
            let brokerEmails: string[] = []
            let brokerName: string = ''
            let brokerNumber: string = ''
            let brokerCompany: string = ''
            let brokerCompanyRegion: string = ''


            // INCREMENT QUANTITY IF THRU BROKER
            try {
                if (afterData.directOrBrokerId != null && afterData.directOrBrokerId != '' &&
                    afterData.directOrBrokerId != undefined && afterData.directOrBrokerId != 'direct' &&
                    (auctionData.advanceOrCredit == 'advance' || auctionData.advanceOrCredit == 'credit') &&
                    afterData.bidQuantityMt != null && afterData.bidQuantityMt != undefined && afterData.bidQuantityMt != 0
                ) {
                    const brId = afterData.directOrBrokerId!
                    const adCr = auctionData.advanceOrCredit == 'advance' ? 'limitMtAdvanceUsed' : 'limitMtCreditUsed'
                    const path = `applicants.${afterData.bidderUserId}.${adCr}`
                    await db.collection('auctionBrokerApprovals').doc(brId).update({
                        [path]: admin.firestore.FieldValue.increment(afterData.bidQuantityMt)
                    })
                }
            } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 82 ${e.toString()}`) }

            // EMAIL NOTIFICATION
            try {
                // broker stuff if thru broker
                if (afterData.directOrBrokerId != null && afterData.directOrBrokerId != '' && afterData.directOrBrokerId != undefined && afterData.directOrBrokerId != 'direct') {
                    const brDoc = await db.collection('testCollectionUsers').doc(afterData.directOrBrokerId).get()
                    if (!brDoc.exists || brDoc == undefined || brDoc.data() == undefined) {
                        console.log(`Error 1: broker user doc does not exist for uid ${afterData.directOrBrokerId}`)
                        return
                    }

                    // broker user document data
                    const d = brDoc.data()!
                    if (d.ownNumber != null && d.ownNumber != '' && d.ownNumber != undefined) brokerNumber = d.ownNumber
                    if (d.name != '' && d.name != null && d.name != undefined) brokerName = d.name
                    if (d.email != '' && d.email != null && d.email != undefined) brokerEmails.push(d.email)
                    if (d.companyNameWhileSignUp != '' && d.companyNameWhileSignUp != null && d.companyNameWhileSignUp != undefined) brokerCompany = d.companyNameWhileSignUp
                    if (d.companyAddress != '' && d.companyAddress != null && d.companyAddress != undefined) brokerCompanyRegion = d.companyAddress

                    thruBroker = true

                    if (d.companyIdArray != null && d.companyIdArray != undefined) {
                        for (const bcid of d.companyIdArray!) {
                            const cDoc = await db.collection('companiesV2').doc(bcid).get()
                            const email = emailFromCompanyDoc(cDoc)
                            if (email != '') brokerEmails.push(email)
                            if (brokerCompany == '') brokerCompany = companyNameFromCompanyDoc(cDoc)
                            if (brokerCompanyRegion == '') brokerCompanyRegion = companyActualCityFromCompanyDoc(cDoc)
                        }
                    }
                }

                try {

                    // host > company
                    const cDoc = await db.collection('companiesV2').doc(cid).get()
                    if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data() == null || cDoc.data()!.name == null || cDoc.data()!.name == undefined || cDoc.data()!.name == '') return
                    const cData = cDoc.data()!;
                    hostCompanyName = cData.name
                    const cEmail = emailFromCompanyDoc(cDoc)
                    if (cEmail != '') hostEmailAddress.push(cEmail)
                    hostCompanyName = companyNameFromCompanyDoc(cDoc)
                    // hostCompanyRegion = companyActualCityFromCompanyDoc(cDoc)

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

                    try {

                        // buyer related
                        const bidderUserId = afterData.bidderUserId!
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

                        // FOR HOST
                        try {
                            let hostHtml = ''
                            if (thruBroker)
                                hostHtml += brokerOrBidderDetails('Broker/bidder', brokerName, brokerNumber, brokerCompany, brokerCompanyRegion)
                            else
                                hostHtml += brokerOrBidderDetails('Broker/bidder', bidderName, bidderNumber, bidderCompany, bidderCompanyRegion)
                            hostHtml += '<br><br>'

                            hostHtml += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                            hostHtml += '<br><br>'

                            hostHtml += commonAucDetails(auctionDoc)
                            hostHtml += '<br><br>'
                            hostHtml = hostHtml.replace('\n', '<br>')
                            // hostStr = `<font size="8">${hostStr}</font>`

                            let hostSubject = `Trade confirmed | `
                            hostSubject += `${keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? itemEnglish : keywordDisplayEnglish} | `
                            console.log(`email subject so far: ${hostSubject}`)
                            hostSubject += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                            hostSubject += ' | '
                            if (thruBroker)
                                hostSubject += brokerCompany == '' ? brokerName : brokerCompany
                            else
                                hostSubject += bidderCompany == '' ? bidderName : bidderCompany
                            hostSubject = hostSubject.replace('\n', '<br>')

                            hostEmailAddress = [...new Set(hostEmailAddress)]
                            await db.collection('mail').add({
                                'message': {
                                    html: hostHtml,
                                    subject: hostSubject,
                                },
                                'to': hostEmailAddress
                            })
                        } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 03 ${e.toString()}`) }


                        // FOR BROKER
                        try {
                            if (thruBroker) {
                                let brokerHtml = ''
                                let brokerSubject = ''
                                brokerHtml += brokerOrBidderDetails('Bidder', bidderName, bidderNumber, bidderCompany, bidderCompanyRegion)
                                brokerHtml += '<br><br>'

                                brokerHtml += brokerOrBidderDetails('Broker', brokerName, brokerNumber, brokerCompany, brokerCompanyRegion)
                                brokerHtml += '<br><br>'

                                brokerHtml += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                                brokerHtml += '<br><br>'

                                brokerHtml += commonAucDetails(auctionDoc)
                                brokerHtml += '<br><br>'
                                brokerHtml = brokerHtml.replace('\n', '<br>')

                                brokerSubject = `Trade confirmed | `
                                brokerSubject += `${keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? itemEnglish : keywordDisplayEnglish} | `
                                brokerSubject += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                                brokerSubject += ` | ${hostCompanyName} | ${bidderCompany == '' ? bidderName : bidderCompany}`
                                brokerSubject = brokerSubject.replace('\n', '<br>')

                                brokerEmails = [...new Set(brokerEmails)]
                                await db.collection('mail').add({
                                    'message': {
                                        html: brokerHtml,
                                        subject: brokerSubject,
                                    },
                                    'to': brokerEmails
                                })
                            }
                        } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 02 ${e.toString()}`) }


                        // FOR BIDDER
                        try {
                            let bidderHtml = ''
                            let bidderSubject = ''
                            bidderHtml += brokerOrBidderDetails('Bidder', bidderName, bidderNumber, bidderCompany, bidderCompanyRegion)
                            bidderHtml += '<br><br>'

                            bidderHtml += brokerOrBidderDetails('Broker', brokerName, brokerNumber, brokerCompany, brokerCompanyRegion)
                            bidderHtml += '<br><br>'

                            bidderHtml += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                            bidderHtml += '<br><br>'

                            bidderHtml += commonAucDetails(auctionDoc)
                            bidderHtml += '<br><br>'
                            bidderHtml = bidderHtml.replace('\n', '<br>')

                            bidderSubject = `Trade confirmed | `
                            bidderSubject += `${keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? itemEnglish : keywordDisplayEnglish} | `
                            bidderSubject += priceQuantityDetailsForReverse(afterData, currency, quantityUnitEnglish)
                            bidderSubject += ` | ${hostCompanyName} | ${brokerCompany == '' ? brokerName : brokerCompany}`
                            bidderSubject = bidderSubject.replace('\n', '<br>')

                            bidderEmails = [...new Set(bidderEmails)]
                            await db.collection('mail').add({
                                'message': {
                                    html: bidderHtml,
                                    subject: bidderSubject,
                                },
                                'to': bidderEmails
                            })

                        } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 01 ${e.toString()}`) }
                    } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 04 ${e.toString()}`) }
                } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 05 ${e.toString()}`) }
            } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 06 ${e.toString()}`) }
        } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 07 ${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`ERROR bidTriggered 08 ${e.toString()}`) }

    return;
});


export const brokerOrBidderDetails = (title: string, name: string, number: string, companyName: string, companyRegion: string): string => {
    let str: string = ''
    str += `${title}: `
    if (name != '') str += `${name}, `
    if (companyName != '') str += `${companyName}, `
    if (companyRegion != '') str += `${companyRegion}, `
    if (number != '') str += ` (${number})`
    return str
}

export const priceQuantityDetailsForReverse = (bidDocumentData: FirebaseFirestore.DocumentData, currency: string, quantityUnit: string): string => {
    let str: string = ''
    if (
        bidDocumentData.bidPricePerMt == null || bidDocumentData.bidPricePerMt == undefined || bidDocumentData.bidPricePerMt == '' ||
        bidDocumentData.bidQuantityMt == null || bidDocumentData.bidQuantityMt == undefined || bidDocumentData.bidQuantityMt == '' ||
        quantityUnit == '' || currency == ''
    ) {
        return ''
    }

    str += `${bidDocumentData.bidQuantityMt} ${quantityUnit} @ ${currency} ${bidDocumentData.bidPricePerMt}/${quantityUnit}`

    return str
}


export const priceQuantityDetailsForFixed = (currency: string, quantityUnit: string, bidPricePerMt: number, bidQuantityMt: number, ): string => {
    let str: string = ''
    if (
        bidPricePerMt == null || bidPricePerMt == undefined ||
        bidQuantityMt == null || bidQuantityMt == undefined ||
        quantityUnit == '' || currency == ''
    ) {
        return ''
    }

    str += `${bidQuantityMt} ${quantityUnit} @ ${currency} ${bidPricePerMt}/${quantityUnit}`

    return str
}

export const commonAucDetails = (auctionDoc: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>): string => {
    if (!auctionDoc.exists || auctionDoc.data() == null || auctionDoc.data() == undefined) return '';
    const d = auctionDoc.data()!

    // Host (buyer/seller): company name, company region
    // Date/time: ${startMil}
    // Item: ${itemEnglish}
    // Delivery address:
    // ${deliveryAddress}
    // ${deliveryPinCode}
    // ${deliveryCity}
    // ${deliveryState}
    // Specs: ${mainSpecs} ${specs}

    let str: string = ''

    // company name and locaiton
    str += `Host`
    if (d.buyOrSell == 'buy' || d.buyOrSell == 'sell') str += ` (${d.buyOrSell}er)`
    str += `:`
    if (d.companyName != null && d.companyName != undefined && d.companyName != '') {
        str += ` ${d.companyName}`
        if (d.companyCity != null && d.companyCity != undefined && d.companyCity != '') {
            str += `, ${d.companyCity}`
        }
    } else {
        str += ` NA`
    }
    str += `<br><br>`

    if (d.keywordDisplayEnglish != null && d.keywordDisplayEnglish != undefined && d.keywordDisplayEnglish != '') {
        str += `Item: ${d.keywordDisplayEnglish}`
    }else {
        str += `Item: ${d.itemEnglish} / ${d.itemHindi}`
    }

    str += `<br><br>`

    // delivery
    if (d.buyOrSell == 'buy') {
        str += `Delivery location: `
    } else if (d.buyOrSell == 'sell') {
        str += `Pickup location: `
    } else {
        str += `Location: `
    }
    if (d.deliveryAddress != null && d.deliveryAddress != undefined && d.deliveryAddress != '') str += `${d.deliveryAddress}, `
    if (d.deliveryPinCode != null && d.deliveryPinCode != undefined && d.deliveryPinCode != '') str += `${d.deliveryPinCode}, `
    if (d.deliveryCity != null && d.deliveryCity != undefined && d.deliveryCity != '') str += `${d.deliveryCity}, `
    if (d.deliveryState != null && d.deliveryState != undefined && d.deliveryState != '') str += `${d.deliveryState}`
    str += `<br><br>`

    // details/specs
    str += `Details:<br>${d.mainSpecs}<br>${d.specs}`.replace(/\n/g, '<br>')
    str += `<br><br>`


    if (d.startMil != null && d.startMil != undefined && d.startMil != 0)
        str += `Auction date/time: ${getDateTimeString(d.startMil)} (IST)`
    str += `<br><br>`

    return str;
}

export const emailFromCompanyDoc = (cDoc: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>): string => {
    if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data()!.email == null || cDoc.data()!.email == undefined || cDoc.data()!.email == '') return ''

    return cDoc.data()!.email
}

export const companyNameFromCompanyDoc = (cDoc: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>): string => {
    if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data()!.name == null || cDoc.data()!.name == undefined || cDoc.data()!.name == '') return ''

    return cDoc.data()!.name
}

export const companyActualCityFromCompanyDoc = (cDoc: admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>): string => {
    if (!cDoc.exists || cDoc == undefined || cDoc.data() == undefined || cDoc.data()!.actualCity == null || cDoc.data()!.actualCity == undefined || cDoc.data()!.actualCity == '') return ''

    return cDoc.data()!.actualCity
}