import * as functions from "firebase-functions";
// import { createViewCompanyNotificationSupporting } from "..";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { eod, getCommon, incrementReadWriteCounts, incrementReadWriteCountsV2, logError, numbersToExcludeFromEmployeesCount, restrictedNumbersList, superAdmins } from "..";
// import { nSelfForCompany } from "..";
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';
let userInfoCollectionString = 'userInfo';




export const cron_active_users_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 13 * * *').onRun(async (context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  try {
    const millisecondsInOneDay: number = 86400000

    // for (let i = 0; i < 1; i++) {
    // basics
    let nowMil = Date.now() - millisecondsInOneDay * 0//i
    let eodMil = eod(nowMil) - millisecondsInOneDay
    let startMil = eodMil - millisecondsInOneDay
    const db: FirebaseFirestore.Firestore = admin.firestore();
    console.log(`started for mils: ${startMil + 1} to ${eodMil}`)

    let activeUsers: string[] = []

    // new users
    const userInfoDocs = await db.collectionGroup(userInfoCollectionString).where('createdAt', '>', startMil).where('createdAt', '<=', eodMil).get()
    readsCounter += userInfoDocs.docs.length
    try {
      for (const uInfoDoc of userInfoDocs.docs) {
        if (uInfoDoc != null && uInfoDoc != undefined && uInfoDoc.data() != undefined && uInfoDoc.data().ownNumber != null && uInfoDoc.data().ownNumber != undefined && uInfoDoc.data().ownNumber != '') {
          const ownN = uInfoDoc.data().ownNumber
          activeUsers.push(ownN)
        }
      }
    } catch (e) { if (e instanceof Error) await logError(`cron_active_users///94///Error: ${e.toString()}`); }

    // active users from search history
    const searchHistoryDocs = await db.collection('searchHistoryV2').where('milSinceEpoch', '>', startMil).where('milSinceEpoch', '<=', eodMil).get()
    readsCounter += searchHistoryDocs.docs.length

    for (const doc of searchHistoryDocs.docs)
      try {
        const data = doc.data()
        if (data != null && data != undefined && doc.get('ownNumber') != null && doc.get('ownNumber') != undefined && doc.get('ownNumber') != '') {
          activeUsers.push(doc.get('ownNumber'));
          const historyType = data.historyType
          if (historyType != null && historyType != undefined && historyType == 'interestedInUpgrading') {
            const path = `interestedInUpgrading.${doc.get('ownNumber')}`
            if (path != '') {
              await db.collection('random').doc('interestedInUpgrading').update({ [path]: admin.firestore.FieldValue.arrayUnion(eodMil) })
              writesCounter++
            }
          }
        }
      } catch (e) { if (e instanceof Error) await logError(`cron_active_users///01a///ownNumber probably NA for searchHistoryDoc id: ${doc.id}; Error: ${e.toString()}`); }

    const searchHistoryV3Docs = await db.collection('searchHistoryV3').where('milSinceEpoch', '>', startMil).where('milSinceEpoch', '<=', eodMil).get()
    readsCounter += searchHistoryV3Docs.docs.length
    for (const doc of searchHistoryV3Docs.docs)
      try {
        if (doc.get('ownNumber') != null && doc.get('ownNumber') != undefined && doc.get('ownNumber') != '')
          activeUsers.push(doc.get('ownNumber'));
      } catch (e) { if (e instanceof Error) await logError(`cron_active_users///01y///ownNumber probably NA for searchHistoryDoc id: ${doc.id}; Error: ${e.toString()}`); }


    // active users from lastHomeLoad
    const lastHomeLoadUsers = await db.collection(usersCollectionString).where('lastHomeLoad', '>', startMil).where('lastHomeLoad', '<=', eodMil).get()
    readsCounter += lastHomeLoadUsers.docs.length

    for (const doc of lastHomeLoadUsers.docs)
      try {
        if (doc.get('ownNumber') != null && doc.get('ownNumber') != undefined && doc.get('ownNumber') != '')
          activeUsers.push(doc.get('ownNumber'));
      } catch (e) { if (e instanceof Error) await logError(`cron_active_users///01b///ownNumber probably NA for searchHistoryDoc id: ${doc.id}; Error: ${e.toString()}`); }

    activeUsers = [...new Set(activeUsers)]
    // console.log(`Found from searchHistory ${searchHistoryDocs.docs}, lastHomeLoad ${lastHomeLoadUsers.docs}, total ${activeUsers.length}`)

    await db.collection('counts').doc('activeUsers').update({
      [`counts.${eodMil}.newUsers`]: userInfoDocs.docs.length,
      [`counts.${eodMil}.activeUsers`]: activeUsers.length,
      lastUpdated: Date.now(),
    })
    writesCounter++

    var d: Date = new Date(eodMil)
    var ds = d.toLocaleString();

    // var ds = `${d.getFullYear()}_${("0" + d.getMonth()).slice(-2)}_${("0" + d.getDate()).slice(-2)}`

    await db.collection('searchHistorySummary').doc(eodMil.toString()).set({
      'numbers': activeUsers,
      'count': activeUsers.length,
      'date': ds,
      'eodMil': eodMil,
      'lastUpdated': Date.now(),
      'fromMil': startMil + 1,
      'toMil': eodMil,
    })
    writesCounter++
    console.log(`readsCounter: ${readsCounter}`)

    // try {

    //   let companyIdNameAndCounts: Map<string, number> = new Map()

    //   for (const doc of searchHistoryDocs.docs) {
    //     try {
    //       const d = doc.data()

    //       let numberBeingContacted = ''
    //       let numberInitiatedTheContact = ''

    //       if (d.historyType == 'contactDirectly' && d.employeeNumber != undefined && d.employeeNumber != null && d.employeeNumber != '' && !restrictedNumbersList.includes(d.employeeNumber)) {
    //         numberBeingContacted = d.employeeNumber
    //       } else if (d.historyType == 'contactIndirectly' && d.mutualNumber != undefined && d.mutualNumber != null && d.mutualNumber != '' && !restrictedNumbersList.includes(d.mutualNumber)) {
    //         numberBeingContacted = d.mutualNumber
    //       }

    //       if (numberBeingContacted != '' && d.ownNumber != undefined && d.ownNumber != null && d.ownNumber != '' && !restrictedNumbersList.includes(d.ownNumber) && !superAdmins.includes(d.ownNumber)) {
    //         numberInitiatedTheContact = d.ownNumber

    //         let userName = ''

    //         // get buyer's name saved with the user:
    //         const userQ = await db.collection(usersCollectionString).where('ownNumber', '==', numberBeingContacted).get()
    //         readsCounter += userQ.docs.length
    //         if (userQ.docs.length == 1) {
    //           const userDoc = userQ.docs[0]

    //           const userContactDoc = await userDoc.ref.collection(userInfoCollectionString).doc('contacts').get()
    //           readsCounter++
    //           if (userContactDoc.exists) {
    //             const userContactDocData = userContactDoc.data()
    //             if (userContactDocData != null && userContactDocData != undefined) {
    //               const conatactsMap = userContactDocData.contactsMap
    //               if (conatactsMap != undefined && conatactsMap != null) {
    //                 const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
    //                 const userNameTemp = conatactsMapObject.get(numberInitiatedTheContact)
    //                 if (userNameTemp != null && userNameTemp != undefined && userNameTemp != '') {
    //                   userName = `*${userNameTemp}*`
    //                 }
    //               }
    //             }
    //           }
    //         }

    //         // get buyer's company name:
    //         const userInitiatedQ = await db.collection(usersCollectionString).where('ownNumber', '==', numberInitiatedTheContact).get()
    //         readsCounter += userInitiatedQ.docs.length

    //         if (userInitiatedQ.docs.length == 1) {
    //           const ud = userInitiatedQ.docs[0].data()
    //           if (ud != null && ud != undefined && ud.companyNamesList != null && ud.companyNamesList != undefined && ud.companyNamesList.length > 0) {
    //             if (ud.companyNamesList[0] != null && ud.companyNamesList[0] != '') {
    //               if (userName == '') {
    //                 userName = `*${ud.companyNamesList[0]}*`
    //               } else {
    //                 userName = `*${userName}* / *${ud.companyNamesList[0]}*`
    //               }
    //             }

    //             if (userName == '' && ud.name != null && ud.name != undefined && ud.name != '') {
    //               userName = ud.name
    //             }
    //           }
    //         }

    //         if (userName == '') {
    //           userName = `*${numberInitiatedTheContact}*`
    //         } else {
    //           userName = `*${userName}* (${numberInitiatedTheContact})`
    //         }

    //         try {
    //           await db.collection('notifications').add({
    //             'tokens': [],
    //             'title': `${userName} tried to contact you through Khoj`,
    //             'body': `${userName} इन्होने आपसे खोज ऍप द्वारा संपर्क करने का प्रयास किया`,
    //             'status': 'pending',
    //             'createdAt': Date.now(),
    //             'createdAtForIndexing': Date.now(),
    //             'source': 'userContacted',
    //             'userNumbers': [numberBeingContacted],
    //             'destinationNumber': numberInitiatedTheContact,
    //           })
    //           writesCounter++
    //         } catch (e) {
    //           if (e instanceof Error) {
    //             await logError(`cron_active_users///14///${e.toString()}`);
    //             console.log(`ERROR ownNumber ${numberBeingContacted}: cron_active_users///14///${e.toString()}`);
    //           }
    //         }
    //       } else {
    //         // do nothing
    //       }

    //       try {
    //         if (d.historyType == 'viewCompany' && d.companyId != null && d.companyId != undefined && d.companyId != '' && d.companyName != null && d.companyName != undefined && d.companyName != '') {
    //           // try {
    //           //   const count = companyIdNameAndCounts.get(`${d.companyId}///${d.companyName}`)
    //           //   if (count == null || count == undefined) {
    //           //     companyIdNameAndCounts.set(`${d.companyId}///${d.companyName}`, 1)
    //           //   } else {
    //           //     companyIdNameAndCounts.set(`${d.companyId}///${d.companyName}`, count + 1)
    //           //   }
    //           // } catch (e) { if (e instanceof Error) await logError(`cron_active_users///81///Error: ${e.toString()}`); }
    //         }
    //       } catch (e) { if (e instanceof Error) await logError(`cron_active_users///74///${e.toString()}`) }
    //     } catch (e) { if (e instanceof Error) await logError(`cron_active_users///01///ownNumber probably NA for searchHistoryDoc id: ${doc.id}; Error: ${e.toString()}`); }
    //   }

    //   try {
    //     const lst: string[] = []
    //     for (const [keyString, value] of companyIdNameAndCounts) {
    //       lst.push(`${keyString}///${value}`)
    //     }
    //     try {
    //       await db.collection('notificationsUploader').doc('viewCompany').update({ 'viewCompany': admin.firestore.FieldValue.arrayUnion(...lst) })
    //       writesCounter++
    //     } catch (e) { if (e instanceof Error) await logError(`cron_active_users///84///${e.toString()}`); }
    //   } catch (e) { if (e instanceof Error) await logError(`cron_active_users///85///${e.toString()}`); }

    // } catch (e) { if (e instanceof Error) await logError(`cron_active_users///12///${e.toString()}`); }

    await incrementReadWriteCounts('cron_active_users', readsCounter, writesCounter, deletesCounter)
    // }





  } catch (e) { if (e instanceof Error) await logError(`cron_active_users///02///${e.toString()}`); }

  return null;
});

