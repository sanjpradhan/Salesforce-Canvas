var express = require('express');
var bodyParser = require('body-parser');
var signedSignature = require('salesforce-signed-request');
var request = require('request');
    
var CONSUMER_SECRET = process.env.CONSUMER_SECRET;

var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser()); // pull information from html in POST
app.use(express.static(__dirname + '/public'));

app.post('/securedsignedrequest', function(req, res) {
//This method is the POST request endpoint made from the Salesforce Connected App.   
    var signedRequest = signedSignature(req.body.signed_request, CONSUMER_SECRET);
    var context = signedRequest.context;
    var authToken = signedRequest.client.oauthToken;
    var instanceUrl = signedRequest.client.instanceUrl;

    var query = "SELECT Id, FirstName, LastName, Phone, Email, Name, AccountId FROM Contact WHERE Id = '" + context.environment.record.Id + "'"

    var sfContactDetails = {
            url: instanceUrl + '/services/data/v45.0/query?q=' + query,
            headers: {
                'Authorization': 'OAuth ' + authToken
            }
        };
        //console.log(context);
        console.log(sfContactDetails);

    request(sfContactDetails, function(err, response, body) {
        //Make REST API Request and log out the Contact Record
        var contact = JSON.parse(body).records[0];
        console.log(contact);
        res.render('index', {context: context, contact: contact});
    });

});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});