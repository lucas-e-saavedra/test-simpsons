const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 5000, function () {
    console.log('Example app listening on port:'+process.env.PORT || 5000);
});

var sesionDeTokBox = "";

//https://test-tokbox-assistcard.herokuapp.com/
app.get('/', function (req, res) {
    res.send('Hello World!');
});

var allSimpsons = JSON.parse(fs.readFileSync('simpsons.json', 'utf8'));

//http://test-tokbox-assistcard.herokuapp.com/simpsons
//http://localhost:5000/simpsons
app.get('/simpsons', function (req, res) {
    if(req.query.id>0){
        const index = allSimpsons.findIndex(object => {
            return object.id == req.query.id;
          });
        
        res.send(allSimpsons[index]);
    }else{
        let listOfAll = allSimpsons.map(elem => (
            {
                id: elem.id,
                name: elem.name,
                lastname: elem.lastname
            } 
          ));
        res.send(listOfAll);
    }    
});

var salaDeEspera = {};

app.post('/Api/Turn/CheckStatus',function (req, res) {
    if(salaDeEspera[req.body.Parameters.TurnToken] == undefined){
    } 
    var json = '{"Hola": "Mundo"}';
    res.send(json);
});