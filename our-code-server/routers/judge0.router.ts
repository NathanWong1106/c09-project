import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware";

const judge0Router = Router();

judge0Router.post("/:fileId/submit", isAuthenticated, async (req, res) => {
  const fileId = req.params.fileId;
  const code = req.body.code;
  const languageId = req.body.languageId;
  const stdin = req.body.stdin;

  if (req.io.hasSubmission(fileId)) {
    return res.status(409).json({ error: "Submission already exists" });
  }
  
  // Submit code to Judge0
  const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false", {
    method: 'POST',
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
        stdin: stdin,
        callback_url: `https://api.ourcode.tech/api/judge0/${fileId}/callback`
      }),
      headers: {
        'x-rapidapi-key': process.env.JUDGE0_AUTH_TOKEN!,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      }
    }
  )
  if (!response.ok) {
    return res.status(response.status).json({ error: "Failed to submit code" });
  }
    
  // Check and create mapping
  const data: any = await response.json();
  if (req.io.setSubmission(fileId, data.token)) {
    return res.status(202).json({ message: "Code submitted" });
  }
  return res.status(409).json({ error: "Submission already exists" });
});

judge0Router.put("/:fileId/callback", async (req, res) => {
  const fileId = req.params.fileId;
  const { token } = req.body;

  const response = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=stdout%2Cstdin%2Cstderr%2Cexit_code%2Ctoken`, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_AUTH_TOKEN!,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  });

  const { stdout, stdin, stderr, exit_code } = await response.json() as any;
  if (!response.ok) {
    req.io.broadcastSubmission(fileId, token, stdin, stdout, stderr, exit_code, false);
    return res.status(response.status).json({ error: "Failed to get submission" });
  }
  req.io.broadcastSubmission(fileId, token, stdin, stdout, stderr, exit_code, true);
  
  return res.status(200).json({ message: "Submission finished" });
});

export default judge0Router;