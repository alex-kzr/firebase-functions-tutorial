const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');

 // toogle auth modals
 authSwitchLinks.forEach(link => {
     link.addEventListener('click', () => {
        authModals.forEach(modal => modal.classList.toggle('active'));
     });
 });