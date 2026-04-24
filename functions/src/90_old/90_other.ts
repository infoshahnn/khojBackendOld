import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { getPostKeywords, incrementReadWriteCounts } from "..";


export const g_self_export = functions.region('asia-south1').runWith({ maxInstances: 5 }).firestore.document(`government/{gId}`).onWrite(async (change, context) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  if (!change.after.exists) return
  const afterData = change.after.data()
  if (!afterData) return

  const keywordsString = afterData.keywordsString ?? ''
  const shortDescriptionEnglish = afterData.shortDescriptionEnglish ?? ''
  const subjectEnglish = afterData.subjectEnglish ?? ''

  const concString = keywordsString + ' ' + shortDescriptionEnglish + ' ' + subjectEnglish

  let postKeywords: string[] = []
  postKeywords = getPostKeywords(concString.toLowerCase(), false, false, false)

  // if (!change.before.exists) {
  // }

  await change.after.ref.update({ postKeywords: postKeywords })
  writesCounter++
  const db: FirebaseFirestore.Firestore = admin.firestore();
  await db.collection('display').doc('keywordsForGovernment').update({ keywordsForGovernment: admin.firestore.FieldValue.arrayUnion(...postKeywords) })
  writesCounter++

  await incrementReadWriteCounts('g_self', readsCounter, writesCounter, deletesCounter)
  return;
});






// // ON CREATE / ON DELETE
// export const deleteNetwork = functions.region('asia-south1').runWith({ maxInstances: 300, timeoutSeconds: 540, memory: '1GB' }).firestore.document(`deleteNetwork/{trigId}`).onCreate(async (change, context) => {
//     await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`Started`) })

//     const db: FirebaseFirestore.Firestore = admin.firestore();
//     const usersCollec = db.collection(usersCollectionString)
//     const qResult = await usersCollec.where('ownNumber', '==', context.params.trigId).get()
//     if (qResult.docs.length != 1) {
//         await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`${qResult.docs.length} user docs found with ownNumber ${context.params.trigId}`) })
//         return
//     }

//     const uDoc = qResult.docs[0]
//     if (uDoc == null || uDoc == undefined || uDoc.data() == null || uDoc.data() == undefined) {
//         console.log(`uDoc/data NA so returning`)
//         await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`uDoc/data NA so returning`) })
//         return;
//     }

//     const data = uDoc.data()
//     const lastHomeLoad = data.lastHomeLoad
//     const createdAt = data.createdAt

//     if (lastHomeLoad == null || lastHomeLoad == undefined || createdAt == null || createdAt == undefined) {
//         console.log(`lastHomeLoad/createdAt NA so returning; ${lastHomeLoad}, ${createdAt}`)
//         await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`ERROR: lastHomeLoad/createdAt NA so returning; ${lastHomeLoad}, ${createdAt}`) })
//         return
//     }

//     const nowMil = Date.now()
//     const diff1 = nowMil - lastHomeLoad
//     const diff2 = nowMil - createdAt

//     const requiredDiff = 3 * 24 * 3600 * 1000
//     if (diff1 < requiredDiff && diff2 < requiredDiff) {
//         console.log(`requiredDiff not enough NA so returning; diffs: ${diff1}, ${diff2}`)
//         await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`ERROR: requiredDiff not enough NA so returning; diffs: ${diff1}, ${diff2}`) })
//         return
//     }

//     await usersCollec.doc(uDoc.id).update({ networkDeletedAt: nowMil, contactsArrayOld: [] })
//     try {
//         await usersCollec.doc(uDoc.id).collection('userInfo').doc('contacts').update({ networkDeletedAt: nowMil })
//     } catch (e) { }

//     let keepSearching: boolean = true
//     let lastDoc

//     while (keepSearching) {
//         let networkQ

//         if (lastDoc == null || lastDoc == undefined) {
//             networkQ = await db.collectionGroup('network').where('ownNumber', '==', context.params.trigId).limit(500).get()
//         } else {
//             networkQ = await db.collectionGroup('network').where('ownNumber', '==', context.params.trigId).startAfter(lastDoc).limit(500).get()
//         }

//         if (networkQ.docs.length == 0) {
//             await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`Done. networkQ length is zero `) })
//             return
//         }

//         await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`Found ${networkQ.docs.length} n docs`) })
//         lastDoc = networkQ.docs[networkQ.docs.length - 1]

//         const userDoc = await usersCollec.doc(uDoc.id).get()
//         if (userDoc == null || userDoc == undefined || userDoc.data() == null || userDoc.data() == undefined) {
//             await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`ERROR: userDoc or data NA`) })
//             return
//         }
//         const contactsArrayOld = userDoc.data()!.contactsArrayOld
//         if (contactsArrayOld == null || contactsArrayOld == undefined || contactsArrayOld.length > 0) {
//             await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`ERROR: contactsArrayOld is not an empty array`) })
//             return
//         }

//         for (let i = 0; i < networkQ.docs.length; i++) {
//             await networkQ.docs[i].ref.delete()
//         }

//     }
//     await change.ref.update({ status: admin.firestore.FieldValue.arrayUnion(`Ending`) })
//     return
// })



// USER RELATED
// TODO critical - forOtherDocs - the other doc doesn't have keys of 
// add createdAt for new user, add emp's number to employees array of company
// TODO - check if emp number being removed from emps list if emp removed cId from array

