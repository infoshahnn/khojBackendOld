// import * as functions from "firebase-functions";
// import admin = require('firebase-admin');
// import { eod, logError } from "..";


/*export const update_intraday_charts_export = functions.region('asia-south1').runWith({ maxInstances: 5, timeoutSeconds: 120, memory: '2GB' }).firestore.document(`random/triggerForIntraday`).onUpdate(async (change, context) => {
    try {
        const millisecondsInOneDay: number = 86400000
        const db: FirebaseFirestore.Firestore = admin.firestore();
        const postsHistoryIntradayQ = await db.collection('postsHistoryIntraday').get()
        console.log(`Found ${postsHistoryIntradayQ.docs.length} docs in postsHistoryIntradayQ`)

        const ratesQ = await db.collectionGroup('posts')
            .where('postCreatedAt', '>=', Date.now() - millisecondsInOneDay * 6)
            .get()

        console.log(`Found ${ratesQ.docs.length} docs in ratesQ`)

        for (const postsHistoryDoc of postsHistoryIntradayQ.docs) {
            try {
                const chartData = postsHistoryDoc.data()!.chartData
                if (chartData != null && chartData != undefined) {
                    const chartDataObj: Map<string, any> = new Map(Object.entries(chartData));
                    const chartDataKeys = Array.from(chartDataObj.keys())

                    for (const concat of chartDataKeys) {
                        try {
                            const varietyMap = chartDataObj.get(concat)
                            const varietyMapObj: Map<string, any> = new Map(Object.entries(varietyMap));
                            const variety = varietyMapObj.get('variety')
                            const companyId = varietyMapObj.get('companyId')

                            console.log(`Will check for variety ${variety} in cid ${companyId}`)

                            let intradayRates: Map<number, string> = new Map()

                            for (const rateDoc of ratesQ.docs) {
                                try {
                                    const d = rateDoc.data()
                                    const varietyInRateDoc = d.variety.toLowerCase()
                                    const companyIdInRateDoc = d.id
                                    const postCreatedAt = d.postCreatedAt ?? 0
                                    const rateFrom = d.rateFrom ?? 0
                                    const rateTo = d.rateTo ?? 0
                                    if (varietyInRateDoc == variety.toLowerCase() && companyId == companyIdInRateDoc && postCreatedAt != 0) {
                                        let rateStr = '';
                                        if (rateFrom != 0 && rateTo != 0)
                                            rateStr = `${rateFrom}-${rateTo}`
                                        else if (rateFrom != 0)
                                            rateStr = `${rateFrom}`
                                        else if (rateTo != 0)
                                            rateStr = `${rateTo}`

                                        if (rateStr != '')
                                            intradayRates.set(postCreatedAt, rateStr)
                                    }
                                } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///94///Error: ${e.toString()}`); }
                            }

                            let intradayRatesForUploading = Array.from(intradayRates).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                            console.log(`Will check for variety ${variety} in cid ${companyId}; made intradayRates: ${intradayRates.size}`)

                            const pathStr = `chartData.${concat}.intradayRates`
                            await postsHistoryDoc.ref.update({ [pathStr]: intradayRatesForUploading });

                        } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///95///Error: ${e.toString()}`); }
                    }
                }
            } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///91///Error: ${e.toString()}`); }
        }
    } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///02///${e.toString()}`); }

    return null;
});*/


// This was working well but the reads were too high so making it in flutter with less reads
// export const update_intraday_charts_2_export = functions.region('asia-south1').runWith({ maxInstances: 1, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`random/triggerForIntraday`).onUpdate(async (change, context) => {
//     await update_intraday_supporting(1);

//     // try {
//     //     const millisecondsInOneDay: number = 86400000
//     //     const db: FirebaseFirestore.Firestore = admin.firestore();

//     //     const homeRatesDoc = await db.collection('display').doc('homeRates').get();
//     //     if (!homeRatesDoc.exists || homeRatesDoc.data() == null || homeRatesDoc.data() == undefined ||
//     //         homeRatesDoc.data()!.itemsHavingIntradayRates == undefined ||
//     //         homeRatesDoc.data()!.itemsHavingIntradayRates == null
//     //     ) return

//     //     const itemsHavingIntradayRates: string[] = homeRatesDoc.data()!.itemsHavingIntradayRates ?? []
//     //     let eodMil = eod(Date.now())

//     //     let lastHowManyDays: number = 4
//     //     // if (Date.now() < 1731916277009) lastHowManyDays = 12

//     //     const ratesQ = await db.collectionGroup('posts')
//     //         .where('postCreatedAt', '>=', eodMil - millisecondsInOneDay * lastHowManyDays)
//     //         .get()

//     //     console.log(`Found ${ratesQ.docs.length} docs in ratesQ; keywords: ${itemsHavingIntradayRates}`)

