import * as functions from "firebase-functions";
// import { createViewCompanyNotificationSupporting } from "..";
// import { onRequest } from "firebase-functions/v2/https";
// import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { nSelfForCompany } from "..";

export const cron_self_updates_for_single_company_export = functions.region('asia-south1').runWith({ timeoutSeconds: 540, memory: '8GB' }).pubsub.schedule('0 9 * * *').onRun(async (context) => {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const docFromRandom = await db.collection('random').doc('selfUpdatesForSingleCompany').get()
    if (!docFromRandom.exists || docFromRandom == null || docFromRandom == undefined || docFromRandom.data() == undefined || docFromRandom.data() == null) return;
    const data = docFromRandom.data()!
    if (data.companyIds == null || data.companyIds == undefined || data.companyIds.length == 0) return;
  
    const startTime: number = Date.now()
    const timeLimitInSeconds: number = 300
    const timeLimitInMil: number = timeLimitInSeconds * 1000
  
    let companyIdsForUploading: string[] = []
  
    for (const cId of data.companyIds) {
      if (Date.now() - startTime > timeLimitInMil) {
        break;
      } else {
        await nSelfForCompany(cId, true)
        companyIdsForUploading.push(cId)
      }
    }
  
    await docFromRandom.ref.update({
      'companyIds': admin.firestore.FieldValue.arrayRemove(companyIdsForUploading), 
      'done': admin.firestore.FieldValue.arrayUnion(companyIdsForUploading), 
    })
  
    return
  })