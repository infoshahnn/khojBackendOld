import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { eod, getPostKeywords, incrementReadWriteCounts, logError, log_c, log_u3 } from "..";
let companiesCollectionStringV2 = 'companiesV2';
let postsCollectionString = 'posts';

// const keywordsToCheck: string[] = [
//     // daals: 
//     'toordaal', 'uraddaal', 'masoordaal', 'chanadaal',
//     // pulses:
//     'wheat', 'maize', 'toor', 'urad', 'mung', 'chana', 'kabuli', 'masoor', 'rajma', 'moth', 'peas', 'jowar', 'bajra', 'chawli', 'barley', 'guar',
//     // oilseeds:
//     'soybean', 'sunflower', 'sesame', 'safflower', 'palm', 'sarso', 'canola', 'groundnut', 'castorseed', 'cottonseed',
//     // oils:
//     'soyabeanoil', 'sunfloweroil', 'sesameoil', 'saffloweroil', 'palmoil', 'mustardoil', 'groundnutoil', 'castoroil', 'cottonseedoil', 'oliveoil', 'ricebranoil', 'cornoil', 'coconutoil',
//     // other:
//     'sugar', 'cotton', 'gud', 'dhaniya', 'jeera', 'haldi', 'methi', 'flaxseed', 'dryginger', 'chiaseed', 'tea', 'foxnut', 'wheatflour', 'semolina', 'allpurposeflour', 'gramflour', 'oilcake', 'coffeebeans',
//     // spices:
//     'clove', 'fennel', 'redchilli', 'cardamom', 'psylliumhusk', 'blackpepper', 'nigella', 'ajwain', 'nutmeg', 'staranise', 'mace', 'whitepepper', 'bayleaf', 'cinnamon', 'poppyseed',
//     // dry fruits:
//     'cashew', 'almond', 'raisin', 'pistachio', 'dates', 'walnut', 'fig',
//     // vegetables:
//     'potato', 'onion', 'ginger', 'garlic',
// ];

const keywordsToCheck: string[] = [
    //Feb 17, 2024 - 07:52 AM
    //Pulses
    'chana', 'kabuli', 'chanadaal', 'toor', 'toordaal', 'urad', 'uraddaal', 'guar', 'mung', 'mungdaal', 'moth', 'masoor', 'masoordaal', 'greenpeas', 'yellowpeas', 'rajma', 'speckledbeans', 'chawli', 'horsegram', 'peas',//
    //Cereals
    'wheat', 'maize', 'jowar', 'barley', 'bajra', 'fingermillet', 'foxtailmillet', 'prosomillet', 'littlemillet', 'kodomillet', 'barnyardmillet', 'rice', 'paddy',//
    //Oil seeds
    'soybean', 'groundnut', 'sarso', 'sesame', 'sunflower', 'castorseed', 'flaxseed', 'safflower', 'chiaseed', 'taramiraseed',//
    //Spices
    'haldi', 'jeera', 'methi', 'dhaniya', 'clove', 'fennel', 'redchilli', 'greencardamom', 'blackcardamom', 'psylliumhusk', 'blackpepper', 'whitepepper', 'nigella', 'ajwain', 'staranise', 'nutmeg', 'mace', 'bayleaf', 'poppyseed', 'dryginger', 'stoneflower', 'cinnamon', 'cardamom',//
    //Oils
    'palmoil', 'soyabeanoil', 'sunfloweroil', 'mustardoil', 'groundnutoil', 'cottonseedoil', 'castoroil', 'sesameoil', 'coconutoil', 'cornoil', 'neemoil', 'saffloweroil', 'ricebranoil',//
    //Dry fruits
    'cashew', 'almond', 'raisin', 'pistachio', 'walnut', 'fig', 'dates', 'foxnut',//
    //Vegetables
    'onion', 'potato', 'ginger', 'garlic', 'tomato',//
    //Fruits
    'orange', 'apple', 'pomegranate', 'sweetlime',//
    //Processed commodities
    'sugar', 'cotton', 'wheatflour', 'semolina', 'allpurposeflour', 'gramflour', 'oilcake', 'gud', 'sago', 'soyadoc', 'mustarddoc', 'groundnutdoc',//
    //Other commodities
    'tea', 'coffeebeans', 'tamarind', //"
    //ornament
    'gold', 'silver', // 02 march
]

