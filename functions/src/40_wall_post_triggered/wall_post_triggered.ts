import * as functions from "firebase-functions";
import admin = require('firebase-admin');
import { getPostKeywords, logError } from "..";

export const comments_notification_export = functions.region('asia-south1').runWith({ maxInstances: 3 }).firestore.document(`wallPosts/{wallPostId}/comments/{commentId}`).onCreate(async (change, context) => {
    try {
        // let writesCounter: number = 0;
        // let readsCounter: number = 0;
        // let deletesCounter: number = 0;

        const commentData = change.data()
        if (commentData == null || commentData == undefined) return;

        const textEnglish = commentData.textEnglish

        if (textEnglish == null || textEnglish == '') return;

        const wallPostdoc = await change.ref.parent.parent?.get()
        if (wallPostdoc == null || wallPostdoc == undefined || wallPostdoc.data() == null || wallPostdoc.data() == undefined) {
            await logError(`comments_notification///03///parent wall post NA for path ${change.ref.path}`)
            return;
        }

        let textEnglishCompact = ''
        if (textEnglish.length < 130) {
            textEnglishCompact = textEnglish
        } else {
            textEnglishCompact = textEnglish.substring(0, 120) + '...'
        }

        // textEnglishCompact += ` (code: ${wallPostdoc.id})`

        const wallPostData = wallPostdoc.data()!
        let notificationTokens = wallPostData.notificationTokens || []
        let notificationPhones = wallPostData.notificationPhones || []

        if(commentData.creatorToken != null && commentData.creatorToken != undefined){
            const index = notificationTokens.indexOf(commentData.creatorToken, 0);
            if (index > -1) {
                notificationTokens.splice(index, 1);
            }
        }

        if(commentData.creatorOwnNumber != null && commentData.creatorOwnNumber != undefined){
            const index = notificationPhones.indexOf(commentData.creatorOwnNumber, 0);
            if (index > -1) {
                notificationPhones.splice(index, 1);
            }
        }


        if (notificationTokens.length == 0 && notificationPhones.length == 0) return;

        const db: FirebaseFirestore.Firestore = admin.firestore()

        try {
            await db.collection('notifications').add({
                'tokens': notificationTokens,
                'title': `Someone commented on your post/comment - *${textEnglishCompact}*`,
                'body': `किसी ने आपकी पोस्ट पर कमेंट किया - *${textEnglishCompact}* (code: ${wallPostdoc.id})`,
                'status': 'pending',
                'createdAt': Date.now(),
                'createdAtForIndexing': Date.now(),
                'source': 'commentCreated',
                'userNumbers': notificationPhones,
                'destinationDiscussionPostId': change.ref.parent.parent?.id,
            })
            // await incrementReadWriteCounts('comments_notification', readsCounter, writesCounter, deletesCounter)
        } catch (e) { if (e instanceof Error) await logError(`comments_notification///04///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`comments_notification///05///${e.toString()}`); }
    console.log(`Ending`)
    return
});


export const wall_post_keywords_export = functions.region('asia-south1').runWith({ maxInstances: 3 }).firestore.document(`wallPosts/{wallPostId}`).onUpdate(async (change, context) => {
    try {
        // let writesCounter: number = 0;
        // let readsCounter: number = 0;
        // let deletesCounter: number = 0;

        const wallPostData = change.after.data()
        if (wallPostData == null || wallPostData == undefined) return;

        const textEnglish = wallPostData.textEnglish

        if (textEnglish == null || textEnglish == '') return;

        const postKeywords = getPostKeywords(textEnglish.toLowerCase(), false, false, false)

        // const db: FirebaseFirestore.Firestore = admin.firestore()

        try {
            await change.after.ref.update({'postKeywords': postKeywords})
        } catch (e) { if (e instanceof Error) await logError(`wall_post_keywords///04///${e.toString()}`) }
    } catch (e) { if (e instanceof Error) await logError(`wall_post_keywords///05///${e.toString()}`); }
    return
});