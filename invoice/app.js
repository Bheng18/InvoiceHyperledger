var Fabric_Client = require('fabric-client');
var path = require('path');
var util = require('util');

var fabric_client = new Fabric_Client();

var channel = fabric_client.newChannel('mychannel');
var peer = fabric_client.newPeer('grpc://localhost:7051');
channel.addPeer(peer);
var order = fabric_client.newOrderer('grpc://localhost:7050')
channel.addOrderer(order);

var store_path = path.join(__dirname, 'hfc-key-store');
console.log('Store path:'+store_path);
var tx_id = null;

const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors()); // to connect multiple localhost/server
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.all('/invoice', function(req, res){    

Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {

fabric_client.setStateStore(state_store);
var crypto_suite = Fabric_Client.newCryptoSuite();

var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
crypto_suite.setCryptoKeyStore(crypto_store);
fabric_client.setCryptoSuite(crypto_suite);

var username = req.body.username; //initialize for username validation
console.log(username);

return fabric_client.getUserContext(username, true);
}).then((user_from_store) => {
if (user_from_store && user_from_store.isEnrolled()) {
  var username = req.body.username;
  console.log("Successfully loaded "+ username+ " from persistence");
  member_user = user_from_store;
} else {
  var username = req.body.username;
  res.json(username + " is not registered on this network")
  throw new Error(username + " is not registered on this network");
}

tx_id = fabric_client.newTransactionID();
console.log("Assigning transaction_id: ", tx_id._transaction_id);

var request = {
  chaincodeId: 'invoice',
  chainId: 'mychannel',
  txId: tx_id
};

var newInvoice = []; //initialize array

// Invoice Id
var invoiceid = req.body.invoiceid;

// Invoice Attributes
var InvoiceNumber = req.body.invoicenumber;
var BilledTo = req.body.billedto;
var InvoiceDate = req.body.invoicedate;
var InvoiceAmount = req.body.invoiceamount;
var ItemDescription = req.body.itemdescription;
// var GR = req.body.gr;
// var IsPaid = req.body.ispaid;
 var PaidAmount = req.body.paidamount;
// var Repaid = req.body.repaid;
 var RepaymentAmount = req.body.repaymentamount;

newInvoice.push(invoiceid); //add the invoiceid into database network

if (req.method == "POST") //POST request
{
  if(username != "IBM"){ // check if valid IBM user
      // Add error response here
      res.json(username + "Error, invalid username IBM")
  }

  else{
    request.fcn='createInvoice';
    newInvoice.push(InvoiceNumber);
    newInvoice.push(BilledTo);
    newInvoice.push(InvoiceDate);
    newInvoice.push(InvoiceAmount); 
    newInvoice.push(ItemDescription);
  }
}
else if(req.method == "PUT") // update request method
{
    if(gr)    
    {
      var username = req.body.username;

      if(username != "IBM"){
        // Add error response here
        res.json(username + "Error, invalid username IBM put")
      }

      else{
        request.fcn= 'isGoodsReceived',
        newInvoice.push(gr);
      }
    }
    
    else if(PaidAmount)
    {
      var username = req.body.username;

      if(username != "UBP"){
        // Add error response here
        res.json(username + "Error, invalid username UBP")
      }

      else{
        request.fcn= 'isPaidToSupplier',
        newInvoice.push(PaidAmount);
      }
        
    }

    else if(RepaymentAmount)
    {
      var username = req.body.username;
        
      if(username != "Lotus"){
        // Add error response here
        res.json(username + "Error, invalid username Lotus")
      }

      else{
        request.fcn= 'isPaidToBank',
        newInvoice.push(RepaymentAmount);
      }
    }
}

request.args=newInvoice; //add all post data into array arguments
console.log(request);

// send the transaction proposal to the peers
return channel.sendTransactionProposal(request);
}).then((results) => {
var proposalResponses = results[0];
var proposal = results[1];
let isProposalGood = false;
if (proposalResponses && proposalResponses[0].response &&
proposalResponses[0].response.status === 200) {
isProposalGood = true;
console.log('Transaction proposal was good');
} else {
console.error('Transaction proposal was bad');
}
if (isProposalGood) {
console.log(util.format(
'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"',
proposalResponses[0].response.status, proposalResponses[0].response.message));

// build up the request for the orderer to have the transaction committed
var request = {
proposalResponses: proposalResponses,
proposal: proposal
};

// set the transaction listener and set a timeout of 30 sec
// if the transaction did not get committed within the timeout period,
// report a TIMEOUT status
var transaction_id_string = tx_id.getTransactionID(); //Get the transaction ID string to be used by the event processing
var promises = [];

var sendPromise = channel.sendTransaction(request);
promises.push(sendPromise); //we want the send transaction first, so that we know where to check status

// get an eventhub once the fabric client has a user assigned. The user
// is required bacause the event registration must be signed
let event_hub = channel.newChannelEventHub(peer);

// using resolve the promise so that result status may be processed
// under the then clause rather than having the catch clause process
// the status
let txPromise = new Promise((resolve, reject) => {
let handle = setTimeout(() => {
event_hub.unregisterTxEvent(transaction_id_string);
event_hub.disconnect();
resolve({event_status : 'TIMEOUT'}); //we could use reject(new Error('Trnasaction did not complete within 30 seconds'));
}, 3000);
event_hub.registerTxEvent(transaction_id_string, (tx, code) => {
// this is the callback for transaction event status
// first some clean up of event listener
clearTimeout(handle);

// now let the application know what happened
var return_status = {event_status : code, tx_id : transaction_id_string};
if (code !== 'VALID') {
console.error('The transaction was invalid, code = ' + code);
resolve(return_status); // we could use reject(new Error('Problem with the tranaction, event status ::'+code));
} else {
console.log('The transaction has been committed on peer ' + event_hub.getPeerAddr());
resolve(return_status);
}
}, (err) => {
//this is the callback if something goes wrong with the event registration or processing
reject(new Error('There was a problem with the eventhub ::'+err));
},
{disconnect: true} //disconnect when complete
);
event_hub.connect();

});
promises.push(txPromise);

return Promise.all(promises);
} else {
  //incorrect User Input
  res.json({"status": "604"})
  res.json("Incorrect User input")
console.error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...');
}
}).then((results) => {
console.log('Send transaction promise and event listener promise have completed');
// check the results in the order the promises were added to the promise all list
if (results && results[0] && results[0].status === 'SUCCESS') {
console.log('Successfully sent transaction to the orderer.');
} else {
console.error('Failed to order the transaction. Error code: ' + results[0].status);
}

if(results && results[1] && results[1].event_status === 'VALID') {
console.log('Successfully committed the change to the ledger by the peer');
                res.json({'result': 'success'});
} else {
console.log('Transaction failed to be committed to the ledger due to ::'+results[1].event_status);
}
}).catch((err) => {
console.error('Failed to invoke successfully :: ' + err);
});


})