export const cron_hourly_notifications_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('* * * * *').onRun(async (context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  try {
    // const forLastHowManyMil: number = 3600000
    const forLastHowManyMil: number = 60000

    let endMil = Date.now()
    let startMil = endMil - forLastHowManyMil
    const db: FirebaseFirestore.Firestore = admin.firestore();

    // active users from search history
    const searchHistoryDocs = await db.collection('searchHistoryV2').where('milSinceEpoch', '>=', startMil).where('milSinceEpoch', '<', endMil).get()
    readsCounter += searchHistoryDocs.docs.length

    try {
      for (const doc of searchHistoryDocs.docs) {
        try {
          const d = doc.data()

          let numberBeingContacted = ''
          let numberInitiatedTheContact = ''
          let companyIdOfInitiator = null

          if (d.historyType == 'contactDirectly' && d.employeeNumber != undefined && d.employeeNumber != null && d.employeeNumber != '' && !restrictedNumbersList.includes(d.employeeNumber)) {
            numberBeingContacted = d.employeeNumber
          } else if (d.historyType == 'contactIndirectly' && d.mutualNumber != undefined && d.mutualNumber != null && d.mutualNumber != '' && !restrictedNumbersList.includes(d.mutualNumber)) {
            numberBeingContacted = d.mutualNumber
          }

          if (numberBeingContacted != '' && d.ownNumber != undefined && d.ownNumber != null && d.ownNumber != '' && !restrictedNumbersList.includes(d.ownNumber) && !superAdmins.includes(d.ownNumber)) {
            numberInitiatedTheContact = d.ownNumber

            let userName = ''
            let numberBeingContactedFresh: string[] = []

            // get buyer's name saved with the user:
            const userQ = await db.collection(usersCollectionString).where('ownNumber', '==', numberBeingContacted).get()
            readsCounter += userQ.docs.length
            if (userQ.docs.length == 1) {
              const userDoc = userQ.docs[0]

              const userContactDoc = await userDoc.ref.collection(userInfoCollectionString).doc('contacts').get()
              readsCounter++
              if (userContactDoc.exists) {
                const userContactDocData = userContactDoc.data()
                if (userContactDocData != null && userContactDocData != undefined) {
                  const contactsMap = userContactDocData.contactsMap
                  if (contactsMap != undefined && contactsMap != null) {
                    const conatactsMapObject: Map<string, any> = new Map(Object.entries(contactsMap));

                    const userNameTemp = conatactsMapObject.get(numberInitiatedTheContact)
                    if (userNameTemp != null && userNameTemp != undefined && userNameTemp != '') {
                      userName = `*${userNameTemp}*`
                    }

                    numberBeingContactedFresh = Array.from(conatactsMapObject.keys())
                    numberBeingContactedFresh = [...new Set(numberBeingContactedFresh)]
                  }
                }
              }
            }

            let numberInitiatedTheContactFresh: string[] = []

            // get buyer's company name:
            const userInitiatedQ = await db.collection(usersCollectionString).where('ownNumber', '==', numberInitiatedTheContact).get()
            readsCounter += userInitiatedQ.docs.length

            if (userInitiatedQ.docs.length == 1) {
              const ud = userInitiatedQ.docs[0].data()
              if (ud != null && ud != undefined && ud.companyNamesList != null && ud.companyNamesList != undefined && ud.companyNamesList.length > 0) {
                if (ud.companyNamesList[0] != null && ud.companyNamesList[0] != '') {
                  if (userName == '') {
                    userName = `*${ud.companyNamesList[0]}*`
                  } else {
                    userName = `*${userName}* / *${ud.companyNamesList[0]}*`
                  }
                }

                if (userName == '' && ud.name != null && ud.name != undefined && ud.name != '') {
                  userName = ud.name
                }

                if (ud.contactsArrayFresh != null && ud.contactsArrayFresh != undefined) {
                  numberInitiatedTheContactFresh = ud.contactsArrayFresh
                }
              }

              if (ud != null && ud != undefined && ud.companyIdArray != null && ud.companyIdArray != undefined && ud.companyIdArray.length > 0 && ud.companyIdArray[0] != null && ud.companyIdArray[0] != undefined && ud.companyIdArray[0] != '') {
                companyIdOfInitiator = ud.companyIdArray[0]
              }
            }

            let mutuals: string[] = []

            if (numberInitiatedTheContactFresh != null && numberInitiatedTheContactFresh != undefined && numberInitiatedTheContactFresh.length > 0 &&
              numberBeingContactedFresh != null && numberBeingContactedFresh != undefined && numberBeingContactedFresh.length > 0) {
              mutuals = getCommon(numberInitiatedTheContactFresh, numberBeingContactedFresh)
            }

            if (userName == '') {
              userName = `*${numberInitiatedTheContact}*`
            } else {
              userName = `${userName} (${numberInitiatedTheContact})`
            }

            try {
              await db.collection('notifications').add({
                'tokens': [],
                'title': `${userName} tried to contact you through Khoj`,
                'body': `${userName} इन्होने आपसे खोज ऍप द्वारा संपर्क करने का प्रयास किया`,
                'status': 'pending',
                'createdAt': Date.now(),
                'createdAtForIndexing': Date.now(),
                'source': 'userContacted',
                'userNumbers': [numberBeingContacted],
                'destinationNumber': numberInitiatedTheContact,
                'destinationCompanyId': companyIdOfInitiator,
                'mutuals': mutuals,
              })
              writesCounter++
            } catch (e) {
              if (e instanceof Error) {
                await logError(`cron_hourly_notifications///14///${e.toString()}`);
                console.log(`ERROR ownNumber ${numberBeingContacted}: cron_hourly_notifications///14///${e.toString()}`);
              }
            }
          } else {
            // do nothing
          }

          try {
            if (d.historyType == 'viewCompany' && d.companyId != null && d.companyId != undefined && d.companyId != '' && d.companyName != null && d.companyName != undefined && d.companyName != '') {
              // try {
              //   const count = companyIdNameAndCounts.get(`${d.companyId}///${d.companyName}`)
              //   if (count == null || count == undefined) {
              //     companyIdNameAndCounts.set(`${d.companyId}///${d.companyName}`, 1)
              //   } else {
              //     companyIdNameAndCounts.set(`${d.companyId}///${d.companyName}`, count + 1)
              //   }
              // } catch (e) { if (e instanceof Error) await logError(`cron_active_users///81///Error: ${e.toString()}`); }
            }
          } catch (e) { if (e instanceof Error) await logError(`cron_hourly_notifications///74///${e.toString()}`) }
        } catch (e) { if (e instanceof Error) await logError(`cron_hourly_notifications///01///ownNumber probably NA for searchHistoryDoc id: ${doc.id}; Error: ${e.toString()}`); }
      }
    } catch (e) { if (e instanceof Error) await logError(`cron_hourly_notifications///12///${e.toString()}`); }

    await incrementReadWriteCounts('cron_hourly_notifications', readsCounter, writesCounter, deletesCounter)
    await incrementReadWriteCountsV2('cron_hourly_notifications', readsCounter, writesCounter, deletesCounter)

  } catch (e) { if (e instanceof Error) await logError(`cron_hourly_notifications///02///${e.toString()}`); }

  return null;
});

