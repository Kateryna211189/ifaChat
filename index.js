const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
const io = require('socket.io')(server)


// 172.20.65.147


const ip = "127.0.0.1";
const port = 4000;

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})
//un tableau pour suivre mes utilisateurs actifs
let users = [];

//connection des utilisateurs
io.on("connection", (socket) => {
    // socket.emit("init", { message: "bienvenue chers clients du chat" 
    console.log(`Utilisateur connecté: ${socket.id}`);

    //attende de l'emit sendLog
    socket.on("sendLog", (data) => {
        //console.log(socket.id);
        //securisation par authentificator...
        data.id = socket.id;
        users.push(data);
        //mise à jour de la liste des utilisateurs 
        io.emit("updateUserList", users);
        // console.dir(users);
    });
    //gestion des messages public
    socket.on("publicMessage", (data) => {
        data.id = socket.id;
        publicMessages.push(data);
        //console.dir(publicMessages);
        socket.broadcast.emit("publicMessageGlobal", data);
    });
    //gestion des messages private
    socket.on('privateMessage', ({ recipientId, message }) => {
        if (recipientId && message) {
            io.to(recipientId).emit("receivePrivateMessage", {
                senderId: socket.id,
                message,
            });
        }
    });
    
    //disconnect de utilisateur
    
    socket.on("disconnect", () => {
        console.log("Utilisateur déconnecté: ${socket.id}");
        users = users.filter((user) => user.id !== socket.id);
        io.emit("updateUserList", users);
        //socket.id
        //let indexDisconnect;
        /* users.forEach((user, index) => {
             if (user.id === socket.id) {
                 //indexDisconnect = index;
                 users.splice(index, 1);//pour supprimé user deconnecté*/
    });
        });
        //splice sert à supprimer une entrée de tableau à
        //partir de son index (indexDisconnect)

        //users.splice(indexDisconnect, 1);
        //console.dir(users);
        
//demarre le serveur
server.listen(port, ip, () => {
    //console.log("Demarré sur http://" + ip + ":" + port);
console.log(`Démarré sur http://${ip}:${port}`);
});




