import express from 'express';
import crypto from 'crypto';
import 'dotenv/config';
import cors from 'cors';
const app = express();
const port = 3000;
import {getGenerateCodeVerifier,getCodeChallenge} from './auth.js';
import { URLSearchParams } from 'url';
import { error, log } from 'console';
const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;
const sessions = new Map();
const loginStates = new Map();
app.use(cors());
app.use(express.json());

/*app.get("/", (req, res) => {
    res.send(`Generated code verifier: ${codeVerifier}, Generated code challenge: ${codeChallenge}`);
});*/

app.get("/auth/url", async (req,res)=>{
const state = crypto.randomBytes(16).toString("hex");
const codeVerifier = getGenerateCodeVerifier();
const codeChallenge = codeVerifier
//savedCodeVerifier = codeVerifier;

loginStates.set(state, codeVerifier)
let url = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientid}&state=${state}&redirect_uri=http://localhost:4200/mal-callback&code_challenge=${codeChallenge}&code_challenge_method=plain`
res.redirect(url);
});

app.post("/auth/callback", async (req,res) =>{
const { code, state: returnedState } =  req.body;
const codeVerifier = loginStates.get(returnedState);
if (!codeVerifier) {
    return res.status(400).send("Invalid state");
}
loginStates.delete(returnedState);

const params = new URLSearchParams({
    client_id: clientid,
    client_secret: clientsecret,
    code: code,
    code_verifier: codeVerifier,
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
    if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: "Token request failed", details: errorData });
    }
    const sessionId = crypto.randomUUID();
    const data = await response.json();
    sessions.set(sessionId, data);
    res.json({sessionId});
    console.log(sessionId);
} catch (error) {
    res.status(500).json({ error: "Failed to fetch token" });
}
});

app.get("/myanimelist/list", async (req,res) =>{
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
        return res.status(401).json({ error: "Session id missing" });
    }
    const session = sessions.get(sessionId);
    if (!session){
        return res.status(401).json({error: "Invalid or expired session"})
    }
    const accessToken = session.access_token;
    try{
        const response = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status&offset=0&limit=1000", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime list" });
    }
});

app.post("/myanimelist/info", async (req,res) =>{
    const { id } = req.body;
    const sessionId = req.headers['x-session-id'];

    if (!sessionId) {
        return res.status(401).json({ error: "Session id missing" });
    }
    
    if (!id){
        return res.status(400).json({error: "Anime id missing"});
    }
    const session = sessions.get(sessionId);
    if (!session){
        return res.status(401).json({error: "Invalid or expired session"})
    }
    const accessToken = session.access_token
    try{
        const response = await fetch(`https://api.myanimelist.net/v2/anime/${id}?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,rank,popularity,nsfw,media_type,genres,num_episodes,start_season,broadcast,source,rating,pictures,background,recommendations,studios,statistics`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch anime list" });
    }
})
app.post("/myanimelist/update-status", async (req,res) =>{
    const { id } = req.body;
    const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(401).json({ error: "Session id missing" });
    }
    
    if (!id){
        return res.status(400).json({error: "Anime id missing"});
    }
    const session = sessions.get(sessionId);
    if (!session){
        return res.status(401).json({error: "Invalid or expired session"})
    }
    const accessToken = session.access_token;
    try{
        const response = await fetch(`https://api.myanimelist.net/v2/anime/${id}/my_list_status`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                status: "plan_to_watch"
            })
        });
        const data = await response.json();
        res.json(data);
    }
    catch (error){
        res.status(500).json({ error: "Failed to update anime status" });
    }
});

app.delete("/myanimelist/remove/:id", async (req,res) =>{
    const { id } = req.params;
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
        return res.status(401).json("Session id missing");
    }
     if (!id){
        return res.status(400).json({error: "Anime id missing"});
    }
    const session = sessions.get(sessionId);
    if (!session){
        return res.status(401).json({error: "Invalid or expired session"})
    }
    const accessToken = session.access_token;
    
    try{
        const response = await fetch(`https://api.myanimelist.net/v2/anime/${id}/my_list_status`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });
            const data = await response.json();
            res.status(response.status).json({ details: data });
    } catch (error){
        res.status(500).json({ error: "Failed to remove anime" });
    }
})

app.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
})