//     //     for (const keyword of itemsHavingIntradayRates) {
//     //         if (keyword != '') {
//     //             const docPath = `00_${keyword}_chartData`
//     //             // console.log(`Found doc for ${keyword}}`)

//     //             const historyDoc = await db.collection('postsHistory').doc(docPath).get()
//     //             if (!historyDoc.exists) {
//     //                 console.log(`Error: Did not find postsHistory doc for ${keyword}}`)
//     //             } else {
//     //                 // console.log(`Found doc for ${keyword}}`)

//     //                 // for (const historyDoc of historyQ.docs) {
//     //                 try {
//     //                     const chartData = historyDoc.data()!.chartData
//     //                     if (chartData != null && chartData != undefined) {
//     //                         const chartDataObj: Map<string, any> = new Map(Object.entries(chartData));
//     //                         const chartDataKeys = Array.from(chartDataObj.keys())

//     //                         for (const concat of chartDataKeys) {
//     //                             try {
//     //                                 const varietyMap = chartDataObj.get(concat)
//     //                                 const varietyMapObj: Map<string, any> = new Map(Object.entries(varietyMap));
//     //                                 const variety = varietyMapObj.get('variety') ?? ''
//     //                                 const companyId = varietyMapObj.get('companyId') ?? ''
//     //                                 const otherVarieties = varietyMapObj.get('otherVarieties') ?? []

//     //                                 // console.log(`For ${keyword} > ${concat} `)

//     //                                 if (variety != '' && companyId != '') {
//     //                                     // console.log(`Will check for variety ${variety} in cid ${companyId}`)

//     //                                     let intradayRates: Map<number, string> = new Map()

//     //                                     for (const rateDoc of ratesQ.docs) {
//     //                                         try {
//     //                                             const d = rateDoc.data()
//     //                                             const varietyInRateDoc = (d.variety ?? '').toLowerCase()

//     //                                             const companyIdInRateDoc = d.id
//     //                                             const postCreatedAt = d.postCreatedAt ?? 0
//     //                                             const rateFrom = d.rateFrom ?? 0
//     //                                             const rateTo = d.rateTo ?? 0

//     //                                             let varietyMatches: boolean = varietyInRateDoc == variety.toLowerCase()

//     //                                             try {
//     //                                                 for (const otherVariety of otherVarieties) {
//     //                                                     if (otherVariety.toLowerCase() == varietyInRateDoc.toLowerCase())
//     //                                                         varietyMatches = true
//     //                                                 }
//     //                                             } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///34///Error: ${e.toString()}`); }


//     //                                             if (varietyMatches && companyId == companyIdInRateDoc && postCreatedAt != 0) {
//     //                                                 let rateStr = '';
//     //                                                 if (rateFrom != 0 && rateTo != 0)
//     //                                                     rateStr = `${rateFrom}-${rateTo}`
//     //                                                 else if (rateFrom != 0)
//     //                                                     rateStr = `${rateFrom}`
//     //                                                 else if (rateTo != 0)
//     //                                                     rateStr = `${rateTo}`

//     //                                                 if (rateStr != '')
//     //                                                     intradayRates.set(postCreatedAt, rateStr)
//     //                                             }
//     //                                         } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///94///Error: ${e.toString()}`); }
//     //                                     }

//     //                                     let intradayRatesForUploading = Array.from(intradayRates).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
//     //                                     // console.log(`Will check for variety ${variety} in cid ${companyId}; made intradayRates: ${intradayRates.size}`)

//     //                                     const pathStr = `chartData.${concat}.intradayRates`
//     //                                     await historyDoc.ref.update({ [pathStr]: intradayRatesForUploading });
//     //                                 } else {
//     //                                     logError(`cron_intraday_export///75///Error: variety or companyId missing in ${historyDoc.id} > ${concat}`)
//     //                                 }
//     //                             } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///95///Error: ${e.toString()}`); }
//     //                         }
//     //                     }
//     //                 } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///91///Error: ${e.toString()}`); }
//     //             }
//     //         }
//     //     }
//     // } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///02///${e.toString()}`); }

//     return null;
// });

// export const cron_update_intraday_1_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '1GB' }).pubsub.schedule('*/7 20-23 * * *').onRun(async (context) => {
//     await update_intraday_supporting(2);
//     return
// })

// export const cron_update_intraday_2_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '1GB' }).pubsub.schedule('*/7 0-4 * * *').onRun(async (context) => {
//     await update_intraday_supporting(3);
//     return
// })

// export const update_intraday_supporting = async (inputNumber: number) => {
//     try {
//         console.log(`Source: ${inputNumber}`)
//         const millisecondsInOneDay: number = 86400000
//         const db: FirebaseFirestore.Firestore = admin.firestore();