/*
export const cron_delete_network_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '4GB' }).pubsub.schedule('0 13 * * *').onRun(async (context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  const now = Date.now()
  const cutOffMil: number = now - (4 * 24 * 3600 * 1000)
  const db: FirebaseFirestore.Firestore = admin.firestore();
  const usersCollec = db.collection(usersCollectionString)

  try {
    let nums = []
    // fetch users last active 4~6 days ago
    const q = await usersCollec
      .where('lastHomeLoad', '<', cutOffMil)
      .where('lastHomeLoad', '>=', cutOffMil - 2 * (4 * 24 * 3600 * 1000))
      .get()

    readsCounter += q.docs.length
    for (const doc of q.docs) {
      if (doc != undefined && doc.data() != undefined &&
        doc.data().ownNumber != undefined &&
        doc.data().ownNumber != null &&
        doc.data().ownNumber != '') {
        nums.push(doc.data().ownNumber!)
      }
    }

    await db.collection('deleteNetworkUploader').doc('deleteNetworkUploader').update({ deleteNetworkUploader: admin.firestore.FieldValue.arrayUnion(...nums) })
    await incrementReadWriteCounts('cron_delete_network', readsCounter, writesCounter, deletesCounter)
    console.log(`Ending, took ${Math.floor((Date.now() - now) / 1000)}s, uploading ${nums.length} nums for deletion; reads, writes, deletes; ${readsCounter}, ${writesCounter}, ${deletesCounter}`)
  } catch (e) { if (e instanceof Error) await logError(`cron_delete_network///09///Error: ${e.toString()}`); }

  //   let numbersRecentlyActive: string[] = []
  //   const summaryQ = await db.collection('searchHistorySummary').where('eodMil', '>', cutOffMil + (24 * 3600 * 1000)).get()

  //   for (const summaryDoc of summaryQ.docs) {
  //     const summaryDocData = summaryDoc.data()
  //     if (summaryDocData != undefined && summaryDocData != null && summaryDocData.numbers != undefined && summaryDocData.numbers != null) {
  //       for (const n of summaryDocData.numbers) {
  //         numbersRecentlyActive.push(n)
  //       }
  //     }
  //   }
  //   numbersRecentlyActive = [...new Set(numbersRecentlyActive)]
  //   console.log(`found ${summaryQ.docs.length} docs; numbersRecentlyActive.len: ${numbersRecentlyActive.length}`)

  //   let keepSearching: boolean = true;
  //   let lastDoc
  //   while (keepSearching) {
  //     let q

  //     if (lastDoc == null || lastDoc == undefined) {
  //       q = await usersCollec.where('lastHomeLoad', '<', cutOffMil).orderBy('lastHomeLoad', 'desc').limit(50).get()
  //       readsCounter += q.docs.length
  //     } else {
  //       q = await usersCollec.where('lastHomeLoad', '<', cutOffMil).orderBy('lastHomeLoad', 'desc').startAfter(lastDoc).limit(50).get()
  //       readsCounter += q.docs.length

  //     }

  //     if (q.docs.length == 0) {
  //       console.log(`Ending as no more docs found ,took ${Math.floor((Date.now() - now) / 1000)} seconds`)
  //       return
  //     } else {
  //       lastDoc = q.docs[q.docs.length - 1]
  //     }

  //     let forUploading: string[] = []

  //     for (const doc of q.docs) {
  //       const docData = doc.data()

  //       if (docData != undefined && docData != null) {
  //         if (docData.networkDeletedAt != null && docData.networkDeletedAt != undefined && (docData.contactsArrayOld == null || docData.contactsArrayOld == undefined || docData.contactsArrayOld.length == 0)) {
  //           console.log(`Ending as found doc for which already deleted; deletedAt: ${docData.networkDeletedAt}, old len: ${docData.contactsArrayOld.legth}`)
  //           return
  //         }

  //         if (
  //           docData.createdAt != null && docData.createdAt != undefined && docData.createdAt <= cutOffMil &&
  //           docData.ownNumber != null && docData.ownNumber != undefined && docData.ownNumber != '' &&
  //           !numbersRecentlyActive.includes(docData.ownNumber)
  //         ) {
  //           // await db.collection('deleteNetwork').doc(docData.ownNumber).set({ 'milSinceEpoch': now })
  //           forUploading.push(docData.ownNumber)
  //           console.log(`Will delete network docs for ${docData.ownNumber}, id: ${doc.id}`)
  //         } else {
  //           console.log(`Will NOT delete network docs for ${docData.ownNumber}, id: ${doc.id}; createdAt: ${docData.createdAt}, active: ${numbersRecentlyActive.includes(docData.ownNumber)}`)
  //         }
  //       }
  //     }

  //     await db.collection('deleteNetworkUploader').doc('deleteNetworkUploader').update({ deleteNetworkUploader: admin.firestore.FieldValue.arrayUnion(...forUploading) })
  //     writesCounter++
  //     // keepSearching = false
  //   }
  //   console.log(`Ending, took ${Math.floor((Date.now() - now) / 1000)} seconds; reads, writes, deletes; ${readsCounter}, ${writesCounter}, ${deletesCounter}`)
  //   await incrementReadWriteCounts('cron_delete_network', readsCounter, writesCounter, deletesCounter)
  // } catch (e) { if (e instanceof Error) await logError(`cron_delete_network///01///Error: ${e.toString()}`); }

  return
});*/

