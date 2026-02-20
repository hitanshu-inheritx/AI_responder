import { useState, useEffect } from "react";
import axios from "axios";
import { FiSend, FiAlertCircle, FiCopy, FiCheck } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      setError("OpenRouter API key is missing. Please check your .env file.");
      toast.error("OpenRouter API key missing");
    }
  }, []);

  const SYSTEM_PROMPT = `MASTER SYSTEM PROMPT
 
You are a calm, wise life guidance assistant inspired primarily by the Bhagavad Gita. 
Your purpose is to provide practical life guidance for modern problems.
 
You must:
- Use teachings from the Bhagavad Gita as the primary wisdom source.
- Optionally support answers with short examples from Ramayan, Mahabharata, or Indian philosophical symbolism when relevant.
- Explain everything in simple, modern language.
- Avoid heavy Sanskrit, long shlokas, or religious preaching.
- Focus on emotional clarity, balanced thinking, and practical action.
- Never judge the user.
- Never shame, blame, or moralize.
 
Your tone must be:
Calm, compassionate, neutral, wise, steady.
 
Structure every response as:
 
1. Gentle acknowledgement of the user's situation.
2. A relevant teaching inspired by the Bhagavad Gita (explained simply).
3. A short supporting example (optional).
4. Practical steps the user can apply immediately (2–4 bullet points).
5. A calm closing reflection sentence.
 
Keep responses between 500–700 words unless explicitly asked for deep analysis.
 
Always use clear section headings:
 
Do not provide:
- Medical diagnosis
- Legal advice
- Financial investment advice
- Political persuasion
- Religious conversion messaging
 
If the user expresses severe distress, self-harm, or mental crisis:
- Respond with empathy
- Encourage seeking professional help
- Avoid philosophical lectures
 
Remain supportive and grounded.
 
- You Are Not Alone
- Gita Insight
- A Story to Reflect On (if used)
- What You Can Do Today
- Final Thought
 
Keep paragraphs short.
Use bullet points for practical steps.
Avoid religious preaching tone.
Avoid Sanskrit quotations unless very short.
 
Keep total response under 600 tokens.
Limit story examples to 3–5 sentences.
Do not include long shloka translations.
Focus on clarity over length.
Avoid repetition.`;

  const formatResponse = (text) => {
    // Remove bold formatting
    let formatted = text.replace(/\*\*/g, "");
    
    // Convert ### headers to styled format
    formatted = formatted.replace(/^###\s+(.+)$/gm, "─ $1 ─");
    
    return formatted;
  };

  const generateResponse = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setResponse("");
    setError("");
    setCopied(false);

    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "deepseek/deepseek-v3.2",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            { role: "user", content: input },
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
        },
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Gita Life Guidance",
          },
        },
      );

      const fullResponse = res.data.choices[0].message.content;
      setResponse(fullResponse);
      toast.success("Guidance received");
      
      // Log usage info
      if (res.data.usage) {
        console.log("Tokens used:", res.data.usage);
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
      console.error("API Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateResponse();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (response) setResponse("");
    if (error) setError("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatResponse(response));
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-8">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border border-orange-900/20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-orange-400">
            🕉️ Gita Life Guidance
          </h1>
          <p className="text-slate-400 text-sm">
            Wisdom from the Bhagavad Gita for modern life
          </p>
        </div>

        <textarea
          autoFocus
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Share what's on your mind... (Press Enter to send)"
          className="w-full resize-none rounded-xl bg-slate-800 text-white placeholder-slate-500 p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-slate-700"
        />

        <button
          onClick={generateResponse}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl transition font-medium"
        >
          {loading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin" />
              Seeking guidance…
            </>
          ) : (
            <>
              <FiSend />
              Receive Guidance
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-2 text-red-400 bg-red-950/40 p-4 rounded-xl text-sm border border-red-900/30">
            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 border border-orange-900/20 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-4/5"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-slate-700 rounded w-full"></div>
              <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-orange-400 mt-4">
              <AiOutlineLoading3Quarters className="animate-spin" />
              <span className="text-sm">Processing your question...</span>
            </div>
          </div>
        )}

        {response && !loading && (
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4 border border-orange-900/20">
            <div className="flex items-center justify-between">
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-wide">
                ✨ Guidance
              </span>

              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-orange-400 transition flex items-center gap-1 text-sm"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <FiCheck /> Copied
                  </>
                ) : (
                  <>
                    <FiCopy /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-invert prose-orange max-w-none">
              <div className="text-slate-200 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
                {formatResponse(response)}
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-slate-500 text-xs pt-4 border-t border-slate-800">
          <p>
            Guidance inspired by timeless wisdom • Not a substitute for
            professional help
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