app.get('/', function (req, res) {

// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
Fabric_Client.newDefaultKeyValueStore({ path: store_path
}).then((state_store) => {
// assign the store to the fabric client
fabric_client.setStateStore(state_store);
var crypto_suite = Fabric_Client.newCryptoSuite();
// use the same location for the state store (where the users' certificate are kept)
// and the crypto store (where the users' keys are kept)
var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
crypto_suite.setCryptoKeyStore(crypto_store);
fabric_client.setCryptoSuite(crypto_suite);

var username = req.body.username;
console.log(username);

// get the enrolled user from persistence, this user will sign all requests
return fabric_client.getUserContext(username, true);
}).then((user_from_store) => {
if (user_from_store && user_from_store.isEnrolled()) {
  var username = req.body.username;
  console.log("Successfully loaded "+ username+ " from persistence");
  member_user = user_from_store;
} else {
  var username = req.body.username;
  res.json(username + " is not registered on this network")
  throw new Error(username + " is not registered on this network");
}

// queryInvoice chaincode function - requires 1 argument, ex: args: ['Invoice4'],
// queryAllInvoices chaincode function - requires no arguments , ex: args: [''],
const request = {
//targets : --- letting this default to the peers assigned to the channel
chaincodeId: 'invoice',
fcn: 'queryAllInvoices',
args: ['']
};

var ar = [];
var invoiceid = req.query.invoiceid;

if (invoiceid)
{
  ar.push(invoiceid);
  request.fcn='getAuditHistoryForInvoice';
  request.args = ar;
}

// send the query proposal to the peer
return channel.queryByChaincode(request);
}).then((query_responses) => {
console.log("Query has completed, checking results");
// query_responses could have more than one  results if there multiple peers were used as targets
if (query_responses && query_responses.length == 1) {
if (query_responses[0] instanceof Error) {
console.error("error from query = ", query_responses[0]);
} else {
console.log("Response is ", query_responses[0].toString());
                        res.send(query_responses[0].toString());
}
} else {
console.log("No payloads were returned from query");
}
}).catch((err) => {
  res.json("Username input is required");
console.error('Failed to query successfully :: ' + err);
});
})

//const block = channel.queryInfo(peer,false);
//console.log("height:"+block.height);
app.get('/block', function (req, res) {

  // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
  Fabric_Client.newDefaultKeyValueStore({ path: store_path
  }).then((state_store) => {
  // assign the store to the fabric client
  fabric_client.setStateStore(state_store);
  var crypto_suite = Fabric_Client.newCryptoSuite();
  // use the same location for the state store (where the users' certificate are kept)
  // and the crypto store (where the users' keys are kept)
  var crypto_store = Fabric_Client.newCryptoKeyStore({path: store_path});
  crypto_suite.setCryptoKeyStore(crypto_store);
  fabric_client.setCryptoSuite(crypto_suite);
  
  // get the enrolled user from persistence, this user will sign all requests
  return fabric_client.getUserContext('user1', true);
  }).then((user_from_store) => {
  if (user_from_store && user_from_store.isEnrolled()) {
  console.log('Successfully loaded user1 from persistence');
  member_user = user_from_store;
  } else {
  throw new Error('Failed to get user1.... run registerUser.js');
  }
  
  return channel.queryInfo(peer,false);
  }).then((blockInfo) => {
    console.log("height:"+blockInfo.height);

    return channel.queryBlock((blockInfo.height-1 ),peer,false);
  }).then((block) => {
    let payload = block.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[0].rwset.writes[0];
    res.send(payload);      
  });
  
  });

  function unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, 
           function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
           });
 }
  


  
  