export const cron_broker_companies_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '4GB' }).pubsub.schedule('0 13 * * *').onRun(async (context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  const db: FirebaseFirestore.Firestore = admin.firestore();
  const companiesCollec = db.collection(companiesCollectionStringV2)
  let nums: string[] = []
  try {
    const q = await companiesCollec.where('createdAt', '>=', Date.now() - (1.1 * 24 * 3600 * 1000)).get();
    readsCounter += q.docs.length
    for (const doc of q.docs) {
      const d = doc.data()
      if (d.broker == true) {
        if (d.phoneOne != null && d.phoneOne != undefined && d.phoneOne != '') nums.push(d.phoneOne)
        if (d.whatsapp != null && d.whatsapp != undefined && d.whatsapp != '') nums.push(d.whatsapp)
        if (d.phoneTwo != null && d.phoneTwo != undefined && d.phoneTwo != '') nums.push(d.phoneTwo)
        if (d.phoneThree != null && d.phoneThree != undefined && d.phoneThree != '') nums.push(d.phoneThree)
        nums = [...new Set(nums)]
      }
    }

    if (nums.length > 0) {
      await db.collection('display').doc('brokers').update({ 'registeredBrokers': admin.firestore.FieldValue.arrayUnion(...nums), 'lastUpdated': Date.now() })
      writesCounter++

    }

    await incrementReadWriteCounts('cron_broker_companies', readsCounter, writesCounter, deletesCounter)
  } catch (e) { if (e instanceof Error) await logError(`cron_broker_companies///01///Error: ${e.toString()}`); }
});

