const express = require("express");
const https = require('https');
const fs = require('fs');
const app = express();
const mercadopago = require("mercadopago");
//APP_USR-4785898098059790-042020-f88a2d93925ea48b011958f79bd02168-548158864
//TEST-6255502893512254-070917-2178f482009e8dc6f819b9e929692a08-787997534
// Add Your credentials
mercadopago.configure({
	access_token: 'APP_USR-7176729971160310-051313-de5d19de92d7df4a25ad7a4380d1a7c4-758771883'
  });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("client/"));

const options = {
	key: fs.readFileSync('localhost.key', 'utf8'),
   cert: fs.readFileSync('localhost.crt', 'utf8')
 };

app.get("/", function (req, res) {
  res.status(200).sendFile("/client/index.html", { root: __dirname });
  //res.sendFile('index.html');
  //res.sendFile('/client/index.html', { root: __dirname });
}); 

app.post("/create_preference", (req, res) => {
	let preference = {
		items: [{
			title: req.body.description,
			unit_price: Number(req.body.price),
			quantity: Number(req.body.quantity),
		}],
		back_urls: {
			"success": "https://localhost:8080/feedback",
			"failure": "https://localhost:8080/feedback",
			"pending": "https://localhost:8080/feedback"
		},
		auto_return: 'approved'
	};

	mercadopago.preferences.create(preference)
		.then(function (response) {
			console.log("--->Response Api");
			console.log(response);
			global.id = response.body.id;
			console.log("el preference es:" +response.body.id);
			res.json({id :response.body.id})
		}).catch(function (error) {
			console.log(error);
		});
});

app.get('/feedback', function(request, response) {
	 response.json({
		Payment: request.query.payment_id,
		Status: request.query.status,
		MerchantOrder: request.query.merchant_order_id
	})
});


https.createServer(options, app).listen(8080, () => {
	console.log("The server is now running on Port 8080");
})