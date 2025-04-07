const express = require('express');
const app=express();
require('dotenv').config();
const StatusCodes=require('http-status-codes');
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function summarize(data) {
  const instructions=`Summarize the following content "${data}" And just generate plain text of only alphabets ans spaces, Caps allowd, puncatations allowed., limit to high level overview, like 150 words would be enough`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: instructions,
  });
  return response.text;
}


app.use(express.json());
app.post('/api',async (req,res)=>{
  const summary=await summarize(req.body.data);
  res.status(StatusCodes.ACCEPTED).json({success:true, data:summary})
})

app.listen(5000, ()=>{
  console.log('listening on port 5000');
})
//