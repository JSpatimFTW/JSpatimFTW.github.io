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
    let userData = {
      userid: localStorage.getItem("ID"),
      solde: 100
    };
  
    let newUserKey = firebase.database().ref().child('userID').push().key; 
    var updates = {};
    updates['/users/' + newUserKey] = userData;
    firebase.database().ref().update(updates);
    console.log("nouveau user");
  }

  let homeMenu = document.querySelector("#homeMenu");
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

  let userIDMenu = document.querySelector("#userIDMenu");
  userIDMenu.textContent = "Bonjour, user : " + localStorage.getItem("ID").substring(0,5);
  loadHome ();
}

function loadHome () {
  clear();
  let main = document.querySelector("main");
  let homeTitle = document.createElement("h2");
  homeTitle.id ="homeTitle";
  homeTitle.classList.add("mainTitle");
  homeTitle.textContent = "Votre solde actuel de SWAM: ";
  main.appendChild(homeTitle);

  let soldeValue = document.createElement("h3");
  soldeValue.id ="soldeValue";

  var usersRef = firebase.database().ref('users');
  usersRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childData = childSnapshot.val();
        if(childData.userid === localStorage.getItem("ID")) {       
          soldeValue.textContent = childData.solde;
          localStorage.setItem("solde", childData.solde);
          let imgToken = document.createElement("img");
          imgToken.src = "images/Token_SWAM.png";
          imgToken.style.width = "50px";
          main.appendChild(soldeValue);
          main.appendChild(imgToken);
        }
      });
  });
}

function loadReceive() {
  clear();
  let main = document.querySelector("main");
  let userID = document.createElement("h2");
  userID.id = "userIDTitle";
  userID.classList.add("mainTitle");
  userID.textContent = "Mon identifiant: " + localStorage.getItem("ID");
  main.appendChild(userID);

  let inputAmount = document.createElement("input");
  inputAmount.setAttribute("type","number");
  inputAmount.setAttribute("placeholder","Type Amount");
  inputAmount.setAttribute("step","10");
  inputAmount.id = "amountPrice";
  main.appendChild(inputAmount);
  let generateCode = document.createElement("button");
  generateCode.textContent = "Générer";
  generateCode.id ="generateButton";
  generateCode.className ="mdl-button mdl-js-button mdl-button--raised mdl-button--colored";
  main.appendChild(generateCode);
  generateCode.addEventListener("click", function() {
    if (parseInt(inputAmount.value) <= parseInt(localStorage.getItem("solde")) )
      makeCode();
    else {
      alert("montant trop élevé");
      loadReceive();
    }
  });

  let qrcode = document.createElement("div");
  qrcode.id = "qrcode";
  main.appendChild(qrcode);
  

  
  function makeCode () {
    let qrcodeItem = document.querySelector("#qrcode");
    qrcodeItem.innerHTML ="";
    let qrcode = new QRCode(qrcodeItem, {
      width : 200,
      height : 200
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
  title.textContent = "Scanner le QRCode de paiement";
  title.classList.add("mainTitle");
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
  receiverSpan.textContent = "ID du recepteur: " + result[0];
  validationArea.appendChild(receiverSpan);
  let amount = document.createElement("p");
  amount.id = "amountSpan";
  amount.textContent = "Montant de la transaction: " + result[1];
  validationArea.appendChild(amount);

  let validateButton = document.createElement("button");
  validateButton.className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored";
  validateButton.innerHTML = '<i class="material-icons">checked_icon</i>';
  validateButton.id = "validateButton";
  validationArea.appendChild(validateButton);
  validateButton.addEventListener("click",function() {
    transaction(result[0],localStorage.getItem("ID"),result[1]);
  });
  let cancelButton = document.createElement("button");
  cancelButton.className="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored";
  cancelButton.innerHTML = '<i class="material-icons">cancel_icon</i>';
  cancelButton.id= "cancelButton";
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
  return s4() + s4() + '-' + s4();
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
            solde: parseInt(childData.solde) + parseInt(amount),
            userid: receiverID
          };
          updates['/users/' + actualKey] = receiverData; 
        }
        if(childData.userid === senderID) {
          let senderData = {
            solde: parseInt(childData.solde) - parseInt(amount),
            userid: senderID
          };
          updates['/users/' + actualKey] = senderData; 
        }
      });

      firebase.database().ref().update(updates);
      loadHome();
  });
}