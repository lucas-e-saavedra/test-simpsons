const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');


//TOKBOX
var apiKey = "46256142";
var apiSecret = "e34ceb15c0eca4af5bfc5e1b75f374dc913ab744";
var OpenTok = require('opentok'),
opentok = new OpenTok(apiKey, apiSecret);
var sesionDeTokBox = "";


app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
  );
  
app.listen(process.env.PORT || 5000, function () {
    console.log('Example app listening on port:'+process.env.PORT || 5000);
});


//https://test-tokbox-assistcard.herokuapp.com/
app.get('/', function (req, res) {
    res.send('Esto es para usar con fines didacticos');
});

var allSimpsons = JSON.parse(fs.readFileSync('simpsons.json', 'utf8'));

app.get('/characters', function (req, res) {
    let responseData = null;
    if(req.query.id>0){
        const index = allSimpsons.findIndex(object => {
            return object.id == req.query.id;
          });
          responseData = allSimpsons[index];
    }else{
        responseData = allSimpsons.map(elem => (
            {
                id: elem.id,
                name: elem.name,
                lastname: elem.lastname
            } 
          ));
    }
    let response = new Response(responseData, responseData!=null, responseData!=null ?"Estos son los resultados" :"No hay resultados");
    res.send(response);
});

app.post('/characters', function (req, res) {
    let newSimpson = Simpson.fromObject(req.body);
    const maxId = allSimpsons.reduce(function(prev, current) {
        return (prev.id > current.id) ? prev : current
    }).id;
    newSimpson.id = maxId+1;
    allSimpsons.push(newSimpson);
    let response = new Response(newSimpson, true, "Se ha agregado correctamente");
    res.send(response);
});

app.post('/resetcharacterslist', function (req, res) {
    allSimpsons = JSON.parse(fs.readFileSync('simpsons.json', 'utf8'));
    res.send('Se ha restablecido la lista original');
});

app.delete('/characters', function (req, res) {
    const index = allSimpsons.findIndex(object => {
        return object.id == req.query.id;
      });
    if(index!=-1)
        allSimpsons.splice(index, 1);
    
    res.send( new Response(null, index!=-1, index!=-1 
        ?"Se ha eliminado correctamente" :"No se ha podido eliminar"));    
});

app.put('/characters', function (req, res) {
    const index = allSimpsons.findIndex(object => {
        return object.id == req.query.id;
    });
    if (index!=-1) {
        let newSimpson = Simpson.fromObject(req.body);
        newSimpson.id = Number(req.query.id);
        allSimpsons[index] = newSimpson;        
    }
    res.send( new Response(null, index!=-1, index!=-1 
        ?"Se ha modificado correctamente" :"No se ha podido modificar"));
});

app.post('/videocall-session', function (req, res) {
    if(sesionDeTokBox.length==0){
        var sessionOptions = {mediaMode:"routed", archiveMode: "always"};
        opentok.createSession(sessionOptions, function(err, session){
            if(err){
                res.send("no se pudo crear la sesion");
            }else{
                sesionDeTokBox = session.sessionId;
                res.send(sesionDeTokBox);
            }
        });
    } else {
        res.send(sesionDeTokBox);
    }
});

app.delete('/videocall-session', function (req, res) {
    sesionDeTokBox = "";
    res.send("se finalizo la sesion de chat");
});

app.get('/videocall-session', function (req, res) {
    res.send(sesionDeTokBox);
});

app.get('/videocall-token', function (req, res) {
    var token = opentok.generateToken(sesionDeTokBox);
    res.send(token);
});



class Response {
    constructor(data, result, message) {
      this.data = data;
      this.result = result;
      this.message = message;
    }
  }

class Simpson {
    constructor(id, name, lastname, age, occupation, likes, photo, other) {
        this.id = isNaN(id) ?0 :id,
        this.name = name;
        this.lastname = lastname;
        this.age = isNaN(age) ?0 :age;
        this.occupation = occupation;
        this.likes = likes;
        this.photo = photo;
        this.other = other;
    }

    static fromObject(oneObject) {
        return new Simpson(oneObject.id, 
                                    oneObject.name,
                                    oneObject.lastname, 
                                    oneObject.age, 
                                    oneObject.occupation, oneObject.likes, oneObject.photo, oneObject.other);
    }
  }
