import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import admin = require('firebase-admin');
import { DocumentSnapshot } from "firebase-functions/v1/firestore";
// import { Filter } from 'firebase-admin/firestore';

admin.initializeApp()
export const firestoreInstance = admin.firestore();

export const helloWorld2 = onRequest(
  // {region: "asia-south1", timeoutSeconds: 540, concurrency: 2, cpu: 4, memory: '16GiB', maxInstances: 20, minInstances: 1, ingressSettings: 'ALLOW_ALL', serviceAccount: 'javanshah@gmail.com', c},
   async (params, response) => {
  logger.log("Hello World 2nd Gen");
  response.send("DOne");
});

import { setGlobalOptions } from "firebase-functions/v2";

setGlobalOptions({ region: "asia-south1", timeoutSeconds: 540, concurrency: 2, cpu: 4, memory: '16GiB', maxInstances: 20 });

import {
  executeFromBuildMapV2, getTenAtATime, logToRandomCollecTestDocument, makeBuildMapSupportingV2, uppercase_export
} from './95_gen2/gen2'
export const uppercase = uppercase_export



// exports.date = onRequest({
// //Keep 5 instances warm for this latency-critical function
// //minInstances: 5,
// }, (req, res) => {
// ...
// });




// GLOBAL
const milInOneDay: number = 86400000
let usersCollectionString = 'testCollectionUsers';
let companiesCollectionStringV2 = 'companiesV2';
let pincodesCollectionString = 'pincodes';
let userInfoCollectionString = 'userInfo';

const pointsVerifiedLow: number = 2
const pointsVerifiedMedium: number = 2
const pointsVerifiedHigh: number = 2
const pointsSponsoredBronze: number = 2
const pointsSponsoredSilver: number = 4000 // most premium
const pointsSponsoredGold: number = 12
const pointsSponsoredDiamond: number = 15
const pointsForEachDirect: number = 10
export const pointsForEachMutual: number = 2
const pointsShortDescription: number = 1

export const superAdmins: Array<string> = ['+919970179564', '+918668521485',]

export const restrictedNumbersList: Array<string> = [
  '+917821092344', '+918421169686', '+918652516385', '+918237151049', '+918652516385', '+918600385227', '+919819411331', '+919702782659', // agri world
  '+919389999736', '+916396971895', '+917074042813', '+919027328284', '+919412064623', '+919548421995', // agri india
  '+917024419613', '+918817929658', //raunak global
  '+919421758717', '+919371731763', //VTC
  '+918696965308', // sameer
  '+919325081717',
  '+919312626871',
  '+919823170170', '+919823054066', '+919545654321', '+919960201230', '+919373593225', //op
];

export const numbersToExcludeFromEmployeesCount: Array<String> = [
  // '+919970179564', // NA
  // '+918668521485', // NA
  '+918459714096', // Ramzan company
  '+918459714097', // Darshik Sir company
  '+918080528906', // Shubham company
  '+917767005472', // Daniel Sir company
  '+918080528901', // Swati Bhagat company
  '+918080528904', // Sweta Bodh company
  // '+918989508325', // S
  '+919579527419', // Surendra personal, Nagpur
  '+918080528883', // Praveen Sir company
  '+917410044869', // Ashish personal, Nagpur
  '+918799967346', // Amruta company
  '+918459714087', // Jaya company
  '+919370960294', // Surekha company
  '+919702003270', // Darshik personal, Nagpur
  '+919096794562', // Daniel personal, Nagpur
  '+918080896206', // Anjali personal, Nagpur
  '+919960710602', // Vivek personal, Nagpur
  '+919420856893', // Shubhangini personal, Nagpur
  '+919175965503', // Munesh personal, Nagpur
  '+919850203506', // Anita personal, Nagpur
  '+917507158855', // Praveenji second company
  '+917276423878', // Dolly personal, Nagpur
  '+918552952640', // Rasekar personal, Nagpur
  '+919766692497', // Amit Tiwari personal, Nagpur
  '+918750246146', // Vijay Kumar personal, Delhi
  '+918983331853', // Pranay personal, Nagpur
  '+918390528612', // Vivek personal, Nagpur
  '+918383048197', // Arjun personal, Delhi
  '+918329462852', // Amit Dixit personal, Nagpur
  '+919009247062', // Vipin Ramani personal, Indore
  '+917828446490', // Nidhi personal, Nagpur
  '+919198420644', // Rishik Mishra, Gujrat
  '+919373498967', // Zaid Gaush Sheikh, Pune
  '+919673156917', // Akash personal, Nagpur
  '+918080528863', // Deepak company
  '+918799951358', // Ram company
  '+918799967349', // Shilpa company
  '+918799951359', // Pooja company

  '+918799951361', // Unknown company
  '+918799951363', // Unknown company
  '+918799951364', // Unknown company
  '+919028167111', // Sayali company
  '+918799951365', // Megha company
  // Apr 01, 2022"

  '+919699893065',
  '+918799951358',
  '+918459714087',
  '+917887478874',
  '+919028167111',
  '+918080528863',
  '+919960271564',
  '+917410044869',
  '+918600780870',
  '+918600422726',
  '+918668571747',
  '+918788197707',
  '+918080528904',
  '+918459714097',
  '+918799951367',
  '+918799951365',
  '+918080528893',
  '+917276423878',
  '+918552952640',
  '+919766692497',
  '+918750246146',
  '+918983331853',
  '+918390528612',
  '+918383048197',
  '+918329462852',
  '+919009247062',
  '+917828446490',
  '+919198420644',
  '+919373498967',
  '+919673156917',
];












// -----------------------------------------------------------------------------
// SUPPORTING FUNCTIONS


export const updateMutualsInAuctionApprovals = async (companyId: string, individualId: string, hostId: string, mutuals: string[], numbersToRemove: string[]) => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const auctionMutualsDocOfIndividual = db.collection('auctionApprovals').doc(companyId).collection('auctionMutuals').doc(individualId)

    let mutualsAfterRemoving: string[] = []

    for (const m of mutuals) {
      if (!numbersToRemove.includes(m)) mutualsAfterRemoving.push(m)
    }

    try {
      const str = `mutualsMap.${hostId}`
      if (str != '')
        await auctionMutualsDocOfIndividual.update({
          'userId': individualId,
          [str]: mutualsAfterRemoving
        })
    } catch (e) {
      if (e instanceof Error)
        if (e.toString().includes('No document to update')) {
          await auctionMutualsDocOfIndividual.set({
            'userId': individualId,
            'mutualsMap': { [hostId]: mutualsAfterRemoving }
          })
        } else {
          await logError(`updateMutualsInAuctionApprovals///11///${e.toString()}`)
        }
    }
  } catch (e) { if (e instanceof Error) await logError(`updateMutualsInAuctionApprovals///01///${e.toString()}`); }

  return
}

export const getContactsArrayFromUserId = async (userId: string): Promise<string[]> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const usersCollec = db.collection(usersCollectionString)
    const userContactsDoc = await usersCollec.doc(userId).collection('userInfo').doc('contacts').get()

    // try from contacts doc:
    if (userContactsDoc.exists && userContactsDoc.data() != null && userContactsDoc.data() != undefined) {
      // console.log(`getContactsArrayFromUserId: 01 found doc for userId ${userId}`)
      const userContactsDocData = userContactsDoc.data()!
      const fresh = userContactsDocData.contactsArrayFresh
      if (fresh != null && fresh != undefined && fresh.length > 0) {
        // console.log(`getContactsArrayFromUserId: 02 found fresh for userId ${userId} (len ${fresh.length})`)
        return fresh
      } else {
        // console.log(`getContactsArrayFromUserId: 03 did not find fresh for userId ${userId}`)

        const conatactsMap = userContactsDocData.contactsMap
        if (conatactsMap != undefined && conatactsMap != null) {
          const conatactsMapObject: Map<string, any> = new Map(Object.entries(conatactsMap));
          const contactsMapKeys = Array.from(conatactsMapObject.keys())
          if (contactsMapKeys != null && contactsMapKeys != undefined && contactsMapKeys.length > 0) {
            // console.log(`getContactsArrayFromUserId: 04 found contactsMapKeys for userId ${userId} (len ${contactsMapKeys.length})`)
            return contactsMapKeys;
          }
        }
      }
    }
  } catch (e) { if (e instanceof Error) await logError(`getContactsArrayFromUserId///01///${e.toString()}`); }

  console.log(`getContactsArrayFromUserId: 05 found neigther fresh nor contactsMapKeys for userId ${userId}. returning`)

  // try from main user doc (implement later if needed)

  return []
}

export const deleteNetworkV2Supporting = async (ownNumber: string): Promise<boolean> => {
  const requiredDiff = 3 * 24 * 3600 * 1000
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  console.log(`started deleteNetworkV2Supporting ${ownNumber}`)

  try {
    // if (ownNumber.substring(0, 3) != '+91') {
    //   return true
    // }

    const db: FirebaseFirestore.Firestore = admin.firestore();
    const usersCollec = db.collection(usersCollectionString)
    const qResult = await usersCollec.where('ownNumber', '==', ownNumber).get()
    readsCounter += qResult.docs.length
    let uDocAvailable: boolean = true

    if (qResult.docs.length != 1) {
      console.log(`CONTINUING DESPITE ${qResult.docs.length} docs found with this number ${ownNumber}`)
      uDocAvailable = false
      // return false
    }

    if (uDocAvailable) {
      const uDoc = qResult.docs[0]
      if (uDoc == null || uDoc == undefined || uDoc.data() == null || uDoc.data() == undefined) {
        console.log(`CONTINUING DESPITE uDoc or uDoc.data() is NA; for ${ownNumber}`)
        uDocAvailable = false;
        // return false
      }


      if (uDocAvailable) {
        const data = uDoc.data()
        const lastHomeLoad = data.lastHomeLoad
        const createdAt = data.createdAt

        if (lastHomeLoad == null || lastHomeLoad == undefined || createdAt == null || createdAt == undefined) {
          console.log(`CONTINUING DESPITE lastHomeLoad: ${lastHomeLoad}, createdAt: ${createdAt}; for ${ownNumber}`)
          // return false
        }

        const nowMil = Date.now()
        const diff1 = nowMil - lastHomeLoad
        const diff2 = nowMil - createdAt

        if (diff1 < requiredDiff || diff2 < requiredDiff) {
          console.log(`CONTINUING DESPITE diff is less than ${requiredDiff}; diff1: ${diff1}, diff2: ${diff2}; for ${ownNumber}`)
          // return true
        }

        await usersCollec.doc(uDoc.id).update({ networkDeletedAt: nowMil, contactsArrayOld: [] })
        writesCounter++

        try {
          await usersCollec.doc(uDoc.id).collection('userInfo').doc('contacts').update({ networkDeletedAt: nowMil, })
          writesCounter++
        } catch (e) { }
      }
    }

    let keepSearching: boolean = true
    let lastDoc

    while (keepSearching) {
      let networkQ

      if (lastDoc == null || lastDoc == undefined) {
        networkQ = await db.collectionGroup('network').where('ownNumber', '==', ownNumber).limit(500).get()
        readsCounter += networkQ.docs.length
      } else {
        networkQ = await db.collectionGroup('network').where('ownNumber', '==', ownNumber).startAfter(lastDoc).limit(500).get()
        readsCounter += networkQ.docs.length
      }

      if (networkQ.docs.length == 0) {
        console.log(`Ending as no network docs found; for ${ownNumber}; deleted ${deletesCounter}`)
        await incrementReadWriteCounts('deleteNetworkV2', readsCounter, writesCounter, deletesCounter)
        return true
      }

      lastDoc = networkQ.docs[networkQ.docs.length - 1]

      let futuresList: any[] = []

      for (let i = 0; i < networkQ.docs.length; i++) {
        futuresList.push(networkQ.docs[i].ref.delete())
        deletesCounter++
      }

      await Promise.all(futuresList)
    }

    await incrementReadWriteCounts('deleteNetworkV2', readsCounter, writesCounter, deletesCounter)

  } catch (e) { if (e instanceof Error) await logError(`deleteNetworkV2Supporting///01///${e.toString()}`); }

  return false
}

export const countryCodeFromNum = async (num: string): Promise<string> => {
  if (num == undefined || num == null) return '';
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const countryCodesDoc = await db.collection('display').doc('countryCodes').get()
    readsCounter++
    const countryCodesData = countryCodesDoc.data()

    if (countryCodesData != undefined && countryCodesData != null) {
      const countryCodesMap = countryCodesData.countryCodes
      const countryCodesMapObject: Map<string, any> = new Map(Object.entries(countryCodesMap));
      for (const [code, country] of countryCodesMapObject) {
        if (num.startsWith(code) && country != 'xx') {
          await incrementReadWriteCounts(`u1_selfBasicsAndMeInCompanyEmployees`, readsCounter, writesCounter, deletesCounter)
          return code
        }
      }
    }
  } catch (e) { if (e instanceof Error) await logError(`countryCodeFromNum///08///${e.toString()}`) }
  await incrementReadWriteCounts(`u1_selfBasicsAndMeInCompanyEmployees`, readsCounter, writesCounter, deletesCounter)
  return ''
}

export const getRelevantArray = (endingDigit: string, originalArray: string[]): string[] => {
  let relevantArray: string[] = []
  for (const num of originalArray) {
    if (isRelevant(endingDigit, num))
      relevantArray.push(num)
  }

  return relevantArray
}

export const isRelevant = (endingDigit: string, num: string): boolean => {
  // if (endingDigit == '0') {
  //   return num.endsWith('0') || num.endsWith('1') || num.endsWith('2')
  // } else if (endingDigit == '3') {
  //   return num.endsWith('3') || num.endsWith('4') || num.endsWith('5') || num.endsWith('6')
  // } else if (endingDigit == '7') {
  //   return num.endsWith('7') || num.endsWith('8') || num.endsWith('9') ||
  //     (!num.endsWith('1') && !num.endsWith('2') && !num.endsWith('3') && !num.endsWith('4') && !num.endsWith('5') && !num.endsWith('6') && !num.endsWith('7') && !num.endsWith('8') && !num.endsWith('9') && !num.endsWith('0'))
  // } else {
  //   logError(`isRelevant got invalid input`)
  //   return false
  // }

  let relevant: boolean = num.endsWith(endingDigit)
  if (endingDigit == '') relevant = !num.endsWith('1') && !num.endsWith('2') && !num.endsWith('3') && !num.endsWith('4') && !num.endsWith('5') && !num.endsWith('6') && !num.endsWith('7') && !num.endsWith('8') && !num.endsWith('9') && !num.endsWith('0')
  return relevant
}

export const okayToProceed = (
  contactsDocAfter: FirebaseFirestore.DocumentData | undefined,
  parentId: string | undefined,
): boolean => {
  if (parentId == null || parentId == undefined) {
    console.log('ENDING parentId NA')
    return false
  }

  if (
    contactsDocAfter == undefined ||
    contactsDocAfter == null
  ) {
    console.log('ENDING contactsDocAfter NA')
    return false
  }

  if (
    contactsDocAfter!.contactsMap == null ||
    contactsDocAfter!.contactsMap == undefined
  ) {
    console.log('ENDING contactsMap NA')
    return false
  }

  // if (
  //   contactsDocAfter.networkDeletedAt != null &&
  //   contactsDocAfter.networkDeletedAt != undefined &&
  //   (Date.now() - contactsDocAfter.networkDeletedAt) < 1 * 3600 * 1000
  // ) {
  //   console.log('ENDING networkDeletedAt within last 1 hour')
  //   return false
  // }

  return true
};

export const numbersFromContactsMapFromDoc = (contactsDoc: FirebaseFirestore.DocumentData | undefined): string[] => {
  try {
    if (contactsDoc == null || contactsDoc == undefined) return []
    if (contactsDoc!.contactsMap == null || contactsDoc!.contactsMap == undefined) return []

    const contactsMap = contactsDoc!.contactsMap!
    let fresh: string[] = []
    const contactsMapObject: Map<string, any> = new Map(Object.entries(contactsMap));
    fresh = Array.from(contactsMapObject.keys())
    fresh = [...new Set(fresh)]
    return fresh
  } catch (e) {
    if (e instanceof Error) {
      logError(`numbersFromContactsMapFromDoc///02///${e.toString()}`)
    }
  }
  return []
};

export const getOwnNumber = async (contactsDocAfter: FirebaseFirestore.DocumentData | undefined, parentId: string | undefined): Promise<string | undefined> => {
  if (contactsDocAfter == undefined) return undefined

  if (contactsDocAfter.ownNumber != null && contactsDocAfter.ownNumber != undefined && contactsDocAfter.ownNumber != '')
    return contactsDocAfter!.ownNumber;

  if (parentId == null || parentId == undefined || parentId == '') return undefined

  const db: FirebaseFirestore.Firestore = admin.firestore();
  const parentDoc = await db.collection(usersCollectionString).doc(parentId!).get()
  if (parentDoc == undefined || parentDoc.data() == undefined || parentDoc.data()!.ownNumber == null || parentDoc.data()!.ownNumber == undefined || parentDoc.data()!.ownNumber == '') {
    return undefined
  }

  return parentDoc.data()!.ownNumber!
}

export const u2_internal_v2 = async (
  endingDigit: string,
  contactsDocBefore: FirebaseFirestore.DocumentData | undefined,
  contactsDocAfter: FirebaseFirestore.DocumentData | undefined,
  parentId: string | undefined,
  // eventId: string | undefined,
  // for1000OrMoreRelevant: boolean,
) => {
  // const eId = eventId?.substring(0, 5)

  const myOwnNumber = await getOwnNumber(contactsDocAfter, parentId)
  if (myOwnNumber == null || myOwnNumber == undefined) {
    await logThis('Returning as ownNumber NA', ''); return;
  }

  // const now00 = Date.now()
  // let changedFields: string[] = getChangedFields(contactsDocBefore, contactsDocAfter, [])
  // await logThis(`00/${eId}/${myOwnNumber}/${endingDigit}: changedFields: ${changedFields}, (${Math.floor((Date.now() - now00) / 1000)})`, myOwnNumber); const now01 = Date.now();

  if (!okayToProceed(contactsDocAfter, parentId)) {
    await logThis('Not okay to proceed. Ending.', myOwnNumber)
    return
  }

  // let writesCounter: number = 0;
  // let readsCounter: number = 0;
  // let deletesCounter: number = 0;
  let contactsAfter: string[] = numbersFromContactsMapFromDoc(contactsDocAfter)

  contactsAfter = contactsAfter.sort()

  let contactsBefore: string[] = numbersFromContactsMapFromDoc(contactsDocBefore)
  if (contactsDocAfter != null &&
    contactsDocAfter != undefined &&
    contactsDocAfter.trigger != null &&
    contactsDocAfter.trigger != undefined &&
    contactsDocBefore != null &&
    contactsDocBefore != undefined &&
    contactsDocBefore.trigger != contactsDocAfter.trigger
  ) {
    contactsBefore = []
    // console.log(`--/${eId}/${myOwnNumber}/${endingDigit}: TRIGGERED FROM TRIGGER`)
  }

  const relevantArray: string[] = getRelevantArray(endingDigit, findAdded(contactsBefore, contactsAfter))

  if (relevantArray.length == 0) {
    // console.log(`02/${eId}/${myOwnNumber}/${endingDigit}: ending as relevant.len == 0, contactsAfter: ${contactsAfter.length}, before: ${contactsBefore.length} (${Math.floor((Date.now() - now01) / 1000)})`)
    return;
  }

  // if (for1000OrMoreRelevant) {
  //   // if (relevantArray.length < 1000) return;
  // } else {
  //   // if (relevantArray.length >= 1000) return;
  // }

  // await logThis(`02/${eId}: after: ${contactsAfter.length}, before: ${contactsBefore.length}, relevant: ${relevantArray.length}; (${Math.floor((Date.now() - now01) / 1000)})`, myOwnNumber); const now03 = Date.now();

  let futureQueries: Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>[] = getFutureQueries(relevantArray)
  // await logThis(`03/${eId}/${myOwnNumber}/${endingDigit}: Promise starting, futureQueries.len ${futureQueries.length}, (${Math.floor((Date.now() - now03) / 1000)})`, myOwnNumber); const now04 = Date.now();

  const queries = await Promise.all(futureQueries)
  // await logThis(`04/${eId}/${myOwnNumber}/${endingDigit}: Promise ends. Getting list of empDocs, queries.len ${queries.length} (${Math.floor((Date.now() - now04) / 1000)})`, myOwnNumber); const now05 = Date.now();

  let listOfEmpDocs = getEmpDocsFromQueries(queries, myOwnNumber)
  // await logThis(`05/${eId}/${myOwnNumber}/${endingDigit}: Unique docs found ${listOfEmpDocs.length}; now building mapV2, (${Math.floor((Date.now() - now05) / 1000)})`, myOwnNumber); const now06 = Date.now()

  let buildMap: Map<string, Map<string, string[]>> = makeBuildMapSupportingV2(contactsAfter, listOfEmpDocs);
  // await logThis(`06/${eId}/${myOwnNumber}/${endingDigit}: mapV2 built. execution started, (${Math.floor((Date.now() - now06) / 1000)})`, myOwnNumber); const now07 = Date.now();

  await executeFromBuildMapV2(buildMap, myOwnNumber, contactsBefore.length == 0)
  // await logThis(`07/${eId}/${myOwnNumber}/${endingDigit}: ending total ${Math.floor((Date.now() - now00) / 1000)}s (${Math.floor((Date.now() - now07) / 1000)})`, myOwnNumber)

  try {
    const db: FirebaseFirestore.Firestore = admin.firestore()
    await db.collection(usersCollectionString).doc(parentId!).update({ contactsArrayOld: admin.firestore.FieldValue.arrayUnion(...relevantArray) })
    // writesCounter++
  } catch (e) { if (e instanceof Error) await logError(`u2_internal_v2///02: ${e.toString()}`) }

  // await incrementReadWriteCounts('u2_internal - 00', readsCounter, writesCounter, deletesCounter)
  return
}

export const getChangedFields = (beforeData: FirebaseFirestore.DocumentData | undefined, afterData: FirebaseFirestore.DocumentData | undefined, possibleFields: string[]): string[] => {
  try {
    if ((beforeData == null || beforeData == undefined) && afterData != undefined && afterData != null) return ['doc created']
    if ((afterData == null || afterData == undefined) && beforeData != undefined && beforeData != null) return ['doc deleted']
    if (beforeData == null || beforeData == undefined || afterData == null || afterData == undefined) return []

    let fieldsChanged: string[] = []

    for (let [key, value] of Object.entries(beforeData)) {
      if (afterData.key == null || afterData.key == undefined || afterData.get(key).toString() != beforeData.get(key).toString() || value == 999) fieldsChanged.push(key)
    }

    for (let [key, value] of Object.entries(afterData)) {
      if (beforeData.key == null || beforeData.key == undefined || beforeData.get(key).toString() != afterData.get(key).toString() || value == 999) fieldsChanged.push(key)
    }

    return fieldsChanged.length > 4 ? [] : fieldsChanged
  } catch (e) {
    return [`${e!.toString()}`]
  }
}


export const logThis = async (msg: string, ownNumber: string) => {
  if (ownNumber == '+917126685911' || ownNumber == '+919970179564') {
    await logToRandomCollecTestDocument(msg)
  }
  console.log(msg)
}

export const getEmpDocsFromQueries = (queries: admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[], myOwnNumber: string): any[] => {
  try {
    let listOfEmpDocs = []
    let listOfDocIds: string[] = []
    for (const q of queries) {
      for (const empDoc of q.docs) {
        if (listOfDocIds.indexOf(empDoc.id) == -1) {
          try {
            if (empDoc.get('ownNumber') != myOwnNumber) {
              listOfDocIds.push(empDoc.id)
              listOfEmpDocs.push(empDoc)
            }
          } catch (e) { }
        }
      }
    }
    return listOfEmpDocs
  } catch (e) {
    if (e instanceof Error) {
      logError(`findAdded///02///${e.toString()}`)
    }
  }
  return []
}


