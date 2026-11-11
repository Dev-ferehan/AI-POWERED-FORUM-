import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AskQuestion.module.css";
import { Link } from "react-router-dom";
import { Bold, Italic, Code, Link as LinkIcon, Sparkles } from "lucide-react";
import {questionService} from '../../services/question/question.service.js'
export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftMessage, setDraftMessage] = useState([]);
  const [draftSuccess, setDraftSuccess] = useState('');
  const [draftError, setDraftError] = useState('');
  const [error, setError] = useState("");
  const navigate = useNavigate();
const SubmitAiSuggestions=async()=>{
  setDraftLoading(true);
  setDraftError("");
  setDraftMessage("");
  try{

    const result= await questionService.QuestionDraftCoach({title,content});
    setDraftSuccess(result?.message || "Draft suggestions generated successfully!")
    setDraftMessage(result?.data?.tips || ['No suggestions available. Please ensure your question has enough context and details.']);
    setDraftError("")
}catch(err){
    setDraftError(err.message || "Failed to generate draft suggestions. Please try again.");
    setDraftSuccess("")
} finally {
    setDraftLoading(false);
  }
}
  const handleSubmit = async(e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try{
        const result= await questionService.createQuestion({title,content});
        setMessage(result?.message || "Question posted successfully!")
        setTimeout(() => {
            navigate('/dashboard'); 
          }, 1500);
    }catch(err){
        setError(err.message || "Failed to post question. Please try again.");
    }finally {
        setLoading(false);
      }
   
  };

  return (
    <div className={`container my-4 ${styles.container}`}>
      {/* Header */}
      <div className={styles.headerSection}>
        
        <h3 className={styles.publishTitle}>Publish to the forum</h3>
        <p className={styles.publishSubtitle}>
          Public threads help the whole cohort. Write as if a classmate will debug your issue tomorrow. They only know what you put on the page.
        </p>
      </div>

      {/* Guidelines Card */}
      <div className={styles.guidelineCard}>
        <h5 className={styles.guidelineTitle}>Write questions people can answer in one pass</h5>
        <p className={styles.guidelineText}>
          Mentors volunteer their time. Give them runnable context, expected vs actual behavior, and a tight scope so they can reproduce the issue without guessing your setup.
        </p>

        <h6 className={styles.listTitle}>Checklist before you post</h6>
        <ul className={styles.guidelineList}>
          <li><strong>Title as a headline</strong> that states the symptom and tech stack (e.g., "React 19: state resets after navigation").</li>
          <li><strong>Repro steps</strong> numbered, with environment (OS, browser, Node version) when it matters.</li>
          <li><strong>Minimal code</strong> in fenced markdown blocks; trim unrelated lines so readers scan faster.</li>
          <li><strong>Exact errors</strong> copied verbatim, including stack trace snippets when debugging backend routes.</li>
        </ul>

        <h6 className={styles.listTitle} style={{ marginTop: "12px" }}>Validation rules (enforced by the form)</h6>
        <ul className={styles.guidelineList}>
          <li><strong>Title length:</strong> Must be between 5 and 255 characters.</li>
          <li><strong>Body length:</strong> Must contain a minimum of 10 characters detailing your problem.</li>
          <li><strong>Single topic:</strong> Split unrelated bugs into separate threads so search and embeddings stay precise.</li>
        </ul>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className={styles.form}>

      {/* Success Alert */}
        {message && (
          <div className={`alert alert-success py-2 mb-3 `} role="alert">
            {message}
          </div>
        )}

{/* Error Alert */}
        {error && (
          <div className="alert alert-danger py-2 mb-3" role="alert">
            {error}
          </div>
        )}
        {/* Title Input */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <span className={styles.subLabel}>Be specific and imagine you're asking a question to another person.</span>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. How do I handle state management using Context API in React?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content Textarea */}
        <div className={styles.formGroup}>
          <label className={styles.label}>What are the details of your problem?</label>
          <span className={styles.subLabel}>Introduce the problem and expand on what you put in the title. Minimum 10 characters.</span>
          
          {/* Mock Formatting Toolbar */}
          <div className={styles.editorToolbar}>
            <button type="button" className={styles.toolbarBtn}><Bold size={16} /></button>
            <button type="button" className={styles.toolbarBtn}><Italic size={16} /></button>
            <button type="button" className={styles.toolbarBtn}><Code size={16} /></button>
            <button type="button" className={styles.toolbarBtn}><LinkIcon size={16} /></button>
          </div>

          <textarea
            className={`${styles.textarea} ${styles.textareaWithToolbar}`}
            placeholder="Include all the information someone would need to answer your question... You can use Markdown to format your code!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <div className={styles.charCount}>{content.length} characters</div>
        </div>
    

        {/* AI suggestions note */}
        <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "0.85rem" }}>
          <span> <Link className={styles.suggestBtn} onClick={()=>SubmitAiSuggestions()}>
          <Sparkles size={16} className="text-warning   " />
{
draftLoading ? "Generating..." : " AI suggestions."}

         </Link> Suggestions only. You still choose what to post.</span>
        </div>
        {
          draftError && (
            <div className={`alert  py-2 mt-2 ${styles.draftError}`} role="alert">
              {draftError}
            </div>

          )
        }
        {
          draftSuccess && (
            <div className={`alert  py-2 mt-2 ${styles.draftSuccess}`} role="alert">
              {draftSuccess}
            </div>
          )
        }
        {
          draftMessage?.length > 0 && (
            <div className={`alert alert-info py-2 mt-2 ${styles.tip}` } role="alert">
              <ul className="mb-0">
                {draftMessage?.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )
        }

        {/* Footer Actions */}
        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn}>
          {loading ? "Posting..." : "Post Question "}
          </button>
        </div>
      </form>
    </div>
  );
}