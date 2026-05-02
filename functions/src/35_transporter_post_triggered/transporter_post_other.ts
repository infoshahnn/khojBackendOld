import * as functions from "firebase-functions";
import { getTransporterPostsKeywords } from "..";
// import admin = require('firebase-admin');
// import { eod, getPostKeywords, incrementReadWriteCounts, logError, log_c, log_u3 } from "..";
// let companiesCollectionStringV2 = 'companiesV2';
// let postsCollectionString = 'posts';

export const transporter_posts_export = functions.region('asia-south1').runWith({ maxInstances: 50 }).firestore.document(`transporterPosts/{tId}`).onCreate(async (change, context) => {
    const data = change.data()

    let from: string = data.fromDistrictState == undefined ? '' : data.fromDistrictState;
    let to: string = data.toDistrictState == undefined ? '' : data.toDistrictState;
    let searchingOrHavingTruck: string = data.searchingOrHavingTruck == undefined ? '' : data.searchingOrHavingTruck;

    const keywords = getTransporterPostsKeywords(from, to, searchingOrHavingTruck)

    console.log(`keywords len: ${keywords.length}, id: ${context.params.tId}`)

    if (keywords.length > 0) {
        await change.ref.update({ postKeywords: keywords })
    }
    return;
});