export const p_toPostHistory_export = functions.region('asia-south1').runWith({ maxInstances: 50 }).firestore.document(`${companiesCollectionStringV2}/{cId}/${postsCollectionString}/{postId}`).onCreate(async (change, context) => {
    if (change.data() == undefined) {
        await logError(`p_toPostHistory///1a///NOTERROR NOTK - return 01`)
        return;
    }

    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    try {
        const data = change.data()

        let id: string = data.id == undefined ? '' : data.id;
        let name: string = data.name == undefined ? '' : data.name;
        let postText: string = data.postText == undefined ? '' : data.postText;
        let rateFrom: string = data.rateFrom == undefined ? '' : data.rateFrom.toString();
        let rateTo: string = data.rateTo == undefined ? '' : data.rateTo.toString();
        let increase: string = data.increase == undefined ? '' : data.increase.toString();
        let stateCode: string = data.stateCode == undefined ? '' : data.stateCode;
        let variety: string = data.variety == undefined ? '' : data.variety;
        let city: string = data.city == undefined ? '' : data.city;
        let postCreatedAt: string = data.postCreatedAt == undefined ? '' : data.postCreatedAt.toString();
        let type: string = data.rateOnly == true ? 'rateOnly' : data.news == true ? 'news' : data.buySell == true ? 'buySell' : '';
        let unit: string = data.unit == undefined ? '' : data.unit;

        // variety = variety.replace('^', ' ')
        // variety = variety.trim()

        // postText = postText.replace('^', ' ')
        // postText = postText.trim()

        let keywords: string[] = []

        if (data.news == true && data.newsTitleEnglish != null && data.newsTitleEnglish != undefined && data.newsTitleEnglish != '') {
            keywords = getPostKeywords(data.newsTitleEnglish.toLowerCase(), false, false, false)
        } else {
            keywords = getPostKeywords(postText.toLowerCase(), false, false, false)
        }

        if (type == 'rateOnly' && rateFrom != '' && variety != '') {
            postText = ''
        }

        let concatString = `${id}///${name}///${postText}///${rateFrom}///${rateTo}///${increase}///${stateCode}///${variety}///${city}///${postCreatedAt}///${type}///////////////${unit}///`;

        const db: FirebaseFirestore.Firestore = admin.firestore();
        const postHistoryCollec = db.collection('postsHistory')
        let eodMil = eod(Date.now())
        try {
            if (data.postCreatedAt != undefined && data.postCreatedAt != null) {
                eodMil = eod(data.postCreatedAt)
            }
        } catch (e) {
            if (e instanceof Error)
                await logError(`p_toPostHistory///8///${e.toString()}`)
        }

        // const keywordsToCheck: string[] = [
        //     // daals:
        //     'toordaal', 'uraddaal', 'masoordaal', 'chanadaal',
        //     // pulses:
        //     'wheat', 'maize', 'toor', 'urad', 'mung', 'chana', 'kabuli', 'masoor', 'rajma', 'moth', 'peas', 'jowar', 'bajra', 'chawli', 'barley', 'guar',
        //     // oilseeds:
        //     'soybean', 'sunflower', 'sesame', 'safflower', 'palm', 'sarso', 'canola', 'groundnut', 'castorseed', 'cottonseed',
        //     // oils:
        //     'soyabeanoil', 'sunfloweroil', 'sesameoil', 'saffloweroil', 'palmoil', 'mustardoil', 'groundnutoil', 'castoroil', 'cottonseedoil', 'oliveoil', 'ricebranoil', 'cornoil', 'coconutoil',
        //     // other:
        //     'sugar', 'cotton', 'gud', 'dhaniya', 'jeera', 'haldi', 'methi', 'flaxseed', 'dryginger', 'chiaseed', 'tea', 'foxnut', 'wheatflour', 'semolina', 'allpurposeflour', 'gramflour', 'oilcake', 'coffeebeans',
        //     // spices:
        //     'clove', 'fennel', 'redchilli', 'cardamom', 'psylliumhusk', 'blackpepper', 'nigella', 'ajwain', 'nutmeg', 'staranise', 'mace', 'whitepepper', 'bayleaf', 'cinnamon', 'poppyseed',
        //     // dry fruits:
        //     'cashew', 'almond', 'raisin', 'pistachio', 'date', 'walnut', 'fig',
        //     // vegetables:
        //     'potato', 'onion', 'ginger', 'garlic',
        // ];

        for (const k of keywordsToCheck) {
            if (keywords.includes(k)) {
                try {
                    await postHistoryCollec.doc(`${eodMil}_${k}`).update({ rates: admin.firestore.FieldValue.arrayUnion(concatString), eodMil: eodMil });
                    writesCounter++
                } catch (e) {
                    if (e instanceof Error)
                        if (e.toString().includes('No document to update')) {
                            await postHistoryCollec.doc(`${eodMil}_${k}`).set({ rates: [concatString] });
                            writesCounter++
                        } else {
                            await logError(`p_toPostHistory///1bb///${e.toString()}`)
                        }
                }
            }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`p_toPostHistory///2///${e.toString()}`)
    }

    await incrementReadWriteCounts('p_toPostHistory', readsCounter, writesCounter, deletesCounter)
    return
});

