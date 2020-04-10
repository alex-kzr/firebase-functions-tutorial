var app = new Vue({
    el: '#app',
    data: {
        requests: []
    },
    mounted(){
        const ref = firebase.firestore().collection('requests');
        let requests = [];
        ref.onSnapshot(snapshot => {
            
            snapshot.docChanges().forEach(change => {
                if(change.type === 'added'){
                    requests.push({...change.doc.data(), id: change.doc.id});
                }else if(change.type === 'removed'){
                    requests = requests.filter(doc => doc.id != change.doc.id);
                }
                this.requests = requests;       
            });
        });
    }
  })



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