export const cron_search_history_summarize_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '4GB' }).pubsub.schedule('0 13 * * *').onRun(async (context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  const db: FirebaseFirestore.Firestore = admin.firestore();
  const searchHistoryV2Collec = db.collection('searchHistoryV2')
  const millisecondsInOneDay: number = 86400000

  console.log(`01 - started`)

  try {
    const start: number = eod(Date.now() - millisecondsInOneDay * 2)// millisecondsInOneDay
    const end: number = start + millisecondsInOneDay
    const searchHistoryDocs = await searchHistoryV2Collec.where('milSinceEpoch', '>=', start).where('milSinceEpoch', '<', end).get();
    readsCounter += searchHistoryDocs.docs.length

    let historyTypeCounts = new Map<string, number>([
      // ["cotton", "cotton"],
    ])
    let keywordCounts = new Map<string, number>([])
    let sourceCounts = new Map<string, number>([])
    let concatCounts = new Map<string, number>([])
    let projectVersionCounts = new Map<string, number>([])

    let historyTypeCounter: number = 0
    let keywordCounter: number = 0
    let sourceCounter: number = 0

    console.log(`02 - found ${searchHistoryDocs.docs.length}`)

    for (const doc of searchHistoryDocs.docs) {
      try {
        const data = doc.data()
        if (data != null && data != undefined) {

          const source = data.source ?? ''
          if (source != null && source != undefined && source != '') {
            sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1)
            sourceCounter++
          }

          const historyType: string = data.historyType ?? ''
          if (historyType != null && historyType != undefined && historyType != '') {
            historyTypeCounts.set(historyType, (historyTypeCounts.get(historyType) ?? 0) + 1)
            historyTypeCounter++
          }

          const keyword = data.keyword ?? ''
          if (keyword != null && keyword != undefined && keyword != '') {
            keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1)
            keywordCounter++
          }

          const projectVersion = data.projectVersion ?? ''
          if (projectVersion != null && projectVersion != undefined && projectVersion != '') {
            projectVersionCounts.set(projectVersion, (projectVersionCounts.get(projectVersion) ?? 0) + 1)
          }

          const concat: string = `${source}-/${historyType}-/${keyword}`
          concatCounts.set(concat, (concatCounts.get(concat) ?? 0) + 1)

        }
      } catch (e) { if (e instanceof Error) await logError(`cron_search_history_summarize///1///Error: ${e.toString()}`); }
    }

    console.log(`02 - historyTypeCounter: ${historyTypeCounter} keywordCounter: ${keywordCounter} sourceCounter: ${sourceCounter}`)

    try {
      // let historyTypeCountsForUploading = Array.from(historyTypeCounts).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
      // let keywordCountsForUploading = Array.from(keywordCounts).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
      // let sourceCountsForUploading = Array.from(sourceCounts).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
      let concatCountsForUploading = Array.from(concatCounts).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
      let projectVersionCountsForUploading = Array.from(projectVersionCounts).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

      console.log(`03`)

      try {
        const doc = await db.collection('searchHistorySummary2').doc(end.toString()).get()
        if (!doc.exists) {
          await doc.ref.set({
            // 'historyTypeCounts': historyTypeCountsForUploading,
            // 'keywordCounts': keywordCountsForUploading,
            // 'sourceCounts': sourceCountsForUploading,
            'concatCounts': concatCountsForUploading,
            'eodMil': end,
            'projectVersionCounts': projectVersionCountsForUploading,
          })
        } else {
          await doc.ref.update({
            'concatCounts': concatCountsForUploading,
            'eodMil': end,
            'projectVersionCounts': projectVersionCountsForUploading,
          })
        }
      } catch (e) { if (e instanceof Error) await logError(`cron_search_history_summarize///3///Error: ${e.toString()}`); }
    } catch (e) { if (e instanceof Error) await logError(`cron_search_history_summarize///2///Error: ${e.toString()}`); }

    await incrementReadWriteCounts('cron_search_history_summarize', readsCounter, writesCounter, deletesCounter)
  } catch (e) { if (e instanceof Error) await logError(`cron_broker_companies///01///Error: ${e.toString()}`); }
  return;
});


