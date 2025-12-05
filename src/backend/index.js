import express from 'express';
import crypto from 'crypto';
import 'dotenv/config';
import cors from 'cors';
const app = express();
const port = 3000;
const state = crypto.randomBytes(16).toString("hex");
import {getGenerateCodeVerifier,getCodeChallenge} from './auth.js';
import { URLSearchParams } from 'url';
const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;
let savedCodeVerifier = ""
let url = "";
app.use(cors());
app.use(express.json());

/*app.get("/", (req, res) => {
    res.send(`Generated code verifier: ${codeVerifier}, Generated code challenge: ${codeChallenge}`);
});*/

app.get("/auth/url", async (req,res)=>{
const codeVerifier = getGenerateCodeVerifier();
const codeChallenge = codeVerifier
savedCodeVerifier = codeVerifier;

url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientid}&state=${state}&redirect_uri=http://localhost:4200/mal-callback&code_challenge=${codeChallenge}&code_challenge_method=plain`
res.redirect(url);
});

app.post("/auth/callback", async (req,res) =>{
const { code, state: returnedState } =  req.body;
if ( returnedState !== state ) {
    return res.status(400).send("Invalid state");
}
const params = new URLSearchParams({
    client_id: clientid,
    client_secret: clientsecret,
    code: code,
    code_verifier: savedCodeVerifier,
    grant_type: "authorization_code",
    redirect_uri: "http://localhost:4200/mal-callback",
   
});
try {
    const response = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params
    });
    const data = await response.json();
    res.json(data);
} catch (error) {
    res.status(500).json({ error: "Failed to fetch token" });
}
});

app.get("/myanimelist/list", async (req,res) =>{
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
        return res.status(401).json({ error: "Access token missing" });
    }
    try{
        const response = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?offset=0&limit=500", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        res.json(data);
        console.log(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime list" });
    }
});

app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
})

