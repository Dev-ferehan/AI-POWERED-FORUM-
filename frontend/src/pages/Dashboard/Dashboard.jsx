import "react-bootstrap";
import { Edit3, Layers, BookOpen } from "lucide-react";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../contexts/AuthContext";
import QuestionList from "../../components/QuestionList/QuestionList.jsx";
import { useEffect, useState } from "react";
import { questionService } from "../../services/question/question.service.js";
import { useLocation } from 'react-router-dom';
export default function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  useEffect(() => {
    questionService.getQuestions().then((data) => {
      setQuestions(data || []);
    });
  }, []);



  useEffect(() => {
    const fetchFilteredQuestions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        const semantic = params.get('semantic');

        const queryParams = {};
        if (q) queryParams.q = q;
        if (semantic) queryParams.semantic = semantic;
        const data = await questionService.getQuestions(queryParams);
    
        setQuestions(data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredQuestions();
  }, [location.search]); 



  const questionLength = questions?.length;
  const totalReplies = questions?.reduce((acc, q) => acc + (q.answerCount || 0), 0);
  const unansweredCount = questions?.filter(q => (q.answerCount || 0) === 0).length;
  const yoursCount = questions?.filter(
    (q) => user?.id && q.
      author?.id === user.id
  ).length;
  const firstName = user?.firstName?.trim();
  const welcomeLine = firstName ? `Good to see you, ${firstName}.` : "Welcome to the forum.";
  return (
    <>
      <div className={`container my-4 ${styles.forumContainer}`}>        
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h2 className={styles.welcomeTitle}>{welcomeLine}</h2>
          <p className={styles.description}>
            Start a topic, revisit your own threads, or skim the live feed.
            Search above works from any page <br />
            once you are back on Home.
          </p>
        </div>
        {/* Cards Row */}
        <div className={`row p-2`}>
          {/* Card 1: New question */}
          <div className={`col-md-4 ${styles.card}`}>
            <div className={styles.actionCard}>
              <div className={styles.iconBox}>
                <Edit3 size={22} className={styles.orangeIcon} />
              </div>
              <div>
                <h5 className={styles.cardTitle}>New question</h5>
                <p className={styles.cardText}>
                  Share context, errors, and what you already tried
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Your topics */}
          <div className={`col-md-4 ${styles.card}`}>
            <div className={styles.actionCard}>
              <div className={styles.iconBox}>
                <Layers size={22} className={styles.orangeIcon} />
              </div>
              <div>
                <h5 className={styles.cardTitle}>Your topics</h5>
                <p className={styles.cardText}>
                  Filtered list of threads you authored
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Knowledge base */}
          <div className={`col-md-4 ${styles.card}`}>
            <div className={styles.actionCard}>
              <div className={styles.iconBox}>
                <BookOpen size={22} className={styles.orangeIcon} />
              </div>
              <div>
                <h5 className={styles.cardTitle}>Knowledge base</h5>
                <p className={styles.cardText}>
                  Course library, uploads, and retrieval-backed context for
                  threads
                </p>
              </div>
            </div>
          </div>
        </div>
        <hr />

        <p className="p-2">
          Course library, uploads, and retrieval-backed context for threads
        </p>

        {
          loading ? (
            <div className="d-flex justify-content-center align-items-center py-5 gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="fw-medium">Loading your topics...</span>
          </div>
          ):(
            <div className={`row ${styles.row}`}>
    
              {/* Questions Count */}
              <div className={`col-md-3 ${styles.card}`}>
                <div className={styles.actionCard}>
                  <div>
                    <h5 className={styles.cardTitle}>Questions</h5>
                    <p className={styles.cardText}>{questionLength}</p>
                  </div>
                </div>
              </div>
    
              {/* Replies Count */}
              <div className={`col-md-3 ${styles.card}`}>
                <div className={styles.actionCard}>
                  <div>
                    <h5 className={styles.cardTitle}>Replies</h5>
                    <p className={styles.cardText}>{totalReplies}</p>
                  </div>
                </div>
              </div>
    
              {/* Unanswered Count */}
              <div className={`col-md-3 ${styles.card}`}>
                <div className={styles.actionCard}>
                  <div>
                    <h5 className={styles.cardTitle}>Unanswered</h5>
                    <p className={styles.cardText}>{unansweredCount}</p>
                  </div>
                </div>
              </div>
    
              {/* Yours Count */}
              <div className={`col-md-3 ${styles.card}`}>
                <div className={styles.actionCard}>
                  <div>
                    <h5 className={styles.cardTitle}>Yours</h5>
                    <p className={styles.cardText}>{yoursCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

   
      </div>

      <QuestionList questions={questions} loading={loading} />
    </>
  );
}