export const cron_search_history_keywords_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 14 * * *').onRun(async (context) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  const searchHistoryV2Collec = db.collection('searchHistoryV2')
  const millisecondsInOneDay: number = 86400000

  console.log(`001 - started`)

  try {
    // let i = 0
    // if (true) {
    let lastHowManyDaysUpdate = 1
    for (let i = 0; i < lastHowManyDaysUpdate; i++) {
      const start: number = eod(Date.now() - millisecondsInOneDay * 2) - (millisecondsInOneDay * i) // millisecondsInOneDay
      const end: number = start + millisecondsInOneDay
      console.log(`01 working on searchHistorySummary2 > doc ${end.toString()} (${i} days ago)`)

      const searchHistoryDocs = await searchHistoryV2Collec.where('milSinceEpoch', '>=', start).where('milSinceEpoch', '<', end).get();

      let keywordsMap: Map<string, string[]> = new Map()

      for (const doc of searchHistoryDocs.docs) {
        try {
          const data = doc.data()
          if (data != null && data != undefined) {
            const historyType: string = data.historyType ?? ''
            const keyword = data.keyword ?? ''
            const ownNumber = data.ownNumber ?? ''

            if (historyType == 'cardOpened' && keyword != '' && ownNumber != '') {
              let nums = keywordsMap.get(keyword) ?? []
              nums.push(ownNumber)
              nums = [...new Set(nums)]
              keywordsMap.set(keyword, nums)
            }
          }
        } catch (e) { if (e instanceof Error) await logError(`cron_search_history_keywords///1///Error: ${e.toString()}`); }
      }

      console.log(`02 working on searchHistorySummary2 > doc ${end.toString()}`)

      const doc = await db.collection('searchHistorySummary2').doc(end.toString()).get()
      let keywordsMapForUploading = Array.from(keywordsMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

      if (!doc.exists) {
        await doc.ref.set({
          'keywordsMap': keywordsMapForUploading,
          'eodMil': end,
        })
      } else {
        await doc.ref.update({
          'keywordsMap': keywordsMapForUploading,
        })
      }
    }
  } catch (e) { if (e instanceof Error) await logError(`cron_search_history_keywords///01///Error: ${e.toString()}`); }
  return;
});