export const p_toPostHistoryDelete_export = functions.region('asia-south1').runWith({ maxInstances: 10 }).firestore.document(`${companiesCollectionStringV2}/{cId}/${postsCollectionString}/{postId}`).onDelete(async (change, context) => {
    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    if (change.data() == undefined) {
        await logError(`p_toPostHistory///1c///NOTERROR NOTK - return 01`)
        return;
    }

    // await logError(`p_toPostHistory///2///NOTERROR`)

    try {
        const data = change.data()

        let postCreatedAtOriginalNumber: number = data.postCreatedAt;
        if (postCreatedAtOriginalNumber == undefined) {
            await logError(`p_toPostHistoryDelete///4///postCreatedAt is undefined ${context.params.cId} > ${context.params.postId}`)
            return;
        }

        let id: string = data.id == undefined ? '' : data.id;
        let name: string = data.name == undefined ? '' : data.name;
        let postText: string = data.postText == undefined ? '' : data.postText;
        let rateFrom: string = data.rateFrom == undefined ? '' : data.rateFrom.toString();
        let rateTo: string = data.rateTo == undefined ? '' : data.rateTo.toString();
        let increase: string = data.increase == undefined ? '' : data.increase.toString();
        let stateCode: string = data.stateCode == undefined ? '' : data.stateCode;
        let variety: string = data.variety == undefined ? '' : data.variety;
        let city: string = data.city == undefined ? '' : data.city;
        let postCreatedAt: string = data.postCreatedAt == undefined ? '' : data.postCreatedAt.toString();
        let type: string = data.rateOnly == true ? 'rateOnly' : data.news == true ? 'news' : data.buySell == true ? 'buySell' : '';
        let unit: string = data.unit == undefined ? '' : data.unit;

        // variety = variety.replace('^', ' ')
        // variety = variety.trim()

        // postText = postText.replace('^', ' ')
        // postText = postText.trim()

        const keywords: string[] = getPostKeywords(postText.toLowerCase(), false, false, false)

        if (type == 'rateOnly' && rateFrom != '' && variety != '') {
            postText = ''
        }

        let concatString = `${id}///${name}///${postText}///${rateFrom}///${rateTo}///${increase}///${stateCode}///${variety}///${city}///${postCreatedAt}///${type}`;
        let concatStringWithoutCity = `${id}///${name}///${postText}///${rateFrom}///${rateTo}///${increase}///${stateCode}///${variety}//////${postCreatedAt}///${type}`;

        let concatStringWithUnit = `${id}///${name}///${postText}///${rateFrom}///${rateTo}///${increase}///${stateCode}///${variety}///${city}///${postCreatedAt}///${type}///////////////${unit}///`;
        let concatStringWithoutCityWithUnit = `${id}///${name}///${postText}///${rateFrom}///${rateTo}///${increase}///${stateCode}///${variety}//////${postCreatedAt}///${type}///////////////${unit}///`;

        const db: FirebaseFirestore.Firestore = admin.firestore();
        const postHistoryCollec = db.collection('postsHistory')
        const eodMil = eod(postCreatedAtOriginalNumber)

        // await logError(`p_toPostHistory///4///will try to delete from ${eodMil}_...: ${concatString}`)

        // const keywordsToCheck: string[] = [
        //     // daals:
        //     'toordaal', 'uraddaal', 'masoordaal', 'chanadaal',
        //     // pulses:
        //     'wheat', 'maize', 'toor', 'urad', 'mung', 'chana', 'kabuli', 'masoor', 'rajma', 'moth', 'peas', 'jowar', 'bajra', 'chawli', 'barley', 'guar',
        //     // oilseeds:
        //     'soybean', 'sunflower', 'sesame', 'safflower', 'palm', 'sarso', 'canola', 'groundnut', 'castorseed', 'cottonseed',
        //     // oils:
        //     'soyabeanoil', 'sunfloweroil', 'sesameoil', 'saffloweroil', 'palmoil', 'mustardoil', 'groundnutoil', 'castoroil', 'cottonseedoil', 'oliveoil', 'ricebranoil', 'cornoil', 'coconutoil',
        //     // other:
        //     'sugar', 'cotton', 'gud', 'dhaniya', 'jeera', 'haldi', 'methi', 'flaxseed', 'dryginger', 'chiaseed', 'tea', 'foxnut', 'wheatflour', 'semolina', 'allpurposeflour', 'gramflour', 'oilcake', 'coffeebeans',
        //     // spices:
        //     'clove', 'fennel', 'redchilli', 'cardamom', 'psylliumhusk', 'blackpepper', 'nigella', 'ajwain', 'nutmeg', 'staranise', 'mace', 'whitepepper', 'bayleaf', 'cinnamon', 'poppyseed',
        //     // dry fruits:
        //     'cashew', 'almond', 'raisin', 'pistachio', 'date', 'walnut', 'fig',
        //     // vegetables:
        //     'potato', 'onion', 'ginger', 'garlic',
        // ];

        for (const k of keywordsToCheck) {
            if (keywords.includes(k)) {
                try {
                    await postHistoryCollec.doc(`${eodMil}_${k}`).update({
                        rates: admin.firestore.FieldValue.arrayRemove(concatString, concatStringWithoutCity, concatStringWithUnit, concatStringWithoutCityWithUnit)
                    });
                    writesCounter++
                } catch (e) {
                    if (e instanceof Error)
                        await logError(`p_toPostHistoryDelete///3///eod: ${eod} postCreatedAt: ${postCreatedAtOriginalNumber} id:${id} name:${name} variety:${variety} postText:${postText} ${e.toString()}`)
                }
            }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`p_toPostHistoryDelete///2///${e.toString()}`)
    }
    await incrementReadWriteCounts('p_toPostHistoryDelete', readsCounter, writesCounter, deletesCounter)
    return
});

