import { server, apis, getData } from "./tools/apis.js";

 // password visibility toggle
  const pwInput = document.getElementById('password');
  const toggleVis = document.getElementById('toggleVis');
  const eyeIcon = document.getElementById('eyeIcon');
 const nameInput=document.getElementById('email');
  toggleVis.addEventListener('click', () => {
    const isPassword = pwInput.type === 'password';
    pwInput.type = isPassword ? 'text' : 'password';
    toggleVis.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    eyeIcon.innerHTML = isPassword
      ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a21.4 21.4 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
      : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
  });

  // ripple + submit -> forwards to dashboard (placeholder until real auth is wired up)
  const form = document.getElementById('loginForm');
  const btn = document.getElementById('signInBtn');

  btn.addEventListener('click', (e) => {
   /** */ const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  form.addEventListener('submit',async (e) => {
    e.preventDefault();
    const password=pwInput.value
    const name=nameInput.value

    // was missing entirely — an empty submit went straight to the API call
    if (!name.trim() || !password.trim()){
      alert('Enter both an email and a password.');
      return;
    }

    try{
      
    const login=await getData(`${server}${apis.check_user}`,{
      'name':name,
      'password':password
    })
     console.log(login)
    // login.accept — getData() already unwraps the response's .data, so
    // this reads the actual JSON body from checkUser(). The old code called
    // axios.post() directly and checked `login.accept` on the raw Axios
    // response object (which has no such property, always undefined/falsy),
    // so a correct login could never succeed by this check either way.
    if(login && login.accept){
      window.location.href = 'dashboard.html';
    }
    else{
      alert('Wrong Email or Password ')
      console.log(login)
      
    }
  }
    catch(error){
      console.log(error)
    }
   
  });