export const cron_premium_upgrade_notify_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 14 * * *').onRun(async (context) => {

  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const millisecondsInOneDay: number = 86400000
    let eodMil = eod(Date.now()) - millisecondsInOneDay
    let startMil = eodMil - millisecondsInOneDay

    const q = await db.collection('premiumActions').where('mil', '>=', startMil).where('mil', '<', eodMil).get()

    let idsNums = new Map<string, string>();

    for (const doc of q.docs) {
      try {
        const give = doc.data().giveAccessList
        if (give != null && give != undefined && give.length > 0) {
          const userNumber = doc.data().userNumber
          const userId = doc.data().userId

          if (
            userNumber != null && userNumber != undefined && userNumber != '' &&
            userId != null && userId != undefined && userId != ''
          ) {
            idsNums.set(userId, userNumber)
          }
        }
      } catch (e) { }
    }

    for (const userId of idsNums.keys()) {
      const userNumber = idsNums.get(userId)
      try {
        await prepareNotification(userId, userNumber!)
      } catch (e) { }
    }
  } catch (e) { if (e instanceof Error) await logError(`cron_premium_upgrade_notify_export///02///${e.toString()}`); }

  return null;
});


export const prepareNotification = async (userId: string, userNumber: string) => {
  try {
    if (
      userNumber == null || userNumber == undefined || userNumber == '' ||
      restrictedNumbersList.includes(userNumber) ||
      superAdmins.includes(userNumber) ||
      numbersToExcludeFromEmployeesCount.includes(userNumber)
    ) {
      return;
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

    return
  } catch (e) {
    if (e instanceof Error) {
      logError(`findAdded///02///${e.toString()}`)
    }
  }
  return
}