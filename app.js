const CLIENT_ID="903971648155-imqnkah7umenkkbq83iohgts4rgbik15.apps.googleusercontent.com";
const SCOPES="https://www.googleapis.com/auth/drive.file";
const {jsPDF}=window.jspdf;
let tokenClient=null,accessToken=null,images=[],calendarDate=new Date();
const $=id=>document.getElementById(id);

function localDateString(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function localTimeString(d=new Date()){return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`}
function getHistory(){try{return JSON.parse(localStorage.getItem("vehicleLoadingHistory")||"[]")}catch(e){return[]}}
function saveHistory(item){const h=getHistory();h.unshift(item);localStorage.setItem("vehicleLoadingHistory",JSON.stringify(h.slice(0,200)));renderHome()}

function showHome(){$("homeView").classList.remove("hidden");$("formView").classList.add("hidden");renderHome()}
function showForm(){$("homeView").classList.add("hidden");$("formView").classList.remove("hidden");$("date").value=localDateString();$("time").value=localTimeString();window.scrollTo({top:0,behavior:"smooth"})}

function renderHome(){
 const h=getHistory(),today=localDateString(),ym=today.slice(0,7);
 $("todayTotal").textContent=h.filter(x=>x.date===today).length;
 $("monthTotal").textContent=h.filter(x=>x.date?.startsWith(ym)).length;
 $("allTotal").textContent=h.length;
 const recent=h.slice(0,8);
 $("recentList").innerHTML=recent.length?recent.map(x=>`<div class="recent"><div class="recent-icon">🚚</div><div class="recent-main"><b>${escapeHtml(x.vehicle||"Vehicle")}</b><span>${escapeHtml(x.brand||"")} • ${escapeHtml(formatDate(x.date))} • ${escapeHtml(x.time||"")}</span></div></div>`).join(""):`<div class="empty-state">No loading records yet.<br>Create your first vehicle loading.</div>`;
 renderCalendar();
}
function renderCalendar(){
 const y=calendarDate.getFullYear(),m=calendarDate.getMonth();
 const names=["January","February","March","April","May","June","July","August","September","October","November","December"];
 $("monthTitle").textContent=`${names[m]} ${y}`;
 const start=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),counts={};
 getHistory().forEach(x=>{if(x.date)counts[x.date]=(counts[x.date]||0)+1});
 let out=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(x=>`<div class="day-name">${x}</div>`).join("");
 for(let i=0;i<start;i++)out+=`<div class="day empty"></div>`;
 for(let d=1;d<=days;d++){
   const ds=localDateString(new Date(y,m,d)),count=counts[ds]||0;
   out+=`<div class="day ${ds===localDateString()?"today ":""}${count?"has-data":""}" onclick="showDateRecords('${ds}')">
     ${d}${count?`<span class="dot"></span>`:""}
   </div>`;
 }
 $("calendar").innerHTML=out;
 showDateRecords(localDateString());
}
function showDateRecords(date){
 const records=getHistory().filter(x=>x.date===date);
 const title=`<h3 style="margin:0 0 8px">📅 ${formatDate(date)} — ${records.length} Loading${records.length===1?"":"s"}</h3>`;
 if(!records.length){
   $("dateRecords").innerHTML=title+`<div class="empty-state">No vehicle loading record for this date.</div>`;
   return;
 }
 $("dateRecords").innerHTML=title+records.map((x,i)=>`
   <div class="recent">
     <div class="recent-icon">🚚</div>
     <div class="recent-main">
       <b>${escapeHtml(x.vehicle||"Vehicle")} — ${escapeHtml(x.brand||"")}</b>
       <span>${escapeHtml(x.time||"")} • Start: ${escapeHtml(formatTime(x.firstPhotoAt))} • End: ${escapeHtml(formatTime(x.lastPhotoAt))}</span>
       ${x.driveLink?`<a href="${escapeHtml(x.driveLink)}" target="_blank" style="font-size:12px;color:#1457d9">Open PDF in Google Drive</a>`:""}
     </div>
   </div>
 `).join("");
}
function changeMonth(n){calendarDate.setMonth(calendarDate.getMonth()+n);renderCalendar()}
function formatDate(s){if(!s)return"";const p=s.split("-");return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:s}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

$("date").value=localDateString();$("time").value=localTimeString();
$("camera").addEventListener("change",e=>{
  [...e.target.files].forEach(file=>{
    const capturedAt=new Date().toISOString();
    const r=new FileReader();
    r.onload=ev=>{images.push({src:ev.target.result,remark:"",capturedAt});renderPhotos()};
    r.readAsDataURL(file);
  });
  e.target.value="";
});
function renderPhotos(){
  const box=$("photos");box.innerHTML="";
  images.forEach((item,i)=>{
    const d=document.createElement("div");d.className="photo";
    d.innerHTML=`
      <img src="${item.src}" alt="Photo ${i+1}">
      <button class="red" onclick="removePhoto(${i})" aria-label="Remove photo">×</button>
      <div class="photo-info">
        <div class="photo-line">LINE ${i+1} </div>
        <label style="margin:0 0 6px;font-size:13px">Remark for this photo <span style="color:#667085">(Optional)</span></label>
        <textarea class="photo-remark" placeholder="Optional: front side loading, pallet 1, seal number, left side..." oninput="updatePhotoRemark(${i},this.value)">${escapeHtml(item.remark||"")}</textarea>
        <div class="photo-time">Photo time: ${formatTime(item.capturedAt)}</div>
      </div>`;
    box.appendChild(d);
  });
  $("count").textContent=`${images.length} photo${images.length===1?"":"s"} added`;
  updatePhotoTiming();
}
function updatePhotoRemark(i,value){if(images[i])images[i].remark=value}
function removePhoto(i){images.splice(i,1);renderPhotos()}
function formatTime(iso){if(!iso)return "—";return new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function updatePhotoTiming(){
  $("photoTiming").textContent=images.length
    ? `First photo: ${formatTime(images[0].capturedAt)} | Last photo: ${formatTime(images[images.length-1].capturedAt)}`
    : "First photo: — | Last photo: —";
}
function status(msg,ok=false){const s=$("status");s.style.display="block";s.className="status "+(ok?"ok":"err");s.textContent=msg}
function validate(){
  const vehicle=$("vehicle").value.trim(),brand=$("brand").value.trim();
  if(!vehicle||!brand){status("Enter Vehicle Number and Brand.");return false}
  if(!images.length){status("Add at least one photo.");return false}
  return true;
}
function initGoogle(){if(!window.google?.accounts?.oauth2){setTimeout(initGoogle,300);return}tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:(resp)=>{if(resp.error){status("Google authorization failed: "+resp.error);return}accessToken=resp.access_token;uploadCurrentPDF()}})}
window.addEventListener("load",initGoogle);

async function buildPDF(){
  const vehicle=$("vehicle").value.trim(),brand=$("brand").value.trim();
  const date=$("date").value,time=$("time").value,remarks=$("remarks").value.trim();
  const pdf=new jsPDF("p","mm","a4"),W=210,H=297,m=8;

  pdf.setFont("helvetica","bold");pdf.setFontSize(20);
  pdf.text("VEHICLE LOADING",W/2,18,{align:"center"});
  pdf.setFont("helvetica","normal");pdf.setFontSize(10);
  pdf.text(`Brand: ${brand}`,m,30);pdf.text(`Vehicle No.: ${vehicle}`,m,37);
  pdf.text(`Date: ${date}`,m,44);pdf.text(`Loading Start: ${formatTime(images[0]?.capturedAt)}`,m,51);
  pdf.text(`Loading End: ${formatTime(images[images.length-1]?.capturedAt)}`,m,58);
  if(remarks)pdf.text(`Remarks: ${remarks}`,m,65);

  for(let i=0;i<images.length;i++){
    pdf.addPage();
    const item=images[i],im=await loadImg(item.src);
    const headerH=20,footerH=8,maxW=W-6,maxH=H-headerH-footerH;
    const scale=Math.min(maxW/im.naturalWidth,maxH/im.naturalHeight);
    const w=im.naturalWidth*scale,h=im.naturalHeight*scale;
    const x=(W-w)/2,y=headerH+(maxH-h)/2;
    pdf.setFont("helvetica","bold");pdf.setFontSize(11);pdf.text(`LINE ${i+1}`,3,8);
    pdf.setFont("helvetica","normal");pdf.setFontSize(8);
    pdf.text(`Photo Time: ${formatTime(item.capturedAt)}`,W-3,8,{align:"right"});
    pdf.addImage(item.src,"JPEG",x,y,w,h);
    const pr=(item.remark||"").trim();
    pdf.setFontSize(8);pdf.setFont("helvetica","bold");pdf.text(`Remark: ${pr}`,3,H-4,{maxWidth:W-6});
  }
  return {pdf,filename:`Vehicle Loading - ${safe(brand)} - ${safe(vehicle)} - ${date}.pdf`};
}
function safe(s){return s.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"")}
function loadImg(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
async function generateLocal(){if(!validate())return;const built=await buildPDF();built.pdf.save(built.filename);saveHistory({vehicle:$("vehicle").value.trim(),brand:$("brand").value.trim(),date:$("date").value,time:$("time").value,filename:built.filename,saved:"download",createdAt:new Date().toISOString()});status("PDF downloaded successfully.",true)}
async function generateAndUpload(){if(!validate())return;status("Preparing PDF...");try{window.currentPDF=await buildPDF();if(!tokenClient){status("Google sign-in is still loading. Wait a moment and try again.");return}if(accessToken)await uploadCurrentPDF();else tokenClient.requestAccessToken({prompt:"consent"})}catch(e){status("Could not create PDF: "+e.message)}}
async function uploadCurrentPDF(){
 try{status("Uploading PDF to Google Drive...");const{pdf,filename}=window.currentPDF,blob=pdf.output("blob"),form=new FormData(),metadata={name:filename,mimeType:"application/pdf"};
 form.append("metadata",new Blob([JSON.stringify(metadata)],{type:"application/json"}));form.append("file",blob,filename);
 const res=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",{method:"POST",headers:{Authorization:"Bearer "+accessToken},body:form}),data=await res.json();
 if(!res.ok){if(data.error?.status==="UNAUTHENTICATED"||data.error?.code===401){accessToken=null;status("Google authorization expired. Tap the button again.");return}throw new Error(data.error?.message||"Google Drive upload failed")}
 saveHistory({vehicle:$("vehicle").value.trim(),brand:$("brand").value.trim(),date:$("date").value,time:$("time").value,filename:data.name||filename,driveId:data.id||"",driveLink:data.webViewLink||"",saved:"drive",createdAt:new Date().toISOString()});
 status(`✅ SAVED TO GOOGLE DRIVE\n${data.name}\n\nYou can now find it in Google Drive → Recent.`,true)
 }catch(e){status("Upload failed: "+e.message)}
}
function clearAll(){images=[];renderPhotos();$("vehicle").value="";$("brand").value="";$("remarks").value="";$("date").value=localDateString();$("time").value=localTimeString();$("status").style.display="none"}
if("serviceWorker"in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(err=>console.error(err))})}
renderHome();