export const getThirtAtATime = (lst: string[], zeroBasedCounter: number): string[] => {
  const startIndex: number = zeroBasedCounter * 30
  if (lst.length < startIndex) return [];

  let endIndex: number = startIndex + 30
  if (endIndex > lst.length) endIndex = lst.length
  let results: string[] = []

  for (let i = startIndex; i < endIndex; i++) results.push(lst[i])

  return results
}

export const getFutureQueries = (relevantArray: string[]): Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>[] => {
  console.log(`getFutureQueries started; relevantArray: ${relevantArray.length}`)
  let futureQueries: Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>>[] = []
  const db: FirebaseFirestore.Firestore = admin.firestore()
  let counter: number = 0
  let str: string = 'lengths in each run: '

  // 30 at a time
  for (let i = 0; i < Math.ceil(relevantArray.length / 30); i++) {
    counter++
    const thirtyFromRelevant = getThirtAtATime(relevantArray, i)
    if (thirtyFromRelevant.length == 0) break;

    let arrayOne: string[] = getTenAtATime(thirtyFromRelevant, 0)
    let arrayTwo: string[] = []
    let arrayThree: string[] = []
    if (thirtyFromRelevant.length >= 11) arrayTwo = getTenAtATime(thirtyFromRelevant, 1)
    if (thirtyFromRelevant.length >= 21) arrayThree = getTenAtATime(thirtyFromRelevant, 2)

    if (arrayThree.length > 0) {
      str += `a3 ${arrayTwo.length}, `
      const futureQ = db.collection(usersCollectionString)
        .where('employed', '==', true)
        .where(
          Filter.or(
            Filter.where('contactsArrayFresh', 'array-contains-any', arrayOne),
            Filter.where('contactsArrayFresh', 'array-contains-any', arrayTwo),
            Filter.where('contactsArrayFresh', 'array-contains-any', arrayThree),
          )
        )
        .get();

      futureQueries.push(futureQ)
    } else if (arrayTwo.length > 0) {
      str += `a2 ${arrayTwo.length}, `
      const futureQ = db.collection(usersCollectionString)
        .where('employed', '==', true)
        .where(
          Filter.or(
            Filter.where('contactsArrayFresh', 'array-contains-any', arrayOne),
            Filter.where('contactsArrayFresh', 'array-contains-any', arrayTwo),
          )
        )
        .get();

      futureQueries.push(futureQ)
    } else {
      str += `a1 ${arrayTwo.length}, `
      const futureQ = db.collection(usersCollectionString)
        .where('employed', '==', true)
        .where('contactsArrayFresh', 'array-contains-any', arrayOne)
        .get();

      futureQueries.push(futureQ)
    }
  }

  console.log(`futureQueries, ${str}; counter: ${counter}, len: ${futureQueries.length}, relevant len: ${relevantArray.length}`)

  return futureQueries
}


// // 10 at a time
// for (let i = 0; i < Math.ceil(relevantArray.length / 10); i++) {
//   const tenFromRelevant = getTenAtATime(relevantArray, i)
//   if (tenFromRelevant.length == 0) break;

//   const futureQ = db.collection(usersCollectionString)
//     .where('employed', '==', true)
//     .where('contactsArrayFresh', 'array-contains-any', tenFromRelevant)
//     .get();

//   futureQueries.push(futureQ)
//   console.log(`loop: ${i}, first num: ${tenFromRelevant[0]} (${Date.now() - now})`)
// }

// // 30 at a time
// for (let i = 0; i < Math.ceil(relevantArray.length / 30); i++) {
//   const thirtyFromRelevant = getThirtAtATime(relevantArray, i)
//   if (thirtyFromRelevant.length == 0) break;

//   let arrayOne: string[] = getTenAtATime(thirtyFromRelevant, 0)
//   let arrayTwo: string[] = []
//   let arrayThree: string[] = []
//   if (thirtyFromRelevant.length >= 11) arrayTwo = getTenAtATime(thirtyFromRelevant, 1)
//   if (thirtyFromRelevant.length >= 21) arrayThree = getTenAtATime(thirtyFromRelevant, 2)

//   const qUsersKnowingThese = await db.collection(usersCollectionString)
//     // .where('employed', '==', true)
//     .where(
//       Filter.or(
//         Filter.where('contactsArrayFresh', 'array-contains-any', tenFromRelevant),
//         Filter.where('contactsArrayFresh', 'array-contains-any', tenFromRelevant)
//       )
//     )
//     .get();

//   console.log(`tenFromRelevant starting ${tenFromRelevant[0]}; qUsersKnowingThese: ${qUsersKnowingThese.docs.length}; ${eventId}`)

//   for (const empDoc of qUsersKnowingThese.docs)
//     if (empDoc.get('ownNumber') != myOwnNumber) buildMap = makeBuildMapSupporting(contactsAfter, buildMap, empDoc)

//   uploadAdded = uploadAdded.concat(tenFromRelevant)
// }
// // 10 at a time
// for (let i = 0; i < Math.ceil(relevantArray.length / 10); i++) {
//   const tenFromRelevant = getTenAtATime(relevantArray, i)
//   if (tenFromRelevant.length == 0) break;

//   const qUsersKnowingThese = await db.collection(usersCollectionString)
//     .where('employed', '==', true)
//     .where('contactsArrayFresh', 'array-contains-any', tenFromRelevant)
//     .get();

//   console.log(`tenFromRelevant starting ${tenFromRelevant[0]}; qUsersKnowingThese: ${qUsersKnowingThese.docs.length}; ${eventId}`)

//   for (const empDoc of qUsersKnowingThese.docs)
//     if (empDoc.get('ownNumber') != myOwnNumber) buildMap = makeBuildMapSupporting(contactsAfter, buildMap, empDoc)

//   uploadAdded = uploadAdded.concat(tenFromRelevant)
// }

export const u2_internal = async (
  endingDigit: string,
  contactsDocBefore: FirebaseFirestore.DocumentData | undefined,
  contactsDocAfter: FirebaseFirestore.DocumentData | undefined,
  parentId: string | undefined,
  eventId: string | undefined,
  // userDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined
) => {
  let now = Date.now()
  let writesCounter: number = 0;
  let readsCounter: number = 0; // one being read in the parent function
  let deletesCounter: number = 0;
  const db: FirebaseFirestore.Firestore = admin.firestore();

  const isMyDoc: boolean = parentId == 'N6ubCnyMGOOqR5AsuTmkDI65fWB2'

  if (contactsDocAfter == undefined || contactsDocAfter == null) {
    console.log(`contactsDocData NA so returning`)
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 01`)
    return;
  }

  if (contactsDocBefore != undefined && contactsDocBefore != null) {
    if (contactsDocBefore.trigger != null && contactsDocBefore.trigger != undefined && contactsDocAfter.trigger != contactsDocBefore.trigger) {
      console.log(`contactsDocData NA so returning`)
    } else {
      if (isMyDoc) await logToU2_internal(`${eventId} - ending 02`)

      return
    }
  }

  if (contactsDocAfter.networkDeletedAt != null && contactsDocAfter.networkDeletedAt != undefined) {
    if ((Date.now() - contactsDocAfter.networkDeletedAt) < 2 * 3600 * 1000) {
      console.log(`networkDeletedAt diff: ${(Date.now() - contactsDocAfter.networkDeletedAt) / 1000}s; returning`)
      if (isMyDoc) await logToU2_internal(`${eventId} - ending 03`)

      return
    }
    // else if (endingDigit == '0' && (contactsDocAfter.contactsArrayOld != null && contactsDocAfter.contactsArrayOld != undefined && contactsDocAfter.contactsArrayOld.length == 0)) {

    // }
  }

  // fresh
  const contactsMapAfter = contactsDocAfter.contactsMap
  let fresh: string[] = []
  if (contactsMapAfter == null || contactsMapAfter == undefined) {
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 04`)

    return;
  } else {
    const contactsMapObject: Map<string, any> = new Map(Object.entries(contactsMapAfter));
    fresh = Array.from(contactsMapObject.keys())
    fresh = [...new Set(fresh)]
  }

  let old: string[] = []
  if (contactsDocBefore != undefined && contactsDocBefore != null) {
    const contactsMapBefore = contactsDocBefore.contactsMap
    if (contactsMapBefore != null && contactsMapBefore != undefined) {
      const contactsMapObject: Map<string, any> = new Map(Object.entries(contactsMapBefore));
      old = Array.from(contactsMapObject.keys())
      old = [...new Set(old)]
    }
  }

  let triggeredFromTrigger: boolean = false
  if (contactsDocAfter != null &&
    contactsDocAfter != undefined &&
    contactsDocAfter.trigger != null &&
    contactsDocAfter.trigger != undefined &&
    contactsDocBefore != null &&
    contactsDocBefore != undefined &&
    contactsDocBefore.trigger != contactsDocAfter.trigger
  ) {
    triggeredFromTrigger = true
    old = []
  }

  if (!triggeredFromTrigger && arraysAreSame(old, fresh)) {
    if (endingDigit == '0') console.log(`Ending as old == fresh`)
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 05`)

    return;
  }

  if (parentId == null || parentId == undefined) {
    if (endingDigit == '0') console.log(`ERROR - Ending as parentId NA`)
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 06`)

    return;
  }

  const userDoc = await db.collection(usersCollectionString).doc(parentId).get()
  readsCounter++

  if (userDoc == undefined || userDoc == null) {
    console.log(`ERROR parent does not exist so returning`);
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 07`)

    return;
  }

  const u = userDoc.data()
  if (u == null || u == undefined) { console.log(`ERROR userDoc.data() NA so returning`); return; }
  if (u.networkDeletedAt != null && u.networkDeletedAt != undefined) {
    if ((Date.now() - u.networkDeletedAt) < 2 * 3600 * 1000) {
      console.log(`networkDeletedAt (udoc) diff: ${(Date.now() - u.networkDeletedAt) / 1000}s; returning`)
      if (isMyDoc) await logToU2_internal(`${eventId} - ending 08`)
      return
    } else {
      // console.log(`networkDeletedAt (udoc) DIFF TOO BIG so not returning; ${u.networkDeletedAt}`)
    }
  }

  const myOwnNumber: string = u.ownNumber
  if (myOwnNumber == undefined || myOwnNumber == null) {
    console.log(`ownNumber NA; returning`);
    if (isMyDoc) await logToU2_internal(`${eventId} - ending 09`)
    return;
  }

  if (isMyDoc) await logToU2_internal(`${eventId} - did not end early`)

  // if (
  // myOwnNumber == '+918668521485'
  // || myOwnNumber == '+917126685911'
  // || myOwnNumber == '+919970179564'
  // ) {
  // console.log(`udoc: ${u.networkDeletedAt}, contacts doc: ${contactsDocAfter.networkDeletedAt}`)
  // return;
  // await logToU2_internal(`${now} - started for ${myOwnNumber}`)

  // }

  const usersCollec = db.collection(usersCollectionString)



  /*
    // return if contactsArrayFresh in contacts doc has changed
    if (cDocBefore != undefined) {
        let contactsMapBeforeArray: string[] = []
  
        const contactsMapBefore = cDocBefore.contactsMap
        if (contactsMapBefore != null && contactsMapBefore != undefined) {
            const contactsMapObjectBefore: Map<string, any> = new Map(Object.entries(contactsMapBefore));
            contactsMapBeforeArray = Array.from(contactsMapObjectBefore.keys())
            contactsMapBeforeArray = [...new Set(contactsMapBeforeArray)]
        }
  
        let mapKeysAreSame: boolean = await arraysAreSame(fresh, contactsMapBeforeArray)
        if (mapKeysAreSame) {
            if (cDoc.contactsArrayFresh != undefined && cDoc.contactsArrayFresh != null) {
                let arrayIsSame = arraysAreSame(cDoc.contactsArrayFresh ?? [], cDocBefore.contactsArrayFresh ?? [])
                if (!arrayIsSame) {
                    console.log(`Internal returning; array changed, not map; Fresh: ${fresh.length} = ${contactsMapBeforeArray.length}; ${myOwnNumber}`)
                    return;
                }
            }
  
            if (cDocBefore.token != cDoc.token) {
                console.log(`Internal returning; token changed, not contacts; Fresh: ${fresh.length} = ${contactsMapBeforeArray.length}; ${myOwnNumber}`)
                return;
            }
        }
    }*/

  // MAJOR CHANGE - earlier: "const old: string[] = u!.contactsArrayOld || []"", and now old is just the keys of map in the 'before' trigger state





  //
  // ADDING STARTS
  //

  const addedArray: string[] = findAdded(old, fresh)

  console.log(`${myOwnNumber} (${now}) - started; fresh: ${fresh.length}, old: ${old.length}, added: ${addedArray.length}`)

  let uploadAdded: string[] = []
  // A - ADD
  let m: Map<string, Map<string, string[]>> = new Map
  for (const addedNum of addedArray) {
    const relevant: boolean = isRelevant(endingDigit, addedNum)
    if (myOwnNumber == '+918558521485') await db.collection('random').doc('u2_internal').update({ 'log': admin.firestore.FieldValue.arrayUnion(`01: Relevance ${relevant}: endingDigit: ${endingDigit}, addedNum: ${addedNum}`) })

    if (relevant) {
      if (!numbersToExcludeFromEmployeesCount.includes(addedNum)) {

        // ADD direct
        const companyIdArray: string[] = await getCompanyIdArrayOfUserHavingOwnNumber(addedNum)
        if (companyIdArray != null && companyIdArray != undefined)
          for (const cId of companyIdArray) { addLinkToCompaniesMap(addedNum, '', '', m, cId) }

        try {
          // ADD network
          const employedUsersForSecondLayer = await usersCollec.where('contactsArrayFresh', 'array-contains', addedNum).where('employed', '==', true).get()
          readsCounter = readsCounter + employedUsersForSecondLayer.docs.length
          if (myOwnNumber == '+918558521485') await db.collection('random').doc('u2_internal').update({ 'log': admin.firestore.FieldValue.arrayUnion(`02: fetching for ${addedNum}: ${employedUsersForSecondLayer.docs.length} docs`) })

          try {
            for (const employedUser of employedUsersForSecondLayer.docs) {
              const employedUserOwnNumber = employedUser.get('ownNumber')
              if (employedUserOwnNumber != undefined && employedUserOwnNumber != null && employedUserOwnNumber != '' && employedUserOwnNumber != myOwnNumber) {
                const companyIdArray: string[] = employedUser.get('companyIdArray') || []
                for (const cId of companyIdArray) { addLinkToCompaniesMap('', employedUserOwnNumber, addedNum, m, cId); }
              }
            }
          } catch (e) { if (e instanceof Error) await logError(`u2_internal///03///${e.toString()}`) }
          if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
            console.log(`${myOwnNumber} (${now}) - Indirect: ${employedUsersForSecondLayer} employed users`)
          }

        } catch (e) { if (e instanceof Error) await logError(`u2_internal///04///${e.toString()}`) }
      }

      uploadAdded.push(addedNum)
    }
  }

  if (uploadAdded.length > 0) {
    try {
      await updateNetworkDocs(myOwnNumber, m)
      // mil2 = (Date.now() - startTime) / 1000
      await userDoc.ref.update({ contactsArrayOld: admin.firestore.FieldValue.arrayUnion(...uploadAdded) })
      writesCounter++
    } catch (e) { if (e instanceof Error) await logError(`u2_internal///02: ${e.toString()}`) }
  }
  //
  // ADDING OVER
  //

  //
  // REMOVING STARTS
  //
  /*
  const networkSubcollec = db.collectionGroup('network')

  const removedArray: string[] = findRemoved(old, fresh)
  console.log(`removedArray: ${removedArray.length} for ownNumber ${myOwnNumber}`)
  let uploadRemoved: string[] = []
  for (const removedNum of removedArray) {
    const relevant: boolean = isRelevant(endingDigit, removedNum)

    if (relevant) {
      // REMOVE direct
      try {
        const myDocsForRemovingFromDirect = await networkSubcollec.where('directLinks', 'array-contains', removedNum).where('ownNumber', '==', myOwnNumber).get()
        await incrementReadWriteNSelfV2('a7', myDocsForRemovingFromDirect.docs.length)
        for (const myDoc of myDocsForRemovingFromDirect.docs) {
          await myDoc.ref.update({
            directLinks: admin.firestore.FieldValue.arrayRemove(removedNum),
            selfUpdatesPending: true,
            selfUpdatesFromUser: true
          })
          writesCounter++
        }
      } catch (e) {
        if (e instanceof Error) await logError(`u2///R1///${e.toString()}`);
        if (e instanceof Error) await log_u2(`ERR myDocs R1: ${e.toString()}`);
      }

      // REMOVE network
      try {
        const myDocsForRemovingFromNetwork = await networkSubcollec.where('networkKeys', 'array-contains', removedNum).where('ownNumber', '==', myOwnNumber).orderBy('points', 'desc').get()
        readsCounter = readsCounter + myDocsForRemovingFromNetwork.docs.length
        await incrementReadWriteNSelfV2('a8', myDocsForRemovingFromNetwork.docs.length)

        for (const myDoc of myDocsForRemovingFromNetwork.docs) {
          const path = `networkLinks.${removeRandomCharactersFromNumber(removedNum)}`
          try {
            const myDocData4 = myDoc.data();
            const networkFieldV4 = myDocData4.networkLinks
            if (networkFieldV4 != undefined && networkFieldV4 != null) {
              const networkFieldV4Map: Map<string, any> = new Map(Object.entries(networkFieldV4));
              if (networkFieldV4Map != undefined && networkFieldV4Map != null) {
                const networkFieldV4Values = networkFieldV4Map.get(removedNum)
                if (networkFieldV4Values != null && networkFieldV4Values != undefined && networkFieldV4Values.length != 0) {
                  await myDoc.ref.update({
                    [path]: admin.firestore.FieldValue.arrayRemove(...networkFieldV4Values),
                    selfUpdatesPending: true,
                    selfUpdatesFromUser: true
                  });
                  writesCounter++
                }
              }
            }
          } catch (e) {
            if (e instanceof Error)
              if (!e.toString().includes('No document to update'))
                await logError(`u2///v4x///${e.toString()}`)
          }
        }
      } catch (e) {
        if (e instanceof Error) await logError(`u2///R2///${e.toString()}`);
        if (e instanceof Error) await log_u2(`ERR myDocs R2: ${e.toString()}`);
      }
      uploadRemoved.push(removedNum)
    }
  }

  // let mil5 = (Date.now() - startTime) / 1000

  if (uploadRemoved.length > 0) {
    try {
      await userDoc.ref.update({ contactsArrayOld: admin.firestore.FieldValue.arrayRemove(...uploadRemoved) })
      writesCounter++
    } catch (e) {
      if (e instanceof Error)
        await logError(`u2_internal///02: ${e.toString()}`)
    }
  }
  // let mil6 = (Date.now() - startTime) / 1000

  */
  //
  // REMOVING ENDS
  //

  // console.log(`Fresh ${fresh.length}, old ${old.length}; added ${uploadAdded.length}, removed ${uploadRemoved.length}; ${myOwnNumber}`)
  if (endingDigit == '0')
    console.log(`${myOwnNumber} u2_internal - 00 - (${now}) - Fresh ${fresh.length}, old ${old.length}; added ${uploadAdded.length}, ${myOwnNumber}, r,w,d: ${readsCounter}, ${writesCounter}, ${deletesCounter}`)
  //
  await incrementReadWriteCounts('u2_internal - 00', readsCounter, writesCounter, deletesCounter)
  return
}

export const logToU2_internal = async (msg: string) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();

  var d = new Date();

  try {
    await db.collection('test').doc('u2_internal')
      .update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}///${msg.toString()}`) });
  } catch (e) {
    if (e instanceof Error)
      console.log(`ERROR in logToRandomCollecTestDocument: ${e.toString()}`)
  }
}

//"//Mar 09, 2024 - 05:29 AM
const firstAttemptV2 = new Map<string, string[]>([
  ['kabuli', ['kabuli']],
  ['chanadaal', ['chana daal', 'chanadal', 'chana dal']],
  ['toordaal', ['toordaal', 'toor daal', 'toor dall']],
  ['uraddaal', ['uraddaal', 'uraddall', 'urad daal', 'urad dall', 'USD/INR']],
  ['mungdaal', ['mungdaal', 'mung split', 'mung daal']],
  ['masoordaal', ['masoordaal', 'masoordall', 'masoor daal', 'masoor dall']],
  ['speckledbeans', ['speckled bean', 'chitra rajma', 'rajma chitra', 'chitra']],
  ['dhaniya', ['coriander', 'dhaniya', 'cilantro', 'धनिया']],
  ['fennel', ['fennel', 'sauf', 'सौंफ']],
  ['nigella', ['nigellaseeds', 'nigella', 'kalonji', 'कलोंजी']],
  ['ajwain', ['ajwain', 'अजवाइन']],
  ['poppyseed', ['poppy seed']],
  ['dryginger', ['ginger dry', 'सोंठ', 'dry ginger']],
  ['palmoil', ['palmoil', 'palm oil', 'palmoleinoil', 'palmolein oil']],
  ['soyabeanoil', ['soyabeanoil', 'soyabean oil', 'soybeanoil', 'soya bean oil', 'soybean oil', 'soyoil', 'soy oil', 'soyaoil', 'soya oil']],
  ['sunfloweroil', ['sunfloweroil', 'sunflower oil', 'sunfloweroil', 'sun flower oil']],
  ['mustardoil', ['mustardoil', 'mustard oil', 'sarsooil', 'sarso oil']],
  ['groundnutoil', ['groundnutoil', 'groundnut oil']],
  ['cottonseedoil', ['cottonseed oil', 'cottonseedoil', 'cotton seed oil', 'cotton oil', 'cottonoil']],
  ['castoroil', ['castoroil', 'castor oil']],
  ['sesameoil', ['sesameoil', 'sesame oil', 'sesam oil']],
  ['coconutoil', ['coconutoil', 'coconut oil']],
  ['neemoil', ['neem oil']],
  ['cornoil', ['corn oil', 'cornoil']],
  ['saffloweroil', ['saffloweroil', 'safflower oil']],
  ['ricebranoil', ['ricebranoil', 'rice bran oil', 'ricebran oil']],
  ['wheatflour', ['wheat flour', 'wheat flour']],
  ['allpurposeflour', ['all purpose flour', 'allpurposeflour']],
  ['gramflour', ['gram flour']],
  ['oilcake', ['soya bean doc', 'soya bean cake', 'soybean doc', 'soybean cake', 'mustard doc', 'mustard cake', 'cotton doc', 'cotton cake', 'groundnut cake', 'groundnut seed cake', 'safflower cake', 'safflower seed cake']],
  ['soyadoc', ['soya doc', 'soyabean doc', 'soy doc', 'soya bean doc', 'soydoc', 'soyadoc']],
  ['mustarddoc', ['mustard doc', 'mustarddoc']],
  ['groundnutdoc', ['groundnutdoc', 'groundnut doc', 'ground nut doc', 'peanut doc']],
  ['orange', ['orange']],
  ['taramiraseed', ['taramiraseed', 'taramira seed']],
  ['tamarind', ['tamarind']],
  ['gold', ['gold', 'sona', 'सोना']], // 02 march
  ['silver', ['silver', 'chandi', 'चांदी']], // 02 march
])
//"

