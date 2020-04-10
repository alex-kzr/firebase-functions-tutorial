/* eslint-disable promise/no-nesting */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate(user => {
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn: []
    });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    return admin.firestore().collection('users').doc(user.uid).delete();
});

// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add request'
        );
    }
    if(data.text.length > 30){
        throw new functions.https.HttpsError(
            'invalid-argument', 
            'request must be no more than 30 characters long'
        );
    }
    return admin.firestore().collection('requests').add({
        text: data.text,
        upvotes: 0
    }).then(() => {
        return 'new request added';
    }).catch(() => {
        throw new functions.https.HttpsError(
            'internal',
            'request not added'
        );
    });
});

//upvote callable function
exports.upvote = functions.https.onCall(async (data,context) => {
    
    // check auth state
    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add request'
        );
    }

    // get refs for user doc & request doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);
    
    const doc = await user.get();
    // check user hasn't already upvoted the request
    if(doc.data().upvotedOn.includes(data.id)){
        throw new functions.https.HttpsError(
            'failed-precondition',
            'You can only upvote request once'
        );
    }

    // update the array in user document
    await user.update({
        upvotedOn: [...doc.data().upvotedOn, data.id]
    });
    
    // update votes on the request
    return request.update({
        upvotes: admin.firestore.FieldValue.increment(1)
    });        
});

// firestore trigger for tracking activity
exports.logActivities = functions.firestore.document('/{collection}/{id}')
    .onCreate((snap, context) => {
        console.log(snap.data());
        
        const collection = context.params.collection;
        const id = context.params.id;

        const activities = admin.firestore().collection('activities');

        if(collection === 'requests'){
            return activities.add({ 
                text: 'a new tutorial request was added', 
                id
            });
        }
        if(collection === 'users'){
            return activities.add({ 
                text: 'a new user signed up',
                id
            });
        }
        return null;
    });