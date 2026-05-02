import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { logError } from "..";
// import { brokerOrBidderDetails, commonAucDetails, companyNameFromCompanyDoc, emailFromCompanyDoc, priceQuantityDetailsForFixed } from "../60_auctions/62_bids";

export const applicant_status_export = functions.region('asia-south1').runWith({ maxInstances: 20, timeoutSeconds: 520, memory: '4GB' }).firestore.document(`auctionApprovals/{aucId}/applicantStatus/applicantStatus`).onWrite(async (change, context) => {
    try {

        console.log('applicant_status_export 01')

        const before = change.before
        let triggerBefore = 0
        if (before != undefined && before.exists && before.data() != undefined && before.data()!.trigger != undefined) {
            triggerBefore = before.data()!.trigger
        }
        console.log('applicant_status_export 02')

        try {

            const after = change.after
            if (!after.exists || after == undefined || after.data() == undefined || after.data()!.trigger == undefined) return;
            const dataAfterApplicantStatusDoc = after.data()!
            let triggerAfter = dataAfterApplicantStatusDoc.trigger!

            console.log('applicant_status_export 03')

            if (triggerAfter == triggerBefore) return;

            console.log('applicant_status_export 04')

            let userIdDetailsMap: Map<string, any> = new Map

            const approvedUserIds: string[] = await getApprovedUserIds(context.params.aucId)
            const db: FirebaseFirestore.Firestore = admin.firestore()
            let usersCollectionString = 'testCollectionUsers';

            console.log(`applicant_status_export 05 approvedUserIds: ${approvedUserIds.length}`)

            try {
                for (const userId of approvedUserIds) {
                    try {
                        const userDoc = await db.collection(usersCollectionString).doc(userId).get()
                        if (userDoc.exists && userDoc.data() != undefined && userDoc.data()!.lastHomeLoad != undefined) {
                            let userIdInnerMap: Map<string, any> = new Map
                            userIdInnerMap.set('lastHomeLoad', userDoc.data()!.lastHomeLoad!)
 
                            if (userDoc.data()!.ownNumber != undefined) {
                                userIdInnerMap.set('number', userDoc.data()!.ownNumber!)
                            }

                            let userIdInnerMapUploading = Array.from(userIdInnerMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

                            userIdDetailsMap.set(userId, userIdInnerMapUploading)
                        }
                    } catch (e) { if (e instanceof Error) await logError(`applicant_status_export///05///${e.toString()}`) }
                }
                console.log(`applicant_status_export 06`)

                try {
                    let userIdDetailsMapMapUploading = Array.from(userIdDetailsMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                    await change.after.ref.update({ 'applicantStatus': userIdDetailsMapMapUploading, 'triggerAfterUpdating': triggerAfter })
                    console.log(`applicant_status_export 07`)

                } catch (e) { if (e instanceof Error) await logError(`applicant_status_export///04///${e.toString()}`) }
            } catch (e) { if (e instanceof Error) await logError(`applicant_status_export///03///${e.toString()}`) }
        } catch (e) { if (e instanceof Error) await logError(`applicant_status_export///02///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`applicant_status_export///01///${e.toString()}`) }
    return
});



export const getApprovedUserIds = async (auctionId: string): Promise<string[]> => {
    let userIds: string[] = []
    const db: FirebaseFirestore.Firestore = admin.firestore()

    const auctionApprovalDoc = await db.collection('auctionApprovals').doc(auctionId).get()
    if (!auctionApprovalDoc.exists || auctionApprovalDoc == undefined) {
        console.log(`getApprovedUserIds returning empty 01 - auc doc NA for aucId ${auctionId}`)
        return [];
    }

    const dataAfterAuctionApprovalDoc = auctionApprovalDoc.data()

    if (dataAfterAuctionApprovalDoc == null ||
        dataAfterAuctionApprovalDoc == undefined ||
        dataAfterAuctionApprovalDoc.individualsMap == null ||
        dataAfterAuctionApprovalDoc.individualsMap == undefined
    ) {
        console.log(`getApprovedUserIds returning empty 02`)
        return [];
    }

    const individualsMapAfter = dataAfterAuctionApprovalDoc.individualsMap!
    const individualsMapAfterObject: Map<string, any> = new Map(Object.entries(individualsMapAfter));
    if (individualsMapAfterObject == null || individualsMapAfterObject == undefined) {
        console.log(`getApprovedUserIds returning empty 03`)
        return [];
    }

    const individualsUserIds = Array.from(individualsMapAfterObject.keys())
    console.log(`getApprovedUserIds found total: ${individualsUserIds.length}`)

    for (const userId of individualsUserIds) {
        const individualMapAfter = individualsMapAfterObject.get(userId)
        if (individualMapAfter != undefined) {
            const innerAfter: Map<string, any> = new Map(Object.entries(individualMapAfter));
            const applicationStatus = innerAfter.get('applicationStatus')
            if (applicationStatus == 'approved') {
                userIds.push(userId)
            }
        }
    }

    console.log(`getApprovedUserIds found approved: ${userIds.length}`)

    return userIds
}