//"//Mar 09, 2024 - 05:29 AM
const secondAttemptV2 = new Map<string, string[]>([
  ['chana', ['chana', 'चना', 'chickpea', 'chick pea', 'USD/INR']],
  ['toor', ['toor', 'tuar', 'tuvar', 'tuwar', 'tur', 'pigeonpea', 'pigeon pea', 'तूर', 'USD/INR']],
  ['urad', ['urad', 'black lentil', 'black matpe', 'blackmatpe', 'bmp', 'उड़द', 'उडद']],
  ['guar', ['guar', 'ग्वार', 'cluster bean', 'clusterbean']],
  ['mung', ['mung', 'moong', 'मूंग', 'USD/INR']],
  ['moth', ['moth', 'मोठ', 'USD/INR']],
  ['masoor', ['masoor', 'masur', 'lentil', 'मसूर', 'USD/INR']],
  ['greenpeas', ['greenpea', 'green pea', 'matar green']],
  ['yellowpeas', ['yellowpea', 'yellow pea', 'matar yellow', 'safed matar', 'matar white']],
  ['rajma', ['rajma', 'kidney', 'राजमा', 'USD/INR']],
  ['chawli', ['eyed beans', 'chawli', 'eye beans', 'eyebeans', 'eyedbeans', 'eyed beans', 'चौली', 'चौलाई', 'lobia', 'लोबिआ', 'USD/INR']],
  ['horsegram', ['horse gram', 'kulthi']],
  ['wheat', ['wheat', 'गेहू', 'गेहूँ', 'gehu', 'USD/INR']],
  ['maize', ['मक्का', 'maize', 'makka', 'corn', 'USD/INR']],
  ['jowar', ['jowar', 'ज्वार', 'sorghum', 'USD/INR']],
  ['barley', ['barley', 'जौ', 'बार्ली', 'USD/INR']],
  ['bajra', ['बाजरा', 'bajra', 'bajri', 'pearl millet', 'USD/INR']],
  ['fingermillet', ['finger millet', 'fingermillet']],
  ['foxtailmillet', ['foxtail millet', 'foxtailmillet']],
  ['prosomillet', ['proso millet', 'prosomillet']],
  ['littlemillet', ['little millet']],
  ['kodomillet', ['kodo millet', 'kodomillet']],
  ['barnyardmillet', ['barnyard millet']],
  ['rice', ['rice']],
  ['paddy', ['paddy']],
  ['soybean', ['सोया', 'सोय', 'soyabean', 'USD/INR', 'soyabean', 'soya bean', 'soybean', 'soy bean', 'soy', 'soya']],
  ['groundnut', ['peanut', 'peanuts', 'मूंगफली', 'mungfalli', 'mungfali', 'mumfali', 'groundnut', 'ground nut', 'pea nut', 'USD/INR']],
  ['sarso', ['mustard', 'sarso', 'सरसो', 'USD/INR']],
  ['sesame', ['sesame', 'तिल', 'USD/INR']],
  ['sunflower', ['sunflower', 'sun flower', 'सूरजमुखी', 'USD/INR']],
  ['castorseed', ['castor seed', 'castor']],
  ['flaxseed', ['flaxseed', 'flax seed', 'अलसी']],
  ['safflower', ['safflower', 'कुसुम', 'kusum', 'USD/INR']],
  ['chiaseed', ['chia seed', 'chiaseed', 'chia ']],
  ['haldi', ['haldi', 'turmeric', 'हल्दी']],
  ['jeera', ['cumin', 'jeera', 'जीरा']],
  ['methi', ['methi', 'fenugreek', 'मेथी']],
  ['clove', ['clove', 'लौंग']],
  ['redchilli', ['redchilli', 'chilly red', 'chilli red', 'red chilli', 'red chilly', 'lalmirch', 'lalmirch', 'lal mirchi', 'lal mirch', 'लाल मिर्च', 'लालमिर्च']],
  ['greencardamom', ['green cardamom', 'cardamom green']],
  ['blackcardamom', ['black cardamom', 'cardamom black']],
  ['psylliumhusk', ['psylliumhusk', 'psyllium husk', 'isabgol', 'इसबगोल']],
  ['blackpepper', ['black pepper', 'blackpepper', 'kali mirch', 'kalimirch', 'kali mirchi', 'kalimirchi', 'काली मिर्च', 'कालीमिर्च']],
  ['whitepepper', ['सफ़ेद मिर्च', 'whitepepper', 'white pepper']],
  ['staranise', ['staranise', 'star anise', 'चक्र फूल']],
  ['nutmeg', ['nutmeg', 'जायफल']],
  ['mace', ['mace', 'जावित्री']],
  ['bayleaf', ['bay leaf']],
  ['stoneflower', ['stone flower', 'stoneflower']],
  ['cashew', ['cashew', 'काजू']],
  ['almond', ['almond', 'बादाम', 'बदाम']],
  ['raisin', ['raisin', 'किशमिश']],
  ['pistachio', ['pista', 'pistachio', 'पिस्ता']],
  ['walnut', ['walnut', 'अखरोट']],
  ['fig', ['fig', 'अंजीर']],
  ['dates', ['dates', 'खजूर']],
  ['onion', ['onion']],
  ['potato', ['potato']],
  ['ginger', ['ginger']],
  ['garlic', ['garlic']],
  ['tomato', ['tomato']],
  ['sugar', ['USD/INR', 'sugar']],
  ['cotton', ['cotton']],
  ['semolina', ['semolina']],
  ['gud', ['jaggery', 'gud', 'गुड़']],
  ['sago', ['sago', 'sabudana']],
  ['tea', ['tea', 'चायपत्ती']],
  ['coffeebeans', ['coffee']],
  ['foxnut', ['foxnut', 'fox nut', 'makhana', 'मखाना']],
  ['cinnamon', ['cinnamon']],
  ['apple', ['apple']],
  ['pomegranate', ['pomegranate']],
  ['sweetlime', ['sweet lime', 'sweetlime']],
])
//"
export const getTransporterPostsKeywords = (from: string, to: string, searchingOrHaving: string): string[] => {
  let lst: string[] = []

  const fromAvailable: boolean = from.includes(', ') && from.split(', ').length == 2
  const toAvailable: boolean = to.includes(', ') && to.split(', ').length == 2

  if (fromAvailable && toAvailable) {
    const f2: string = from.split(', ')[1]
    const t2: string = to.split(', ')[1]

    lst.push(`from_${from}`)
    lst.push(`from_${f2}`)
    lst.push(`to_${to}`)
    lst.push(`to_${t2}`)

    lst.push(`from_${from}_to_${to}`)
    lst.push(`from_${from}_to_${t2}`)
    lst.push(`from_${f2}_to_${to}`)
    lst.push(`from_${f2}_to_${t2}`)

  } else if (fromAvailable) {

    const f2: string = from.split(', ')[1]
    lst.push(`from_${from}`)
    lst.push(`from_${f2}`)

  } else if (toAvailable) {

    const t2: string = to.split(', ')[1]
    lst.push(`to_${to}`)
    lst.push(`to_${t2}`)
  }

  let lstTwo: string[] = []

  if (searchingOrHaving != '') {
    for (const lstString of lst) {
      lstTwo.push(`${lstString}`.toLowerCase())
      lstTwo.push(`${lstString}_${searchingOrHaving}`.toLowerCase())
    }
    lstTwo.push(searchingOrHaving.toLowerCase())
  }

  lstTwo = [...new Set(lstTwo)]

  return lstTwo
}

export const getPostKeywords = (message: string = "", buySell: boolean = false, news: boolean = false, rateOnly: boolean = false): string[] => {
  message = message.toLowerCase()
  if (message.includes('popcorn') || message.includes('pop corn')) return []

  var keywordsList: string[] = []

  for (const uniqueWord of firstAttemptV2.keys()) {
    const checkWords: string[] = firstAttemptV2.get(uniqueWord)!
    for (const checkWord of checkWords) {
      if (message.includes(checkWord)) {
        const isRelevant: boolean = messageIsRelevantForKeyword(message, checkWord)
        if (isRelevant) keywordsList.push(uniqueWord)
      }
    }
  }

  if (keywordsList.length == 0
    //&& !message.toLowerCase().includes('today') && !message.toLowerCase().includes('rates')
  ) {
    for (const uniqueWord of secondAttemptV2.keys()) {
      const checkWords: string[] = secondAttemptV2.get(uniqueWord)!
      for (const checkWord of checkWords) {

        // new method
        const isRelevant: boolean = messageIsRelevantForKeyword(message, checkWord)
        if (isRelevant) keywordsList.push(uniqueWord)

        // old method
        // if (checkWord == "til") {
        //   const keyCount: number = (message.match(/til/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/till/g) || []).length
        //   wrongCount += (message.match(/ntil/g) || []).length // until
        //   wrongCount += (message.match(/entil/g) || []).length // lentil / Lentil

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "tomato") {
        //   const keyCount: number = (message.match(/tomato/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/tomato chili/g) || []).length
        //   wrongCount += (message.match(/tomato chilli/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "gud") {
        //   const keyCount: number = (message.match(/gud/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/gudi/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "sugar") {
        //   const keyCount: number = (message.match(/sugar/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/potato sugar/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "cumin") {
        //   const keyCount: number = (message.match(/cumin/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/rice/g) || []).length
        //   wrongCount += (message.match(/urcumin/g) || []).length
        //   wrongCount += (message.match(/india gate jeera/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "bajra") {
        //   const keyCount: number = (message.match(/bajra/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/ajrang/g) || []).length
        //   wrongCount += (message.match(/AJRANG/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "til") {
        //   const keyCount: number = (message.match(/til/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/till/g) || []).length
        //   wrongCount += (message.match(/Till/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "orange") {

        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/kabuli/g) || []).length
        //   wrongCount += (message.match(/bold/g) || []).length
        //   wrongCount += (message.match(/rajma/g) || []).length
        //   wrongCount += (message.match(/rice/g) || []).length
        //   wrongCount += (message.match(/chana/g) || []).length
        //   wrongCount += (message.match(/masoor/g) || []).length
        //   wrongCount += (message.match(/daal/g) || []).length
        //   wrongCount += (message.match(/urad/g) || []).length
        //   wrongCount += (message.match(/mung/g) || []).length

        //   if (wrongCount == 0) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "apple") {
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/rice/g) || []).length
        //   wrongCount += (message.match(/bajra/g) || []).length
        //   wrongCount += (message.match(/kabuli/g) || []).length
        //   wrongCount += (message.match(/bold/g) || []).length
        //   wrongCount += (message.match(/rajma/g) || []).length
        //   wrongCount += (message.match(/rice/g) || []).length
        //   wrongCount += (message.match(/chana/g) || []).length
        //   wrongCount += (message.match(/masoor/g) || []).length
        //   wrongCount += (message.match(/daal/g) || []).length
        //   wrongCount += (message.match(/urad/g) || []).length
        //   wrongCount += (message.match(/mung/g) || []).length

        //   if (wrongCount == 0) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "tea") {
        //   const keyCount: number = (message.match(/tea/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/team/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "urad") {
        //   const keyCount: number = (message.match(/urad/g) || []).length;

        //   if ((keyCount > (message.match(/urad daal/g) || []).length)) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "तूर") {
        //   const keyCount: number = (message.match(/तूर/g) || []).length;

        //   if ((keyCount > (message.match(/लातूर/g) || []).length)) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "coffeebeans") {
        //   const keyCount: number = (message.match(/coffeebeans/g) || []).length;

        //   if ((keyCount > (message.match(/rajma/g) || []).length)) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "toor") {
        //   const keyCount: number = (message.match(/toor/g) || []).length;

        //   if ((keyCount > (message.match(/toor daal/g) || []).length)) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "tur") {
        //   const keyCount: number = (message.match(/tur/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/chitoor/g) || []).length
        //   wrongCount += (message.match(/future/g) || []).length
        //   wrongCount += (message.match(/Future/g) || []).length
        //   wrongCount += (message.match(/saturday/g) || []).length
        //   wrongCount += (message.match(/Saturday/g) || []).length
        //   wrongCount += (message.match(/return/g) || []).length
        //   wrongCount += (message.match(/Return/g) || []).length
        //   wrongCount += (message.match(/guntur/g) || []).length
        //   wrongCount += (message.match(/Guntur/g) || []).length
        //   wrongCount += (message.match(/GUNTUR/g) || []).length
        //   wrongCount += (message.match(/latur/g) || []).length
        //   wrongCount += (message.match(/Latur/g) || []).length
        //   wrongCount += (message.match(/LATUR/g) || []).length
        //   wrongCount += (message.match(/asturi/g) || []).length
        //   wrongCount += (message.match(/ASTURI/g) || []).length
        //   wrongCount += (message.match(/oisture/g) || []).length
        //   wrongCount += (message.match(/OISTURE/g) || []).length
        //   wrongCount += (message.match(/atural/g) || []).length
        //   wrongCount += (message.match(/ATURAL/g) || []).length
        //   wrongCount += (message.match(/Proddatur/g) || []).length
        //   wrongCount += (message.match(/proddatur/g) || []).length
        //   wrongCount += (message.match(/manufactur/g) || []).length
        //   wrongCount += (message.match(/Manufactur/g) || []).length
        //   wrongCount += (message.match(/MANUFACTUR/g) || []).length

        //   wrongCount += (message.match(/atur/g) || []).length
        //   wrongCount += (message.match(/btur/g) || []).length
        //   wrongCount += (message.match(/ctur/g) || []).length
        //   wrongCount += (message.match(/dtur/g) || []).length
        //   wrongCount += (message.match(/etur/g) || []).length
        //   wrongCount += (message.match(/ftur/g) || []).length
        //   wrongCount += (message.match(/gtur/g) || []).length
        //   wrongCount += (message.match(/htur/g) || []).length
        //   wrongCount += (message.match(/itur/g) || []).length
        //   wrongCount += (message.match(/jtur/g) || []).length
        //   wrongCount += (message.match(/ktur/g) || []).length
        //   wrongCount += (message.match(/ltur/g) || []).length
        //   wrongCount += (message.match(/mtur/g) || []).length
        //   wrongCount += (message.match(/ntur/g) || []).length
        //   wrongCount += (message.match(/otur/g) || []).length
        //   wrongCount += (message.match(/ptur/g) || []).length
        //   wrongCount += (message.match(/qtur/g) || []).length
        //   wrongCount += (message.match(/rtur/g) || []).length
        //   wrongCount += (message.match(/stur/g) || []).length
        //   wrongCount += (message.match(/ttur/g) || []).length
        //   wrongCount += (message.match(/utur/g) || []).length
        //   wrongCount += (message.match(/vtur/g) || []).length
        //   wrongCount += (message.match(/wtur/g) || []).length
        //   wrongCount += (message.match(/xtur/g) || []).length
        //   wrongCount += (message.match(/ytur/g) || []).length
        //   wrongCount += (message.match(/ztur/g) || []).length

        //   wrongCount += (message.match(/tura/g) || []).length
        //   wrongCount += (message.match(/turb/g) || []).length
        //   wrongCount += (message.match(/turc/g) || []).length

        //   wrongCount += (message.match(/ture/g) || []).length
        //   wrongCount += (message.match(/turf/g) || []).length
        //   wrongCount += (message.match(/turg/g) || []).length
        //   wrongCount += (message.match(/turh/g) || []).length
        //   wrongCount += (message.match(/turi/g) || []).length
        //   wrongCount += (message.match(/turj/g) || []).length
        //   wrongCount += (message.match(/turk/g) || []).length
        //   wrongCount += (message.match(/turl/g) || []).length
        //   wrongCount += (message.match(/turm/g) || []).length
        //   wrongCount += (message.match(/turn/g) || []).length
        //   wrongCount += (message.match(/turo/g) || []).length
        //   wrongCount += (message.match(/turp/g) || []).length
        //   wrongCount += (message.match(/turq/g) || []).length
        //   wrongCount += (message.match(/turr/g) || []).length
        //   wrongCount += (message.match(/turs/g) || []).length
        //   wrongCount += (message.match(/turt/g) || []).length
        //   wrongCount += (message.match(/turu/g) || []).length
        //   wrongCount += (message.match(/turv/g) || []).length
        //   wrongCount += (message.match(/turw/g) || []).length
        //   wrongCount += (message.match(/turx/g) || []).length
        //   wrongCount += (message.match(/tury/g) || []).length
        //   wrongCount += (message.match(/turz/g) || []).length


        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "moth") {
        //   const keyCount: number = (message.match(/moth/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/mother/g) || []).length
        //   wrongCount += (message.match(/Mother/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "moong") {
        //   const keyCount: number = (message.match(/moong/g) || []).length;
        //   let wrongCount: number = 0;

        //   wrongCount += (message.match(/मूंगफली/g) || []).length
        //   wrongCount += (message.match(/मुंगफली/g) || []).length
        //   wrongCount += (message.match(/moongfali/g) || []).length
        //   wrongCount += (message.match(/moongfalli/g) || []).length
        //   wrongCount += (message.match(/moong fali/g) || []).length
        //   wrongCount += (message.match(/moong falli/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "mung") {
        //   const keyCount: number = (message.match(/mung/g) || []).length;
        //   let wrongCount: number = 0;
        //   wrongCount += (message.match(/मूंग फली/g) || []).length
        //   wrongCount += (message.match(/मूंगफली/g) || []).length
        //   wrongCount += (message.match(/mungfali/g) || []).length
        //   wrongCount += (message.match(/mungfalli/g) || []).length
        //   wrongCount += (message.match(/mung fali/g) || []).length
        //   wrongCount += (message.match(/mung falli/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "rice") {
        //   const keyCount: number = (message.match(/rice/g) || []).length;
        //   let wrongCount: number = 0;
        //   wrongCount += (message.match(/price/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "मूंग") {
        //   const keyCount: number = (message.match(/मूंग/g) || []).length;
        //   let wrongCount: number = 0;
        //   wrongCount += (message.match(/मूंग फली/g) || []).length
        //   wrongCount += (message.match(/मूंगफली/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else if (checkWord == "chana") {
        //   const keyCount: number = (message.match(/chana/g) || []).length;
        //   let wrongCount: number = 0;
        //   wrongCount += (message.match(/chanan/g) || []).length

        //   if (keyCount > wrongCount) {
        //     keywordsList.push(uniqueWord)
        //   }
        // } else {
        //   if (message.includes(checkWord)) {
        //     keywordsList.push(uniqueWord)
        //   }
        // }
      }
    }
  }

  if (buySell) {
    var specificTypes: string[] = []
    specificTypes.push('buySell')
    for (const t of keywordsList) {
      specificTypes.push(t)
      specificTypes.push(`buySell_${t}`)
    }
    specificTypes = [...new Set(specificTypes)]
    return specificTypes
  }

  if (news) {
    var specificTypes: string[] = []
    specificTypes.push('news')
    // if (!message.includes('market rates'))
    for (const t of keywordsList) {
      specificTypes.push(t)
      specificTypes.push(`news_${t}`)
    }
    specificTypes = [...new Set(specificTypes)]
    return specificTypes
  }

  if (rateOnly) {
    var specificTypes: string[] = []
    specificTypes.push('rateOnly')
    for (const t of keywordsList) {
      specificTypes.push(t)
      specificTypes.push(`rateOnly_${t}`)
    }
    specificTypes = [...new Set(specificTypes)]
    return specificTypes
  }

  keywordsList = [...new Set(keywordsList)]
  return keywordsList
}

