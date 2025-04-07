const express = require('express');
const app=express();
require('dotenv').config();
const StatusCodes=require('http-status-codes');
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const cors = require('cors');
app.use(cors());


async function summarize(data) {
  const instructions=`Summarize the following content "${data}" And just generate plain text of only alphabets and spaces, propper caps, puncatations allowed., limit to high level overview, like 150 words would be enough`;
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: instructions,
  });
  return response.text;
}


app.use(express.json());

app.get("/", (req, res) => res.send("Express on Vercel"));
app.post('/api',async (req,res)=>{
  const summary=await summarize(req.body.data);
  res.status(StatusCodes.ACCEPTED).json([{success:true, output:summary}])
})

app.listen(3000, ()=>{
  console.log('listening on port 3000');
})
//

module.exports=app;