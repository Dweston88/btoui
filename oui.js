var braintree = require("braintree");
var util = require('util');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "pwkx7825ztndx57k",
  publicKey: "rv7g5c44hkr5kkg2",
  privateKey: "c7a0f4c90cad7ad6ad4b96bd70eef3b6"
});
gateway.config.timeout = 10000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', function (req, res) {
  res.send('Server Online!');
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.post('/api/transaction/refund', function (request, response) {
    var transaction = request.body;
    try {
      gateway.transaction.refund(transaction.ID, transaction.amount, function (err, result) {
        response.json(result);
      });
      } catch (ex) {
        response.json(ex);
      }
});
app.post('/api/transaction/void', function (request, response) {
    var transaction = request.body;
    try {
      gateway.transaction.void(transaction.ID, function (err, result) {
        response.json(result);
      });
    } catch (ex) {
      response.json(ex);
    }
});
app.post('/api/token', function (request, response) {
  try {
    gateway.clientToken.generate({}, function (err, res) {
      response.json({"client_token": res.clientToken});
    });
    } catch (ex) {
      response.json(ex);
    }
});
app.post('/api/customer/find', function (request, response) {
  var transaction = request.body;
  try {
    gateway.customer.find(transaction.ID, function(err, customer) {
      response.json({
        "err": err,
        "customer": customer
      });
    });
  } catch (ex) {
      response.json(ex);
  }
});
app.post('/api/card/find', function (request, response) {
  var transaction = request.body;
  try {
    gateway.paymentMethod.find(transaction.ID, function(err, customer) {
      response.json({
        "err": err,
        "customer": customer
      });
    });
  } catch (ex) {
    response.json(ex);
  }
});
app.post('/api/transaction/sale/newcustomer', function (request, response) {
  var transaction = request.body;
  try {
    if (transaction.NewCustomer){
      gateway.transaction.sale({
        amount: transaction.amount,
        paymentMethodNonce: transaction.payment_method_nonce,
        creditCard:{
          cardholderName: transaction.creditCard.cardholderName
        },
        customer: {
        // id: transaction.customer.id,
        firstName: transaction.customer.firstName,
        lastName: transaction.customer.lastName
      },
      customFields: {
        reservationid: transaction.ReservationID,
        guestoneid: transaction.GuestOneID,
        guesttwoid: transaction.GuestTwoID
      },
      billing: {
          firstName: transaction.billing.firstName,
          lastName: transaction.billing.lastName,
          streetAddress: transaction.billing.AddressOne,
          extendedAddress: transaction.billing.AddressTwo,
          locality: transaction.billing.locality,
          region: transaction.billing.region,
          postalCode: transaction.billing.postalCode,
          countryCodeAlpha2: transaction.billing.CountryAlpha2,
          countryCodeAlpha3: transaction.billing.CountryAlpha3
        },
        options: {
            storeInVaultOnSuccess: true,
            submitForSettlement: true
        }
      }, function (err, result) {
        if (err) throw err;
        response.json(result);
      });
    }else{
      gateway.transaction.sale({
        amount: transaction.amount,
        paymentMethodNonce: transaction.payment_method_nonce,
        customerId: transaction.customer.id,
        creditCard:{
          cardholderName: transaction.creditCard.cardholderName
        },
        customFields: {
          reservationid: transaction.ReservationID,
          guestoneid: transaction.GuestOneID,
          guesttwoid: transaction.GuestTwoID
        },
      options: {
          storeInVaultOnSuccess: true,
          submitForSettlement: true
        }
      }, function (err, result) {
        response.json(result);
      });
    }
  } catch (ex) {
    response.json(ex);
  }
});
app.post('/api/transaction/sale/existingcustomer', function (request, response) {
  var transaction = request.body;
  try {
    gateway.transaction.sale({
      amount: transaction.amount,
      paymentMethodToken: transaction.payment_method_token,
      customerId: transaction.customer.id,
      customFields: {
        reservationid: transaction.ReservationID,
        guestoneid: transaction.GuestOneID,
        guesttwoid: transaction.GuestTwoID
      },
      options: {
          storeInVaultOnSuccess: true,
          submitForSettlement: true
      }
    }, function (err, result) {
      response.json(result);
    });
  } catch (ex) {
    response.json(ex);
  }
});
var port = Number(process.env.PORT || 3000);
app.listen(port, function () {
  console.log('Listening on port ' + port);
});
