import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Pointer } from 'lucide-react';
import styles from './UserTopics.module.css';
import { questionService } from '../../services/question/question.service.js';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
function UserTopics() {
  const navigate=useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    questionService.getQuestions().then((data) => {
      const userQuestions = (data || []).filter(
        (q) => q.isYours || (user?.id && q.author?.id === user.id)
      );
      setQuestions(userQuestions);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  const getInitials = (author) => {
    if (!author) return 'U';
    const first = author.firstName ? author.firstName[0] : '';
    const last = author.lastName ? author.lastName[0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container my-4">
      {/* Top Workspace Header Card */}
      <div className={`card p-4 mb-4 border-0 shadow-sm ${styles.workspaceCard}`}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <span className={styles.workspaceTag}>YOUR WORKSPACE</span>
            <h2 className={styles.workspaceTitle}>Your topics</h2>
            <p className={styles.workspaceSubtitle}>
              Only questions created. Open one to read answers or add follow-ups. Rows use the same left accent as your threads on Home.
            </p>
          </div>
          <Link  to={'/questions/ask'} className={` btn ${styles.newQuestionBtn} d-flex align-items-center `}>
            <Plus size={13} /> New question
          </Link>
        </div>
      </div>

      {/* Loading & Content Section */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5 gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="fw-medium">Loading your topics...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-5 text-center text-muted border-0 shadow-sm">
          <p className="mb-0">You haven't posted any topics yet.</p>
        </div>
      ) : (
        <div className={styles.threadList}>
          {questions.map((question) => {
            const authorName = question.author 
              ? `${question.author.firstName || ''} ${question.author.lastName || ''}`.trim() 
              : 'You';
            
            const initials = getInitials(question.author);

            return (
              <div 
                key={question.id} 
                className={`card border-0 shadow-sm p-3 mb-3 ${styles.threadItem} ${styles.yoursAccent}`}
              >
                <div className={`d-flex align-items-start gap-3 ${styles.myQuestion}`}   onClick={()=>navigate(`/question/${question.questionHash}`)} >
                  {/* Avatar */}
                  <div 
                    className={styles.avatar} 
                    style={{ backgroundColor: question.avatarBg || '#5ff9e6' }}
                  >
                    {initials}
                  </div>

                  {/* Question Content */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h5 className={styles.threadHeading}>{question.title}</h5>
                      <span className={styles.yoursBadge}>YOURS</span>
                    </div>

                    <p className={styles.threadSnippet}>{question.content}</p>

                    {/* Footer Info */}
                    <div className={styles.threadFooter}>
                      <span className="d-flex align-items-center gap-1">
                        <MessageSquare size={14} /> {question.answerCount || 0} replies
                      </span>
                      <span>•</span>
                      <span>{formatDate(question.createdAt)} by {authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserTopics;