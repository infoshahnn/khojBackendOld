import * as functions from "firebase-functions";
// import { createViewCompanyNotificationSupporting } from "..";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { incrementReadWriteCounts, logError, numbersFromCompanyDoc } from "..";
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';




export const cron_view_company_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('30 18 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(0)
  return
})

export const cron_view_company1_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 19 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(1)
  return
})

export const cron_view_company2_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('20 19 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(2)
  return
})

export const cron_view_company3_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('40 19 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(3)
  return
})
export const cron_view_company4_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 20 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(4)
  return
})

export const cron_view_company5_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('20 20 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(5)
  return
})

export const cron_view_company6_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('30 20 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(6)
  return
})

export const cron_view_company7_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('45 20 * * *').onRun(async (context) => {
  await createViewCompanyNotificationSupporting(7)
  return
})

export const createViewCompanyNotificationSupporting = async (part: number) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  const db: FirebaseFirestore.Firestore = admin.firestore();
  const doc = await db.collection('notificationsUploader').doc('viewCompany').get();
  readsCounter++

  if (!doc.exists || doc.data() == undefined) return
  const d = doc.data()!
  if (d.viewCompany == null || d.viewCompany == undefined) return
  const lst: string[] = d.viewCompany ?? []

  let relevantList: string[] = []

  for (const concat of lst) {
    let relevant: boolean = true
    if (concat == null || concat == undefined || concat == '') {
      relevant = false
    } else if (concat <= '1') {
      relevant = part == 0
    } else if (concat <= '9') {
      relevant = part == 1
    } else if (concat <= 'J') {
      relevant = part == 2
    } else if (concat <= 'T') {
      relevant = part == 3
    } else if (concat <= 'Z') {
      relevant = part == 4
    } else if (concat <= 'j') {
      relevant = part == 5
    } else if (concat <= 't') {
      relevant = part == 6
    } else {
      relevant = part == 7
    }

    if (relevant) {
      await createViewCompanyNotificationFromConcat2(concat)
      relevantList.push(concat)
    }
  }

  if (relevantList.length > 0) {
    await db.collection('notificationsUploader').doc('viewCompany').update({ 'viewCompany': admin.firestore.FieldValue.arrayRemove(...relevantList) })
    writesCounter++
  }

  await incrementReadWriteCounts('cron_view_company', readsCounter, writesCounter, deletesCounter)
  return
}

export const createViewCompanyNotificationFromConcat2 = async (concat: string) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  if (concat == null || concat == undefined || concat!.length <= 20 || !concat.includes('///') || concat.split('///').length != 3 || concat.split('///')[1].length < 2) {
    return;
  }

  const cId = concat.split('///')[0]
  const cName = concat.split('///')[1]
  const countString = concat.split('///')[2]
  if (countString == '1') return;
  let msgEnglish: string = `*${cName}* was viewed ` + (countString == '1' ? `` : `${countString} times `) + `in Khoj`
  let msgHindi: string = `*${cName}* खोज ऍप में ` + (countString == '1' ? `` : `${countString} बार `) + `देखी गई`

  const db: FirebaseFirestore.Firestore = admin.firestore();
  const cDoc = await db.collection(companiesCollectionStringV2).doc(cId).get()
  readsCounter++

  const employeeNumbers: string[] = await numbersFromCompanyDoc(cDoc)

  console.log(`Found ${employeeNumbers.length} employees of company ${cName}`)

  let toNotifyNumbers: string[] = []
  let toNotifyTokens: string[] = []

  for (const empNumber of employeeNumbers) {
    toNotifyNumbers.push(empNumber)

    const empQ = await db.collection(usersCollectionString).where('ownNumber', '==', empNumber).get()
    readsCounter += empQ.docs.length

    try {
      if (empQ.docs.length == 1) {
        const _data = empQ.docs[0].data()
        if (_data != null && _data != undefined && _data.deviceInfo != null && _data.deviceInfo != undefined && _data.deviceInfo.token != null && _data.deviceInfo.token != undefined && _data.deviceInfo.token != '')
          toNotifyTokens.push(_data.deviceInfo.token)

        // if (_data.contactsArrayFresh != null && _data.contactsArrayFresh != undefined) {
        // const _arr = _data.contactsArrayFresh

        // for (const _x of _arr) {
        //   const mutualDoc = await db.collection('mutuals').doc(_x).get()
        //   readsCounter++
        //   if (mutualDoc.exists &&
        //     mutualDoc != undefined &&
        //     mutualDoc.data() != undefined &&
        //     mutualDoc.data() != null &&
        //     mutualDoc.data()!.isUser != undefined &&
        //     mutualDoc.data()!.isUser != null &&
        //     mutualDoc.data()!.isUser == false) {
        //     await db.collection('notifications').add({
        //       'title': `${msg}. Khoj is a free app showing daily commodity rates and news with a directory of 23000+ registered members. Search for "Khoj" on the PlayStore/AppStore to download for free.`,
        //       'body': '  ',
        //       'tokens': [],
        //       'userNumbers': [_x],
        //       'status': 'pending',
        //       'createdAt': Date.now(),
        //       'countTokens': 0,
        //       'countWithoutTokens': 0,
        //       'source': 'viewCompanyMututal'
        //     })
        //     writesCounter++
        //   }
        // }
        // }
      }
    } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///82///${e.toString()}`) }

    const employeesFriendsDocs = await db.collection(usersCollectionString).where('contactsArrayFresh', 'array-contains', empNumber).get()
    readsCounter += employeesFriendsDocs.docs.length

    for (const employeeFriendDoc of employeesFriendsDocs.docs) {
      try {
        const _d = employeeFriendDoc.data()
        if (_d != undefined && _d != null && _d!.ownNumber != null && _d!.ownNumber != undefined && _d!.ownNumber != '') {
          toNotifyNumbers.push(employeeFriendDoc.data()!.ownNumber)

          if (_d.deviceInfo != null && _d.deviceInfo != undefined && _d.deviceInfo.token != null && _d.deviceInfo.token != undefined && _d.deviceInfo.token != '')
            toNotifyTokens.push(_d.deviceInfo.token)
        }
      } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///81///${e.toString()}`) }
    }
  }

  await db.collection('notifications').add({
    'tokens': toNotifyTokens,
    'title': msgEnglish,
    'body': msgHindi,
    'status': 'pending',
    'createdAt': Date.now(),
    'createdAtForIndexing': Date.now(),
    'source': 'viewCompany',
    'userNumbers': toNotifyNumbers,
    'destinationCompanyId': cId,
  })

  writesCounter++

  await incrementReadWriteCounts('cron_view_company', readsCounter, writesCounter, deletesCounter)
}


//   // token
//   try {
//     const deviceInfo = employeeFriendDoc.data().deviceInfo
//     if (deviceInfo != null && deviceInfo != undefined && deviceInfo.token != null && deviceInfo.token != undefined && deviceInfo.token != '') {
//       toNotifyTokens.push(deviceInfo.token)
//     }
//   } catch (e) { if (e instanceof Error) await logError(`users_notify_friends///11///${e.toString()}`) }

//   if (employeeFriendDoc.data() != undefined && employeeFriendDoc.data().contactsArrayFresh != null && employeeFriendDoc.data().contactsArrayFresh != undefined) {
//     for (const cont of employeeFriendDoc.data().contactsArrayFresh) {
//       const mutualDoc = await db.collection('mutuals').doc(cont).get()
//       readsCounter++
//       if (mutualDoc.exists &&
//         mutualDoc != undefined &&
//         mutualDoc.data() != undefined &&
//         mutualDoc.data() != null &&
//         mutualDoc.data()!.isUser != undefined &&
//         mutualDoc.data()!.isUser != null &&
//         mutualDoc.data()!.isUser == false) {
//         await db.collection('notifications').add({
//           'title': `${msg}. Khoj is a free app showing daily grain rates and news with a directory of 13000+ registered members. Search for "Khoj" on the PlayStore/AppStore to download for free.`,
//           'body': '  ',
//           'tokens': [],
//           'userNumbers': [cont],
//           'status': 'pending',
//           'createdAt': Date.now(),
//           'countTokens': 0,
//           'countWithoutTokens': 0,
//           'source': 'viewCompanyMututal'
//         })
//         writesCounter++
//       }
//     }
//   }
// }