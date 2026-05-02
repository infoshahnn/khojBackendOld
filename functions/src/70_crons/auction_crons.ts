import * as functions from "firebase-functions";
// import { createViewCompanyNotificationSupporting } from "..";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { logError } from "..";
// import { nSelfForCompany } from "..";
let usersCollectionString = 'testCollectionUsers';
// let companiesCollectionStringV2 = 'companiesV2';
// let userInfoCollectionString = 'userInfo';


export const cron_auction_coming_up_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '4GB' }).pubsub.schedule('0 19 * * *').onRun(async (context) => {

    try {
        const db: FirebaseFirestore.Firestore = admin.firestore();
        let now = Date.now()
        const fromMil: number = now
        const toMil: number = now + 3600 * 24 * 1000
        const todayAuctions = await db.collection('auctions').where('startMil', '>', fromMil).where('startMil', '<=', toMil).get()
        console.log(`1 Found ${todayAuctions.docs.length} from ${fromMil} to ${toMil}`)

        let companyIdConcatsMap = new Map<string, string[]>()

        for (const aucDoc of todayAuctions.docs) {
            const data = aucDoc.data();
            if (data != null && data != undefined) {
                const cName = data.companyName;
                const cId = data.companyId;
                const keyword = data.keyword;
                const keywordDisplayEnglish = data.keywordDisplayEnglish;
                const keywordDisplayHindi = data.keywordDisplayHindi;
                let itemEnglish = keywordDisplayEnglish == null || keywordDisplayEnglish == undefined || keywordDisplayEnglish == '' ? data?.itemEnglish || keyword : keywordDisplayEnglish;
                let itemHindi = keywordDisplayHindi == null || keywordDisplayHindi == undefined || keywordDisplayHindi == '' ? data?.itemHindi || keyword : keywordDisplayHindi;
                const startMil = data.startMil;
                console.log(`2 ${cName}`)


                if (cName != null && cName != '' && cName != undefined &&
                    cId != null && cId != '' && cId != undefined &&
                    itemEnglish != null && itemEnglish != '' && itemEnglish != undefined &&
                    itemHindi != null && itemHindi != '' && itemHindi != undefined &&
                    startMil != null && startMil != undefined && startMil != 0
                ) {
                    console.log(`3 ${cName}`)

                    const startTime = new Date(startMil).toLocaleTimeString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true
                    });

                    let concatsListForAuctionsOfThisCompany: string[] = companyIdConcatsMap.get(cId) || []

                    let concat = '';

                    concat = `${cName}///${startTime}///${itemEnglish}///${itemHindi}`; // companyName, startMil, itemEnglish, itemHindi, keyword

                    console.log(`4 ${concat}`)

                    concatsListForAuctionsOfThisCompany.push(concat)
                    companyIdConcatsMap.set(cId, concatsListForAuctionsOfThisCompany)
                } else {
                    console.log(`5 should not be here`)
                }
            } else {
                console.log(`6 should not be here`)
            }
        }

        try {
            for (const cId of companyIdConcatsMap.keys()) {
                const concatsList: string[] = companyIdConcatsMap.get(cId)!
                console.log(`7 ${concatsList.length} concatsList for cId ${cId}`)

                const auctionApprovalsDoc = await db.collection('auctionApprovals').doc(cId).get()
                const aDocData = auctionApprovalsDoc.data()
                if (aDocData != null &&
                    aDocData != undefined &&
                    aDocData.individualsMap != null &&
                    aDocData.individualsMap != undefined
                ) {
                    console.log(`8 found approval doc for cId ${cId}`)

                    const iMap = aDocData.individualsMap!

                    const indisMap: Map<string, any> = new Map(Object.entries(iMap));

                    // const indisMap = aDocData.individualsMap!

                    for (const concatOfOneAuction of concatsList) {
                        const cName: string = concatOfOneAuction.split('///')[0]
                        const startTime: string = concatOfOneAuction.split('///')[1]
                        const itemEnglish: string = concatOfOneAuction.split('///')[2]
                        const itemHindi: string = concatOfOneAuction.split('///')[3]

                        try {
                            for (const candidateUserId of indisMap.keys()) {
                                const candidateMap = indisMap.get(candidateUserId)

                                try {
                                    if (candidateMap != null && candidateMap != undefined &&
                                        candidateMap.userId != undefined && candidateMap.userId != null &&
                                        candidateMap.number != undefined && candidateMap.number != null
                                    ) {
                                        const hindi = `आज ऑक्शन होगा @ *${startTime}*, ${itemHindi} के लिए, कंपनी - *${cName}*`
                                        const english = `Auction starts @ *${startTime}* for ${itemEnglish} for *${cName}*`

                                        let userTokensToNotify = []
                                        let userPhonesToNotify = []

                                        const userInfoDoc = await db.collection(usersCollectionString).doc(candidateMap.userId).collection('userInfo').doc('userInfo').get();

                                        if (userInfoDoc != null && userInfoDoc != undefined && userInfoDoc.data() != null && userInfoDoc.data() != undefined) {
                                            const userInfoDocData = userInfoDoc.data()!

                                            userPhonesToNotify.push(candidateMap.number)

                                            if (userInfoDocData.deviceInfo != null && userInfoDocData.deviceInfo != undefined) {
                                                const deviceInfo = userInfoDocData.deviceInfo
                                                if (deviceInfo != null && deviceInfo != undefined && deviceInfo.token != undefined && deviceInfo.token != null && deviceInfo.token != '') {
                                                    userTokensToNotify.push(deviceInfo.token);
                                                    console.log(`Device token added: ${deviceInfo.token}`);
                                                }
                                            }
                                        }

                                        //console.log(`9 - english: ${english}, hindi: ${hindi}, userTokensToNotify: ${userTokensToNotify.length}, userPhonesToNotify: ${userPhonesToNotify.length}`)

                                        try {
                                            await db.collection('notifications').add({
                                                'tokens': userTokensToNotify,
                                                'title': english,
                                                'body': hindi,
                                                'status': 'pending',
                                                'createdAt': Date.now(),
                                                'createdAtForIndexing': Date.now(),
                                                'source': 'auctionComingUp',
                                                'userNumbers': userPhonesToNotify,
                                                // 'destinationAuctionHostCompanyId': 
                                            })

                                        } catch (e) { if (e instanceof Error) await logError(`cron_auction_coming_up_export///04///${e.toString()}`) }
                                    } else {
                                        console.log(`91 should not be here`)
                                    }
                                } catch (e) { if (e instanceof Error) await logError(`cron_auction_coming_up_export///11///${e.toString()}`) }

                            }
                        } catch (e) { if (e instanceof Error) await logError(`cron_auction_coming_up_export///03///${e.toString()}`) }
                    }
                } else {
                    console.log(`90 approval doc NOT FOUND`)
                }
            }
        } catch (e) { if (e instanceof Error) await logError(`cron_auction_coming_up_export///02///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`cron_auction_coming_up_export///01///${e.toString()}`) }
    return;
});