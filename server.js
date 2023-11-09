const fs = require("fs");
const express = require("express");
const vhost = require("vhost");
const vhttps = require("vhttps");
const app = express();

// domain engine http or https setup
const appList = [
  {
    domain: "exam.transbridge.io",
    cred: {
      key: fs.readFileSync("./ssl/transbridge.key"),
      cert: fs.readFileSync("./ssl/transbridge.crt")
    },
    app: require("./app"),
  },
  {
		domain: "127.0.0.1",
		app: require("./localhost"),
	},
];

const server = vhttps.init();
appList.forEach((val) => {
	if (val.cred) {
		app.use(
			vhost(val.domain, (req, res) => {
				res.writeHead(301, {
					Location: "https://" + req.headers["host"] + req.url,
				});
				res.end();
			})
		);
		server.use(val.domain, val.cred, val.app);
	} else {
		app.use(vhost(val.domain, val.app));
	}
});

app.listen(80, () => {
	console.log("80 server start");
});

server.listen(3000, () => {
  console.log("3000 server start");
});
