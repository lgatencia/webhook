'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const mysql = require ('mysql'); 							
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  
   function connectToDatabase(){
    const connection = mysql.createConnection({
      host     : '213.190.6.11',
      user     : 'u889550350_LuisGomez',
      password : '456123luiS@',
      database : 'u889550350_Roboton'
    });
    return new Promise((resolve,reject) => {
       connection.connect();
       resolve(connection);
    });
     
  }
  function queryDatabase(connection){
    return new Promise((resolve, reject) => {
      connection.query('SELECT * from Clientes', (error, results, fields) => {
        resolve(results);
      });
    });
  }
  function insertIntoDatabase(connection, data){
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Clientes SET ?', data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
  function insertIntoMaquila(connection, data){
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Maquila SET ?', data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
  function insertIntoImportaciones(connection, data){
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Importaciones SET ?', data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
  function insertIntoSanitizacion(connection, data){
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Sanitizacion SET ?', data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
  function insertIntoFacturacion(connection, data){
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Facturacion SET ?', data, (error, results, fields) => {
        resolve(results);
      });
    });
  }
    function handleWritedatosPersonales(agent){
    const data = {
      Nombre: agent.parameters.nombre +" "+ agent.parameters.ApellidoP +" "+ agent.parameters.ApellidoM,
      Codigo_postal: agent.parameters.Cp,
      Correo: agent.parameters.email
    };
    return connectToDatabase()
    .then(connection => {
      return insertIntoDatabase(connection, data)
      .then(result => {       
        connection.end();
      });
    });
  }
  function handleWriteMaquila(agent){
    const data = {
      producto: agent.parameters.ProdMaq,
      cantidad: agent.parameters.CantM,
      nombre_cliente: agent.parameters.nombre +" "+ agent.parameters.ApellidoP +" "+ agent.parameters.ApellidoM,
      correo_cliente: agent.parameters.email
    };
    return connectToDatabase()
    .then(connection => {
      return insertIntoMaquila(connection, data)
      .then(result => {       
        connection.end();
      });
    });
  }
  function handleWriteImportaciones(agent){
    const data = {
      producto: agent.parameters.prodImp,
      cantidad: agent.parameters.cantImp,
      nombre_cliente: agent.parameters.nombre,
      correo_cliente: agent.parameters.email
    };
    return connectToDatabase()
    .then(connection => {
      return insertIntoImportaciones(connection, data)
      .then(result => {       
        connection.end();
      });
    });
  }
  function handleWriteSanitizacion(agent){
    const data = {
      tamaño_superficie: agent.parameters.superficieS,
      tipo_superfice: agent.parameters.tipoS,
      nombre_cliente: agent.parameters.nombre,
      correo_cliente: agent.parameters.email
    };
    return connectToDatabase()
    .then(connection => {
      return insertIntoSanitizacion(connection, data)
      .then(result => {       
        connection.end();
      });
    });
  }
  function handleWriteFacturacion(agent){
    const data = {
      ticket: agent.parameters.ticket,
      razon_social: agent.parameters.razonSoc,
      rfc:agent.parameters.RFC,
      forma_de_pago:agent.parameters.FormaPago,
      uso_de_factura:agent.parameters.UsoFact,
      correo:agent.parameters.email,
      nombre_cliente: agent.parameters.nombre,
    };
    return connectToDatabase()
    .then(connection => {
      return insertIntoImportaciones(connection, data)
      .then(result => {       
        connection.end();
      });
    });
  }
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('datosPersonales', handleWritedatosPersonales);
  intentMap.set('Opc3_Servicios_Opc2', handleWriteMaquila);
  intentMap.set('Opc3_Servicios_Opc3', handleWriteImportaciones);
  intentMap.set('Opc3_Servicios_Opc1', handleWriteFacturacion);
  agent.handleRequest(intentMap);
});