export const messageIsRelevantForKeyword = (message: string, checkWord: string): boolean => {
  if (checkWord == "til") {
    const keyCount: number = (message.match(/til/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/till/g) || []).length
    wrongCount += (message.match(/ntil/g) || []).length // until
    wrongCount += (message.match(/entil/g) || []).length // lentil / Lentil

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "tomato") {
    const keyCount: number = (message.match(/tomato/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/tomato chili/g) || []).length
    wrongCount += (message.match(/tomato chilli/g) || []).length
    wrongCount += (message.match(/chilli red new tomato/g) || []).length // 02 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "gud") {
    const keyCount: number = (message.match(/gud/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/gudi/g) || []).length
    wrongCount += (message.match(/vattigudepadu/g) || []).length // 02 march
    wrongCount += (message.match(/guledagudda/g) || []).length // 02 march
    wrongCount += (message.match(/rice guddy/g) || []).length // 02 march
    wrongCount += (message.match(/nanjangud/g) || []).length // 27 march
    wrongCount += (message.match(/miryalaguda/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "sugar") {
    const keyCount: number = (message.match(/sugar/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/potato sugar/g) || []).length
    wrongCount += (message.match(/cotton/g) || []).length
    wrongCount += (message.match(/sugar mill/g) || []).length // 27 March
    wrongCount += (message.match(/nirani sugars/g) || []).length // 03 April

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "cumin") {
    const keyCount: number = (message.match(/cumin/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/rice/g) || []).length
    wrongCount += (message.match(/urcumin/g) || []).length
    wrongCount += (message.match(/india gate jeera/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "bajra") {
    const keyCount: number = (message.match(/bajra/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/ajrang/g) || []).length
    wrongCount += (message.match(/AJRANG/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "til") {
    const keyCount: number = (message.match(/til/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/till/g) || []).length
    wrongCount += (message.match(/Till/g) || []).length

    if (keyCount > wrongCount) {

    }
  } else if (checkWord == "orange") {
    const keyCount: number = (message.match(/orange/g) || []).length;

    let wrongCount: number = 0;

    wrongCount += (message.match(/kabuli/g) || []).length
    wrongCount += (message.match(/bold/g) || []).length
    wrongCount += (message.match(/rajma/g) || []).length
    wrongCount += (message.match(/rice/g) || []).length
    wrongCount += (message.match(/chana/g) || []).length
    wrongCount += (message.match(/masoor/g) || []).length
    wrongCount += (message.match(/daal/g) || []).length
    wrongCount += (message.match(/urad/g) || []).length
    wrongCount += (message.match(/mung/g) || []).length
    wrongCount += (message.match(/onion/g) || []).length
    wrongCount += (message.match(/potato/g) || []).length
    wrongCount += (message.match(/semolina/g) || []).length
    wrongCount += (message.match(/gehu/g) || []).length
    wrongCount += (message.match(/matar green orange (etc)/g) || []).length // 02 march

    if (wrongCount == 0 && keyCount > 0) {
      return true;
    }
  } else if (checkWord == "apple") {
    const keyCount: number = (message.match(/apple/g) || []).length;

    let wrongCount: number = 0;

    wrongCount += (message.match(/rice/g) || []).length
    wrongCount += (message.match(/paddy/g) || []).length
    wrongCount += (message.match(/chilli/g) || []).length
    wrongCount += (message.match(/onion/g) || []).length
    wrongCount += (message.match(/potato/g) || []).length
    wrongCount += (message.match(/semolina/g) || []).length
    wrongCount += (message.match(/gehu/g) || []).length
    wrongCount += (message.match(/bajra/g) || []).length
    wrongCount += (message.match(/kabuli/g) || []).length
    wrongCount += (message.match(/bold/g) || []).length
    wrongCount += (message.match(/rajma/g) || []).length
    wrongCount += (message.match(/rice/g) || []).length
    wrongCount += (message.match(/chana/g) || []).length
    wrongCount += (message.match(/masoor/g) || []).length
    wrongCount += (message.match(/daal/g) || []).length
    wrongCount += (message.match(/urad/g) || []).length
    wrongCount += (message.match(/mung/g) || []).length
    wrongCount += (message.match(/jowar/g) || []).length
    wrongCount += (message.match(/makka/g) || []).length
    wrongCount += (message.match(/maize/g) || []).length
    wrongCount += (message.match(/matar/g) || []).length
    wrongCount += (message.match(/chawli/g) || []).length
    wrongCount += (message.match(/soya/g) || []).length
    wrongCount += (message.match(/soybean/g) || []).length
    wrongCount += (message.match(/soy bean/g) || []).length
    wrongCount += (message.match(/millet/g) || []).length
    wrongCount += (message.match(/seeds/g) || []).length

    if (wrongCount == 0 && keyCount > 0) {
      return true;
    }
  } else if (checkWord == "raisin") {
    const keyCount: number = (message.match(/raisin/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/raising/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "tea") {
    const keyCount: number = (message.match(/tea/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/team/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "urad") {
    const keyCount: number = (message.match(/urad/g) || []).length;

    if ((keyCount > (message.match(/urad daal/g) || []).length)) {
      return true;
    }
  } else if (checkWord == "तूर") {
    const keyCount: number = (message.match(/तूर/g) || []).length;

    if ((keyCount > (message.match(/लातूर/g) || []).length)) {
      return true;
    }
  } else if (checkWord == "coffeebeans") {
    const keyCount: number = (message.match(/coffeebeans/g) || []).length;

    if ((keyCount > (message.match(/rajma/g) || []).length)) {
      return true;
    }
  } else if (checkWord == "toor") {
    const keyCount: number = (message.match(/toor/g) || []).length;

    if ((keyCount > (message.match(/toor daal/g) || []).length)) {
      return true;
    }
  } else if (checkWord == "tur") {
    const keyCount: number = (message.match(/tur/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/chitoor/g) || []).length
    wrongCount += (message.match(/future/g) || []).length
    wrongCount += (message.match(/Future/g) || []).length
    wrongCount += (message.match(/saturday/g) || []).length
    wrongCount += (message.match(/Saturday/g) || []).length
    wrongCount += (message.match(/return/g) || []).length
    wrongCount += (message.match(/Return/g) || []).length
    wrongCount += (message.match(/guntur/g) || []).length
    wrongCount += (message.match(/Guntur/g) || []).length
    wrongCount += (message.match(/GUNTUR/g) || []).length
    wrongCount += (message.match(/latur/g) || []).length
    wrongCount += (message.match(/Latur/g) || []).length
    wrongCount += (message.match(/LATUR/g) || []).length
    wrongCount += (message.match(/asturi/g) || []).length
    wrongCount += (message.match(/ASTURI/g) || []).length
    wrongCount += (message.match(/oisture/g) || []).length
    wrongCount += (message.match(/OISTURE/g) || []).length
    wrongCount += (message.match(/atural/g) || []).length
    wrongCount += (message.match(/ATURAL/g) || []).length
    wrongCount += (message.match(/Proddatur/g) || []).length
    wrongCount += (message.match(/proddatur/g) || []).length
    wrongCount += (message.match(/manufactur/g) || []).length
    wrongCount += (message.match(/Manufactur/g) || []).length
    wrongCount += (message.match(/MANUFACTUR/g) || []).length

    wrongCount += (message.match(/atur/g) || []).length
    wrongCount += (message.match(/btur/g) || []).length
    wrongCount += (message.match(/ctur/g) || []).length
    wrongCount += (message.match(/dtur/g) || []).length
    wrongCount += (message.match(/etur/g) || []).length
    wrongCount += (message.match(/ftur/g) || []).length
    wrongCount += (message.match(/gtur/g) || []).length
    wrongCount += (message.match(/htur/g) || []).length
    wrongCount += (message.match(/itur/g) || []).length
    wrongCount += (message.match(/jtur/g) || []).length
    wrongCount += (message.match(/ktur/g) || []).length
    wrongCount += (message.match(/ltur/g) || []).length
    wrongCount += (message.match(/mtur/g) || []).length
    wrongCount += (message.match(/ntur/g) || []).length
    wrongCount += (message.match(/otur/g) || []).length
    wrongCount += (message.match(/ptur/g) || []).length
    wrongCount += (message.match(/qtur/g) || []).length
    wrongCount += (message.match(/rtur/g) || []).length
    wrongCount += (message.match(/stur/g) || []).length
    wrongCount += (message.match(/ttur/g) || []).length
    wrongCount += (message.match(/utur/g) || []).length
    wrongCount += (message.match(/vtur/g) || []).length
    wrongCount += (message.match(/wtur/g) || []).length
    wrongCount += (message.match(/xtur/g) || []).length
    wrongCount += (message.match(/ytur/g) || []).length
    wrongCount += (message.match(/ztur/g) || []).length

    wrongCount += (message.match(/tura/g) || []).length
    wrongCount += (message.match(/turb/g) || []).length
    wrongCount += (message.match(/turc/g) || []).length

    wrongCount += (message.match(/ture/g) || []).length
    wrongCount += (message.match(/turf/g) || []).length
    wrongCount += (message.match(/turg/g) || []).length
    wrongCount += (message.match(/turh/g) || []).length
    wrongCount += (message.match(/turi/g) || []).length
    wrongCount += (message.match(/turj/g) || []).length
    wrongCount += (message.match(/turk/g) || []).length
    wrongCount += (message.match(/turl/g) || []).length
    wrongCount += (message.match(/turm/g) || []).length
    wrongCount += (message.match(/turn/g) || []).length
    wrongCount += (message.match(/turo/g) || []).length
    wrongCount += (message.match(/turp/g) || []).length
    wrongCount += (message.match(/turq/g) || []).length
    wrongCount += (message.match(/turr/g) || []).length
    wrongCount += (message.match(/turs/g) || []).length
    wrongCount += (message.match(/turt/g) || []).length
    wrongCount += (message.match(/turu/g) || []).length
    wrongCount += (message.match(/turv/g) || []).length
    wrongCount += (message.match(/turw/g) || []).length
    wrongCount += (message.match(/turx/g) || []).length
    wrongCount += (message.match(/tury/g) || []).length
    wrongCount += (message.match(/turz/g) || []).length


    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "moth") {
    const keyCount: number = (message.match(/moth/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/mother/g) || []).length
    wrongCount += (message.match(/Mother/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "moong") {
    const keyCount: number = (message.match(/moong/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/मूंगफली/g) || []).length
    wrongCount += (message.match(/मुंगफली/g) || []).length
    wrongCount += (message.match(/moongfali/g) || []).length
    wrongCount += (message.match(/moongfalli/g) || []).length
    wrongCount += (message.match(/moong fali/g) || []).length
    wrongCount += (message.match(/moong falli/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "mung") {
    const keyCount: number = (message.match(/mung/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/मूंग फली/g) || []).length
    wrongCount += (message.match(/मूंगफली/g) || []).length
    wrongCount += (message.match(/mungfali/g) || []).length
    wrongCount += (message.match(/mungfalli/g) || []).length
    wrongCount += (message.match(/mung fali/g) || []).length
    wrongCount += (message.match(/mung falli/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "rice") {
    const keyCount: number = (message.match(/rice/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/price/g) || []).length
    wrongCount += (message.match(/miryalaguda/g) || []).length // 27 march
    wrongCount += (message.match(/rice bran/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "मूंग") {
    const keyCount: number = (message.match(/मूंग/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/मूंग फली/g) || []).length
    wrongCount += (message.match(/मूंगफली/g) || []).length

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "chana" || checkWord == "चना" || checkWord == "chickpea" || checkWord == "chick pea") {
    const keyCount: number = (message.match(/chana/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/chanan/g) || []).length
    wrongCount += (message.match(/सुचना/g) || []).length // 28 march
    wrongCount += (message.match(/uchana/g) || []).length // 31 March

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "haldi") {
    const keyCount: number = (message.match(/haldi/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/haldia/g) || []).length // 02 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "redchilli") {
    const keyCount: number = (message.match(/redchilli/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/toor (chilli sawa)/g) || []).length // 02 march
    wrongCount += (message.match(/toor red chilly sawa/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "pistachio") {
    const keyCount: number = (message.match(/pistachio/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/toor (kesar pista)/g) || []).length // 02 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "dates") {
    const keyCount: number = (message.match(/dates/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/update/g) || []).length // 02 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "sunfloweroil") {
    const keyCount: number = (message.match(/sunfloweroil/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/sunflower oil cake/g) || []).length // 20 march
    wrongCount += (message.match(/sunflower seeds/g) || []).length // 20 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "jeera") {
    const keyCount: number = (message.match(/jeera/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/jeerasar/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "mustardseed" || checkWord == "mustard seed") {
    const keyCount: number = (message.match(/mustardseed/g) || message.match(/mustard seed/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/oil cake/g) || []).length // 07 april
    wrongCount += (message.match(/solvent deo/g) || []).length // 07 april

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "oilcake" || checkWord == "oil cake") {
    const keyCount: number = (message.match(/oilcake/g) || message.match(/oil cake/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/cake rate/g) || []).length // 27 march
    wrongCount += (message.match(/mustard seed rate/g) || []).length // 21 april

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "groundnutoil" || checkWord == "groundnut oil") {
    const keyCount: number = (message.match(/groundnutoil/g) || message.match(/groundnut oil/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/oil cake/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "saffloweroil" || checkWord == "safflower oil") {
    const keyCount: number = (message.match(/saffloweroil/g) || message.match(/safflower oil/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/oil cake/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "sesameoil" || checkWord == "sesame oil") {
    const keyCount: number = (message.match(/sesameoil/g) || message.match(/sesame oil/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/oil cake/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "mustardoil" || checkWord == "mustard oil") {
    const keyCount: number = (message.match(/mustardoil/g) || message.match(/mustard oil/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/oil cake/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "methi") {
    const keyCount: number = (message.match(/methi/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/amethi/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "masoor" || checkWord == "masur") {
    const keyCount: number = (message.match(/masoor/g) || message.match(/masur/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/masuri/g) || []).length // 27 march
    wrongCount += (message.match(/masuro/g) || []).length // 27 march
    wrongCount += (message.match(/masoori/g) || []).length // 31 march
    wrongCount += (message.match(/sonamasuri/g) || []).length // 13 april

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "guar") {
    const keyCount: number = (message.match(/guar/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/guarantee/g) || []).length // 27 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "gold" || checkWord == "sona" || checkWord == "सोना") {
    const keyCount: number = (message.match(/gold/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/golden/g) || []).length // 28 march
    wrongCount += (message.match(/sonai/g) || []).length // 28 march
    wrongCount += (message.match(/sonam/g) || []).length // 28 march
    wrongCount += (message.match(/sona silky/g) || []).length // 28 march
    wrongCount += (message.match(/gold size/g) || []).length // 28 march
    wrongCount += (message.match(/mafiya gold/g) || []).length // 28 march
    wrongCount += (message.match(/lalmati sep gold/g) || []).length // 28 march
    wrongCount += (message.match(/cut sr gold/g) || []).length // 28 march
    wrongCount += (message.match(/fatka imported gold/g) || []).length // 28 march
    wrongCount += (message.match(/toor desi new sona/g) || []).length // 28 march
    wrongCount += (message.match(/toor daal muskan gold/g) || []).length // 28 march
    wrongCount += (message.match(/sonaal/g) || []).length // 28 march
    wrongCount += (message.match(/krishna gold/g) || []).length // 28 march
    wrongCount += (message.match(/sortex gold/g) || []).length // 28 march
    wrongCount += (message.match(/vardhman gold/g) || []).length // 28 march
    wrongCount += (message.match(/flour kismat gold/g) || []).length // 28 march
    wrongCount += (message.match(/daal gold/g) || []).length // 28 march
    wrongCount += (message.match(/matar white sona/g) || []).length // 28 march
    wrongCount += (message.match(/r s gold/g) || []).length // 28 march
    wrongCount += (message.match(/daal ruchi gold/g) || []).length // 28 march
    wrongCount += (message.match(/agrogold/g) || []).length // 28 march
    wrongCount += (message.match(/jio gold/g) || []).length // 28 march
    wrongCount += (message.match(/toor daal gold/g) || []).length // 28 march
    wrongCount += (message.match(/sona masoori/g) || []).length // 28 march
    wrongCount += (message.match(/samrat gold/g) || []).length // 28 march
    wrongCount += (message.match(/akshar gold/g) || []).length // 28 march
    wrongCount += (message.match(/rice gold/g) || []).length // 28 march
    wrongCount += (message.match(/rice golden/g) || []).length // 28 march
    wrongCount += (message.match(/meera gold/g) || []).length // 28 march
    wrongCount += (message.match(/babuji gold/g) || []).length // 28 march
    wrongCount += (message.match(/sona nutrients/g) || []).length // 28 march
    wrongCount += (message.match(/kiyara gold/g) || []).length // 28 march
    wrongCount += (message.match(/winera gold/g) || []).length // 28 march
    wrongCount += (message.match(/shivam gold/g) || []).length // 28 march
    wrongCount += (message.match(/v r gold/g) || []).length // 28 march
    wrongCount += (message.match(/rice india gold/g) || []).length // 28 march
    wrongCount += (message.match(/rice old golden/g) || []).length // 28 march
    wrongCount += (message.match(/rice old desi sonam/g) || []).length // 28 march
    wrongCount += (message.match(/rice old desi golden/g) || []).length // 28 march
    wrongCount += (message.match(/rice old prince gold/g) || []).length // 28 march
    wrongCount += (message.match(/rice old sita gold/g) || []).length // 28 march
    wrongCount += (message.match(/golden roots/g) || []).length // 28 march
    wrongCount += (message.match(/talai bold gold/g) || []).length // 28 march
    wrongCount += (message.match(/tadka gold/g) || []).length // 28 march
    wrongCount += (message.match(/manpasand gold/g) || []).length // 28 march
    wrongCount += (message.match(/dhokla gold/g) || []).length // 28 march
    wrongCount += (message.match(/daal choti gold/g) || []).length // 28 march
    wrongCount += (message.match(/sai gold/g) || []).length // 28 march
    wrongCount += (message.match(/gi gold/g) || []).length // 28 march
    wrongCount += (message.match(/sampada gold/g) || []).length // 30 march
    wrongCount += (message.match(/toor daal sona/g) || []).length // 30 march
    wrongCount += (message.match(/rice sona/g) || []).length // 30 march
    wrongCount += (message.match(/dollargold/g) || []).length // 30 march
    wrongCount += (message.match(/dollar gold/g) || []).length // 30 march
    wrongCount += (message.match(/rathigold/g) || []).length // 30 march
    wrongCount += (message.match(/rathi gold/g) || []).length // 30 march
    wrongCount += (message.match(/star gold/g) || []).length // 30 march
    wrongCount += (message.match(/stargold/g) || []).length // 31 march
    wrongCount += (message.match(/royal mn gold/g) || []).length // 30 march
    wrongCount += (message.match(/mogar gold/g) || []).length // 30 march
    wrongCount += (message.match(/shayona gold/g) || []).length // 30 march
    wrongCount += (message.match(/sr gold/g) || []).length // 30 march
    wrongCount += (message.match(/rohini gold/g) || []).length // 30 march
    wrongCount += (message.match(/goldan/g) || []).length // 30 march
    wrongCount += (message.match(/umiya gold/g) || []).length // 31 march
    wrongCount += (message.match(/u v gold/g) || []).length // 31 march
    wrongCount += (message.match(/uv gold/g) || []).length // 31 march
    wrongCount += (message.match(/super gold/g) || []).length // 31 march
    wrongCount += (message.match(/sona masoori/g) || []).length // 31 march
    wrongCount += (message.match(/s r gold/g) || []).length // 02 april
    wrongCount += (message.match(/s.r gold/g) || []).length // 02 april
    wrongCount += (message.match(/sr gold/g) || []).length // 02 april
    wrongCount += (message.match(/kt gold/g) || []).length // 02 april
    wrongCount += (message.match(/k.t gold/g) || []).length // 02 april
    wrongCount += (message.match(/k t gold/g) || []).length // 02 april
    wrongCount += (message.match(/ruchi gold/g) || []).length // 02 april
    wrongCount += (message.match(/sdm gold/g) || []).length // 02 april
    wrongCount += (message.match(/gold crown/g) || []).length // 02 april
    wrongCount += (message.match(/rk gold/g) || []).length // 02 april
    wrongCount += (message.match(/r.k gold/g) || []).length // 02 april
    wrongCount += (message.match(/r k gold/g) || []).length // 02 april
    wrongCount += (message.match(/gokul gold/g) || []).length // 02 april
    wrongCount += (message.match(/pp gold/g) || []).length // 02 april
    wrongCount += (message.match(/p.p gold/g) || []).length // 02 april
    wrongCount += (message.match(/sabut gold/g) || []).length // 02 april
    wrongCount += (message.match(/nice gold/g) || []).length // 03 april
    wrongCount += (message.match(/shehnaya gold/g) || []).length // 03 april
    wrongCount += (message.match(/new india gold/g) || []).length // 03 april
    wrongCount += (message.match(/vr gold/g) || []).length // 03 april
    wrongCount += (message.match(/minal gold/g) || []).length // 03 april
    wrongCount += (message.match(/bold white gold/g) || []).length // 07 april
    wrongCount += (message.match(/shehnayi gold/g) || []).length // 07 april
    wrongCount += (message.match(/malwa gold/g) || []).length // 07 april
    wrongCount += (message.match(/kanha gold/g) || []).length // 09 april
    wrongCount += (message.match(/mafia gold/g) || []).length // 09 april
    wrongCount += (message.match(/kmk gold/g) || []).length // 09 april
    wrongCount += (message.match(/gehu india gold/g) || []).length // 13 april
    wrongCount += (message.match(/khuni gold/g) || []).length // 13 april
    wrongCount += (message.match(/sneha gold/g) || []).length // 15 april
    wrongCount += (message.match(/postman gold/g) || []).length // 15 april
    wrongCount += (message.match(/raag gold/g) || []).length // 17 april
    wrongCount += (message.match(/rag gold/g) || []).length // 24 april
    wrongCount += (message.match(/village gold/g) || []).length // 24 april
    wrongCount += (message.match(/chana gold/g) || []).length // 24 april
    wrongCount += (message.match(/my gold fatka/g) || []).length // 24 april
    wrongCount += (message.match(/jk gold/g) || []).length // 24 april
    wrongCount += (message.match(/shah gold/g) || []).length // 24 april
    wrongCount += (message.match(/nirmal gold/g) || []).length // 24 april
    wrongCount += (message.match(/55 gold/g) || []).length // 24 april
    wrongCount += (message.match(/n gold/g) || []).length // 02 may
    wrongCount += (message.match(/apna gold/g) || []).length // 02 may
    wrongCount += (message.match(/5 gold/g) || []).length // 02 may

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "silver" || checkWord == "chandi" || checkWord == "चांदी") {
    const keyCount: number = (message.match(/silver/g) || []).length;
    let wrongCount: number = 0;

    wrongCount += (message.match(/pp silver/g) || []).length // 28 march
    wrongCount += (message.match(/daal palak silver/g) || []).length // 28 march
    wrongCount += (message.match(/masoor daal silver/g) || []).length // 28 march
    wrongCount += (message.match(/malka silver/g) || []).length // 28 march
    wrongCount += (message.match(/kori silver/g) || []).length // 30 march
    wrongCount += (message.match(/chana silver/g) || []).length // 02 april
    wrongCount += (message.match(/jowar silver/g) || []).length // 02 april
    wrongCount += (message.match(/silver crown/g) || []).length // 02 april
    wrongCount += (message.match(/mogar silver/g) || []).length // 03 april
    wrongCount += (message.match(/navkar silver/g) || []).length // 04 april
    wrongCount += (message.match(/kori (silver)/g) || []).length // 09 april
    wrongCount += (message.match(/duri silver/g) || []).length // 13 april
    wrongCount += (message.match(/masoor/g) || []).length // 17 april
    wrongCount += (message.match(/masur/g) || []).length // 17 april
    wrongCount += (message.match(/masur/g) || []).length // 17 april
    wrongCount += (message.match(/nai silver/g) || []).length // 24 april
    wrongCount += (message.match(/bold silver/g) || []).length // 24 april
    wrongCount += (message.match(/disco silver/g) || []).length // 24 april
    wrongCount += (message.match(/new silver/g) || []).length // 02 may

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "safflower" || checkWord == "kusum" || checkWord == "कुसुम") {
    const keyCount: number = (message.match(/safflower/g) || []).length;

    let wrongCount: number = 0;
    wrongCount += (message.match(/kusumnagar/g) || []).length // 31 march
    wrongCount += (message.match(/kusum nagar/g) || []).length // 31 march
    wrongCount += (message.match(/कुसुम नगर/g) || []).length // 31 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "safflower" || checkWord == "kusum" || checkWord == "कुसुम") {
    const keyCount: number = (message.match(/safflower/g) || []).length;

    let wrongCount: number = 0;
    wrongCount += (message.match(/kusumnagar/g) || []).length // 31 march
    wrongCount += (message.match(/kusum nagar/g) || []).length // 31 march
    wrongCount += (message.match(/कुसुम नगर/g) || []).length // 31 march

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "cotton") {
    const keyCount: number = (message.match(/cotton/g) || []).length;
    
    let wrongCount: number = 0;
    wrongCount += (message.match(/cotton wash oil/g) || []).length // 01 april

    if (keyCount > wrongCount) {
      return true;
    }
  } else if (checkWord == "flaxseed") {
    const keyCount: number = (message.match(/flaxseed/g) || []).length;
    let wrongCount: number = 0;
    wrongCount += (message.match(/flaxseed oil/g) || []).length // 15 april

    if (keyCount > wrongCount) {
      return true;
    }
  } else {
    if (message.includes(checkWord)) {
      return true;
    }
  }

  return false;
}

export const getGroupFromDbUsingPin = async (pin: string): Promise<string> => {

  try {
    if (pin == null || pin == undefined || pin.length != 6) {
      return '';
    }
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const fourDigits: string = pin.substring(0, 4)
    const pinCodeDoc = await db.collection(pincodesCollectionString).doc(fourDigits).get()
    await incrementReadWriteCounts('c_selfBasicsAndUpdateNetworkDocs', 1, 0, 0)

    if (pinCodeDoc.exists) {
      const data = pinCodeDoc.data()
      if (data == null || data == undefined) {
        return '';
      }

      const m = pinCodeDoc.get('m')
      if (m == undefined || m == null) {
        return ''
      }
      if (m[pin] == undefined || m[pin] == null) {
        return ''
      }
      if (m[pin]['group'] == undefined || m[pin]['group'] == null) {
        return ''
      }

      return m[pin]['group']
      // let docMap: Map<string, Map<string, string>> = new Map()
      // docMap = new Map(Object.entries(m))
      // if (docMap.get(pin) == undefined || docMap.get(pin) == null) {
      //     return null;
      // }

      // let pinMap: Map<string, string> = docMap.get(pin)!

      // if (pinMap.get('group') == null || pinMap.get('group') == undefined || pinMap.get('group') == '') {
      //     return null
      // }
      // const group: string = pinMap.get('group')!

      // if (pinMap.get('group') == null || pinMap.get('group') == undefined) {
      //     return null
      // }
      // return group;
    }
    return '';

  } catch (error) {
    if (error instanceof Error) await logError(`getGroupFromDbUsingPin///01///${error.toString()}`)
    return ''
  }
}

// export const getTokenFromUserNumber =async (userNumber: string): Promise<string | undefined> => {

//    const db: FirebaseFirestore.Firestore = admin.firestore();
//    let usersCollectionString = 'testCollectionUsers';

//    const users  = await db.collection(usersCollectionString).where('ownNumber', '==', userNumber).get()

//   // GET USER INFO DOC

//    if (userInfoDoc != null && userInfoDoc != undefined && userInfoDoc.data() != null && userInfoDoc.data() != undefined) {

//        const data = userInfoDoc.data()!

//        if (data.deviceInfo != null && data.deviceInfo != undefined) {
//            const di = data.deviceInfo
//            if (di != null && di != undefined && di.token != undefined && di.token != null && di.token != '') {
//                return di.token
//            }
//        } else {
//            console.log(`started 04f device info NA`)
//        }
//    }

//    return undefined
// }

export const removeFromArray = (arr: string[], valueToRemove: string) => {
  return arr.filter(function (ele) {
    return ele != valueToRemove;
  });
}

export const log_n = async (msg: string) => {
  try {
    // const db: FirebaseFirestore.Firestore = admin.firestore();
    // var d = new Date();
    // await db.collection('zLogs').doc('n').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });
  } catch (e) {
    if (e instanceof Error) {
      await errorsWhileLogging(`ERROR log_n; details in console`)
      console.log(`ERROR log_n: ${e.toString()}`)
    }
  }
}

export const log_c = async (msg: string) => {
  // const db: FirebaseFirestore.Firestore = admin.firestore();
  // var d = new Date();
  // try {
  //     await db.collection('zLogs').doc('c').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });
  // } catch (e) {
  //     await errorsWhileLogging(`ERROR log_c; details in console`)
  //     console.log(`ERROR log_c: ${e.toString()}`)
  // }
}

export const log_u1 = async (msg: string) => {
  // const db: FirebaseFirestore.Firestore = admin.firestore();
  // var d = new Date();

  // try {
  //     await db.collection('zLogs').doc('u1').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });

  // } catch (e) {
  //     await errorsWhileLogging(`ERROR log_u1; details in console`)
  //     console.log(`ERROR log_u1: ${e.toString()}`)
  // }
}

export const log_u2 = async (msg: string) => {
  // const db: FirebaseFirestore.Firestore = admin.firestore();
  // var d = new Date();

  // try {
  //     await db.collection('zLogs').doc('u2').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });

  // } catch (e) {
  //     await errorsWhileLogging(`ERROR log_u2; details in console`)
  //     console.log(`ERROR log_u2: ${e.toString()}`)
  // }
}

export const log_u2v2 = async (msg: string) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  var d = new Date();

  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  try {
    await db.collection('zLogs').doc('u2v2').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });
    writesCounter++
    await incrementReadWriteCounts('log_u2v2', readsCounter, writesCounter, deletesCounter)
  } catch (e) {
    if (e instanceof Error) {
      await errorsWhileLogging(`ERROR log_u2; details in console`)
      console.log(`ERROR log_u2: ${e.toString()}`)
    }
  }
}

export const log_u2v3 = async (msg: string) => {
  // const db: FirebaseFirestore.Firestore = admin.firestore();
  // var d = new Date();

  // try {
  //     await db.collection('zLogs').doc('u2v3').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });

  // } catch (e) {
  //     await errorsWhileLogging(`ERROR log_u2; details in console`)
  //     console.log(`ERROR log_u2: ${e.toString()}`)
  // }
}

export const log_u3 = async (msg: string) => {
  // const db: FirebaseFirestore.Firestore = admin.firestore();
  // var d = new Date();

  // try {
  //     await db.collection('zLogs').doc('u3').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });
  // } catch (e) {
  //     await errorsWhileLogging(`ERROR log_u3; details in console`)
  //     console.log(`ERROR log_u3: ${e.toString()}`)
  // }
}

export const logError = async (msg: string) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();

  var d = new Date();
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;


  try {
    console.log(`ERROR: ${d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}///${msg.toString()}`)

    await db.collection('zLogs').doc('errors')
      .update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}///${msg.toString()}`) });
    writesCounter++
    await incrementReadWriteCounts('logError', readsCounter, writesCounter, deletesCounter)
  } catch (e) {
    if (e instanceof Error)
      errorsWhileLogging(`ERROR logError: ${e.toString()}`)
  }
}

export const incrementReadWriteCounts = async (functionName: string, reads: number, writes: number, deletes: number) => {
  if (reads == 0 && writes == 0 && deletes == 0) return;
  // const db: FirebaseFirestore.Firestore = admin.firestore();

  // let eodMil = eod(Date.now())

  // try {
  //   const pathWrites: string = `${eodMil}.writes.${functionName}`
  //   const pathReads: string = `${eodMil}.reads.${functionName}`
  //   if (pathWrites != 'x' || pathReads != 'x')
  //     await db.collection('random').doc('usage').update({ [pathWrites]: admin.firestore.FieldValue.increment(writes), [pathReads]: admin.firestore.FieldValue.increment(reads) })
  // } catch (e) {
  //   if (e instanceof Error)
  //     errorsWhileLogging(`ERROR logError: ${e.toString()}`)
  // }
  return;
}

export const incrementReadWriteCountsV2 = async (functionName: string, reads: number, writes: number, deletes: number) => {
  if (reads == 0 && writes == 0 && deletes == 0) return;
  const db: FirebaseFirestore.Firestore = admin.firestore();

  let eodMil = eod(Date.now())

  try {
    const pathWrites: string = `${eodMil}.writes.${functionName}`
    const pathReads: string = `${eodMil}.reads.${functionName}`
    if (pathWrites != 'x' || pathReads != 'x')
      await db.collection('random').doc('usageV2').update({ [pathWrites]: admin.firestore.FieldValue.increment(writes), [pathReads]: admin.firestore.FieldValue.increment(reads) })
  } catch (e) {
    if (e instanceof Error)
      errorsWhileLogging(`ERROR logError: ${e.toString()}`)
  }
  return;
}

export const incrementReadWriteNSelfV2 = async (functionNumber: string, toIncrement: number | undefined, comments: string | undefined) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  let eodMil = eod(Date.now())

  if (toIncrement != undefined) {
    try {
      const path: string = `${eodMil}.${functionNumber}`

      if (path != 'x')
        await db.collection('random').doc('usage_nSelfV2').update({
          [path]: admin.firestore.FieldValue.increment(toIncrement),
        })
    } catch (e) {
      if (e instanceof Error)
        errorsWhileLogging(`ERROR logError: ${e.toString()}`)
    }
  } if (comments != undefined) {
    try {
      const path: string = `comments.${eodMil}.${functionNumber}`

      if (path != 'x')
        await db.collection('random').doc('usage_nSelfV2').update({
          [path]: admin.firestore.FieldValue.arrayUnion(comments),
        })
    } catch (e) {
      if (e instanceof Error)
        errorsWhileLogging(`ERROR logError: ${e.toString()}`)
    }
  }
}

export const errorsWhileLogging = async (msg: string) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  var d = new Date();
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;

  try {
    await db.collection('zLogs').doc('errorsWhileLogging').update({ x: admin.firestore.FieldValue.arrayUnion(`${d.toISOString()} - ${msg.toString()}`) });
    writesCounter++
    await incrementReadWriteCounts('errorsWhileLogging', readsCounter, writesCounter, deletesCounter)
  } catch (e) {
    if (e instanceof Error)
      console.log(`ERROR errorsWhileLogging: ${e.toString()}`)
  }
}

export const arraysAreSame = (arrayOne: string[], arrayTwo: string[]): boolean => {
  try {

    let different = 0;
    if (arrayOne == null || arrayTwo == null)
      different += 1

    for (const valueFromOne of arrayOne) {
      if (!arrayTwo.includes(valueFromOne))
        different += 1
    }

    for (const valueFromTwo of arrayTwo) {
      if (!arrayOne.includes(valueFromTwo))
        different += 1
    }

    if (different > 0) {
      return false
    } else {
      return true
    }
  } catch (e) {
    if (e instanceof Error)
      logError(`arraysAreSame///01///${e.toString()}`)
    return false
  }
}

export const getCompanyIdArrayOfUserHavingOwnNumber = async (ownNumber: string): Promise<string[]> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const usersCollec = db.collection(`${usersCollectionString}`)
    const qResult = await usersCollec.where('ownNumber', '==', ownNumber).get()
    readsCounter++
    await incrementReadWriteCounts('u2_internal - 01', readsCounter, writesCounter, deletesCounter)

    if (qResult.empty) {
      return []
    } else {
      if (qResult.docs.length > 1) {
        await logError(`ERROR found ${qResult.docs.length} docs with ownNumber = ${ownNumber}`)
      }
      const companyIdArray: string[] = qResult.docs[0].get('companyIdArray') || []

      return companyIdArray
    }
  } catch (e) {
    if (e instanceof Error)
      await logError(`getCompanyIdArrayOfUserHavingOwnNumber///01///${e.toString()}`)
    return []
  }
  //
}

export const getFirstCompanyIdFromUserID = async (userId: string): Promise<string> => {
  try {
    const db: FirebaseFirestore.Firestore = admin.firestore();
    const userDoc = await db.collection(usersCollectionString).doc(userId).get()
    if (userDoc.exists &&
      userDoc.data() != null &&
      userDoc.data() != undefined &&
      userDoc.data()!.companyIdArray != null &&
      userDoc.data()!.companyIdArray != undefined &&
      userDoc.data()!.companyIdArray!.length > 0 &&
      userDoc.data()!.companyIdArray![0] != null &&
      userDoc.data()!.companyIdArray![0] != '') {
      return userDoc.data()!.companyIdArray![0];
    }

  } catch (e) {
    if (e instanceof Error)
      await logError(`getFirstCompanyIdFromUserID///01///${e.toString()}`)
  }

  return ''
}

export const findAdded = (oldArray: string[], newArray: string[]): string[] => {
  try {
    let added: string[] = []
    newArray.forEach((valueFromNew: string) => {
      if (!oldArray.includes(valueFromNew)) {
        added.push(valueFromNew)
      }
    });
    return added
  } catch (e) {
    if (e instanceof Error) {
      logError(`findAdded///02///${e.toString()}`)
    }
  }
  return []
}

export const findRemoved = (oldArray: string[], newArray: string[]): string[] => {
  let removed: string[] = []
  oldArray.forEach((valueFromOriginal: string) => {
    if (!newArray.includes(valueFromOriginal)) {
      removed.push(valueFromOriginal)
    }
  });
  return removed
}

export const removePopcornAndRice = (keywords: string[] = []): string[] => {
  let result: string[] = []
  result = keywords;

  if (result.includes('rice') || result.includes('nonbasmatirice') || result.includes('basmatirice')) {
    result.push('nonsearchablerice')
    result.push('rice')
  }

  if (result.includes('popcorn') || result.includes('pop corn')) {
    result.push('nonsearchablepopcorn')
  }

  // result = removeFromArray(result, 'basmati');
  // result = removeFromArray(result, 'basmatirice');
  // result = removeFromArray(result, 'nonbasmatirice');
  // result = removeFromArray(result, 'rice');
  // result = removeFromArray(result, 'chawal');
  // result = removeFromArray(result, 'basmati');
  // result = removeFromArray(result, 'sona masoori');
  // result = removeFromArray(result, 'sona masuri');

  result = removeFromArray(result, 'popcorn');
  result = removeFromArray(result, 'popcor');
  result = removeFromArray(result, 'popco');
  result = removeFromArray(result, 'popc');
  result = removeFromArray(result, 'pop');
  result = removeFromArray(result, 'po');
  result = removeFromArray(result, 'p');
  result = removeFromArray(result, 'pop corn');
  result = removeFromArray(result, 'pop corns');
  result = removeFromArray(result, 'corn');
  // result = removeFromArray(result, 'maize');
  // result = removeFromArray(result, 'makka');
  result = removeFromArray(result, 'pop corn');

  return result;
}

export const addUsingPostKeywords = (input: any[]): string[] => {
  const oldToNewGlobal = new Map<string, string[]>([
    ['black_eyed_beans', ['black eyed beans']],
    ['black_lentils_split', ['black lentils split']],
    ['black_lentils_whole', ['black lentils whole']],
    ['brown_eyed_beans', ['black eyed beans']],
    ['chawli_(black)', ['black eyed beans']],
    ['chawli_(brown)', ['black eyed beans']],
    ['desi_chana', ['desi chickpeas']],
    ['desi_chickpeas', ['desi chickpeas']],
    ['dried_green_peas', ['dried green peas']],
    ['dried_yellow_peas', ['dried yellow peas']],
    ['finger_millet', ['finger millet']],
    ['foxtail_millet', ['foxtail millet']],
    ['gehu', ['wheat']],
    ['green_mung_daal', ['green mung split']],
    ['green_mung_mogar', ['green mung split']],
    ['green_mung_split', ['green mung split']],
    ['green_mung_split_with_skin', ['green mung split']],
    ['green_mung_whole', ['green mung whole']],
    ['hara_matar', ['dried yellow peas']],
    ['horse_gram', ['desi chickpeas']],
    ['jao', ['barley']],
    ['kabuli_chana', ['kabuli chickpeas']],
    ['kabuli_chickpeas', ['kabuli chickpeas']],
    ['kidney_beans', ['kidney beans']],
    ['kulthi', ['desi chickpeas']],
    ['masoor_daal', ['red lentils split']],
    ['masoor_whole', ['red lentils whole']],
    ['mustard_seeds', ['mustard']],
    ['pearl_millets', ['pearl millets']],
    ['pigeon_peas_split', ['pigeon peas split']],
    ['pigeon_peas_whole', ['pigeon peas whole']],
    ['ragi', ['finger millet']],
    ['red_lentils_split', ['red lentils split']],
    ['red_lentils_whole', ['red lentils whole']],
    ['safed_matar', ['dried yellow peas']],
    ['soya_bean', ['soybean']],
    ['toor_daal', ['pigeon peas split']],
    ['toor_whole', ['pigeon peas whole']],
    ['urad_daal', ['black lentils split']],
    ['urad_whole', ['black lentils whole']],
    ['tamarind', ['tamarind']],
  ])

  const keywordToGlobal = new Map<string, string[]>([
    ['wheat', ['wheat']],
    ['maize', ['maize']],
    ['toor', ['pigeon peas whole']],
    ['toordaal', ['pigeon peas split']],
    ['urad', ['black lentils whole']],
    ['uraddaal', ['black lentils split']],
    ['mung', ['green mung whole', 'green mung split']],
    ['chana', ['desi chickpeas']],
    ['kabuli', ['kabuli chickpeas']],
    ['masoor', ['red lentils whole']],
    ['masoordaal', ['red lentils split']],
    ['rajma', ['kidney beans', 'lightly speckled kidney beans']],
    ['moth', ['moth beans']],
    ['peas', ['dried green peas', 'dried yellow peas']],
    ['jowar', ['sorghum']],
    ['bajra', ['pearl millets']],
    ['chawli', ['black eyed beans']],
    ['barley', ['barley']],
    ['guar', ['guar']],
    ['soybean', ['soybean']],
    ['sunflower', ['sunflower']],
    ['sesame', ['sesame']],
    ['safflower', ['safflower']],
    ['palm', ['palm']],
    ['sarso', ['mustard']],
    ['canola', ['canola']],
    ['groundnut', ['groundnut']],
    ['castor', ['castorseed']],
    ['palmoil', ['palm oil']],
    ['soyabeanoil', ['soyabean oil']],
    ['sunfloweroil', ['sunflower oil']],
    ['groundnutoil', ['groundnut oil']],
    ['cottonseedoil', ['cottonseed oil']],
    ['castoroil', ['castor oil']],
    ['mustardoil', ['mustard oil']],
    ['sesameoil', ['sesame oil']],
    ['coconutoil', ['coconut oil']],
    ['neemoil', ['neem oil']],
    ['cornoil', ['corn oil']],
    ['saffloweroil', ['safflower oil']],
    ['oliveoil', ['olive oil']],
    ['ricebranoil', ['rice bran oil']],
    ['haldi', ['turmeric']],
    ['jeera', ['cumin']],
    ['methi', ['fenugreek']],
    ['dhaniya', ['coriander']],
    ['clove', ['clove']],
    ['fennel', ['fennel seeds']],
    ['redchilli', ['red chilli']],
    ['cardamom', ['cardamom']],
    ['psylliumhusk', ['psyllium husk']],
    ['blackpepper', ['black pepper']],
    ['nigella', ['nigella seeds']],
    ['ajwain', ['ajwain', 'carom seed']],
    ['sugar', ['sugar']],
    ['cotton', ['cotton']],
    ['flaxseed', ['flax seed']],


    // dry fruits:
    ['cashew', ['cashew']],
    ['almond', ['almond']],
    ['raisin', ['raisin']],
    ['pistachio', ['pistachio']],
    ['dates', ['dates']],
    ['walnut', ['walnut']],

    // new
    ['dryginger', ['dry ginger']],
    ['chiaseed', ['chia seed']],
    ['tea', ['tea']],
    ['nutmeg', ['nutmeg']],
    ['staranise', ['star anise']],
    ['mace', ['mace']],
    ['whitepepper', ['white pepper']],
    ['taramiraseed', ['taramira seed']],
    ['tamarind', ['tamarind']],

    // ornament
    ['gold', ['gold']], // 02 march
    ['silver', ['silver']], // 02 march
  ])

  const globalToKeyword = new Map<string, string[]>([
    ['pigeon peas whole', ['toor']],
    ['pigeon peas split', ['toordaal']],
    ['black lentils whole', ['urad']],
    ['black lentils split', ['uraddaal']],
    ['red lentils whole', ['masoor']],
    ['red lentils split', ['masoordaal']],
    ['moth beans', ['moth']],
    ['desi chickpeas', ['chana']],
    ['kabuli chickpeas', ['kabuli']],
    ['chickpeas split', ['chana']],
    ['green mung whole', ['mung']],
    ['green mung split', ['mung']],
    ['green mung split with skin', ['mung']],
    ['kidney beans', ['rajma']],
    ['lightly speckled kidney beans', ['rajma']],
    ['pinto beans', ['rajma']],
    ['white kidney beans', ['rajma']],
    ['black eyed beans', ['chawli']],
    ['brown eyed beans', ['chawli']],
    ['soybean', ['soybean']],
    ['dried green peas', ['peas']],
    ['dried yellow peas', ['peas']],
    ['sorghum', ['jowar']],
    ['pearl millets', ['bajra']],
    ['wheat', ['wheat']],
    ['barley', ['barley']],
    ['guar', ['guar']],
    ['buckwheat', ['wheat']],
    ['maize', ['maize']],
    ['sunflower', ['sunflower']],
    ['sesame', ['sesame']],
    ['safflower', ['safflower']],
    ['palm', ['palm']],
    ['mustard', ['sarso']],
    ['canola', ['canola']],
    ['groundnut', ['groundnut']],
    ['castor', ['castorseed']],
    ['cotton', ['cotton']],
    ['palm oil', ['palmoil']],
    ['soyabean oil', ['soyabeanoil']],
    ['sunflower oil', ['sunfloweroil']],
    ['groundnut oil', ['groundnutoil']],
    ['cottonseed oil', ['cottonseedoil']],
    ['castor oil', ['castoroil']],
    ['mustard oil', ['mustardoil']],
    ['sesame oil', ['sesameoil']],
    ['safflower oil', ['saffloweroil']],
    ['olive oil', ['oliveoil']],
    ['coconut oil', ['coconutoil']],
    ['corn oil', ['cornoil']],
    ['neem oil', ['neemoil']],

    ['sugar', ['sugar']],
    ['rice bran oil', ['ricebranoil']],
    ['turmeric', ['haldi']],
    ['cumin', ['jeera']],
    ['coriander', ['dhaniya']],
    ['fenugreek', ['methi']],
    ['clove', ['clove']],
    ['fennel seeds', ['fennel']],
    ['red chilli', ['redchilli']],
    ['cardamom', ['cardamom']],
    ['psyllium husk', ['psylliumhusk']],
    ['black pepper', ['blackpepper']],
    ['nigella seeds', ['nigella']],
    ['ajwain', ['ajwain']],
    ['flax seed', ['flaxseed']],

    // dry fruits:
    ['cashew', ['cashew']],
    ['almond', ['almond']],
    ['raisin', ['raisin']],
    ['pistachio', ['pistachio']],
    ['dates', ['dates']],
    ['walnut', ['walnut']],

    // new
    ['dry ginger', ['dryginger']],
    ['chia seed', ['chiaseed']],
    ['taramira seed', ['taramiraseed']],
    ['tea', ['tea']],
    ['nutmeg', ['nutmeg']],
    ['star anise', ['staranise']],
    ['mace', ['mace']],
    ['white pepper', ['whitepepper']],
    ['tamarind', ['tamarind']],

    // ornament
    ['gold', ['gold']], // 02 march
    ['silver', ['silver']], // 02 march
  ])

  let results: string[] = []

  for (const k of input) {
    const kk = k.toLowerCase()
    try {
      if (kk != undefined && kk != null && kk != ``) {
        let found: boolean = false

        //oldToNewGlobal
        for (const key of oldToNewGlobal.keys()) {
          if (kk == key) {
            // no need to add the key itself here because it's an old key
            results = results.concat(oldToNewGlobal.get(key)!)
            results = results.concat(globalToKeyword.get(oldToNewGlobal.get(key)![0])!)
            found = true
          }
        }

        for (const key of keywordToGlobal.keys()) {
          if (kk == key) {
            results.push(key)
            results = results.concat(keywordToGlobal.get(key)!)
            found = true
          }
        }

        for (const key of globalToKeyword.keys()) {
          if (kk == key) {
            results.push(key)
            results = results.concat(keywordToGlobal.get(key)!)
            found = true
          }
        }

        if (!found) {
          results.push(`${kk}`)
          if (kk.includes(` `)) results = results.concat(kk.split(` `))
          if (kk.includes(`_`)) results = results.concat(kk.split(`_`))
        }
      }
    } catch (e) { if (e instanceof Error) logError(`addUsingPostKeywordsOrSpaceSeparated///01///${e.toString()}`) }
  }
  return results
}

const itemsToKeywords = new Map<string, string[]>([
  //Feb 17, 2024 - 07:52 AM
  ['Pigeon peas whole', ['toor']],
  ['Pigeon peas split', ['toordaal']],
  ['Black lentils whole', ['urad']],
  ['Green chickpeas', ['greenchana']],
  ['Black lentils split', ['uraddaal']],
  ['Red lentils whole', ['masoor']],
  ['Pigeon peas', ['toor']],
  ['Red lentils split', ['masoordaal']],
  ['Moth beans', ['moth']],
  ['Black matpe', ['urad']],
  ['Desi chickpeas', ['chana']],
  ['Black matpe split', ['uraddaal']],
  ['Kabuli chickpeas', ['kabuli']],
  ['Guar beans', ['guar']],
  ['Chickpeas split', ['chanadaal']],
  ['Green mung', ['mung']],
  ['Green mung whole', ['mung']],
  ['Green mung split', ['mungdaal']],
  ['Green mung split without skin', ['mungmogar']],
  ['Green mung split with skin', ['mungmogar']],
  ['Kidney beans', ['rajma']],
  ['Red lentils', ['masoor']],
  ['Lightly speckled kidney beans', ['rajma']],
  ['Red lentil split', ['masoordaal']],
  ['Pinto beans', ['rajma']],
  ['White kidney beans', ['whitekidney', 'rajma']],
  ['Black eyed beans', ['chawli']],
  ['Brown eyed beans', ['browneyedbeans', 'chawli']],
  ['Speckled beans', ['speckledbeans', 'rajma']],
  ['Soybean', ['soybean']],
  ['Dried green peas', ['greenpeas', 'peas']],
  ['White beans', ['whitebeans', 'rajma']],
  ['Dried yellow peas', ['yellowpeas', 'peas']],
  ['Sorghum', ['jowar']],
  ['Pearl millets', ['bajra']],
  ['Wheat', ['wheat']],
  ['Oats', ['oats']],
  ['Barley', ['barley']],
  ['Guar', ['guar']],
  ['Buckwheat', ['buckwheat']],
  ['Finger millet', ['fingermillet']],
  ['Horse gram', ['horsegram']],
  ['Foxtail millet', ['foxtailmillet']],
  ['Paddy', ['paddy']],
  ['Maize', ['maize']],
  ['Rye', ['rye']],
  ['Sunflower', ['sunflower']],
  ['Pearl Millet', ['bajra']],
  ['Sesame', ['sesame']],
  ['Safflower', ['safflower']],
  ['Palm', ['palm']],
  ['Proso Millet', ['prosomillet']],
  ['Mustard', ['sarso']],
  ['Little Millet', ['littlemillet']],
  ['Canola', ['canola']],
  ['Kodo Millet', ['kodomillet']],
  ['Groundnut', ['groundnut']],
  ['Barnyard Millet', ['barnyardmillet']],
  ['Castor', ['castorseed']],
  ['Cotton', ['cotton']],
  ['Quinoa', ['quinoa']],
  ['Palm oil', ['palmoil']],
  ['Rice', ['rice']],
  ['Soyabean oil', ['soyabeanoil']],
  ['Sunflower oil', ['sunfloweroil']],
  ['Groundnut oil', ['groundnutoil']],
  ['Cottonseed oil', ['cottonseedoil']],
  ['Castor oil', ['castoroil']],
  ['Mustard oil', ['mustardoil']],
  ['Sesame oil', ['sesameoil']],
  ['Safflower oil', ['saffloweroil']],
  ['Olive oil', ['oliveoil']],
  ['Coconut oil', ['coconutoil']],
  ['Corn oil', ['cornoil']],
  ['Neem oil', ['neemoil']],
  ['Almond oil', ['almondoil']],
  ['Flaxseed oil', ['flaxseedoil']],
  ['Sugar', ['sugar']],
  ['Rice bran oil', ['ricebranoil']],
  ['Turmeric', ['haldi']],
  ['Soybeans', ['soybean']],
  ['Cumin', ['jeera']],
  ['Coriander', ['dhaniya']],
  ['Mustard seed', ['sarso']],
  ['Fenugreek', ['methi']],
  ['Sesame seed', ['sesame']],
  ['Clove', ['clove']],
  ['Sunflower seed', ['sunflower']],
  ['Fennel seeds', ['fennel']],
  ['Castor beans', ['castorseed']],
  ['Red chilli', ['redchilli']],
  ['Flaxseed', ['flaxseed']],
  ['Cardamom', ['cardamom', 'greencardamom', 'blackcardamom']],
  ['Psyllium husk', ['psylliumhusk']],
  ['Palm kernels', ['palm']],
  ['Black pepper', ['blackpepper']],
  ['Nigella seeds', ['nigella']],
  ['Carom seed', ['ajwain']],
  ['Cotton seed', ['cottonseed']],
  ['Flax seed', ['flaxseed']],
  ['Cashew', ['cashew']],
  ['Almond', ['almond']],
  ['Raisin', ['raisin']],
  ['Pistachio', ['pistachio']],
  ['Dates', ['dates']],
  ['Walnut', ['walnut']],
  ['Chia seed', ['chiaseed']],
  ['Taramira seed', ['taramiraseed']],
  ['Dry ginger', ['dryginger']],
  ['Tea leaves', ['tea']],
  ['Nutmeg', ['nutmeg']],
  ['Star anise', ['staranise']],
  ['Mace', ['mace']],
  ['Whitepepper', ['whitepepper']],
  ['Onion', ['onion']],
  ['Potato', ['potato']],
  ['Ginger', ['ginger']],
  ['Garlic', ['garlic']],
  ['Coriander seeds', ['dhaniya']],
  ['Wheat flour', ['wheatflour']],
  ['Semolina', ['semolina']],
  ['All purpose flour', ['allpurposeflour']],
  ['Green cardamom', ['greencardamom', 'cardamom']],
  ['Black cardamom', ['blackcardamom', 'cardamom']],
  ['White pepper', ['whitepepper']],
  ['Carom seeds', ['ajwain']],
  ['Bay leaf', ['bayleaf']],
  ['Poppy seed', ['poppyseed']],
  ['Stone flower', ['stoneflower']],
  ['Fig', ['fig']],
  ['Tomato', ['tomato']],
  ['Gram flour', ['gramflour']],
  ['Oil cake', ['oilcake']],
  ['Jaggery', ['gud']],
  ['Sago', ['sago']],
  ['Soya DOC', ['soyadoc']],
  ['Mustard DOC', ['mustarddoc']],
  ['Groundnut DOC', ['groundnutdoc']],
  ['Coffee beans', ['coffeebeans']],
  ['Fox nut', ['foxnut']],
  ['Cinnamon', ['cinnamon']],
  ['Orange', ['orange']],
  ['Apple', ['apple']],
  ['Pomegranate', ['pomegranate']],
  ['Sweet lime', ['sweetlime']],
  ['Basmati rice', ['basmatirice']],
  ['Non-Basmati rice', ['nonbasmatirice']],
  ['Tamarind', ['tamarind']],
  ['Gold', ['gold']], // 02 march
  ['Silver', ['silver']], // 02 march
])


export const getNameArray = async (
  name: string = '',
  keywords: string[] = [],
  products: string[] = [],
  productsV2: [] = [],
  category: string = '',
  categorySpecificKeywords: string[] = [],
  country: string = '',
  iecVerified: boolean = false,
): Promise<string[]> => {

  // FOR GRAINS, only this much
  if (category == '' || category == 'grain') {
    try {
      let toCheck = []
      try { for (const kk of keywords) toCheck.push(kk) } catch (e) { if (e instanceof Error) await logError(`getNameArray///82///${e.toString()}`) }
      try { for (const kk of products) toCheck.push(kk) } catch (e) { if (e instanceof Error) await logError(`getNameArray///83///${e.toString()}`) }
      let allWords: string[] = []

      if (country != undefined && country != 'null' && country != null && country != '' &&
        country != 'India' && country != 'india' && country != 'India ' && country != 'india ') {
        allWords.push('foreign')
        allWords.push(`foreign_${country}`)
        allWords.push(`foreign_and_iec`)
      }

      if (iecVerified == true) {
        allWords.push('iec')
        allWords.push('foreign_and_iec')
        allWords.push('foreign_India')
      }

      for (const kk of productsV2) {
        try {
          for (const productV2English of itemsToKeywords.keys())
            if (kk[`english`] == productV2English) {
              for (const _v of itemsToKeywords.get(productV2English)!)
                allWords.push(_v)
            }
        } catch (e) { if (e instanceof Error) await logError(`getNameArray///84b///${e.toString()}`) }
      }

      try {
        allWords.push(name)

        let allWordsLower: string[] = []

        for (const _n of allWords)
          if (_n != null && _n != undefined && _n != '')
            allWordsLower.push(_n.toLowerCase())

        allWordsLower = [...new Set(allWordsLower)]
        allWordsLower = removePopcornAndRice(allWordsLower)

        return allWordsLower
      } catch (e) {
        if (e instanceof Error) await logError(`getNameArray///85///${e.toString()}`);
        return [];
      }
    } catch (e) {
      if (e instanceof Error) await logError(`getNameArray///81///${e.toString()}`);
      return [];
    }
  }

  if (category == 'transporter') {
    let allWords: string[] = []
    allWords.push('_trx')
    allWords.push(name)
    allWords.push(`${name}_trx`)
    for (const _str of categorySpecificKeywords) {
      allWords.push(`${_str}_trx`)
      for (const _splitStr of _str.split(', ')) {
        allWords.push(`${_splitStr}_trx`)
      }
    }
    allWords = [...new Set(allWords)]

    let allWordsLower: string[] = []

    for (const _n of allWords)
      if (_n != null && _n != undefined && _n != '')
        allWordsLower.push(_n.toLowerCase())

    allWordsLower = [...new Set(allWordsLower)]
    allWordsLower = removePopcornAndRice(allWordsLower)

    return allWordsLower
  }

  // CONTINUE FOR OTHERS

  try {

    let allWords: string[] = []

    // name split by space
    let wordsBySpaceInName: string[] = []
    wordsBySpaceInName = name.split(' ')
    for (const w of wordsBySpaceInName) {
      allWords.push(w.toLowerCase())
    }

    // name split by dot
    let wordsByDotInName: string[] = []
    wordsByDotInName = name.split('.')
    for (const w of wordsByDotInName) {
      allWords.push(w.toLowerCase())
    }

    // split by space
    for (const kk of keywords) {
      if (kk.includes(' ')) {

        const keywordsBySpace = kk.split(' ')
        for (const wSeparated of keywordsBySpace) {
          allWords.push(wSeparated)
        }
      } else {
        allWords.push(kk)

      }

      // allWords = allWords.concat(keywordsBySpace)
    }


    allWords.push(name)
    allWords.push(name.split(' ').join(''))
    allWords.push(name.split('.').join('').split(' ').join('').split('-').join(''))
    allWords = allWords.concat(name.split(' '))

    allWords = allWords.concat(keywords)

    allWords = removePopcornAndRice(allWords);
    // console.log(`Place2: ${allWords.toString()}`)


    let nameWithoutS: string = '';
    for (let nameWord of name.split(' ')) {
      nameWord = nameWord.split('.').join('')
      nameWord = nameWord.split('-').join('')
      if (nameWord.substring(nameWord.length - 1, 1) == 's') {
        nameWithoutS += nameWord.substring(0, nameWord.length - 1);
      } else {
        nameWithoutS += nameWord
      }
    }
    allWords.push(nameWithoutS)
    // console.log(`Place3: ${allWords.toString()}`)


    let nameArray: string[] = []
    for (let w of allWords) {
      w = w.toLowerCase()
      nameArray.push(w);
      for (var starting = 0; starting < w.length; starting++) {
        const wordStarting: string = w.substring(0, starting)
        nameArray.push(wordStarting)
      }
    }
    // console.log(`Place4: ${allWords.toString()}`)


    let nameArrayTwo: string[] = []
    try {
      for (let w of nameArray) {
        w = w.toLowerCase()
        nameArrayTwo.push(w);
        for (var starting = 0; starting < w.length; starting++) {
          const wordStarting: string = w.substring(0, starting)
          nameArrayTwo.push(wordStarting)
        }
      }
    } catch (e) {
      if (e instanceof Error) await logError(`getNameArray///01///${e.toString()}`)
    }
    // console.log(`Place5: ${allWords.toString()}`)


    // add old products by space and underscore
    try {
      for (let product of products) {
        nameArrayTwo.push(product.toLowerCase())

        let productSplitByUnderscore: string[] = product.split('_')
        for (let pWord of productSplitByUnderscore) {
          nameArrayTwo.push(pWord)
        }

        let productSplitBySpace: string[] = product.split(' ')
        for (let pWord of productSplitBySpace) {
          nameArrayTwo.push(pWord)
        }
      }
    } catch (e) {
      if (e instanceof Error) await logError(`getNameArray///02///${e.toString()}`)
    }
    // console.log(`Place6: ${allWords.toString()}`)


    // adding products (V2) separated by space and underscore
    try {
      for (let p of productsV2) {
        if (p != null && p['english'] != null && p['english'] != undefined && p['english'] != '') {
          const str: String = p['english']
          nameArrayTwo.push(str.toLowerCase())
          nameArrayTwo.push(str.toLowerCase().replace(/ /g, ''))

          let productSplitByUnderscore: string[] = str.split('_')
          for (let pWord of productSplitByUnderscore) {
            nameArrayTwo.push(pWord.toLowerCase())
          }

          let productSplitBySpace: string[] = str.split(' ')
          for (let pWord of productSplitBySpace) {
            nameArrayTwo.push(pWord.toLowerCase())
          }
        }

        if (p != null && p['hindi'] != null && p['hindi'] != undefined && p['hindi'] != '') {
          const str: String = p['hindi']
          nameArrayTwo.push(str.toLowerCase())
          nameArrayTwo.push(str.toLowerCase().replace(/ /g, ''))

          let productSplitByUnderscore: string[] = str.split('_')
          for (let pWord of productSplitByUnderscore) {
            nameArrayTwo.push(pWord.toLowerCase())
          }

          let productSplitBySpace: string[] = str.split(' ')
          for (let pWord of productSplitBySpace) {
            nameArrayTwo.push(pWord.toLowerCase())
          }
        }

        if (p != null && p['alternateOne'] != null && p['alternateOne'] != undefined && p['alternateOne'] != '') {
          const str: String = p['alternateOne']
          nameArrayTwo.push(str.toLowerCase())

          let productSplitByUnderscore: string[] = str.split('_')
          for (let pWord of productSplitByUnderscore) {
            nameArrayTwo.push(pWord.toLowerCase())
          }

          let productSplitBySpace: string[] = str.split(' ')
          for (let pWord of productSplitBySpace) {
            nameArrayTwo.push(pWord.toLowerCase())
          }
        }

        if (p != null && p['alternateTwo'] != null && p['alternateTwo'] != undefined && p['alternateTwo'] != '') {
          const str: String = p['alternateTwo']
          nameArrayTwo.push(str.toLowerCase())

          let productSplitByUnderscore: string[] = str.split('_')
          for (let pWord of productSplitByUnderscore) {
            nameArrayTwo.push(pWord.toLowerCase())
          }

          let productSplitBySpace: string[] = str.split(' ')
          for (let pWord of productSplitBySpace) {
            nameArrayTwo.push(pWord.toLowerCase())
          }
        }
      }
    } catch (e) {
      if (e instanceof Error) await logError(`getNameArray///04///${e.toString()}`)
    }

    // await log_u2v3(`NOTER getNameArray 10 nameArray: ${nameArray.length}`)
    nameArrayTwo.push('')
    nameArrayTwo = [...new Set(nameArrayTwo)]

    // adding buy and sell values for words separated by space and underscore (...//buy** and ...//sell**)
    try {
      for (let p of productsV2) {
        // await log_u2v3(`NOTER getNameArray 06.100 loop for ${p}`)
        // await log_u2v3(`NOTER getNameArray 06.100b loop for ${p['buyStart']} ${p['buyEnd']} ${p['sellStart']} ${p['sellEnd']}`)

        const buyStart: number = p['buyStart']
        const buyEnd: number = p['buyEnd']

        const sellStart: number = p['sellStart']
        const sellEnd: number = p['sellEnd']

        // add buy suffix to the product (V2) - part 1 of 2
        let buyValues: String[] = []
        if (buyStart != null && buyEnd != null) {
          for (let i = buyStart; i <= buyEnd; i++) {
            buyValues.push(`//buy${i.toString()}`)
          }
        }

        // add buy suffix to the product (V2) - part 2 of 2
        for (let b of buyValues) {
          // await log_u2v3(`NOTER getNameArray 08 loop`)

          if (p != null && p['english'] != null && p['english'] != undefined && p['english'] != '') {
            const str: String = p['english']
            nameArrayTwo.push(str.toLowerCase() + b)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }
          }

          if (p != null && p['hindi'] != null && p['hindi'] != undefined && p['hindi'] != '') {
            const str: String = p['hindi']
            nameArrayTwo.push(str.toLowerCase() + b)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }
          }

          if (p != null && p['alternateOne'] != null && p['alternateOne'] != undefined && p['alternateOne'] != '') {
            const str: String = p['alternateOne']
            nameArrayTwo.push(str.toLowerCase() + b)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }
          }

          if (p != null && p['alternateTwo'] != null && p['alternateTwo'] != undefined && p['alternateTwo'] != '') {
            const str: String = p['alternateTwo']
            nameArrayTwo.push(str.toLowerCase() + b)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + b)
            }
          }
        }

        // add sell suffix to the product (V2) - part 1 of 2
        let sellValues: String[] = []
        if (sellStart != null && sellEnd != null) {
          for (let i = sellStart; i <= sellEnd; i++) {
            sellValues.push(`//sell${i.toString()}`)
          }
        }

        // add sell suffix to the product (V2) - part 2 of 2
        for (let s of sellValues) {
          if (p != null && p['english'] != null && p['english'] != undefined && p['english'] != '') {
            const str: String = p['english']
            nameArrayTwo.push(str.toLowerCase() + s)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }
          }

          if (p != null && p['hindi'] != null && p['hindi'] != undefined && p['hindi'] != '') {
            const str: String = p['hindi']
            nameArrayTwo.push(str.toLowerCase() + s)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }
          }

          if (p != null && p['alternateOne'] != null && p['alternateOne'] != undefined && p['alternateOne'] != '') {
            const str: String = p['alternateOne']
            nameArrayTwo.push(str.toLowerCase() + s)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }
          }

          if (p != null && p['alternateTwo'] != null && p['alternateTwo'] != undefined && p['alternateTwo'] != '') {
            const str: String = p['alternateTwo']
            nameArrayTwo.push(str.toLowerCase() + s)

            let productSplitByUnderscore: string[] = str.split('_')
            for (let pWord of productSplitByUnderscore) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }

            let productSplitBySpace: string[] = str.split(' ')
            for (let pWord of productSplitBySpace) {
              nameArrayTwo.push(pWord.toLowerCase() + s)
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error) await logError(`getNameArray///05///${e.toString()}`)
    }

    let nameArrayTwoLower: string[] = []

    for (const _n of nameArrayTwo) {
      nameArrayTwoLower.push(_n.toLowerCase())
    }

    nameArrayTwoLower = removePopcornAndRice(nameArrayTwoLower)
    nameArrayTwoLower = [...new Set(nameArrayTwoLower)]

    if (category == 'warehouse') {
      nameArrayTwoLower.push('warehouse')

      if (categorySpecificKeywords.includes(`cold`)) {
        nameArrayTwoLower.push(`cold`)
        nameArrayTwoLower.push(`coldAndNonCold`)
        nameArrayTwoLower.push(`coldandnoncold`)
      }

      if (categorySpecificKeywords.includes(`nonCold`)) {
        nameArrayTwoLower.push(`nonCold`)
        nameArrayTwoLower.push(`noncold`)
        nameArrayTwoLower.push(`non-cold`)
        nameArrayTwoLower.push(`Non-Cold`)
        nameArrayTwoLower.push(`Non-cold`)
        nameArrayTwoLower.push(`coldAndNonCold`)
        nameArrayTwoLower.push(`coldandnoncold`)
      }

      if (categorySpecificKeywords.includes(`coldAndNonCold`)) {
        nameArrayTwoLower.push(`coldAndNonCold`)
        nameArrayTwoLower.push(`coldandnoncold`)
        nameArrayTwoLower.push(`cold`)
        nameArrayTwoLower.push(`nonCold`)
        nameArrayTwoLower.push(`noncold`)
      }

      let arrTemp: string[] = []
      arrTemp.push('whx')

      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_whx`)
      }
      arrTemp.push(`_whx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'bag') {
      nameArrayTwoLower.push('bag')
      if (categorySpecificKeywords.includes(`pp`)) {
        nameArrayTwoLower.push(`pp`)
        nameArrayTwoLower.push(`PP`)
        nameArrayTwoLower.push(`Pp`)
      }
      if (categorySpecificKeywords.includes(`bopp`)) {
        nameArrayTwoLower.push(`bopp`)
        nameArrayTwoLower.push(`BOPP`)
        nameArrayTwoLower.push(`Bopp`)
      }
      if (categorySpecificKeywords.includes(`jute`)) {
        nameArrayTwoLower.push(`jute`)
        nameArrayTwoLower.push(`Jute`)
      }
      if (categorySpecificKeywords.includes(`paper`)) {
        nameArrayTwoLower.push(`paper`)
        nameArrayTwoLower.push(`Paper`)
      }
      if (categorySpecificKeywords.includes(`jumbo`)) {
        nameArrayTwoLower.push(`jumbo`)
        nameArrayTwoLower.push(`Jumbo`)
      }
      if (categorySpecificKeywords.includes(`nonwoven`)) {
        nameArrayTwoLower.push(`nonwoven`)
        nameArrayTwoLower.push(`non-woven`)
      }
      if (categorySpecificKeywords.includes(`liner`)) {
        nameArrayTwoLower.push(`liner`)
        nameArrayTwoLower.push(`Liner`)
      }
      if (categorySpecificKeywords.includes(`flexible`)) {
        nameArrayTwoLower.push(`flexible`)
        nameArrayTwoLower.push(`Flexible`)
      }

      for (const specificKeyword of categorySpecificKeywords) {
        nameArrayTwoLower.push(specificKeyword)
        nameArrayTwoLower.push(specificKeyword.toLowerCase())
      }

      let arrTemp: string[] = []
      arrTemp.push('bagx')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_bagx`)
      }
      arrTemp.push(`_bagx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'machine') {
      let arrTemp: string[] = []
      arrTemp.push('machinex')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_machinex`)
      }
      arrTemp.push(`_machinex`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'software') {
      let arrTemp: string[] = []
      arrTemp.push('softwarex')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_softwarex`)
      }
      arrTemp.push(`_softwarex`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'surveyor') {
      let arrTemp: string[] = []
      arrTemp.push('surveyorx')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_surveyorx`)
      }
      arrTemp.push(`_surveyorx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'cha') {
      let arrTemp: string[] = []
      arrTemp.push('chax')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_chax`)
      }
      arrTemp.push(`_chax`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'forwarder') {
      let arrTemp: string[] = []
      arrTemp.push('fwdx')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_fwdx`)
      }
      arrTemp.push(`_fwdx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'transporter') {
      let arrTemp: string[] = []
      arrTemp.push('trx')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_trx`)
      }
      arrTemp.push(`_trx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    if (category == 'farmer') {
      let arrTemp: string[] = []
      arrTemp.push('farmerx')
      for (const e of nameArrayTwoLower) {
        arrTemp.push(`${e}_farmerx`)
      }
      arrTemp.push(`_farmerx`)
      arrTemp = [...new Set(arrTemp)]
      return arrTemp
    }

    return nameArrayTwoLower

  } catch (e) {
    if (e instanceof Error) await logError(`getNameArray///06///${e.toString()}`)
    return []
  }
}

export const nSelf = async (
  descending: boolean = false,
  // fromTheMiddle: boolean = false,
  // trigId: string = '',
  // onlyForOwnNumber: string = '',
) => {
  try {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const startTime: number = Date.now()// + 19800000
    const timeLimitInMins: number = 7
    const timeLimitInMil: number = timeLimitInMins * 60000

    const db: FirebaseFirestore.Firestore = admin.firestore();

    for (let loopI = 0; loopI < 2000; loopI++) {
      if ((Date.now() - startTime) > timeLimitInMil) {
        console.log(`Ending as close to time limit`);
        await incrementReadWriteCounts('nSelf 02', readsCounter, writesCounter, deletesCounter)
        return;
      }

      let oneDocQuery

      if (descending) {
        try {
          oneDocQuery = await db.collectionGroup('network').where('selfUpdatesPending', '==', true).orderBy('__name__', 'desc').limit(1).get()
          readsCounter++
        } catch (e) { if (e instanceof Error) await logError(`u_4///s009///${e.toString()}`) }
      } else {
        try {
          oneDocQuery = await db.collectionGroup('network').where('selfUpdatesPending', '==', true).limit(1).get()
          readsCounter++
        } catch (e) { if (e instanceof Error) await logError(`u_4///s008///${e.toString()}`) }
      }

      if (oneDocQuery == null || oneDocQuery == undefined || oneDocQuery.docs.length == 0) {
        console.log(`oneDocQuery NA. Ending.`);
        return;
      } else {
        const networkDoc = oneDocQuery.docs[0]
        const parentCompanyId = networkDoc.ref.parent.parent!.id;

        console.log(`${loopI} started loop`)
        await nSelfForCompany(parentCompanyId, false)
        console.log(`${loopI} started done`)
      }
    }
    await incrementReadWriteCounts('nSelf 02', readsCounter, writesCounter, deletesCounter)

  } catch (e) { if (e instanceof Error) await logError(`u_4///s001///${e.toString()}`) }
  console.log('Ending function')

  return
}

export const nSelfForCompany = async (parentCompanyId: string, forSingleCompany: boolean) => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  let writesCounter: number = 0;
  let readsCounter: number = 0;
  let deletesCounter: number = 0;
  // let writesCounterFromCompany: number = 0;
  // let writesCounterFromUser: number = 0;
  // let writesCounterFromBoth: number = 0;

  let networkQuery

  if (forSingleCompany) {
    networkQuery = await db.collection(companiesCollectionStringV2).doc(parentCompanyId).collection('network').where('selfUpdatesForSingleCompany', '==', true).limit(1000).get();
  } else {
    networkQuery = await db.collection(companiesCollectionStringV2).doc(parentCompanyId).collection('network').where('selfUpdatesPending', '==', true).limit(1000).get();
  }

  readsCounter = readsCounter + networkQuery.docs.length
  const companyDoc = await db.collection(companiesCollectionStringV2).doc(parentCompanyId).get()// networkDoc.ref.parent.parent!.get()
  readsCounter++

  if (!companyDoc.exists) {
    console.log(`u_4///s1a///parend data missing for doc id: ${parentCompanyId}`)
    await logError(`u_4///s1a///parend data missing for doc id: ${parentCompanyId}`)

    for (let i = 0; i < networkQuery.docs.length; i++) {
      const nDoc = networkQuery.docs[i]
      await nDoc.ref.update({
        'selfUpdatesPending': false,
        'selfUpdatesFromUser': admin.firestore.FieldValue.delete(),
        'selfUpdatesFromCompany': admin.firestore.FieldValue.delete(),
        'selfUpdatesForSingleCompany': admin.firestore.FieldValue.delete(),
        'nSelfError': 'parent missing'
      })
      writesCounter++
    }
    return;
  }

  const companyDocData = companyDoc.data()
  if (!companyDocData || companyDocData == null || companyDocData == undefined) {
    console.log(`u_4///s1b///parend data missing for doc id: ${parentCompanyId}`)
    await logError(`u_4///s1b///parend data missing for doc id: ${parentCompanyId}`)
    for (let i = 0; i < networkQuery.docs.length; i++) {
      const nDoc = networkQuery.docs[i]
      await nDoc.ref.update({
        'selfUpdatesPending': false,
        'selfUpdatesFromUser': admin.firestore.FieldValue.delete(),
        'selfUpdatesFromCompany': admin.firestore.FieldValue.delete(),
        'selfUpdatesForSingleCompany': admin.firestore.FieldValue.delete(),
        'nSelfError': 'parent missing',
      })
      writesCounter++
    }
    return;
  }

  let updateCounter: number = 0
  let deleteCounter: number = 0


  for (let i = 0; i < networkQuery.docs.length; i++) {
    const nDoc = networkQuery.docs[i]
    // const selfUpdatesFromCompany: boolean = nDoc.get('selfUpdatesFromCompany')
    // const selfUpdatesFromUser: boolean = nDoc.get('selfUpdatesFromUser')

    // if (selfUpdatesFromUser == true && selfUpdatesFromCompany == true) {
    //   writesCounterFromBoth++
    // } else if (selfUpdatesFromCompany == true) {
    //   writesCounterFromCompany++
    // } else if (selfUpdatesFromUser == true) {
    //   writesCounterFromUser++
    // }

    let points: number = 0
    const category: string = companyDocData.category
    if (category == 'warehouse') points = -5000000
    if (category == 'transporter') points = -10000000
    if (category == 'bag') points = -20000000
    if (category == 'farmer') points = -30000000
    if (category == 'machine') points = -40000000
    if (category == 'surveyor') points = -50000000
    if (category == 'software') points = -60000000
    if (category == 'cha') points = -70000000
    if (category == 'forwarder') points = -80000000


    const directLinks: string[] = nDoc.get('directLinks')
    const networkLConst = nDoc.get('networkLinks')
    let networkMap: Map<string, string[]> = new Map()
    let networkKeys: string[] = []
    let networkValues: string[] = []
    const shortDescription: string = nDoc.get('shortDescription')
    const verifiedLow: boolean = nDoc.get('verifiedLow')
    const verifiedMedium: boolean = nDoc.get('verifiedMedium')
    const verifiedHigh: boolean = nDoc.get('verifiedHigh')
    const sponsoredBronze: boolean = nDoc.get('sponsoredBronze')
    const sponsoredSilver: boolean = nDoc.get('sponsoredSilver')
    const sponsoredGold: boolean = nDoc.get('sponsoredGold')
    const sponsoredDiamond: boolean = nDoc.get('sponsoredDiamond')

    try {
      if (directLinks != null && directLinks != undefined)
        points += (directLinks.length * pointsForEachDirect) // add directLinks points

      if (networkLConst != null && networkLConst != undefined) { // add networkLinks points & make networkKeys
        networkMap = new Map(Object.entries(networkLConst))

        if (networkMap != null && networkMap != undefined && networkMap.size > 0) {
          for (const key of networkMap.keys()) {
            if (networkMap.get(key) == null || networkMap.get(key)!.length == 0) {
              networkMap.delete(key)
            }
          }
          points += (networkMap.size * pointsForEachMutual)
          networkKeys = Array.from(networkMap.keys())

          // set networkValues
          try {
            for (const key of networkMap.keys()) {
              if (networkMap.get(key) != undefined || networkMap.get(key) != null || networkMap.get(key)!.length != 0) {
                const values: string[] | undefined = networkMap.get(key)
                for (const v of values!) {
                  networkValues.push(v)
                }
              }
            }
            networkValues = [...new Set(networkValues)]
          } catch (e) {
            if (e instanceof Error) await logError(`u_4///s2///${e.toString()} id: ${nDoc.id}`)
            if (e instanceof Error) await log_u3(`ERR n02.4: ${e.toString()} id: ${nDoc.id}`);
          }
        }
      }

      // add more points
      try {
        if (points != 0 && points != -500000 && points != -1000000 && points != -2000000 && points != -3000000 && points != -4000000 && points != -5000000 && points != -6000000 && points != -7000000 && points != -8000000 && points != -9000000) {
          if (shortDescription != null && shortDescription != undefined && shortDescription.length > 2)
            points += pointsShortDescription
          if (verifiedHigh != undefined && verifiedHigh != null && verifiedHigh == true) {
            points += pointsVerifiedHigh
          } else if (verifiedMedium != undefined && verifiedMedium != null && verifiedMedium == true) {
            points += pointsVerifiedMedium
          } else if (verifiedLow != undefined && verifiedLow != null && verifiedLow == true) {
            points += pointsVerifiedLow
          }

          if (sponsoredDiamond == true) points += pointsSponsoredDiamond
          if (sponsoredGold == true) points += pointsSponsoredGold
          if (sponsoredSilver == true) {
            points += pointsSponsoredSilver
            // console.log(`Adding points ${pointsSponsoredSilver} for silver`)
            try {
              console.log(`Adding pointsSponsoredSilver: ${pointsSponsoredSilver} for ${companyDocData.name}`)
            } catch (e) { }
          }

          if (sponsoredBronze == true) points += pointsSponsoredBronze
          if (companyDocData.name == 'Regal Magnetics') points += 4000

        }
      } catch (e) {
        if (e instanceof Error) await logError(`u_4///s3///${e.toString()} id: ${nDoc.id}`)
        if (e instanceof Error) await log_u3(`ERR n02.5: ${e.toString()} id: ${nDoc.id}`)
      }
    } catch (e) {
      if (e instanceof Error) console.log(`u_4///s4///${e.toString()} id: ${nDoc.id}`)
      if (e instanceof Error) await logError(`u_4///s4///${e.toString()} id: ${nDoc.id}`)
      if (e instanceof Error) await log_u3(`ERR n03: ${e.toString()} id: ${nDoc.id}`)
    }

    try {
      const companyDocDataMap: Map<string, any> = new Map(Object.entries(companyDocData))
      // parent company has fields called networkLinks and directLinks; need to delete these otherwise these overwrite the network doc's fields
      companyDocDataMap.delete('testTrigger')
      companyDocDataMap.delete('networkLinks')
      companyDocDataMap.delete('directLinks')
      companyDocDataMap.delete('points')
      companyDocDataMap.delete('companyPoints')
      // companyDocDataMap.delete('transporterPoints')
      // companyDocDataMap.delete('transporterCompanyPoints')
      companyDocDataMap.delete('selfUpdatesPending')
      companyDocDataMap.delete('selfUpdatesFromUser')
      companyDocDataMap.delete('selfUpdatesFromCompany')
      companyDocDataMap.delete('productsV2')
      companyDocDataMap.delete('countOfEmployeesWithoutField')
      companyDocDataMap.delete('adminPhones')
      companyDocDataMap.delete('employees')

      //countOfEmployeesWithoutField

      if (networkMap != null && networkMap != undefined) {
        let networkMapForUploading = Array.from(networkMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
        if (networkMapForUploading != null && networkMapForUploading != undefined) {
          companyDocDataMap.set('networkLinks', networkMapForUploading)
        }
      }

      // console.log(`${companyDocData.name}, Name is regal: ${companyDocData.name == 'Regal Magnetics'}, silver: ${sponsoredSilver == true}, p: ${points}`)

      companyDocDataMap.set('networkKeys', networkKeys)
      companyDocDataMap.set('networkValues', networkValues)
      companyDocDataMap.set('ownNumber', nDoc.id)
      companyDocDataMap.set('selfUpdatesPending', false)
      companyDocDataMap.set('selfUpdatesFromUser', false)
      companyDocDataMap.set('selfUpdatesFromCompany', false)
      companyDocDataMap.set('points', points)

      let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

      try {
        if (companyDocDataMapObject == null && companyDocDataMapObject == undefined) {
          console.log(`u_4///s91///companyDocDataMapObject is null/undefined`)
          await logError(`u_4///s91///companyDocDataMapObject is null/undefined`)
        } else if (points == 0 || points == -5000000 || points == -10000000 || points == -20000000 || points == -30000000 || points == -40000000 || points == -50000000 || points == -60000000 || points == -70000000 || points == -80000000 || points == -90000000) {
          try {
            // await logError(`NOTERR nSelf03 DELETING: ownNumber: ${onlyForOwnNumber}`)
            await nDoc.ref.delete()
            deleteCounter++
            deletesCounter++
          } catch (e) {
            if (e instanceof Error) console.log(`u_4///s5///${e.toString()} id: ${nDoc.id}`)
            if (e instanceof Error) await logError(`u_4///s5///${e.toString()} id: ${nDoc.id}`)
            if (e instanceof Error) await log_u3(`ERR n06.67: ${e.toString()} id: ${nDoc.id}`)
          }
        } else {
          // non fieldvalue update
          try {
            updateCounter++
            await nDoc.ref.update(companyDocDataMapObject)
            writesCounter++ // separate counts for company and user
          } catch (e1) {
            if (e1 instanceof Error)
              if (!e1.toString().includes('No document to update')) {
                await logError(`u_4///s69b///${nDoc.ref.path} > ${e1.toString()}`)
                try {
                  await nDoc.ref.update({
                    'selfUpdatesPending': false,
                    'selfUpdatesFromUser': false,
                    'selfUpdatesFromCompany': false,
                    'nSelfError': `${e1.toString()}`
                  })
                } catch (e2) {
                  if (e2 instanceof Error)
                    if (!e2.toString().includes('No document to update'))
                      await logError(`u_4///s69a///${e2.toString()}`)
                }
              }
          }
        }
      } catch (e) {
        if (e instanceof Error) console.log(`u_4///s6///${nDoc.ref.parent.parent!.id} > ${e.toString()}`)
        if (e instanceof Error) await logError(`u_4///s7///${e.toString()}`)
        if (e instanceof Error) await log_u3(`ERR n06.77 03.12.2021: ${e.toString()}`)
        // }
      }
    } catch (e) {
      if (e instanceof Error) console.log(`u_4///s8///id: ${nDoc.id}, ERROR: ${e.toString()}`)
      if (e instanceof Error) await logError(`u_4///s8///id: ${nDoc.id}`)
      if (e instanceof Error) await log_u3(`ERR n06.8: ${e.toString()} id: ${nDoc.id}`)
    }
  }

  let funcName = ``
  if (forSingleCompany == true) {
    funcName = `nSelf 01 true`
  } else {
    funcName = `nSelf 01 false`
  }

  await incrementReadWriteCounts(funcName, readsCounter, writesCounter, deletesCounter)
  // await incrementReadWriteNSelf(writesCounterFromUser, writesCounterFromCompany, writesCounterFromBoth)

  console.log(`nSelf cID: ${parentCompanyId} > updated ${updateCounter}, deleted ${deleteCounter}`)
}



export const addLinkToCompaniesMap = (directNumber: string = '', employeeForIndirect: string = '', indirectNumber: string = '', m: Map<string, Map<string, string[]>>, cId: string = '') => {

  if (m.get(cId) == null || m.get(cId) == undefined) {
    const temp2: Map<string, string[]> = new Map()
    m.set(cId, temp2)
    try {
      if (indirectNumber == '+6598554140') {
        log_u2v3(`addLinks: cId ${cId} in map is null/undefined`)
      }
    } catch (error) { }

  }

  let companyMap: Map<string, string[]> = m.get(cId)!

  if (directNumber != null && directNumber != undefined && directNumber != '') {
    let direct: string[] = companyMap.get('direct')!
    if (direct != null && direct != undefined) {
      direct.push(directNumber)
      direct = [...new Set(direct)]

    } else {
      direct = [directNumber]
    }
    companyMap.set('direct', direct)
    // log_u2v3(`NOTER addLinkToCompaniesMap01 direct len: ${direct.length}`)
    m.set(cId, companyMap)
  }

  if (indirectNumber != null && indirectNumber != undefined && indirectNumber != '' && employeeForIndirect != '' && employeeForIndirect != indirectNumber) {
    let str: string = indirectNumber.concat('///')!
    str = str.concat(employeeForIndirect.toString())!

    let indirect: string[] = companyMap.get('indirect')!

    if (indirect != null && indirect != undefined) {
      indirect.push(str)
      indirect = [...new Set(indirect)]
    } else {
      indirect = [str]
    }
    companyMap.set('indirect', indirect)
    m.set(cId, companyMap)
  }
  return m
}

export const updateNetworkDocs = async (myOwnNumber: string = '', m: Map<string, Map<string, string[]>>) => {
  let writesCounter: number = 0;
  let readsCounter: number = 0;

  try {

    if (m != null && m != undefined && myOwnNumber != null && myOwnNumber != undefined) {
      // await log_u2v2(`NOTER u2_V2_toDocs 01 companies`)
      const db: FirebaseFirestore.Firestore = admin.firestore();
      let countOfKeys: number = 0
      for (const cId of m.keys()) {
        countOfKeys++

        let mapOfCompany: Map<string, string[]> = m.get(cId)!

        if (mapOfCompany != null && mapOfCompany != undefined) {
          try {
            if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
              console.log(`Updating updateNetworkDocs for ${cId}`)
            }
          } catch (e) {
            if (e instanceof Error) await logError(`updateNetworkDocs///85///${e.toString()}`)
          }

          const db: FirebaseFirestore.Firestore = admin.firestore();
          const companiesCollec = db.collection(companiesCollectionStringV2)
          const myDocInNetwork = await companiesCollec.doc(cId).collection('network').doc(myOwnNumber).get()
          readsCounter++

          // add network links
          let indirect: string[] = mapOfCompany.get('indirect') ?? []
          let networkLInDb: Map<string, string[]> = new Map()
          if (myDocInNetwork.get('networkLinks') != null && myDocInNetwork.get('networkLinks') != undefined) {
            networkLInDb = new Map(Object.entries(myDocInNetwork.get('networkLinks')))
            if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
              console.log(`Found pre-existing networkLinks for ${cId}`)
            }
          } else {
            if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
              console.log(`Could not find pre-existing networkLinks for ${cId}`)
            }
          }
          try {
            for (const indirectStr of indirect) {
              const addedNumIndirect: string = indirectStr.split('///')[0]
              const employeeNumber: string = indirectStr.split('///')[1]
              let addedNumInDb = networkLInDb.get(addedNumIndirect); // 05.2: TypeError: networkLinksInDb.get is not a function
              if (addedNumInDb == null || addedNumInDb == undefined) {
                try {
                  networkLInDb.set(addedNumIndirect, [employeeNumber])
                } catch (e) { if (e instanceof Error) await logError(`updateNetworkDocs///01///${e.toString()}`) }
              } else {
                try {
                  let empNums: string[] = addedNumInDb!
                  empNums.push(employeeNumber)
                  empNums = [...new Set(empNums)]
                  networkLInDb.set(addedNumIndirect, empNums)
                } catch (e) { if (e instanceof Error) await logError(`updateNetworkDocs///02///${e.toString()}`) }
              }
            }
          } catch (e) { if (e instanceof Error) await logError(`updateNetworkDocs///03///${e.toString()}`) }
          let networkLInDbForUpload = Array.from(networkLInDb).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

          // add direct links 
          let direct: string[] = mapOfCompany.get('direct') ?? []
          if (myDocInNetwork.get('directLinks') != undefined && myDocInNetwork.get('directLinks') != null) {
            let directFromDb: string[] = myDocInNetwork.get('directLinks');
            direct = direct.concat(directFromDb)
            direct = [...new Set(direct)]
          }

          // calculate points for connections
          let points: number = 0
          if (myDocInNetwork.get('category') == 'warehouse') points = -5000000
          if (myDocInNetwork.get('category') == 'transporter') points = -10000000
          if (myDocInNetwork.get('category') == 'bag') points = -20000000
          if (myDocInNetwork.get('category') == 'farmer') points = -30000000
          if (myDocInNetwork.get('category') == 'machine') points = -40000000
          if (myDocInNetwork.get('category') == 'surveyor') points = -50000000
          if (myDocInNetwork.get('category') == 'software') points = -60000000
          if (myDocInNetwork.get('category') == 'cha') points = -70000000
          if (myDocInNetwork.get('category') == 'forwarder') points = -80000000

          points += direct.length * pointsForEachDirect
          if (networkLInDb != null && networkLInDb != undefined) {
            points += networkLInDb.size * pointsForEachMutual
          }

          // arrange parent data
          const companyDoc = await companiesCollec.doc(cId).get()
          readsCounter++
          const companyDocData = companyDoc.data()
          let companyDocDataMap: Map<string, any> = new Map()
          if (companyDocData != undefined) {
            companyDocDataMap = new Map(Object.entries(companyDocData))
          }
          companyDocDataMap.delete('testTrigger')
          companyDocDataMap.delete('networkLinks')
          companyDocDataMap.delete('directLinks')
          companyDocDataMap.delete('points')
          companyDocDataMap.delete('companyPoints')
          // companyDocDataMap.delete('transporterPoints')
          // companyDocDataMap.delete('transporterCompanyPoints')
          companyDocDataMap.delete('selfUpdatesPending')
          companyDocDataMap.delete('selfUpdatesFromUser')
          companyDocDataMap.delete('selfUpdatesFromCompany')
          companyDocDataMap.delete('productsV2')

          // arrange data to upload
          companyDocDataMap.set('networkLinks', networkLInDbForUpload)
          companyDocDataMap.set('directLinks', direct)
          companyDocDataMap.set('ownNumber', myOwnNumber)
          companyDocDataMap.set('selfUpdatesPending', true)
          companyDocDataMap.set('selfUpdatesFromUser', true)
          companyDocDataMap.set('points', points)
          let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});

          // // upload!
          // if (myDocInNetwork.exists) {
          //     try {
          //         await myDocInNetwork.ref.update(companyDocDataMapObject)
          //         // await log_u2v2(`NOTER updateN 06`)
          //     } catch (e) { await logError(`updateNetworkDocs///04///${e.toString()}`) }
          // } else {
          //     try {
          //         await myDocInNetwork.ref.set(companyDocDataMapObject)
          //         // await log_u2v2(`NOTER updateN 07`)
          //     } catch (e) { await logError(`updateNetworkDocs///05///${e.toString()}`) }
          // }

          await incrementReadWriteNSelfV2('a9', 1, undefined)

          try {
            try {
              if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
                console.log(`Trying to update n doc for ${cId}`)
              }
            } catch (e) {
              if (e instanceof Error) await logError(`updateNetworkDocs///85///${e.toString()}`)
            }
            await myDocInNetwork.ref.update(companyDocDataMapObject)
            writesCounter++
            try {
              if (myOwnNumber == '+919970179564' || myOwnNumber == '+918806766192') {
                console.log(`Updated n doc for ${cId}`)
              }

            } catch (e) {
              if (e instanceof Error) await logError(`updateNetworkDocs///85///${e.toString()}`)
            }
          } catch (e) {
            if (e instanceof Error)
              if (e.toString().includes('No document to update')) {
                await myDocInNetwork.ref.set(companyDocDataMapObject)
                writesCounter++
              } else {
                await logError(`updateNetworkDocs///05b///${e.toString()}`)
              }

          }
        } else { await logError(`ERR updateMapLinksToMyNetworkDocs 02.1`) }
      }
      if (myOwnNumber == '+918558521485') await db.collection('random').doc('u2_internal').update({ 'log': admin.firestore.FieldValue.arrayUnion(`03: writing ${countOfKeys}`) })
      console.log(`${myOwnNumber} - u2_internal - 02: ${countOfKeys}`)

    } else { await logError(`updateNetworkDocs///06///`) }
    await incrementReadWriteCounts('u2_internal - 02', readsCounter, writesCounter, 0)
  } catch (e) { if (e instanceof Error) await logError(`updateNetworkDocs///07///${e.toString()}`) }
}

export const eod = (input: number) => {
  const millisecondsInOneDay: number = 86400000
  const fivePointFiveHoursInMilliseconds: number = (5.5 * 3600000)
  const x: number = fivePointFiveHoursInMilliseconds + input
  const y: number = x - (x % millisecondsInOneDay)
  const z: number = y + millisecondsInOneDay - fivePointFiveHoursInMilliseconds
  return z;
}

export const removeRandomCharactersFromNumber = (input: string) => {
  let result: string = input
  result = input
    .replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '')
    .replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '')
    .replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '')
    .replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '')
    .replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '')
    .replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '')
    .replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '')
    .replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '')
    .replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '')
    .replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '')
    .replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '')
    .replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '')
    .replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '')
    .replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '')
    // .replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '')
    .replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '')
    .replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '')
    .replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '')
    .replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '')
    .replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '')
    .replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '')
    .replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '')
    .replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '')
    .replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '').replace('^', '')
    .replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '')
    .replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '')
  return result;
}

