let users=[], posts=[], currentUser=null, currentRole=null;

function showLogin(role){
  document.getElementById("login-form").style.display="block";
  document.getElementById("register-form").style.display="none";
  document.querySelector(".auth-buttons").style.display="none";
  document.getElementById("login-title").innerText=`Login as ${role}`;
  currentRole=role;
}
function showRegister(){
  document.getElementById("register-form").style.display="block";
  document.querySelector(".auth-buttons").style.display="none";
}
function backToMain(){
  document.getElementById("login-form").style.display="none";
  document.getElementById("register-form").style.display="none";
  document.querySelector(".auth-buttons").style.display="block";
}

function register(){
  const name=document.getElementById("reg-name").value.trim();
  const email=document.getElementById("reg-email").value.trim().toLowerCase();
  const password=document.getElementById("reg-password").value.trim();
  const profileInput=document.getElementById("reg-profile");
  if(!name||!email||!password)return alert("Fill all fields.");
  if(users.find(u=>u.email===email))return alert("Email exists.");
  let profileURL="https://i.pravatar.cc/150";
  if(profileInput.files[0]) profileURL=URL.createObjectURL(profileInput.files[0]);
  users.push({name,email,password,profile:profileURL});
  alert("Registered! Please login.");
  backToMain();
}

function login(){
  const email=document.getElementById("login-email").value.trim().toLowerCase();
  const password=document.getElementById("login-password").value.trim();

  if(currentRole==="admin"){
    const adminEmail="admin@frenziee.com";
    const adminPassword="admin123";
    if(email===adminEmail && password===adminPassword){
      currentUser={name:"Admin",profile:"https://i.pravatar.cc/150?img=5"};
      showAdminDashboard(); return;
    } else return alert("Invalid admin credentials!\nEmail: admin@frenziee.com\nPassword: admin123");
  }

  const user=users.find(u=>u.email===email && u.password===password);
  if(!user) return alert("Invalid credentials!");
  currentUser=user;
  showUserDashboard();
}

function logout(){
  currentUser=null; currentRole=null;
  document.getElementById("auth-container").style.display="block";
  document.getElementById("user-dashboard").style.display="none";
  document.getElementById("admin-dashboard").style.display="none";
}

function showUserDashboard(){
  document.getElementById("auth-container").style.display="none";
  document.getElementById("user-dashboard").style.display="block";
  document.getElementById("profile-name").innerText=currentUser.name;
  showSection("feed"); loadFeed(); loadStories();
}

function showAdminDashboard(){
  document.getElementById("auth-container").style.display="none";
  document.getElementById("admin-dashboard").style.display="block";
  loadAdminFeed();
}

function loadStories(){
  const sb=document.getElementById("story-bar"); sb.innerHTML="";
  users.forEach(u=>{
    const d=document.createElement("div"); d.className="story";
    d.innerHTML=`<img src="${u.profile}" alt="${u.name}"><span>${u.name.split(" ")[0]}</span>`;
    sb.appendChild(d);
  });
}

function createPost(){
  const content=document.getElementById("post-content").value.trim();
  const mediaInput=document.getElementById("post-media");
  let mediaURL="";
  if(mediaInput.files[0]) mediaURL=URL.createObjectURL(mediaInput.files[0]);
  if(!content && !mediaURL) return alert("Add text or media.");
  posts.push({id:Date.now(), user:currentUser.name, profile:currentUser.profile, content, media:mediaURL, likes:0, comments:[]});
  document.getElementById("post-content").value="";
  mediaInput.value="";
  showSection("feed"); loadFeed();
}

function loadFeed(){
  const f=document.getElementById("feed"); f.innerHTML="";
  posts.slice().reverse().forEach(p=>{
    const d=document.createElement("div"); d.className="post";
    d.innerHTML=`<div class="post-header"><img src="${p.profile}" alt="${p.user}"><span class="post-user">@${p.user}</span></div>
    <p>${p.content}</p>
    ${p.media?`<img src="${p.media}" alt="post">`:""}
    <div class="post-actions">
      <button onclick="likePost(${p.id})">❤️ ${p.likes}</button>
      <button onclick="toggleCommentBox(${p.id})">💬 ${p.comments.length}</button>
    </div>
    <div class="comment-section" id="comment-box-${p.id}" style="display:none;">
      ${p.comments.map(c=>`<div class="comment"><b>${c.user}:</b> ${c.text}</div>`).join("")}
      <div class="comment-input">
        <input type="text" id="comment-input-${p.id}" placeholder="Add comment">
        <button onclick="addComment(${p.id})">Post</button>
      </div>
    </div>`;
    f.appendChild(d);
  });
}

function likePost(id){const p=posts.find(p=>p.id===id);p.likes++;loadFeed();}
function toggleCommentBox(id){const b=document.getElementById(`comment-box-${id}`);b.style.display=b.style.display==="none"?"flex":"none";}
function addComment(id){const i=document.getElementById(`comment-input-${id}`);const t=i.value.trim();if(!t)return;const p=posts.find(p=>p.id===id);p.comments.push({user:currentUser.name,text:t});loadFeed();}

function loadAdminFeed(){
  const f=document.getElementById("admin-feed"); f.innerHTML="";
  posts.slice().reverse().forEach(p=>{
    const d=document.createElement("div"); d.className="post";
    d.innerHTML=`<div class="post-header"><img src="${p.profile}" alt="${p.user}"><span class="post-user">@${p.user}</span>
    <button class="delete-btn" onclick="deletePost(${p.id})">🗑 Delete Post</button></div>
    <p>${p.content}</p>
    ${p.media?`<img src="${p.media}" alt="post">`:""}
    <div class="comment-section">
      ${p.comments.map((c,i)=>`<div class='comment'><b>${c.user}:</b> ${c.text} <button class='delete-btn' onclick="deleteComment(${p.id},${i})">x</button></div>`).join("")}
    </div>`;
    f.appendChild(d);
  });
}

function deletePost(id){posts=posts.filter(p=>p.id!==id);loadAdminFeed();}
function deleteComment(pid,i){const p=posts.find(p=>p.id===pid);p.comments.splice(i,1);loadAdminFeed();}

function showSection(sec){
  document.getElementById("feed").style.display="none";
  document.getElementById("create-post").style.display="none";
  document.getElementById("profile").style.display="none";
  document.getElementById(sec).style.display="block";
  if(sec==="feed")loadFeed();
  if(sec==="profile")loadProfile();
}

function loadProfile(){
  const mp=document.getElementById("my-posts");
  const myPosts=posts.filter(p=>p.user===currentUser.name);
  mp.innerHTML=myPosts.length?myPosts.map(p=>`<div class="post"><p>${p.content}</p>${p.media?`<img src="${p.media}" alt="post">`:""}</div>`).join(""):"<p>No posts yet.</p>";
}