//         const homeRatesDoc = await db.collection('display').doc('homeRates').get();
//         if (!homeRatesDoc.exists || homeRatesDoc.data() == null || homeRatesDoc.data() == undefined ||
//             homeRatesDoc.data()!.itemsHavingIntradayRates == undefined ||
//             homeRatesDoc.data()!.itemsHavingIntradayRates == null
//         ) return

//         const itemsHavingIntradayRates: string[] = homeRatesDoc.data()!.itemsHavingIntradayRates ?? []
//         let eodMil = eod(Date.now())

//         let lastHowManyDays: number = 4
//         // if (Date.now() < 1731916277009) lastHowManyDays = 12

//         const ratesQ = await db.collectionGroup('posts')
//             .where('postCreatedAt', '>=', eodMil - millisecondsInOneDay * lastHowManyDays)
//             .get()

//         console.log(`Found ${ratesQ.docs.length} docs in ratesQ; keywords: ${itemsHavingIntradayRates}`)

//         for (const keyword of itemsHavingIntradayRates) {
//             if (keyword != '') {
//                 const docPath = `00_${keyword}_chartData`
//                 // console.log(`Found doc for ${keyword}}`)

//                 const historyDoc = await db.collection('postsHistory').doc(docPath).get()
//                 if (!historyDoc.exists) {
//                     console.log(`Error: Did not find postsHistory doc for ${keyword}}`)
//                 } else {
//                     // console.log(`Found doc for ${keyword}}`)

//                     // for (const historyDoc of historyQ.docs) {
//                     try {
//                         const chartData = historyDoc.data()!.chartData
//                         if (chartData != null && chartData != undefined) {
//                             const chartDataObj: Map<string, any> = new Map(Object.entries(chartData));
//                             const chartDataKeys = Array.from(chartDataObj.keys())

//                             for (const concat of chartDataKeys) {
//                                 try {
//                                     const varietyMap = chartDataObj.get(concat)
//                                     const varietyMapObj: Map<string, any> = new Map(Object.entries(varietyMap));
//                                     const variety = varietyMapObj.get('variety') ?? ''
//                                     const companyId = varietyMapObj.get('companyId') ?? ''
//                                     const otherVarieties = varietyMapObj.get('otherVarieties') ?? []

//                                     // console.log(`For ${keyword} > ${concat} `)

//                                     if (variety != '' && companyId != '') {
//                                         // console.log(`Will check for variety ${variety} in cid ${companyId}`)

//                                         let intradayRates: Map<number, string> = new Map()

//                                         for (const rateDoc of ratesQ.docs) {
//                                             try {
//                                                 const d = rateDoc.data()
//                                                 const varietyInRateDoc = (d.variety ?? '').toLowerCase()

//                                                 const companyIdInRateDoc = d.id
//                                                 const postCreatedAt = d.postCreatedAt ?? 0
//                                                 const rateFrom = d.rateFrom ?? 0
//                                                 const rateTo = d.rateTo ?? 0

//                                                 let varietyMatches: boolean = varietyInRateDoc == variety.toLowerCase()

//                                                 try {
//                                                     for (const otherVariety of otherVarieties) {
//                                                         if (otherVariety.toLowerCase() == varietyInRateDoc.toLowerCase())
//                                                             varietyMatches = true
//                                                     }
//                                                 } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///34///Error: ${e.toString()}`); }


//                                                 if (varietyMatches && companyId == companyIdInRateDoc && postCreatedAt != 0) {
//                                                     let rateStr = '';
//                                                     if (rateFrom != 0 && rateTo != 0)
//                                                         rateStr = `${rateFrom}-${rateTo}`
//                                                     else if (rateFrom != 0)
//                                                         rateStr = `${rateFrom}`
//                                                     else if (rateTo != 0)
//                                                         rateStr = `${rateTo}`

//                                                     if (rateStr != '')
//                                                         intradayRates.set(postCreatedAt, rateStr)
//                                                 }
//                                             } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///94///Error: ${e.toString()}`); }
//                                         }

//                                         let intradayRatesForUploading = Array.from(intradayRates).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
//                                         // console.log(`Will check for variety ${variety} in cid ${companyId}; made intradayRates: ${intradayRates.size}`)

//                                         const pathStr = `chartData.${concat}.intradayRates`
//                                         await historyDoc.ref.update({ [pathStr]: intradayRatesForUploading });
//                                     } else {
//                                         logError(`cron_intraday_export///75///Error: variety or companyId missing in ${historyDoc.id} > ${concat}`)
//                                     }
//                                 } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///95///Error: ${e.toString()}`); }
//                             }
//                         }
//                     } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///91///Error: ${e.toString()}`); }
//                 }
//             }
//         }
//     } catch (e) { if (e instanceof Error) await logError(`cron_intraday_export///02///${e.toString()}`); }

//     return null;
// }