var app = new Vue({
    el: '#app',
    data: {
        requests: [],
    },
    methods: {
        upvoteRequest(id){
            const upvote = firebase.functions().httpsCallable('upvote');
            upvote({ id })
                .catch(err => {
                    showNotification(err.message);
                });
        }
    },
    mounted(){
        const ref = firebase.firestore().collection('requests').orderBy('upvotes', 'desc');
        ref.onSnapshot(snapshot => {
            let requests = [];
            snapshot.forEach(doc => {
                requests.push({...doc.data(), id: doc.id});
              });
            this.requests = requests;
        });
    }
  });



//   let html = ``;
//   requests.forEach(request => {
//       html += `
//           <li>
//               <span class="text">${request.text}</span>
//               <div>
//                   <span class="votes">${request.upvotes}</span>
//                   <i class="material-icons upvote">arrow_upward</i>
//               </div>
//           </li>
//       `;
//   });
//   document.querySelector('ul').innerHTML = html;