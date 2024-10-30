//declaration de variables
const sendPublic = document.querySelector('#sendPublic');
const messagesPublic = document.getElementById("messagesPublic");
const socket = io();
const query = window.location.search;
const urlParams = new URLSearchParams(query);
const pseudo = urlParams.get("pseudo");
console.log(pseudo);
const pwd = urlParams.get("pwd");
console.log(pwd);

// Affichage des utilisateurs connectés
const usersList = document.getElementById("userList");

socket.on("updateUserList", (users) => {
    usersList.innerHTML = ""; // Effacer la liste actuelle
    users.forEach(user => {
        const userElement = document.createElement("p");
        userElement.innerHTML = `${user.pseudo}`;
        userElement.onclick = () => displayMessagePopup(user.id); // Afficher le popup pour ce user
        usersList.appendChild(userElement);
    });
});

//declaration de fonction
const displayMessage = (data) => {
  messagesPublic.innerHTML += `<div class="newMessage">
        <h2>${data.pseudo}</h2>
        <p class="content">${data.messageContent}</p>
        <p class="date">${data.date}</p>
    </div>`
};

tinymce.init({
  selector: '#textPublic',
  plugins: [
    'advlist','autolink',
    'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
    'fullscreen','insertdatetime','media','table','help','wordcount'
  ],
  toolbar: 'undo redo | formatpainter casechange blocks | bold italic backcolor | ' +
    'alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist checklist outdent indent | removeformat | a11ycheck code table help'
});
//Initialisation
  socket.on("init",(data)=>{
    console.dir(data);
    socket.emit("sendLog",{
      pseudo:pseudo,
      pwd:pwd
    });
  });

sendPublic.addEventListener("click", () => {
  let messageContent = tinyMCE.get("textPublic").getContent();
  let date = new Date();//UTC ou https://momentjs.com/

  //envoie du message au server
  const data = { pseudo: pseudo, messageContent: messageContent, date: date };
  socket.emit("publicMessage", data);
  displayMessage(data);
});

socket.on("publicMessageGlobal", (data) => {
  console.dir(data);
  displayMessage(data);
});


socket.on("receivePrivateMessage", ({ senderId, message }) => {
  displayPrivateMessagePopup(senderId, message); // Call function to show popup
});

// Display private message popup
function displayPrivateMessagePopup(senderId, message) {
  const popup = document.createElement("div");
  popup.className = "popup-message"; 
  popup.innerHTML = `<strong>${senderId}:</strong> ${message}`;
  document.body.appendChild(popup);
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 5000);
}


function displayMessagePopup(recipientId) {
  tinymce.init({
    selector: "#textPrivatePopup",
    setup: (editor) => {
      editor.on("init", () => {
        document.getElementById("sendPrivatePopup").onclick = () => {
          const message = editor.getContent();
          if (message.trim()) {
            socket.emit("privateMessage", { recipientId: userId, message });
            editor.setContent("New message");
          }
        };
      });
    },
  });

  // Afficher le popup
  document.getElementById("popup").style.display = "block";
}
socket.on("receivePrivateMessage", ({ senderId, message }) => {
  alert(`Message privé de ${senderId}: ${message}`);
});

//pour masquer le popup
document.getElementById("sendPrivatePopup").onclick = () => {
  document.getElementById("popup").style.display = "none"; // Masquer le popup
};

/*socket.on("receivePrivateMessage", ({ senderId, message }) => {
  

  // Optionnel : ajoute un délai avant de fermer le popup ou un bouton pour le fermer
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 5000);
});*/