export const p_self_export = functions.region('asia-south1').runWith({ maxInstances: 5 }).firestore.document(`${companiesCollectionStringV2}/{cId}/${postsCollectionString}/{postId}`).onWrite(async (change, context) => {
    if (!change.after.exists) {
        return
    }

    let writesCounter: number = 0;
    let readsCounter: number = 0;
    let deletesCounter: number = 0;

    const afterData = change.after.data()

    if (!afterData) {
        await log_c(`END c02 for cId ${context.params.cId}`)
        return
    }

    try {
        const companyDoc = await change.after.ref.parent.parent!.get()
        readsCounter++
        const companyDocData = companyDoc.data()

        try {
            if (companyDocData != undefined) {
                const containsPosts: boolean = companyDocData.containsPosts;
                if (containsPosts != true) {
                    await companyDoc.ref.update({ containsPosts: true });
                    writesCounter++
                }
            }

        } catch (e) {
            if (e instanceof Error)
                await logError(`p_self///01b///${e.toString()}`)
        }

        if (!companyDocData) {
            try {
                await log_c(`p_self parent NA; ${change.after.ref.parent.parent?.id} >${context.params.postId}`)
                await logError(`p_self///01///parent NA; ${change.after.ref.parent.parent?.id} >${context.params.postId}`)
            } catch (e) {
                if (e instanceof Error)
                    await log_c(`p_self parent NA; ${context.params.postId}; ${e.toString()}`)
                if (e instanceof Error)
                    await logError(`p_self///02///parent NA; ${context.params.postId}; ${e.toString()}`)
            }
        } else {
            try {
                const companyDocDataMap: Map<string, any> = new Map(Object.entries(companyDocData))

                // parent company has fields called networkLinks and directLinks; need to delete these otherwise these overwrite the network doc's fields
                companyDocDataMap.delete('testTrigger')
                companyDocDataMap.delete('address')
                companyDocDataMap.delete('countOfEmployeesWithoutField')
                companyDocDataMap.delete('country')
                companyDocDataMap.delete('createdAt')
                companyDocDataMap.delete('description')
                companyDocDataMap.delete('directLinks')
                companyDocDataMap.delete('directLinks')
                companyDocDataMap.delete('fieldPhones')
                companyDocDataMap.delete('googleSheetPerson')
                companyDocDataMap.delete('googleSheetUrl')
                companyDocDataMap.delete('gst')
                companyDocDataMap.delete('id')
                companyDocDataMap.delete('info')
                companyDocDataMap.delete('lbt')
                companyDocDataMap.delete('linkOne')
                companyDocDataMap.delete('linkThree')
                companyDocDataMap.delete('linkTwo')
                companyDocDataMap.delete('logoUrl')
                companyDocDataMap.delete('nameArray')
                companyDocDataMap.delete('productsV2')
                companyDocDataMap.delete('networkLinks')
                companyDocDataMap.delete('pinCode')
                companyDocDataMap.delete('revenue')
                companyDocDataMap.delete('source')
                companyDocDataMap.delete('vat')
                companyDocDataMap.delete('city')

                companyDocDataMap.delete('companyPoints')
                // companyDocDataMap.delete('transporterCompanyPoints')
                companyDocDataMap.delete('employeeNamesMap')
                companyDocDataMap.delete('networkKeys')
                companyDocDataMap.delete('networkValues')
                companyDocDataMap.delete('products')
                companyDocDataMap.delete('sponsoredBronze')
                companyDocDataMap.delete('sponsoredSilver')
                companyDocDataMap.delete('sponsoredGold')
                companyDocDataMap.delete('sponsoredDiamond')
                companyDocDataMap.delete('sr')
                companyDocDataMap.delete('shortDescription')
                companyDocDataMap.delete('verified')
                companyDocDataMap.delete('verifiedLow')
                companyDocDataMap.delete('verifiedMedium')
                companyDocDataMap.delete('verifiedHigh')
                companyDocDataMap.delete('employees')
                companyDocDataMap.delete('adminPhones')
                companyDocDataMap.delete('email')
                companyDocDataMap.delete('iec')
                companyDocDataMap.delete('keywords')
                companyDocDataMap.delete('adminRemarks')
                companyDocDataMap.delete('pan')
                companyDocDataMap.delete('cityArray')
                companyDocDataMap.delete('phoneThree')
                companyDocDataMap.delete('phoneTwo')

                companyDocDataMap.delete('broker')
                companyDocDataMap.delete('containsPosts')
                companyDocDataMap.delete('exporter')
                companyDocDataMap.delete('processor')
                companyDocDataMap.delete('stateCode')
                companyDocDataMap.delete('trader')
                companyDocDataMap.delete('importer')

                if (companyDocDataMap.get('actualCity') != null && companyDocDataMap.get('actualCity') != undefined && companyDocDataMap.get('actualCity') != '') {
                    companyDocDataMap.set('city', companyDocDataMap.get('actualCity'))
                }
                companyDocDataMap.delete('actualCity')
                try {

                    let postKeywords: string[] = []

                    const postText = afterData.postText
                    let buySell: boolean = afterData.buySell ?? false
                    if (buySell == undefined || buySell == null) {
                        buySell = false
                    }

                    let news: boolean = afterData.news ?? false
                    if (news == undefined || news == null) {
                        news = false
                    }

                    let rateOnly: boolean = afterData.rateOnly ?? false
                    if (rateOnly == undefined || rateOnly == null) {
                        rateOnly = false
                    }

                    if (postText == null || postText == undefined) {
                        await logError(`p_self///03///id: ${context.params.postId}`)
                        await log_u3(`p_self post05: id: ${context.params.postId}`)
                    } else {

                        try {
                            const t = afterData.newsTitleEnglish

                            if (news && t != null && t != undefined && t.length > 8) {
                                postKeywords = getPostKeywords(t.toLowerCase(), buySell, news, rateOnly)
                            } else {
                                postKeywords = getPostKeywords(postText.toLowerCase(), buySell, news, rateOnly)
                            }
                        } catch (e) {
                            postKeywords = getPostKeywords(postText.toLowerCase(), buySell, news, rateOnly)
                        }

                    }
                    companyDocDataMap.set('postKeywords', postKeywords)

                } catch (e) {
                    if (e instanceof Error)
                        await logError(`p_self///04///${e.toString()} id: ${context.params.postId}`)
                    if (e instanceof Error)
                        await log_u3(`p_self post06: ${e.toString()} id: ${context.params.postId}`)
                }

                let companyDocDataMapObject = Array.from(companyDocDataMap).reduce((obj, [key, value]) => (Object.assign(obj, { [key]: value })), {});
                try {
                    // non fieldvalue update
                    await change.after.ref.update(companyDocDataMapObject)
                    writesCounter++

                } catch (e) {
                    if (e instanceof Error)
                        await logError(`p_self///05///${e.toString()} id: ${context.params.postId}`)
                    if (e instanceof Error)
                        await log_u3(`p_self post01: ${e.toString()} id: ${context.params.postId}`)
                }
            } catch (e) {
                if (e instanceof Error)
                    await logError(`p_self///06///${e.toString()} id: ${context.params.postId}`)
                if (e instanceof Error)
                    await log_u3(`p_self post02: ${e.toString()} id: ${context.params.postId}`)
            }
        }
    } catch (e) {
        if (e instanceof Error)
            await logError(`p_self///07///${e.toString()} id: ${context.params.postId}`)
        if (e instanceof Error)
            await log_u3(`p_self post03: ${e.toString()} id: ${context.params.postId}`)
    }

    await incrementReadWriteCounts('p_self', readsCounter, writesCounter, deletesCounter)
    return;
});
