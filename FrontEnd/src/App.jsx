import { useState, useEffect } from "react";
import axios from "axios";
import { FiSend, FiAlertCircle, FiCopy, FiCheck } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      setError("Groq API key is missing. Please check your .env file.");
      toast.error("Groq API key missing");
    }
  }, []);

  const formatResponse = (text) => {
    return text
      .replace(/\*\*/g, "")
      .replace(/:\s*/g, ":\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const generateResponse = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    setResponse("");
    setError("");
    setCopied(false);

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Respond in a clear, structured, point-wise format. Avoid long paragraphs.",
            },
            { role: "user", content: input },
          ],
          max_tokens: 400,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      setResponse(res.data.choices[0].message.content);
      toast.success("Response generated");
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
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
      await navigator.clipboard.writeText(formatResponse(response).join("\n"));
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-xl bg-slate-900 rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-white text-center">
          Groq AI Chat Responder
        </h1>

        <textarea
        autoFocus
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Ask something..."
          className="w-full resize-none rounded-xl bg-slate-800 text-white placeholder-slate-400 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={generateResponse}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white py-3 rounded-xl transition"
        >
          {loading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FiSend />
              Generate
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start gap-2 text-red-400 bg-red-950/40 p-3 rounded-xl text-sm">
            <FiAlertCircle className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {response && (
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs uppercase tracking-wide">
                Response
              </span>

              <button
                onClick={copyToClipboard}
                className="text-slate-400 hover:text-white transition"
                title="Copy"
              >
                {copied ? <FiCheck /> : <FiCopy />}
              </button>
            </div>

            <ul className="list-disc list-inside space-y-1 text-slate-200 text-sm leading-relaxed">
              {formatResponse(response).map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;




// import { useState, useEffect } from "react";
// import { FiRefreshCw, FiCopy, FiCheck } from "react-icons/fi";
// import toast, { Toaster } from "react-hot-toast";

// const App = () => {
//   const [color, setColor] = useState("#FFFFFF");
//   const [copied, setCopied] = useState(false);

//   const generateRandomColor = () => {
//     const randomColor =
//       "#" +
//       Math.floor(Math.random() * 16777215)
//         .toString(16)
//         .padStart(6, "0");

//     setColor(randomColor);
//     setCopied(false);
//   };

//   // useEffect(() => {
//   //   generateRandomColor(); 
//   // }, []);

//   const copyColor = async () => {
//     await navigator.clipboard.writeText(color);
//     setCopied(true);
//     toast.success("Color copied!");
//     setTimeout(() => setCopied(false), 1500);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
//       <Toaster position="top-right" />

//       <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 shadow-lg space-y-4">
//         <h1 className="text-white text-xl font-semibold text-center">
//           🎨 Random Color Generator
//         </h1>

//         {/* Color Preview */}
//         <div
//           className="h-40 rounded-xl border border-slate-700"
//           style={{ backgroundColor: color }}
//         />

//         {/* Color Code */}
//         <div
//           onClick={copyColor}
//           className="flex items-center justify-between bg-slate-800 p-3 rounded-xl cursor-pointer hover:bg-slate-700 transition"
//         >
//           <span className="text-white font-mono text-lg">{color}</span>
//           {copied ? (
//             <FiCheck className="text-green-400" />
//           ) : (
//             <FiCopy className="text-slate-400" />
//           )}
//         </div>

//         {/* Button */}
//         <button
//           onClick={generateRandomColor}
//           className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition"
//         >
//           <FiRefreshCw />
//           Generate Color
//         </button>
//       </div>
//     </div>
//   );
// };

// export default App;