export const getOnlyLettersLowerCase = (input: string, withoutSpaces: boolean) => {
  let result: string = ''

  result = input
    .toLowerCase()
    .replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '').replace('.', '')
    .replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '')
    .replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '').replace('/', '')
    .replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '').replace('[', '')
    .replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '').replace(']', '')
    .replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '').replace('(', '')
    .replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '').replace(')', '')
    .replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '').replace('*', '')
    .replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '').replace('&', '')
    .replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '').replace('@', '')
    .replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '').replace('!', '')
    .replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '')
    .replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '').replace('_', '')
    .replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '').replace('+', '')
    .replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '').replace('=', '')
    .replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '').replace(';', '')
    .replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '').replace(':', '')
    .replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '').replace('?', '')
    .replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '').replace('{', '')
    .replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '').replace('}', '')
    .replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '').replace('`', '')
    .replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '').replace('~', '')
    .replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '').replace('<', '')
    .replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '').replace('>', '')
    .replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '').replace('1', '')
    .replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '').replace('2', '')
    .replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '').replace('3', '')
    .replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '').replace('4', '')
    .replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '').replace('5', '')
    .replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '').replace('6', '')
    .replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '').replace('7', '')
    .replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '').replace('8', '')
    .replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '').replace('9', '')
    .replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '').replace('0', '')

  if (withoutSpaces) {
    result = result.replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '')
  }

  return result;
}

