var config = {
  apiKey: "AIzaSyDllLSVeNNJaGX2WP5xr79aG9Sg_8cAI4c",
  authDomain: "localmon-6d53a.firebaseapp.com",
  databaseURL: "https://localmon-6d53a.firebaseio.com",
  projectId: "localmon-6d53a",
  storageBucket: "localmon-6d53a.appspot.com",
  messagingSenderId: "767627102257"
};
firebase.initializeApp(config);

load();
document.querySelector("#resetAccount").addEventListener("click",function() {
  localStorage.clear();
  load();
});
function load() {
  //Generation d'ID
  if(localStorage.getItem("ID") == null) {
    localStorage.setItem("ID", guid());
    localStorage.setItem("euro", 100);
    let userData = {
      userid: localStorage.getItem("ID"),
      solde: localStorage.getItem("euro")
    };
  
    let newUserKey = firebase.database().ref().child('userID').push().key; 
    var updates = {};
    updates['/users/' + newUserKey] = userData;
    firebase.database().ref().update(updates);
    console.log("nouveau user");
  }

  let homeMenu = document.querySelector("#home");
  homeMenu.addEventListener("click",function(){
    loadHome();
    document.querySelector(".demo-drawer").classList.remove("is-visible");
    document.querySelector(".mdl-layout__obfuscator").classList.remove("is-visible");
    
  });
  let sendMenu = document.querySelector("#sendMenu");
  sendMenu.addEventListener("click",function(){
    loadSend();
    document.querySelector(".demo-drawer").classList.remove("is-visible");
    document.querySelector(".mdl-layout__obfuscator").classList.remove("is-visible");
  });
  let receiveMenu = document.querySelector("#receiveMenu");
  receiveMenu.addEventListener("click",function(){
    loadReceive();
    document.querySelector(".demo-drawer").classList.remove("is-visible");
    document.querySelector(".mdl-layout__obfuscator").classList.remove("is-visible");
  });
  loadHome ();
  
}

function loadHome () {
  clear();
  let main = document.querySelector("main");
  let title = document.createElement("h2");
  title.id ="homeTitle";
  title.textContent = "Votre solde actuel de Campos: ";
  main.appendChild(title);

  let soldeValue = document.createElement("h3");
  soldeValue.id ="soldeValue";

  var usersRef = firebase.database().ref('users');
  usersRef.on('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        if(childData.userid === localStorage.getItem("ID")) {       
          soldeValue.textContent = childData.solde;
          main.appendChild(soldeValue);
        }
      });
  });
}

function loadReceive() {
  clear();
  let main = document.querySelector("main");
  let userID = document.createElement("h2");
  userID.id = "userID";
  userID.textContent = "Mon identifiant: " + localStorage.getItem("ID");
  main.appendChild(userID);

  let inputAmount = document.createElement("input");
  inputAmount.setAttribute("type","number");
  inputAmount.setAttribute("placeholder","Type Amount");
  inputAmount.setAttribute("step","10");
  inputAmount.id = "amountPrice";
  main.appendChild(inputAmount);
  let generateCode = document.createElement("button");
  generateCode.textContent = "Generate";
  main.appendChild(generateCode);
  generateCode.addEventListener("click", function() {
    makeCode();
  });

  let qrcode = document.createElement("div");
  qrcode.id = "qrcode";
  main.appendChild(qrcode);
  

  
  function makeCode () {
    let qrcode = new QRCode(document.querySelector("#qrcode"), {
      width : 100,
      height : 100
    });
    let inputAmount = document.querySelector("#amountPrice");
    
    if (!inputAmount.value) {
      alert("Input an amount");
      inputAmount.focus();
      return;
    }
    qrcode.makeCode(localStorage.getItem("ID") + "|"+ inputAmount.value);
  }
}

function loadSend() {
  clear();
  let main = document.querySelector("main");
  let title = document.createElement("h2");
  title.textContent = "Scan the receiver transaction QRCode";
  main.appendChild(title);
  let changeButtonArea = document.createElement("div");
  changeButtonArea.id = "changeButtonArea";

  let switchCamLabel = document.createElement("label");
  switchCamLabel.setAttribute("for","switchCam");
  switchCamLabel.className = "mdl-switch mdl-js-switch mdl-js-ripple-effect";

  let switchCamInput = document.createElement("input");
  switchCamInput.id = "switchCam";
  switchCamInput.setAttribute("type","checkbox");
  switchCamInput.className = "mdl-switch__input";
  switchCamInput.checked = "false";
  
  switchCamLabel.appendChild(switchCamInput);

  let switchCamSpan = document.createElement("span");
  switchCamSpan.className ="mdl-switch__label";
  switchCamSpan.textContent = "Change Cam";
  switchCamLabel.appendChild(switchCamSpan);

  changeButtonArea.appendChild(switchCamLabel);
  main.appendChild(changeButtonArea);
  changeButtonArea.style.display ="none";

  let validationArea = document.createElement("div");
  validationArea.id = "validationArea";
  main.appendChild(validationArea);
  validationArea.style.display = "none";

  let videoPreview = document.createElement("video");
  videoPreview.id="preview";
  main.appendChild(videoPreview);
  InstaScan();

}

function loadValidationArea(content){
  let result = content.split('|');
  if (result == content) return;
  let validationArea = document.querySelector("#validationArea");
  validationArea.innerHTML = "";
  validationArea.style.display = "block";
  let receiverSpan = document.createElement("span");
  receiverSpan.id = "receiverID";
  receiverSpan.textContent = result[0];
  validationArea.appendChild(receiverSpan);
  let amount = document.createElement("span");
  amount.id = "amountSpan";
  amount.textContent = result[1];
  validationArea.appendChild(amount);

  let validateButton = document.createElement("button");
  validateButton.className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored";
  validateButton.innerHTML = '<i class="material-icons">checked_icon</i>';
  validationArea.appendChild(validateButton);
  validateButton.addEventListener("click",function() {
    transaction(result[0],localStorage.getItem("ID"),result[1]);
  });
  let cancelButton = document.createElement("button");
  cancelButton.className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored";
  cancelButton.innerHTML = '<i class="material-icons">cancel_icon</i>';
  validationArea.appendChild(cancelButton);
  cancelButton.addEventListener("click",function() {
    validationArea.innerHTML="";
    validationArea.style.display = "none";
  });
}

function clear() {
  let element = document.querySelector("main");
  element.innerHTML ="";
}

function InstaScan () {
  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    loadValidationArea(content);
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    
    switch(cameras.length) {
      case 1:
        scanner.start(cameras[0]);
        break;
      case 2:
        scanner.start(cameras[1]);
        break;
      default:
        alert('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


function transaction(receiverID, senderID, amount){
  var updates = {};
  var usersRef = firebase.database().ref('users');
  usersRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        let actualKey = childSnapshot.key;
        if(childData.userid === receiverID) {
          let receiverData = {
            solde: childData.solde + amount,
            userid: receiverID
          };
          updates['/users/' + actualKey] = receiverData; 
        }
        if(childData.userid === senderID) {
          let senderData = {
            solde: childData.solde - amount,
            userid: senderID
          };
          updates['/users/' + actualKey] = senderData; 
        }
      });

      firebase.database().ref().update(updates);
      loadHome();
  });
}