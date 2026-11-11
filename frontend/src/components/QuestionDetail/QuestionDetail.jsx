import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./QuestionDetail.module.css";
import { questionService } from "../../services/question/question.service.js";
import { answerService } from "../../services/answers/answer.service.js";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";

export default function QuestionDetail() {
  const { questionHash } = useParams();
  const [answerContent, setAnswerContent] = useState("");
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [answerLevel, setAnswerLevel] = useState("");
  const [answerNote, setAnswerNote] = useState("");
  const [checkingFit, setCheckingFit] = useState(false);

  const [questions, setQuestion] = useState({});

  useEffect(() => {
    questionService.getRelatedQuestion(questionHash).then((data) => {
      setRelatedQuestions(data.data || []);
    });
  }, [questionHash]);


  const fetchQuestionDetails = () => {
    questionService
      .getSingleQuestion(questionHash)
      .then((data) => {
        const qData = data.question || data;
        setQuestion(qData);
        if (qData?.answers) {
          setAnswers(qData.answers);
        }
      })
      .catch((err) => {
        console.log("Failed to load question details.", err);
      });
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [questionHash]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    
    let questionId =
      questions?.id ||
      questions?.question?.id ||
      questions?.questionHash ||
      questionHash;

    try {
      const response = await answerService.createAnswer(
        questionId,
        answerContent,
      );
      setMessage(response.message || "Answer posted successfully!");
   
      setAnswerContent("");

      fetchQuestionDetails();


    } catch (err) {

      console.log(err.message || "Failed to post answer.");
    }finally {
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  const CheckDraftFit = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) {
      alert("Please write some text to check draft fit.");
      return;
    }

    setCheckingFit(true);
    setAnswerLevel("");
    setAnswerNote("");

    try {
      const response = await questionService.CheckDraftFit(
        questionHash,
        answerContent,
      );

      const resultData = response.data || response;

      setAnswerLevel(resultData.level);
      setAnswerNote(resultData.note);
    } catch (err) {
      console.log(err.message || "Failed to check draft fit.");
    } finally {
      setCheckingFit(false);
    }
  };

  return (
    <div className={`container my-4 ${styles.container}`}>
      <Link to="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <div className={styles.mainLayout}>
        <div className={styles.leftContent}>
          <div className={styles.questionCard}>
            <div className={styles.authorHeader}>
              <div className={styles.avatar}>
                {questions?.author?.firstName ? questions.author.firstName.charAt(0) : "AK"}
              </div>
              <div>
                <h6 className={styles.authorName}>
                  {questions?.author?.firstName} {questions?.author?.lastName}
                </h6>
                <p className={styles.postDate}>{questions?.createdAt}</p>
              </div>
            </div>

            <h2 className={styles.questionTitle}>{questions?.title}</h2>

            <p className={styles.questionBody}>
              <strong>What I'm trying to do</strong>
              <br />
              {questions?.content}
            </p>

            <div className={styles.actionButtons}>
              <button className={styles.actionBtn}>
                <Share2 size={16} /> Share
              </button>
              <button className={styles.actionBtn}>
                <MessageSquare size={16} />{" "}
                {answers.length || questions?.answers?.length || 0} Answer(s)
              </button>
            </div>
          </div>

          <h4 className={styles.sectionTitle}>
            Community Answers ({answers.length || questions?.answers?.length || 0})
          </h4>

       
          {(answers.length > 0 ? answers : questions?.answers)?.map((ans, idx) => (
            <div key={ans.id || idx} className={styles.answerCard}>
              <div className={styles.authorHeader}>
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: "#fd7e14" }}
                >
                  {ans.author?.firstName ? ans.author.firstName.charAt(0) : "U"}
                </div>
                <div>
                  <h6 className={styles.authorName}>
                    {ans.author?.firstName} {ans.author?.lastName}
                  </h6>
                  <p className={styles.postDate}>{ans.createdAt}</p>
                </div>
              </div>
              <p className={styles.questionBody}>{ans.content}</p>
            </div>
          ))}

          <h4 className={styles.sectionTitle}>Contribute an answer</h4>

          {message && <div className="alert alert-success py-2">{message}</div>}

          <form onSubmit={handlePostAnswer}>
            <div className={styles.formGroup}>
              <div className={styles.editorToolbar}>
                <button type="button" className={styles.toolbarBtn}>
                  <Bold size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn}>
                  <Italic size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn}>
                  <Code size={16} />
                </button>
                <button type="button" className={styles.toolbarBtn}>
                  <LinkIcon size={16} />
                </button>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="I would start by moving the draft into route state or local storage..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                <Link
                  to="#"
                  onClick={CheckDraftFit}
                  className={styles.draftBtn}
                >
                  <Sparkles size={14} className="text-warning me-1" />
                  {checkingFit ? "Checking fit..." : "Check draft fit."}
                </Link>{" "}
                Relevance only.
              </span>

              <button type="submit" className={styles.submitBtn}>
                Post Your Answer
              </button>
            </div>
          </form>

          {answerLevel && (
            <div>
              <strong>Draft Level:</strong>
              <span className={`alert mt-2 p-2 ${styles[answerLevel] || ""}`}>
                {answerLevel}
              </span>
            </div>
          )}
          {answerNote && (
            <div className={`alert mt-2 p-2 ${styles.note}`}>
              <strong>AI Suggestion Note:</strong> {answerNote}
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.relatedCard}>
            <h5 className={styles.relatedTitle}>Related Questions</h5>
            {relatedQuestions.map((item) => (
              <div key={item.id} className={styles.relatedItem}>
                <Link
                  to={`/question/${item.questionHash}`}
                  className={styles.relatedItemTitle}
                >
                  {item.title}
                </Link>
                <span className={styles.relatedItemMeta}>{item.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}