export const nConnectionsForNumber = async (num: string) => {
  if (num == undefined || num == null || num == '' || restrictedNumbersList.includes(num)) return;

  const db: FirebaseFirestore.Firestore = admin.firestore();
  let writesCounter: number = 0;
  let readsCounter: number = 0;

  const userQ = await db.collection(usersCollectionString).where('ownNumber', '==', num).get()
  readsCounter = readsCounter + userQ.docs.length
  if (userQ.docs.length == 0) { console.log(`Returning as no user found.`); return; }

  let lastDoc
  let m = new Map()
  let keepSearching: boolean = true;

  while (keepSearching) {
    let networkDocsQ
    if (lastDoc == null || lastDoc == undefined) {
      networkDocsQ = await db.collectionGroup('network').where('ownNumber', '==', num).limit(200).get()
      readsCounter = readsCounter + networkDocsQ.docs.length
    } else {
      networkDocsQ = await db.collectionGroup('network').where('ownNumber', '==', num).startAfter(lastDoc).limit(200).get()
      readsCounter = readsCounter + networkDocsQ.docs.length
    }

    console.log(`Found ${networkDocsQ.docs.length} n docs`)

    if (networkDocsQ == null || networkDocsQ == undefined || networkDocsQ.docs.length == 0) {
      console.log(`Ending loop as no networkDocs found.`)
      keepSearching = false
    } else {
      console.log(`First: ${networkDocsQ.docs[0].ref.path}`)

      lastDoc = networkDocsQ.docs[networkDocsQ.docs.length - 1]

      for (const nDoc of networkDocsQ.docs) {
        if (nDoc != null &&
          nDoc != undefined &&
          nDoc.data() != null &&
          nDoc.data() != undefined &&
          nDoc.ref.path.includes('/') &&
          nDoc.ref.path.split('/')[1] != null &&
          nDoc.ref.path.split('/')[1] != ''
        ) {
          const cId = nDoc.ref.path.split('/')[1]
          const nDocData = nDoc.data()

          const directLinks = nDocData.directLinks
          if (directLinks != null && directLinks != undefined) {
            for (const k of directLinks) {

              if (restrictedNumbersList.includes(k)) {
                // do nothing
              } else if (m.get(k) == null || m.get(k) == undefined) {
                m.set(k, [cId])
              } else {
                let cIdsList = m.get(k)
                cIdsList.push(cId)
                m.set(k, cIdsList)
              }
            }
          }

          const networkLinksTemp = nDocData.networkLinks
          if (networkLinksTemp != null && networkLinksTemp != undefined) {
            const networkLinks = new Map(Object.entries(networkLinksTemp))
            if (networkLinks != undefined && networkLinks != null) {
              const networkKeys = networkLinks.keys()
              if (networkKeys != null && networkKeys != undefined) {
                for (const k of networkKeys) {
                  if (restrictedNumbersList.includes(k)) {
                    // do nothing
                  } else if (m.get(k) == null || m.get(k) == undefined) {
                    m.set(k, [cId])
                  } else {
                    let cIdsList = m.get(k)
                    cIdsList.push(cId)
                    m.set(k, cIdsList)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const mForUploading = Array.from(m).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
  console.log(`Done looping for ${num}; m: ${mForUploading}`)

  try {
    await db.collection(usersCollectionString).doc(userQ.docs[0].id).collection(userInfoCollectionString).doc('connections').update({ connections: mForUploading, ownNumber: num })
    writesCounter++
  } catch (e1) {
    if (e1 instanceof Error)
      try {
        await db.collection(usersCollectionString).doc(userQ.docs[0].id).collection(userInfoCollectionString).doc('connections').set({ connections: mForUploading, ownNumber: num })
        writesCounter++
      } catch (e2) {
        if (e2 instanceof Error) console.log(`ERROR num: ${num}: ${e2.toString()}`)
      }

    await incrementReadWriteCounts('nConnectionsForNumberMain', readsCounter, writesCounter, 0)
    // await db.collection('testing').doc(num).update({ connections: mForUploading })
    return
  }
  await incrementReadWriteCounts('nConnectionsForNumberMain', readsCounter, writesCounter, 0)

}

export const numbersFromCompanyDoc = async (doc: DocumentSnapshot): Promise<string[]> => {
  const d = doc.data()

  if (d == undefined || d == null) return []
  let lst: string[] = []

  if (d.phoneOne != null && d.phoneOne != undefined && d.phoneOne != '') lst.push(d.phoneOne)
  if (d.phoneTwo != null && d.phoneTwo != undefined && d.phoneTwo != '') lst.push(d.phoneTwo)
  if (d.phoneThree != null && d.phoneThree != undefined && d.phoneThree != '') lst.push(d.phoneThree)
  if (d.phoneFour != null && d.phoneFour != undefined && d.phoneFour != '') lst.push(d.phoneFour)
  if (d.whatsapp != null && d.whatsapp != undefined && d.whatsapp != '') lst.push(d.whatsapp)

  lst = [...new Set(lst)]

  return lst
}

export const getInactiveNumbers = async (getInactive: boolean): Promise<string[]> => {
  const db: FirebaseFirestore.Firestore = admin.firestore();
  // let writesCounter: number = 0;
  let readsCounter: number = 0;

  const allUsersQ = await db.collection('allUsers').get();
  readsCounter = readsCounter + allUsersQ.docs.length
  let cutOffMil: number = Date.now() - 10 * milInOneDay
  const randomNotes = await db.collection('random').doc('daysForInactiveCutOff').get()
  readsCounter++

  if (randomNotes.data() != null && randomNotes.data != undefined && randomNotes.data()!.daysForInactiveCutOff != undefined && randomNotes.data()!.daysForInactiveCutOff != null) {
    cutOffMil = Date.now() - randomNotes.data()!.daysForInactiveCutOff * milInOneDay
  }

  let inactive: string[] = []
  let active: string[] = []

  for (const doc of allUsersQ.docs) {
    const data = doc.data()
    if (data != null && data != undefined) {
      const mField = data.notIndexed
      const m: Map<string, any> = new Map(Object.entries(mField))
      let mKeys = Array.from(m.keys())
      for (const k of mKeys) {
        const lastActiveMil: number = m.get(k)
        if (lastActiveMil < cutOffMil)
          inactive.push(k)
        else
          active.push(k)
      }
    }
  }

  await incrementReadWriteCounts('testUpdateStatsForInactive', readsCounter, 0, 0)

  if (getInactive == true)
    return inactive
  else return active
}

export const getCommon = (lst1: string[], lst2: string[]): string[] => {
  lst1 = lst1.sort()
  if (lst1.length == 0 || lst2.length == 0) return [];
  return getCommonBinary(lst1, lst2)
  // let results: string[] = []
  // for (const x of lst2) {
  //   if (
  //     // binarySearch(lst1, x) > -1
  //     lst1.includes(x)
  //   ) results.push(x)
  // }
  // return results
}

export const getCommonBinary = (sortedList: string[], lst2: string[]): string[] => {
  let results: string[] = []
  // let sortedList = lst1.sort()
  // let printStr: string = `sortedList: ${sortedList.length}, lst2: ${lst2.length}, sortedList: ${sortedList}`

  for (const x of lst2) {
    let i: number = binarySearch(sortedList, x)
    if (i > -1) {
      results.push(x)
    } else {
      // printStr += `i ${i} for ${x}, `
    }
  }
  // console.log(printStr)
  return results
}

// export const getCommonV2 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   for (const x of lst1) {
//     if (lst2.includes(x)) results.push(x)
//   }
//   return results
// }

// export const getCommonV3 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   for (let i = 0; i < lst1.length; i++) {
//     if (lst2.includes(lst1[i])) results.push(lst1[i])
//   }
//   return results
// }

// export const getCommonV4 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   for (let i = 0; i < lst2.length; i++) {
//     if (lst1.includes(lst2[i])) results.push(lst2[i])
//   }
//   return results
// }

// export const getCommonV5 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst1.length;
//   while (i < len) {
//     if (lst2.includes(lst1[i])) results.push(lst1[i])
//     i++
//   }
//   return results
// }

// export const getCommonV6 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst2.length;
//   while (i < len) {
//     if (lst1.includes(lst2[i])) results.push(lst2[i])
//     i++
//   }
//   return results
// }

// export const getCommonV7 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst2.length;
//   while (i < len) {
//     if (checkIfIncludes(lst1, lst2[i])) results.push(lst2[i])
//     i++
//   }
//   return results
// }

// export const getCommonV8 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst1.length;
//   while (i < len) {
//     if (checkIfIncludes(lst2, lst1[i])) results.push(lst1[i])
//     i++
//   }
//   return results
// }


// export const getCommonV9 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst2.length;
//   while (i < len) {
//     if (binarySearch(lst1, lst2[i]) > -1) results.push(lst2[i])
//     i++
//   }
//   return results
// }

// export const getCommonV10 = (lst1: string[], lst2: string[]): string[] => {
//   let results: string[] = []
//   var i = 0, len = lst1.length;
//   while (i < len) {
//     if (binarySearch(lst2, lst1[i]) > -1) results.push(lst1[i])
//     i++
//   }
//   return results
// }


// export const checkIfIncludes = (sortedList: string[], x: string): boolean => {
//   const len = sortedList.length // e.g. 15 (1 to 15)
//   if (len < 10) return sortedList.includes(x)
//   const halfLen = Math.floor(len / 2) // e.g. 7
//   const mid = sortedList[halfLen] // e.g. 7
//   if (x == mid) { // e.g. x = 15
//     return true
//   } else if (x < mid) { // e.g. false
//     for (let i = 0; i < halfLen; i++) {
//       if (sortedList[i] == x) return true;
//     }
//   } else if (x > mid) { // e.g. true
//     for (let i = halfLen; i < sortedList.length; i++) {
//       if (sortedList[i] == x) return true;
//     }
//   }
//   return false;
// }

export const binarySearch = (sortedList: string[], value: string): number => {
  var firstIndex = 0,
    lastIndex = sortedList.length - 1,
    middleIndex = Math.floor((lastIndex + firstIndex) / 2);

  while (sortedList[middleIndex] != value && firstIndex < lastIndex) {
    if (value < sortedList[middleIndex]) {
      lastIndex = middleIndex - 1;
    }

    else if (value > sortedList[middleIndex]) {
      firstIndex = middleIndex + 1;
    }

    middleIndex = Math.floor((lastIndex + firstIndex) / 2);
  }

  let result = -3
  if (sortedList[middleIndex] != value) {
    result = -1
  } else {
    result = middleIndex
  }

  return result
}












// -----------------------------------------------------------------------------
// CRONS
import { cron_self_updates_for_single_company_export } from './70_crons/self_updates_for_single_company'
export const cron_self_updates_for_single_company = cron_self_updates_for_single_company_export

import { cron_view_company_export } from './70_crons/view_company'
export const cron_view_company = cron_view_company_export

import { cron_view_company1_export } from './70_crons/view_company'
export const cron_view_company1 = cron_view_company1_export

import { cron_view_company2_export } from './70_crons/view_company'
export const cron_view_company2 = cron_view_company2_export

import { cron_view_company3_export } from './70_crons/view_company'
export const cron_view_company3 = cron_view_company3_export

import { cron_view_company4_export } from './70_crons/view_company'
export const cron_view_company4 = cron_view_company4_export

import { cron_view_company5_export } from './70_crons/view_company'
export const cron_view_company5 = cron_view_company5_export

import { cron_view_company6_export } from './70_crons/view_company'
export const cron_view_company6 = cron_view_company6_export

import { cron_view_company7_export } from './70_crons/view_company'
export const cron_view_company7 = cron_view_company7_export

import { cron_premium_upgrade_notify_export, cron_active_users_export, cron_hourly_notifications_export, cron_broker_companies_export, cron_search_history_summarize_export, cron_search_history_keywords_export } from './70_crons/70_other'
export const cron_active_users = cron_active_users_export
export const cron_hourly_notifications = cron_hourly_notifications_export
export const cron_broker_companies = cron_broker_companies_export
export const cron_search_history_summarize = cron_search_history_summarize_export
export const cron_premium_upgrade_notify = cron_premium_upgrade_notify_export
export const cron_search_history_keywords = cron_search_history_keywords_export

import { cron_auction_coming_up_export } from "./70_crons/auction_crons";
export const cron_auction_coming_up = cron_auction_coming_up_export


// // GSHEET TESTING
// import { test_gsheet_v3_export } from "./05_gsheet/10_gsheet_main";
// export const test_gsheet_v3 = test_gsheet_v3_export

// COMPANY TRIGGERED
import { count_companies_increment_export } from './20_company_triggered/20_other'
export const count_companies_increment = count_companies_increment_export

import { count_companies_decrement_export } from './20_company_triggered/20_other'
export const count_companies_decrement = count_companies_decrement_export

import { c_notify_friends_export } from './20_company_triggered/20_other'
export const c_notify_friends = c_notify_friends_export

import { c_selfBasicsAndUpdateNetworkDocs_export } from './20_company_triggered/20_other'
export const c_selfBasicsAndUpdateNetworkDocs = c_selfBasicsAndUpdateNetworkDocs_export


// POST TRIGGERED
import { p_toPostHistory_export } from './30_post_triggered/post_other'
export const p_toPostHistory = p_toPostHistory_export

import { p_toPostHistoryDelete_export } from './30_post_triggered/post_other'
export const p_toPostHistoryDelete = p_toPostHistoryDelete_export

import { p_self_export } from './30_post_triggered/post_other'
export const p_self = p_self_export

// import { update_intraday_charts_2_export, cron_update_intraday_1_export, cron_update_intraday_2_export } from './25_post_intraday/post_intraday'
// export const update_intraday_charts = update_intraday_charts_export
// export const update_intraday_charts_2 = update_intraday_charts_2_export
// export const cron_update_intraday_1 = cron_update_intraday_1_export
// export const cron_update_intraday_2 = cron_update_intraday_2_export

// TRANSPORTER POST TRIGGERED
import { transporter_posts_export } from './35_transporter_post_triggered/transporter_post_other'
export const transporter_posts = transporter_posts_export




// COMMENTS TRIGGERED

import { comments_notification_export, wall_post_keywords_export } from './40_wall_post_triggered/wall_post_triggered'
export const comments_notification = comments_notification_export
export const wall_post_keywords = wall_post_keywords_export

// CONTACTS TRIGGERED
// import { user_info_brokers_export } from './12_contacts_triggered/12_other'
// export const user_info_brokers = user_info_brokers_export

import { user_info_contacts_export } from './12_contacts_triggered/12_other'
export const user_info_contacts = user_info_contacts_export

// AUCTION TRIGGERED
import { establish_auction_mutuals_export, notify_approval_export } from "./50_auc_triggered/auc_approval_triggered";
import { auction_triggered_export } from "./50_auc_triggered/auc_triggered";
export const notify_approval = notify_approval_export
export const establish_auction_mutuals = establish_auction_mutuals_export
export const auction_triggered = auction_triggered_export
import {auction_triggered_check_group_trigger_export} from "./50_auc_triggered/trigger_for_groups_triggered"
export const auction_triggered_check_group_trigger = auction_triggered_check_group_trigger_export

// AUCTION -> APPLICANT STATUS TRIGGERED
import { applicant_status_export } from "./50_auc_triggered/applicant_status";
export const applicant_status = applicant_status_export

// PREMIUM ACTIONS TRIGGERRED
import { premium_actions_export, premium_google_purchases_export, interested_in_news_export, upgraded_numbers_export } from "./45_premium_actions_triggered/premium_triggered";
export const premium_actions = premium_actions_export
export const premium_google_purchases = premium_google_purchases_export
export const interested_in_news = interested_in_news_export
export const upgraded_numbers = upgraded_numbers_export

// GEN 2 TEST just for my doc
import {
  u2_mutuals_establish_for_0_gen2_export,
  u2_mutuals_establish_for_1_gen2_export,
  u2_mutuals_establish_for_2_gen2_export,
  u2_mutuals_establish_for_3_gen2_export,
  u2_mutuals_establish_for_4_gen2_export,
  u2_mutuals_establish_for_5_gen2_export,
  u2_mutuals_establish_for_6_gen2_export,
  u2_mutuals_establish_for_7_gen2_export,
  u2_mutuals_establish_for_8_gen2_export,
  u2_mutuals_establish_for_9_gen2_export,
  u2_mutuals_establish_for_other_gen2_export,
  // u2_0_gen2_export, u2_1_gen2_export, u2_2_gen2_export, u2_3_gen2_export, u2_4_gen2_export, u2_5_gen2_export, u2_6_gen2_export, u2_7_gen2_export, u2_8_gen2_export, u2_9_gen2_export, u2_other_gen2_export,
  // u2_0_gen2_small_export, u2_1_gen2_small_export, u2_2_gen2_small_export, u2_3_gen2_small_export, u2_4_gen2_small_export, u2_5_gen2_small_export, u2_6_gen2_small_export, u2_7_gen2_small_export, u2_8_gen2_small_export, u2_9_gen2_small_export, u2_other_gen2_small_export
} from './12_contacts_triggered/12_other'

// export const u2_0_gen2 = u2_0_gen2_export
// export const u2_1_gen2 = u2_1_gen2_export
// export const u2_2_gen2 = u2_2_gen2_export
// export const u2_3_gen2 = u2_3_gen2_export
// export const u2_4_gen2 = u2_4_gen2_export
// export const u2_5_gen2 = u2_5_gen2_export
// export const u2_6_gen2 = u2_6_gen2_export
// export const u2_7_gen2 = u2_7_gen2_export
// export const u2_8_gen2 = u2_8_gen2_export
// export const u2_9_gen2 = u2_9_gen2_export
// export const u2_other_gen2 = u2_other_gen2_export

export const u2_mutuals_establish_for_0_gen2 = u2_mutuals_establish_for_0_gen2_export
export const u2_mutuals_establish_for_1_gen2 = u2_mutuals_establish_for_1_gen2_export
export const u2_mutuals_establish_for_2_gen2 = u2_mutuals_establish_for_2_gen2_export
export const u2_mutuals_establish_for_3_gen2 = u2_mutuals_establish_for_3_gen2_export
export const u2_mutuals_establish_for_4_gen2 = u2_mutuals_establish_for_4_gen2_export
export const u2_mutuals_establish_for_5_gen2 = u2_mutuals_establish_for_5_gen2_export
export const u2_mutuals_establish_for_6_gen2 = u2_mutuals_establish_for_6_gen2_export
export const u2_mutuals_establish_for_7_gen2 = u2_mutuals_establish_for_7_gen2_export
export const u2_mutuals_establish_for_8_gen2 = u2_mutuals_establish_for_8_gen2_export
export const u2_mutuals_establish_for_9_gen2 = u2_mutuals_establish_for_9_gen2_export
export const u2_mutuals_establish_for_other_gen2 = u2_mutuals_establish_for_other_gen2_export


// export const u2_0_small_gen2 = u2_0_gen2_small_export
// export const u2_1_small_gen2 = u2_1_gen2_small_export
// export const u2_2_small_gen2 = u2_2_gen2_small_export
// export const u2_3_small_gen2 = u2_3_gen2_small_export
// export const u2_4_small_gen2 = u2_4_gen2_small_export
// export const u2_5_small_gen2 = u2_5_gen2_small_export
// export const u2_6_small_gen2 = u2_6_gen2_small_export
// export const u2_7_small_gen2 = u2_7_gen2_small_export
// export const u2_8_small_gen2 = u2_8_gen2_small_export
// export const u2_9_small_gen2 = u2_9_gen2_small_export
// export const u2_other_small_gen2 = u2_other_gen2_small_export



// import { u2_myDocsThenOldContactsV3_ending0_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending0 = u2_myDocsThenOldContactsV3_ending0_export

// import { u2_myDocsThenOldContactsV3_ending1_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending1 = u2_myDocsThenOldContactsV3_ending1_export

// import { u2_myDocsThenOldContactsV3_ending2_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending2 = u2_myDocsThenOldContactsV3_ending2_export

// import { u2_myDocsThenOldContactsV3_ending3_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending3 = u2_myDocsThenOldContactsV3_ending3_export

// import { u2_myDocsThenOldContactsV3_ending4_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending4 = u2_myDocsThenOldContactsV3_ending4_export

// import { u2_myDocsThenOldContactsV3_ending5_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending5 = u2_myDocsThenOldContactsV3_ending5_export

// import { u2_myDocsThenOldContactsV3_ending6_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending6 = u2_myDocsThenOldContactsV3_ending6_export

// import { u2_myDocsThenOldContactsV3_ending7_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending7 = u2_myDocsThenOldContactsV3_ending7_export

// import { u2_myDocsThenOldContactsV3_ending8_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending8 = u2_myDocsThenOldContactsV3_ending8_export

// import { u2_myDocsThenOldContactsV3_ending9_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_ending9 = u2_myDocsThenOldContactsV3_ending9_export

// import { u2_myDocsThenOldContactsV3_endingOther_export } from './12_contacts_triggered/12_other'
// export const u2_myDocsThenOldContactsV3_endingOther = u2_myDocsThenOldContactsV3_endingOther_export

/*
IMPORTANT FUNCTION
import { u3_otherDocsV2_export } from './12_contacts_triggered/12_other'
export const u3_otherDocsV2 = u3_otherDocsV2_export
*/


// OLD FUNCTIONS
import { g_self_export } from './90_old/90_other'
export const g_self = g_self_export



// OTHER FUNCTIONS
import { deleteNetworkV2ending0_export } from './80_other/80_other'
export const deleteNetworkV2ending0 = deleteNetworkV2ending0_export

import { deleteNetworkV2ending1_export } from './80_other/80_other'
export const deleteNetworkV2ending1 = deleteNetworkV2ending1_export

import { deleteNetworkV2ending2_export } from './80_other/80_other'
export const deleteNetworkV2ending2 = deleteNetworkV2ending2_export

import { deleteNetworkV2ending3_export } from './80_other/80_other'
export const deleteNetworkV2ending3 = deleteNetworkV2ending3_export

import { deleteNetworkV2ending4_export } from './80_other/80_other'
export const deleteNetworkV2ending4 = deleteNetworkV2ending4_export

import { deleteNetworkV2ending5_export } from './80_other/80_other'
export const deleteNetworkV2ending5 = deleteNetworkV2ending5_export

import { deleteNetworkV2ending6_export } from './80_other/80_other'
export const deleteNetworkV2ending6 = deleteNetworkV2ending6_export

import { deleteNetworkV2ending7_export } from './80_other/80_other'
export const deleteNetworkV2ending7 = deleteNetworkV2ending7_export

import { deleteNetworkV2ending8_export } from './80_other/80_other'
export const deleteNetworkV2ending8 = deleteNetworkV2ending8_export

import { deleteNetworkV2ending9_export } from './80_other/80_other'
export const deleteNetworkV2ending9 = deleteNetworkV2ending9_export

import { nConnectionsForNumberMain_export } from './80_other/80_other'
export const nConnectionsForNumberMain = nConnectionsForNumberMain_export

import { mutualsUploader_export } from './80_other/80_other'
export const mutualsUploader = mutualsUploader_export

import { mutualsFinderQuery_export } from './80_other/80_other'
export const mutualsFinderQuery = mutualsFinderQuery_export

import { send_notification_export } from './80_other/80_other'
export const send_notification = send_notification_export

import { testUpdateStatsForInactive_export } from './80_other/80_other'
export const testUpdateStatsForInactive = testUpdateStatsForInactive_export

import { all_contacts_v2_creator_export } from './80_other/80_other'
export const all_contacts_v2_creator = all_contacts_v2_creator_export

import { all_contacts_v2_uploader_export } from './80_other/80_other'
export const all_contacts_v2_uploader = all_contacts_v2_uploader_export

import { updateAllContactsLastActive_export } from './80_other/80_other'
export const updateAllContactsLastActive = updateAllContactsLastActive_export

import { users_knowing_gen2_export, new_user_added_export } from "./80_other/81_other_gen2";
export const users_knowing_gen2 = users_knowing_gen2_export
export const new_user_added = new_user_added_export

import { auc_privately_add_new_user_triggered_export, auc_privately_add_approval_triggered_export, auc_triggered_export } from "./60_auctions/60_auctions";
import { bid_triggered_export } from "./60_auctions/62_bids";
export const auc_privately_add_new_user_triggered = auc_privately_add_new_user_triggered_export
export const auc_privately_add_approval_triggered = auc_privately_add_approval_triggered_export
export const bid_triggered = bid_triggered_export
export const auc_triggered = auc_triggered_export

// USER TRIGGERED
import { users_notify_friends_export } from './10_user_triggered/10_other'
export const users_notify_friends = users_notify_friends_export

import { users_autoAddSelfToCompany_export } from './10_user_triggered/10_other'
export const users_autoAddSelfToCompany = users_autoAddSelfToCompany_export

import { count_users_increment_export } from './10_user_triggered/10_other'
export const count_users_increment = count_users_increment_export

import { count_users_decrement_export } from './10_user_triggered/10_other'
export const count_users_decrement = count_users_decrement_export

import { u1_selfBasicsAndMeInCompanyEmployees_export } from './10_user_triggered/10_other'
import { Filter } from "firebase-admin/firestore";

// SUMMARY TRIGGERED
import { update_numbers_names_for_keyword_wise_export } from "./65_seach_history_summary_triggered/search_history_summary_triggered"
export const update_numbers_names_for_keyword_wise = update_numbers_names_for_keyword_wise_export

export const u1_selfBasicsAndMeInCompanyEmployees = u1_selfBasicsAndMeInCompanyEmployees_export

// import { u4_networkDocsDesc_export } from './10_user_triggered/10_other'
// export const u4_networkDocsDesc = u4_networkDocsDesc_export

// import { u4_networkDocs_export } from './10_user_triggered/other'
// export const u4_networkDocs = u4_networkDocs_export



